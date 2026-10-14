import axios from 'axios';

type Translate = (key: string, params?: Record<string, string>) => string;
export function apiErrorMessage(error: unknown, t: Translate, fallback = 'common.saveError'): string {
  if (!axios.isAxiosError(error)) return t(fallback);
  const data = error.response?.data as { errorCode?: string; message?: string; errors?: Record<string, string[]>; parameters?: Record<string, string> } | undefined;
  const code = data?.errorCode;
  if (code) {
    const key = `errors.${code}`;
    const translated = t(key, data?.parameters);
    if (translated !== key) return translated;
  }
  return data?.message || t(fallback);
}

