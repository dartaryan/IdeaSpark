import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  describe('User messages', () => {
    it('renders user message with chat-end class (right-aligned)', () => {
      const { container } = render(
        <MessageBubble role="user" content="Hello AI" />
      );
      
      const chatElement = container.querySelector('.chat.chat-end');
      expect(chatElement).toBeInTheDocument();
    });

    it('applies primary bubble styling for user messages', () => {
      const { container } = render(
        <MessageBubble role="user" content="Hello AI" />
      );
      
      const bubble = container.querySelector('.chat-bubble-primary');
      expect(bubble).toBeInTheDocument();
    });

    it('renders user message content without formatting', () => {
      render(<MessageBubble role="user" content="**Bold** text" />);
      
      expect(screen.getByText('**Bold** text')).toBeInTheDocument();
    });
  });

  describe('AI messages', () => {
    it('renders AI message with chat-start class (left-aligned)', () => {
      const { container } = render(
        <MessageBubble role="assistant" content="Hello user" />
      );
      
      const chatElement = container.querySelector('.chat.chat-start');
      expect(chatElement).toBeInTheDocument();
    });

    it('does not apply primary styling for AI messages', () => {
      const { container } = render(
        <MessageBubble role="assistant" content="Hello user" />
      );
      
      const bubble = container.querySelector('.chat-bubble');
      expect(bubble).toBeInTheDocument();
      expect(bubble).not.toHaveClass('chat-bubble-primary');
    });

    it('formats bold text with <strong> tags', () => {
      const { container } = render(
        <MessageBubble role="assistant" content="This is **bold** text" />
      );
      
      const strong = container.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong?.textContent).toBe('bold');
    });

    it('formats italic text with <em> tags', () => {
      const { container } = render(
        <MessageBubble role="assistant" content="This is *italic* text" />
      );
      
      const em = container.querySelector('em');
      expect(em).toBeInTheDocument();
      expect(em?.textContent).toBe('italic');
    });

    it('converts newlines to <br> tags', () => {
      const { container } = render(
        <MessageBubble role="assistant" content="Line 1\nLine 2" />
      );
      
      const br = container.querySelector('br');
      expect(br).toBeInTheDocument();
    });
  });

  describe('Timestamp', () => {
    it('renders timestamp when provided', () => {
      const timestamp = new Date('2024-01-15T10:30:00');
      render(
        <MessageBubble role="user" content="Test" timestamp={timestamp} />
      );
      
      // Check for time string (format may vary by locale)
      const header = screen.getByText(/10:30/);
      expect(header).toBeInTheDocument();
    });

    it('does not render timestamp when not provided', () => {
      const { container } = render(
        <MessageBubble role="user" content="Test" />
      );
      
      const header = container.querySelector('.chat-header');
      expect(header).not.toBeInTheDocument();
    });

    it('renders timestamp with correct styling', () => {
      const timestamp = new Date('2024-01-15T10:30:00');
      const { container } = render(
        <MessageBubble role="user" content="Test" timestamp={timestamp} />
      );
      
      const header = container.querySelector('.chat-header');
      expect(header).toHaveClass('text-xs', 'opacity-50', 'mb-1');
    });
  });

  describe('Corrupted content handling', () => {
    it('detects and extracts aiMessage from corrupted JSON response', () => {
      const corruptedContent = JSON.stringify({
        aiMessage: "This is the actual message",
        sectionUpdates: [{ sectionKey: "problemStatement", content: "Some content", status: "complete" }]
      });
      
      render(
        <MessageBubble role="assistant" content={corruptedContent} />
      );
      
      // Should display the extracted message, not the JSON
      expect(screen.getByText(/This is the actual message/)).toBeInTheDocument();
    });

    it('handles corrupted error response gracefully', () => {
      const corruptedContent = JSON.stringify({
        error: "AI service not configured",
        code: "CONFIG_ERROR"
      });
      
      render(
        <MessageBubble role="assistant" content={corruptedContent} />
      );
      
      // Should show user-friendly error message
      expect(screen.getByText(/⚠️ Error: AI service not configured/)).toBeInTheDocument();
    });

    it('does not treat normal messages as corrupted', () => {
      const normalMessage = "This is a normal message with { and } brackets";
      
      render(
        <MessageBubble role="assistant" content={normalMessage} />
      );
      
      // Should display the message as-is
      expect(screen.getByText(/This is a normal message with { and } brackets/)).toBeInTheDocument();
    });

    it('handles invalid JSON gracefully', () => {
      const invalidJson = '{"aiMessage": invalid json}';
      
      render(
        <MessageBubble role="assistant" content={invalidJson} />
      );
      
      // Should display the original content when JSON parsing fails
      expect(screen.getByText(/{"aiMessage": invalid json}/)).toBeInTheDocument();
    });

    it('does not process corrupted content for user messages', () => {
      const corruptedContent = JSON.stringify({
        aiMessage: "Should not extract this",
        sectionUpdates: []
      });
      
      render(
        <MessageBubble role="user" content={corruptedContent} />
      );
      
      // User messages should not be processed, display as-is
      expect(screen.getByText(corruptedContent)).toBeInTheDocument();
    });

    it('extracts aiMessage and applies formatting', () => {
      const corruptedContent = JSON.stringify({
        aiMessage: "This is **bold** and *italic* text",
        sectionUpdates: null
      });
      
      const { container } = render(
        <MessageBubble role="assistant" content={corruptedContent} />
      );
      
      // Should extract message AND apply markdown formatting
      const strong = container.querySelector('strong');
      const em = container.querySelector('em');
      expect(strong).toBeInTheDocument();
      expect(em).toBeInTheDocument();
    });

    it('handles unknown JSON format by displaying original', () => {
      const unknownJson = JSON.stringify({
        someField: "value",
        anotherField: "another value"
      });
      
      render(
        <MessageBubble role="assistant" content={unknownJson} />
      );
      
      // Should display original when format is unrecognized
      expect(screen.getByText(unknownJson)).toBeInTheDocument();
    });
  });
});
