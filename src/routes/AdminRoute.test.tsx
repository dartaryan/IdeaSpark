import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test/test-utils';
import { AdminRoute } from './AdminRoute';
import { REDIRECT_AFTER_LOGIN_KEY } from './routeConstants';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock react-router-dom Navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to);
      return null;
    },
    useLocation: () => ({ pathname: '/admin', search: '' }),
  };
});

// Mock console.warn to verify logging
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should show loading spinner when isLoading is true', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should store intended URL in sessionStorage when redirecting to login', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)).toBe('/admin');
    });
  });

  it('should redirect to not-authorized when authenticated but not admin', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'user@example.com', role: 'user' },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/not-authorized');
    });
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should log unauthorized access attempt when non-admin tries to access', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'user@example.com', role: 'user' },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Unauthorized admin access attempt by user: user@example.com'
      );
    });
  });

  it('should render children when authenticated as admin', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'admin@example.com', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should not log when admin accesses admin route', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'admin@example.com', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});
