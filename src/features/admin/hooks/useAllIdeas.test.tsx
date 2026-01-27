// src/features/admin/hooks/useAllIdeas.test.tsx
// Test suite for useAllIdeas hook

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAllIdeas } from './useAllIdeas';
import { adminService } from '../services/adminService';
import type { ReactNode } from 'react';

// Mock the admin service
vi.mock('../services/adminService', () => ({
  adminService: {
    getAllIdeas: vi.fn(),
  },
}));

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useAllIdeas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches ideas with default filters', async () => {
    const mockIdeas = [
      {
        id: 'idea-1',
        title: 'Test Idea',
        status: 'submitted',
        submitter_name: 'John Doe',
        created_at: '2026-01-20T10:00:00Z',
      },
    ];

    vi.mocked(adminService.getAllIdeas).mockResolvedValue({
      data: mockIdeas as any,
      error: null,
    });

    const { result } = renderHook(
      () => useAllIdeas({ statusFilter: 'all', sortBy: 'newest', searchQuery: '' }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockIdeas);
    expect(result.current.error).toBeNull();
    expect(adminService.getAllIdeas).toHaveBeenCalledWith({
      statusFilter: 'all',
      sortBy: 'newest',
      searchQuery: '',
    });
  });

  it('uses correct query key with filter parameters', async () => {
    vi.mocked(adminService.getAllIdeas).mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(
      () => useAllIdeas({ statusFilter: 'submitted', sortBy: 'oldest', searchQuery: 'test' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(adminService.getAllIdeas).toHaveBeenCalledWith({
      statusFilter: 'submitted',
      sortBy: 'oldest',
      searchQuery: 'test',
    });
  });

  it('handles errors gracefully', async () => {
    const mockError = { message: 'Failed to fetch', code: 'DB_ERROR' };
    
    vi.mocked(adminService.getAllIdeas).mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(
      () => useAllIdeas({ statusFilter: 'all', sortBy: 'newest', searchQuery: '' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('returns empty array when service returns null data with no error', async () => {
    vi.mocked(adminService.getAllIdeas).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(
      () => useAllIdeas({ statusFilter: 'all', sortBy: 'newest', searchQuery: '' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });
});
