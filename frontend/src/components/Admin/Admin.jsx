import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import SharesManagement from './SharesManagement';
import StatCard from '../stats/StatCard';

function iconPath(name) {
  const map = {
    muscle: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 10h2m12 0h2M7 7v6m10-6v6m-7-2h4m-6 7h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />,
    exercise: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h8M8 12h8M8 17h8M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />,
    plan: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    day: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 2v4m8-4v4M3 10h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />,
    log: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
    set: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v18m8-9H4" />
  };

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {map[name]}
    </svg>
  );
}

function Admin() {
  const [activeTab, setActiveTab] = useState('data');
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
    <div className="space-y-6">
      <div className="card p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-app-primary">System Settings</h1>
            <p className="mt-1 text-app-muted">Admin tools for database data and share links</p>
          </div>

          <div className="segmented-control self-start">
            <button
              id="admin-tab-data-button"
              onClick={() => setActiveTab('data')}
              className={`segment-btn ${activeTab === 'data' ? 'segment-btn-active' : ''}`}
            >
              Data
            </button>
            <button
              id="admin-tab-shares-button"
              onClick={() => setActiveTab('shares')}
              className={`segment-btn ${activeTab === 'shares' ? 'segment-btn-active' : ''}`}
            >
              Share Links
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-blue-500/25 bg-blue-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-100">
              <span className="font-semibold">Admin access:</span> Only users with admin role can access this page.
            </p>
          </div>
        </div>
      </div>

      {activeTab === 'shares' ? (
        <SharesManagement />
      ) : (
        <>
          <div className="card p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-app-primary">Database Statistics</h2>
              <button
                id="admin-refresh-stats-button"
                onClick={fetchStats}
                disabled={loading}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Loading..' : 'Refresh Stats'}
              </button>
            </div>

            {stats ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Muscle Groups" value={stats.muscleGroups} icon={iconPath('muscle')} />
                <StatCard label="Exercises" value={stats.exercises} icon={iconPath('exercise')} tone="green" />
                <StatCard label="Workout Plans" value={stats.workoutPlans} icon={iconPath('plan')} tone="amber" />
                <StatCard label="Workout Days" value={stats.workoutDays} icon={iconPath('day')} />
                <StatCard label="Workout Logs" value={stats.workoutLogs} icon={iconPath('log')} tone="red" />
                <StatCard label="Exercise Logs" value={stats.exerciseLogs} icon={iconPath('set')} tone="green" />
              </div>
            ) : (
              <div className="rounded-xl border border-app-subtle bg-surface p-5 text-sm text-app-muted">
                No statistics loaded yet.
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-app-primary">Import Muscle Groups</h2>
              <button
                id="admin-load-sample-muscle-groups-button"
                onClick={loadSampleMuscleGroups}
                className="text-sm font-medium text-blue-200 underline decoration-blue-400/50 hover:text-blue-100"
              >
                Load Sample JSON
              </button>
            </div>

            <p className="mt-3 text-sm text-app-muted">
              Paste JSON with format: {`{ "muscleGroups": [{ "name": "Chest", "description": "..." }] }`}
            </p>

            <textarea
              value={muscleGroupsJson}
              onChange={(e) => setMuscleGroupsJson(e.target.value)}
              placeholder='{"muscleGroups": [{"name": "Chest", "description": "Pectoral muscles"}]}'
              className="input-field mt-4 h-48 resize-y font-mono text-sm"
            />

            <div className="mt-4 flex justify-end">
              <button
                id="admin-import-muscle-groups-button"
                onClick={importMuscleGroups}
                disabled={loading || !muscleGroupsJson}
                className="btn-outline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import Muscle Groups'}
              </button>
            </div>

            {muscleGroupsResult && (
              <div className="mt-4 rounded-xl border border-app-subtle bg-surface p-4">
                <h3 className="text-sm font-semibold text-app-primary">Result</h3>
                <pre className="mt-3 overflow-x-auto text-sm text-app-muted">
                  {JSON.stringify(muscleGroupsResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-app-primary">Import Exercises</h2>
              <button
                id="admin-load-sample-exercises-button"
                onClick={loadSampleExercises}
                className="text-sm font-medium text-blue-200 underline decoration-blue-400/50 hover:text-blue-100"
              >
                Load Sample JSON
              </button>
            </div>

            <p className="mt-3 text-sm text-app-muted">
              Paste JSON with format: {`{ "exercises": [{ "name": "Bench Press", "muscleGroupName": "Chest", ... }] }`}
            </p>

            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <span className="font-semibold">Note:</span> Import muscle groups first. Exercises reference muscle groups by name.
            </div>

            <textarea
              value={exercisesJson}
              onChange={(e) => setExercisesJson(e.target.value)}
              placeholder='{"exercises": [{"name": "Bench Press", "muscleGroupName": "Chest", "description": \"...\", \"steps\": [...]}]}'
              className="input-field mt-4 h-64 resize-y font-mono text-sm"
            />

            <div className="mt-4 flex justify-end">
              <button
                id="admin-import-exercises-button"
                onClick={importExercises}
                disabled={loading || !exercisesJson}
                className="btn-outline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import Exercises'}
              </button>
            </div>

            {exercisesResult && (
              <div className="mt-4 rounded-xl border border-app-subtle bg-surface p-4">
                <h3 className="text-sm font-semibold text-app-primary">Result</h3>
                <pre className="mt-3 overflow-x-auto text-sm text-app-muted">
                  {JSON.stringify(exercisesResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="card border-red-500/30 bg-red-500/5 p-6">
            <h2 className="text-xl font-semibold text-red-300">Danger Zone</h2>
            <p className="mt-2 text-sm text-app-muted">
              This action deletes all data from the database. This cannot be undone.
            </p>
            <button
              id="admin-clear-all-data-button"
              onClick={clearAllData}
              disabled={loading}
              className="btn-red-outline mt-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Clearing...' : 'Clear All Data'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Admin;
