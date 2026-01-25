import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCompletePrd } from './useCompletePrd';
import { prdService } from '../services/prdService';
import type { ReactNode } from 'react';

// Mock prdService
vi.mock('../services/prdService', () => ({
  prdService: {
    completePrd: vi.fn(),
  },
}));

describe('useCompletePrd', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should successfully complete PRD and invalidate queries', async () => {
    const mockPrd = {
      id: 'prd-123',
      idea_id: 'idea-123',
      user_id: 'user-123',
      content: {},
      status: 'complete' as const,
      created_at: '2026-01-25T10:00:00Z',
      updated_at: '2026-01-25T10:00:00Z',
      completed_at: '2026-01-25T10:00:00Z',
    };

    const mockResult = {
      data: { prd: mockPrd, ideaUpdated: true },
      error: null,
    };

    vi.mocked(prdService.completePrd).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useCompletePrd(), { wrapper });

    // Mutation should be idle initially
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);

    // Trigger mutation and wait for completion
    const mutationResult = await result.current.mutateAsync('prd-123');

    // Should have completed successfully
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
    });

    expect(mutationResult.data?.prd.status).toBe('complete');
    expect(mutationResult.data?.ideaUpdated).toBe(true);
    expect(prdService.completePrd).toHaveBeenCalledWith('prd-123');
  });

  it('should handle completion error', async () => {
    const mockError = {
      data: null,
      error: { message: 'PRD not found', code: 'NOT_FOUND' },
    };

    vi.mocked(prdService.completePrd).mockResolvedValue(mockError);

    const { result } = renderHook(() => useCompletePrd(), { wrapper });

    const mutatePromise = result.current.mutateAsync('invalid-id');

    const mutationResult = await mutatePromise;

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mutationResult.data).toBeNull();
    expect(mutationResult.error).not.toBeNull();
  });

  it('should handle idea update failure gracefully', async () => {
    const mockPrd = {
      id: 'prd-123',
      idea_id: 'idea-123',
      user_id: 'user-123',
      content: {},
      status: 'complete' as const,
      created_at: '2026-01-25T10:00:00Z',
      updated_at: '2026-01-25T10:00:00Z',
      completed_at: '2026-01-25T10:00:00Z',
    };

    const mockResult = {
      data: { prd: mockPrd, ideaUpdated: false },
      error: null,
    };

    vi.mocked(prdService.completePrd).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useCompletePrd(), { wrapper });

    const mutatePromise = result.current.mutateAsync('prd-123');
    const mutationResult = await mutatePromise;

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mutationResult.data?.prd.status).toBe('complete');
    expect(mutationResult.data?.ideaUpdated).toBe(false);
  });

  it('should invalidate correct query keys on success', async () => {
    const mockPrd = {
      id: 'prd-123',
      idea_id: 'idea-456',
      user_id: 'user-123',
      content: {},
      status: 'complete' as const,
      created_at: '2026-01-25T10:00:00Z',
      updated_at: '2026-01-25T10:00:00Z',
      completed_at: '2026-01-25T10:00:00Z',
    };

    const mockResult = {
      data: { prd: mockPrd, ideaUpdated: true },
      error: null,
    };

    vi.mocked(prdService.completePrd).mockResolvedValue(mockResult);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCompletePrd(), { wrapper });

    await result.current.mutateAsync('prd-123');

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });

    // Check that specific queries were invalidated
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['prd', 'prd-123'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['prds'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['ideas'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['idea', 'idea-456'] });
  });

  it('should log error on failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const mockError = new Error('Network error');
    vi.mocked(prdService.completePrd).mockRejectedValue(mockError);

    const { result } = renderHook(() => useCompletePrd(), { wrapper });

    try {
      await result.current.mutateAsync('prd-123');
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to complete PRD:', mockError);
    });

    consoleErrorSpy.mockRestore();
  });
});
