type Translate = (key: string, params?: Record<string, string>) => string;
type ApiFailure = { code?: string; isAxiosError?: boolean; request?: unknown; response?: { status?: number; headers?: Record<string, unknown>; data?: unknown } };

/** Only trusted local copy reaches the UI. Server messages may contain technical or sensitive details. */
export function apiErrorMessage(error: unknown, t: Translate, fallback = 'common.saveError'): string {
  if (!error || typeof error !== 'object') return t(fallback);
  const failure = error as ApiFailure;
  const status = failure.response?.status;
  const login = fallback === 'auth.loginFailed' || fallback === 'admin.loginFailed';
  if (status === 401 && fallback === 'auth.googleFailed') return t(fallback);
  if (status === 401) return t(login ? 'apiErrors.invalidCredentials' : 'common.sessionExpired');
  if (status === 403) return t('common.permissionDenied');
  if (failure.code === 'ECONNABORTED' || failure.code === 'ETIMEDOUT') return t('apiErrors.timeout');
  if (!failure.response && (failure.isAxiosError || failure.request || failure.code === 'ERR_NETWORK')) return t('apiErrors.network');
  if (status === 429) {
    const wait = Number(failure.response?.headers?.['retry-after']);
    return Number.isFinite(wait) && wait > 0 && wait <= 86400
      ? t('apiErrors.rateLimitWait', { seconds: String(Math.ceil(wait)) }) : t('errors.ERR_RATE_LIMIT');
  }
  if (status === 413) return t('apiErrors.uploadTooLarge');
  if (status === 415) return t('apiErrors.unsupportedFile');
  if (status === 504) return t('apiErrors.timeout');
  if (status === 502 || status === 503) return t('apiErrors.unavailable');
  if (status && status >= 500) return t('errors.ERR_INTERNAL');
  const raw = failure.response?.data;
  const data = raw && typeof raw === 'object' ? raw as { errorCode?: unknown; parameters?: unknown; errors?: unknown } : undefined;
  const code = typeof data?.errorCode === 'string' ? data.errorCode : '';
  if (code === 'ERR_VALIDATION' || status === 422) {
    const fields = data?.errors && typeof data.errors === 'object'
      ? [...new Set(Object.keys(data.errors).map(field => {
        const normalized = field.replace(/\[\d+\]/g, '').split('.')[0].toLowerCase();
        const key = `apiFields.${normalized}`;
        const label = t(key);
        return label === key ? '' : label;
      }).filter(Boolean))].slice(0, 6) : [];
    return fields.length ? t('apiErrors.validationFields', { fields: fields.join(', ') }) : t('errors.ERR_VALIDATION');
  }
  if (/^ERR_[A-Z_]+$/.test(code)) {
    const key = `errors.${code}`;
    const params: Record<string, string> = {};
    if (data?.parameters && typeof data.parameters === 'object') {
      for (const [name, value] of Object.entries(data.parameters)) {
        if (typeof value === 'string' || typeof value === 'number') params[name] = String(value).slice(0, 200);
      }
    }
    const translated = t(key, params);
    if (translated !== key) return translated;
  }
  if (status === 404) return t('errors.ERR_NOT_FOUND');
  if (status === 409) return t('apiErrors.conflict');
  if (status === 400 || status === 422) return t('errors.ERR_VALIDATION');
  return t(fallback);
}
