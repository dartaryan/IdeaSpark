import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prdChatService } from './prdChatService';

// Mock the supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Import the mocked module
import { supabase } from '../../../lib/supabase';

const mockIdeaContext = {
  id: 'idea-123',
  title: 'AI Customer Support',
  problem: 'Customer service reps waste time looking up info',
  solution: 'AI-powered knowledge base with smart search',
  impact: 'Reduce call handling time by 30%',
  enhancedProblem: 'Customer service representatives are losing productivity due to fragmented information systems.',
  enhancedSolution: 'An intelligent AI-powered knowledge base that provides instant, context-aware information retrieval.',
  enhancedImpact: 'This solution will reduce average call handling time by 30%, improving customer satisfaction and operational efficiency.',
};

const mockPrdContent = {
  problemStatement: { content: '', status: 'empty' },
  goalsAndMetrics: { content: '', status: 'empty' },
};

const mockWelcomeResponse = {
  aiMessage: "This is a great problem to tackle! 🎯 Let's start by understanding who this affects most.",
  sectionUpdates: null,
};

const mockChatResponse = {
  aiMessage: "That's really helpful context! Let me capture that in the Problem Statement.",
  sectionUpdates: [
    {
      sectionKey: 'problemStatement',
      content: '**Problem:** Customer service representatives are losing productivity due to fragmented information systems.',
      status: 'in_progress' as const,
    },
  ],
};

