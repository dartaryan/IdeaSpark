import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openLovableService } from './openLovableService';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Import the mocked module
import { supabase } from '../lib/supabase';

describe('openLovableService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPrdContent = {
    problemStatement: 'Users struggle with manual data entry',
    goals: 'Automate data import process',
    userStories: 'As a user, I want to import data automatically',
    requirements: 'Must support CSV and Excel files',
    technicalConsiderations: 'Use React and TypeScript',
  };

  const mockSession = {
    access_token: 'mock-token',
    user: { id: 'user-123' },
  };

  describe('generate', () => {
    it('returns error when not authenticated', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await openLovableService.generate(
        'prd-123',
        'idea-456',
        mockPrdContent
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Not authenticated',
        code: 'AUTH_ERROR',
      });
    });

    it('calls supabase.functions.invoke with correct parameters', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { prototypeId: 'proto-789', status: 'generating' },
        error: null,
      });

      await openLovableService.generate('prd-123', 'idea-456', mockPrdContent);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('prototype-generate', {
        body: {
          prdId: 'prd-123',
          ideaId: 'idea-456',
          prdContent: mockPrdContent,
        },
      });
    });

    it('returns prototype ID and status on success', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const mockResponse = {
        prototypeId: 'proto-789',
        status: 'generating' as const,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const result = await openLovableService.generate(
        'prd-123',
        'idea-456',
        mockPrdContent
      );

      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBeNull();
    });

    it('returns error when Edge Function returns an error', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Function invocation failed' },
      });

      const result = await openLovableService.generate(
        'prd-123',
        'idea-456',
        mockPrdContent
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Function invocation failed',
        code: 'API_ERROR',
      });
    });

    it('handles Edge Function error without message', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: {} as { message?: string },
      });

      const result = await openLovableService.generate(
        'prd-123',
        'idea-456',
        mockPrdContent
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to start generation',
        code: 'API_ERROR',
      });
    });

    it('handles unexpected exceptions', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockRejectedValue(new Error('Network error'));

      const result = await openLovableService.generate(
        'prd-123',
        'idea-456',
        mockPrdContent
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to generate prototype',
        code: 'UNKNOWN_ERROR',
      });
    });
  });

  describe('pollStatus', () => {
    const mockFromChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    beforeEach(() => {
      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);
    });

    it('returns status immediately when prototype is ready', async () => {
      const mockPrototype = {
        status: 'ready' as const,
        url: 'https://preview.example.com/proto-789',
        code: 'import React from "react"...',
      };

      mockFromChain.single.mockResolvedValue({
        data: mockPrototype,
        error: null,
      });

      const result = await openLovableService.pollStatus('proto-789', 60, 1000);

      expect(result.data).toEqual(mockPrototype);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('prototypes');
      expect(mockFromChain.select).toHaveBeenCalledWith('status, url, code');
      expect(mockFromChain.eq).toHaveBeenCalledWith('id', 'proto-789');
    });

    it('returns status immediately when prototype has failed', async () => {
      const mockPrototype = {
        status: 'failed' as const,
        url: null,
        code: null,
      };

      mockFromChain.single.mockResolvedValue({
        data: mockPrototype,
        error: null,
      });

      const result = await openLovableService.pollStatus('proto-789', 60, 1000);

      expect(result.data).toEqual(mockPrototype);
      expect(result.error).toBeNull();
    });

    it('polls multiple times until status is ready', async () => {
      // First two calls return 'generating', third call returns 'ready'
      mockFromChain.single
        .mockResolvedValueOnce({
          data: { status: 'generating', url: null, code: null },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { status: 'generating', url: null, code: null },
          error: null,
        })
        .mockResolvedValueOnce({
          data: {
            status: 'ready',
            url: 'https://preview.example.com/proto-789',
            code: 'import React from "react"...',
          },
          error: null,
        });

      const result = await openLovableService.pollStatus('proto-789', 60, 10); // Short interval for test

      expect(result.data).toEqual({
        status: 'ready',
        url: 'https://preview.example.com/proto-789',
        code: 'import React from "react"...',
      });
      expect(result.error).toBeNull();
      expect(mockFromChain.single).toHaveBeenCalledTimes(3);
    });

    it('returns timeout error when max attempts reached', async () => {
      mockFromChain.single.mockResolvedValue({
        data: { status: 'generating', url: null, code: null },
        error: null,
      });

      const result = await openLovableService.pollStatus('proto-789', 3, 10); // Only 3 attempts

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Generation timed out',
        code: 'TIMEOUT_ERROR',
      });
      expect(mockFromChain.single).toHaveBeenCalledTimes(3);
    });

    it('returns database error when query fails', async () => {
      mockFromChain.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const result = await openLovableService.pollStatus('proto-789', 60, 1000);

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Database connection failed',
        code: 'DB_ERROR',
      });
    });

    it('uses default parameters when not provided', async () => {
      const mockPrototype = {
        status: 'ready' as const,
        url: 'https://preview.example.com/proto-789',
        code: 'import React from "react"...',
      };

      mockFromChain.single.mockResolvedValue({
        data: mockPrototype,
        error: null,
      });

      const result = await openLovableService.pollStatus('proto-789');

      expect(result.data).toEqual(mockPrototype);
      expect(result.error).toBeNull();
    });
  });
});
