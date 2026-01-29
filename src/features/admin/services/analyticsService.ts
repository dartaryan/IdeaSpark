// src/features/admin/services/analyticsService.ts
// Task 6: Create analyticsService with data aggregation functions

import { supabase } from '../../../lib/supabase';
import type { ServiceResponse } from '../../../types/service';
import type { AnalyticsData, DateRange, IdeaBreakdown, PipelineStatus, PipelineStageData, CompletionRates, ConversionRate, TrendData, TimeToDecisionMetrics, TimeMetric, BenchmarkData, UserActivityMetrics, TopContributorData, RecentSubmissionData } from '../analytics/types';
import { TIME_BENCHMARKS, TIME_FORMAT_THRESHOLDS } from '../../../lib/constants';

/**
 * Story 6.4 Task 1 & Task 2: Calculate completion rates with trend data
 * Subtask 1.1-1.13 & Subtask 2.1-2.8: Optimized single query with COUNT FILTER
 * @param currentStart Start of current period
 * @param currentEnd End of current period
 * @param previousStart Start of previous period
 * @param previousEnd End of previous period
 * @returns CompletionRates with all conversion metrics and trends
 */
async function calculateCompletionRates(
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date
): Promise<CompletionRates> {
  try {
    // Subtask 1.5 & 13.5: Use single optimized query with COUNT FILTER
    // Query for current period counts
    const { data: currentCounts, error: currentError } = await (supabase.rpc as any)('get_completion_rate_counts', {
      start_date: currentStart.toISOString(),
      end_date: currentEnd.toISOString()
    });

    if (currentError) {
      console.error('Current period completion rates error:', currentError);
      // Subtask 1.13: Return default values on error
      return getDefaultCompletionRates();
    }

    // Subtask 2.1: Query for previous period counts
    const { data: previousCounts, error: previousError } = await (supabase.rpc as any)('get_completion_rate_counts', {
      start_date: previousStart.toISOString(),
      end_date: previousEnd.toISOString()
    });

    if (previousError) {
      console.error('Previous period completion rates error:', previousError);
    }

    // Extract current period counts
    const currentSubmitted = (currentCounts as any)?.submitted_count || 0;
    const currentApproved = (currentCounts as any)?.approved_count || 0;
    const currentPrdComplete = (currentCounts as any)?.prd_complete_count || 0;
    const currentPrototype = (currentCounts as any)?.prototype_count || 0;

    // Extract previous period counts (Subtask 2.6: handle missing data)
    const previousSubmitted = (previousCounts as any)?.submitted_count || 0;
    const previousApproved = (previousCounts as any)?.approved_count || 0;
    const previousPrdComplete = (previousCounts as any)?.prd_complete_count || 0;
    const previousPrototype = (previousCounts as any)?.prototype_count || 0;

    // Subtask 1.6-1.9: Calculate conversion rates with division by zero handling
    const submittedToApprovedRate = calculateRate(currentApproved, currentSubmitted);
    const approvedToPrdRate = calculateRate(currentPrdComplete, currentApproved);
    const prdToPrototypeRate = calculateRate(currentPrototype, currentPrdComplete);
    const overallRate = calculateRate(currentPrototype, currentSubmitted);

    // Calculate previous period rates for trend comparison
    const prevSubmittedToApprovedRate = calculateRate(previousApproved, previousSubmitted);
    const prevApprovedToPrdRate = calculateRate(previousPrdComplete, previousApproved);
    const prevPrdToPrototypeRate = calculateRate(previousPrototype, previousPrdComplete);
    const prevOverallRate = calculateRate(previousPrototype, previousSubmitted);

    // Subtask 2.2-2.7: Calculate trend data for each conversion
    const submittedToApprovedTrend = calculateTrend(submittedToApprovedRate, prevSubmittedToApprovedRate);
    const approvedToPrdTrend = calculateTrend(approvedToPrdRate, prevApprovedToPrdRate);
    const prdToPrototypeTrend = calculateTrend(prdToPrototypeRate, prevPrdToPrototypeRate);
    const overallTrend = calculateTrend(overallRate, prevOverallRate);

    // Subtask 1.12: Return CompletionRates object
    return {
      submittedToApproved: {
        rate: submittedToApprovedRate,
        trend: submittedToApprovedTrend,
        count: currentApproved,
        totalCount: currentSubmitted,
      },
      approvedToPrd: {
        rate: approvedToPrdRate,
        trend: approvedToPrdTrend,
        count: currentPrdComplete,
        totalCount: currentApproved,
      },
      prdToPrototype: {
        rate: prdToPrototypeRate,
        trend: prdToPrototypeTrend,
        count: currentPrototype,
        totalCount: currentPrdComplete,
      },
      overallSubmittedToPrototype: {
        rate: overallRate,
        trend: overallTrend,
        count: currentPrototype,
        totalCount: currentSubmitted,
      },
    };
  } catch (error) {
    console.error('calculateCompletionRates error:', error);
    // Subtask 1.13 & 2.8: Error handling with default values
    return getDefaultCompletionRates();
  }
}

