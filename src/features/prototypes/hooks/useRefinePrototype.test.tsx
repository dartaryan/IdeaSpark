// src/features/prototypes/hooks/useRefinePrototype.test.tsx

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRefinePrototype } from './useRefinePrototype';
import { openLovableService } from '../../../services/openLovableService';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

vi.mock('../../../services/openLovableService');

describe('useRefinePrototype', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should refine prototype successfully', async () => {
    const mockRefineResponse = {
      data: { prototypeId: 'new-proto-123', status: 'generating' as const },
      error: null,
    };

    const mockPollResponse = {
      data: { status: 'ready' as const, url: 'https://example.com/new', code: '<div>Refined</div>' },
      error: null,
    };

    vi.mocked(openLovableService.refine).mockResolvedValue(mockRefineResponse);
    vi.mocked(openLovableService.pollStatus).mockResolvedValue(mockPollResponse);

    const { result } = renderHook(() => useRefinePrototype(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      prototypeId: 'proto-123',
      refinementPrompt: 'Make the header larger',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(openLovableService.refine).toHaveBeenCalledWith('proto-123', 'Make the header larger');
    expect(openLovableService.pollStatus).toHaveBeenCalledWith('new-proto-123');
    expect(result.current.data).toEqual({
      prototypeId: 'new-proto-123',
      status: 'ready',
      url: 'https://example.com/new',
      code: '<div>Refined</div>',
    });
  });

  it('should handle refinement service error', async () => {
    const mockError = {
      data: null,
      error: { message: 'Refinement failed', code: 'API_ERROR' },
    };

    vi.mocked(openLovableService.refine).mockResolvedValue(mockError);

    const { result } = renderHook(() => useRefinePrototype(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      prototypeId: 'proto-123',
      refinementPrompt: 'Make the header larger',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('Refinement failed');
  });

  it('should handle polling timeout error', async () => {
    const mockRefineResponse = {
      data: { prototypeId: 'new-proto-123', status: 'generating' as const },
      error: null,
    };

    const mockPollError = {
      data: null,
      error: { message: 'Generation timed out', code: 'TIMEOUT_ERROR' },
    };

    vi.mocked(openLovableService.refine).mockResolvedValue(mockRefineResponse);
    vi.mocked(openLovableService.pollStatus).mockResolvedValue(mockPollError);

    const { result } = renderHook(() => useRefinePrototype(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      prototypeId: 'proto-123',
      refinementPrompt: 'Make the header larger',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect((result.current.error as Error).message).toBe('Generation timed out');
  });

  it('should handle failed refinement status', async () => {
    const mockRefineResponse = {
      data: { prototypeId: 'new-proto-123', status: 'generating' as const },
      error: null,
    };

    const mockPollResponse = {
      data: { status: 'failed' as const, url: null, code: null },
      error: null,
    };

    vi.mocked(openLovableService.refine).mockResolvedValue(mockRefineResponse);
    vi.mocked(openLovableService.pollStatus).mockResolvedValue(mockPollResponse);

    const { result } = renderHook(() => useRefinePrototype(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      prototypeId: 'proto-123',
      refinementPrompt: 'Make the header larger',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect((result.current.error as Error).message).toBe('Refinement failed. Please try again.');
  });

  it('should invalidate queries on success', async () => {
    const mockRefineResponse = {
      data: { prototypeId: 'new-proto-123', status: 'generating' as const },
      error: null,
    };

    const mockPollResponse = {
      data: { status: 'ready' as const, url: 'https://example.com/new', code: '<div>Refined</div>' },
      error: null,
    };

    vi.mocked(openLovableService.refine).mockResolvedValue(mockRefineResponse);
    vi.mocked(openLovableService.pollStatus).mockResolvedValue(mockPollResponse);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRefinePrototype(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      prototypeId: 'proto-123',
      refinementPrompt: 'Make the header larger',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalled();
  });
});
