import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSubmitIdea, ideaQueryKeys, type WizardSubmitData } from './useSubmitIdea';
import { ideaService } from '../services/ideaService';

// Mock ideaService
vi.mock('../services/ideaService', () => ({
  ideaService: {
    createIdea: vi.fn(),
  },
}));

// Mock useToast hook
const mockToast = vi.fn();
vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockIdeaService = vi.mocked(ideaService);

describe('useSubmitIdea', () => {
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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );

  const mockWizardData: WizardSubmitData = {
    problem: 'This is a test problem statement that describes the issue we need to solve',
    solution: 'This is a test solution that addresses the problem',
    impact: 'This is the expected impact of implementing this solution',
    useEnhanced: false,
  };

  const mockWizardDataWithEnhanced: WizardSubmitData = {
    problem: 'Original problem statement',
    solution: 'Original solution',
    impact: 'Original impact',
    enhancedProblem: 'Enhanced problem statement with AI improvements',
    enhancedSolution: 'Enhanced solution with AI improvements',
    enhancedImpact: 'Enhanced impact with AI improvements',
    useEnhanced: true,
  };

  const mockCreatedIdea = {
    id: 'test-idea-id',
    user_id: 'test-user-id',
    title: 'This is a test problem statement that describes...',
    problem: mockWizardData.problem,
    solution: mockWizardData.solution,
    impact: mockWizardData.impact,
    enhanced_problem: null,
    enhanced_solution: null,
    enhanced_impact: null,
    status: 'submitted' as const,
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-01-20T12:00:00Z',
  };

  describe('successful submission flow', () => {
    it('calls ideaService.createIdea with mapped wizard data', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: mockCreatedIdea,
        error: null,
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(mockIdeaService.createIdea).toHaveBeenCalledWith({
          title: expect.any(String),
          problem: mockWizardData.problem,
          solution: mockWizardData.solution,
          impact: mockWizardData.impact,
          enhanced_problem: undefined,
          enhanced_solution: undefined,
          enhanced_impact: undefined,
        });
      });
    });

    it('generates title from problem statement', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: mockCreatedIdea,
        error: null,
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        const createCall = mockIdeaService.createIdea.mock.calls[0][0];
        expect(createCall.title).toBe('This is a test problem statement that describes...');
      });
    });

    it('includes enhanced content when user chose enhanced version', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: { ...mockCreatedIdea, enhanced_problem: 'Enhanced problem' },
        error: null,
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardDataWithEnhanced);

      await waitFor(() => {
        expect(mockIdeaService.createIdea).toHaveBeenCalledWith(
          expect.objectContaining({
            enhanced_problem: mockWizardDataWithEnhanced.enhancedProblem,
            enhanced_solution: mockWizardDataWithEnhanced.enhancedSolution,
            enhanced_impact: mockWizardDataWithEnhanced.enhancedImpact,
          })
        );
      });
    });

    it('sets enhanced fields to undefined when user declined enhancement', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: mockCreatedIdea,
        error: null,
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea({
        ...mockWizardDataWithEnhanced,
        useEnhanced: false,
      });

      await waitFor(() => {
        expect(mockIdeaService.createIdea).toHaveBeenCalledWith(
          expect.objectContaining({
            enhanced_problem: undefined,
            enhanced_solution: undefined,
            enhanced_impact: undefined,
          })
        );
      });
    });

    it('shows success toast after submission', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: mockCreatedIdea,
        error: null,
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success!',
          description: 'Your idea has been submitted successfully.',
          variant: 'success',
        });
      });
    });

    it('navigates to /ideas after successful submission', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: mockCreatedIdea,
        error: null,
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ideas');
      });
    });

    it('invalidates ideas query cache on success', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: mockCreatedIdea,
        error: null,
      });

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ideaQueryKeys.all,
        });
      });
    });

    it('calls onSuccess callback when provided', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: mockCreatedIdea,
        error: null,
      });

      const onSuccessMock = vi.fn();
      const { result } = renderHook(() => useSubmitIdea({ onSuccess: onSuccessMock }), {
        wrapper,
      });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(onSuccessMock).toHaveBeenCalled();
      });
    });
  });

  describe('error handling flow', () => {
    it('shows error toast on submission failure', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Submission Failed',
          description: 'Failed to save idea. Please try again.',
          variant: 'error',
          duration: 8000,
        });
      });
    });

    it('shows session expired message for auth errors', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated', code: 'AUTH_REQUIRED' },
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Session expired. Please log in again.',
          })
        );
      });
    });

    it('does not navigate on error', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: null,
        error: { message: 'Error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not call onSuccess callback on error', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: null,
        error: { message: 'Error', code: 'DB_ERROR' },
      });

      const onSuccessMock = vi.fn();
      const { result } = renderHook(() => useSubmitIdea({ onSuccess: onSuccessMock }), {
        wrapper,
      });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(onSuccessMock).not.toHaveBeenCalled();
    });

    it('handles network/unknown errors gracefully', async () => {
      mockIdeaService.createIdea.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it('logs error to console on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockIdeaService.createIdea.mockResolvedValue({
        data: null,
        error: { message: 'Test error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Submit idea error:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('mutation state', () => {
    it('returns isSubmitting true while mutation is pending', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockIdeaService.createIdea.mockReturnValue(pendingPromise as ReturnType<typeof ideaService.createIdea>);

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      expect(result.current.isSubmitting).toBe(false);

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      // Resolve to complete test
      resolvePromise!({ data: mockCreatedIdea, error: null });
    });

    it('returns error object when mutation fails', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: null,
        error: { message: 'Test error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });

    it('resets error state with reset function', async () => {
      mockIdeaService.createIdea.mockResolvedValue({
        data: null,
        error: { message: 'Test error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      result.current.submitIdea(mockWizardData);

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      result.current.reset();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('initial state has no error and not submitting', () => {
      const { result } = renderHook(() => useSubmitIdea(), { wrapper });

      expect(result.current.error).toBeNull();
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });
  });
});

describe('ideaQueryKeys', () => {
  it('has correct key structure', () => {
    expect(ideaQueryKeys.all).toEqual(['ideas']);
    expect(ideaQueryKeys.lists()).toEqual(['ideas', 'list']);
    expect(ideaQueryKeys.list({ status: 'submitted' })).toEqual(['ideas', 'list', { status: 'submitted' }]);
    expect(ideaQueryKeys.details()).toEqual(['ideas', 'detail']);
    expect(ideaQueryKeys.detail('123')).toEqual(['ideas', 'detail', '123']);
  });
});
