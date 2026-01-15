import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES, REDIRECT_AFTER_LOGIN_KEY } from './routeConstants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper that requires authentication
 * - Shows loading spinner while checking auth state
 * - Redirects to login if not authenticated
 * - Stores intended destination for deep linking
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-base-200"
        role="status"
        aria-label="Loading authentication status"
      >
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Not authenticated - redirect to login with return URL
  if (!isAuthenticated) {
    // Store intended destination for deep linking
    const intendedUrl = location.pathname + location.search;
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, intendedUrl);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
