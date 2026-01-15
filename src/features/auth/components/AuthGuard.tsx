import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, REDIRECT_AFTER_LOGIN_KEY } from '../../../routes/routeConstants';

interface AuthGuardProps {
  children: ReactNode;
  /** Require admin role to access content */
  requireAdmin?: boolean;
}

/**
 * Wrapper component for auth-required sections within pages
 * - Shows loading spinner while checking auth
 * - Handles session expiry detection and redirect
 * - Optionally requires admin role
 *
 * Note: For route-level protection, use ProtectedRoute or AdminRoute instead.
 * AuthGuard is meant for protecting specific sections within already-protected pages.
 */
export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for session expiry
    if (!isLoading && !session && isAuthenticated) {
      // Session expired mid-navigation
      sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, location.pathname);
      navigate(`${ROUTES.LOGIN}?expired=true`, { replace: true });
    }
  }, [isLoading, session, isAuthenticated, navigate, location]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center p-8"
        role="status"
        aria-label="Loading"
      >
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // ProtectedRoute handles the redirect, just don't render content
    return null;
  }

  if (requireAdmin && user?.role !== 'admin') {
    // AdminRoute handles the redirect, just don't render content
    return null;
  }

  return <>{children}</>;
}
