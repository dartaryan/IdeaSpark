import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService } from './geminiService';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Import the mocked module
import { supabase } from '../lib/supabase';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Stub environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null,
    } as any);
  });

  const mockInput = {
    problem: 'Users waste time on manual data entry',
    solution: 'Build an automated data import tool',
    impact: 'Save 10 hours per week per user',
  };

  const mockEdgeFunctionResponse = {
    enhanced_problem:
      '**Core Challenge:** Users waste significant time on manual data entry, leading to reduced productivity and increased error rates.',
    enhanced_solution:
      '**Proposed Solution:** Implement an automated data import tool that leverages intelligent parsing to streamline data onboarding.',
    enhanced_impact:
      '**Expected Outcomes:** Projected to save approximately 10 hours per week per user, resulting in significant cost savings and improved data accuracy.',
  };

  describe('enhanceIdea', () => {
    it('calls fetch with correct parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockEdgeFunctionResponse,
      });

      await geminiService.enhanceIdea(mockInput.problem, mockInput.solution, mockInput.impact);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-enhance'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });

    it('returns enhanced data mapped to service response format on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockEdgeFunctionResponse,
      });

      const result = await geminiService.enhanceIdea(
        mockInput.problem,
        mockInput.solution,
        mockInput.impact
      );

      expect(result.data).toEqual({
        problem: mockEdgeFunctionResponse.enhanced_problem,
        solution: mockEdgeFunctionResponse.enhanced_solution,
        impact: mockEdgeFunctionResponse.enhanced_impact,
      });
      expect(result.error).toBeNull();
    });

    it('returns error when Edge Function returns an error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      const result = await geminiService.enhanceIdea(
        mockInput.problem,
        mockInput.solution,
        mockInput.impact
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Edge function error: 500',
        code: 'EDGE_FUNCTION_ERROR',
      });
    });

    it('returns error when Edge Function returns null data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      const result = await geminiService.enhanceIdea(
        mockInput.problem,
        mockInput.solution,
        mockInput.impact
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'No data returned from AI enhancement',
        code: 'NO_DATA',
      });
    });

    it('handles Edge Function error response format (error object in data)', async () => {
      const errorResponse = {
        error: 'Missing required fields: problem, solution, impact',
        code: 'VALIDATION_ERROR',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => errorResponse,
      });

      const result = await geminiService.enhanceIdea(
        mockInput.problem,
        mockInput.solution,
        mockInput.impact
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: errorResponse.error,
        code: errorResponse.code,
      });
    });

    it('handles CONFIG_ERROR from Edge Function', async () => {
      const errorResponse = {
        error: 'AI service not configured',
        code: 'CONFIG_ERROR',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => errorResponse,
      });

      const result = await geminiService.enhanceIdea(
        mockInput.problem,
        mockInput.solution,
        mockInput.impact
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'AI service not configured',
        code: 'CONFIG_ERROR',
      });
    });

    it('handles CONTENT_TOO_LONG error from Edge Function', async () => {
      const errorResponse = {
        error: 'Content too long. Maximum 10,000 characters total.',
        code: 'CONTENT_TOO_LONG',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => errorResponse,
      });

      const result = await geminiService.enhanceIdea(
        mockInput.problem,
        mockInput.solution,
        mockInput.impact
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: errorResponse.error,
        code: errorResponse.code,
      });
    });

    it('handles ENHANCEMENT_FAILED error from Edge Function', async () => {
      const errorResponse = {
        error: 'Failed to enhance idea. Please try again or proceed with original text.',
        code: 'ENHANCEMENT_FAILED',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => errorResponse,
      });

      const result = await geminiService.enhanceIdea(
        mockInput.problem,
        mockInput.solution,
        mockInput.impact
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: errorResponse.error,
        code: errorResponse.code,
      });
    });

    it('handles unexpected exceptions', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await geminiService.enhanceIdea(
        mockInput.problem,
        mockInput.solution,
        mockInput.impact
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to enhance idea with AI',
        code: 'AI_ENHANCE_ERROR',
      });
    });

    it('handles Edge Function error without message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
        text: async () => '',
      });

      const result = await geminiService.enhanceIdea(
        mockInput.problem,
        mockInput.solution,
        mockInput.impact
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Edge function error: 502',
        code: 'EDGE_FUNCTION_ERROR',
      });
    });
  });
});
