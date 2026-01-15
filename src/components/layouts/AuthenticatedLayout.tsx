import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { SessionExpiredHandler } from '../../features/auth/components/SessionExpiredHandler';
import { Header } from '../ui/Header';

/**
 * Layout component for authenticated routes
 * Provides Header, session expiry handling, and auth protection
 */
export function AuthenticatedLayout() {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Session expiry handler - redirects on session expiry */}
      <SessionExpiredHandler />
      
      {/* Header with user menu */}
      <Header />
      
      {/* Main content area */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
