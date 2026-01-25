import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePrdBuilder } from './usePrdBuilder';
import { prdService } from '../services';
import type { PrdContent } from '../types';

// Mock the services
vi.mock('../services', () => ({
  prdService: {
    getPrdById: vi.fn(),
    updatePrd: vi.fn(),
  },
}));

// Mock useToast
vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock useAutoSave
vi.mock('./useAutoSave', () => ({
  useAutoSave: vi.fn((options) => ({
    saveStatus: 'idle',
    lastSaved: null,
    error: null,
    triggerSave: vi.fn(),
    clearError: vi.fn(),
  })),
}));

import { useAutoSave } from './useAutoSave';

describe('usePrdBuilder with auto-save', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  describe('AC1: Auto-save integration', () => {
    it('should integrate useAutoSave hook for PRD content saves', async () => {
      const mockPrd = {
        id: 'prd-1',
        content: { overview: { content: 'Initial content', status: 'in_progress' as const } },
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify useAutoSave was called with correct parameters
      expect(useAutoSave).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Object),
          saveFunction: expect.any(Function),
          debounceMs: 1000,
          savedDisplayMs: 3000,
          enabled: true,
        })
      );
    });

    it('should pass PRD content to useAutoSave', async () => {
      const mockPrd = {
        id: 'prd-1',
        content: {
          overview: { content: 'Test overview', status: 'in_progress' as const },
          features: { content: 'Test features', status: 'complete' as const },
        },
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.prdContent).toEqual(mockPrd.content);
      });

      // Verify the data passed to useAutoSave matches current content
      const autoSaveCall = vi.mocked(useAutoSave).mock.calls[
        vi.mocked(useAutoSave).mock.calls.length - 1
      ][0];
      expect(autoSaveCall.data).toEqual(mockPrd.content);
    });
  });

  describe('AC3: PRD restoration on page load', () => {
    it('should load complete PRD content via getPrdById', async () => {
      const mockPrd = {
        id: 'prd-1',
        content: {
          overview: { content: 'Overview content', status: 'complete' as const },
          goals: { content: 'Goals content', status: 'in_progress' as const },
        },
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(prdService.getPrdById).toHaveBeenCalledWith('prd-1');
      expect(result.current.prdContent).toEqual(mockPrd.content);
    });

    it('should restore prdContent to state after loading', async () => {
      const mockPrd = {
        id: 'prd-1',
        content: {
          overview: { content: 'Restored content', status: 'complete' as const },
        },
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      // Initial state should be empty
      expect(result.current.prdContent).toEqual({});

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // After loading, should be restored
      expect(result.current.prdContent).toEqual(mockPrd.content);
    });
  });

  describe('AC7: Section updates trigger auto-save', () => {
    it('should update prdContent when handleSectionUpdates is called', async () => {
      const mockPrd = {
        id: 'prd-1',
        content: {},
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger section update
      await act(async () => {
        await result.current.handleSectionUpdates([
          {
            sectionKey: 'overview',
            content: 'New overview content',
            status: 'in_progress',
          },
        ]);
      });

      // prdContent should be updated
      expect(result.current.prdContent.overview).toEqual({
        content: 'New overview content',
        status: 'in_progress',
      });
    });

    it('should add section to highlighted sections on update', async () => {
      const mockPrd = {
        id: 'prd-1',
        content: {},
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initially no highlighted sections
      expect(result.current.highlightedSections.size).toBe(0);

      // Trigger section update
      await act(async () => {
        await result.current.handleSectionUpdates([
          {
            sectionKey: 'goals',
            content: 'Goals content',
            status: 'in_progress',
          },
        ]);
      });

      // Section should be highlighted
      expect(result.current.highlightedSections.has('goals')).toBe(true);
    });
  });

  describe('Manual save capability', () => {
    it('should expose triggerSave from useAutoSave', async () => {
      const mockTriggerSave = vi.fn();
      vi.mocked(useAutoSave).mockReturnValue({
        saveStatus: 'idle',
        lastSaved: null,
        error: null,
        triggerSave: mockTriggerSave,
        clearError: vi.fn(),
      });

      const mockPrd = {
        id: 'prd-1',
        content: {},
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.triggerSave).toBeDefined();
      expect(typeof result.current.triggerSave).toBe('function');
    });

    it('should expose clearSaveError from useAutoSave', async () => {
      const mockClearError = vi.fn();
      vi.mocked(useAutoSave).mockReturnValue({
        saveStatus: 'error',
        lastSaved: null,
        error: 'Save failed',
        triggerSave: vi.fn(),
        clearError: mockClearError,
      });

      const mockPrd = {
        id: 'prd-1',
        content: {},
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.clearSaveError).toBeDefined();
      expect(typeof result.current.clearSaveError).toBe('function');
    });
  });

  describe('Return values', () => {
    it('should return saveStatus from useAutoSave', async () => {
      vi.mocked(useAutoSave).mockReturnValue({
        saveStatus: 'saved',
        lastSaved: new Date(),
        error: null,
        triggerSave: vi.fn(),
        clearError: vi.fn(),
      });

      const mockPrd = {
        id: 'prd-1',
        content: {},
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.saveStatus).toBe('saved');
    });

    it('should return lastSaved from useAutoSave', async () => {
      const mockLastSaved = new Date('2024-01-15T10:30:00');
      vi.mocked(useAutoSave).mockReturnValue({
        saveStatus: 'idle',
        lastSaved: mockLastSaved,
        error: null,
        triggerSave: vi.fn(),
        clearError: vi.fn(),
      });

      const mockPrd = {
        id: 'prd-1',
        content: {},
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.lastSaved).toBe(mockLastSaved);
    });

    it('should return saveError from useAutoSave', async () => {
      vi.mocked(useAutoSave).mockReturnValue({
        saveStatus: 'error',
        lastSaved: null,
        error: 'Network error',
        triggerSave: vi.fn(),
        clearError: vi.fn(),
      });

      const mockPrd = {
        id: 'prd-1',
        content: {},
      };

      vi.mocked(prdService.getPrdById).mockResolvedValue({
        data: mockPrd,
        error: null,
      });

      const { result } = renderHook(
        () =>
          usePrdBuilder({
            prdId: 'prd-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.saveError).toBe('Network error');
    });
  });
});
