import { supabase } from '../../../lib/supabase';
import type { ServiceResponse } from '../../../types';
import type { PrdContent, PrdMessage } from '../types';

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

interface ChatResponse {
  aiMessage: string;
  sectionUpdates?: PrdSectionUpdate[];
}

interface EdgeFunctionError {
  error: string;
  code: string;
}

export const prdChatService = {
  /**
   * Get welcome message for a new PRD conversation
   * AC4: Detects returning users and provides contextual continuation
   */
  async getWelcomeMessage(
    prdId: string,
    ideaContext: IdeaContext,
    prdContent: PrdContent = {},
    existingMessageCount: number = 0
  ): Promise<ServiceResponse<ChatResponse>> {
    try {
      // Detect if this is a returning user (AC4)
      const isReturning = existingMessageCount > 0;

      // Build completion context for returning users
      const completedSections = Object.entries(prdContent)
        .filter(([_, section]) => section?.status === 'complete')
        .map(([key]) => key);

      const inProgressSections = Object.entries(prdContent)
        .filter(([_, section]) => section?.status === 'in_progress')
        .map(([key]) => key);

      const { data, error } = await supabase.functions.invoke<ChatResponse>('gemini-prd-chat', {
        body: {
          prdId,
          isInitial: true,
          isReturning, // AC4: Flag for returning user
          completedSections, // AC4: What's been completed
          inProgressSections, // AC4: What's in progress
          ideaContext,
          prdContent,
          messageHistory: [],
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        return {
          data: null,
          error: { 
            message: 'Failed to start PRD conversation', 
            code: 'EDGE_FUNCTION_ERROR' 
          },
        };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'No response from AI assistant', code: 'NO_DATA' },
        };
      }

      // Check for error response
      if ('error' in data && 'code' in data) {
        const errorData = data as unknown as EdgeFunctionError;
        return {
          data: null,
          error: { message: errorData.error, code: errorData.code },
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('PRD chat welcome error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to start PRD conversation', 
          code: 'CHAT_ERROR' 
        },
      };
    }
  },

  /**
   * Send a message in the PRD conversation
   */
  async sendMessage(
    prdId: string,
    message: string,
    ideaContext: IdeaContext,
    prdContent: PrdContent,
    messageHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<ServiceResponse<ChatResponse>> {
    try {
      const { data, error } = await supabase.functions.invoke<ChatResponse>('gemini-prd-chat', {
        body: {
          prdId,
          message,
          isInitial: false,
          ideaContext,
          prdContent,
          messageHistory,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        return {
          data: null,
          error: { 
            message: 'Failed to get AI response', 
            code: 'EDGE_FUNCTION_ERROR' 
          },
        };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'No response from AI assistant', code: 'NO_DATA' },
        };
      }

      // Check for error response
      if ('error' in data && 'code' in data) {
        const errorData = data as unknown as EdgeFunctionError;
        return {
          data: null,
          error: { message: errorData.error, code: errorData.code },
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('PRD chat message error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to get AI response', 
          code: 'CHAT_ERROR' 
        },
      };
    }
  },

  /**
   * Convert PrdMessage array to messageHistory format for Edge Function
   */
  formatMessageHistory(
    messages: PrdMessage[]
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    return messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  },
};
