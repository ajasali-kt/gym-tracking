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
        <h1 className="text-3xl font-bold text-app-primary">Dashboard</h1>
        <div className="card p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-surface rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-surface rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-app-primary">Dashboard</h1>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-6">
          <p className="text-red-300 font-medium">Error: {error}</p>
          <button
            onClick={fetchTodayWorkout}
            className="mt-4 btn-outline border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/15"
          >
            Try Again
          </button>
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
          <p className="text-blue-200">
            No active workout plan? <Link to="/plans" className="underline font-medium">Create a workout plan</Link> to get started!
          </p>
        </div>
      </div>
    );
  }

  if (!todayWorkout || !todayWorkout.workoutDay) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-app-primary">Dashboard</h1>
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold text-app-primary mb-2">No Workout Scheduled Today</h2>
          <p className="text-app-muted mb-4">
            You don't have a workout planned for today, or no active workout plan exists.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/plans"
              className="btn-green-outline whitespace-nowrap"
            >
              Create Workout Plan
            </Link>
            <Link to="/log-manual" className="btn-outline whitespace-nowrap">
              Log Workout
            </Link>
          </div>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-app-primary">Dashboard</h1>
          <p className="text-sm sm:text-base text-app-muted mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/log-manual" className="inline-flex items-center justify-center btn-outline px-4 py-2 text-sm sm:text-base text-center whitespace-nowrap">
          Log Workout
        </Link>
      </div>

      {/* Today's Workout Card */}
      <div className="card overflow-hidden">
        <div className="border-b border-app-subtle bg-surface px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-xl font-bold text-app-primary sm:text-2xl">{workoutDay.dayName}</h2>
          <p className="mt-1 text-sm text-app-muted sm:text-base">
            Day {dayNumber} - {activePlanName}
            {workoutDay.muscleGroup && ` - ${workoutDay.muscleGroup.name}`}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {exercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-app-muted mb-4">No exercises added to this workout yet.</p>
              <Link
                to={`/plans/${workoutDay.planId}`}
                className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4"
              >
                Add Exercises
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-app-muted mb-4">
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
          <h3 className="text-xs sm:text-sm font-medium text-app-muted">Total Exercises</h3>
          <p className="text-2xl sm:text-3xl font-bold text-app-primary mt-1 sm:mt-2">{exercises.length}</p>
        </div>
        <div className="card p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-app-muted">Total Sets</h3>
          <p className="text-2xl sm:text-3xl font-bold text-app-primary mt-1 sm:mt-2">
            {exercises.reduce((sum, ex) => sum + ex.sets, 0)}
          </p>
        </div>
        <div className="card p-4 sm:p-6 sm:col-span-1 col-span-1">
          <h3 className="text-xs sm:text-sm font-medium text-app-muted">Estimated Time</h3>
          <p className="text-2xl sm:text-3xl font-bold text-app-primary mt-1 sm:mt-2">
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



