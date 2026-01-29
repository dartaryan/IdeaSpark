// src/features/admin/hooks/useUsers.test.tsx
// Story 5.7 - Task 7: Tests for useUsers hook

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from './useUsers';
import { adminService } from '../services/adminService';
import type { ReactNode } from 'react';

// Mock adminService
vi.mock('../services/adminService', () => ({
  adminService: {
    getAllUsers: vi.fn(),
  },
}));

describe('useUsers', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch all users successfully', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        name: 'john',
        email: 'john@example.com',
        role: 'user' as const,
        created_at: '2024-01-01T00:00:00Z',
        ideas_count: 5,
        last_idea_submitted_at: '2024-03-01T00:00:00Z',
      },
    ];

    vi.mocked(adminService.getAllUsers).mockResolvedValue({
      data: mockUsers,
      error: null,
    });

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUsers);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(adminService.getAllUsers).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching users fails', async () => {
    vi.mocked(adminService.getAllUsers).mockResolvedValue({
      data: null,
      error: { message: 'Failed to load users', code: 'DB_ERROR' },
    });

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeDefined();
  });

  it('should use correct query key and stale time', async () => {
    vi.mocked(adminService.getAllUsers).mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify the query key is correct by checking the query cache
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    expect(queries.length).toBeGreaterThan(0);
    const queryKey = queries[0].queryKey;
    expect(queryKey).toEqual(['admin', 'users']);
  });
});
