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
});
