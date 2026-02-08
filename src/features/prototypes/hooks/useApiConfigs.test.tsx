// src/features/prototypes/hooks/useApiConfigs.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useApiConfigs } from './useApiConfigs';
import { apiConfigService } from '../services/apiConfigService';

vi.mock('../services/apiConfigService', () => ({
  apiConfigService: {
    getApiConfigs: vi.fn(),
  },
}));

const mockService = vi.mocked(apiConfigService);

describe('useApiConfigs', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch configs for a prototype', async () => {
    const configs = [
      { id: 'cfg-1', prototypeId: 'proto-1', name: 'getUsers', url: 'https://api.test.com', method: 'GET', headers: {}, isMock: false, mockResponse: null, mockStatusCode: 200, mockDelayMs: 0, isAi: false, aiModel: null, aiSystemPrompt: null, aiMaxTokens: null, aiTemperature: null, createdAt: '', updatedAt: '' },
    ];

    mockService.getApiConfigs.mockResolvedValue({ data: configs, error: null });

    const { result } = renderHook(() => useApiConfigs('proto-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockService.getApiConfigs).toHaveBeenCalledWith('proto-1');
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe('getUsers');
  });

  it('should not fetch when prototypeId is empty', () => {
    renderHook(() => useApiConfigs(''), { wrapper });

    expect(mockService.getApiConfigs).not.toHaveBeenCalled();
  });

  it('should handle service error', async () => {
    mockService.getApiConfigs.mockResolvedValue({
      data: null,
      error: { message: 'DB error', code: 'DB_ERROR' },
    });

    const { result } = renderHook(() => useApiConfigs('proto-1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
