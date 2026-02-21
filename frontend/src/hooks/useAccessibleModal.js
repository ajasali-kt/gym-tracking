import { useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

export default function useAccessibleModal({
  isOpen,
  onClose,
  modalRef,
  initialFocusRef
}) {
  useEffect(() => {
    if (!isOpen || !modalRef?.current) return undefined;

    const previousActiveElement = document.activeElement;
    const modalEl = modalRef.current;

    const focusableEls = Array.from(modalEl.querySelectorAll(FOCUSABLE_SELECTOR));
    const firstFocusable = initialFocusRef?.current || focusableEls[0] || modalEl;
    const lastFocusable = focusableEls[focusableEls.length - 1] || modalEl;

    if (firstFocusable && typeof firstFocusable.focus === 'function') {
      firstFocusable.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab') return;

      if (focusableEls.length === 0) {
        event.preventDefault();
        modalEl.focus();
        return;
      }

      const activeEl = document.activeElement;
      if (event.shiftKey && activeEl === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && activeEl === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (
        previousActiveElement &&
        typeof previousActiveElement.focus === 'function'
      ) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose, modalRef, initialFocusRef]);
}
