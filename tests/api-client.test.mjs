import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AxiosError } from 'axios';
import { createApiClient } from '../.test-output/createApiClient.js';

function harness(adapter, initial = { accessToken: 'access-old', refreshToken: 'refresh-old' }) {
  const values = new Map(Object.entries(initial));
  const redirects = [];
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  const api = createApiClient('https://api.test/api/v1', storage, () => redirects.push('/auth/login'), adapter);
  return { api, storage, values, redirects };
}

function response(config, data = {}) {
  return { data, status: 200, statusText: 'OK', headers: {}, config };
}

function unauthorized(config) {
  return Promise.reject(new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
    data: { code: 'ERR_UNAUTHORIZED' }, status: 401, statusText: 'Unauthorized', headers: {}, config,
  }));
}

test('concurrent unauthorized requests share one refresh and retry with rotated tokens', async () => {
  let refreshCalls = 0;
  let resourceCalls = 0;
  const adapter = async config => {
    if (config.url.endsWith('/auth/refresh-token')) {
      refreshCalls++;
      await new Promise(resolve => setTimeout(resolve, 15));
      return response(config, { token: 'access-new', refreshToken: 'refresh-new' });
    }
    resourceCalls++;
    return config.headers.get('Authorization') === 'Bearer access-new'
      ? response(config, { ok: true })
      : unauthorized(config);
  };
  const { api, storage, redirects } = harness(adapter);
  const results = await Promise.all(Array.from({ length: 8 }, (_, i) => api.get(`/students/${i}`)));

  assert.equal(results.length, 8);
  assert.equal(refreshCalls, 1);
  assert.equal(resourceCalls, 16);
  assert.equal(storage.getItem('accessToken'), 'access-new');
  assert.equal(storage.getItem('refreshToken'), 'refresh-new');
  assert.deepEqual(redirects, []);
});

test('public login 401 does not attempt token refresh or clear the session', async () => {
  let refreshCalls = 0;
  const adapter = config => {
    if (config.url.endsWith('/auth/refresh-token')) refreshCalls++;
    return unauthorized(config);
  };
  const { api, storage, redirects } = harness(adapter);

  await assert.rejects(api.post('/auth/login', { username: 'teacher', password: 'incorrect' }));
  assert.equal(refreshCalls, 0);
  assert.equal(storage.getItem('accessToken'), 'access-old');
  assert.deepEqual(redirects, []);
});

test('failed refresh clears credentials and redirects once for concurrent failures', async () => {
  let refreshCalls = 0;
  const adapter = config => {
    if (config.url.endsWith('/auth/refresh-token')) {
      refreshCalls++;
      return unauthorized(config);
    }
    return unauthorized(config);
  };
  const { api, storage, redirects } = harness(adapter);

  const results = await Promise.allSettled([api.get('/students'), api.get('/classes')]);
  assert.equal(results.filter(result => result.status === 'rejected').length, 2);
  assert.equal(refreshCalls, 1);
  assert.equal(storage.getItem('accessToken'), null);
  assert.equal(storage.getItem('refreshToken'), null);
  assert.deepEqual(redirects, ['/auth/login']);
});

test('a request from a previous account is not replayed with the new account credentials', async () => {
  let releaseRefresh;
  let refreshStarted;
  const started = new Promise(resolve => { refreshStarted = resolve; });
  const adapter = config => {
    if (config.url.endsWith('/auth/refresh-token')) {
      refreshStarted();
      return new Promise(resolve => { releaseRefresh = () => resolve(response(config, { token: 'access-new', refreshToken: 'refresh-new' })); });
    }
    return unauthorized(config);
  };
  const { api, storage, values, redirects } = harness(adapter);

  const oldRequest = api.get('/private/old-account-data');
  await started;
  values.set('accessToken', 'access-account-b');
  values.set('refreshToken', 'refresh-account-b');
  releaseRefresh();

  await assert.rejects(oldRequest);
  assert.equal(storage.getItem('accessToken'), 'access-account-b');
  assert.equal(storage.getItem('refreshToken'), 'refresh-account-b');
  assert.deepEqual(redirects, []);
});

test('a retried request is attempted at most once before the session expires', async () => {
  let protectedCalls = 0;
  let refreshCalls = 0;
  const adapter = config => {
    if (config.url.endsWith('/auth/refresh-token')) {
      refreshCalls++;
      return Promise.resolve(response(config, { token: 'access-new', refreshToken: 'refresh-new' }));
    }
    protectedCalls++;
    return unauthorized(config);
  };
  const { api, storage, redirects } = harness(adapter);

  await assert.rejects(api.get('/protected'));
  assert.equal(refreshCalls, 1);
  assert.equal(protectedCalls, 2);
  assert.equal(storage.getItem('accessToken'), null);
  assert.deepEqual(redirects, ['/auth/login']);
});
