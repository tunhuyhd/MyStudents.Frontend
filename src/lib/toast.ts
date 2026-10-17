export type ToastType = 'success' | 'error';

export function getToastDismissalDelay(type: ToastType, duration?: number): number | null {
  if (duration !== undefined) return duration;
  return type === 'error' ? null : 3000;
}
