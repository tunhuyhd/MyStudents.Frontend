type Translate = (key: string, params?: Record<string, string>) => string;

export function mutationErrorMessage(error: unknown, t: Translate): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: unknown; data?: { errorCode?: string; parameters?: Record<string, string> } } }).response;
    if (response?.status === 401) return t('common.sessionExpired');
    if (response?.status === 403) return t('common.permissionDenied');
    if (response?.data?.errorCode) {
      const key = `errors.${response.data.errorCode}`;
      const translated = t(key, response.data.parameters);
      if (translated !== key) return translated;
    }
  }
  return t('common.mutationFailed');
}
