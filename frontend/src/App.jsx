import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/shared/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Auth components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminRoute from './components/Auth/AdminRoute';

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
 * Configures routing for all pages with authentication
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes - Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Wrapped in Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
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
                    <Route path="/edit-manual/:workoutId" element={<ManualWorkoutLog />} />

                    {/* Progress Tracking */}
                    <Route path="/progress" element={<Progress />} />

                    {/* Admin Panel - Hidden route (Admin only) */}
                    <Route path="/settings/system" element={
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    } />

                    {/* Catch all - redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
