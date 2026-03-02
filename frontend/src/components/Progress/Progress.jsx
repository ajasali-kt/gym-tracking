import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import progressService from '../../services/progressService';
import exerciseService from '../../services/exerciseService';
import StatCard from '../stats/StatCard';
import ExerciseTrendChart from '../charts/ExerciseTrendChart';

function iconPath(name) {
  const map = {
    dumbbell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 10h2m12 0h2M7 7v6m10-6v6m-7-2h4m-6 7h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 2v4m8-4v4M3 10h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />,
    bolt: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m13 2-8 11h6l-1 9 9-12h-6l0-8Z" />,
    flame: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 2c1.2 3-1.5 4.6-1.5 7.3 0 1.8 1.3 3.2 3 3.2 2 0 3.5-1.7 3.5-4.2 2 2.1 3 4.4 3 7.2A8 8 0 1 1 6 9.9c0-2.3.8-4.4 2.4-6.3.3 1.8 1.5 3.2 3.6 3.2z" />
  };

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {map[name]}
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="card h-32 bg-surface" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card h-96 xl:col-span-2 bg-surface" />
        <div className="card h-96 bg-surface" />
      </div>
      <div className="card h-48 bg-surface" />
    </div>
  );
}

function getWorkoutVolume(workout) {
  return (workout.exerciseLogs || []).reduce(
    (sum, set) => sum + ((Number.parseFloat(set.weightKg) || 0) * (Number.parseInt(set.repsCompleted, 10) || 0)),
    0
  );
}

