import { Navigate } from 'react-router-dom';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { useAuth } from '../hooks/useAuth';

export function ForgotPasswordPage() {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold justify-center mb-2">
            Forgot Password?
          </h1>
          <p className="text-center text-base-content/70 mb-6">
            No worries, we'll help you reset it
          </p>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
