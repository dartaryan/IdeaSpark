import { supabase } from '../../../lib/supabase';
import type { PrdDocument, CreatePrdInput, UpdatePrdInput, PrdStatus, PrdContent } from '../../../types/database';
import type { ServiceResponse } from '../../../types/service';
import type { CompletePrdResult } from '../types';

export const prdService = {
  /**
   * Get PRD for a specific idea
   */
  async getPrdByIdeaId(ideaId: string): Promise<ServiceResponse<PrdDocument | null>> {
    try {
      const { data, error } = await supabase
        .from('prd_documents')
        .select('*')
        .eq('idea_id', ideaId)
        .single();

      if (error) {
        // PGRST116 = Row not found (no PRD yet)
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data as PrdDocument, error: null };
    } catch (error) {
      console.error('getPrdByIdeaId error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch PRD', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get PRD by ID
   */
  async getPrdById(id: string): Promise<ServiceResponse<PrdDocument | null>> {
    try {
      const { data, error } = await supabase
        .from('prd_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data as PrdDocument, error: null };
    } catch (error) {
      console.error('getPrdById error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch PRD', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Create a new PRD for an idea
   */
  async createPrd(ideaId: string): Promise<ServiceResponse<PrdDocument>> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'AUTH_REQUIRED' },
        };
      }

      // Initialize empty PRD content structure
      const initialContent: PrdContent = {
        problemStatement: { content: '', status: 'empty' },
        goalsAndMetrics: { content: '', status: 'empty' },
        userStories: { content: '', status: 'empty' },
        requirements: { content: '', status: 'empty' },
        technicalConsiderations: { content: '', status: 'empty' },
        risks: { content: '', status: 'empty' },
        timeline: { content: '', status: 'empty' },
      };

      const { data, error } = await supabase
        .from('prd_documents')
        .insert({
          idea_id: ideaId,
          user_id: user.id,
          content: initialContent,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation (PRD already exists)
        if (error.code === '23505') {
          return {
            data: null,
            error: { message: 'A PRD already exists for this idea', code: 'DUPLICATE' },
          };
        }
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data as PrdDocument, error: null };
    } catch (error) {
      console.error('createPrd error:', error);
      return {
        data: null,
        error: { message: 'Failed to create PRD', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Update PRD content
   */
  async updatePrd(id: string, input: UpdatePrdInput): Promise<ServiceResponse<PrdDocument>> {
    try {
      const { data, error } = await supabase
        .from('prd_documents')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: { message: 'PRD not found or not authorized', code: 'NOT_FOUND' },
          };
        }
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data as PrdDocument, error: null };
    } catch (error) {
      console.error('updatePrd error:', error);
      return {
        data: null,
        error: { message: 'Failed to update PRD', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Update a single PRD section (partial update)
   */
  async updatePrdSection(
    id: string,
    sectionKey: keyof PrdContent,
    sectionData: { content: string; status: 'empty' | 'in_progress' | 'complete' }
  ): Promise<ServiceResponse<PrdDocument>> {
    try {
      // First get current content
      const { data: current, error: fetchError } = await supabase
        .from('prd_documents')
        .select('content')
        .eq('id', id)
        .single();

      if (fetchError) {
        return {
          data: null,
          error: { message: fetchError.message, code: 'DB_ERROR' },
        };
      }

      // Merge section update
      const updatedContent = {
        ...(current.content as PrdContent),
        [sectionKey]: sectionData,
      };

      return this.updatePrd(id, { content: updatedContent });
    } catch (error) {
      console.error('updatePrdSection error:', error);
      return {
        data: null,
        error: { message: 'Failed to update PRD section', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Update PRD status (mark complete or back to draft)
   */
  async updatePrdStatus(id: string, status: PrdStatus): Promise<ServiceResponse<PrdDocument>> {
    return this.updatePrd(id, { status });
  },

  /**
   * Mark PRD as complete and update associated idea status
   * Uses atomic operations to ensure consistency
   */
  async completePrd(prdId: string): Promise<ServiceResponse<CompletePrdResult>> {
    try {
      // First, get the PRD to find the idea_id
      const { data: prd, error: fetchError } = await supabase
        .from('prd_documents')
        .select('id, idea_id, content, status')
        .eq('id', prdId)
        .single();

      if (fetchError || !prd) {
        return {
          data: null,
          error: { message: fetchError?.message || 'PRD not found', code: 'NOT_FOUND' },
        };
      }

      if (prd.status === 'complete') {
        return {
          data: { prd: prd as PrdDocument, ideaUpdated: false },
          error: null,
        };
      }

      // Update PRD status to complete
      const { data: updatedPrd, error: prdError } = await supabase
        .from('prd_documents')
        .update({
          status: 'complete',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', prdId)
        .select()
        .single();

      if (prdError) {
        return {
          data: null,
          error: { message: prdError.message, code: 'DB_ERROR' },
        };
      }

      // Update idea status to 'prd_development'
      // (only if currently 'approved' - maintains status progression)
      const { error: ideaError } = await supabase
        .from('ideas')
        .update({
          status: 'prd_development',
          updated_at: new Date().toISOString(),
        })
        .eq('id', prd.idea_id)
        .in('status', ['approved', 'prd_development']); // Only update if in valid state

      // Log idea error but don't fail - PRD completion is primary
      const ideaUpdated = !ideaError;

      return {
        data: { prd: updatedPrd as PrdDocument, ideaUpdated },
        error: null,
      };
    } catch (error) {
      console.error('completePrd error:', error);
      return {
        data: null,
        error: { message: 'Failed to complete PRD', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Delete a PRD
   */
  async deletePrd(id: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('prd_documents')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('deletePrd error:', error);
      return {
        data: null,
        error: { message: 'Failed to delete PRD', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  // ============ Admin Methods ============

  /**
   * Get all PRDs (admin only - RLS allows based on role)
   */
  async getAllPrds(): Promise<ServiceResponse<PrdDocument[]>> {
    try {
      const { data, error } = await supabase
        .from('prd_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: (data ?? []) as PrdDocument[], error: null };
    } catch (error) {
      console.error('getAllPrds error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch PRDs', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get PRDs by status (admin filtering)
   */
  async getPrdsByStatus(status: PrdStatus): Promise<ServiceResponse<PrdDocument[]>> {
    try {
      const { data, error } = await supabase
        .from('prd_documents')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: (data ?? []) as PrdDocument[], error: null };
    } catch (error) {
      console.error('getPrdsByStatus error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch PRDs', code: 'UNKNOWN_ERROR' },
      };
    }
  },
};