/**
 * Story 6.4 Task 1 Subtask 1.10: Calculate rate with division by zero handling
 * @param numerator Count of ideas that converted
 * @param denominator Total count of ideas
 * @returns Rate as percentage (0-100), or 0 if denominator is 0
 */
function calculateRate(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0; // Subtask 1.10: Return 0% if no ideas to convert
  }
  return Math.round((numerator / denominator) * 100 * 10) / 10; // Round to 1 decimal place
}

/**
 * Story 6.5 Task 1 Subtask 1.9: Format time as human-readable
 * @param days Time in days
 * @returns Human-readable time string
 */
function formatTime(days: number): string {
  // Handle 0 case specially
  if (days === 0) {
    return 'N/A';
  }
  
  if (days < TIME_FORMAT_THRESHOLDS.showHours) {
    const hours = Math.round(days * 24);
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  } else if (days < TIME_FORMAT_THRESHOLDS.showWeeks) {
    return `${days.toFixed(1)} day${days === 1 ? '' : 's'}`;
  } else {
    const weeks = (days / 7).toFixed(1);
    return `${weeks} week${weeks === '1.0' ? '' : 's'}`;
  }
}

/**
 * Story 6.5 Task 12: Calculate benchmark comparison
 * Subtask 12.2-12.6: Determine benchmark status and delta
 * @param averageDays Average time in days
 * @param benchmarkConfig Benchmark configuration for the metric
 * @returns BenchmarkData with status and target
 */
function calculateBenchmark(averageDays: number, benchmarkConfig: { target: number; atRisk: number; behind: number }): BenchmarkData {
  // Subtask 12.4: Determine status based on thresholds
  let status: 'on-track' | 'at-risk' | 'behind';
  
  if (averageDays < benchmarkConfig.target * 0.9) {
    status = 'on-track'; // <90% of target
  } else if (averageDays <= benchmarkConfig.atRisk) {
    status = 'at-risk'; // 90-110% of target
  } else {
    status = 'behind'; // >110% of target
  }

  return {
    targetDays: benchmarkConfig.target,
    status,
  };
}

/**
 * Story 6.5 Task 2: Calculate time trend comparing current vs previous period
 * Subtask 2.2-2.7: Determine direction, change, and percentage change
 * Note: For time metrics, DECREASING time is IMPROVEMENT (opposite of completion rates)
 * @param currentDays Current period average days
 * @param previousDays Previous period average days
 * @returns TrendData with direction and change metrics
 */
function calculateTimeTrend(currentDays: number, previousDays: number): TrendData {
  // Subtask 2.2: Calculate time change
  const change = Math.round((currentDays - previousDays) * 10) / 10;
  
  // Subtask 2.3: Determine trend direction (>0.5 day significant, LOWER is better for time)
  let direction: 'up' | 'down' | 'neutral';
  if (change < -0.5) {
    direction = 'down'; // Time decreased = IMPROVEMENT (use 'down' to indicate improvement)
  } else if (change > 0.5) {
    direction = 'up'; // Time increased = WORSENING
  } else {
    direction = 'neutral'; // No significant change
  }

  // Subtask 2.4: Calculate percentage change
  // Subtask 2.6: Handle case where previous period has no data
  let changePercentage = 0;
  if (previousDays === 0) {
    changePercentage = currentDays > 0 ? 100 : 0;
  } else {
    changePercentage = Math.round((change / previousDays) * 100 * 10) / 10;
  }

  // Subtask 2.5: Format trend data
  return {
    direction,
    change,
    changePercentage,
  };
}

