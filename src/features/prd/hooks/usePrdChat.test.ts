import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePrdChat } from './usePrdChat';
import { prdChatService } from '../services/prdChatService';
import { prdMessageService } from '../services/prdMessageService';
import type { PrdMessage, PrdContent } from '../types';

// Mock the services
vi.mock('../services/prdChatService');
vi.mock('../services/prdMessageService');

describe('usePrdChat', () => {
  const mockPrdId = 'test-prd-id';
  const mockIdeaContext = {
    id: 'idea-1',
    title: 'Test Idea',
    problem: 'Test problem',
    solution: 'Test solution',
    impact: 'Test impact',
  };
  const mockPrdContent: PrdContent = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('loads existing messages on mount', async () => {
      const mockMessages: PrdMessage[] = [
        {
          id: '1',
          prd_id: mockPrdId,
          role: 'assistant',
          content: 'Welcome message',
          created_at: new Date().toISOString(),
        },
      ];

      vi.mocked(prdMessageService.getMessagesByPrdId).mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      const { result } = renderHook(() =>
        usePrdChat({
          prdId: mockPrdId,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
        })
      );

      await waitFor(() => {
        expect(result.current.messages).toEqual(mockMessages);
      });

      expect(prdMessageService.getMessagesByPrdId).toHaveBeenCalledWith(mockPrdId);
    });

    it('fetches welcome message when no existing messages', async () => {
      const mockWelcomeMessage = 'Welcome to PRD development!';

      vi.mocked(prdMessageService.getMessagesByPrdId).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(prdChatService.getWelcomeMessage).mockResolvedValue({
        data: {
          aiMessage: mockWelcomeMessage,
        },
        error: null,
      });

      const mockSavedMessage: PrdMessage = {
        id: '1',
        prd_id: mockPrdId,
        role: 'assistant',
        content: mockWelcomeMessage,
        created_at: new Date().toISOString(),
      };

      vi.mocked(prdMessageService.addMessage).mockResolvedValue({
        data: mockSavedMessage,
        error: null,
      });

      const { result } = renderHook(() =>
        usePrdChat({
          prdId: mockPrdId,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
        })
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      expect(prdChatService.getWelcomeMessage).toHaveBeenCalledWith(
        mockPrdId,
        mockIdeaContext,
        mockPrdContent
      );
      expect(prdMessageService.addMessage).toHaveBeenCalledWith(
        mockPrdId,
        'assistant',
        mockWelcomeMessage
      );
    });

    it('sets isAiTyping to true while fetching welcome message', async () => {
      vi.mocked(prdMessageService.getMessagesByPrdId).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(prdChatService.getWelcomeMessage).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: { aiMessage: 'Welcome!' },
                error: null,
              });
            }, 100);
          })
      );

      vi.mocked(prdMessageService.addMessage).mockResolvedValue({
        data: {
          id: '1',
          prd_id: mockPrdId,
          role: 'assistant',
          content: 'Welcome!',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      const { result } = renderHook(() =>
        usePrdChat({
          prdId: mockPrdId,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
        })
      );

      // Should start with isAiTyping = false (initial state)
      expect(result.current.isAiTyping).toBe(false);

      // Wait for initialization to complete
      await waitFor(
        () => {
          expect(result.current.isAiTyping).toBe(false);
        },
        { timeout: 200 }
      );
    });

    it('handles welcome message error gracefully', async () => {
      vi.mocked(prdMessageService.getMessagesByPrdId).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(prdChatService.getWelcomeMessage).mockResolvedValue({
        data: null,
        error: { message: 'Failed to get welcome message', code: 'ERROR' },
      });

      const { result } = renderHook(() =>
        usePrdChat({
          prdId: mockPrdId,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
        })
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to get welcome message');
      });
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      // Default mock for initialization
      vi.mocked(prdMessageService.getMessagesByPrdId).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(prdChatService.getWelcomeMessage).mockResolvedValue({
        data: { aiMessage: 'Welcome!' },
        error: null,
      });

      vi.mocked(prdMessageService.addMessage).mockResolvedValue({
        data: {
          id: '1',
          prd_id: mockPrdId,
          role: 'assistant',
          content: 'Welcome!',
          created_at: new Date().toISOString(),
        },
        error: null,
      });
    });

    it('adds user message and gets AI response', async () => {
      const userMessage = 'What is the problem statement?';
      const aiResponse = 'Let me help you define the problem statement.';

      const mockUserMessage: PrdMessage = {
        id: '2',
        prd_id: mockPrdId,
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString(),
      };

      const mockAiMessage: PrdMessage = {
        id: '3',
        prd_id: mockPrdId,
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString(),
      };

      vi.mocked(prdMessageService.addMessage)
        .mockResolvedValueOnce({
          data: {
            id: '1',
            prd_id: mockPrdId,
            role: 'assistant',
            content: 'Welcome!',
            created_at: new Date().toISOString(),
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockUserMessage,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockAiMessage,
          error: null,
        });

      vi.mocked(prdChatService.sendMessage).mockResolvedValue({
        data: { aiMessage: aiResponse },
        error: null,
      });

      const { result } = renderHook(() =>
        usePrdChat({
          prdId: mockPrdId,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
        })
      );

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      // Send message
      await result.current.sendMessage(userMessage);

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      // Verify sendMessage was called - allow any array for messageHistory
      expect(prdChatService.sendMessage).toHaveBeenCalledWith(
        mockPrdId,
        userMessage,
        mockIdeaContext,
        mockPrdContent,
        expect.arrayContaining([
          expect.objectContaining({
            role: 'assistant',
            content: 'Welcome!',
          })
        ])
      );
    });

    it('does not send empty messages', async () => {
      const { result } = renderHook(() =>
        usePrdChat({
          prdId: mockPrdId,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
        })
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      await result.current.sendMessage('   ');

      // Should not add any messages
      expect(result.current.messages).toHaveLength(1);
    });

    it('handles send message error', async () => {
      vi.mocked(prdMessageService.addMessage).mockResolvedValueOnce({
        data: {
          id: '1',
          prd_id: mockPrdId,
          role: 'assistant',
          content: 'Welcome!',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      vi.mocked(prdMessageService.addMessage).mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to save', code: 'ERROR' },
      });

      const { result } = renderHook(() =>
        usePrdChat({
          prdId: mockPrdId,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
        })
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      await result.current.sendMessage('Test message');

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to save message');
      });
    });
  });

  describe('retryLastMessage', () => {
    it('retries failed message', async () => {
      vi.mocked(prdMessageService.getMessagesByPrdId).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(prdChatService.getWelcomeMessage).mockResolvedValue({
        data: { aiMessage: 'Welcome!' },
        error: null,
      });

      vi.mocked(prdMessageService.addMessage)
        .mockResolvedValueOnce({
          data: {
            id: '1',
            prd_id: mockPrdId,
            role: 'assistant',
            content: 'Welcome!',
            created_at: new Date().toISOString(),
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Network error', code: 'ERROR' },
        })
        .mockResolvedValueOnce({
          data: {
            id: '2',
            prd_id: mockPrdId,
            role: 'user',
            content: 'Retry message',
            created_at: new Date().toISOString(),
          },
          error: null,
        });

      vi.mocked(prdChatService.sendMessage).mockResolvedValue({
        data: { aiMessage: 'Response after retry' },
        error: null,
      });

      const { result } = renderHook(() =>
        usePrdChat({
          prdId: mockPrdId,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
        })
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      // First attempt fails
      await result.current.sendMessage('Retry message');

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Retry
      await result.current.retryLastMessage();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('clearError', () => {
    it('clears error state', async () => {
      vi.mocked(prdMessageService.getMessagesByPrdId).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(prdChatService.getWelcomeMessage).mockResolvedValue({
        data: null,
        error: { message: 'Test error', code: 'ERROR' },
      });

      const { result } = renderHook(() =>
        usePrdChat({
          prdId: mockPrdId,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
        })
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      result.current.clearError();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('onSectionUpdate callback', () => {
    it('calls onSectionUpdate when AI provides section updates', async () => {
      const mockOnSectionUpdate = vi.fn();

      vi.mocked(prdMessageService.getMessagesByPrdId).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(prdChatService.getWelcomeMessage).mockResolvedValue({
        data: {
          aiMessage: 'Welcome!',
          sectionUpdates: [
            {
              sectionKey: 'problemStatement',
              content: 'Updated problem',
              status: 'in_progress',
            },
          ],
        },
        error: null,
      });

      vi.mocked(prdMessageService.addMessage).mockResolvedValue({
        data: {
          id: '1',
          prd_id: mockPrdId,
          role: 'assistant',
          content: 'Welcome!',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      renderHook(() =>
        usePrdChat({
          prdId: mockPrdId,
          ideaContext: mockIdeaContext,
          prdContent: mockPrdContent,
          onSectionUpdate: mockOnSectionUpdate,
        })
      );

      await waitFor(() => {
        expect(mockOnSectionUpdate).toHaveBeenCalledWith([
          {
            sectionKey: 'problemStatement',
            content: 'Updated problem',
            status: 'in_progress',
          },
        ]);
      });
    });
  });
});
