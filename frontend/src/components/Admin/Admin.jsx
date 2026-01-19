import { useState, useEffect } from 'react';
import apiClient from '../../services/api';

function Admin() {
  const [muscleGroupsJson, setMuscleGroupsJson] = useState('');
  const [exercisesJson, setExercisesJson] = useState('');
  const [muscleGroupsResult, setMuscleGroupsResult] = useState(null);
  const [exercisesResult, setExercisesResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch database stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert('Failed to fetch stats: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Import muscle groups
  const importMuscleGroups = async () => {
    try {
      setLoading(true);
      setMuscleGroupsResult(null);

      const data = JSON.parse(muscleGroupsJson);
      const response = await apiClient.post('/admin/import/muscle-groups', data);

      setMuscleGroupsResult(response.data);
      alert(response.data.message);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error importing muscle groups:', error);
      if (error instanceof SyntaxError) {
        alert('Invalid JSON format. Please check your input.');
      } else {
        alert('Failed to import: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Import exercises
  const importExercises = async () => {
    try {
      setLoading(true);
      setExercisesResult(null);

      const data = JSON.parse(exercisesJson);
      const response = await apiClient.post('/admin/import/exercises', data);

      setExercisesResult(response.data);
      alert(response.data.message);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error importing exercises:', error);
      if (error instanceof SyntaxError) {
        alert('Invalid JSON format. Please check your input.');
      } else {
        alert('Failed to import: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear all data
  const clearAllData = async () => {
    if (!confirm('Are you sure you want to delete ALL data? This action cannot be undone!')) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.delete('/admin/clear/all');
      alert('All data cleared successfully');
      setStats(null);
      fetchStats();
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Load sample muscle groups JSON
  const loadSampleMuscleGroups = () => {
    const sample = {
      muscleGroups: [
        {
          name: "Chest",
          description: "Pectoral muscles"
        },
        {
          name: "Back",
          description: "Latissimus dorsi, trapezius, rhomboids"
        },
        {
          name: "Legs",
          description: "Quadriceps, hamstrings, glutes, calves"
        }
      ]
    };
    setMuscleGroupsJson(JSON.stringify(sample, null, 2));
  };

  // Load sample exercises JSON
  const loadSampleExercises = () => {
    const sample = {
      exercises: [
        {
          name: "Bench Press",
          muscleGroupName: "Chest",
          description: "Compound chest exercise performed on a flat bench",
          steps: [
            "Lie flat on bench with feet on floor",
            "Grip bar slightly wider than shoulder width",
            "Lower bar to mid-chest",
            "Press bar up until arms are fully extended"
          ],
          youtubeUrl: "https://www.youtube.com/watch?v=example"
        },
        {
          name: "Pull-ups",
          muscleGroupName: "Back",
          description: "Bodyweight exercise targeting the back muscles",
          steps: [
            "Hang from pull-up bar with overhand grip",
            "Pull yourself up until chin is above bar",
            "Lower yourself back down with control"
          ],
          youtubeUrl: null
        }
      ]
    };
    setExercisesJson(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600 mb-4">Import muscle groups and exercises from JSON</p>

          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Admin Panel:</strong> This panel is protected by role-based authentication. Only admin users can access this page.
                </p>
              </div>
            </div>
          </div>

          {/* Database Stats */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Database Statistics</h2>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh Stats'}
              </button>
            </div>

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Muscle Groups</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.muscleGroups}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Exercises</p>
                  <p className="text-2xl font-bold text-green-600">{stats.exercises}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Workout Plans</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.workoutPlans}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Workout Days</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.workoutDays}</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Workout Logs</p>
                  <p className="text-2xl font-bold text-pink-600">{stats.workoutLogs}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Exercise Logs</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.exerciseLogs}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Import Muscle Groups */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Import Muscle Groups</h2>
            <button
              onClick={loadSampleMuscleGroups}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Load Sample JSON
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Paste JSON with format: {`{ "muscleGroups": [{ "name": "Chest", "description": "..." }] }`}
          </p>

          <textarea
            value={muscleGroupsJson}
            onChange={(e) => setMuscleGroupsJson(e.target.value)}
            placeholder='{"muscleGroups": [{"name": "Chest", "description": "Pectoral muscles"}]}'
            className="w-full h-48 p-3 border border-gray-300 rounded-md font-mono text-sm mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={importMuscleGroups}
            disabled={loading || !muscleGroupsJson}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
          >
            {loading ? 'Importing...' : 'Import Muscle Groups'}
          </button>

          {muscleGroupsResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2 text-gray-900">Result:</h3>
              <pre className="text-sm overflow-x-auto text-gray-700">
                {JSON.stringify(muscleGroupsResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Import Exercises */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Import Exercises</h2>
            <button
              onClick={loadSampleExercises}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Load Sample JSON
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Paste JSON with format: {`{ "exercises": [{ "name": "Bench Press", "muscleGroupName": "Chest", ... }] }`}
          </p>

          <p className="text-xs text-yellow-700 mb-4 bg-yellow-50 p-2 rounded">
            <strong>Note:</strong> Import muscle groups first! Exercises reference muscle groups by name.
          </p>

          <textarea
            value={exercisesJson}
            onChange={(e) => setExercisesJson(e.target.value)}
            placeholder='{"exercises": [{"name": "Bench Press", "muscleGroupName": "Chest", "description": "...", "steps": [...]}]}'
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={importExercises}
            disabled={loading || !exercisesJson}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
          >
            {loading ? 'Importing...' : 'Import Exercises'}
          </button>

          {exercisesResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2 text-gray-900">Result:</h3>
              <pre className="text-sm overflow-x-auto text-gray-700">
                {JSON.stringify(exercisesResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            This action will delete all data from the database. This cannot be undone!
          </p>
          <button
            onClick={clearAllData}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors font-semibold"
          >
            {loading ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin;
