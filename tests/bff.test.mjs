import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBff } from '../.test-output/lib/server/bff.js';
import { MemorySessionStore, RedisSessionStore } from '../.test-output/lib/server/sessionStore.js';

const origin = 'https://web.test';
const id = 'a'.repeat(64);
const session = () => ({ token: 'access-old', refreshToken: 'refresh-old', expiresAt: Date.now() + 600000, idleUntil: Date.now() + 600000 });
const json = (data, status = 200) => Response.json(data, { status });
function request(path, method = 'GET', body, headers = {}) {
  return new Request(`${origin}/api/bff/${path}`, { method, headers: { 'X-Requested-With': 'MyStudents', Origin: origin, Cookie: `__Host-session=${id}`, 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
}
async function setup(fetcher) {
  const store = new MemorySessionStore();
  await store.set(id, session());
  const handle = createBff({ store, apiURL: 'https://api.test', origin, secure: true, fetcher });
  return { store, call: (path, method, body, headers) => handle(request(path, method, body, headers), path.split('/')) };
}

test('login/register/admin login never expose tokens; rotate session ID and use secure cookie', async () => {
  for (const path of ['auth/login', 'auth/register', 'auth/google', 'admin/login', 'Auth/Login']) {
    const { call, store } = await setup(async (url, options) => {
      assert.equal(options.headers.has('Authorization'), false);
      return json({ token: 'secret-access', refreshToken: 'secret-refresh', username: 'user', userRole: 'Teacher', userId: '1' });
    });
    const response = await call(path, 'POST', { username: 'user', password: 'password' });
    const cookie = response.headers.get('Set-Cookie');
    assert.match(cookie, /^__Host-session=[a-f0-9]{64};/);
    assert.match(cookie, /HttpOnly; SameSite=Lax; Max-Age=604800; Secure/);
    assert.equal(cookie.includes(id), false);
    assert.deepEqual(await response.json(), { username: 'user', userRole: 'Teacher', userId: '1' });
    assert.equal(await store.get(id), null);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
});

test('CSRF, refresh endpoint and traversal are rejected before upstream', async () => {
  let calls = 0;
  const { call } = await setup(async () => { calls++; return json({}); });
  assert.equal((await call('auth/login', 'POST', {}, { Origin: 'https://evil.test' })).status, 403);
  assert.equal((await call('students', 'GET', undefined, { 'X-Requested-With': '' })).status, 403);
  assert.equal((await call('students', 'POST', {}, { Origin: '' })).status, 403);
  assert.equal((await call('students', 'GET', undefined, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await call('auth/refresh-token', 'POST', {})).status, 404);
  assert.equal((await call('auth/../login', 'POST', {})).status, 404);
  assert.equal((await call('auth/login', 'GET')).status, 405);
  assert.equal((await call('Auth/Refresh-Token', 'POST', {})).status, 404);
  assert.equal(calls, 0);
});

test('concurrent requests across tabs serialize rotation and keep credentials server-side', async () => {
  let refreshes = 0;
  const { call, store } = await setup(async (url, options) => {
    if (url.pathname.endsWith('/refresh-token')) {
      refreshes++;
      assert.equal(JSON.parse(options.body).refreshToken, 'refresh-old');
      await new Promise(resolve => setTimeout(resolve, 20));
      return json({ token: 'access-new', refreshToken: 'refresh-new' });
    }
    assert.equal(options.headers.has('Cookie'), false);
    return options.headers.get('Authorization') === 'Bearer access-new' ? json({ ok: true }) : json({}, 401);
  });
  const responses = await Promise.all(Array.from({ length: 5 }, () => call('students')));
  assert.ok(responses.every(r => r.status === 200));
  assert.equal(refreshes, 1);
  assert.equal((await store.get(id)).refreshToken, 'refresh-new');
});

test('temporary refresh failure preserves session, invalid refresh revokes it', async () => {
  for (const status of [429, 500, 401, 403]) {
    const { call, store } = await setup(async url => json({}, url.pathname.endsWith('/refresh-token') ? status : 401));
    const response = await call('students');
    assert.equal(response.status, status < 429 ? 401 : 503);
    assert.equal(Boolean(await store.get(id)), status >= 429);
  }
});

test('network failure preserves session; retry is bounded to one attempt', async () => {
  const failed = await setup(async () => { throw new Error('secret-refresh'); });
  const unavailable = await failed.call('students');
  assert.equal(unavailable.status, 503);
  assert.equal((await unavailable.text()).includes('secret-refresh'), false);
  assert.ok(await failed.store.get(id));
  let calls = 0;
  const retried = await setup(async url => {
    calls++;
    return url.pathname.endsWith('/refresh-token') ? json({ token: 'new', refreshToken: 'new' }) : json({}, 401);
  });
  assert.equal((await retried.call('students')).status, 401);
  assert.equal(calls, 3);
  assert.equal(await retried.store.get(id), null);
});

test('logout and password changes invalidate server session and cookie; logout failures permit retry', async () => {
  for (const path of ['auth/logout', 'auth/change-password', 'auth/reset-password']) {
    const { call, store } = await setup(async () => new Response(null, { status: 204 }));
    const result = await call(path, path === 'auth/change-password' ? 'PUT' : 'POST', {});
    assert.equal(result.status, 204);
    assert.match(result.headers.get('Set-Cookie'), /Max-Age=0/);
    assert.equal(await store.get(id), null);
  }
  const { call, store } = await setup(async () => json({}, 500));
  assert.equal((await call('auth/logout', 'POST')).status, 500);
  assert.ok(await store.get(id));
});

test('expired and missing sessions cannot reach protected upstream', async () => {
  const { call, store } = await setup(async () => { throw new Error('must not call'); });
  await store.set(id, { ...session(), expiresAt: Date.now() - 1 });
  assert.equal((await call('auth/me')).status, 401);
  assert.equal((await call('auth/logout', 'POST')).status, 204);
});

test('multipart bytes, query and content type are preserved without forwarding browser credentials', async () => {
  const form = new FormData(); form.append('file', new Blob(['image-bytes']), 'avatar.png');
  const store = new MemorySessionStore(); await store.set(id, session());
  const handle = createBff({ store, origin, apiURL: 'https://api.test', secure: true, fetcher: async (url, options) => {
    assert.equal(url.search, '?size=small');
    assert.match(options.headers.get('Content-Type'), /^multipart\/form-data; boundary=/);
    assert.match(Buffer.from(options.body).toString(), /image-bytes/);
    assert.equal(options.headers.get('Authorization'), 'Bearer access-old');
    return json({ imageUrl: '/uploads/avatar.png' });
  }});
  const response = await handle(new Request(`${origin}/api/bff/auth/avatar?size=small`, { method: 'PUT', body: form, headers: { Origin: origin, 'X-Requested-With': 'MyStudents', Cookie: `__Host-session=${id}` } }), ['auth', 'avatar']);
  assert.equal(response.status, 200);
});

test('Redis stores authenticated ciphertext and TTL, never raw tokens', async () => {
  const originalFetch = globalThis.fetch;
  let stored;
  globalThis.fetch = async (_url, options) => {
    const args = JSON.parse(options.body);
    if (args[0] === 'SET') { stored = args[2]; assert.equal(args[3], 'EX'); assert.ok(args[4] > 0); return json({ result: 'OK' }); }
    return json({ result: stored });
  };
  try {
    const store = new RedisSessionStore('https://redis.test', 'credential', Buffer.alloc(32, 1));
    await store.set(id, session());
    assert.equal(Buffer.from(stored, 'base64').includes(Buffer.from('refresh-old')), false);
    assert.equal((await store.get(id)).token, 'access-old');
    stored = stored.slice(0, -4) + 'AAAA';
    await assert.rejects(store.get(id));
  } finally { globalThis.fetch = originalFetch; }
});

test('CSRF rejects sibling origins, missing Origin and cross-site requests for every write method', async () => {
  let upstreamCalls = 0;
  const { call } = await setup(async () => { upstreamCalls++; return json({}); });
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    for (const headers of [
      { Origin: 'https://sibling.web.test' },
      { Origin: '' },
      { 'X-Requested-With': '' },
      { 'Sec-Fetch-Site': 'cross-site' },
    ]) assert.equal((await call('students', method, {}, headers)).status, 403);
  }
  assert.equal(upstreamCalls, 0);
});

test('admin authorization failures are preserved and browser headers cannot grant privileges', async () => {
  let calls = 0;
  const { call, store } = await setup(async (_url, options) => {
    calls++;
    assert.equal(options.headers.get('Authorization'), 'Bearer access-old');
    for (const name of ['Cookie', 'X-User-Role', 'X-User-Id', 'X-Forwarded-User'])
      assert.equal(options.headers.has(name), false);
    return json({ code: 'ERR_FORBIDDEN' }, 403);
  });
  const response = await call('admin/users', 'GET', undefined, {
    Authorization: 'Bearer forged-admin', 'X-User-Role': 'Admin', 'X-User-Id': 'admin', 'X-Forwarded-User': 'admin',
  });
  assert.equal(response.status, 403);
  assert.equal(calls, 1); // A permission denial must not trigger token refresh.
  assert.ok(await store.get(id));
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  await store.delete(id);
  const anonymous = await call('admin/users');
  assert.equal(anonymous.status, 401);
  assert.match(anonymous.headers.get('Set-Cookie'), /Max-Age=0/);
  assert.equal(calls, 1);
});

test('revoked session clears browser cookie and cannot be replayed', async () => {
  let calls = 0;
  const { call, store } = await setup(async () => { calls++; return json({}, 401); });
  const rejected = await call('auth/me');
  assert.equal(rejected.status, 401);
  assert.match(rejected.headers.get('Set-Cookie'), /Max-Age=0/);
  assert.equal(await store.get(id), null);
  assert.equal(calls, 2);
  assert.equal((await call('admin/users')).status, 401);
  assert.equal(calls, 2);
});


test('Google login maps the backend role and preserves the existing session on failure', async () => {
  const { call, store } = await setup(async () => json({ errorCode: 'ERR_GOOGLE_ACCOUNT_EXISTS' }, 409));
  const denied = await call('auth/google', 'POST', { credential: 'credential' });
  assert.equal(denied.status, 409);
  assert.equal(denied.headers.get('Set-Cookie'), null);
  assert.ok(await store.get(id));
  const success = await setup(async () => json({ token: 'secret', refreshToken: 'refresh', username: 'teacher', role: 'User', userId: '123' }));
  const response = await success.call('auth/google', 'POST', { credential: 'credential' });
  assert.deepEqual(await response.json(), { username: 'teacher', userRole: 'User', userId: '123' });
  assert.match(response.headers.get('Set-Cookie'), /HttpOnly; SameSite=Lax; Max-Age=604800; Secure/);
});
