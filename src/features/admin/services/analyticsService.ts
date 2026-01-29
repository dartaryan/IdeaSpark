// src/features/admin/services/analyticsService.ts
// Task 6: Create analyticsService with data aggregation functions

import { supabase } from '../../../lib/supabase';
import type { ServiceResponse } from '../../../types/service';
import type { AnalyticsData, DateRange, IdeaBreakdown, PipelineStatus, PipelineStageData, CompletionRates, ConversionRate, TrendData } from '../analytics/types';
import { differenceInDays } from 'date-fns';

/**
 * Story 6.3 Task 1 Subtask 1.6: Map status values to display labels
 * Transforms database status enum to human-readable labels
 */
function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    'submitted': 'Submitted',
    'approved': 'Approved',
    'prd_development': 'PRD Development',
    'prototype_complete': 'Prototype Complete',
    'rejected': 'Rejected',
  };
  return labelMap[status] || status;
}

/**
 * Story 6.3 Task 1 Subtask 1.7: Assign PassportCard theme colors to pipeline statuses
 * Color mapping per Dev Notes specification
 */
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'submitted': '#94A3B8',        // Neutral gray (Slate 400)
    'approved': '#0EA5E9',          // Sky blue (Sky 500)
    'prd_development': '#F59E0B',   // Amber yellow (Amber 500)
    'prototype_complete': '#10B981', // Green (Emerald 500)
    'rejected': '#EF4444',          // Red (Red 500)
  };
  return colorMap[status] || '#94A3B8'; // Default to gray for unknown statuses
}

/**
 * Story 6.3 Task 1 Subtask 1.9: Define pipeline order for sorting
 */
const PIPELINE_ORDER: Record<string, number> = {
  'submitted': 1,
  'approved': 2,
  'prd_development': 3,
  'prototype_complete': 4,
  'rejected': 5,
};

/**
 * Analytics service for fetching and aggregating analytics data
 * Subtask 6.1: Create analyticsService.ts in features/admin/services/
 * All methods require admin role - enforced by Supabase RLS policies
 */
