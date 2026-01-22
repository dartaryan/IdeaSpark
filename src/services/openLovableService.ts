import { supabase } from '../lib/supabase';

/**
 * Service Response Type
 * Consistent response wrapper for all service layer operations
 */
export type ServiceResponse<T> = {
  data: T | null;
  error: { message: string; code: string } | null;
};

interface PrdContent {
  problemStatement: string;
  goals: string;
  userStories: string;
  requirements: string;
  technicalConsiderations: string;
}

interface GeneratePrototypeResponse {
  prototypeId: string;
  status: 'generating' | 'ready' | 'failed';
}

interface PrototypeStatus {
  status: 'generating' | 'ready' | 'failed';
  url?: string;
  code?: string;
}

/**
 * openLovableService - Service layer for prototype generation using Open-Lovable
 *
 * Calls the prototype-generate Supabase Edge Function which:
 * - Protects API keys server-side (OPEN_LOVABLE_API_URL, GEMINI_API_KEY)
 * - Implements retry logic with exponential backoff (3 retries)
 * - Implements timeout handling (60 seconds)
 * - Returns prototype ID for polling
 * - Updates prototype record status in background
 */
export const openLovableService = {
  /**
   * Trigger prototype generation
   * Returns immediately with prototype ID for polling
   *
   * @param prdId - The PRD document ID
   * @param ideaId - The idea ID
   * @param prdContent - The PRD content sections
   * @returns Prototype ID and initial status
   */
  async generate(
    prdId: string,
    ideaId: string,
    prdContent: PrdContent
  ): Promise<ServiceResponse<GeneratePrototypeResponse>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
        };
      }

      const response = await supabase.functions.invoke('prototype-generate', {
        body: { prdId, ideaId, prdContent },
      });

      if (response.error) {
        console.error('Prototype generation error:', response.error);
        return {
          data: null,
          error: {
            message: response.error.message || 'Failed to start generation',
            code: 'API_ERROR',
          },
        };
      }

      return { data: response.data, error: null };
    } catch (error) {
      console.error('Generate prototype error:', error);
      return {
        data: null,
        error: { message: 'Failed to generate prototype', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Poll prototype status
   * Returns current status and data when ready
   *
   * @param prototypeId - The prototype ID to poll
   * @param maxAttempts - Maximum number of polling attempts (default: 60)
   * @param intervalMs - Interval between polls in milliseconds (default: 1000)
   * @returns Current prototype status and data
   */
  async pollStatus(
    prototypeId: string,
    maxAttempts = 60,
    intervalMs = 1000
  ): Promise<ServiceResponse<PrototypeStatus>> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data, error } = await supabase
        .from('prototypes')
        .select('status, url, code')
        .eq('id', prototypeId)
        .single();

      if (error) {
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      if (data.status === 'ready' || data.status === 'failed') {
        return {
          data: {
            status: data.status,
            url: data.url,
            code: data.code,
          },
          error: null,
        };
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return {
      data: null,
      error: { message: 'Generation timed out', code: 'TIMEOUT_ERROR' },
    };
  },
};
