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
    const bodyEl = document.body;
    modalEl.setAttribute('data-accessible-modal', 'true');

    const currentLockCount = Number.parseInt(bodyEl.dataset.modalScrollLockCount || '0', 10);
    if (currentLockCount === 0) {
      bodyEl.dataset.modalPreviousOverflow = bodyEl.style.overflow || '';
      bodyEl.style.overflow = 'hidden';
    }
    bodyEl.dataset.modalScrollLockCount = String(currentLockCount + 1);

    const getFocusableEls = () => Array.from(modalEl.querySelectorAll(FOCUSABLE_SELECTOR));
    const isTopMostModal = () => {
      const openModals = Array.from(document.querySelectorAll('[data-accessible-modal="true"]'));
      return openModals[openModals.length - 1] === modalEl;
    };

    const focusableEls = getFocusableEls();
    const firstFocusable = initialFocusRef?.current || focusableEls[0] || modalEl;

    if (firstFocusable && typeof firstFocusable.focus === 'function') {
      firstFocusable.focus();
    }

    const handleKeyDown = (event) => {
      if (!isTopMostModal()) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab') return;

      const currentFocusableEls = getFocusableEls();
      const currentFirstFocusable = currentFocusableEls[0] || modalEl;
      const currentLastFocusable = currentFocusableEls[currentFocusableEls.length - 1] || modalEl;

      if (!modalEl.contains(document.activeElement)) {
        event.preventDefault();
        currentFirstFocusable.focus();
        return;
      }

      if (currentFocusableEls.length === 0) {
        event.preventDefault();
        modalEl.focus();
        return;
      }

      const activeEl = document.activeElement;
      if (event.shiftKey && activeEl === currentFirstFocusable) {
        event.preventDefault();
        currentLastFocusable.focus();
      } else if (!event.shiftKey && activeEl === currentLastFocusable) {
        event.preventDefault();
        currentFirstFocusable.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      modalEl.removeAttribute('data-accessible-modal');

      const activeLockCount = Number.parseInt(bodyEl.dataset.modalScrollLockCount || '0', 10);
      const nextLockCount = Math.max(activeLockCount - 1, 0);
      bodyEl.dataset.modalScrollLockCount = String(nextLockCount);
      if (nextLockCount === 0) {
        bodyEl.style.overflow = bodyEl.dataset.modalPreviousOverflow || '';
        delete bodyEl.dataset.modalPreviousOverflow;
        delete bodyEl.dataset.modalScrollLockCount;
      }

      if (
        previousActiveElement &&
        typeof previousActiveElement.focus === 'function'
      ) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose, modalRef, initialFocusRef]);
}
