import { useState, useEffect, useCallback } from 'react';
import { prdChatService } from '../services/prdChatService';
import { prdMessageService } from '../services/prdMessageService';
import type { PrdMessage, PrdContent } from '../types';

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

interface UsePrdChatOptions {
  prdId: string;
  ideaContext: IdeaContext;
  prdContent: PrdContent;
  onSectionUpdate?: (updates: PrdSectionUpdate[]) => void;
}

export interface UsePrdChatReturn {
  messages: PrdMessage[];
  isAiTyping: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearError: () => void;
}

export function usePrdChat({ prdId, ideaContext, prdContent, onSectionUpdate }: UsePrdChatOptions): UsePrdChatReturn {
  const [messages, setMessages] = useState<PrdMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize: Load existing messages or get welcome
  useEffect(() => {
    if (isInitialized || !prdId) return;

    async function initializeChat() {
      // Try to load existing messages
      const existingResult = await prdMessageService.getMessagesByPrdId(prdId);
      
      if (existingResult.data && existingResult.data.length > 0) {
        setMessages(existingResult.data);
        setIsInitialized(true);
        return;
      }

      // No existing messages - get welcome message
      setIsAiTyping(true);
      const welcomeResult = await prdChatService.getWelcomeMessage(prdId, ideaContext, prdContent);
      setIsAiTyping(false);

      if (welcomeResult.error) {
        setError(welcomeResult.error.message);
        setIsInitialized(true);
        return;
      }

      if (welcomeResult.data) {
        // Save welcome message to database
        const saveResult = await prdMessageService.addMessage(prdId, 'assistant', welcomeResult.data.aiMessage);
        
        if (saveResult.data) {
          setMessages([saveResult.data]);
        }

        // Handle any section updates from welcome (unlikely but possible)
        if (welcomeResult.data.sectionUpdates && onSectionUpdate) {
          onSectionUpdate(welcomeResult.data.sectionUpdates);
        }
      }
      setIsInitialized(true);
    }

    initializeChat();
  }, [prdId, ideaContext, prdContent, isInitialized, onSectionUpdate]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isAiTyping) return;

    setError(null);
    setFailedMessage(null);

    // Optimistically add user message to UI
    const tempUserMessage: PrdMessage = {
      id: `temp-${Date.now()}`,
      prd_id: prdId,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    // Save user message to database
    const userSaveResult = await prdMessageService.addMessage(prdId, 'user', content.trim());
    
    if (userSaveResult.error) {
      setError('Failed to save message');
      setFailedMessage(content.trim());
      // Remove temp message
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      return;
    }

    // Update temp message with real data
    if (userSaveResult.data) {
      setMessages(prev => prev.map(m => 
        m.id === tempUserMessage.id ? userSaveResult.data! : m
      ));
    }

    // Get AI response
    setIsAiTyping(true);
    const messageHistory = prdChatService.formatMessageHistory(messages);
    const aiResult = await prdChatService.sendMessage(
      prdId,
      content.trim(),
      ideaContext,
      prdContent,
      messageHistory
    );
    setIsAiTyping(false);

    if (aiResult.error) {
      setError(aiResult.error.message);
      setFailedMessage(content.trim());
      return;
    }

    if (aiResult.data) {
      // Save AI message to database
      const aiSaveResult = await prdMessageService.addMessage(prdId, 'assistant', aiResult.data.aiMessage);
      
      if (aiSaveResult.data) {
        setMessages(prev => [...prev, aiSaveResult.data!]);
      }

      // Handle section updates
      if (aiResult.data.sectionUpdates && onSectionUpdate) {
        onSectionUpdate(aiResult.data.sectionUpdates);
      }
    }
  }, [prdId, ideaContext, prdContent, messages, isAiTyping, onSectionUpdate]);

  const retryLastMessage = useCallback(async () => {
    if (failedMessage) {
      await sendMessage(failedMessage);
    }
  }, [failedMessage, sendMessage]);

  const clearError = useCallback(() => {
    setError(null);
    setFailedMessage(null);
  }, []);

  return {
    messages,
    isAiTyping,
    error,
    sendMessage,
    retryLastMessage,
    clearError,
  };
}
