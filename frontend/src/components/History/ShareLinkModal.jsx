import { useState } from 'react';

const ShareLinkModal = ({ fromDate, toDate, shareData, onClose, onGenerate }) => {
  const [expiresIn, setExpiresIn] = useState(30);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (shareData?.shareUrl) {
      navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerate = () => {
    const days = expiresIn === 0 ? null : expiresIn;
    onGenerate(days);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 bg-green-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {shareData
                ? (shareData.renewed ? 'Share Link Renewed' : (shareData.reused ? 'Existing Share Link' : 'Share Link Generated'))
                : 'Generate Share Link'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {!shareData ? (
            <>
              {/* Date Range Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium mb-1">Date Range</p>
                <p className="text-lg font-semibold text-blue-900">
                  {new Date(fromDate).toLocaleDateString()} - {new Date(toDate).toLocaleDateString()}
                </p>
              </div>

              {/* Expiration Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Expiration
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={0}>Never expires</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                Generate Share Link
              </button>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-800 font-medium">
                    {shareData.renewed
                      ? 'Existing link was inactive/expired and has been reactivated with new expiry.'
                      : (shareData.reused
                        ? 'An existing active link for this date range was found.'
                        : 'Share link created successfully!')}
                  </p>
                </div>
              </div>

              {/* Share Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={shareData.shareUrl}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-md font-medium ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Expiration Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">Token:</span> {shareData.token.substring(0, 8)}...
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(shareData.createdAt).toLocaleString()}
                  </p>
                  {shareData.expiresAt ? (
                    <p>
                      <span className="font-medium">Expires:</span>{' '}
                      {new Date(shareData.expiresAt).toLocaleString()}
                    </p>
                  ) : (
                    <p>
                      <span className="font-medium">Expires:</span> Never
                    </p>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Share this link with your trainer or friends. They can view your workout history
                  for the selected date range without needing to log in.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;