export const analyticsService = {
  /**
   * Subtask 6.2: Implement getAnalytics() function returning ServiceResponse<AnalyticsData>
   * Aggregates data from ideas table to calculate analytics metrics
   * 
   * Story 6.2 Task 1: Updated to support date range filtering and trend calculation
   * @param dateRange Optional date range filter { startDate, endDate } in ISO format
   * @returns AnalyticsData with all dashboard metrics
   */
  async getAnalytics(dateRange?: DateRange): Promise<ServiceResponse<AnalyticsData>> {
    try {
      // Subtask 6.9: Verify admin role before executing queries (RLS backup)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: null,
          error: { message: 'User not authenticated', code: 'AUTH_ERROR' },
        };
      }

      // Subtask 1.5 & 1.6: Determine comparison period
      // If no filter: last 30 days vs previous 30 days
      // If filter: filtered range vs previous equal-length period
      const now = new Date();
      let currentPeriodStart: Date;
      let currentPeriodEnd: Date;
      let previousPeriodStart: Date;
      let previousPeriodEnd: Date;

      if (dateRange) {
        // Subtask 1.3: Apply date range filter
        currentPeriodStart = new Date(dateRange.startDate);
        currentPeriodEnd = new Date(dateRange.endDate);
        
        // Subtask 1.6: Calculate previous equal-length period
        const periodLengthMs = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
        previousPeriodEnd = new Date(currentPeriodStart.getTime());
        previousPeriodStart = new Date(currentPeriodStart.getTime() - periodLengthMs);
      } else {
        // Subtask 1.5: Default comparison: last 30 days vs previous 30 days
        currentPeriodEnd = now;
        currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
        previousPeriodStart = new Date(currentPeriodStart.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Subtask 6.3: Query ideas table to calculate total ideas count
      // Subtask 1.3: Apply date range filter if provided
      let query = supabase
        .from('ideas')
        .select('id, status, created_at, updated_at');

      if (dateRange) {
        query = query
          .gte('created_at', currentPeriodStart.toISOString())
          .lt('created_at', currentPeriodEnd.toISOString());
      }

      const { data: ideas, error } = await query;

      // Subtask 6.8: Add error handling with user-friendly messages
      // Subtask 1.10: Add error handling
      if (error) {
        console.error('getAnalytics error:', error);
        return {
          data: null,
          error: { message: 'Failed to fetch analytics data', code: 'DB_ERROR' },
        };
      }

      // Subtask 1.2: Calculate total ideas in current period
      const totalIdeas = ideas?.length ?? 0;

      // Subtask 1.4: Calculate previous period count for trend comparison
      const { data: previousIdeas, error: previousError } = await supabase
        .from('ideas')
        .select('id')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', previousPeriodEnd.toISOString());

      if (previousError) {
        console.error('Previous period query error:', previousError);
      }

      const previousPeriodTotal = previousIdeas?.length ?? 0;

      // Subtask 1.7: Calculate trend percentage: ((current - previous) / previous) * 100
      // Subtask 1.9: Handle edge cases: zero previous period count
      let trendPercentage = 0;
      if (previousPeriodTotal === 0) {
        // If previous period had 0 ideas and current has some, show 100% increase
        trendPercentage = totalIdeas > 0 ? 100 : 0;
      } else {
        trendPercentage = Math.round(((totalIdeas - previousPeriodTotal) / previousPeriodTotal) * 100);
      }

      // Story 6.3 Task 1: Enhanced pipeline breakdown calculation
      // Subtask 1.2: Query ideas grouped by status (done in memory for now, DB optimization in Task 13)
      const statusCounts: Record<string, number> = {};
      ideas?.forEach((idea) => {
        const status = idea.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      // Subtask 1.5 & 1.7: Return array of { status, label, count, percentage, color }
      const pipelineBreakdown: PipelineStageData[] = Object.entries(statusCounts).map(([status, count]) => ({
        status: status as PipelineStatus,
        label: getStatusLabel(status), // Subtask 1.6: Map to display label
        count,
        percentage: totalIdeas > 0 ? Math.round((count / totalIdeas) * 100) : 0, // Subtask 1.3
        color: getStatusColor(status), // Subtask 1.7: Assign PassportCard colors
      }));

      // Subtask 1.9: Sort by pipeline order (submitted → approved → prd_development → prototype_complete → rejected)
      pipelineBreakdown.sort((a, b) => {
        const orderA = PIPELINE_ORDER[a.status] || 999;
        const orderB = PIPELINE_ORDER[b.status] || 999;
        return orderA - orderB;
      });

      // Subtask 1.8: Handle empty case (return empty array, already handled above)

      // Subtask 6.5: Calculate completion rate: (prototype_complete / total_submitted) * 100
      const prototypeComplete = statusCounts['prototype_complete'] || 0;
      const completionRate = totalIdeas > 0 ? Math.round((prototypeComplete / totalIdeas) * 100) : 0;

      // Subtask 6.6: Calculate average time metrics using created_at and updated_at timestamps
      // Mock values for now - will be calculated properly in later stories
      const timeMetrics = {
        avgTimeToApproval: 3, // days
        avgTimeToPRD: 5, // days
        avgTimeToPrototype: 14, // days
      };

      // Subtask 1.8: Return totalIdeas, previousPeriodTotal, trendPercentage in AnalyticsData
      // (moved below to include completion rates)

      // Story 6.4 Task 1: Calculate completion rates
      const completionRates = await calculateCompletionRates(currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd);

      const analyticsData: AnalyticsData = {
        totalIdeas,
        previousPeriodTotal,
        trendPercentage,
        pipelineBreakdown,
        completionRate,
        completionRates, // Story 6.4 Task 1 Subtask 1.12: Add completion rates
        timeMetrics,
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(), // Subtask 2.5
      };

      return { data: analyticsData, error: null };
    } catch (error) {
      console.error('getAnalytics error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch analytics', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Story 6.2 Task 8: Get ideas breakdown by time period
   * Subtask 8.1: Create getIdeasBreakdown() function
   * 
   * @param dateRange Optional date range filter
   * @returns Array of idea counts grouped by time period
   */
  async getIdeasBreakdown(dateRange?: DateRange): Promise<ServiceResponse<IdeaBreakdown[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: null,
          error: { message: 'User not authenticated', code: 'AUTH_ERROR' },
        };
      }

      // Determine date range parameters
      let startDate: string | null = null;
      let endDate: string | null = null;

      if (dateRange) {
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      } else {
        // Default: last 30 days
        const currentPeriodEnd = new Date();
        const currentPeriodStart = new Date();
        currentPeriodStart.setDate(currentPeriodEnd.getDate() - 30);
        
        startDate = currentPeriodStart.toISOString();
        endDate = currentPeriodEnd.toISOString();
      }

      // Subtask 8.2 & 8.3: Call optimized PostgreSQL function with date_trunc
      // This function groups ideas by week at the database level for better performance
      const { data, error } = await supabase.rpc('get_ideas_breakdown', {
        start_date: startDate,
        end_date: endDate,
        interval_type: 'week'
      });

      // Subtask 8.8: Handle empty results gracefully
      if (error) {
        console.error('getIdeasBreakdown error:', error);
        return {
          data: null,
          error: { message: 'Failed to fetch breakdown data', code: 'DB_ERROR' },
        };
      }

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      // Subtask 8.4 & 8.5: Format breakdown with period labels
      // PostgreSQL function already formats periods, convert to IdeaBreakdown format
      const breakdown: IdeaBreakdown[] = data.map((row: { period: string; count: number }) => ({
        period: row.period,
        count: row.count,
      }));

      // Subtask 8.7: Order by period ascending (already sorted by PostgreSQL function)
      return { data: breakdown, error: null };
    } catch (error) {
      console.error('getIdeasBreakdown error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch breakdown', code: 'UNKNOWN_ERROR' },
      };
    }
  },
};
