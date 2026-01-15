import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock authService
const mockSignOut = vi.fn();
const mockGetCurrentUser = vi.fn();
vi.mock('../services/authService', () => ({
  authService: {
    signOut: () => mockSignOut(),
    getCurrentUser: () => mockGetCurrentUser(),
  },
}));

// Mock Supabase
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: () => mockOnAuthStateChange(),
    },
  },
}));

// Import useAuth after mocks are set up
import { useAuth } from './useAuth';

describe('useAuth - Logout Functionality', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ data: null, error: null });
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });
    mockGetCurrentUser.mockResolvedValue(null);
  });

  it('should initialize with correct default state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.sessionExpired).toBe(false);
  });

  it('should provide logout function', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.logout).toBe('function');
  });

  it('should provide signOut as alias for logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.signOut).toBe('function');
  });

  it('should call authService.signOut on logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /login after logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should clear user state after logout', async () => {
    // Setup initial authenticated state
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: '123', email: 'test@example.com' },
        },
      },
    });
    mockGetCurrentUser.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      role: 'user',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Perform logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should clear sessionExpired flag after logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Set session expired
    act(() => {
      result.current.setSessionExpired(true);
    });

    expect(result.current.sessionExpired).toBe(true);

    // Logout should clear it
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.sessionExpired).toBe(false);
  });

  it('should provide setSessionExpired function', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.setSessionExpired).toBe('function');

    act(() => {
      result.current.setSessionExpired(true);
    });

    expect(result.current.sessionExpired).toBe(true);
  });

  it('should provide clearSessionExpired function', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Set expired first
    act(() => {
      result.current.setSessionExpired(true);
    });

    expect(result.current.sessionExpired).toBe(true);

    // Clear it
    act(() => {
      result.current.clearSessionExpired();
    });

    expect(result.current.sessionExpired).toBe(false);
  });

  it('should handle logout errors gracefully', async () => {
    mockSignOut.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not throw
    await act(async () => {
      await result.current.logout();
    });

    // Should still navigate even on error
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

describe('useAuth - Session Expiry Detection', () => {
  let authStateCallback: ((event: string, session: unknown) => void) | null = null;

  const wrapper = ({ children }: { children: ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;

    mockSignOut.mockResolvedValue({ data: null, error: null });
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: '123', email: 'test@example.com' },
        },
      },
    });
    mockGetCurrentUser.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      role: 'user',
    });

    // Capture the auth state change callback
    mockOnAuthStateChange.mockImplementation((callback: (event: string, session: unknown) => void) => {
      authStateCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });
  });

  it('should set sessionExpired when session ends unexpectedly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Simulate session ending (not user-initiated)
    if (authStateCallback) {
      await act(async () => {
        authStateCallback!('SIGNED_OUT', null);
      });
    }

    // sessionExpired should be true for non-user-initiated logout
    expect(result.current.sessionExpired).toBe(true);
  });

  it('should not set sessionExpired for user-initiated logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // User-initiated logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.sessionExpired).toBe(false);
  });

  it('should update user state when session changes', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).not.toBeNull();
    });

    // Simulate sign out
    if (authStateCallback) {
      await act(async () => {
        authStateCallback!('SIGNED_OUT', null);
      });
    }

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
