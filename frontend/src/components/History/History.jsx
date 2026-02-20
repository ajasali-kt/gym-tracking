import { useState } from 'react';
import { getWorkoutHistory } from '../../services/historyService';
import { createShareLink } from '../../services/shareService';
import WorkoutTimeline from './WorkoutTimeline';
import ShareLinkModal from './ShareLinkModal';

const History = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);

  // Quick date presets
  const handleQuickSelect = (preset) => {
    const today = new Date();
    const to = today.toISOString().split('T')[0];
    let from;

    switch (preset) {
      case '7days':
        from = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        break;
      case '30days':
        from = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
        break;
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setFromDate(from);
    setToDate(to);
    setHistoryData(null);
    setShareData(null);
    setError(null);
  };

  const handleViewHistory = async () => {
    if (!fromDate || !toDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getWorkoutHistory(fromDate, toDate);
      setHistoryData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workout history');
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateShare = async (expiresInDays) => {
    if (!fromDate || !toDate) {
      setError('Please select a date range first');
      return;
    }

    try {
      const response = await createShareLink(fromDate, toDate, expiresInDays);
      setShareData(response.data);
      setShowShareModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate share link');
      console.error('Generate share error:', err);
    }
  };

  return (
    <>
      {/* Date Range Picker */}
      <div className="space-y-6">
        {/* Quick Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Select
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickSelect('7days')}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleQuickSelect('30days')}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handleQuickSelect('thisMonth')}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium"
            >
              This Month
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setHistoryData(null);
                setShareData(null);
                setError(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setHistoryData(null);
                setShareData(null);
                setError(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleViewHistory}
            disabled={loading || !fromDate || !toDate}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Loading...' : 'View History'}
          </button>
          {historyData && historyData.totalWorkouts > 0 && (
            <button
              onClick={() => {
                setShareData(null);
                setShowShareModal(true);
              }}
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Generate Share Link
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Workout Timeline */}
      {historyData && <WorkoutTimeline data={historyData} />}

      {/* Share Link Modal */}
      {showShareModal && (
        <ShareLinkModal
          fromDate={fromDate}
          toDate={toDate}
          shareData={shareData}
          onClose={() => setShowShareModal(false)}
          onGenerate={handleGenerateShare}
        />
      )}
    </>
  );
};

export default History;
