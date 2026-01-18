import { supabase } from '../../../lib/supabase';
import type { Idea, CreateIdeaInput, UpdateIdeaInput, IdeaStatus } from '../../../types/database';
import type { ServiceResponse } from '../../../types/service';

export const ideaService = {
  /**
   * Get all ideas for the current user (RLS enforced)
   */
  async getIdeas(): Promise<ServiceResponse<Idea[]>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data ?? [], error: null };
    } catch (error) {
      console.error('getIdeas error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch ideas', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get a single idea by ID
   */
  async getIdeaById(id: string): Promise<ServiceResponse<Idea>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: { message: 'Idea not found', code: 'NOT_FOUND' },
          };
        }
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('getIdeaById error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch idea', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Create a new idea
   */
  async createIdea(input: CreateIdeaInput): Promise<ServiceResponse<Idea>> {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'AUTH_REQUIRED' },
        };
      }

      const { data, error } = await supabase
        .from('ideas')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('createIdea error:', error);
      return {
        data: null,
        error: { message: 'Failed to create idea', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Update an existing idea
   */
  async updateIdea(id: string, input: UpdateIdeaInput): Promise<ServiceResponse<Idea>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: { message: 'Idea not found or not authorized', code: 'NOT_FOUND' },
          };
        }
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('updateIdea error:', error);
      return {
        data: null,
        error: { message: 'Failed to update idea', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Delete an idea
   */
  async deleteIdea(id: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase.from('ideas').delete().eq('id', id);

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('deleteIdea error:', error);
      return {
        data: null,
        error: { message: 'Failed to delete idea', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  // ============ Admin Methods ============

  /**
   * Get all ideas (admin only - RLS allows based on role)
   */
  async getAllIdeas(): Promise<ServiceResponse<Idea[]>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data ?? [], error: null };
    } catch (error) {
      console.error('getAllIdeas error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch ideas', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get ideas by status (admin filtering)
   */
  async getIdeasByStatus(status: IdeaStatus): Promise<ServiceResponse<Idea[]>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data ?? [], error: null };
    } catch (error) {
      console.error('getIdeasByStatus error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch ideas', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Update idea status (admin action)
   */
  async updateIdeaStatus(id: string, status: IdeaStatus): Promise<ServiceResponse<Idea>> {
    return this.updateIdea(id, { status });
  },
};
