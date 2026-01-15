import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/shared/Layout';

// Page imports - these will be created in Phase 5
import Dashboard from './components/Dashboard/Dashboard';
import ExerciseLibrary from './components/ExerciseLibrary/ExerciseLibrary';
import WorkoutPlanList from './components/WorkoutPlan/WorkoutPlanList';
import WorkoutPlanDetail from './components/WorkoutPlan/WorkoutPlanDetail';
import WorkoutLogger from './components/Logging/WorkoutLogger';
import ManualWorkoutLog from './components/Logging/ManualWorkoutLog';
import Progress from './components/Progress/Progress';
import Admin from './components/Admin/Admin';

/**
 * Main Application Component
 * Configures routing for all pages
 */
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Dashboard - Home page showing today's workout */}
          <Route path="/" element={<Dashboard />} />

          {/* Exercise Library - Browse and manage exercises */}
          <Route path="/exercises" element={<ExerciseLibrary />} />

          {/* Workout Plans */}
          <Route path="/plans" element={<WorkoutPlanList />} />
          <Route path="/plans/:id" element={<WorkoutPlanDetail />} />

          {/* Workout Logging */}
          <Route path="/log/:dayId" element={<WorkoutLogger />} />
          <Route path="/log-manual" element={<ManualWorkoutLog />} />

          {/* Progress Tracking */}
          <Route path="/progress" element={<Progress />} />

          {/* Admin Panel */}
          <Route path="/admin-ajas" element={<Admin />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
