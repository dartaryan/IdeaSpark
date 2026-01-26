// src/features/prototypes/hooks/useRestoreVersion.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRestoreVersion } from './useRestoreVersion';
import { prototypeService } from '../services/prototypeService';
import type { ReactNode } from 'react';

// Mock the prototype service
vi.mock('../services/prototypeService', () => ({
  prototypeService: {
    restore: vi.fn(),
  },
}));

describe('useRestoreVersion', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockPrototype = {
    id: 'new-proto-id',
    prdId: 'prd-123',
    ideaId: 'idea-456',
    userId: 'user-789',
    url: 'https://preview.example.com/proto',
    code: 'import React from "react"...',
    version: 3,
    refinementPrompt: 'Restored from v2',
    status: 'ready' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  it('successfully restores a prototype version', async () => {
    vi.mocked(prototypeService.restore).mockResolvedValue({
      data: mockPrototype,
      error: null,
    });

    const { result } = renderHook(() => useRestoreVersion(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-to-restore',
      prdId: 'prd-123',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPrototype);
    expect(prototypeService.restore).toHaveBeenCalledWith('proto-to-restore');
  });

  it('handles restoration errors', async () => {
    const errorMessage = 'Failed to restore version';
    vi.mocked(prototypeService.restore).mockResolvedValue({
      data: null,
      error: { message: errorMessage, code: 'API_ERROR' },
    });

    const { result } = renderHook(() => useRestoreVersion(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-to-restore',
      prdId: 'prd-123',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('invalidates relevant queries on success', async () => {
    vi.mocked(prototypeService.restore).mockResolvedValue({
      data: mockPrototype,
      error: null,
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRestoreVersion(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-to-restore',
      prdId: 'prd-123',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify all relevant query keys are invalidated
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['prototypes', 'prd', 'prd-123', 'history'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['prototypes', 'prd', 'prd-123'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['prototypes', 'prd', 'prd-123', 'latest'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['prototypes'],
    });
  });

  it('provides loading state during restoration', async () => {
    vi.mocked(prototypeService.restore).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: mockPrototype, error: null }), 100))
    );

    const { result } = renderHook(() => useRestoreVersion(), { wrapper });

    expect(result.current.isPending).toBe(false);

    result.current.mutate({
      prototypeId: 'proto-to-restore',
      prdId: 'prd-123',
    });

    // Should be pending immediately after mutation
    await waitFor(() => expect(result.current.isPending).toBe(true));

    // Should complete eventually
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 500 });
  });

  it('allows resetting mutation state', async () => {
    const errorMessage = 'Failed to restore version';
    vi.mocked(prototypeService.restore).mockResolvedValue({
      data: null,
      error: { message: errorMessage, code: 'API_ERROR' },
    });

    const { result } = renderHook(() => useRestoreVersion(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-to-restore',
      prdId: 'prd-123',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Reset the mutation
    result.current.reset();

    // Wait for reset to take effect
    await waitFor(() => {
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeUndefined();
    });
  });
});
