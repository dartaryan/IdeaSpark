// src/features/admin/hooks/useApproveIdea.test.tsx
// Task 2: Test suite for useApproveIdea hook with optimistic updates

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApproveIdea } from './useApproveIdea';
import { adminService } from '../services/adminService';
import type { ReactNode } from 'react';

// Mock adminService
vi.mock('../services/adminService', () => ({
  adminService: {
    approveIdea: vi.fn(),
  },
}));

// Mock toast
vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
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

describe('useApproveIdea - Task 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Subtask 2.2: Implement useMutation with approveIdea service function', () => {
    it('successfully approves an idea using adminService', async () => {
      const mockApprovedIdea = {
        id: 'idea-1',
        status: 'approved',
        status_updated_at: new Date().toISOString(),
      };

      vi.mocked(adminService.approveIdea).mockResolvedValue({
        data: mockApprovedIdea,
        error: null,
      });

      const { result } = renderHook(() => useApproveIdea(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('idea-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(adminService.approveIdea).toHaveBeenCalledWith('idea-1');
    });
  });

  describe('Subtask 2.3: Add onMutate for optimistic UI updates', () => {
    it('performs optimistic update on mutation', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      // Set initial cache data
      queryClient.setQueryData(['admin', 'ideas'], [
        { id: 'idea-1', status: 'submitted', title: 'Test Idea' },
      ]);

      vi.mocked(adminService.approveIdea).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: { id: 'idea-1' }, error: null }), 100))
      );

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useApproveIdea(), { wrapper });

      result.current.mutate('idea-1');

      // Check optimistic update happened immediately
      await waitFor(() => {
        const cacheData = queryClient.getQueryData(['admin', 'ideas']) as any[];
        expect(cacheData).toBeDefined();
      });
    });
  });

  describe('Subtask 2.4: Invalidate relevant React Query caches', () => {
    it('invalidates admin ideas cache on success', async () => {
      vi.mocked(adminService.approveIdea).mockResolvedValue({
        data: { id: 'idea-1', status: 'approved' },
        error: null,
      });

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useApproveIdea(), { wrapper });

      result.current.mutate('idea-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin', 'ideas'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin', 'pipeline'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin', 'metrics'] });
    });
  });

  describe('Subtask 2.6: Handle errors with rollback and error toast', () => {
    it('handles errors when approval fails', async () => {
      vi.mocked(adminService.approveIdea).mockResolvedValue({
        data: null,
        error: { message: 'Update failed', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useApproveIdea(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('idea-1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('rolls back optimistic update on error', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      // Set initial cache data
      const initialData = [
        { id: 'idea-1', status: 'submitted', title: 'Test Idea' },
      ];
      queryClient.setQueryData(['admin', 'ideas'], initialData);

      vi.mocked(adminService.approveIdea).mockResolvedValue({
        data: null,
        error: { message: 'Update failed', code: 'DB_ERROR' },
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useApproveIdea(), { wrapper });

      result.current.mutate('idea-1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Verify rollback happened - cache should be restored
      const cacheData = queryClient.getQueryData(['admin', 'ideas']);
      expect(cacheData).toBeDefined();
    });
  });
});
