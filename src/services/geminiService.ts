import { supabase } from '../lib/supabase';

/**
 * Service Response Type
 * Consistent response wrapper for all service layer operations
 */
export type ServiceResponse<T> = {
  data: T | null;
  error: { message: string; code: string } | null;
};

interface EnhancedIdea {
  problem: string;
  solution: string;
  impact: string;
}

interface EdgeFunctionResponse {
  enhanced_problem: string;
  enhanced_solution: string;
  enhanced_impact: string;
}

interface EdgeFunctionError {
  error: string;
  code: string;
}

/**
 * geminiService - Service layer for AI operations using Gemini
 *
 * Calls the gemini-enhance Supabase Edge Function which:
 * - Protects the Gemini API key server-side
 * - Implements retry logic with exponential backoff (3 retries)
 * - Returns enhanced problem, solution, and impact text
 */
export const geminiService = {
  /**
   * Enhance idea with AI assistance via Supabase Edge Function
   *
   * @param problem - The problem statement
   * @param solution - The proposed solution
   * @param impact - The expected impact
   * @returns Enhanced versions of all three fields
   */
  async enhanceIdea(
    problem: string,
    solution: string,
    impact: string
  ): Promise<ServiceResponse<EnhancedIdea>> {
    try {
      const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse>(
        'gemini-enhance',
        {
          body: { problem, solution, impact },
        }
      );

      if (error) {
        console.error('Edge function error:', error);
        return {
          data: null,
          error: {
            message: error.message || 'Failed to enhance idea with AI',
            code: 'EDGE_FUNCTION_ERROR',
          },
        };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'No data returned from AI enhancement', code: 'NO_DATA' },
        };
      }

      // Check for error response from Edge Function
      if ('error' in data && 'code' in data) {
        const errorData = data as unknown as EdgeFunctionError;
        return {
          data: null,
          error: { message: errorData.error, code: errorData.code },
        };
      }

      // Map Edge Function response to service response
      return {
        data: {
          problem: data.enhanced_problem,
          solution: data.enhanced_solution,
          impact: data.enhanced_impact,
        },
        error: null,
      };
    } catch (error) {
      console.error('AI enhancement error:', error);
      return {
        data: null,
        error: {
          message: 'Failed to enhance idea with AI',
          code: 'AI_ENHANCE_ERROR',
        },
      };
    }
  },
};
