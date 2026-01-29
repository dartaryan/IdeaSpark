// src/features/admin/analytics/types.ts
// Task 7: Define TypeScript types for analytics data

/**
 * Subtask 7.2: Define AnalyticsData interface with all metric fields
 * Contains all metrics displayed on the analytics dashboard
 * 
 * Updated in Story 6.2:
 * - Subtask 2.2: Added previousPeriodTotal for trend comparison
 * - Subtask 2.3: Added trendPercentage for trend calculation
 * - Subtask 2.4: Added lastUpdated ISO timestamp
 * 
 * Updated in Story 6.3 Task 2:
 * - Subtask 2.2: Changed pipelineBreakdown to PipelineStageData[] for enhanced functionality
 * 
 * Updated in Story 6.4 Task 3:
 * - Subtask 3.2: Added completionRates for conversion rate metrics
 * 
 * Updated in Story 6.5 Task 3:
 * - Subtask 3.2: Added timeToDecision for time-to-decision metrics
 */
export interface AnalyticsData {
  totalIdeas: number;
  previousPeriodTotal: number; // Subtask 2.3: Previous period count for trend
  trendPercentage: number; // Subtask 2.4: Can be negative, positive, or zero
  pipelineBreakdown: PipelineStageData[]; // Story 6.3 Subtask 2.2: Enhanced pipeline breakdown
  completionRate: number;
  completionRates?: CompletionRates; // Story 6.4 Task 3 Subtask 3.2: Conversion rate metrics
  timeToDecision?: TimeToDecisionMetrics; // Story 6.5 Task 3 Subtask 3.2: Time-to-decision metrics
  timeMetrics: TimeMetrics;
  timestamp: string;
  lastUpdated: string; // Subtask 2.5: ISO timestamp
}

/**
 * Subtask 7.3: Define MetricCard interface
 * Represents a single metric card on the dashboard
 */
export interface MetricCard {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
}

/**
 * Story 6.3 Task 2: Enhanced PipelineBreakdown types
 * Subtask 2.4: Define PipelineStatus type - valid pipeline stage values
 */
export type PipelineStatus = 'submitted' | 'approved' | 'prd_development' | 'prototype_complete' | 'rejected';

/**
 * Story 6.3 Task 2: Enhanced pipeline stage data structure
 * Subtask 2.3: Define PipelineStageData interface with all required fields
 * Subtask 2.5: All numeric fields typed as number
 * Subtask 2.6: Color field typed as string (hex color codes)
 */
export interface PipelineStageData {
  status: PipelineStatus; // Raw status value from database
  label: string; // Human-readable display label
  count: number; // Number of ideas in this stage
  percentage: number; // Percentage of total ideas (0-100)
  color: string; // Hex color code for visualization
}

/**
 * Subtask 7.4: Define PipelineBreakdown interface (legacy, kept for compatibility)
 * Represents the distribution of ideas across pipeline stages
 * @deprecated Use PipelineStageData instead for enhanced functionality
 */
export interface PipelineBreakdown {
  status: string;
  count: number;
  percentage: number;
}

/**
 * Subtask 7.5: Define TimeMetrics interface
 * Average time metrics for idea progression through pipeline
 */
export interface TimeMetrics {
  avgTimeToApproval: number; // in days
  avgTimeToPRD: number; // in days
  avgTimeToPrototype: number; // in days
}

/**
 * Story 6.2: Date range filter types
 */
export interface DateRange {
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
}

/**
 * Story 6.2: Idea breakdown by time period
 * Subtask 8.4: Define breakdown data structure
 */
export interface IdeaBreakdown {
  period: string; // Formatted period label (e.g., "Week of Jan 1", "Jan 2026")
  count: number; // Number of ideas in that period
}

/**
 * Story 6.4 Task 3: Completion Rates Types
 * Subtask 3.5: Define TrendData interface for trend indicators
 */
export interface TrendData {
  direction: 'up' | 'down' | 'neutral'; // Trend direction
  change: number; // Absolute change in rate (percentage points)
  changePercentage: number; // Relative change percentage
}

/**
 * Story 6.4 Task 3: Completion Rates Types
 * Subtask 3.4: Define ConversionRate interface for individual conversion metrics
 */
export interface ConversionRate {
  rate: number; // Conversion rate percentage (0-100)
  trend: TrendData; // Trend comparison vs previous period
  count: number; // Number of ideas that converted
  totalCount: number; // Total number of ideas in denominator
}

/**
 * Story 6.4 Task 3: Completion Rates Types
 * Subtask 3.3: Define CompletionRates interface for all conversion metrics
 */
export interface CompletionRates {
  submittedToApproved: ConversionRate; // Submitted → Approved conversion
  approvedToPrd: ConversionRate; // Approved → PRD Complete conversion
  prdToPrototype: ConversionRate; // PRD Complete → Prototype conversion
  overallSubmittedToPrototype: ConversionRate; // Overall end-to-end conversion
}

/**
 * Story 6.5 Task 3: Time-to-Decision Metrics Types
 * Subtask 3.6: Define BenchmarkData interface
 */
export interface BenchmarkData {
  targetDays: number; // Target time in days
  status: 'on-track' | 'at-risk' | 'behind'; // Benchmark comparison status
}

/**
 * Story 6.5 Task 3: Time-to-Decision Metrics Types
 * Subtask 3.5: Define TrendData interface for time metrics (reusing existing TrendData)
 * Note: For time metrics, 'down' direction means improvement (shorter time is better)
 */

/**
 * Story 6.5 Task 3: Time-to-Decision Metrics Types
 * Subtask 3.4: Define TimeMetric interface
 */
export interface TimeMetric {
  averageDays: number; // Average time in days
  averageHours: number; // Average time in hours (for display formatting)
  formattedTime: string; // Human-readable time (e.g., "2.5 days" or "18 hours")
  trend: TrendData; // Trend comparison vs previous period
  count: number; // Number of ideas in sample
  benchmark: BenchmarkData; // Benchmark comparison data
}

/**
 * Story 6.5 Task 3: Time-to-Decision Metrics Types
 * Subtask 3.3: Define TimeToDecisionMetrics interface
 */
export interface TimeToDecisionMetrics {
  submissionToDecision: TimeMetric; // Time from submission to approval/rejection
  approvalToPrd: TimeMetric; // Time from approval to PRD completion
  prdToPrototype: TimeMetric; // Time from PRD completion to prototype
  endToEnd: TimeMetric; // Total time from idea to prototype
}
