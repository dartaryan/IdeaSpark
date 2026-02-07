// src/features/prototypes/hooks/useUpdateApiConfig.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateApiConfig } from './useUpdateApiConfig';
import { apiConfigService } from '../services/apiConfigService';

vi.mock('../services/apiConfigService', () => ({
  apiConfigService: {
    updateApiConfig: vi.fn(),
  },
}));

const mockService = vi.mocked(apiConfigService);

describe('useUpdateApiConfig', () => {
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

  it('should update an API config successfully', async () => {
    const updated = {
      id: 'cfg-1', prototypeId: 'proto-1', name: 'updatedName', url: 'https://api.test.com',
      method: 'GET' as const, headers: {}, isMock: false, mockResponse: null, mockStatusCode: 200,
      mockDelayMs: 0, createdAt: '', updatedAt: '',
    };

    mockService.updateApiConfig.mockResolvedValue({ data: updated, error: null });

    const { result } = renderHook(() => useUpdateApiConfig(), { wrapper });

    result.current.mutate({ id: 'cfg-1', prototypeId: 'proto-1', input: { name: 'updatedName' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockService.updateApiConfig).toHaveBeenCalledWith('cfg-1', { name: 'updatedName' });
    expect(result.current.data?.name).toBe('updatedName');
  });

  it('should handle update error', async () => {
    mockService.updateApiConfig.mockResolvedValue({
      data: null,
      error: { message: 'Not found', code: 'NOT_FOUND' },
    });

    const { result } = renderHook(() => useUpdateApiConfig(), { wrapper });

    result.current.mutate({ id: 'cfg-1', prototypeId: 'proto-1', input: { name: 'x' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should invalidate apiConfigs query on success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    mockService.updateApiConfig.mockResolvedValue({
      data: {
        id: 'cfg-1', prototypeId: 'proto-1', name: 'test', url: 'https://test.com', method: 'GET',
        headers: {}, isMock: false, mockResponse: null, mockStatusCode: 200, mockDelayMs: 0, createdAt: '', updatedAt: '',
      },
      error: null,
    });

    const { result } = renderHook(() => useUpdateApiConfig(), { wrapper });

    result.current.mutate({ id: 'cfg-1', prototypeId: 'proto-1', input: { name: 'test' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalled();
  });
});
