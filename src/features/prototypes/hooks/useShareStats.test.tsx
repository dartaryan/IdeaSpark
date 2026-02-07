// src/features/prototypes/hooks/useShareStats.test.tsx

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useShareStats, shareStatsKeys } from './useShareStats';
import { prototypeService } from '../services/prototypeService';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

vi.mock('../services/prototypeService');

describe('useShareStats', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should fetch share stats successfully', async () => {
    const mockStats = {
      viewCount: 42,
      sharedAt: '2026-01-15T10:00:00Z',
      isPublic: true,
    };

    vi.mocked(prototypeService.getShareStats).mockResolvedValue({
      data: mockStats,
      error: null,
    });

    const { result } = renderHook(() => useShareStats('proto-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStats);
    expect(prototypeService.getShareStats).toHaveBeenCalledWith('proto-123');
  });

  it('should return null when prototype is not shared', async () => {
    vi.mocked(prototypeService.getShareStats).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useShareStats('proto-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it('should handle error when fetching share stats fails', async () => {
    vi.mocked(prototypeService.getShareStats).mockResolvedValue({
      data: null,
      error: { message: 'Failed to get share statistics', code: 'DB_ERROR' },
    });

    const { result } = renderHook(() => useShareStats('proto-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to get share statistics');
  });

  it('should not fetch when prototypeId is empty', () => {
    vi.mocked(prototypeService.getShareStats).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useShareStats(''), { wrapper });

    expect(result.current.isFetching).toBe(false);
    expect(prototypeService.getShareStats).not.toHaveBeenCalled();
  });

  it('should have correct query key structure', () => {
    expect(shareStatsKeys.all).toEqual(['shareStats']);
    expect(shareStatsKeys.detail('proto-123')).toEqual(['shareStats', 'proto-123']);
  });

  it('should show loading state while fetching', async () => {
    vi.mocked(prototypeService.getShareStats).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { viewCount: 0, sharedAt: null, isPublic: false }, error: null }), 100))
    );

    const { result } = renderHook(() => useShareStats('proto-123'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
