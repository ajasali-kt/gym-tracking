import { Navigate, useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicNotFound from '../shared/PublicNotFound';

const PROTECTED_ROUTE_PATTERNS = [
  '/',
  '/exercises',
  '/plans',
  '/plans/:id',
  '/log/:dayId',
  '/log-manual',
  '/edit-manual/:workoutId',
  '/progress',
  '/settings/system'
];

/**
 * ProtectedRoute Component
 * Wrapper component that requires authentication
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isKnownProtectedPath = PROTECTED_ROUTE_PATTERNS.some((pathPattern) =>
    matchPath({ path: pathPattern, end: true }, location.pathname)
  );

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!user) {
    if (!isKnownProtectedPath) {
      return <PublicNotFound />;
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return children;
}

export default ProtectedRoute;