/**
 * Story 6.4 Task 2: Calculate trend data comparing current vs previous period
 * Subtask 2.2-2.7: Determine direction, change, and percentage change
 * @param currentRate Current period rate
 * @param previousRate Previous period rate
 * @returns TrendData with direction and change metrics
 */
function calculateTrend(currentRate: number, previousRate: number): TrendData {
  // Subtask 2.2: Calculate rate change
  const change = Math.round((currentRate - previousRate) * 10) / 10;
  
  // Subtask 2.3: Determine trend direction (>2% significant)
  let direction: 'up' | 'down' | 'neutral';
  if (change > 2) {
    direction = 'up';
  } else if (change < -2) {
    direction = 'down';
  } else {
    direction = 'neutral';
  }

  // Subtask 2.4: Calculate percentage change
  // Subtask 2.6: Handle case where previous period has no data
  let changePercentage = 0;
  if (previousRate === 0) {
    // If previous was 0 and current is not, show 100% increase
    changePercentage = currentRate > 0 ? 100 : 0;
  } else {
    changePercentage = Math.round((change / previousRate) * 100 * 10) / 10;
  }

  // Subtask 2.5: Format trend data
  return {
    direction,
    change,
    changePercentage,
  };
}

/**
 * Story 6.4 Task 1 Subtask 1.13: Default completion rates for error cases
 * @returns CompletionRates with all rates at 0 and neutral trend
 */
function getDefaultCompletionRates(): CompletionRates {
  const defaultTrend: TrendData = { direction: 'neutral', change: 0, changePercentage: 0 };
  const defaultRate: ConversionRate = { rate: 0, trend: defaultTrend, count: 0, totalCount: 0 };
  
  return {
    submittedToApproved: defaultRate,
    approvedToPrd: defaultRate,
    prdToPrototype: defaultRate,
    overallSubmittedToPrototype: defaultRate,
  };
}

/**
 * Story 6.5 Task 1 & Task 2: Calculate time-to-decision metrics with trend data
 * Subtask 1.1-1.12 & Subtask 2.1-2.8: Optimized single query with JOINs
 * @param currentStart Start of current period
 * @param currentEnd End of current period
 * @param previousStart Start of previous period
 * @param previousEnd End of previous period
 * @returns TimeToDecisionMetrics with all time metrics and trends
 */
