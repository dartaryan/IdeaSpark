import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { usePrdChat } from '../../hooks/usePrdChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { PrdContent } from '../../types';

interface IdeaContext {
  id: string;
  title?: string;
  problem: string;
  solution: string;
  impact: string;
  enhancedProblem?: string;
  enhancedSolution?: string;
  enhancedImpact?: string;
}

interface PrdSectionUpdate {
  sectionKey: keyof PrdContent;
  content: string;
  status: 'in_progress' | 'complete';
}

interface ChatInterfaceProps {
  prdId: string;
  ideaContext: IdeaContext;
  prdContent: PrdContent;
  onSectionUpdate?: (updates: PrdSectionUpdate[]) => void;
}

export function ChatInterface({ prdId, ideaContext, prdContent, onSectionUpdate }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isAiTyping,
    error,
    sendMessage,
    retryLastMessage,
    clearError,
  } = usePrdChat({ prdId, ideaContext, prdContent, onSectionUpdate });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isAiTyping) return;
    
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={new Date(message.created_at)}
          />
        ))}
        
        {isAiTyping && <TypingIndicator />}
        
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={clearError}>Dismiss</button>
              <button className="btn btn-sm btn-primary" onClick={retryLastMessage}>Retry</button>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-base-300 p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            className="textarea textarea-bordered flex-1 resize-none"
            rows={2}
            disabled={isAiTyping}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isAiTyping}
            className="btn btn-primary self-end"
          >
            {isAiTyping ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              'Send'
            )}
          </button>
        </div>
        <p className="text-xs text-base-content/60 mt-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
