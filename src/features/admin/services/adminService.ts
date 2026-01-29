// src/features/admin/services/adminService.ts
// Task 4: Admin service layer for fetching pipeline metrics

import { supabase } from '../../../lib/supabase';
import type { ServiceResponse } from '../../../types/service';
import type { MetricData, IdeaFilters, IdeaWithSubmitter, PipelineIdeas } from '../types';
import type { IdeaStatus } from '../../../types/database';
import { differenceInDays } from 'date-fns';

/**
 * Admin service for fetching admin-specific data
 * All methods require admin role - enforced by Supabase RLS policies
 */
export const adminService = {
  /**
   * Get pipeline metrics - counts of ideas by status
   * Subtask 4.2: Query ideas table grouped by status
   * Subtask 4.3: Admin-only access enforced by RLS policy
   * Subtask 4.4: Returns counts for all status enum values
   * 
   * @returns MetricData with counts for each status
   */
  async getMetrics(): Promise<ServiceResponse<MetricData>> {
    try {
      // Query all ideas - only fetch status column for performance
      // RLS policy enforces admin-only access at database level
      const { data, error } = await supabase
        .from('ideas')
        .select('status');

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      // Initialize counts for all status values (Subtask 4.4)
      const metrics: MetricData = {
        submitted: 0,
        approved: 0,
        prd_development: 0,
        prototype_complete: 0,
        rejected: 0,
      };

      // Count ideas by status (Subtask 4.2)
      if (data) {
        data.forEach((idea) => {
          const status = idea.status as IdeaStatus;
          if (status in metrics) {
            metrics[status]++;
          }
        });
      }

      return { data: metrics, error: null };
    } catch (error) {
      console.error('getMetrics error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch metrics', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get all ideas with filters
   * Task 4: Fetch all ideas with filtering, sorting, and search
   * Subtask 4.1: Implement getAllIdeas() function
   * Subtask 4.2: Accept parameters: statusFilter, sortBy, searchQuery
   * Subtask 4.3: Build Supabase query with join to users table
   * Subtask 4.4: Apply status filter if provided
   * Subtask 4.5: Apply search filter on title and problem columns
   * Subtask 4.6: Apply sort order
   * Subtask 4.7: Return paginated results (limit 50)
   * 
   * @param filters - Filter parameters for ideas
   * @returns IdeaWithSubmitter[] with submitter information
   */
  async getAllIdeas(filters: IdeaFilters): Promise<ServiceResponse<IdeaWithSubmitter[]>> {
    try {
      // Subtask 4.3: Start query with join to users table
      let query = supabase
        .from('ideas')
        .select('*, users!inner(id, email)');

      // Subtask 4.4: Apply status filter if not "all"
      if (filters.statusFilter !== 'all') {
        query = query.eq('status', filters.statusFilter);
      }

      // Subtask 4.5: Apply search filter on title and problem
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const searchTerm = filters.searchQuery.trim();
        query = query.or(`title.ilike.%${searchTerm}%,problem.ilike.%${searchTerm}%`);
      }

      // Subtask 4.6: Apply sort order
      if (filters.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (filters.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (filters.sortBy === 'status') {
        query = query.order('status', { ascending: true });
      }

      // Subtask 4.7: Limit to 50 results
      query = query.limit(50);

      const { data, error } = await query;

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      // Transform data to include submitter info
      const ideasWithSubmitter: IdeaWithSubmitter[] = (data || []).map((idea: any) => ({
        id: idea.id,
        user_id: idea.user_id,
        title: idea.title,
        problem: idea.problem,
        solution: idea.solution,
        impact: idea.impact,
        status: idea.status,
        created_at: idea.created_at,
        updated_at: idea.updated_at,
        status_updated_at: idea.status_updated_at || null,
        submitter_name: idea.users?.email?.split('@')[0] || 'Unknown',
        submitter_email: idea.users?.email || '',
        rejection_feedback: idea.rejection_feedback || null,
        rejected_at: idea.rejected_at || null,
        rejected_by: idea.rejected_by || null,
      }));

      return { data: ideasWithSubmitter, error: null };
    } catch (error) {
      console.error('getAllIdeas error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch ideas', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get ideas grouped by pipeline status
   * Task 4: Extend adminService to fetch ideas grouped by status
   * Subtask 4.1: Implement getIdeasByPipeline() function
   * Subtask 4.2: Query ideas table with JOIN to users table
   * Subtask 4.3: Group results by status in TypeScript
   * Subtask 4.4: Return structure with ideas grouped by status
   * Subtask 4.5: Sort ideas within each group by created_at DESC
   * Subtask 4.6: Calculate days_in_stage for each idea
   * 
   * @returns PipelineIdeas with ideas grouped by status
   */
  async getIdeasByPipeline(): Promise<ServiceResponse<PipelineIdeas>> {
    try {
      // Subtask 4.2: Query ideas table with join to users table
      // Exclude rejected status from pipeline view (not part of active pipeline)
      const { data, error } = await supabase
        .from('ideas')
        .select('*, users!inner(id, email)')
        .neq('status', 'rejected')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      // Subtask 4.3 & 4.4: Initialize structure and group by status
      const pipeline: PipelineIdeas = {
        submitted: [],
        approved: [],
        prd_development: [],
        prototype_complete: [],
      };

      // Subtask 4.5 & 4.6: Transform and group ideas
      if (data) {
        const now = new Date();
        
        data.forEach((idea: any) => {
          // Subtask 4.6: Calculate days_in_stage
          const stageDate = idea.status_updated_at || idea.created_at;
          const days_in_stage = differenceInDays(now, new Date(stageDate));

          const ideaWithSubmitter: IdeaWithSubmitter = {
            id: idea.id,
            user_id: idea.user_id,
            title: idea.title,
            problem: idea.problem,
            solution: idea.solution,
            impact: idea.impact,
            status: idea.status,
            created_at: idea.created_at,
            updated_at: idea.updated_at,
            status_updated_at: idea.status_updated_at,
            submitter_name: idea.users?.email?.split('@')[0] || 'Unknown',
            submitter_email: idea.users?.email || '',
            days_in_stage,
          };

          // Group by status
          const status = idea.status as IdeaStatus;
          if (status === 'submitted') {
            pipeline.submitted.push(ideaWithSubmitter);
          } else if (status === 'approved') {
            pipeline.approved.push(ideaWithSubmitter);
          } else if (status === 'prd_development') {
            pipeline.prd_development.push(ideaWithSubmitter);
          } else if (status === 'prototype_complete') {
            pipeline.prototype_complete.push(ideaWithSubmitter);
          }
        });
      }

      return { data: pipeline, error: null };
    } catch (error) {
      console.error('getIdeasByPipeline error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch pipeline ideas', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Approve an idea for PRD development
   * Task 1: Extend adminService with approveIdea() function
   * Subtask 1.1: Add approveIdea(ideaId: string) function to adminService.ts
   * Subtask 1.2: Update ideas table: SET status = 'approved', status_updated_at = NOW()
   * Subtask 1.3: Record approval timestamp in status_updated_at column
   * Subtask 1.4: Return ServiceResponse<Idea> with updated idea
   * Subtask 1.5: Handle database errors gracefully with error messages
   * 
   * @param ideaId - ID of the idea to approve
   * @returns ServiceResponse<Idea> with approved idea data
   */
  async approveIdea(ideaId: string): Promise<ServiceResponse<any>> {
    try {
      // Subtask 1.2 & 1.3: Update idea status and timestamp
      // Only approve if current status is 'submitted' to prevent invalid state changes
      const { data, error } = await supabase
        .from('ideas')
        .update({
          status: 'approved',
          status_updated_at: new Date().toISOString(),
        })
        .eq('id', ideaId)
        .eq('status', 'submitted') // Only approve if currently submitted
        .select()
        .single();

      // Subtask 1.5: Handle database errors gracefully
      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      // Task 10: Subtask 10.2 - Check if idea was updated (handle already-reviewed case)
      if (!data) {
        return {
          data: null,
          error: { 
            message: 'This idea has already been reviewed', 
            code: 'ALREADY_REVIEWED' 
          },
        };
      }

      // Task 9: Subtask 9.1-9.3 - TODO: Add activity logging
      // TODO: Log approval action to activity_log table when it's created
      // Record: admin_user_id, idea_id, action='approve', timestamp
      // This should fail gracefully and not block approval if logging fails

      // Subtask 1.4: Return updated idea
      return { data, error: null };
    } catch (error) {
      console.error('approveIdea error:', error);
      return {
        data: null,
        error: { message: 'Failed to approve idea', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get idea with complete details including submitter and related data
   * Story 5.6 - Task 6: Cross-user data access for admins
   * Subtask 6.1: Add getIdeaWithDetails(ideaId) function to adminService
   * Subtask 6.2: Query ideas table with join to users table for submitter info
   * Subtask 6.3: Include related PRD and prototype IDs if they exist
   * Subtask 6.6: Return ServiceResponse<T> for all functions following architecture pattern
   * Subtask 6.7: Handle errors gracefully with user-friendly messages
   * 
   * @param ideaId - ID of the idea to fetch
   * @returns ServiceResponse with complete idea details
   */
  async getIdeaWithDetails(ideaId: string): Promise<ServiceResponse<any>> {
    try {
      // Verify admin role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        };
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || !userData || userData.role !== 'admin') {
        return {
          data: null,
          error: { message: 'Unauthorized access', code: 'UNAUTHORIZED' },
        };
      }

      // Subtask 6.2 & 6.3: Query ideas with join to users, PRDs, and prototypes
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          submitter:users!ideas_user_id_fkey (id, email, role, created_at),
          prd_documents (id, status, created_at, updated_at, completed_at),
          prototypes (id, status, url, created_at, version)
        `)
        .eq('id', ideaId)
        .single();

      if (error) {
        console.error('Failed to fetch idea:', error);
        return {
          data: null,
          error: { message: 'Failed to load idea details', code: 'DB_ERROR' },
        };
      }

      // Transform data to include computed fields
      const prdDocs = (data as any).prd_documents || [];
      const prototypes = (data as any).prototypes || [];
      const submitter = (data as any).submitter;

      const ideaWithDetails = {
        ...data,
        submitter: submitter ? {
          id: submitter.id,
          name: submitter.email?.split('@')[0] || 'Unknown',
          email: submitter.email || '',
          role: submitter.role || 'user',
        } : null,
        prd_id: prdDocs[0]?.id || null,
        prd_status: prdDocs[0]?.status || null,
        prd_created_at: prdDocs[0]?.created_at || null,
        prd_completed_at: prdDocs[0]?.completed_at || null,
        prototype_id: prototypes[0]?.id || null,
        prototype_status: prototypes[0]?.status || null,
        prototype_url: prototypes[0]?.url || null,
        prototype_created_at: prototypes[0]?.created_at || null,
      };

      return { data: ideaWithDetails, error: null };
    } catch (error) {
      console.error('getIdeaWithDetails error:', error);
      return {
        data: null,
        error: { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get PRD by ID with admin bypass of RLS
   * Story 5.6 - Task 6: Cross-user data access for admins
   * Subtask 6.4: Add getPrdById(prdId) function with admin bypass of RLS
   * Subtask 6.6: Return ServiceResponse<T> for all functions following architecture pattern
   * Subtask 6.7: Handle errors gracefully with user-friendly messages
   * 
   * @param prdId - ID of the PRD to fetch
   * @returns ServiceResponse with PRD document and user info
   */
  async getPrdById(prdId: string): Promise<ServiceResponse<any>> {
    try {
      // Verify admin role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        };
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || !userData || userData.role !== 'admin') {
        return {
          data: null,
          error: { message: 'Unauthorized access', code: 'UNAUTHORIZED' },
        };
      }

      // Admin bypass RLS - query PRD with user and idea info
      // Use raw query since prd_documents is not in typed schema
      const { data, error } = await (supabase as any)
        .from('prd_documents')
        .select(`
          *,
          idea:ideas(id, title, problem, solution, impact, status),
          creator:users!prd_documents_user_id_fkey(id, email, role)
        `)
        .eq('id', prdId)
        .single();

      if (error) {
        console.error('Failed to fetch PRD:', error);
        return {
          data: null,
          error: { message: 'Failed to load PRD', code: 'DB_ERROR' },
        };
      }

      // Transform user info
      const creator = data.creator || null;
      const prdWithDetails = {
        ...data,
        creator: creator ? {
          id: creator.id,
          name: creator.email?.split('@')[0] || 'Unknown',
          email: creator.email || '',
          role: creator.role || 'user',
        } : null,
      };

      return { data: prdWithDetails, error: null };
    } catch (error) {
      console.error('getPrdById error:', error);
      return {
        data: null,
        error: { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get prototype by ID with admin bypass of RLS
   * Story 5.6 - Task 6: Cross-user data access for admins
   * Subtask 6.5: Add getPrototypeById(prototypeId) function with admin bypass of RLS
   * Subtask 6.6: Return ServiceResponse<T> for all functions following architecture pattern
   * Subtask 6.7: Handle errors gracefully with user-friendly messages
   * 
   * @param prototypeId - ID of the prototype to fetch
   * @returns ServiceResponse with prototype and user info
   */
  async getPrototypeById(prototypeId: string): Promise<ServiceResponse<any>> {
    try {
      // Verify admin role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        };
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || !userData || userData.role !== 'admin') {
        return {
          data: null,
          error: { message: 'Unauthorized access', code: 'UNAUTHORIZED' },
        };
      }

      // Admin bypass RLS - query prototype with user and idea info
      // Use raw query since prototypes is not in typed schema
      const { data, error } = await (supabase as any)
        .from('prototypes')
        .select(`
          *,
          idea:ideas(id, title, status),
          creator:users!prototypes_user_id_fkey(id, email, role)
        `)
        .eq('id', prototypeId)
        .single();

      if (error) {
        console.error('Failed to fetch prototype:', error);
        return {
          data: null,
          error: { message: 'Failed to load prototype', code: 'DB_ERROR' },
        };
      }

      // Transform user info
      const creator = data.creator || null;
      const prototypeWithDetails = {
        ...data,
        creator: creator ? {
          id: creator.id,
          name: creator.email?.split('@')[0] || 'Unknown',
          email: creator.email || '',
          role: creator.role || 'user',
        } : null,
      };

      return { data: prototypeWithDetails, error: null };
    } catch (error) {
      console.error('getPrototypeById error:', error);
      return {
        data: null,
        error: { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Reject an idea with constructive feedback
   * Story 5.5 - Task 1: Extend adminService with rejectIdea() function
   * Subtask 1.1: Add rejectIdea(ideaId: string, feedback: string) function to adminService.ts
   * Subtask 1.2: Update ideas table: SET status = 'rejected', rejection_feedback = feedback, status_updated_at = NOW()
   * Subtask 1.3: Record rejection timestamp in status_updated_at column
   * Subtask 1.4: Return ServiceResponse<Idea> with updated idea including feedback
   * Subtask 1.5: Handle database errors gracefully with error messages
   * 
   * @param ideaId - ID of the idea to reject
   * @param feedback - Constructive feedback explaining why the idea was rejected (min 20, max 500 chars)
   * @returns ServiceResponse with rejected idea data
   */
  async rejectIdea(ideaId: string, feedback: string): Promise<ServiceResponse<any>> {
    try {
      // Task 11: Subtask 11.7 - Validate feedback length (min 20, max 500 chars)
      if (feedback.length < 20) {
        return {
          data: null,
          error: { message: 'Feedback must be at least 20 characters', code: 'VALIDATION_ERROR' },
        };
      }
      if (feedback.length > 500) {
        return {
          data: null,
          error: { message: 'Feedback must be less than 500 characters', code: 'VALIDATION_ERROR' },
        };
      }

      // Task 11: Subtask 11.8 - Sanitize feedback text to prevent XSS attacks
      // React handles XSS automatically when rendering, but we still sanitize for storage
      const sanitizedFeedback = feedback
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

      // Task 9: Subtask 9.2 - Get current user for rejected_by tracking
      const { data: { user } } = await supabase.auth.getUser();

      // Subtask 1.2 & 1.3: Update idea status, feedback, and timestamps
      // Task 11: Subtask 11.1 - Only reject if current status is 'submitted'
      const { data, error } = await supabase
        .from('ideas')
        .update({
          status: 'rejected',
          rejection_feedback: sanitizedFeedback,
          rejected_at: new Date().toISOString(),
          rejected_by: user?.id || null,
          status_updated_at: new Date().toISOString(),
        })
        .eq('id', ideaId)
        .eq('status', 'submitted') // Only reject if currently submitted
        .select()
        .single();

      // Subtask 1.5: Handle database errors gracefully
      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      // Task 11: Subtask 11.2 - Handle already-reviewed case
      if (!data) {
        return {
          data: null,
          error: { 
            message: 'This idea has already been reviewed', 
            code: 'ALREADY_REVIEWED' 
          },
        };
      }

      // Task 10: Subtask 10.3 - TODO: Add activity logging when activity_log table exists
      // TODO: Log rejection action to activity_log table when it's created
      // Record: admin_user_id, idea_id, action='reject', feedback_preview, timestamp
      // This should fail gracefully and not block rejection if logging fails

      // Subtask 1.4: Return updated idea with feedback
      return { data, error: null };
    } catch (error) {
      console.error('rejectIdea error:', error);
      return {
        data: null,
        error: { message: 'Failed to reject idea', code: 'UNKNOWN_ERROR' },
      };
    }
  },
};
