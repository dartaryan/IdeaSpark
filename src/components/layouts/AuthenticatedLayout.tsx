import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { SessionExpiredHandler } from '../../features/auth/components/SessionExpiredHandler';
import { Header } from '../ui/Header';
import { Sidebar } from './Sidebar';

/**
 * Layout component for authenticated routes
 * Provides responsive drawer-based navigation with Header, Sidebar, and session handling
 * Uses DaisyUI drawer pattern: persistent on desktop (lg+), collapsible on mobile
 */
export function AuthenticatedLayout() {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading spinner while checking auth state
  if (isLoading) {
    console.log('[AuthenticatedLayout] Showing loading spinner, isLoading=true');
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('[AuthenticatedLayout] REDIRECTING TO LOGIN! user is null, isLoading=false');
    console.log('[AuthenticatedLayout] Stack trace:', new Error().stack);
    return <Navigate to="/login" replace />;
  }
  
  console.log('[AuthenticatedLayout] Rendering content, user:', user?.email);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="drawer lg:drawer-open">
      {/* Session expiry handler - redirects on session expiry */}
      <SessionExpiredHandler />

      {/* Mobile drawer toggle (hidden, controlled by state) */}
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content area */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Header with hamburger menu for mobile */}
        <Header onMenuClick={handleMenuClick} />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 bg-base-200">
          <Outlet />
        </main>
      </div>

      {/* Sidebar drawer */}
      <div className="drawer-side z-40">
        {/* Overlay - closes drawer when clicked */}
        <label
          htmlFor="sidebar-drawer"
          aria-label="Close sidebar"
          className="drawer-overlay"
          onClick={handleSidebarClose}
        />

        {/* Sidebar content */}
        <Sidebar onNavClick={handleSidebarClose} />
      </div>
    </div>
  );
}
