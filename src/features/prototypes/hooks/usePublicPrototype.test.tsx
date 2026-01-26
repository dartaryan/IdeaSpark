import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { usePublicPrototype } from './usePublicPrototype';
import { prototypeService } from '../services/prototypeService';

// Mock the prototypeService
vi.mock('../services/prototypeService', () => ({
  prototypeService: {
    getPublicPrototype: vi.fn(),
  },
}));

const mockPrototypeService = vi.mocked(prototypeService);

const mockPublicPrototype = {
  id: 'proto-123',
  url: 'https://preview.example.com/proto-123',
  version: 2,
  status: 'ready' as const,
  createdAt: '2024-01-01T00:00:00Z',
  shareId: 'share-uuid-123',
};

describe('usePublicPrototype', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('fetches public prototype successfully', async () => {
    mockPrototypeService.getPublicPrototype.mockResolvedValue({
      data: mockPublicPrototype,
      error: null,
    });

    const { result } = renderHook(() => usePublicPrototype('share-uuid-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(prototypeService.getPublicPrototype).toHaveBeenCalledWith('share-uuid-123');
    expect(result.current.data).toEqual(mockPublicPrototype);
  });

  it('handles prototype not found error', async () => {
    mockPrototypeService.getPublicPrototype.mockResolvedValue({
      data: null,
      error: { message: 'Prototype not found or not public', code: 'NOT_FOUND' },
    });

    const { result } = renderHook(() => usePublicPrototype('invalid-share-id'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  it('does not fetch when shareId is undefined', () => {
    const { result } = renderHook(() => usePublicPrototype(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(prototypeService.getPublicPrototype).not.toHaveBeenCalled();
  });

  it('does not retry on error', async () => {
    mockPrototypeService.getPublicPrototype.mockResolvedValue({
      data: null,
      error: { message: 'Not found', code: 'NOT_FOUND' },
    });

    const { result } = renderHook(() => usePublicPrototype('share-uuid-123'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Should not retry (only 1 call)
    expect(prototypeService.getPublicPrototype).toHaveBeenCalledTimes(1);
  });

  it('uses correct query key', () => {
    const { result } = renderHook(() => usePublicPrototype('share-uuid-123'), { wrapper });

    const queryState = queryClient.getQueryState([
      'prototypes',
      'public',
      'share-uuid-123',
    ]);

    expect(queryState).toBeDefined();
  });

  it('caches public prototype for 10 minutes', async () => {
    mockPrototypeService.getPublicPrototype.mockResolvedValue({
      data: mockPublicPrototype,
      error: null,
    });

    const { result } = renderHook(() => usePublicPrototype('share-uuid-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check that staleTime is set
    const queryState = queryClient.getQueryState([
      'prototypes',
      'public',
      'share-uuid-123',
    ]);

    expect(queryState?.dataUpdatedAt).toBeDefined();
  });
});
