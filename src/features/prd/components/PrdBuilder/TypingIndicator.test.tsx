import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingIndicator } from './TypingIndicator';

describe('TypingIndicator', () => {
  it('renders typing indicator with chat-start class', () => {
    const { container } = render(<TypingIndicator />);
    
    const chatElement = container.querySelector('.chat.chat-start');
    expect(chatElement).toBeInTheDocument();
  });

  it('renders chat bubble with loading dots', () => {
    const { container } = render(<TypingIndicator />);
    
    const bubble = container.querySelector('.chat-bubble');
    expect(bubble).toBeInTheDocument();
    
    const loadingDots = container.querySelector('.loading-dots');
    expect(loadingDots).toBeInTheDocument();
  });

  it('uses small loading dots size', () => {
    const { container } = render(<TypingIndicator />);
    
    const loadingDots = container.querySelector('.loading-sm');
    expect(loadingDots).toBeInTheDocument();
  });
});
