// src/features/prototypes/hooks/useSetSharePassword.test.tsx

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSetSharePassword } from './useSetSharePassword';
import { prototypeService } from '../services/prototypeService';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

vi.mock('../services/prototypeService');

describe('useSetSharePassword', () => {
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

  it('should call prototypeService.setSharePassword on mutate', async () => {
    vi.mocked(prototypeService.setSharePassword).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const { result } = renderHook(() => useSetSharePassword(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123', password: 'StrongPassword123' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(prototypeService.setSharePassword).toHaveBeenCalledWith('proto-123', 'StrongPassword123');
  });

  it('should handle password removal (null password)', async () => {
    vi.mocked(prototypeService.setSharePassword).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const { result } = renderHook(() => useSetSharePassword(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123', password: null });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(prototypeService.setSharePassword).toHaveBeenCalledWith('proto-123', null);
  });

  it('should handle service error', async () => {
    vi.mocked(prototypeService.setSharePassword).mockResolvedValue({
      data: null,
      error: { message: 'Failed to set password', code: 'DB_ERROR' },
    });

    const { result } = renderHook(() => useSetSharePassword(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123', password: 'StrongPassword123' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to set password');
  });

  it('should invalidate password status query on success', async () => {
    vi.mocked(prototypeService.setSharePassword).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSetSharePassword(), { wrapper });

    result.current.mutate({ prototypeId: 'proto-123', password: 'StrongPassword123' });

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
