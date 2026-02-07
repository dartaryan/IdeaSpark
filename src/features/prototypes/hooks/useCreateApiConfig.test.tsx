// src/features/prototypes/hooks/useCreateApiConfig.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateApiConfig } from './useCreateApiConfig';
import { apiConfigService } from '../services/apiConfigService';

vi.mock('../services/apiConfigService', () => ({
  apiConfigService: {
    createApiConfig: vi.fn(),
  },
}));

const mockService = vi.mocked(apiConfigService);

describe('useCreateApiConfig', () => {
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

  it('should create an API config successfully', async () => {
    const created = {
      id: 'cfg-new',
      prototypeId: 'proto-1',
      name: 'getUsers',
      url: 'https://api.test.com/users',
      method: 'GET' as const,
      headers: {},
      isMock: false,
      mockResponse: null,
      mockStatusCode: 200,
      mockDelayMs: 0,
      createdAt: '',
      updatedAt: '',
    };

    mockService.createApiConfig.mockResolvedValue({ data: created, error: null });

    const { result } = renderHook(() => useCreateApiConfig(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-1',
      name: 'getUsers',
      url: 'https://api.test.com/users',
      method: 'GET',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockService.createApiConfig).toHaveBeenCalled();
    expect(result.current.data?.name).toBe('getUsers');
  });

  it('should handle create error', async () => {
    mockService.createApiConfig.mockResolvedValue({
      data: null,
      error: { message: 'Duplicate name', code: 'DUPLICATE_ERROR' },
    });

    const { result } = renderHook(() => useCreateApiConfig(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-1',
      name: 'duplicate',
      url: 'https://api.test.com',
      method: 'GET',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('Duplicate name');
  });

  it('should invalidate apiConfigs query on success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    mockService.createApiConfig.mockResolvedValue({
      data: {
        id: 'cfg-new', prototypeId: 'proto-1', name: 'test', url: 'https://test.com', method: 'GET',
        headers: {}, isMock: false, mockResponse: null, mockStatusCode: 200, mockDelayMs: 0, createdAt: '', updatedAt: '',
      },
      error: null,
    });

    const { result } = renderHook(() => useCreateApiConfig(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-1',
      name: 'test',
      url: 'https://test.com',
      method: 'GET',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalled();
  });
});
