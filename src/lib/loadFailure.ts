export type LoadFailure = 'failed' | 'forbidden' | 'unauthorized';
export type ListLoadState = 'loading' | 'empty' | 'data' | LoadFailure;

export function classifyLoadFailure(error: unknown): LoadFailure {
  if (typeof error !== 'object' || error === null || !('response' in error)) return 'failed';

  const response = (error as { response?: { status?: unknown } }).response;
  if (response?.status === 401) return 'unauthorized';
  if (response?.status === 403) return 'forbidden';
  return 'failed';
}

export function isRetryableLoadFailure(failure: LoadFailure): boolean {
  return failure === 'failed';
}

export function getListLoadState<T>(items: readonly T[], loading: boolean, failure: LoadFailure | null): ListLoadState {
  if (loading) return 'loading';
  if (failure) return failure;
  return items.length === 0 ? 'empty' : 'data';
}
