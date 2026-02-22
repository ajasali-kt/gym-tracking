import { Link } from 'react-router-dom';

/**
 * PublicNotFound Component
 * Displays a 404 page for unauthenticated users on invalid routes
 */
function PublicNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6">
      <div className="card w-full max-w-2xl p-6 sm:p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0m-7.07 7.07a6 6 0 018.484-8.484m-9.9 9.9l12.728-12.728" />
          </svg>
        </div>

        <p className="text-sm font-semibold tracking-wide text-blue-700">Error 404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">Page Not Found</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-xl mx-auto">
          The page you requested does not exist. Please sign in or create an account to continue.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/login" className="btn-primary w-full sm:w-auto px-6">
            Sign In
          </Link>
          <Link to="/register" className="btn-secondary w-full sm:w-auto px-6">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PublicNotFound;
