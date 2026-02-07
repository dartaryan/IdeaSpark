// src/features/prototypes/hooks/useVerifyPrototypePassword.test.tsx

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVerifyPrototypePassword } from './useVerifyPrototypePassword';
import { supabase } from '../../../lib/supabase';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('useVerifyPrototypePassword', () => {
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

  it('should return verified: true for correct password', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { verified: true },
      error: null,
    });

    const { result } = renderHook(() => useVerifyPrototypePassword(), { wrapper });

    result.current.mutate({ shareId: 'share-123', password: 'correct-password' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ verified: true });
    expect(supabase.functions.invoke).toHaveBeenCalledWith('verify-prototype-password', {
      body: { shareId: 'share-123', password: 'correct-password' },
    });
  });

  it('should return verified: false for incorrect password', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { verified: false },
      error: null,
    });

    const { result } = renderHook(() => useVerifyPrototypePassword(), { wrapper });

    result.current.mutate({ shareId: 'share-123', password: 'wrong-password' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ verified: false });
  });

  it('should throw error on Edge Function failure', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'Internal server error', name: 'FunctionsHttpError' },
    });

    const { result } = renderHook(() => useVerifyPrototypePassword(), { wrapper });

    result.current.mutate({ shareId: 'share-123', password: 'test-password' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Authentication error. Please try again.');
  });

  it('should show rate limit error message', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: '429 rate limit exceeded', name: 'FunctionsHttpError' },
    });

    const { result } = renderHook(() => useVerifyPrototypePassword(), { wrapper });

    result.current.mutate({ shareId: 'share-123', password: 'test-password' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Too many attempts. Please try again in a few minutes.');
  });
});