function Progress() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [metric, setMetric] = useState('weight');
  const [deletingWorkoutId, setDeletingWorkoutId] = useState(null);

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      fetchExerciseProgress(selectedExercise.id);
    }
  }, [selectedExercise]);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, recentData, exercisesData] = await Promise.all([
        progressService.getWorkoutStats(),
        progressService.getRecentWorkouts(20),
        exerciseService.getAllExercises()
      ]);

      setStats(statsData?.statistics || null);
      setRecentWorkouts(recentData || []);
      setExercises(exercisesData || []);

      if (exercisesData?.length > 0) {
        setSelectedExercise(exercisesData[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseProgress = async (exerciseId) => {
    try {
      const response = await progressService.getExerciseProgress(exerciseId, { limit: 20 });
      setExerciseProgress(response?.logs || []);
    } catch {
      setExerciseProgress([]);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!confirm('Delete this workout log? This cannot be undone.')) {
      return;
    }

    try {
      setDeletingWorkoutId(workoutId);
      await progressService.deleteWorkoutLog(workoutId);
      await fetchInitial();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workout');
    } finally {
      setDeletingWorkoutId(null);
    }
  };

  const workoutsThisMonth = useMemo(() => {
    const now = new Date();
    return recentWorkouts.filter((workout) => {
      const date = new Date(workout.completedDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  }, [recentWorkouts]);

  const chartData = useMemo(() => {
    return [...exerciseProgress].reverse().map((log) => {
      const sourceDate = log?.workoutLog?.completedDate || log.createdAt;
      const weight = Number.parseFloat(log.weightKg) || 0;
      const reps = Number.parseInt(log.repsCompleted, 10) || 0;
      return {
        date: format(parseISO(sourceDate), 'MMM d'),
        weight,
        reps,
        volume: weight * reps
      };
    });
  }, [exerciseProgress]);

  const selectedExerciseLogsByWorkout = useMemo(() => {
    const grouped = new Map();

    exerciseProgress.forEach((log) => {
      const workoutLogId = log.workoutLog?.id;
      if (!workoutLogId) return;

      const date = log.workoutLog?.completedDate || log.createdAt;
      const workoutName = log.workoutLog?.workoutName || log.workoutLog?.workoutDay?.dayName || 'Workout';
      const reps = Number.parseInt(log.repsCompleted, 10) || 0;
      const weight = Number.parseFloat(log.weightKg) || 0;
      const volume = reps * weight;

      if (!grouped.has(workoutLogId)) {
        grouped.set(workoutLogId, {
          workoutLogId,
          date,
          workoutName,
          totalVolume: 0,
          sets: []
        });
      }

      const group = grouped.get(workoutLogId);
      group.totalVolume += volume;
      group.sets.push({
        id: log.id,
        setNumber: log.setNumber,
        reps,
        weight,
        notes: log.notes
      });
    });

    return Array.from(grouped.values())
      .map((group) => ({
        ...group,
        sets: group.sets.sort((a, b) => a.setNumber - b.setNumber)
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [exerciseProgress]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="card p-6">
        <p className="text-error">{error}</p>
        <button className="btn-primary mt-4" onClick={fetchInitial}>Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Performance</p>
          <h1 className="text-3xl font-bold text-app-primary">Progress Tracking</h1>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Workouts" value={stats?.totalWorkouts || 0} icon={iconPath('dumbbell')} />
        <StatCard label="Workouts This Month" value={workoutsThisMonth} icon={iconPath('calendar')} tone="amber" />
        <StatCard label="Total Volume" value={`${Math.round(stats?.totalVolume || 0).toLocaleString()} kg`} icon={iconPath('bolt')} tone="green" />
        <StatCard label="Current Streak" value={`${stats?.currentStreak || 0} days`} icon={iconPath('flame')} tone="red" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-5 sm:p-6">
          <label className="label">Exercise</label>
          <select
            value={selectedExercise?.id || ''}
            onChange={(e) => {
              const id = Number.parseInt(e.target.value, 10);
              const matched = exercises.find((exercise) => exercise.id === id);
              setSelectedExercise(matched || null);
            }}
            className="input-field"
          >
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-app-subtle bg-surface p-4">
              <p className="text-xs text-app-muted">Tracked Sets</p>
              <p className="text-2xl font-bold text-app-primary">{exerciseProgress.length}</p>
            </div>
            <div className="rounded-xl border border-app-subtle bg-surface p-4">
              <p className="text-xs text-app-muted">Best Weight</p>
              <p className="text-2xl font-bold text-app-primary">
                {exerciseProgress.length > 0 ? Math.max(...exerciseProgress.map((log) => Number.parseFloat(log.weightKg) || 0)) : 0} kg
              </p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <ExerciseTrendChart data={chartData} metric={metric} onMetricChange={setMetric} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-app-primary">
            {selectedExercise ? `${selectedExercise.name} Recent Workouts` : 'Exercise Recent Workouts'}
          </h2>
          <p className="text-xs text-app-muted">{selectedExerciseLogsByWorkout.length} logs</p>
        </div>

        {!selectedExercise ? (
          <div className="card p-6 text-app-muted">Select an exercise to view its recent workout entries.</div>
        ) : selectedExerciseLogsByWorkout.length === 0 ? (
          <div className="card p-6 text-app-muted">No logs found yet for this exercise.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {selectedExerciseLogsByWorkout.slice(0, 10).map((group) => {
              return (
                <article key={group.workoutLogId} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-app-muted">{format(parseISO(group.date), 'EEEE, MMM d')}</p>
                      <h3 className="mt-1 text-lg font-semibold text-app-primary">{group.workoutName}</h3>
                      <p className="text-sm text-app-muted">{group.sets.length} sets</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-app-muted">Volume</p>
                      <p className="text-base font-semibold text-app-primary">{Math.round(group.totalVolume)} kg</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {group.sets.map((set) => (
                      <div key={set.id} className="rounded-lg border border-app-subtle bg-surface px-3 py-2 text-sm text-app-primary">
                        <div className="grid grid-cols-4 gap-2">
                          <span>Set {set.setNumber}</span>
                          <span>{set.reps} reps</span>
                          <span>{set.weight} kg</span>
                          <span>{Math.round(set.reps * set.weight)} volume</span>
                        </div>
                        {set.notes && <p className="mt-1">{set.notes}</p>}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-app-primary">Recent Workouts</h2>
          <p className="text-xs text-app-muted">{recentWorkouts.length} sessions</p>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="card p-8 text-center text-app-muted">No workouts logged yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {recentWorkouts.map((workout) => {
              const volume = getWorkoutVolume(workout);
              const exerciseCount = new Set((workout.exerciseLogs || []).map((set) => set.exerciseId)).size;

              return (
                <article key={workout.id} className="card p-4 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/50">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-app-muted">{format(parseISO(workout.completedDate), 'EEEE, MMM d')}</p>
                      <h3 className="mt-1 text-lg font-semibold text-app-primary">{workout.workoutName || workout.workoutDay?.dayName || 'Workout'}</h3>
                      <p className="text-sm text-app-muted">{exerciseCount} exercises</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-app-muted">Volume</p>
                      <p className="text-base font-semibold text-app-primary">{Math.round(volume)} kg</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(workout.exerciseLogs || []).slice(0, 4).map((set) => (
                      <span key={set.id} className="rounded-lg border border-app-subtle bg-surface px-2 py-1 text-xs text-app-muted">
                        {set.exercise?.name}: {set.repsCompleted}x{set.weightKg}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-app-subtle pt-3">
                    <Link to={`/edit-manual/${workout.id}`} className="btn-outline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="btn-outline border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/15 disabled:opacity-60"
                      disabled={deletingWorkoutId === workout.id}
                    >
                      {deletingWorkoutId === workout.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Progress;
