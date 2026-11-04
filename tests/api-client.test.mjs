import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AxiosError } from 'axios';
import { createApiClient } from '../.test-output/lib/createApiClient.js';

test('browser sends same-origin session requests without bearer credentials', async () => {
  const api = createApiClient('/api/bff', () => {}, async config => {
    assert.equal(config.withCredentials, true);
    assert.equal(config.timeout, 30_000);
    assert.equal(config.headers.get('X-Requested-With'), 'MyStudents');
    assert.equal(config.headers.has('Authorization'), false);
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
  });
  await api.get('/auth/me', { headers: { Authorization: 'Bearer legacy' } });
});

test('401 redirects once without browser refresh; public authentication remains on page', async () => {
  let redirects = 0;
  let calls = 0;
  const api = createApiClient('/api/bff', () => redirects++, async config => {
    calls++;
    throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, { status: 401, data: {}, headers: {}, config });
  });
  await assert.rejects(api.post('/auth/login'));
  await assert.rejects(api.post('/auth/google'));
  await assert.rejects(api.get('/auth/me'));
  assert.equal(redirects, 0);
  await Promise.allSettled([api.get('/students'), api.get('/classes')]);
  assert.equal(redirects, 1);
  assert.equal(calls, 5);
});
