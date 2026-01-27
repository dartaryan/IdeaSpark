// src/features/admin/hooks/useApproveIdea.test.tsx
// Test suite for useApproveIdea hook

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApproveIdea } from './useApproveIdea';
import { supabase } from '../../../lib/supabase';
import type { ReactNode } from 'react';

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useApproveIdea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully approves an idea', async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ data: { id: 'idea-1' }, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
    } as any);

    const { result } = renderHook(() => useApproveIdea(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('idea-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockUpdate).toHaveBeenCalledWith({ status: 'approved' });
    expect(mockEq).toHaveBeenCalledWith('id', 'idea-1');
  });

  it('handles errors when approval fails', async () => {
    const mockError = { message: 'Update failed', code: 'DB_ERROR' };
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: mockError });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
    } as any);

    const { result } = renderHook(() => useApproveIdea(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('idea-1');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
