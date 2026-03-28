import { useMemo, useRef } from 'react';
import useAccessibleModal from '../../hooks/useAccessibleModal';

/**
 * CustomPopup
 * - Dark themed modal with overlay
 * - Close (X) on top-right
 * - Close on Esc and overlay click
 * - Body text via `bodyText` (no parent-side HTML)
 * - Single default action button ("Ok")
 */
export default function CustomPopup({
  isOpen,
  title,
  bodyText,
  idBase,
  onClose,
  onOk,
  buttonType = 'default', // 'default' | 'delete'
  buttonText = 'Ok',
  okDisabled = false,
  closeOnOverlayClick = true,
  maxWidthClassName = 'max-w-lg'
}) {
  const cancelHelpText = 'You can cancel by clicking the close icon, pressing Esc, or clicking outside the popup.';

  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  const resolvedIdBase = useMemo(() => {
    if (idBase) return idBase;
    const fallback = typeof title === 'string' ? title : 'custom-popup';
    const token = String(fallback)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return token || 'custom-popup';
  }, [idBase, title]);

  useAccessibleModal({ isOpen: Boolean(isOpen), onClose, modalRef, initialFocusRef: closeBtnRef });

  const resolvedOkButtonClassName =
    buttonType === 'delete'
      ? 'rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10'
      : 'btn-outline';

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${resolvedIdBase}-title`}
        aria-describedby={`${resolvedIdBase}-body`}
        tabIndex={-1}
        className={`w-full ${maxWidthClassName} rounded-2xl border border-app-subtle bg-card shadow-card`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-app-subtle px-5 py-4">
          <h3 id={`${resolvedIdBase}-title`} className="text-lg font-semibold text-app-primary">
            {title}
          </h3>
          <button
            ref={closeBtnRef}
            id={`${resolvedIdBase}-close-button`}
            type="button"
            onClick={onClose}
            className="text-app-muted hover:text-app-primary"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4">
          <p id={`${resolvedIdBase}-body`} className="text-sm text-app-primary whitespace-pre-line">
            {typeof bodyText === 'string' ? bodyText : ''}
          </p>
          <p className="mt-4 text-xs text-app-muted">{cancelHelpText}</p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-app-subtle px-4 py-4">
          <button
            id={`${resolvedIdBase}-ok-button`}
            type="button"
            onClick={onOk ?? onClose}
            className={resolvedOkButtonClassName}
            disabled={okDisabled}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
