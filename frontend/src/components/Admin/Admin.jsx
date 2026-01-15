import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [muscleGroupsJson, setMuscleGroupsJson] = useState('');
  const [exercisesJson, setExercisesJson] = useState('');
  const [muscleGroupsResult, setMuscleGroupsResult] = useState(null);
  const [exercisesResult, setExercisesResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  // Fetch database stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert('Failed to fetch stats: ' + error.message);
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
      const response = await axios.post(`${API_URL}/admin/import/muscle-groups`, data);

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
      const response = await axios.post(`${API_URL}/admin/import/exercises`, data);

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
      await axios.delete(`${API_URL}/admin/clear/all`);
      alert('All data cleared successfully');
      setStats(null);
      fetchStats();
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data: ' + error.message);
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

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Admin Panel</h1>
            <p className="text-gray-600 mb-6 text-center">Enter password to continue</p>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600 mb-4">Import muscle groups and exercises from JSON</p>

          {/* Warning Banner */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> This panel has no authentication. Do not expose in production without adding proper security.
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
