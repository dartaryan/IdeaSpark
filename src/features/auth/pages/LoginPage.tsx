import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { useRedirectAfterLogin } from '../../../hooks/useRedirectAfterLogin';

// Helper to check if URL has expired param (called once during initial state)
function getInitialExpiredState(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('expired') === 'true';
}

// Helper to check if URL has reset=success param (called once during initial state)
function getInitialResetSuccessState(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('reset') === 'success';
}

export function LoginPage() {
  const { user, isLoading } = useAuth();
  const { redirectToStoredOrDefault } = useRedirectAfterLogin();
  const [searchParams, setSearchParams] = useSearchParams();
  // Initialize state from URL params (lazy initialization)
  const [showExpiredMessage, setShowExpiredMessage] = useState(getInitialExpiredState);
  const [showResetSuccessMessage, setShowResetSuccessMessage] = useState(getInitialResetSuccessState);
  const hasCleanedUrl = useRef(false);
  const hasRedirected = useRef(false);

  // Clean up URL parameter after mount (this is a side effect, not state update)
  useEffect(() => {
    if (hasCleanedUrl.current) return;
    hasCleanedUrl.current = true;
    
    const newParams = new URLSearchParams(searchParams);
    let hasChanges = false;

    if (searchParams.get('expired') === 'true') {
      newParams.delete('expired');
      hasChanges = true;
    }

    if (searchParams.get('reset') === 'success') {
      newParams.delete('reset');
      hasChanges = true;
    }

    if (hasChanges) {
      // Clear the query parameters from URL without triggering navigation
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Redirect if already logged in - supports deep linking
  useEffect(() => {
    if (!isLoading && user && !hasRedirected.current) {
      hasRedirected.current = true;
      redirectToStoredOrDefault();
    }
  }, [isLoading, user, redirectToStoredOrDefault]);

  const dismissExpiredMessage = () => {
    setShowExpiredMessage(false);
  };

  const dismissResetSuccessMessage = () => {
    setShowResetSuccessMessage(false);
  };

  // Show loading spinner while checking auth state or redirecting
  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold justify-center mb-4">Welcome Back</h1>
          <p className="text-center text-base-content/70 mb-6">
            Sign in to continue to IdeaSpark
          </p>
          
          {/* Password reset success alert */}
          {showResetSuccessMessage && (
            <div className="alert alert-success mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Password reset successful! Please log in with your new password.</span>
              <button
                onClick={dismissResetSuccessMessage}
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

          {/* Forgot password link */}
          <div className="text-center mt-4">
            <Link to="/forgot-password" className="link link-primary text-sm">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