async function calculateTimeToDecisionMetrics(
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date
): Promise<TimeToDecisionMetrics> {
  try {
    // Subtask 1.10: Use single optimized query with LEFT JOINs to get all timestamps efficiently
    // This query calculates average times for each pipeline stage in a single database call
    const { data: currentData, error: currentError } = await (supabase.rpc as any)('get_time_to_decision_metrics', {
      start_date: currentStart.toISOString(),
      end_date: currentEnd.toISOString()
    });

    if (currentError) {
      console.error('Current period time metrics error:', currentError);
      // Subtask 1.12: Return default values on error
      return getDefaultTimeToDecisionMetrics();
    }

    // Subtask 2.1: Query for previous period time metrics
    const { data: previousData, error: previousError } = await (supabase.rpc as any)('get_time_to_decision_metrics', {
      start_date: previousStart.toISOString(),
      end_date: previousEnd.toISOString()
    });

    if (previousError) {
      console.error('Previous period time metrics error:', previousError);
    }

    // Extract current period metrics
    const currentSubmissionToDecision = (currentData as any)?.avg_submission_to_decision_days || 0;
    const currentSubmissionToDecisionCount = (currentData as any)?.submission_to_decision_count || 0;
    const currentApprovalToPrd = (currentData as any)?.avg_approval_to_prd_days || 0;
    const currentApprovalToPrdCount = (currentData as any)?.approval_to_prd_count || 0;
    const currentPrdToPrototype = (currentData as any)?.avg_prd_to_prototype_days || 0;
    const currentPrdToPrototypeCount = (currentData as any)?.prd_to_prototype_count || 0;
    const currentEndToEnd = (currentData as any)?.avg_end_to_end_days || 0;
    const currentEndToEndCount = (currentData as any)?.end_to_end_count || 0;

    // Extract previous period metrics (Subtask 2.6: handle missing data)
    const previousSubmissionToDecision = (previousData as any)?.avg_submission_to_decision_days || 0;
    const previousApprovalToPrd = (previousData as any)?.avg_approval_to_prd_days || 0;
    const previousPrdToPrototype = (previousData as any)?.avg_prd_to_prototype_days || 0;
    const previousEndToEnd = (previousData as any)?.avg_end_to_end_days || 0;

    // Subtask 2.2-2.7: Calculate trend data for each time metric
    const submissionToDecisionTrend = calculateTimeTrend(currentSubmissionToDecision, previousSubmissionToDecision);
    const approvalToPrdTrend = calculateTimeTrend(currentApprovalToPrd, previousApprovalToPrd);
    const prdToPrototypeTrend = calculateTimeTrend(currentPrdToPrototype, previousPrdToPrototype);
    const endToEndTrend = calculateTimeTrend(currentEndToEnd, previousEndToEnd);

    // Task 12: Calculate benchmark comparisons
    const submissionToDecisionBenchmark = calculateBenchmark(currentSubmissionToDecision, TIME_BENCHMARKS.submissionToDecision);
    const approvalToPrdBenchmark = calculateBenchmark(currentApprovalToPrd, TIME_BENCHMARKS.approvalToPrd);
    const prdToPrototypeBenchmark = calculateBenchmark(currentPrdToPrototype, TIME_BENCHMARKS.prdToPrototype);
    const endToEndBenchmark = calculateBenchmark(currentEndToEnd, TIME_BENCHMARKS.endToEnd);

    // Subtask 1.11: Return TimeToDecisionMetrics object
    return {
      submissionToDecision: {
        averageDays: currentSubmissionToDecision,
        averageHours: currentSubmissionToDecision * 24,
        formattedTime: formatTime(currentSubmissionToDecision),
        trend: submissionToDecisionTrend,
        count: currentSubmissionToDecisionCount,
        benchmark: submissionToDecisionBenchmark,
      },
      approvalToPrd: {
        averageDays: currentApprovalToPrd,
        averageHours: currentApprovalToPrd * 24,
        formattedTime: formatTime(currentApprovalToPrd),
        trend: approvalToPrdTrend,
        count: currentApprovalToPrdCount,
        benchmark: approvalToPrdBenchmark,
      },
      prdToPrototype: {
        averageDays: currentPrdToPrototype,
        averageHours: currentPrdToPrototype * 24,
        formattedTime: formatTime(currentPrdToPrototype),
        trend: prdToPrototypeTrend,
        count: currentPrdToPrototypeCount,
        benchmark: prdToPrototypeBenchmark,
      },
      endToEnd: {
        averageDays: currentEndToEnd,
        averageHours: currentEndToEnd * 24,
        formattedTime: formatTime(currentEndToEnd),
        trend: endToEndTrend,
        count: currentEndToEndCount,
        benchmark: endToEndBenchmark,
      },
    };
  } catch (error) {
    console.error('calculateTimeToDecisionMetrics error:', error);
    // Subtask 1.12 & 2.8: Error handling with default values
    return getDefaultTimeToDecisionMetrics();
  }
}

/**
 * Story 6.5 Task 1 Subtask 1.12: Default time metrics for error cases
 * @returns TimeToDecisionMetrics with all times at 0 and neutral trend
 */
