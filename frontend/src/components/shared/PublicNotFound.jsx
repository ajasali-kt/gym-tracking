import { Link } from 'react-router-dom';

/**
 * PublicNotFound Component
 * Displays a 404 page for unauthenticated users on invalid routes
 */
function PublicNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 py-12 sm:px-6">
      <div className="card w-full max-w-2xl p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-500/10 text-blue-300">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0m-7.07 7.07a6 6 0 018.484-8.484m-9.9 9.9l12.728-12.728" />
          </svg>
        </div>

        <p className="text-sm font-semibold tracking-[0.12em] text-blue-300">Error 404</p>
        <h1 className="mt-2 text-2xl font-bold text-app-primary sm:text-3xl">Page Not Found</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-app-muted sm:text-base">
          The page you requested does not exist. Please sign in or create an account to continue.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/login" className="btn-outline w-full px-6 sm:w-auto">
            Sign In
          </Link>
          <Link to="/register" className="btn-green-outline w-full px-6 sm:w-auto">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PublicNotFound;
