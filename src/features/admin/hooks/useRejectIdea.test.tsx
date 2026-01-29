// src/features/admin/hooks/useRejectIdea.test.tsx
// Story 5.5 - Task 3: Test suite for useRejectIdea hook with optimistic updates

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRejectIdea } from './useRejectIdea';
import { adminService } from '../services/adminService';
import type { ReactNode } from 'react';

// Mock adminService
vi.mock('../services/adminService', () => ({
  adminService: {
    rejectIdea: vi.fn(),
  },
}));

// Mock toast
vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
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

describe('useRejectIdea - Story 5.5 Task 3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Subtask 3.2: Implement useMutation with rejectIdea service function', () => {
    it('successfully rejects an idea using adminService', async () => {
      const mockRejectedIdea = {
        id: 'idea-1',
        status: 'rejected',
        rejection_feedback: 'This idea needs more detail about the target market and specific user problems.',
        rejected_at: new Date().toISOString(),
        rejected_by: 'admin-123',
        status_updated_at: new Date().toISOString(),
      };

      vi.mocked(adminService.rejectIdea).mockResolvedValue({
        data: mockRejectedIdea,
        error: null,
      });

      const { result } = renderHook(() => useRejectIdea(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        ideaId: 'idea-1',
        feedback: 'This idea needs more detail about the target market and specific user problems.',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(adminService.rejectIdea).toHaveBeenCalledWith(
        'idea-1',
        'This idea needs more detail about the target market and specific user problems.'
      );
    });
  });

  describe('Subtask 3.3: Add onMutate for optimistic UI updates', () => {
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
      queryClient.setQueryData(['admin', 'pipeline'], {
        submitted: [{ id: 'idea-1', status: 'submitted', title: 'Test Idea' }],
        approved: [],
        prd_development: [],
        prototype_complete: [],
      });

      vi.mocked(adminService.rejectIdea).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ 
          data: { id: 'idea-1', status: 'rejected' }, 
          error: null 
        }), 100))
      );

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useRejectIdea(), { wrapper });

      result.current.mutate({
        ideaId: 'idea-1',
        feedback: 'This idea needs more detail about the target market.',
      });

      // Check optimistic update happened - idea should be marked rejected
      await waitFor(() => {
        const ideasData = queryClient.getQueryData(['admin', 'ideas']) as any[];
        expect(ideasData).toBeDefined();
        const idea = ideasData?.find((i: any) => i.id === 'idea-1');
        expect(idea?.status).toBe('rejected');
      });

      // Check idea removed from pipeline submitted column
      await waitFor(() => {
        const pipelineData = queryClient.getQueryData(['admin', 'pipeline']) as any;
        expect(pipelineData?.submitted).toBeDefined();
        expect(pipelineData.submitted.find((i: any) => i.id === 'idea-1')).toBeUndefined();
      });
    });
  });

  describe('Subtask 3.4: Invalidate relevant React Query caches', () => {
    it('invalidates admin ideas cache on success', async () => {
      vi.mocked(adminService.rejectIdea).mockResolvedValue({
        data: { id: 'idea-1', status: 'rejected' },
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

      const { result } = renderHook(() => useRejectIdea(), { wrapper });

      result.current.mutate({
        ideaId: 'idea-1',
        feedback: 'This idea needs more detail about the target market.',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin', 'ideas'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin', 'pipeline'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin', 'metrics'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['ideas', 'list'] });
    });
  });

  describe('Subtask 3.6: Handle errors with rollback and error toast', () => {
    it('handles errors when rejection fails', async () => {
      vi.mocked(adminService.rejectIdea).mockResolvedValue({
        data: null,
        error: { message: 'Update failed', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useRejectIdea(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        ideaId: 'idea-1',
        feedback: 'This idea needs more detail about the target market.',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('handles validation error for short feedback', async () => {
      vi.mocked(adminService.rejectIdea).mockResolvedValue({
        data: null,
        error: { message: 'Feedback must be at least 20 characters', code: 'VALIDATION_ERROR' },
      });

      const { result } = renderHook(() => useRejectIdea(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        ideaId: 'idea-1',
        feedback: 'Too short',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Feedback must be at least 20 characters');
    });

    it('handles already-reviewed error', async () => {
      vi.mocked(adminService.rejectIdea).mockResolvedValue({
        data: null,
        error: { message: 'This idea has already been reviewed', code: 'ALREADY_REVIEWED' },
      });

      const { result } = renderHook(() => useRejectIdea(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        ideaId: 'idea-1',
        feedback: 'This idea needs more detail about the target market.',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('This idea has already been reviewed');
    });

    it('rolls back optimistic update on error', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      // Set initial cache data
      const initialIdeas = [
        { id: 'idea-1', status: 'submitted', title: 'Test Idea' },
      ];
      const initialPipeline = {
        submitted: [{ id: 'idea-1', status: 'submitted', title: 'Test Idea' }],
        approved: [],
        prd_development: [],
        prototype_complete: [],
      };
      queryClient.setQueryData(['admin', 'ideas'], initialIdeas);
      queryClient.setQueryData(['admin', 'pipeline'], initialPipeline);

      vi.mocked(adminService.rejectIdea).mockResolvedValue({
        data: null,
        error: { message: 'Update failed', code: 'DB_ERROR' },
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useRejectIdea(), { wrapper });

      result.current.mutate({
        ideaId: 'idea-1',
        feedback: 'This idea needs more detail about the target market.',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Verify rollback happened - cache should be restored
      const ideasData = queryClient.getQueryData(['admin', 'ideas']) as any[];
      expect(ideasData).toBeDefined();
      expect(ideasData[0].status).toBe('submitted');

      const pipelineData = queryClient.getQueryData(['admin', 'pipeline']) as any;
      expect(pipelineData?.submitted?.length).toBe(1);
    });
  });

  describe('Edge cases', () => {
    it('handles rejection with feedback at minimum length (20 chars)', async () => {
      const minFeedback = 'Exactly 20 chars....'; // 20 chars
      const mockRejectedIdea = {
        id: 'idea-1',
        status: 'rejected',
        rejection_feedback: minFeedback,
      };

      vi.mocked(adminService.rejectIdea).mockResolvedValue({
        data: mockRejectedIdea,
        error: null,
      });

      const { result } = renderHook(() => useRejectIdea(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        ideaId: 'idea-1',
        feedback: minFeedback,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('handles rejection with feedback at maximum length (500 chars)', async () => {
      const maxFeedback = 'a'.repeat(500);
      const mockRejectedIdea = {
        id: 'idea-1',
        status: 'rejected',
        rejection_feedback: maxFeedback,
      };

      vi.mocked(adminService.rejectIdea).mockResolvedValue({
        data: mockRejectedIdea,
        error: null,
      });

      const { result } = renderHook(() => useRejectIdea(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        ideaId: 'idea-1',
        feedback: maxFeedback,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