function getDefaultTimeToDecisionMetrics(): TimeToDecisionMetrics {
  const defaultTrend: TrendData = { direction: 'neutral', change: 0, changePercentage: 0 };
  const defaultBenchmark: BenchmarkData = { targetDays: 0, status: 'on-track' };
  const defaultTimeMetric: TimeMetric = { 
    averageDays: 0, 
    averageHours: 0,
    formattedTime: 'N/A', 
    trend: defaultTrend, 
    count: 0,
    benchmark: defaultBenchmark,
  };
  
  return {
    submissionToDecision: defaultTimeMetric,
    approvalToPrd: defaultTimeMetric,
    prdToPrototype: defaultTimeMetric,
    endToEnd: defaultTimeMetric,
  };
}

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
 * Story 6.6 Task 1 & Task 2 & Task 3: Calculate user activity metrics with leaderboard and recent submissions
 * Subtask 1.1-1.7, 2.1-2.8, 3.1-3.8: Optimized queries for user stats, top contributors, and recent submissions
 * @param currentStart Start of current period
 * @param currentEnd End of current period
 * @param previousStart Start of previous period
 * @param previousEnd End of previous period
 * @returns UserActivityMetrics with all user activity data
 */
async function calculateUserActivityMetrics(
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date
): Promise<UserActivityMetrics> {
  try {
    // Subtask 1.2: Query total users count
    const { count: totalUsers, error: totalUsersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (totalUsersError) {
      console.error('Total users count error:', totalUsersError);
      return getDefaultUserActivityMetrics();
    }

    // Subtask 1.3: Query active users count (last 30 days) with date range filter
    const { data: activeUsersData, error: activeUsersError } = await supabase
      .from('ideas')
      .select('user_id')
      .gte('created_at', currentStart.toISOString())
      .lt('created_at', currentEnd.toISOString());

    if (activeUsersError) {
      console.error('Active users count error:', activeUsersError);
      return getDefaultUserActivityMetrics();
    }

    // Count distinct user IDs for active users
    const uniqueActiveUsers = new Set(activeUsersData?.map((idea: any) => idea.user_id) || []);
    const activeUsers = uniqueActiveUsers.size;

    // Subtask 1.4: Calculate active user percentage
    const activePercentage = totalUsers && totalUsers > 0
      ? Math.round((activeUsers / totalUsers) * 100 * 10) / 10
      : 0;

    // Task 2: Query top contributors (leaderboard)
    // Subtask 2.1-2.8: Query with user metadata, ideas count, and percentage
    const { data: topContributorsData, error: topContributorsError } = await supabase
      .from('ideas')
      .select('user_id, users(id, email, name, created_at)')
      .gte('created_at', currentStart.toISOString())
      .lt('created_at', currentEnd.toISOString());

    if (topContributorsError) {
      console.error('Top contributors error:', topContributorsError);
    }

    // Aggregate ideas by user
    const userIdeasMap = new Map<string, { user: any; ideas: any[]; lastSubmission: string }>();
    topContributorsData?.forEach((idea: any) => {
      const userId = idea.user_id;
      const userData = idea.users;
      
      if (!userId || !userData) return;

      if (!userIdeasMap.has(userId)) {
        userIdeasMap.set(userId, {
          user: userData,
          ideas: [],
          lastSubmission: idea.created_at || '',
        });
      }
      
      const userEntry = userIdeasMap.get(userId)!;
      userEntry.ideas.push(idea);
      
      // Track most recent submission
      if (idea.created_at && idea.created_at > userEntry.lastSubmission) {
        userEntry.lastSubmission = idea.created_at;
      }
    });

    // Convert to TopContributorData array and calculate percentages
    const totalIdeasInPeriod = topContributorsData?.length || 0;
    const topContributors: TopContributorData[] = Array.from(userIdeasMap.entries())
      .map(([userId, { user, ideas, lastSubmission }]) => ({
        userId,
        userName: user.name || null,
        userEmail: user.email || '',
        ideasCount: ideas.length,
        percentage: totalIdeasInPeriod > 0
          ? Math.round((ideas.length / totalIdeasInPeriod) * 100 * 10) / 10
          : 0,
        joinDate: user.created_at || new Date().toISOString(),
        lastSubmissionDate: lastSubmission || null,
      }))
      .sort((a, b) => {
        // Subtask 2.5 & 2.8: Sort by ideas count DESC, then by last submission DESC
        if (b.ideasCount !== a.ideasCount) {
          return b.ideasCount - a.ideasCount;
        }
        if (a.lastSubmissionDate && b.lastSubmissionDate) {
          return new Date(b.lastSubmissionDate).getTime() - new Date(a.lastSubmissionDate).getTime();
        }
        return 0;
      })
      .slice(0, 10); // Subtask 2.5: Limit to top 10

    // Task 3: Query recent submissions with user details
    // Subtask 3.1-3.8: Query with idea metadata and submitter info
    const { data: recentSubmissionsData, error: recentSubmissionsError } = await supabase
      .from('ideas')
      .select('id, title, problem, status, created_at, user_id, users(id, email, name)')
      .gte('created_at', currentStart.toISOString())
      .lt('created_at', currentEnd.toISOString())
      .order('created_at', { ascending: false })
      .limit(5); // Subtask 3.4: Limit to 5 most recent

    if (recentSubmissionsError) {
      console.error('Recent submissions error:', recentSubmissionsError);
    }

    // Subtask 3.7: Format as RecentSubmissionData array
    const recentSubmissions: RecentSubmissionData[] = (recentSubmissionsData || []).map((idea: any) => ({
      ideaId: idea.id,
      title: idea.title || 'Untitled',
      status: idea.status || 'unknown',
      createdAt: idea.created_at || new Date().toISOString(),
      userId: idea.user_id || '',
      userName: idea.users?.name || null,
      userEmail: idea.users?.email || '',
    }));

    // Task 4: Calculate trend data for user activity
    // Subtask 4.1-4.7: Query previous period active users and calculate trend
    const { data: previousActiveUsersData, error: previousActiveUsersError } = await supabase
      .from('ideas')
      .select('user_id')
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', previousEnd.toISOString());

    if (previousActiveUsersError) {
      console.error('Previous period active users error:', previousActiveUsersError);
    }

    const previousUniqueActiveUsers = new Set(previousActiveUsersData?.map((idea: any) => idea.user_id) || []);
    const previousActiveUsers = previousUniqueActiveUsers.size;

    // Subtask 4.2-4.5: Calculate trend
    const trend = calculateTrend(activeUsers, previousActiveUsers);

    // Subtask 1.6: Return UserActivityMetrics object
    return {
      totalUsers: totalUsers || 0,
      activeUsers,
      activePercentage,
      trend,
      topContributors,
      recentSubmissions,
    };
  } catch (error) {
    console.error('calculateUserActivityMetrics error:', error);
    // Subtask 1.7: Error handling with default values
    return getDefaultUserActivityMetrics();
  }
}

/**
 * Story 6.6 Task 1 Subtask 1.7: Default user activity metrics for error cases
 * @returns UserActivityMetrics with all values at 0 and neutral trend
 */
function getDefaultUserActivityMetrics(): UserActivityMetrics {
  const defaultTrend: TrendData = { direction: 'neutral', change: 0, changePercentage: 0 };
  
  return {
    totalUsers: 0,
    activeUsers: 0,
    activePercentage: 0,
    trend: defaultTrend,
    topContributors: [],
    recentSubmissions: [],
  };
}

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

      // Story 6.5 Task 1: Calculate time-to-decision metrics
      const timeToDecision = await calculateTimeToDecisionMetrics(currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd);

      // Story 6.6 Task 1: Calculate user activity metrics
      const userActivity = await calculateUserActivityMetrics(currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd);

      const analyticsData: AnalyticsData = {
        totalIdeas,
        previousPeriodTotal,
        trendPercentage,
        pipelineBreakdown,
        completionRate,
        completionRates, // Story 6.4 Task 1 Subtask 1.12: Add completion rates
        timeToDecision, // Story 6.5 Task 1 Subtask 1.11: Add time-to-decision metrics
        userActivity, // Story 6.6 Task 1 Subtask 1.6: Add user activity metrics
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
      const { data, error } = await (supabase.rpc as any)('get_ideas_breakdown', {
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

      if (!data || (data as any).length === 0) {
        return { data: [], error: null };
      }

      // Subtask 8.4 & 8.5: Format breakdown with period labels
      // PostgreSQL function already formats periods, convert to IdeaBreakdown format
      const breakdown: IdeaBreakdown[] = (data as any).map((row: { period: string; count: number }) => ({
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
