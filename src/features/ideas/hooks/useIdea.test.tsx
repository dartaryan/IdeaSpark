import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useIdea } from './useIdea';
import { ideaService } from '../services/ideaService';
import type { Idea } from '../types';

// Mock ideaService
vi.mock('../services/ideaService', () => ({
  ideaService: {
    getIdeaById: vi.fn(),
  },
}));

const mockIdeaService = vi.mocked(ideaService);

describe('useIdea', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockIdea: Idea = {
    id: 'idea-123',
    user_id: 'user-1',
    title: 'Test Idea',
    problem: 'Problem statement',
    solution: 'Proposed solution',
    impact: 'Expected impact',
    enhanced_problem: 'Enhanced problem',
    enhanced_solution: 'Enhanced solution',
    enhanced_impact: 'Enhanced impact',
    status: 'approved',
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-01-20T12:00:00Z',
  };

  describe('successful data fetching', () => {
    it('fetches idea using ideaService.getIdeaById', async () => {
      mockIdeaService.getIdeaById.mockResolvedValue({
        data: mockIdea,
        error: null,
      });

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockIdeaService.getIdeaById).toHaveBeenCalledWith('idea-123');
    });

    it('returns idea when fetch succeeds', async () => {
      mockIdeaService.getIdeaById.mockResolvedValue({
        data: mockIdea,
        error: null,
      });

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.idea).toEqual(mockIdea);
      });
    });

    it('returns isNotFound false when idea exists', async () => {
      mockIdeaService.getIdeaById.mockResolvedValue({
        data: mockIdea,
        error: null,
      });

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isNotFound).toBe(false);
      });
    });
  });

  describe('idea not found scenario', () => {
    it('returns isNotFound true when idea does not exist', async () => {
      mockIdeaService.getIdeaById.mockResolvedValue({
        data: null,
        error: { message: 'Idea not found', code: 'NOT_FOUND' },
      });

      const { result } = renderHook(() => useIdea('idea-999'), { wrapper });

      await waitFor(() => {
        expect(result.current.isNotFound).toBe(true);
      });

      expect(result.current.idea).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('returns isNotFound false when loading', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockIdeaService.getIdeaById.mockReturnValue(
        pendingPromise as ReturnType<typeof ideaService.getIdeaById>
      );

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isNotFound).toBe(false);

      // Resolve to clean up
      resolvePromise!({ data: mockIdea, error: null });
    });

    it('returns isNotFound false when error occurs (not a not-found error)', async () => {
      mockIdeaService.getIdeaById.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.isNotFound).toBe(false);
    });
  });

  describe('loading state', () => {
    it('returns isLoading true while fetching', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockIdeaService.getIdeaById.mockReturnValue(
        pendingPromise as ReturnType<typeof ideaService.getIdeaById>
      );

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.idea).toBeNull();

      // Resolve to clean up
      resolvePromise!({ data: mockIdea, error: null });
    });

    it('returns isLoading false after fetch completes', async () => {
      mockIdeaService.getIdeaById.mockResolvedValue({
        data: mockIdea,
        error: null,
      });

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('returns error when fetch fails', async () => {
      mockIdeaService.getIdeaById.mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch idea', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toBe('Failed to fetch idea');
    });

    it('returns null idea on error', async () => {
      mockIdeaService.getIdeaById.mockResolvedValue({
        data: null,
        error: { message: 'Error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.idea).toBeNull();
    });
  });

  describe('undefined id parameter', () => {
    it('does not fetch when id is undefined', () => {
      mockIdeaService.getIdeaById.mockResolvedValue({
        data: mockIdea,
        error: null,
      });

      renderHook(() => useIdea(undefined), { wrapper });

      expect(mockIdeaService.getIdeaById).not.toHaveBeenCalled();
    });

    it('returns null idea and isNotFound false when id is undefined', async () => {
      const { result } = renderHook(() => useIdea(undefined), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.idea).toBeNull();
      expect(result.current.isNotFound).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('initial state', () => {
    it('returns null idea initially', () => {
      mockIdeaService.getIdeaById.mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      expect(result.current.idea).toBeNull();
    });

    it('returns no error initially', () => {
      mockIdeaService.getIdeaById.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      expect(result.current.error).toBeNull();
    });

    it('returns isNotFound false initially', () => {
      mockIdeaService.getIdeaById.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useIdea('idea-123'), { wrapper });

      expect(result.current.isNotFound).toBe(false);
    });
  });
});
