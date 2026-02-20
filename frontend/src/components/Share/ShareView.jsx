import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedHistory } from '../../services/shareService';
import WorkoutTimeline from '../History/WorkoutTimeline';

const ShareView = () => {
  const { token } = useParams();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedHistory = async () => {
      try {
        const response = await getSharedHistory(token);
        setHistoryData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shared workout history');
        console.error('Fetch shared history error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedHistory();
    }
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared workout history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="mb-2">This could be because:</p>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>The link has expired</li>
              <li>The link has been revoked by the owner</li>
              <li>The link is invalid</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h1 className="text-3xl font-bold">{historyData.username}'s Workout History</h1>
              </div>
              <p className="text-blue-100 text-lg">
                {formatDate(historyData.fromDate)} - {formatDate(historyData.toDate)}
              </p>
            </div>
            <div className="bg-blue-400 bg-opacity-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-blue-100">Shared Workout</p>
              <p className="text-xl font-bold">Read Only</p>
            </div>
          </div>

          {historyData.expiresAt && (
            <div className="mt-4 bg-blue-400 bg-opacity-30 rounded px-3 py-2 inline-block">
              <p className="text-sm">
                This link expires on {new Date(historyData.expiresAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Workout Timeline */}
        <WorkoutTimeline data={historyData} />

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-2">
            Want to track your own workouts?
          </p>
          <a
            href="/register"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Get Started for Free
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShareView;
