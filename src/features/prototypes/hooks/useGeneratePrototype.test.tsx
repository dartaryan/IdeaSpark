import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGeneratePrototype } from './useGeneratePrototype';
import { openLovableService } from '../../../services/openLovableService';
import { supabase } from '../../../lib/supabase';

vi.mock('../../../services/openLovableService');
vi.mock('../../../lib/supabase');

describe('useGeneratePrototype', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGeneratePrototype(), { wrapper });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toEqual({ stage: 'analyzing', percent: 0 });
  });

  it('should generate prototype successfully', async () => {
    const mockOnSuccess = vi.fn();

    // Mock PRD fetch
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          content: {
            problemStatement: 'Test problem',
            goalsAndMetrics: 'Test goals',
            userStories: 'Test stories',
            requirements: 'Test requirements',
            technicalConsiderations: 'Test tech',
          },
        },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
    } as any);

    // Mock generate call
    vi.mocked(openLovableService.generate).mockResolvedValue({
      data: { prototypeId: 'proto-123', status: 'generating' },
      error: null,
    });

    // Mock pollStatus - return ready immediately
    vi.mocked(openLovableService.pollStatus).mockResolvedValue({
      data: { status: 'ready', url: 'https://example.com', code: 'code' },
      error: null,
    });

    const { result } = renderHook(
      () => useGeneratePrototype({ onSuccess: mockOnSuccess }),
      { wrapper }
    );

    // Call generate
    await result.current.generate('prd-1', 'idea-1');

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    expect(mockOnSuccess).toHaveBeenCalledWith('proto-123');
    expect(openLovableService.generate).toHaveBeenCalledWith(
      'prd-1',
      'idea-1',
      expect.objectContaining({
        problemStatement: 'Test problem',
        goals: 'Test goals',
        userStories: 'Test stories',
        requirements: 'Test requirements',
        technicalConsiderations: 'Test tech',
      })
    );
  });

  it('should handle PRD fetch error', async () => {
    const mockOnError = vi.fn();

    // Mock PRD fetch error
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'PRD not found' },
      }),
    } as any);

    const { result } = renderHook(
      () => useGeneratePrototype({ onError: mockOnError }),
      { wrapper }
    );

    await result.current.generate('prd-1', 'idea-1');

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.message).toBe('Failed to load PRD content');
    expect(mockOnError).toHaveBeenCalled();
  });

  it('should handle generation API error', async () => {
    const mockOnError = vi.fn();

    // Mock successful PRD fetch
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          content: {
            problemStatement: 'Test problem',
            goalsAndMetrics: 'Test goals',
            userStories: 'Test stories',
            requirements: 'Test requirements',
            technicalConsiderations: 'Test tech',
          },
        },
        error: null,
      }),
    } as any);

    // Mock generate call error
    vi.mocked(openLovableService.generate).mockResolvedValue({
      data: null,
      error: { message: 'API error', code: 'API_ERROR' },
    });

    const { result } = renderHook(
      () => useGeneratePrototype({ onError: mockOnError }),
      { wrapper }
    );

    await result.current.generate('prd-1', 'idea-1');

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.message).toContain('API error');
    expect(mockOnError).toHaveBeenCalled();
  });

  it('should handle polling failure', async () => {
    const mockOnError = vi.fn();

    // Mock successful PRD and generate
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          content: {
            problemStatement: 'Test',
            goalsAndMetrics: 'Test',
            userStories: 'Test',
            requirements: 'Test',
            technicalConsiderations: 'Test',
          },
        },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
    } as any);

    vi.mocked(openLovableService.generate).mockResolvedValue({
      data: { prototypeId: 'proto-123', status: 'generating' },
      error: null,
    });

    // Mock pollStatus - return failed
    vi.mocked(openLovableService.pollStatus).mockResolvedValue({
      data: { status: 'failed' },
      error: null,
    });

    const { result } = renderHook(
      () => useGeneratePrototype({ onError: mockOnError }),
      { wrapper }
    );

    await result.current.generate('prd-1', 'idea-1');

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.message).toContain('failed');
    expect(mockOnError).toHaveBeenCalled();
  });

  it('should support retry functionality', async () => {
    // Mock successful flow
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          content: {
            problemStatement: 'Test',
            goalsAndMetrics: 'Test',
            userStories: 'Test',
            requirements: 'Test',
            technicalConsiderations: 'Test',
          },
        },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
    } as any);

    vi.mocked(openLovableService.generate).mockResolvedValue({
      data: { prototypeId: 'proto-123', status: 'generating' },
      error: null,
    });

    vi.mocked(openLovableService.pollStatus).mockResolvedValue({
      data: { status: 'ready', url: 'https://example.com' },
      error: null,
    });

    const { result } = renderHook(() => useGeneratePrototype(), { wrapper });

    // First generation
    await result.current.generate('prd-1', 'idea-1');
    await waitFor(() => expect(result.current.isGenerating).toBe(false));

    // Retry
    result.current.retry();
    await waitFor(() => expect(result.current.isGenerating).toBe(false));

    expect(openLovableService.generate).toHaveBeenCalledTimes(2);
  });

  it('should persist generation state to localStorage', async () => {
    // Mock successful PRD and generate
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          content: {
            problemStatement: 'Test',
            goalsAndMetrics: 'Test',
            userStories: 'Test',
            requirements: 'Test',
            technicalConsiderations: 'Test',
          },
        },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
    } as any);

    vi.mocked(openLovableService.generate).mockResolvedValue({
      data: { prototypeId: 'proto-123', status: 'generating' },
      error: null,
    });

    // Mock pollStatus to keep generating
    vi.mocked(openLovableService.pollStatus).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ data: { status: 'ready' }, error: null }),
            100
          )
        )
    );

    const { result } = renderHook(() => useGeneratePrototype(), { wrapper });

    await result.current.generate('prd-1', 'idea-1');

    // Check localStorage was set
    const savedState = localStorage.getItem('prototype_generation_state');
    expect(savedState).toBeTruthy();
    const state = JSON.parse(savedState!);
    expect(state.prototypeId).toBe('proto-123');
    expect(state.prdId).toBe('prd-1');
    expect(state.ideaId).toBe('idea-1');

    await waitFor(() => expect(result.current.isGenerating).toBe(false));
  });

  it('should update idea status on successful generation', async () => {
    const mockUpdate = vi.fn().mockReturnThis();

    // Mock successful PRD fetch
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          content: {
            problemStatement: 'Test',
            goalsAndMetrics: 'Test',
            userStories: 'Test',
            requirements: 'Test',
            technicalConsiderations: 'Test',
          },
        },
        error: null,
      }),
      update: mockUpdate,
    } as any);

    vi.mocked(openLovableService.generate).mockResolvedValue({
      data: { prototypeId: 'proto-123', status: 'generating' },
      error: null,
    });

    vi.mocked(openLovableService.pollStatus).mockResolvedValue({
      data: { status: 'ready' },
      error: null,
    });

    const { result } = renderHook(() => useGeneratePrototype(), { wrapper });

    await result.current.generate('prd-1', 'idea-1');

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    // Verify idea status was updated
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'prototype_complete' });
  });
});
