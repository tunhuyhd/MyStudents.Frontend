'use client';

import { useEffect, useRef } from 'react';

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export function getWrappedFocusIndex(currentIndex: number, count: number, reverse: boolean): number {
  if (count <= 0) return -1;
  if (reverse) return currentIndex <= 0 ? count - 1 : currentIndex - 1;
  return currentIndex < 0 || currentIndex >= count - 1 ? 0 : currentIndex + 1;
}

export function useAccessibleDialog<T extends HTMLElement>(isOpen: boolean, onEscape: () => void) {
  const dialogRef = useRef<T>(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const getTabbable = () => Array.from(dialog.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR))
      .filter(element => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
    const initialFocus = dialog.querySelector<HTMLElement>('[data-dialog-initial-focus]')
      || dialog.querySelector<HTMLElement>('input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])')
      || getTabbable()[0];
    (initialFocus || dialog).focus();

    const isTopDialog = () => {
      const scopes = document.querySelectorAll<HTMLElement>('[data-dialog-focus-scope="true"]');
      return scopes.item(scopes.length - 1) === dialog;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopDialog()) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const tabbable = getTabbable();
      if (tabbable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const currentIndex = tabbable.indexOf(document.activeElement as HTMLElement);
      const nextIndex = getWrappedFocusIndex(currentIndex, tabbable.length, event.shiftKey);
      const isAtBoundary = event.shiftKey
        ? currentIndex <= 0
        : currentIndex < 0 || currentIndex >= tabbable.length - 1;
      if (isAtBoundary) {
        event.preventDefault();
        tabbable[nextIndex].focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus?.isConnected && previousFocus !== document.body && !dialog.contains(previousFocus)) {
        previousFocus.focus();
      } else {
        const fallback = document.querySelector<HTMLElement>('main');
        if (fallback) {
          fallback.tabIndex = -1;
          fallback.focus();
        }
      }
    };
  }, [isOpen]);

  return dialogRef;
}
