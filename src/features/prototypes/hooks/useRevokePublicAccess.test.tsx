// src/features/prototypes/hooks/useRevokePublicAccess.test.tsx

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRevokePublicAccess } from './useRevokePublicAccess';
import { prototypeService } from '../services/prototypeService';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';

vi.mock('../services/prototypeService');

describe('useRevokePublicAccess', () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call prototypeService.revokePublicAccess on mutate', async () => {
    vi.mocked(prototypeService.revokePublicAccess).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const { result } = renderHook(() => useRevokePublicAccess(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(prototypeService.revokePublicAccess).toHaveBeenCalledWith('proto-123');
  });

  it('should handle service error', async () => {
    vi.mocked(prototypeService.revokePublicAccess).mockResolvedValue({
      data: null,
      error: { message: 'Failed to revoke public access', code: 'DB_ERROR' },
    });

    const { result } = renderHook(() => useRevokePublicAccess(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to revoke public access');
  });

  it('should show pending state during mutation', async () => {
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(prototypeService.revokePublicAccess).mockReturnValue(pendingPromise as any);

    const { result } = renderHook(() => useRevokePublicAccess(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123' });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Resolve the promise
    resolvePromise!({ data: undefined, error: null });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isPending).toBe(false);
    });
  });

  it('should invalidate shareStats query on success', async () => {
    vi.mocked(prototypeService.revokePublicAccess).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRevokePublicAccess(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['shareStats', 'proto-123'],
      })
    );
  });

  it('should invalidate shareUrl query on success', async () => {
    vi.mocked(prototypeService.revokePublicAccess).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRevokePublicAccess(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['shareUrl', 'proto-123'],
      })
    );
  });

  it('should invalidate passwordStatus query on success', async () => {
    vi.mocked(prototypeService.revokePublicAccess).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRevokePublicAccess(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['passwordStatus', 'proto-123'],
      })
    );
  });
});
