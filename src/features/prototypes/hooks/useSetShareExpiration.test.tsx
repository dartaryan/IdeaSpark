// src/features/prototypes/hooks/useSetShareExpiration.test.tsx

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSetShareExpiration } from './useSetShareExpiration';
import { prototypeService } from '../services/prototypeService';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

vi.mock('../services/prototypeService');

describe('useSetShareExpiration', () => {
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

  it('should call prototypeService.setShareExpiration on mutate', async () => {
    vi.mocked(prototypeService.setShareExpiration).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const { result } = renderHook(() => useSetShareExpiration(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123', expiresAt: '2026-02-14T12:00:00Z' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(prototypeService.setShareExpiration).toHaveBeenCalledWith('proto-123', '2026-02-14T12:00:00Z');
  });

  it('should handle expiration removal (null = never expires)', async () => {
    vi.mocked(prototypeService.setShareExpiration).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const { result } = renderHook(() => useSetShareExpiration(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123', expiresAt: null });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(prototypeService.setShareExpiration).toHaveBeenCalledWith('proto-123', null);
  });

  it('should handle service error', async () => {
    vi.mocked(prototypeService.setShareExpiration).mockResolvedValue({
      data: null,
      error: { message: 'Failed to update link expiration', code: 'DB_ERROR' },
    });

    const { result } = renderHook(() => useSetShareExpiration(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123', expiresAt: '2026-02-14T12:00:00Z' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to update link expiration');
  });

  it('should show pending state during mutation', async () => {
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(prototypeService.setShareExpiration).mockReturnValue(pendingPromise as any);

    const { result } = renderHook(() => useSetShareExpiration(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123', expiresAt: '2026-02-14T12:00:00Z' });

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
    vi.mocked(prototypeService.setShareExpiration).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSetShareExpiration(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123', expiresAt: '2026-02-14T12:00:00Z' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['shareStats', 'proto-123'],
      })
    );
  });
});
