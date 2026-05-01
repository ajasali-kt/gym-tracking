import { Link } from 'react-router-dom';

/**
 * NotFound Component
 * Displays a 404 error page for invalid routes
 */
const errorContent = {
  401: {
    title: 'Unauthorized Access',
    message: 'You are not authorized to access this page or the link may be invalid.'
  },
  404: {
    title: 'Page Not Found',
    message: 'The page you are trying to access does not exist or the link may be outdated.'
  }
};

function NotFound({ errorCode = '404' }) {
  const content = errorContent[errorCode] || errorContent[404];

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-8 sm:px-6">
      <div className="card mx-auto w-full max-w-2xl p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-500/10 text-blue-300">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0m-7.07 7.07a6 6 0 018.484-8.484m-9.9 9.9l12.728-12.728" />
          </svg>
        </div>

        <p className="text-sm font-semibold tracking-[0.12em] text-blue-300">Error {errorCode}</p>
        <h1 className="mt-2 text-2xl font-bold text-app-primary sm:text-3xl">{content.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-app-muted sm:text-base">
          {content.message}
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-outline w-full px-6 sm:w-auto">
            Go to Dashboard
          </Link>
          <Link to="/plans" className="btn-green-outline w-full px-6 sm:w-auto">
            View Workout Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
