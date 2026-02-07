// src/features/prototypes/services/prototypeService.ts

import { supabase } from '../../../lib/supabase';
import type { ServiceResponse } from '../../../types/service';
import type { 
  Prototype, 
  PrototypeRow, 
  CreatePrototypeInput, 
  CreateVersionInput,
  UpdatePrototypeInput,
  PrototypeStatus 
} from '../types';
import { mapPrototypeRow } from '../types';
import type { PrototypeState } from '../types/prototypeState';
import { validateStateSchema } from '../types/prototypeState';

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

  /**
   * Restore a previous prototype version
   * Creates a new version copying the code/url from the selected version
   *
   * @param prototypeId - The prototype version ID to restore
   * @returns New prototype data
   */
  async restore(prototypeId: string): Promise<ServiceResponse<Prototype>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
        };
      }

      const response = await supabase.functions.invoke('prototype-generate', {
        body: { restoreFromId: prototypeId },
      });

      if (response.error) {
        console.error('Prototype restoration error:', response.error);
        return {
          data: null,
          error: {
            message: response.error.message || 'Failed to restore version',
            code: 'API_ERROR',
          },
        };
      }

      // Convert response to Prototype format
      const restoredData = response.data;
      const prototype: Prototype = {
        id: restoredData.id,
        prdId: '', // Will be filled from actual data
        ideaId: '', // Will be filled from actual data
        userId: session.user.id,
        url: restoredData.url,
        code: restoredData.code,
        version: restoredData.version,
        refinementPrompt: `Restored from v${restoredData.version - 1}`,
        status: restoredData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shareId: restoredData.share_id || '',
        isPublic: restoredData.is_public || false,
        sharedAt: restoredData.shared_at || null,
        viewCount: restoredData.view_count || 0,
      };

      return { data: prototype, error: null };
    } catch (error) {
      console.error('Restore prototype error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to restore version', 
          code: 'UNKNOWN_ERROR' 
        },
      };
    }
  },

  /**
   * Generate a shareable public link for a prototype
   * Updates the prototype to be publicly accessible
   *
   * @param prototypeId - The prototype ID to share
   * @returns Shareable URL
   */
  async generateShareLink(prototypeId: string): Promise<ServiceResponse<string>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
        };
      }

      // Generate unique share_id and update prototype
      const { data: prototype, error } = await supabase
        .from('prototypes')
        .update({
          is_public: true,
          shared_at: new Date().toISOString(),
        })
        .eq('id', prototypeId)
        .eq('user_id', session.user.id) // Ensure ownership
        .select('share_id')
        .single();

      if (error) {
        console.error('Generate share link error:', error);
        return {
          data: null,
          error: { 
            message: 'Failed to generate share link', 
            code: 'DB_ERROR' 
          },
        };
      }

      // Construct full shareable URL
      const shareUrl = `${window.location.origin}/share/prototype/${prototype.share_id}`;

      return { data: shareUrl, error: null };
    } catch (error) {
      console.error('Generate share link error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to generate share link', 
          code: 'UNKNOWN_ERROR' 
        },
      };
    }
  },

  /**
   * Get a public prototype by share_id (no authentication required)
   * Used by public prototype viewer
   *
   * @param shareId - The share_id from the URL
   * @returns Public prototype data
   */
  async getPublicPrototype(shareId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('id, url, version, status, created_at, share_id')
        .eq('share_id', shareId)
        .eq('is_public', true)
        .eq('status', 'ready') // Only show successful prototypes
        .single();

      if (error) {
        console.error('Get public prototype error:', error);
        return {
          data: null,
          error: { 
            message: 'Prototype not found or not public', 
            code: 'NOT_FOUND' 
          },
        };
      }

      // Increment view count (fire and forget)
      // Use setTimeout to avoid blocking and make it truly async
      setTimeout(() => {
        try {
          supabase
            .from('prototypes')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id)
            .then(() => {})
            .catch((err) => console.warn('Failed to increment view count:', err));
        } catch (err) {
          console.warn('Failed to increment view count:', err);
        }
      }, 0);

      return { data, error: null };
    } catch (error) {
      console.error('Get public prototype error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to load prototype', 
          code: 'UNKNOWN_ERROR' 
        },
      };
    }
  },

  /**
   * Get the share URL for a prototype (if already shared)
   *
   * @param prototypeId - The prototype ID
   * @returns Share URL or null if not shared
   */
  async getShareUrl(prototypeId: string): Promise<ServiceResponse<string | null>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
        };
      }

      const { data, error } = await supabase
        .from('prototypes')
        .select('share_id, is_public')
        .eq('id', prototypeId)
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Get share URL error:', error);
        return {
          data: null,
          error: { 
            message: 'Failed to get share URL', 
            code: 'DB_ERROR' 
          },
        };
      }

      if (!data.is_public) {
        return { data: null, error: null }; // Not shared yet
      }

      const shareUrl = `${window.location.origin}/share/prototype/${data.share_id}`;
      return { data: shareUrl, error: null };
    } catch (error) {
      console.error('Get share URL error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to get share URL', 
          code: 'UNKNOWN_ERROR' 
        },
      };
    }
  },

  /**
   * Get the latest prototype for an idea (Task 8 - Story 4.8)
   * Used to check if an idea has a prototype and link to it
   *
   * @param ideaId - The idea ID
   * @returns Latest prototype for the idea, or null if none exists
   */
  async getByIdeaId(ideaId: string): Promise<ServiceResponse<Prototype | null>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('idea_id', ideaId)
        .eq('status', 'ready') // Only return successful prototypes
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle(); // Returns null if no rows, doesn't throw on 0 results

      if (error) {
        console.error('Get prototype by idea error:', error);
        return {
          data: null,
          error: { 
            message: 'Failed to get prototype', 
            code: 'DB_ERROR' 
          },
        };
      }

      if (!data) {
        return { data: null, error: null }; // No prototype yet - not an error
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Get prototype by idea error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to get prototype', 
          code: 'UNKNOWN_ERROR' 
        },
      };
    }
  },

  /**
   * Get all prototypes for an idea (all versions) (Task 8 - Story 4.8)
   * Used for showing complete prototype history for an idea
   *
   * @param ideaId - The idea ID
   * @returns All prototypes for the idea
   */
  async getAllByIdeaId(ideaId: string): Promise<ServiceResponse<Prototype[]>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('idea_id', ideaId)
        .order('version', { ascending: false });

      if (error) {
        console.error('Get all prototypes by idea error:', error);
        return {
          data: null,
          error: { 
            message: 'Failed to get prototypes', 
            code: 'DB_ERROR' 
          },
        };
      }

      return { 
        data: (data as PrototypeRow[]).map(mapPrototypeRow), 
        error: null 
      };
    } catch (error) {
      console.error('Get all prototypes by idea error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to get prototypes', 
          code: 'UNKNOWN_ERROR' 
        },
      };
    }
  },

  // =========================================================================
  // Prototype State Persistence (Story 8.2)
  // =========================================================================

  /**
   * Save (upsert) prototype interaction state to the database.
   * Uses upsert with onConflict on (prototype_id, user_id) to ensure
   * only one state row exists per user per prototype.
   *
   * @param prototypeId - The prototype ID to save state for
   * @param state - The captured PrototypeState to persist
   * @returns ServiceResponse with void data on success
   */
  async saveState(prototypeId: string, state: PrototypeState): Promise<ServiceResponse<void>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };
      }

      // Validate state schema before saving
      if (!validateStateSchema(state)) {
        return { data: null, error: { message: 'Invalid state schema', code: 'VALIDATION_ERROR' } };
      }

      const { error } = await supabase
        .from('prototype_states')
        .upsert(
          {
            prototype_id: prototypeId,
            user_id: userData.user.id,
            state: state as unknown as Record<string, unknown>,
          },
          { onConflict: 'prototype_id,user_id' }
        );

      if (error) {
        console.error('Save prototype state error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Save prototype state error:', error);
      return { data: null, error: { message: 'Failed to save state', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Load saved prototype interaction state for the current user.
   *
   * @param prototypeId - The prototype ID to load state for
   * @returns ServiceResponse with PrototypeState or null if none saved
   */
  async getState(prototypeId: string): Promise<ServiceResponse<PrototypeState | null>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };
      }

      const { data, error } = await supabase
        .from('prototype_states')
        .select('state')
        .eq('prototype_id', prototypeId)
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (error) {
        console.error('Get prototype state error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      if (!data) {
        return { data: null, error: null }; // No saved state — not an error
      }

      // Validate the loaded state schema
      const parsed = data.state as unknown as PrototypeState;
      if (!validateStateSchema(parsed)) {
        return { data: null, error: { message: 'Saved state has invalid schema', code: 'VALIDATION_ERROR' } };
      }

      return { data: parsed, error: null };
    } catch (error) {
      console.error('Get prototype state error:', error);
      return { data: null, error: { message: 'Failed to load state', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Delete saved prototype interaction state for the current user.
   * Useful when switching prototype versions or cleaning up.
   *
   * @param prototypeId - The prototype ID to delete state for
   * @returns ServiceResponse with void data on success
   */
  async deleteState(prototypeId: string): Promise<ServiceResponse<void>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };
      }

      const { error } = await supabase
        .from('prototype_states')
        .delete()
        .eq('prototype_id', prototypeId)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Delete prototype state error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Delete prototype state error:', error);
      return { data: null, error: { message: 'Failed to delete state', code: 'UNKNOWN_ERROR' } };
    }
  },
};
