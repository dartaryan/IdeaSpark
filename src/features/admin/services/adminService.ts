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
        submitter_name: idea.users?.email?.split('@')[0] || 'Unknown',
        submitter_email: idea.users?.email || '',
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
};
