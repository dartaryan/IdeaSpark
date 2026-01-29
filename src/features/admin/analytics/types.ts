// src/features/admin/analytics/types.ts
// Task 7: Define TypeScript types for analytics data

/**
 * Subtask 7.2: Define AnalyticsData interface with all metric fields
 * Contains all metrics displayed on the analytics dashboard
 */
export interface AnalyticsData {
  totalIdeas: number;
  pipelineBreakdown: PipelineBreakdown[];
  completionRate: number;
  timeMetrics: TimeMetrics;
  timestamp: string;
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
 * Subtask 7.4: Define PipelineBreakdown interface
 * Represents the distribution of ideas across pipeline stages
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
