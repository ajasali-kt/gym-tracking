import { useRef, useState } from 'react';
import useAccessibleModal from '../../hooks/useAccessibleModal';

const ShareLinkModal = ({ fromDate, toDate, shareData, onClose, onGenerate }) => {
  const [expiresIn, setExpiresIn] = useState(30);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  useAccessibleModal({ isOpen: true, onClose, modalRef, initialFocusRef: closeBtnRef });

  const handleCopyLink = () => {
    if (!shareData?.shareUrl) return;
    navigator.clipboard.writeText(shareData.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl border border-app-subtle bg-card shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-app-subtle px-5 py-4">
          <h3 className="text-lg font-semibold text-app-primary">{shareData ? 'Share Link' : 'Generate Share Link'}</h3>
          <button
            ref={closeBtnRef}
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

        <div className="space-y-4 px-5 py-4">
          {!shareData ? (
            <>
              <div className="rounded-xl border border-app-subtle bg-surface p-3 text-sm text-app-muted">
                {new Date(fromDate).toLocaleDateString()} - {new Date(toDate).toLocaleDateString()}
              </div>
              <select value={expiresIn} onChange={(e) => setExpiresIn(Number(e.target.value))} className="input-field">
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={0}>Never expires</option>
              </select>
              <button onClick={() => onGenerate(expiresIn === 0 ? null : expiresIn)} className="btn-primary w-full">
                Generate Link
              </button>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300">
                Link ready to share.
              </div>
              <div className="flex gap-2">
                <input type="text" readOnly value={shareData.shareUrl} className="input-field" />
                <button onClick={handleCopyLink} className="btn-outline min-w-[90px]">
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="rounded-xl border border-app-subtle bg-surface p-3 text-xs text-app-muted">
                {shareData.expiresAt ? `Expires: ${new Date(shareData.expiresAt).toLocaleString()}` : 'No expiration'}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;
