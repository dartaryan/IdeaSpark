import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import { usePrdBuilder } from './usePrdBuilder';
import { prdService } from '../services/prdService';
import type { PrdContent, PrdSectionUpdate } from '../types';

// Mock the services
vi.mock('../services/prdService');

// Mock useToast
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('usePrdBuilder', () => {
  let queryClient: QueryClient;
  const mockPrdId = 'test-prd-id';

  const mockPrdDocument = {
    id: mockPrdId,
    idea_id: 'test-idea-id',
    user_id: 'test-user-id',
    content: {
      problemStatement: { content: 'Initial problem', status: 'in_progress' as const },
      goalsAndMetrics: { content: '', status: 'empty' as const },
      userStories: { content: '', status: 'empty' as const },
      requirements: { content: '', status: 'empty' as const },
      technicalConsiderations: { content: '', status: 'empty' as const },
      risks: { content: '', status: 'empty' as const },
      timeline: { content: '', status: 'empty' as const },
    },
    status: 'draft' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup default mocks
    vi.mocked(prdService.getPrdById).mockResolvedValue({
      data: mockPrdDocument,
      error: null,
    });

    vi.mocked(prdService.updatePrdSection).mockResolvedValue({
      data: mockPrdDocument,
      error: null,
    });

    // Clear all timers before each test
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  describe('Initialization', () => {
    it('should load PRD content on mount', async () => {
      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.prdContent).toEqual(mockPrdDocument.content);
      expect(prdService.getPrdById).toHaveBeenCalledWith(mockPrdId);
    });

    it('should use initialContent if provided', () => {
      const initialContent: PrdContent = {
        problemStatement: { content: 'Test problem', status: 'complete' },
        goalsAndMetrics: { content: 'Test goals', status: 'in_progress' },
      };

      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId, initialContent }),
        { wrapper }
      );

      expect(result.current.prdContent).toEqual(initialContent);
    });

    it('should initialize with empty highlighted sections', () => {
      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      expect(result.current.highlightedSections).toEqual(new Set());
    });

    it('should initialize saving states', () => {
      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      expect(result.current.isSaving).toBe(false);
      expect(result.current.lastSaved).toBe(null);
    });
  });

  describe('Section Updates', () => {
    it('should handle single section update optimistically', async () => {
      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates: PrdSectionUpdate[] = [
        {
          sectionKey: 'problemStatement',
          content: 'Updated problem statement',
          status: 'complete',
        },
      ];

      await act(async () => {
        await result.current.handleSectionUpdates(updates);
      });

      // Check optimistic update
      expect(result.current.prdContent.problemStatement).toEqual({
        content: 'Updated problem statement',
        status: 'complete',
      });
    });

    it('should handle multiple section updates', async () => {
      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates: PrdSectionUpdate[] = [
        { sectionKey: 'problemStatement', content: 'Problem', status: 'complete' },
        { sectionKey: 'goalsAndMetrics', content: 'Goals', status: 'in_progress' },
      ];

      await act(async () => {
        await result.current.handleSectionUpdates(updates);
      });

      expect(result.current.prdContent.problemStatement?.content).toBe('Problem');
      expect(result.current.prdContent.goalsAndMetrics?.content).toBe('Goals');
    });

    it('should ignore empty updates array', async () => {
      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialContent = result.current.prdContent;

      await act(async () => {
        await result.current.handleSectionUpdates([]);
      });

      expect(result.current.prdContent).toEqual(initialContent);
      expect(prdService.updatePrdSection).not.toHaveBeenCalled();
    });
  });

  describe('Highlight Animation', () => {
    it('should add section to highlighted set on update', async () => {
      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates: PrdSectionUpdate[] = [
        { sectionKey: 'problemStatement', content: 'Test', status: 'in_progress' },
      ];

      await act(async () => {
        await result.current.handleSectionUpdates(updates);
      });

      expect(result.current.highlightedSections.has('problemStatement')).toBe(true);
    });

    it('should highlight multiple sections simultaneously', async () => {
      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates: PrdSectionUpdate[] = [
        { sectionKey: 'problemStatement', content: 'Test 1', status: 'in_progress' },
        { sectionKey: 'goalsAndMetrics', content: 'Test 2', status: 'in_progress' },
      ];

      await act(async () => {
        await result.current.handleSectionUpdates(updates);
      });

      expect(result.current.highlightedSections.has('problemStatement')).toBe(true);
      expect(result.current.highlightedSections.has('goalsAndMetrics')).toBe(true);
    });
  });

  describe('Save Functionality', () => {
    it('should set isSaving flag during save', async () => {
      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSaving).toBe(false);

      await act(async () => {
        await result.current.handleSectionUpdates([
          { sectionKey: 'problemStatement', content: 'Test', status: 'in_progress' },
        ]);
      });

      expect(result.current.isSaving).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should preserve local state on save failure', async () => {
      vi.mocked(prdService.updatePrdSection).mockResolvedValue({
        data: null,
        error: { message: 'Network error', code: 'NETWORK_ERROR' },
      });

      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates: PrdSectionUpdate[] = [
        { sectionKey: 'problemStatement', content: 'Updated content', status: 'complete' },
      ];

      await act(async () => {
        await result.current.handleSectionUpdates(updates);
      });

      // Local state should preserve the update
      expect(result.current.prdContent.problemStatement).toEqual({
        content: 'Updated content',
        status: 'complete',
      });
    });
  });

  describe('Manual State Updates', () => {
    it('should allow manual prdContent updates via setPrdContent', async () => {
      const { result } = renderHook(
        () => usePrdBuilder({ prdId: mockPrdId }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newContent: PrdContent = {
        problemStatement: { content: 'Manual update', status: 'complete' },
      };

      act(() => {
        result.current.setPrdContent(newContent);
      });

      expect(result.current.prdContent).toEqual(newContent);
    });
  });
});
