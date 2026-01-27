// src/features/admin/types.ts
// Admin feature type definitions

/**
 * Metrics data structure for admin dashboard
 * Represents counts of ideas by status
 */
export interface MetricData {
  /** Number of ideas with status 'submitted' */
  submitted: number;
  /** Number of ideas with status 'approved' */
  approved: number;
  /** Number of ideas with status 'prd_development' */
  prd_development: number;
  /** Number of ideas with status 'prototype_complete' */
  prototype_complete: number;
  /** Number of ideas with status 'rejected' */
  rejected: number;
}

/**
 * Recent submission item for admin dashboard
 */
export interface RecentSubmission {
  id: string;
  title: string;
  submitter_name: string;
  created_at: string;
}

/**
 * Filter parameters for all ideas list
 */
export interface IdeaFilters {
  statusFilter: 'all' | 'submitted' | 'approved' | 'prd_development' | 'prototype_complete' | 'rejected';
  sortBy: 'newest' | 'oldest' | 'status';
  searchQuery: string;
}

/**
 * Extended idea type with submitter information
 * Used in admin views to show who submitted the idea
 */
export interface IdeaWithSubmitter {
  id: string;
  user_id: string;
  title: string;
  problem: string;
  solution: string;
  impact: string;
  status: 'submitted' | 'approved' | 'prd_development' | 'prototype_complete' | 'rejected';
  created_at: string;
  updated_at: string;
  status_updated_at: string | null;
  submitter_name: string;
  submitter_email: string;
  days_in_stage?: number;
}

/**
 * Pipeline ideas grouped by status
 * Used in kanban view to organize ideas by pipeline stage
 */
export interface PipelineIdeas {
  submitted: IdeaWithSubmitter[];
  approved: IdeaWithSubmitter[];
  prd_development: IdeaWithSubmitter[];
  prototype_complete: IdeaWithSubmitter[];
}
