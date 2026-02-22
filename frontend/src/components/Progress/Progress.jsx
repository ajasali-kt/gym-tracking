import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import progressService from '../../services/progressService';
import exerciseService from '../../services/exerciseService';
import History from '../History/History';
import useAccessibleModal from '../../hooks/useAccessibleModal';

/**
 * Progress Component
 * View workout history and progress charts
 */
function Progress() {
  const [view, setView] = useState('history'); // 'history' or 'exercise'
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(30); // Last 30 days

  // Share Progress Modal state
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  useEffect(() => {
    if (selectedExercise) {
      fetchExerciseProgress();
    }
  }, [selectedExercise]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [historyData, exercisesData] = await Promise.all([
        progressService.getRecentWorkouts(50), // Use recent workouts to get full exercise logs
        exerciseService.getAllExercises()
      ]);
      setWorkoutHistory(historyData);
      setExercises(exercisesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress data');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseProgress = async () => {
    try {
      const data = await progressService.getExerciseProgress(selectedExercise.id, { limit: 20 });
      // Backend returns { exercise, logs, statistics }
      setExerciseProgress(data.logs || []);
    } catch (err) {
      console.error('Error fetching exercise progress:', err);
      setExerciseProgress([]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Progress Tracking</h1>
        <div className="card p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Progress Tracking</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <button
            onClick={fetchData}
            className="mt-4 btn-danger"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Progress Tracking</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link
              to="/log-manual"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition text-sm sm:text-base"
            >
              + Log Manual Workout
            </Link>
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition text-sm sm:text-base"
            >
              📜 Share Progress
            </button>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(parseInt(e.target.value))}
              className="input-field w-full sm:w-auto sm:min-w-[170px]"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {/* View Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setView('history')}
                className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base ${
                  view === 'history'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="hidden sm:inline">Workout History</span>
                <span className="sm:hidden">History</span>
              </button>
              <button
                onClick={() => setView('exercise')}
                className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base ${
                  view === 'exercise'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="hidden sm:inline">Exercise Progress</span>
                <span className="sm:hidden">Progress</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {view === 'history' ? (
              <WorkoutHistoryView workouts={workoutHistory} />
            ) : (
              <ExerciseProgressView
                exercises={exercises}
                selectedExercise={selectedExercise}
                onSelectExercise={setSelectedExercise}
                progressData={exerciseProgress}
              />
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Workouts</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{workoutHistory.length}</p>
            <p className="text-sm text-gray-500 mt-1">In last {dateRange} days</p>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600">Exercises Tracked</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{exercises.length}</p>
            <p className="text-sm text-gray-500 mt-1">In library</p>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600">Consistency</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {dateRange > 0 ? Math.round((workoutHistory.length / dateRange) * 7) : 0}x/week
            </p>
            <p className="text-sm text-gray-500 mt-1">Average frequency</p>
          </div>
        </div>
      </div>

      {/* Share Progress Modal */}
      {showShareModal && (
        <ShareProgressModal onClose={() => setShowShareModal(false)} />
      )}
    </>
  );
}

/**
 * Share Progress Modal Component
 * Modal wrapper for the History component following app modal pattern
 */
function ShareProgressModal({ onClose }) {
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  useAccessibleModal({ isOpen: true, onClose, modalRef, initialFocusRef: closeBtnRef });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-progress-title"
        tabIndex={-1}
        className="card max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-3 sm:py-4 text-white flex justify-between items-start rounded-t-lg flex-shrink-0">
          <div>
            <h2 id="share-progress-title" className="text-xl sm:text-2xl font-bold">Workout History</h2>
            <p className="text-purple-100 mt-1 text-sm hidden sm:block">
              View and share your workout history for any date range
            </p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="text-white hover:text-gray-200 transition p-1"
            aria-label="Close workout history dialog"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          <History />
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end flex-shrink-0">
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
}

/**
 * Workout History View Component
 * Displays list of completed workouts
 */
function WorkoutHistoryView({ workouts }) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Workouts Logged Yet</h3>
        <p className="text-gray-600 mb-4">
          Start tracking your workouts to see your progress here.
        </p>
        <Link
          to="/"
          className="inline-block btn-primary px-6"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Workouts ({workouts.length})
      </h2>

      {workouts.map((workout) => (
        <WorkoutHistoryCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}

/**
 * Workout History Card Component
 */
function WorkoutHistoryCard({ workout }) {
  const [expanded, setExpanded] = useState(false);
  const isManualWorkout = workout.isManual || !workout.workoutDay;
  const workoutTitle = isManualWorkout
    ? (workout.workoutName || 'Manual Workout')
    : (workout.workoutDay?.dayName || 'Workout');

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
      <div
        className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 text-white rounded-lg flex items-center justify-center ${
            isManualWorkout ? 'bg-purple-600' : 'bg-green-600'
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-800">{workoutTitle}</h4>
              {isManualWorkout && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                  Manual
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {format(parseISO(workout.completedDate), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-xs text-gray-600">Exercises</p>
            <p className="font-bold text-gray-800">
              {workout.exerciseLogs?.length > 0
                ? new Set(workout.exerciseLogs.map(log => log.exercise.id)).size
                : 0}
            </p>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-white border-t border-gray-200">
          {workout.notes && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700"><strong>Notes:</strong> {workout.notes}</p>
            </div>
          )}

          {isManualWorkout && (
            <div className="mb-4">
              <Link
                to={`/edit-manual/${workout.id}`}
                className="inline-flex items-center btn-primary transition text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Workout
              </Link>
            </div>
          )}

          <h5 className="font-semibold text-gray-800 mb-3">Exercise Details</h5>
          <div className="space-y-3">
            {workout.exerciseLogs && workout.exerciseLogs.length > 0 ? (
              Object.values(
                workout.exerciseLogs.reduce((acc, log) => {
                  const exerciseId = log.exercise.id;
                  if (!acc[exerciseId]) {
                    acc[exerciseId] = {
                      exercise: log.exercise,
                      sets: []
                    };
                  }
                  acc[exerciseId].sets.push(log);
                  return acc;
                }, {})
              ).map(({ exercise, sets }) => (
                <div key={exercise.id} className="bg-gray-50 rounded-lg p-3">
                  <h6 className="font-semibold text-gray-800 mb-2">{exercise.name}</h6>
                  <div className="grid grid-cols-1 gap-2">
                    {sets.sort((a, b) => a.setNumber - b.setNumber).map((set) => (
                      <div key={set.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Set {set.setNumber}</span>
                        <span className="font-medium text-gray-800">
                          {set.repsCompleted} reps × {set.weightKg} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No exercise logs found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Exercise Progress View Component
 * Select an exercise and view progress over time
 */
function ExerciseProgressView({ exercises, selectedExercise, onSelectExercise, progressData }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedExercise) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select an Exercise to View Progress
          </label>
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field mb-3"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredExercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => onSelectExercise(exercise)}
                className="text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
              >
                <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
                <p className="text-sm text-gray-600">{exercise.muscleGroup?.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Use workout completion date when available (supports backdated/manual logs)
  const getLogDate = (log) => log?.workoutLog?.completedDate || log.createdAt;

  // Prepare chart data
  const chartData = progressData.map(log => ({
    date: format(parseISO(getLogDate(log)), 'MMM d'),
    weight: parseFloat(log.weightKg),
    reps: log.repsCompleted,
    volume: parseFloat(log.weightKg) * log.repsCompleted
  })).reverse();

  const maxWeight = progressData.length > 0
    ? Math.max(...progressData.map(log => parseFloat(log.weightKg)))
    : 0;

  const totalVolume = progressData.reduce((sum, log) =>
    sum + (parseFloat(log.weightKg) * log.repsCompleted), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{selectedExercise.name}</h2>
          <p className="text-gray-600">{selectedExercise.muscleGroup?.name}</p>
        </div>
        <button
          onClick={() => onSelectExercise(null)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Change Exercise
        </button>
      </div>

      {progressData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">No progress data for this exercise yet.</p>
          <p className="text-sm text-gray-500">Start logging workouts to see your progress!</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800">Personal Record</h3>
              <p className="text-2xl font-bold text-blue-900 mt-1">{maxWeight} kg</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800">Total Sets Logged</h3>
              <p className="text-2xl font-bold text-green-900 mt-1">{progressData.length}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800">Total Volume</h3>
              <p className="text-2xl font-bold text-purple-900 mt-1">{totalVolume.toLocaleString()} kg</p>
            </div>
          </div>

          {/* Weight Progression Chart */}
          {chartData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Weight Progression</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Weight (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Volume Chart */}
          {chartData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Volume Progression</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Volume (kg × reps)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Sets Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Sets</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Set #</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Reps</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Weight</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Volume</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {progressData.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">
                        {format(parseISO(getLogDate(log)), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{log.setNumber}</td>
                      <td className="px-4 py-3 text-gray-800">{log.repsCompleted}</td>
                      <td className="px-4 py-3 text-gray-800">{log.weightKg} kg</td>
                      <td className="px-4 py-3 text-gray-800">
                        {(parseFloat(log.weightKg) * log.repsCompleted).toFixed(1)} kg
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {log.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Progress;


