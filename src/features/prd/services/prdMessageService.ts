import { supabase } from '../../../lib/supabase';
import type { PrdMessage, CreateMessageInput, MessageRole } from '../../../types/database';
import type { ServiceResponse } from '../../../types/service';

export const prdMessageService = {
  /**
   * Get all messages for a PRD (ordered by creation time)
   */
  async getMessagesByPrdId(prdId: string): Promise<ServiceResponse<PrdMessage[]>> {
    try {
      const { data, error } = await supabase
        .from('prd_messages')
        .select('*')
        .eq('prd_id', prdId)
        .order('created_at', { ascending: true });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: (data ?? []) as PrdMessage[], error: null };
    } catch (error) {
      console.error('getMessagesByPrdId error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch messages', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get latest N messages for a PRD (for AI context window)
   */
  async getLatestMessages(prdId: string, limit: number = 20): Promise<ServiceResponse<PrdMessage[]>> {
    try {
      const { data, error } = await supabase
        .from('prd_messages')
        .select('*')
        .eq('prd_id', prdId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      // Reverse to get chronological order
      return { data: ((data ?? []) as PrdMessage[]).reverse(), error: null };
    } catch (error) {
      console.error('getLatestMessages error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch messages', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Add a new message to a PRD conversation
   */
  async addMessage(prdId: string, role: MessageRole, content: string): Promise<ServiceResponse<PrdMessage>> {
    try {
      const { data, error } = await supabase
        .from('prd_messages')
        .insert({
          prd_id: prdId,
          role,
          content,
        })
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data as PrdMessage, error: null };
    } catch (error) {
      console.error('addMessage error:', error);
      return {
        data: null,
        error: { message: 'Failed to add message', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Delete all messages for a PRD (useful for reset)
   */
  async deleteMessagesByPrdId(prdId: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('prd_messages')
        .delete()
        .eq('prd_id', prdId);

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('deleteMessagesByPrdId error:', error);
      return {
        data: null,
        error: { message: 'Failed to delete messages', code: 'UNKNOWN_ERROR' },
      };
    }
  },
};
