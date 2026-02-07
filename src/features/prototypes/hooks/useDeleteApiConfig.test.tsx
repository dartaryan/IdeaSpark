// src/features/prototypes/hooks/useDeleteApiConfig.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeleteApiConfig } from './useDeleteApiConfig';
import { apiConfigService } from '../services/apiConfigService';

vi.mock('../services/apiConfigService', () => ({
  apiConfigService: {
    deleteApiConfig: vi.fn(),
  },
}));

const mockService = vi.mocked(apiConfigService);

describe('useDeleteApiConfig', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should delete an API config successfully', async () => {
    mockService.deleteApiConfig.mockResolvedValue({ data: undefined, error: null });

    const { result } = renderHook(() => useDeleteApiConfig(), { wrapper });

    result.current.mutate({ id: 'cfg-1', prototypeId: 'proto-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockService.deleteApiConfig).toHaveBeenCalledWith('cfg-1');
  });

  it('should handle delete error', async () => {
    mockService.deleteApiConfig.mockResolvedValue({
      data: null,
      error: { message: 'Failed to delete', code: 'DB_ERROR' },
    });

    const { result } = renderHook(() => useDeleteApiConfig(), { wrapper });

    result.current.mutate({ id: 'cfg-1', prototypeId: 'proto-1' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should invalidate apiConfigs query on success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    mockService.deleteApiConfig.mockResolvedValue({ data: undefined, error: null });

    const { result } = renderHook(() => useDeleteApiConfig(), { wrapper });

    result.current.mutate({ id: 'cfg-1', prototypeId: 'proto-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalled();
  });
});
