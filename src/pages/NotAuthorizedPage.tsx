import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/routeConstants';

/**
 * Page displayed when user attempts to access a route they don't have permission for
 * Typically shown when non-admin users try to access admin routes
 */
export function NotAuthorizedPage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body text-center">
          <div className="text-6xl mb-4" aria-hidden="true">
            🚫
          </div>
          <h1 className="card-title text-2xl font-bold justify-center mb-2">
            Access Denied
          </h1>
          <p className="text-base-content/70 mb-6">
            You don't have permission to access this page.
            Please contact an administrator if you believe this is an error.
          </p>
          <div className="alert alert-warning mb-6" role="alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>This area requires administrator privileges.</span>
          </div>
          <Link to={ROUTES.DASHBOARD} className="btn btn-primary w-full">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
