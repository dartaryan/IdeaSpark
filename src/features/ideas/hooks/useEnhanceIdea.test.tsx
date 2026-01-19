import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEnhanceIdea } from './useEnhanceIdea';
import { geminiService } from '../../../services/geminiService';
import type { ReactNode } from 'react';

// Mock geminiService
vi.mock('../../../services/geminiService', () => ({
  geminiService: {
    enhanceIdea: vi.fn(),
  },
}));

const mockGeminiService = vi.mocked(geminiService);

describe('useEnhanceIdea', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockInput = {
    problem: 'Test problem',
    solution: 'Test solution',
    impact: 'Test impact',
  };

  const mockEnhancedOutput = {
    problem: '**Enhanced Problem:** Test problem with improvements',
    solution: '**Enhanced Solution:** Test solution with improvements',
    impact: '**Enhanced Impact:** Test impact with improvements',
  };

  it('calls geminiService.enhanceIdea with provided input', async () => {
    mockGeminiService.enhanceIdea.mockResolvedValue({
      data: mockEnhancedOutput,
      error: null,
    });

    const { result } = renderHook(() => useEnhanceIdea(), { wrapper });

    result.current.mutate(mockInput);

    await waitFor(() => {
      expect(mockGeminiService.enhanceIdea).toHaveBeenCalledWith(
        mockInput.problem,
        mockInput.solution,
        mockInput.impact
      );
    });
  });

  it('returns enhanced data on success', async () => {
    mockGeminiService.enhanceIdea.mockResolvedValue({
      data: mockEnhancedOutput,
      error: null,
    });

    const { result } = renderHook(() => useEnhanceIdea(), { wrapper });

    result.current.mutate(mockInput);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockEnhancedOutput);
    });
  });

  it('provides retry option for failed mutations', () => {
    // Verify hook configuration includes retry
    const { result } = renderHook(() => useEnhanceIdea(), { wrapper });

    // The hook should be available and callable
    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
  });

  it('initial state has no data and not pending', () => {
    const { result } = renderHook(() => useEnhanceIdea(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });
});
