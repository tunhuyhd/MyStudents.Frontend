import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const origin = 'http://localhost:3107';
let refreshes = 0;
const api = createServer(async (req, res) => {
  for await (const chunk of req) { void chunk; }
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/api/v1/auth/login') return res.end(JSON.stringify({ token: 'old-access', refreshToken: 'secret-refresh', userRole: 'Teacher', username: 'teacher', userId: '1' }));
  if (req.url === '/api/v1/auth/refresh-token') {
    refreshes++;
    return res.end(JSON.stringify({ token: 'new-access', refreshToken: 'rotated-refresh' }));
  }
  if (req.url === '/api/v1/auth/logout') { res.writeHead(204); return res.end(); }
  if (!req.headers.authorization || (req.url === '/api/v1/students' && req.headers.authorization !== 'Bearer new-access')) {
    res.writeHead(401); return res.end('{}');
  }
  res.end(JSON.stringify({ id: '1', username: 'teacher', role: 'Teacher' }));
});
api.listen(0, '127.0.0.1');
await once(api, 'listening');
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--port', '3107'], {
  env: { ...process.env, API_INTERNAL_URL: `http://127.0.0.1:${api.address().port}`, APP_ORIGIN: origin, NODE_ENV: 'development', SESSION_REDIS_REST_URL: '', SESSION_REDIS_REST_TOKEN: '', SESSION_ENCRYPTION_KEY: '' },
  stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
});
let output = '';
child.stdout.on('data', chunk => { output += chunk; });
child.stderr.on('data', chunk => { output += chunk; });
let cookie = '';
async function call(path, method = 'GET', headers = {}) {
  return fetch(`${origin}/api/bff/${path}`, { method, headers: { Origin: origin, 'X-Requested-With': 'MyStudents', Cookie: cookie, 'Content-Type': 'application/json', ...headers }, body: method === 'POST' ? '{}' : undefined });
}
try {
  const deadline = Date.now() + 90000;
  while (true) {
    if (child.exitCode !== null) throw new Error(output);
    try { if ((await fetch(`${origin}/api/bff/auth/me`, { signal: AbortSignal.timeout(3000) })).status < 500) break; } catch { /* starting */ }
    if (Date.now() > deadline) throw new Error(`Next startup timed out: ${output}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.equal((await call('auth/login', 'POST', { Origin: 'https://evil.test' })).status, 403);
  const login = await call('auth/login', 'POST');
  assert.equal(login.status, 200, await login.clone().text());
  assert.equal((await login.text()).includes('token'), false);
  cookie = login.headers.get('set-cookie').split(';')[0];
  assert.match(cookie, /^mystudents-dev-session=[a-f0-9]{64}$/);
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  assert.equal((await call('auth/me')).status, 200);
  const responses = await Promise.all([call('students'), call('students')]);
  assert.ok(responses.every(response => response.status === 200));
  assert.equal(refreshes, 1);
  assert.equal((await call('auth/refresh-token', 'POST')).status, 404);
  const logout = await call('auth/logout', 'POST');
  assert.equal(logout.status, 204);
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal((await call('auth/me')).status, 401);
  console.log('BFF integration passed: real Next.js routes, CSRF, cookie, restore, concurrent refresh, logout.');
} catch (error) {
  console.error(output);
  throw error;
} finally {
  child.kill();
  api.closeAllConnections();
  api.close();
}
