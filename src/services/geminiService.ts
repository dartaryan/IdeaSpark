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

// Get Supabase URL and anon key from environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
      // Get the current session for auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Call Edge Function directly using fetch to have full control over headers
      const functionUrl = `${SUPABASE_URL}/functions/v1/gemini-enhance`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          // Use access token if available, otherwise use anon key as bearer
          'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ problem, solution, impact }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error:', response.status, errorText);
        return {
          data: null,
          error: {
            message: `Edge function error: ${response.status}`,
            code: 'EDGE_FUNCTION_ERROR',
          },
        };
      }

      const data: EdgeFunctionResponse | EdgeFunctionError = await response.json();

      if (!data) {
        return {
          data: null,
          error: {
            message: 'No data returned from AI enhancement',
            code: 'NO_DATA',
          },
        };
      }

      // Check for error response from Edge Function
      if ('error' in data && 'code' in data) {
        const errorData = data as EdgeFunctionError;
        return {
          data: null,
          error: { message: errorData.error, code: errorData.code },
        };
      }

      const successData = data as EdgeFunctionResponse;

      // Map Edge Function response to service response
      return {
        data: {
          problem: successData.enhanced_problem,
          solution: successData.enhanced_solution,
          impact: successData.enhanced_impact,
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
