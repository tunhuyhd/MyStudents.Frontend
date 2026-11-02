import { apiErrorMessage } from './apiError';
type Translate = (key: string, params?: Record<string, string>) => string;
export function mutationErrorMessage(error: unknown, t: Translate): string {
  return apiErrorMessage(error, t, 'common.mutationFailed');
}
