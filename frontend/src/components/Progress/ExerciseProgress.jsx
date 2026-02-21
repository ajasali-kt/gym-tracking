import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';

/**
 * Exercise Progress Component
 * Shows progress tracking for all exercises with statistics and personal records
 */
function ExerciseProgress() {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseData, setExerciseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/exercises');
      setExercises(response.data);
    } catch (err) {
      setError('Failed to load exercises');
      console.error('Error fetching exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseProgress = async (exerciseId) => {
    try {
      setLoadingDetails(true);
      const response = await apiClient.get(`/progress/exercise/${exerciseId}`);
      setExerciseData(response.data);
      setSelectedExercise(exerciseId);
    } catch (err) {
      console.error('Error fetching exercise progress:', err);
      setError('Failed to load exercise progress');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Exercise Progress</h1>
        <div className="card p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !exerciseData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Exercise Progress</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <button
            onClick={fetchExercises}
            className="mt-4 px-4 py-2 btn-danger"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Exercise Progress</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Exercises Found</h2>
          <p className="text-gray-600 mb-4">
            Create a workout plan to start tracking your progress.
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Exercise Progress</h1>
        <p className="text-gray-600 mt-1">Track your progress across all exercises</p>
      </div>

      {/* Layout: Exercise List + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise List */}
        <div className="lg:col-span-1">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
              <h2 className="text-lg font-bold text-white">Select Exercise</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => fetchExerciseProgress(exercise.id)}
                  className={`w-full p-4 text-left border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                    selectedExercise === exercise.id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <p className="font-semibold text-gray-800">{exercise.name}</p>
                  <p className="text-sm text-gray-600">{exercise.muscleGroup?.name || 'General'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exercise Details */}
        <div className="lg:col-span-2">
          {!exerciseData && !loadingDetails && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center h-full flex items-center justify-center">
              <div>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select an Exercise</h3>
                <p className="text-gray-600">Choose an exercise from the list to view its progress</p>
              </div>
            </div>
          )}

          {loadingDetails && (
            <div className="card p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}

          {exerciseData && !loadingDetails && (
            <div className="space-y-6">
              {/* Exercise Info */}
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white">{exerciseData.exercise.name}</h2>
                  <p className="text-green-100 mt-1">{exerciseData.exercise.muscleGroup?.name || 'General'}</p>
                </div>
                <div className="p-6">
                  <p className="text-gray-700">{exerciseData.exercise.description || 'No description available.'}</p>
                </div>
              </div>

              {/* Statistics */}
              {exerciseData.statistics && (
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-blue-600 font-medium">Total Sets</p>
                      <p className="text-2xl font-bold text-blue-700 mt-1">{exerciseData.statistics.totalSets}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-green-600 font-medium">Avg Weight</p>
                      <p className="text-2xl font-bold text-green-700 mt-1">{exerciseData.statistics.averageWeight} kg</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-purple-600 font-medium">Avg Reps</p>
                      <p className="text-2xl font-bold text-purple-700 mt-1">{exerciseData.statistics.averageReps}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-orange-600 font-medium">Max Weight</p>
                      <p className="text-2xl font-bold text-orange-700 mt-1">{exerciseData.statistics.maxWeight} kg</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Logs */}
              {exerciseData.logs && exerciseData.logs.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {exerciseData.logs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-10 h-10 flex items-center justify-center">
                            {log.setNumber}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {log.weightKg > 0 && <span>{log.weightKg} kg</span>}
                              {log.weightKg > 0 && log.repsCompleted > 0 && <span className="mx-1">×</span>}
                              {log.repsCompleted > 0 && <span>{log.repsCompleted} reps</span>}
                            </p>
                            <p className="text-sm text-gray-600">
                              {log.workoutLog?.workoutDay?.dayName || 'Unknown workout'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(log.workoutLog?.completedDate).toLocaleDateString()}
                          </p>
                          {log.notes && (
                            <p className="text-xs text-gray-500 italic mt-1">{log.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {exerciseData.logs && exerciseData.logs.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-600">No activity logged for this exercise yet.</p>
                  <Link
                    to="/dashboard"
                    className="inline-block mt-4 px-6 py-2 btn-primary"
                  >
                    Start Tracking
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseProgress;

