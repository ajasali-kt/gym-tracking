import { useMemo, useState } from 'react';
import { format, subDays, startOfMonth } from 'date-fns';
import { getWorkoutHistory } from '../../services/historyService';
import ShareLinkModal from './ShareLinkModal';
import { createShareLink } from '../../services/shareService';
import TimelineItem from '../History/TimelineItem';

function toDateInput(date) {
  return format(date, 'yyyy-MM-dd');
}

function HistorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="card h-40 bg-surface" />
      <div className="card h-24 bg-surface" />
      <div className="card h-48 bg-surface" />
    </div>
  );
}

function Heatmap({ workouts }) {
  const counts = workouts.reduce((acc, workout) => {
    const key = toDateInput(new Date(workout.date));
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const days = [...Array(35)].map((_, index) => {
    const date = subDays(new Date(), 34 - index);
    const key = toDateInput(date);
    return { key, count: counts[key] || 0 };
  });

  return (
    <div className="card p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.12em] text-app-muted">Workout Frequency</p>
      <div className="grid grid-cols-7 gap-2 sm:grid-cols-7">
        {days.map((day) => (
          <div
            key={day.key}
            title={`${day.key}: ${day.count} workout(s)`}
            className="h-7 rounded-md border border-app-subtle"
            style={{
              backgroundColor: day.count === 0 ? '#1E1E25' : day.count === 1 ? '#1D4ED8' : day.count === 2 ? '#2563EB' : '#3B82F6'
            }}
          />
        ))}
      </div>
    </div>
  );
}

function History() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);

  const presets = [
    { key: '7days', label: '7D' },
    { key: '30days', label: '30D' },
    { key: '90days', label: '90D' },
    { key: 'thisMonth', label: 'This Month' }
  ];

  const applyPreset = (preset) => {
    const today = new Date();
    let from;

    if (preset === '7days') from = subDays(today, 7);
    if (preset === '30days') from = subDays(today, 30);
    if (preset === '90days') from = subDays(today, 90);
    if (preset === 'thisMonth') from = startOfMonth(today);

    setFromDate(toDateInput(from));
    setToDate(toDateInput(today));
    setSelectedPreset(preset);
    setHistoryData(null);
    setError(null);
    setShareData(null);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setSelectedPreset(null);
    setHistoryData(null);
    setError(null);
    setShareData(null);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setSelectedPreset(null);
    setHistoryData(null);
    setError(null);
    setShareData(null);
  };

  const handleViewHistory = async () => {
    if (!fromDate || !toDate) {
      setError('Select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getWorkoutHistory(fromDate, toDate);
      setHistoryData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workout history');
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
    }
  };

  const summary = useMemo(() => {
    if (!historyData) return null;
    return [
      { label: 'Total Workouts', value: historyData.totalWorkouts || 0 },
      { label: 'Total Sets', value: historyData.totalSets || 0 },
      { label: 'Total Volume', value: `${Math.round(historyData.totalVolume || 0)} kg` }
    ];
  }, [historyData]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Timeline</p>
        <h1 className="text-3xl font-bold text-app-primary">Workout History</h1>
      </div>

      <section className="card p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.key}
              id={`history-preset-${preset.key}-button`}
              onClick={() => applyPreset(preset.key)}
              className={`pill-btn ${selectedPreset === preset.key ? 'border-blue-500 text-blue-300 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]' : ''}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="fromDate" className="label">From Date</label>
            <input id="fromDate" type="date" value={fromDate} onChange={(e) => handleFromDateChange(e.target.value)} className="input-field" />
          </div>
          <div>
            <label htmlFor="toDate" className="label">To Date</label>
            <input id="toDate" type="date" value={toDate} onChange={(e) => handleToDateChange(e.target.value)} className="input-field" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="history-view-button"
            onClick={handleViewHistory}
            disabled={loading}
            className="btn-outline border-blue-500/50 bg-transparent text-blue-300 hover:bg-blue-500/10 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'View History'}
          </button>
          {historyData?.totalWorkouts > 0 && (
            <button
              id="history-generate-share-link-button"
              onClick={() => setShowShareModal(true)}
              className="btn-outline border-green-500/50 bg-transparent text-green-300 hover:bg-green-500/10"
            >
              Generate Share Link
            </button>
          )}
        </div>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      </section>

      {loading && <HistorySkeleton />}

      {!loading && historyData && (
        <>
          {(historyData.workouts || []).length === 0 ? (
            <section className="timeline-container">
              <div className="card p-8 text-center text-app-muted">No workouts in this range.</div>
            </section>
          ) : (
            <>
              {summary && (
                <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {summary.map((item) => (
                    <div key={item.label} className="card p-4">
                      <p className="text-xs text-app-muted">{item.label}</p>
                      <p className="mt-2 text-2xl font-bold text-app-primary">{item.value}</p>
                    </div>
                  ))}
                </section>
              )}

              <Heatmap workouts={historyData.workouts || []} />

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-app-primary">Recent Workouts</h2>
                  <p className="text-xs text-app-muted">{historyData.workouts.length} sessions</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {historyData.workouts.map((workout, index) => (
                    <TimelineItem key={`${workout.date}-${index}`} workout={workout} />
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      )}

      {showShareModal && (
        <ShareLinkModal
          fromDate={fromDate}
          toDate={toDate}
          shareData={shareData}
          onClose={() => {
            setShowShareModal(false);
            setShareData(null);
          }}
          onGenerate={handleGenerateShare}
        />
      )}
    </div>
  );
}

export default History;
