import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES, REDIRECT_AFTER_LOGIN_KEY } from './routeConstants';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper that requires admin role
 * - Shows loading spinner while checking auth state
 * - Redirects to login if not authenticated
 * - Redirects to not-authorized page if authenticated but not admin
 * - Logs unauthorized access attempts
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
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

  // Authenticated but not admin - log and redirect
  if (user?.role !== 'admin') {
    console.warn(`Unauthorized admin access attempt by user: ${user?.email}`);
    return <Navigate to={ROUTES.NOT_AUTHORIZED} replace />;
  }

  return <>{children}</>;
}
