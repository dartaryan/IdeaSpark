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
  /** Constructive feedback from admin when idea is rejected */
  rejection_feedback?: string | null;
  /** Timestamp when idea was rejected */
  rejected_at?: string | null;
  /** User ID of admin who rejected the idea */
  rejected_by?: string | null;
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

/**
 * User with activity information
 * Used in admin user list view
 * Story 5.7 - Task 6: User activity types
 */
export interface UserWithActivity {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  ideas_count: number;
  last_idea_submitted_at?: string | null;
}

/**
 * Detailed user information with activity metrics
 * Used in admin user detail view
 * Story 5.7 - Task 6: User detail types
 */
export interface UserDetail extends UserWithActivity {
  ideas_by_status: {
    submitted: number;
    approved: number;
    prd_development: number;
    prototype_complete: number;
    rejected: number;
  };
  approval_rate?: number; // percentage of ideas approved
  recent_activity: {
    type: 'submitted_idea' | 'completed_prd' | 'generated_prototype';
    idea_id: string;
    idea_title: string;
    timestamp: string;
  }[];
}

/**
 * Date range for filtering analytics
 * Story 6.7 - Task 1: DateRange interface
 * Story 6.7 - Task 20: Enhanced documentation with examples
 * Subtask 1.1: Define DateRange interface with start, end, label
 * 
 * Represents a time period for filtering analytics data.
 * Used throughout the analytics dashboard to filter metrics by date.
 * 
 * @example
 * ```typescript
 * // Regular date range (last 30 days)
 * const range: DateRange = {
 *   start: new Date('2025-12-30'),
 *   end: new Date('2026-01-29'),
 *   label: 'Last 30 days'
 * };
 * 
 * // All time range (no start limit)
 * const allTime: DateRange = {
 *   start: null,
 *   end: new Date(),
 *   label: 'All time'
 * };
 * ```
 */
export interface DateRange {
  /** 
   * Start date of the range. 
   * Set to null for "All time" to include all historical data.
   */
  start: Date | null;
  /** 
   * End date of the range.
   * Typically set to current date/time.
   */
  end: Date;
  /** 
   * Human-readable label for display in UI.
   * Examples: "Last 30 days", "Custom", "All time"
   */
  label: string;
}

/**
 * Preset date range options
 * Story 6.7 - Task 1: DateRangePreset type
 * Story 6.7 - Task 20: Enhanced documentation
 * Subtask 1.2: Define DateRangePreset type with all preset options
 * 
 * Predefined time period options for quick filtering.
 * - `last7days`: Last 7 days from now
 * - `last30days`: Last 30 days from now (default)
 * - `last90days`: Last 90 days from now
 * - `alltime`: All historical data (no start date limit)
 * - `custom`: User-defined date range via date picker
 * 
 * @example
 * ```typescript
 * const preset: DateRangePreset = 'last30days';
 * const range = getPresetDateRange(preset);
 * ```
 */
export type DateRangePreset = 
  | 'last7days' 
  | 'last30days' 
  | 'last90days' 
  | 'alltime' 
  | 'custom';
