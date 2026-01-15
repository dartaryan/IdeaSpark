import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../../lib/supabase';

export function ResetPasswordPage() {
  const { isLoading: authLoading } = useAuth();
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check if we have a valid session from the magic link
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // Supabase sets a session when user clicks the reset link
        // The session will have the recovery token
        if (isMounted) {
          setHasValidSession(!!session);
          setCheckingSession(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (isMounted) {
          setHasValidSession(false);
          setCheckingSession(false);
        }
      }
    };

    // Listen for auth state changes (magic link will trigger PASSWORD_RECOVERY)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          // User clicked the recovery link
          if (isMounted) {
            setHasValidSession(true);
            setCheckingSession(false);
          }
        }
      }
    );

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading while checking session
  if (authLoading || checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // No valid session - show error
  if (!hasValidSession) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body">
            <h1 className="card-title text-2xl font-bold justify-center mb-2">
              Invalid or Expired Link
            </h1>
            <div className="alert alert-warning mb-4">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>This password reset link is invalid or has expired.</span>
            </div>
            <p className="text-sm text-base-content/70 text-center mb-4">
              Password reset links expire after a short time for security reasons.
              Please request a new link.
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/forgot-password" className="btn btn-primary">
                Request New Link
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold justify-center mb-2">
            Reset Your Password
          </h1>
          <p className="text-center text-base-content/70 mb-6">
            Choose a strong password for your account
          </p>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
