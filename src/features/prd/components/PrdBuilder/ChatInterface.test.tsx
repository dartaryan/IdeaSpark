import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from './ChatInterface';
import { prdChatService } from '../../services/prdChatService';
import { prdMessageService } from '../../services/prdMessageService';
import type { PrdMessage, PrdContent } from '../../types';

// Mock the services
vi.mock('../../services/prdChatService');
vi.mock('../../services/prdMessageService');

describe('ChatInterface', () => {
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

    // Default mocks for successful initialization
    vi.mocked(prdMessageService.getMessagesByPrdId).mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(prdChatService.getWelcomeMessage).mockResolvedValue({
      data: { aiMessage: 'Welcome to PRD development!' },
      error: null,
    });

    vi.mocked(prdMessageService.addMessage).mockResolvedValue({
      data: {
        id: '1',
        prd_id: mockPrdId,
        role: 'assistant',
        content: 'Welcome to PRD development!',
        created_at: new Date().toISOString(),
      },
      error: null,
    });
  });

  describe('Rendering', () => {
    it('renders message input and send button', async () => {
      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('displays keyboard shortcut hint', async () => {
      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Press Enter to send, Shift\+Enter for new line/i)).toBeInTheDocument();
      });
    });

    it('displays welcome message on mount', async () => {
      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Welcome to PRD development!')).toBeInTheDocument();
      });
    });

    it('displays existing messages', async () => {
      const mockMessages: PrdMessage[] = [
        {
          id: '1',
          prd_id: mockPrdId,
          role: 'assistant',
          content: 'Previous message 1',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          prd_id: mockPrdId,
          role: 'user',
          content: 'Previous message 2',
          created_at: new Date().toISOString(),
        },
      ];

      vi.mocked(prdMessageService.getMessagesByPrdId).mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Previous message 1')).toBeInTheDocument();
        expect(screen.getByText('Previous message 2')).toBeInTheDocument();
      });
    });
  });

  describe('Sending messages', () => {
    it('sends message when send button is clicked', async () => {
      const user = userEvent.setup();

      const mockUserMessage: PrdMessage = {
        id: '2',
        prd_id: mockPrdId,
        role: 'user',
        content: 'Test user message',
        created_at: new Date().toISOString(),
      };

      const mockAiMessage: PrdMessage = {
        id: '3',
        prd_id: mockPrdId,
        role: 'assistant',
        content: 'AI response',
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
        data: { aiMessage: 'AI response' },
        error: null,
      });

      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(input, 'Test user message');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Test user message')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('AI response')).toBeInTheDocument();
      });
    });

    it('sends message when Enter is pressed', async () => {
      const user = userEvent.setup();

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
          data: {
            id: '2',
            prd_id: mockPrdId,
            role: 'user',
            content: 'Enter message',
            created_at: new Date().toISOString(),
          },
          error: null,
        });

      vi.mocked(prdChatService.sendMessage).mockResolvedValue({
        data: { aiMessage: 'Response' },
        error: null,
      });

      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your response...');

      await user.type(input, 'Enter message');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Enter message')).toBeInTheDocument();
      });
    });

    it('does not send empty messages', async () => {
      const user = userEvent.setup();

      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(input, '   ');
      
      // Send button should be disabled for whitespace-only input
      expect(sendButton).toBeDisabled();
    });

    it('clears input after sending message', async () => {
      const user = userEvent.setup();

      vi.mocked(prdMessageService.addMessage).mockResolvedValue({
        data: {
          id: '2',
          prd_id: mockPrdId,
          role: 'user',
          content: 'Test',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      vi.mocked(prdChatService.sendMessage).mockResolvedValue({
        data: { aiMessage: 'Response' },
        error: null,
      });

      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your response...') as HTMLTextAreaElement;
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(input, 'Test');
      await user.click(sendButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Typing indicator', () => {
    it('shows typing indicator while AI is generating response', async () => {
      const user = userEvent.setup();

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
          data: {
            id: '2',
            prd_id: mockPrdId,
            role: 'user',
            content: 'Test',
            created_at: new Date().toISOString(),
          },
          error: null,
        });

      vi.mocked(prdChatService.sendMessage).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: { aiMessage: 'Response' },
                error: null,
              });
            }, 200);
          })
      );

      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(input, 'Test');
      await user.click(sendButton);

      // Check for loading indicator (could be in button or separate typing indicator)
      await waitFor(() => {
        const loadingElements = document.querySelectorAll('.loading');
        expect(loadingElements.length).toBeGreaterThan(0);
      });
    });

    it('disables input while AI is typing', async () => {
      const user = userEvent.setup();

      vi.mocked(prdMessageService.addMessage).mockResolvedValue({
        data: {
          id: '2',
          prd_id: mockPrdId,
          role: 'user',
          content: 'Test',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      vi.mocked(prdChatService.sendMessage).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: { aiMessage: 'Response' },
                error: null,
              });
            }, 200);
          })
      );

      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(input, 'Test');
      await user.click(sendButton);

      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Error handling', () => {
    it('displays error message when message sending fails', async () => {
      const user = userEvent.setup();

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
        });

      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(input, 'Test');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save message')).toBeInTheDocument();
      });
    });

    it('shows retry button on error', async () => {
      const user = userEvent.setup();

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
        });

      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(input, 'Test');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
      });
    });

    it('dismisses error when dismiss button is clicked', async () => {
      const user = userEvent.setup();

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
        });

      render(
        <ChatInterface
          prdId={mockPrdId}
          ideaContext={mockIdeaContext}
          prdContent={mockPrdContent}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(input, 'Test');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save message')).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText('Failed to save message')).not.toBeInTheDocument();
      });
    });
  });
});
