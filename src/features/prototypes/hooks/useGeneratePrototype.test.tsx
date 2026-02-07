import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGeneratePrototype } from './useGeneratePrototype';
import { openLovableService } from '../../../services/openLovableService';
import { supabase } from '../../../lib/supabase';

vi.mock('../../../services/openLovableService');
vi.mock('../../../lib/supabase');

// Mock localStorage for test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

describe('useGeneratePrototype', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    localStorageMock.clear();
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

    // Wait for state updates to settle
    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    // Retry
    await act(async () => {
      result.current.retry();
    });
    
    // Should be generating again
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

    vi.mocked(openLovableService.pollStatus).mockResolvedValue({
      data: { status: 'ready' },
      error: null,
    });

    const { result } = renderHook(() => useGeneratePrototype(), { wrapper });

    await result.current.generate('prd-1', 'idea-1');

    await waitFor(() => expect(result.current.isGenerating).toBe(false));

    // Verify localStorage.setItem was called with correct state during generation
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'prototype_generation_state',
      expect.stringContaining('proto-123')
    );
    
    // Verify the saved state contained all expected fields
    const savedCall = localStorageMock.setItem.mock.calls.find(
      (call: string[]) => call[0] === 'prototype_generation_state'
    );
    expect(savedCall).toBeTruthy();
    const state = JSON.parse(savedCall![1]);
    expect(state.prototypeId).toBe('proto-123');
    expect(state.prdId).toBe('prd-1');
    expect(state.ideaId).toBe('idea-1');
  });

  it('should update idea status on successful generation', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
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
    });

    // Mock supabase.from to return different chains for different tables
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'prd_documents') {
        return {
          select: mockSelect,
          eq: vi.fn().mockReturnThis(),
          single: mockSingle,
        } as any;
      }
      if (table === 'ideas') {
        return {
          update: mockUpdate,
        } as any;
      }
      return {} as any;
    });

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

    // Verify idea status was updated via chain: .from('ideas').update({status}).eq('id', ideaId)
    expect(supabase.from).toHaveBeenCalledWith('ideas');
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'prototype_complete' });
    expect(mockEq).toHaveBeenCalledWith('id', 'idea-1');
  });
});
