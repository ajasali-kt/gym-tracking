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
    if (!token) {
      setError('Invalid share link. Missing token.');
      setLoading(false);
      return;
    }

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

    fetchSharedHistory();
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
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-app-muted">Loading shared workout history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center px-4">
        <div className="max-w-md w-full card p-8 text-center">
          <div className="w-16 h-16 rounded-full border border-red-500/35 bg-red-500/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-app-primary mb-2">Link Not Available</h2>
          <p className="text-app-muted mb-6">{error}</p>
          <div className="rounded-lg border border-app-subtle bg-surface p-4 text-sm text-app-muted">
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
    <div className="min-h-screen bg-app py-8 mobile-safe">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card p-4 sm:p-6 lg:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-start gap-2 sm:gap-3 mb-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 mt-0.5 shrink-0 text-app-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-app-primary leading-tight break-words">
                  {historyData.username}&apos;s Workout History
                </h1>
              </div>
              <p className="text-app-muted text-sm sm:text-base lg:text-lg leading-snug break-words">
                {formatDate(historyData.fromDate)} - {formatDate(historyData.toDate)}
              </p>
            </div>
            <div className="rounded-lg border border-app-subtle bg-surface px-4 py-3 w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-app-muted">Shared Workout</p>
              <p className="text-lg sm:text-xl font-bold text-app-primary">Read Only</p>
            </div>
          </div>

          {historyData.expiresAt && (
            <div className="mt-4 rounded border border-app-subtle bg-surface px-3 py-2 inline-block max-w-full">
              <p className="text-xs sm:text-sm text-app-muted break-words">
                This link expires on {new Date(historyData.expiresAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Workout Timeline */}
        <WorkoutTimeline data={historyData} />

        {/* Footer Info */}
        <div className="mt-8 card p-4 sm:p-6">
          <p className="text-app-muted mb-2 text-sm sm:text-base">
            Want to track your own workouts?
          </p>
          <a
            href="/register"
            className="font-medium text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            Get Started for Free
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShareView;

