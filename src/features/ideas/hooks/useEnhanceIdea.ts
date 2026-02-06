import { useMutation } from '@tanstack/react-query';
import { geminiService } from '../../../services/geminiService';

interface EnhanceIdeaInput {
  problem: string;
  solution: string;
  impact: string;
}

interface EnhanceIdeaOutput {
  problem: string;
  solution: string;
  impact: string;
}

/**
 * useEnhanceIdea - Hook for enhancing idea content with AI
 *
 * Uses React Query mutation pattern with automatic retry logic.
 * Calls geminiService.enhanceIdea() via Supabase Edge Function
 */
export function useEnhanceIdea() {
  return useMutation<EnhanceIdeaOutput, Error, EnhanceIdeaInput>({
    mutationFn: async (input) => {
      const response = await geminiService.enhanceIdea(
        input.problem,
        input.solution,
        input.impact
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data!;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
