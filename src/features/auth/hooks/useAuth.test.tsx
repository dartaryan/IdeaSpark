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

  it('should work even when signOut returns (graceful degradation)', async () => {
    // authService.signOut always returns success even on network errors
    // This tests that the hook behaves correctly when signOut completes
    mockSignOut.mockResolvedValueOnce({ data: null, error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    // State should be cleared and navigation should happen
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

describe('useAuth - Session Expiry State Management', () => {
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

  it('should not set sessionExpired for user-initiated logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // User-initiated logout should not set sessionExpired
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.sessionExpired).toBe(false);
  });

  it('should allow manually setting sessionExpired', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Manually set session expired (as would happen from session expiry detection)
    act(() => {
      result.current.setSessionExpired(true);
    });

    expect(result.current.sessionExpired).toBe(true);
  });

  it('should clear sessionExpired when clearSessionExpired is called', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Set and then clear
    act(() => {
      result.current.setSessionExpired(true);
    });
    expect(result.current.sessionExpired).toBe(true);

    act(() => {
      result.current.clearSessionExpired();
    });
    expect(result.current.sessionExpired).toBe(false);
  });

  it('should clear sessionExpired on logout', async () => {
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
});
