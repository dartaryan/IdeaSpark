import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useIdeas } from './useIdeas';
import { ideaService } from '../services/ideaService';
import type { Idea } from '../types';

// Mock ideaService
vi.mock('../services/ideaService', () => ({
  ideaService: {
    getMyIdeas: vi.fn(),
  },
}));

const mockIdeaService = vi.mocked(ideaService);

describe('useIdeas', () => {
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

  const mockIdeas: Idea[] = [
    {
      id: 'idea-1',
      user_id: 'user-1',
      title: 'First Idea',
      problem: 'Problem 1',
      solution: 'Solution 1',
      impact: 'Impact 1',
      enhanced_problem: null,
      enhanced_solution: null,
      enhanced_impact: null,
      status: 'submitted',
      created_at: '2026-01-20T12:00:00Z',
      updated_at: '2026-01-20T12:00:00Z',
    },
    {
      id: 'idea-2',
      user_id: 'user-1',
      title: 'Second Idea',
      problem: 'Problem 2',
      solution: 'Solution 2',
      impact: 'Impact 2',
      enhanced_problem: null,
      enhanced_solution: null,
      enhanced_impact: null,
      status: 'approved',
      created_at: '2026-01-19T12:00:00Z',
      updated_at: '2026-01-19T12:00:00Z',
    },
  ];

  describe('successful data fetching', () => {
    it('fetches ideas using ideaService.getMyIdeas', async () => {
      mockIdeaService.getMyIdeas.mockResolvedValue({
        data: mockIdeas,
        error: null,
      });

      const { result } = renderHook(() => useIdeas(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockIdeaService.getMyIdeas).toHaveBeenCalled();
    });

    it('returns ideas array when fetch succeeds', async () => {
      mockIdeaService.getMyIdeas.mockResolvedValue({
        data: mockIdeas,
        error: null,
      });

      const { result } = renderHook(() => useIdeas(), { wrapper });

      await waitFor(() => {
        expect(result.current.ideas).toEqual(mockIdeas);
      });
    });

    it('returns empty array when no ideas exist', async () => {
      mockIdeaService.getMyIdeas.mockResolvedValue({
        data: [],
        error: null,
      });

      const { result } = renderHook(() => useIdeas(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.ideas).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('returns ideas sorted by created_at descending (newest first)', async () => {
      mockIdeaService.getMyIdeas.mockResolvedValue({
        data: mockIdeas,
        error: null,
      });

      const { result } = renderHook(() => useIdeas(), { wrapper });

      await waitFor(() => {
        expect(result.current.ideas.length).toBe(2);
      });

      // First idea should be the newest (2026-01-20)
      expect(result.current.ideas[0].id).toBe('idea-1');
      // Second idea should be older (2026-01-19)
      expect(result.current.ideas[1].id).toBe('idea-2');
    });
  });

  describe('loading state', () => {
    it('returns isLoading true while fetching', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockIdeaService.getMyIdeas.mockReturnValue(
        pendingPromise as ReturnType<typeof ideaService.getMyIdeas>
      );

      const { result } = renderHook(() => useIdeas(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.ideas).toEqual([]);

      // Resolve to clean up
      resolvePromise!({ data: [], error: null });
    });

    it('returns isLoading false after fetch completes', async () => {
      mockIdeaService.getMyIdeas.mockResolvedValue({
        data: mockIdeas,
        error: null,
      });

      const { result } = renderHook(() => useIdeas(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('returns error when fetch fails', async () => {
      mockIdeaService.getMyIdeas.mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch ideas', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useIdeas(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toBe('Failed to fetch ideas');
    });

    it('returns empty ideas array on error', async () => {
      mockIdeaService.getMyIdeas.mockResolvedValue({
        data: null,
        error: { message: 'Error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useIdeas(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.ideas).toEqual([]);
    });
  });

  describe('refetch functionality', () => {
    it('provides refetch function', async () => {
      mockIdeaService.getMyIdeas.mockResolvedValue({
        data: mockIdeas,
        error: null,
      });

      const { result } = renderHook(() => useIdeas(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('refetch triggers new fetch', async () => {
      mockIdeaService.getMyIdeas.mockResolvedValue({
        data: mockIdeas,
        error: null,
      });

      const { result } = renderHook(() => useIdeas(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockIdeaService.getMyIdeas).toHaveBeenCalledTimes(1);

      // Trigger refetch
      result.current.refetch();

      await waitFor(() => {
        expect(mockIdeaService.getMyIdeas).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('initial state', () => {
    it('returns empty ideas array initially', () => {
      mockIdeaService.getMyIdeas.mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useIdeas(), { wrapper });

      expect(result.current.ideas).toEqual([]);
    });

    it('returns no error initially', () => {
      mockIdeaService.getMyIdeas.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useIdeas(), { wrapper });

      expect(result.current.error).toBeNull();
    });
  });
});
