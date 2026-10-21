import { useEffect } from 'react';

let modalCount = 0;
let originalOverflow = '';

/**
 * Locks document.body scroll when a modal is open.
 * Uses a reference counter to support stacked/nested modals without premature unlocking.
 */
export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  if (modalCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  modalCount++;
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  modalCount = Math.max(0, modalCount - 1);
  if (modalCount === 0) {
    document.body.style.overflow = originalOverflow;
  }
}

export function useModalScrollLock(isOpen: boolean): void {
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isOpen]);
}
