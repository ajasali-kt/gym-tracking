import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import workoutService from '../../services/workoutService';
import ExerciseTracker from './ExerciseTracker';

/**
 * Dashboard Component
 * Main page showing today's workout overview
 */
function Dashboard() {
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workoutLogId, setWorkoutLogId] = useState(null);
  const [workoutLogData, setWorkoutLogData] = useState(null); // Store the full workout log data
  const hasFetchedRef = useRef(false);
  const creatingWorkoutLogPromiseRef = useRef(null);
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    // Prevent double fetch in React StrictMode during development
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchTodayWorkout();
  }, []);

  const fetchTodayWorkout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the new consolidated endpoint - single API call instead of 3!
      const data = await workoutService.getTodayWorkoutWithLog(todayDate);
      setTodayWorkout(data);

      // If there's an existing workout log, set it up
      if (data?.workoutLog) {
        setWorkoutLogId(data.workoutLog.id);
        setWorkoutLogData(data.workoutLog);
        console.log('Found existing workout log for today:', data.workoutLog.id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load today\'s workout');
      console.error('Error fetching today\'s workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const ensureWorkoutLog = async () => {
    if (workoutLogId) {
      return workoutLogId;
    }

    if (!todayWorkout?.workoutDay?.id) {
      return null;
    }

    if (creatingWorkoutLogPromiseRef.current) {
      return creatingWorkoutLogPromiseRef.current;
    }

    creatingWorkoutLogPromiseRef.current = workoutService
      .startWorkoutLog(todayWorkout.workoutDay.id, todayDate)
      .then((log) => {
        setWorkoutLogId(log.id);
        setWorkoutLogData((previous) => previous || { id: log.id, exerciseLogs: [] });
        return log.id;
      })
      .catch((err) => {
        console.error('Error creating workout log:', err);
        setError('Failed to autosave workout. Please try again.');
        return null;
      })
      .finally(() => {
        creatingWorkoutLogPromiseRef.current = null;
      });

    return creatingWorkoutLogPromiseRef.current;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
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
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <button
            onClick={fetchTodayWorkout}
            className="mt-4 px-4 py-2 btn-danger"
          >
            Try Again
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800">
            No active workout plan? <Link to="/plans" className="underline font-medium">Create a workout plan</Link> to get started!
          </p>
        </div>
      </div>
    );
  }

  if (!todayWorkout || !todayWorkout.workoutDay) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Workout Scheduled Today</h2>
          <p className="text-gray-600 mb-4">
            You don't have a workout planned for today, or no active workout plan exists.
          </p>
          <Link
            to="/plans"
            className="inline-block px-6 py-2 btn-primary"
          >
            Create Workout Plan
          </Link>
        </div>
      </div>
    );
  }

  const { workoutDay, dayNumber, activePlanName } = todayWorkout;
  const exercises = workoutDay.workoutDayExercises || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        {workoutLogId && (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm sm:text-base">Workout In Progress</span>
          </div>
        )}
      </div>

      {/* Today's Workout Card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 text-white">
          <h2 className="text-xl sm:text-2xl font-bold">{workoutDay.dayName}</h2>
          <p className="text-blue-100 mt-1 text-sm sm:text-base">
            Day {dayNumber} - {activePlanName}
            {workoutDay.muscleGroup && ` • ${workoutDay.muscleGroup.name}`}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {exercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No exercises added to this workout yet.</p>
              <Link
                to={`/plans/${workoutDay.planId}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Add Exercises
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} planned for today
              </p>

              {exercises.map((assignment, index) => (
                <ExerciseCard
                  key={assignment.id}
                  assignment={assignment}
                  index={index}
                  workoutLogId={workoutLogId}
                  workoutLogData={workoutLogData}
                  ensureWorkoutLog={ensureWorkoutLog}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Exercises</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{exercises.length}</p>
        </div>
        <div className="card p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Sets</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
            {exercises.reduce((sum, ex) => sum + ex.sets, 0)}
          </p>
        </div>
        <div className="card p-4 sm:p-6 sm:col-span-1 col-span-1">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Estimated Time</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
            {Math.round(exercises.reduce((sum, ex) => sum + (ex.sets * ex.restSeconds / 60), 0))} min
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Exercise Card Component
 * Wrapper for ExerciseTracker
 */
function ExerciseCard({ assignment, index, workoutLogId, workoutLogData, ensureWorkoutLog }) {
  const exercise = assignment.exercise;

  return (
    <ExerciseTracker
      exercise={exercise}
      assignment={{ ...assignment, order: index + 1 }}
      workoutLogId={workoutLogId}
      workoutLogData={workoutLogData}
      ensureWorkoutLog={ensureWorkoutLog}
    />
  );
}

export default Dashboard;


