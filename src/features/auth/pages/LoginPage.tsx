import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { user, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);

  // Check for expired query parameter on mount
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setShowExpiredMessage(true);
      // Clear the query parameter from URL without triggering navigation
      searchParams.delete('expired');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const dismissExpiredMessage = () => {
    setShowExpiredMessage(false);
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Redirect if already logged in (AC: 3)
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold justify-center mb-4">Welcome Back</h1>
          <p className="text-center text-base-content/70 mb-6">
            Sign in to continue to IdeaSpark
          </p>
          
          {/* Session expired alert */}
          {showExpiredMessage && (
            <div className="alert alert-info mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Your session has expired. Please log in again.</span>
              <button
                onClick={dismissExpiredMessage}
                className="btn btn-ghost btn-xs"
                aria-label="Dismiss message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