describe('prdChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWelcomeMessage', () => {
    it('should successfully get welcome message for new PRD', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockWelcomeResponse,
        error: null,
      });

      const result = await prdChatService.getWelcomeMessage(
        'prd-123',
        mockIdeaContext,
        mockPrdContent
      );

      expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-prd-chat', {
        body: {
          prdId: 'prd-123',
          isInitial: true,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
          messageHistory: [],
        },
      });
      expect(result.data).toEqual(mockWelcomeResponse);
      expect(result.error).toBeNull();
    });

    it('should default to empty prdContent if not provided', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockWelcomeResponse,
        error: null,
      });

      await prdChatService.getWelcomeMessage('prd-123', mockIdeaContext);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-prd-chat', {
        body: expect.objectContaining({
          prdContent: {},
        }),
      });
    });

    it('should handle Edge Function invocation error', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Function invocation failed' },
      });

      const result = await prdChatService.getWelcomeMessage(
        'prd-123',
        mockIdeaContext
      );

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('EDGE_FUNCTION_ERROR');
      expect(result.error?.message).toContain('Failed to start PRD conversation');
    });

    it('should handle no data response', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await prdChatService.getWelcomeMessage(
        'prd-123',
        mockIdeaContext
      );

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('NO_DATA');
      expect(result.error?.message).toBe('No response from AI assistant');
    });

    it('should handle error response from Edge Function', async () => {
      const errorResponse = {
        error: 'AI service not configured',
        code: 'CONFIG_ERROR',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: errorResponse as any,
        error: null,
      });

      const result = await prdChatService.getWelcomeMessage(
        'prd-123',
        mockIdeaContext
      );

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('CONFIG_ERROR');
      expect(result.error?.message).toBe('AI service not configured');
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Network error')
      );

      const result = await prdChatService.getWelcomeMessage(
        'prd-123',
        mockIdeaContext
      );

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('CHAT_ERROR');
      expect(result.error?.message).toBe('Failed to start PRD conversation');
    });
  });

  describe('sendMessage', () => {
    const mockMessageHistory = [
      { role: 'assistant' as const, content: 'Welcome! How can I help?' },
      { role: 'user' as const, content: 'I need help with the problem statement' },
    ];

    it('should successfully send message and get response', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockChatResponse,
        error: null,
      });

      const result = await prdChatService.sendMessage(
        'prd-123',
        'The main users are customer service reps',
        mockIdeaContext,
        mockPrdContent,
        mockMessageHistory
      );

      expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-prd-chat', {
        body: {
          prdId: 'prd-123',
          message: 'The main users are customer service reps',
          isInitial: false,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
          messageHistory: mockMessageHistory,
        },
      });
      expect(result.data).toEqual(mockChatResponse);
      expect(result.error).toBeNull();
    });

    it('should handle response with section updates', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockChatResponse,
        error: null,
      });

      const result = await prdChatService.sendMessage(
        'prd-123',
        'User message',
        mockIdeaContext,
        mockPrdContent,
        mockMessageHistory
      );

      expect(result.data?.sectionUpdates).toBeDefined();
      expect(result.data?.sectionUpdates?.[0].sectionKey).toBe('problemStatement');
      expect(result.data?.sectionUpdates?.[0].status).toBe('in_progress');
    });

    it('should handle Edge Function invocation error', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Timeout error' },
      });

      const result = await prdChatService.sendMessage(
        'prd-123',
        'User message',
        mockIdeaContext,
        mockPrdContent,
        mockMessageHistory
      );

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('EDGE_FUNCTION_ERROR');
      expect(result.error?.message).toContain('Failed to get AI response');
    });

    it('should handle no data response', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await prdChatService.sendMessage(
        'prd-123',
        'User message',
        mockIdeaContext,
        mockPrdContent,
        mockMessageHistory
      );

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('NO_DATA');
    });

    it('should handle error response from Edge Function', async () => {
      const errorResponse = {
        error: 'Content too long',
        code: 'CONTENT_TOO_LONG',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: errorResponse as any,
        error: null,
      });

      const result = await prdChatService.sendMessage(
        'prd-123',
        'User message',
        mockIdeaContext,
        mockPrdContent,
        mockMessageHistory
      );

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('CONTENT_TOO_LONG');
      expect(result.error?.message).toBe('Content too long');
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Network error')
      );

      const result = await prdChatService.sendMessage(
        'prd-123',
        'User message',
        mockIdeaContext,
        mockPrdContent,
        mockMessageHistory
      );

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('CHAT_ERROR');
    });

    it('should handle validation error responses', async () => {
      const validationError = {
        error: 'Missing required field: message',
        code: 'VALIDATION_ERROR',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: validationError as any,
        error: null,
      });

      const result = await prdChatService.sendMessage(
        'prd-123',
        '',
        mockIdeaContext,
        mockPrdContent,
        mockMessageHistory
      );

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('formatMessageHistory', () => {
    it('should format PrdMessage array to Edge Function format', () => {
      const prdMessages = [
        {
          id: 'msg-1',
          prd_id: 'prd-123',
          role: 'user' as const,
          content: 'Hello',
          created_at: '2026-01-22T10:00:00Z',
        },
        {
          id: 'msg-2',
          prd_id: 'prd-123',
          role: 'assistant' as const,
          content: 'Hi there!',
          created_at: '2026-01-22T10:01:00Z',
        },
      ];

      const formatted = prdChatService.formatMessageHistory(prdMessages);

      expect(formatted).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ]);
    });

    it('should handle empty message array', () => {
      const formatted = prdChatService.formatMessageHistory([]);

      expect(formatted).toEqual([]);
    });

    it('should preserve message order', () => {
      const prdMessages = [
        {
          id: 'msg-1',
          prd_id: 'prd-123',
          role: 'user' as const,
          content: 'First',
          created_at: '2026-01-22T10:00:00Z',
        },
        {
          id: 'msg-2',
          prd_id: 'prd-123',
          role: 'assistant' as const,
          content: 'Second',
          created_at: '2026-01-22T10:01:00Z',
        },
        {
          id: 'msg-3',
          prd_id: 'prd-123',
          role: 'user' as const,
          content: 'Third',
          created_at: '2026-01-22T10:02:00Z',
        },
      ];

      const formatted = prdChatService.formatMessageHistory(prdMessages);

      expect(formatted[0].content).toBe('First');
      expect(formatted[1].content).toBe('Second');
      expect(formatted[2].content).toBe('Third');
    });

    it('should only include role and content fields', () => {
      const prdMessages = [
        {
          id: 'msg-1',
          prd_id: 'prd-123',
          role: 'user' as const,
          content: 'Hello',
          created_at: '2026-01-22T10:00:00Z',
        },
      ];

      const formatted = prdChatService.formatMessageHistory(prdMessages);

      expect(Object.keys(formatted[0])).toEqual(['role', 'content']);
      expect(formatted[0]).not.toHaveProperty('id');
      expect(formatted[0]).not.toHaveProperty('prd_id');
      expect(formatted[0]).not.toHaveProperty('created_at');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete conversation flow', async () => {
      // Welcome message
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: mockWelcomeResponse,
        error: null,
      });

      const welcomeResult = await prdChatService.getWelcomeMessage(
        'prd-123',
        mockIdeaContext
      );

      expect(welcomeResult.error).toBeNull();
      expect(welcomeResult.data?.aiMessage).toContain('great problem');

      // User sends message
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: mockChatResponse,
        error: null,
      });

      const messageResult = await prdChatService.sendMessage(
        'prd-123',
        'The users are customer service reps',
        mockIdeaContext,
        mockPrdContent,
        [{ role: 'assistant', content: welcomeResult.data!.aiMessage }]
      );

      expect(messageResult.error).toBeNull();
      expect(messageResult.data?.sectionUpdates).toBeDefined();
    });

    it('should handle retry scenarios with transient errors', async () => {
      // Simulate transient error followed by success
      vi.mocked(supabase.functions.invoke)
        .mockResolvedValueOnce({
          data: { error: 'Temporary failure', code: 'CHAT_FAILED' } as any,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockChatResponse,
          error: null,
        });

      const firstResult = await prdChatService.sendMessage(
        'prd-123',
        'User message',
        mockIdeaContext,
        mockPrdContent,
        []
      );

      expect(firstResult.data).toBeNull();
      expect(firstResult.error?.code).toBe('CHAT_FAILED');

      // Retry succeeds
      const secondResult = await prdChatService.sendMessage(
        'prd-123',
        'User message',
        mockIdeaContext,
        mockPrdContent,
        []
      );

      expect(secondResult.error).toBeNull();
      expect(secondResult.data).toEqual(mockChatResponse);
    });
  });
});
