import axios, { AxiosAdapter, AxiosError } from 'axios';

export function createApiClient(baseURL: string, redirectToLogin: () => void, adapter?: AxiosAdapter) {
  const api = axios.create({ baseURL, adapter, withCredentials: true });
  let redirected = false;
  api.interceptors.request.use(config => {
    config.headers.set('X-Requested-With', 'MyStudents');
    config.headers.delete('Authorization');
    return config;
  });
  api.interceptors.response.use(response => {
    redirected = false;
    return response;
  }, (error: AxiosError) => {
    const url = error.config?.url?.split('?')[0] || '';
    const publicAuth = /^\/(?:auth\/(?:login|register|me|forgot-password|reset-password(?:\/validate)?)|admin\/login)$/.test(url);
    if (error.response?.status === 401 && !publicAuth && !redirected) {
      redirected = true;
      redirectToLogin();
    }
    return Promise.reject(error);
  });
  return api;
}
