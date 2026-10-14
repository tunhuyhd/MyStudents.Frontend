import axios, { AxiosAdapter, AxiosError, InternalAxiosRequestConfig } from 'axios';

interface SessionRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _accessToken?: string | null;
}
interface Tokens { token: string; refreshToken: string }
type TokenStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function createApiClient(baseURL: string, storage: TokenStorage, redirectToLogin: () => void, adapter?: AxiosAdapter) {
  const options = { baseURL, headers: { 'Content-Type': 'application/json' }, adapter };
  const api = axios.create(options);
  const tokenApi = axios.create(options);
  let refreshTask: Promise<Tokens> | null = null;
  let redirected = false;
  let lastRotation: { from: string | null; to: string; refresh: string } | null = null;
  const publicAuth = (url: string) => /\/(?:auth\/(?:login|register|refresh-token|forgot-password|reset-password(?:\/validate)?)|admin\/login)$/.test(url.split('?')[0]);

  function expireSession() {
    storage.removeItem('accessToken');
    storage.removeItem('refreshToken');
    if (!redirected) { redirected = true; redirectToLogin(); }
  }

  api.interceptors.request.use((config: SessionRequest) => {
    const token = storage.getItem('accessToken');
    config._accessToken = token;
    if (token && !publicAuth(config.url || '')) {
      config.headers.Authorization = `Bearer ${token}`;
      redirected = false;
    } else config.headers.delete('Authorization');
    return config;
  });

  api.interceptors.response.use(response => response, async (error: AxiosError) => {
    const original = error.config as SessionRequest | undefined;
    if (!original || error.response?.status !== 401 || publicAuth(original.url || '')) throw error;
    const currentAccess = storage.getItem('accessToken');
    const currentRefresh = storage.getItem('refreshToken');
    if (original._retry) {
      if (currentAccess && currentAccess === original._accessToken) expireSession();
      throw error;
    }
    if (!currentRefresh || !currentAccess) {
      if (currentAccess === original._accessToken) expireSession();
      throw error;
    }
    original._retry = true;
    // A delayed 401 from a request sent before rotation can reuse the new token.
    // Never replay an old account's request under a newly signed-in account.
    if (currentAccess !== original._accessToken) {
      const rotation = lastRotation;
      if (rotation && rotation.from === original._accessToken && rotation.to === currentAccess && rotation.refresh === currentRefresh)
        return api(original);
      throw error;
    }
    if (!refreshTask) {
      refreshTask = (async () => {
        try {
          const response = await tokenApi.post<Tokens>('/auth/refresh-token', { accessToken: currentAccess, refreshToken: currentRefresh });
          if (storage.getItem('refreshToken') !== currentRefresh) throw new Error('Session changed during refresh.');
          const tokens = response.data;
          if (!tokens.token || !tokens.refreshToken) throw new Error('Invalid token response.');
          storage.setItem('accessToken', tokens.token);
          storage.setItem('refreshToken', tokens.refreshToken);
          lastRotation = { from: currentAccess, to: tokens.token, refresh: tokens.refreshToken };
          return tokens;
        } catch (refreshError) {
          if (storage.getItem('refreshToken') === currentRefresh) expireSession();
          throw refreshError;
        } finally { refreshTask = null; }
      })();
    }
    const tokens = await refreshTask;
    if (storage.getItem('accessToken') !== tokens.token || storage.getItem('refreshToken') !== tokens.refreshToken)
      throw new Error('Session changed during refresh.');
    return api(original);
  });
  return api;
}

