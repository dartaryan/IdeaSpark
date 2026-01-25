// src/features/prototypes/services/prototypeService.ts

import { supabase } from '../../../lib/supabase';
import type { ServiceResponse } from '../../../types/service';
import { 
  Prototype, 
  PrototypeRow, 
  CreatePrototypeInput, 
  CreateVersionInput,
  UpdatePrototypeInput,
  PrototypeStatus,
  mapPrototypeRow 
} from '../types';

export const prototypeService = {
  /**
   * Create a new prototype (version 1)
   */
  async create(input: CreatePrototypeInput): Promise<ServiceResponse<Prototype>> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };
      }

      const { data, error } = await supabase
        .from('prototypes')
        .insert({
          prd_id: input.prdId,
          idea_id: input.ideaId,
          user_id: user.user.id,
          url: input.url || null,
          code: input.code || null,
          status: input.status || 'generating',
          version: 1,
        })
        .select()
        .single();

      if (error) {
        console.error('Create prototype error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Create prototype error:', error);
      return { data: null, error: { message: 'Failed to create prototype', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Get prototype by ID
   */
  async getById(id: string): Promise<ServiceResponse<Prototype>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: { message: 'Prototype not found', code: 'NOT_FOUND' } };
        }
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Get prototype error:', error);
      return { data: null, error: { message: 'Failed to get prototype', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Get all prototypes for a PRD (all versions)
   */
  async getByPrdId(prdId: string): Promise<ServiceResponse<Prototype[]>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('prd_id', prdId)
        .order('version', { ascending: false });

      if (error) {
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { 
        data: (data as PrototypeRow[]).map(mapPrototypeRow), 
        error: null 
      };
    } catch (error) {
      console.error('Get prototypes by PRD error:', error);
      return { data: null, error: { message: 'Failed to get prototypes', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Get all prototypes for a user
   */
  async getByUserId(userId: string): Promise<ServiceResponse<Prototype[]>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { 
        data: (data as PrototypeRow[]).map(mapPrototypeRow), 
        error: null 
      };
    } catch (error) {
      console.error('Get user prototypes error:', error);
      return { data: null, error: { message: 'Failed to get prototypes', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Get version history for a PRD (ordered by version descending)
   */
  async getVersionHistory(prdId: string): Promise<ServiceResponse<Prototype[]>> {
    return this.getByPrdId(prdId); // Same query, different semantic meaning
  },

  /**
   * Get latest version for a PRD
   */
  async getLatestVersion(prdId: string): Promise<ServiceResponse<Prototype>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('prd_id', prdId)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: { message: 'No prototype found for this PRD', code: 'NOT_FOUND' } };
        }
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Get latest version error:', error);
      return { data: null, error: { message: 'Failed to get prototype', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Update prototype status
   */
  async updateStatus(id: string, status: PrototypeStatus): Promise<ServiceResponse<Prototype>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Update status error:', error);
      return { data: null, error: { message: 'Failed to update prototype', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Update prototype (URL, code, status)
   */
  async update(id: string, input: UpdatePrototypeInput): Promise<ServiceResponse<Prototype>> {
    try {
      const updates: Record<string, unknown> = {};
      if (input.url !== undefined) updates.url = input.url;
      if (input.code !== undefined) updates.code = input.code;
      if (input.status !== undefined) updates.status = input.status;

      const { data, error } = await supabase
        .from('prototypes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Update prototype error:', error);
      return { data: null, error: { message: 'Failed to update prototype', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Create a new version (for refinements)
   * Auto-increments version number based on existing versions
   */
  async createVersion(input: CreateVersionInput): Promise<ServiceResponse<Prototype>> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };
      }

      // Get current max version
      const { data: existing, error: versionError } = await supabase
        .from('prototypes')
        .select('version')
        .eq('prd_id', input.prdId)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (versionError && versionError.code !== 'PGRST116') {
        return { data: null, error: { message: versionError.message, code: 'DB_ERROR' } };
      }

      const nextVersion = existing ? existing.version + 1 : 1;

      const { data, error } = await supabase
        .from('prototypes')
        .insert({
          prd_id: input.prdId,
          idea_id: input.ideaId,
          user_id: user.user.id,
          url: input.url || null,
          code: input.code || null,
          refinement_prompt: input.refinementPrompt,
          status: 'generating',
          version: nextVersion,
        })
        .select()
        .single();

      if (error) {
        console.error('Create version error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Create version error:', error);
      return { data: null, error: { message: 'Failed to create version', code: 'UNKNOWN_ERROR' } };
    }
  },
};
