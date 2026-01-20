import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ideaService } from '../services/ideaService';
import { useToast } from '../../../hooks/useToast';
import { generateIdeaTitle } from '../utils/ideaUtils';
import { ROUTES } from '../../../routes/routeConstants';
import type { CreateIdeaInput } from '../../../types/database';

/**
 * Wizard data shape for the idea submission
 */
export interface WizardSubmitData {
  problem: string;
  solution: string;
  impact: string;
  enhancedProblem?: string;
  enhancedSolution?: string;
  enhancedImpact?: string;
  useEnhanced: boolean;
}

interface UseSubmitIdeaOptions {
  /** Optional callback for additional cleanup after successful submission */
  onSuccess?: () => void;
}

/**
 * Query keys for ideas feature
 */
export const ideaQueryKeys = {
  all: ['ideas'] as const,
  lists: () => [...ideaQueryKeys.all, 'list'] as const,
  list: (filters?: { status?: string }) => [...ideaQueryKeys.lists(), filters] as const,
  details: () => [...ideaQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...ideaQueryKeys.details(), id] as const,
};

/**
 * Hook for submitting an idea to the database
 * 
 * Handles:
 * - Mapping wizard data to CreateIdeaInput format
 * - Auto-generating title from problem statement
 * - Success: cache invalidation, toast notification, navigation
 * - Error: toast notification, preserves form state for retry
 * 
 * @param options - Optional callbacks
 * @returns Mutation state and submitIdea function
 */
export function useSubmitIdea(options?: UseSubmitIdeaOptions) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (wizardData: WizardSubmitData) => {
      // Map wizard data to CreateIdeaInput
      const input: CreateIdeaInput = {
        title: generateIdeaTitle(wizardData.problem),
        problem: wizardData.problem,
        solution: wizardData.solution,
        impact: wizardData.impact,
        // Include enhanced content only if user chose to use it AND it exists
        enhanced_problem: wizardData.useEnhanced && wizardData.enhancedProblem 
          ? wizardData.enhancedProblem 
          : undefined,
        enhanced_solution: wizardData.useEnhanced && wizardData.enhancedSolution 
          ? wizardData.enhancedSolution 
          : undefined,
        enhanced_impact: wizardData.useEnhanced && wizardData.enhancedImpact 
          ? wizardData.enhancedImpact 
          : undefined,
      };

      const result = await ideaService.createIdea(input);

      if (result.error) {
        // Map error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
          AUTH_REQUIRED: 'Session expired. Please log in again.',
          DB_ERROR: 'Failed to save idea. Please try again.',
          UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
        };
        
        const message = result.error.code 
          ? errorMessages[result.error.code] ?? result.error.message
          : result.error.message;
          
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate ideas cache to trigger fresh fetch
      queryClient.invalidateQueries({ queryKey: ideaQueryKeys.all });

      // Show success message
      toast({
        title: 'Success!',
        description: 'Your idea has been submitted successfully.',
        variant: 'success',
      });

      // Call optional success callback (e.g., clear wizard state)
      options?.onSuccess?.();

      // Navigate to ideas list
      navigate(ROUTES.IDEAS);
    },
    onError: (error: Error) => {
      console.error('Submit idea error:', error);

      // Show error toast with user-friendly message
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit idea. Please try again.',
        variant: 'error',
        duration: 8000, // Keep error visible longer
      });

      // NOTE: Wizard data is preserved automatically - no clearing on error
    },
  });

  return {
    submitIdea: mutation.mutate,
    submitIdeaAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
    isSuccess: mutation.isSuccess,
  };
}
