import { randomBytes } from 'node:crypto';
import type { Session, SessionStore } from './sessionStore';

const WEEK = 7 * 86400_000;
const IDLE = 86400_000;
const authPaths = new Set(['auth/login', 'auth/register', 'admin/login']);
const publicPaths = new Set([...authPaths, 'auth/forgot-password', 'auth/reset-password', 'auth/reset-password/validate']);
type Options = { store: SessionStore; apiURL: string; origin: string; secure: boolean; fetcher?: typeof fetch };

class PayloadTooLarge extends Error {}
async function readBody(request: Request): Promise<ArrayBuffer | undefined> {
  if (!request.body) return undefined;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 6 * 1024 * 1024) {
        await reader.cancel();
        throw new PayloadTooLarge();
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result.buffer;
}

export function createBff({ store, apiURL, origin, secure, fetcher = fetch }: Options) {
  const cookieName = secure ? '__Host-session' : 'mystudents-dev-session';
  const base = new URL('/api/v1/', apiURL);
  if (!['https:', 'http:'].includes(base.protocol)) throw new Error('Invalid API URL');
  function reply(data: unknown, status: number) {
    return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  }
  function cookie(response: Response, id: string, maxAge: number) {
    response.headers.append('Set-Cookie', `${cookieName}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`);
    return response;
  }
  async function locked<T>(id: string, work: (owner: string) => Promise<T>): Promise<T> {
    const owner = randomBytes(24).toString('hex');
    const deadline = Date.now() + 8000;
    while (!await store.lock(id, owner)) {
      if (Date.now() >= deadline) throw new Error('Session busy');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    try { return await work(owner); }
    finally { await store.unlock(id, owner); }
  }
  return async function handle(request: Request, path: string[]): Promise<Response> {
    // No arbitrary upstream URL, traversal, encoded separators or token endpoints.
    if (!path.length || path.some(part => !/^[a-zA-Z0-9_-]+$/.test(part))) return reply({ message: 'Not found' }, 404);
    // ASP.NET routes are case-insensitive: normalize before security checks.
    const route = path.join('/').toLowerCase();
    if (route === 'auth/refresh-token') return reply({ message: 'Not found' }, 404);
    const read = ['GET', 'HEAD'].includes(request.method);
    // Custom header forces cross-origin browsers to preflight; BFF grants no CORS.
    // Exact configured Origin additionally prevents login CSRF and sibling-domain CSRF.
    if (request.headers.get('X-Requested-With') !== 'MyStudents' ||
        (!read && request.headers.get('Origin') !== origin) ||
        (request.headers.has('Origin') && request.headers.get('Origin') !== origin) ||
        request.headers.get('Sec-Fetch-Site') === 'cross-site') return reply({ message: 'Forbidden' }, 403);
    if (publicPaths.has(route) && request.method !== 'POST') return reply({ message: 'Method not allowed' }, 405);
    const id = request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    const sessionId = id && /^[a-f0-9]{64}$/.test(id) ? id : null;
    try {
      const body = read ? undefined : await readBody(request);
      async function upstream(target: string, session?: Session, payload = body, method = request.method) {
        const headers = new Headers();
        const contentType = request.headers.get('Content-Type');
        if (contentType) headers.set('Content-Type', contentType);
        if (session) headers.set('Authorization', `Bearer ${session.token}`);
        return fetcher(new URL(target, base), {
          method, headers, body: payload, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
        });
      }
      function relay(response: Response) {
        const headers = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        for (const name of ['Content-Type', 'Content-Disposition']) {
          const value = response.headers.get(name);
          if (value) headers.set(name, value);
        }
        return new Response(response.body, { status: response.status, headers });
      }
      if (publicPaths.has(route)) {
        const response = await upstream(route);
        if (!response.ok) return relay(response);
        if (authPaths.has(route)) {
          const data = await response.json() as { token: string; refreshToken: string; username: string; userRole: string; userId: string };
          if (!data.token || !data.refreshToken) throw new Error('Invalid authentication response');
          const newId = randomBytes(32).toString('hex');
          await store.set(newId, { token: data.token, refreshToken: data.refreshToken, expiresAt: Date.now() + WEEK, idleUntil: Date.now() + IDLE });
          if (sessionId) await locked(sessionId, async () => store.delete(sessionId));
          // Explicit allowlist: credentials must never reach browser JSON.
          return cookie(reply({ username: data.username, userRole: data.userRole, userId: data.userId }, 200), newId, WEEK / 1000);
        }
        if (route === 'auth/reset-password') {
          if (sessionId) await locked(sessionId, async () => store.delete(sessionId));
          return cookie(relay(response), '', 0);
        }
        return relay(response);
      }
      if (!sessionId) return route === 'auth/logout' ? cookie(new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } }), '', 0) : cookie(reply({ message: 'Unauthenticated' }, 401), '', 0);
      return await locked(sessionId, async owner => {
        let session = await store.get(sessionId);
        if (!session) return route === 'auth/logout' ? cookie(new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } }), '', 0) : cookie(reply({ message: 'Unauthenticated' }, 401), '', 0);
        const target = route + new URL(request.url).search;
        let response = await upstream(target, session);
        if (response.status === 401) {
          await response.body?.cancel();
          const refreshed = await fetcher(new URL('auth/refresh-token', base), {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: session.token, refreshToken: session.refreshToken }),
            cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
          });
          if (!refreshed.ok) {
            // Network, 429 and 5xx failures preserve the session for a later retry.
            if (refreshed.status === 401 || refreshed.status === 403) {
              await store.delete(sessionId);
              return cookie(reply({ message: 'Session expired' }, 401), '', 0);
            }
            return reply({ message: 'Authentication temporarily unavailable' }, 503);
          }
          const tokens = await refreshed.json() as { token: string; refreshToken: string };
          if (!tokens.token || !tokens.refreshToken) throw new Error('Invalid refresh response');
          session = { ...session, token: tokens.token, refreshToken: tokens.refreshToken };
          // Commit rotation before retry, even if retry subsequently fails.
          await store.set(sessionId, session, owner);
          response = await upstream(target, session);
        }
        if (response.status === 401 || (response.ok && ['auth/logout', 'auth/change-password'].includes(route))) {
          await store.delete(sessionId);
          return cookie(relay(response), '', 0);
        }
        await store.set(sessionId, { ...session, idleUntil: Date.now() + IDLE }, owner);
        return relay(response);
      });
    } catch (error) {
      if (error instanceof PayloadTooLarge) return reply({ message: 'Request body too large' }, 413);
      // Do not expose token-bearing fetch errors or infrastructure details.
      return reply({ message: 'Service temporarily unavailable' }, 503);
    }
  };
}
