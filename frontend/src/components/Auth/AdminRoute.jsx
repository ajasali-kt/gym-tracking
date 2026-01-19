import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * AdminRoute Component
 * Protects routes that require admin access
 * Redirects non-admin users to the dashboard
 */
function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Not authenticated - redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Authenticated but not admin - redirect to dashboard with error message
    return <Navigate to="/" replace />;
  }

  // User is admin - allow access
  return children;
}

export default AdminRoute;
