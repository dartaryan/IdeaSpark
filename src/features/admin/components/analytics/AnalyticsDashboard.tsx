// src/features/admin/components/analytics/AnalyticsDashboard.tsx
// Task 1: Create AnalyticsDashboard component with layout structure
// Story 6.1 - Analytics Dashboard Layout

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useChartBreakdown } from '../../hooks/useChartBreakdown'; // Code Review Fix: Use React Query hook
import { useDateRange } from '../../hooks/useDateRange'; // Story 6.7 Task 7: Use useDateRange hook
import { MetricsCards } from './MetricsCards';
import { SubmissionChart } from './SubmissionChart';
import { CompletionRateChart } from './CompletionRateChart';
import { PipelineBreakdownChart } from './PipelineBreakdownChart';
import { DateRangeFilter } from './DateRangeFilter';
import { DateRangeInfo } from './DateRangeInfo'; // Story 6.7 Task 10
import { IdeaBreakdownModal } from './IdeaBreakdownModal';
import { DrillDownModal } from './DrillDownModal'; // Story 0.6 Task 4
import type { DrillDownColumn } from './DrillDownModal'; // Story 0.6 Task 4
import { CompletionRatesCard } from './CompletionRatesCard';
import { TimeToDecisionCard } from './TimeToDecisionCard';
import { UserActivityCard } from './UserActivityCard';
import { analyticsService } from '../../services/analyticsService'; // Story 0.6 Task 4
import { formatDistanceToNow } from 'date-fns';
import type { IdeaBreakdown, TimeToDecisionDrillDown, CompletionRateDrillDown } from '../../analytics/types';

/**
 * AnalyticsDashboard component - displays innovation metrics and charts
 * 
 * Story 6.7 Task 7: Integrated DateRangeFilter with useDateRange hook
 * - Subtask 7.1: Import DateRangeFilter and useDateRange
 * - Subtask 7.2: Use useDateRange hook to manage date range state
 * - Subtask 7.3: Position DateRangeFilter at top of dashboard
 * - Subtask 7.4: Pass currentRange and onDateRangeChange to DateRangeFilter
 * - Subtask 7.5: Pass currentRange to useAnalytics hook
 * - Subtask 7.6: Show loading state on all cards while refetching
 * - Subtask 7.7: Add data refresh timestamp display
 * - Subtask 7.8: Ensure filter is sticky (stays visible when scrolling)
 */
export function AnalyticsDashboard() {
  // Story 6.7 Task 7 Subtask 7.2: Use useDateRange hook to manage date range state
  const { currentRange, setCustomRange } = useDateRange('last30days');

  // Task 7: Manage breakdown modal state
  // Task 14: Add error state for breakdown
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState<IdeaBreakdown[]>([]);
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  // Story 0.6 Task 4: Time-to-Decision drill-down modal state
  const [isTimeToDecisionModalOpen, setIsTimeToDecisionModalOpen] = useState(false);
  const [timeToDecisionDrillDown, setTimeToDecisionDrillDown] = useState<TimeToDecisionDrillDown[]>([]);
  const [isTimeToDecisionDrillDownLoading, setIsTimeToDecisionDrillDownLoading] = useState(false);
  const [timeToDecisionDrillDownError, setTimeToDecisionDrillDownError] = useState<string | null>(null);

  // Story 0.6 Task 5: Completion Rate drill-down modal state
  const [isCompletionRateModalOpen, setIsCompletionRateModalOpen] = useState(false);
  const [completionRateDrillDown, setCompletionRateDrillDown] = useState<CompletionRateDrillDown[]>([]);
  const [isCompletionRateDrillDownLoading, setIsCompletionRateDrillDownLoading] = useState(false);
  const [completionRateDrillDownError, setCompletionRateDrillDownError] = useState<string | null>(null);

  // Story 6.7 Task 7 Subtask 7.5: Pass currentRange to useAnalytics hook
  const { data: analytics, isLoading, error, refetch, dataUpdatedAt } = useAnalytics(currentRange);

  // Code Review Fix: Use React Query hook for chart breakdown data (consistent with architecture)
  const {
    data: chartBreakdownData = [],
    isLoading: isChartBreakdownLoading,
    error: chartBreakdownError,
    refetch: refetchChartBreakdown
  } = useChartBreakdown(currentRange);

  // Code Review Fix: Reuse chart data from React Query hook for modal
  useEffect(() => {
    if (isBreakdownOpen) {
      setBreakdownData(chartBreakdownData);
      setIsBreakdownLoading(isChartBreakdownLoading);
      setBreakdownError(chartBreakdownError?.message || null);
    }
  }, [isBreakdownOpen, chartBreakdownData, isChartBreakdownLoading, chartBreakdownError]);

  // Story 0.6 Task 4: Fetch time-to-decision drill-down data when modal opens
  const fetchTimeToDecisionDrillDown = useCallback(async () => {
    setIsTimeToDecisionDrillDownLoading(true);
    setTimeToDecisionDrillDownError(null);
    try {
      const result = await analyticsService.getTimeToDecisionDrillDown(currentRange);
      if (result.error) {
        setTimeToDecisionDrillDownError(result.error.message);
      } else {
        setTimeToDecisionDrillDown(result.data || []);
      }
    } catch {
      setTimeToDecisionDrillDownError('An unexpected error occurred');
    } finally {
      setIsTimeToDecisionDrillDownLoading(false);
    }
  }, [currentRange]);

  // Story 0.6 Task 5: Fetch completion rate drill-down data when modal opens
  const fetchCompletionRateDrillDown = useCallback(async () => {
    setIsCompletionRateDrillDownLoading(true);
    setCompletionRateDrillDownError(null);
    try {
      const result = await analyticsService.getCompletionRateDrillDown(currentRange);
      if (result.error) {
        setCompletionRateDrillDownError(result.error.message);
      } else {
        setCompletionRateDrillDown(result.data || []);
      }
    } catch {
      setCompletionRateDrillDownError('An unexpected error occurred');
    } finally {
      setIsCompletionRateDrillDownLoading(false);
    }
  }, [currentRange]);

  // Story 0.6 Task 4: Trigger fetch when time-to-decision modal opens
  useEffect(() => {
    if (isTimeToDecisionModalOpen) {
      fetchTimeToDecisionDrillDown();
    }
  }, [isTimeToDecisionModalOpen, fetchTimeToDecisionDrillDown]);

  // Story 0.6 Task 5: Trigger fetch when completion rate modal opens
  useEffect(() => {
    if (isCompletionRateModalOpen) {
      fetchCompletionRateDrillDown();
    }
  }, [isCompletionRateModalOpen, fetchCompletionRateDrillDown]);

  // Task 10: Loading state with skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]" role="status">
          <span className="loading loading-spinner loading-lg" style={{ color: '#E10514' }}></span>
        </div>
      </div>
    );
  }

  // Task 11: Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Failed to load analytics. Please try again later.</span>
          <button className="btn btn-sm" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Story 6.7 Task 7 Subtask 7.7: Calculate last updated time for timestamp display
  const lastUpdated = dataUpdatedAt ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true }) : 'Never';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Subtask 1.6: Breadcrumb navigation */}
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li>
            <Link to="/admin" style={{ fontFamily: 'Rubik, sans-serif' }}>
              Admin Dashboard
            </Link>
          </li>
          <li style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}>
            Analytics
          </li>
        </ul>
      </div>

      {/* Subtask 1.5: Page header with title and subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 
            className="text-3xl font-bold mb-2" 
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Innovation Analytics
          </h1>
          <p 
            className="text-base" 
            style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
          >
            Measure and report on innovation program performance
          </p>
        </div>

        {/* Story 6.7 Task 7: Date filter and refresh controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Story 6.7 Task 7 Subtask 7.3-7.4: Add DateRangeFilter component to dashboard header */}
          <DateRangeFilter
            currentRange={currentRange}
            onDateRangeChange={(range) => {
              // If preset was clicked, setPreset is handled inside DateRangeFilter
              // If custom range, it's passed here
              setCustomRange(range);
            }}
          />

          {/* Task 4: Data refresh timestamp and refresh button */}
          <button
            onClick={() => refetch()}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Refresh analytics data"
            title="Refresh analytics data"
          >
            <ArrowPathIcon className="w-5 h-5" style={{ color: '#525355' }} />
          </button>
        </div>
      </div>

      {/* Story 6.7 Task 10: DateRangeInfo banner - positioned below filter, above cards */}
      <div className="mb-6">
        <DateRangeInfo 
          dateRange={currentRange} 
          totalIdeas={analytics?.totalIdeas || 0}
        />
      </div>

      {/* Story 6.7 Task 7: Compact timestamp display */}
      <div className="mb-4 text-sm text-right" style={{ fontFamily: 'Rubik, sans-serif', color: '#9CA3AF' }}>
        Last updated: {lastUpdated}
      </div>

      {/* Subtask 1.2: Responsive grid layout with 4 metric cards at top */}
      {/* Subtask 1.7: Apply consistent spacing using DSM tokens (p-6, gap-6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Task 2: MetricsCards component for key statistics */}
        {/* Story 6.7 Task 8: Pass dateRange to MetricsCards */}
        <MetricsCards 
          analytics={analytics} 
          onTotalIdeasClick={() => setIsBreakdownOpen(true)}
          dateRange={currentRange}
        />
      </div>

      {/* Subtask 1.3: Chart section below metric cards (2-column grid on desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Story 6.3 Task 7: Pipeline Breakdown Chart */}
        {/* Subtask 7.4: Wrap chart in DaisyUI card component with 20px border radius */}
        <div 
          className="card bg-base-100 shadow-sm"
          style={{ borderRadius: '20px', border: '1px solid #E5E7EB' }}
        >
          <div className="card-body p-6">
            {/* Subtask 7.3: Pass pipelineBreakdown data from useAnalytics hook */}
            {/* Subtask 7.6: Chart respects current date range filter */}
            {/* Subtask 7.7: Show loading skeleton while analytics data loads */}
            <PipelineBreakdownChart 
              data={analytics?.pipelineBreakdown || []}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Story 6.4 Task 8: Completion Rates Card */}
        {/* Subtask 8.2: Position card in dashboard layout (after pipeline breakdown chart) */}
        {/* Subtask 8.4: Full width on mobile, 50% on desktop */}
        {analytics?.completionRates && (
          <div className="lg:col-span-2">
            {/* Subtask 8.3: Pass completionRates data from useAnalytics hook */}
            {/* Subtask 8.5: Card respects current date range filter */}
            {/* Subtask 8.6: Show loading skeleton while analytics data loads */}
            <CompletionRatesCard 
              data={analytics.completionRates}
              isLoading={isLoading}
              onMetricClick={() => setIsCompletionRateModalOpen(true)}
            />
          </div>
        )}

        {/* Story 6.5 Task 9: Time-to-Decision Metrics Card */}
        {/* Subtask 9.2: Position card in dashboard layout (after completion rates card) */}
        {/* Subtask 9.4: Full width on mobile, 50% on desktop */}
        {analytics?.timeToDecision && (
          <div className="lg:col-span-2">
            {/* Subtask 9.3: Pass timeToDecision data from useAnalytics hook */}
            {/* Subtask 9.5: Card respects current date range filter */}
            {/* Subtask 9.6: Show loading skeleton while analytics data loads */}
            {/* Subtask 9.8: Ensure consistent spacing with other dashboard cards */}
            <TimeToDecisionCard 
              data={analytics.timeToDecision}
              isLoading={isLoading}
              onDrillDown={() => setIsTimeToDecisionModalOpen(true)}
            />
          </div>
        )}

        {/* Story 6.6 Task 10: User Activity Card */}
        {/* Subtask 10.2: Position card in dashboard layout (after time metrics card) */}
        {/* Subtask 10.4: Wrap card in responsive grid layout */}
        <div className="lg:col-span-2">
          {/* Subtask 10.3: Pass userActivity data from useAnalytics hook */}
          {/* Subtask 10.5: Card respects current date range filter */}
          {/* Subtask 10.6: Show loading skeleton while analytics data loads */}
          {/* Subtask 10.8: Ensure consistent spacing with other dashboard cards */}
          <UserActivityCard 
            data={analytics?.userActivity}
            isLoading={isLoading}
          />
        </div>

        {/* Story 0.5 Task 3: Chart components with data props */}
        {/* Code Review Fix: Added error handling UI for chart data */}
        {chartBreakdownError ? (
          <div className="lg:col-span-2">
            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Failed to load chart data. {chartBreakdownError.message}</span>
              <button className="btn btn-sm" onClick={() => refetchChartBreakdown()}>
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Subtask 3.1 & 3.4: Pass data and isLoading to SubmissionChart */}
            {/* Code Review Fix: Using consistent loading states */}
            <SubmissionChart
              data={chartBreakdownData}
              isLoading={isChartBreakdownLoading}
            />
            {/* Subtask 3.3 & 3.4: Pass pipelineBreakdown data and isLoading to CompletionRateChart */}
            <CompletionRateChart
              data={analytics?.pipelineBreakdown || []}
              isLoading={isLoading}
            />
          </>
        )}
      </div>

      {/* Task 7 & 9: Ideas Breakdown Modal */}
      {/* Story 6.7 Task 7: Updated to use new DateRange type */}
      <IdeaBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        breakdown={breakdownData}
        isLoading={isBreakdownLoading}
        dateRange={currentRange}
        error={breakdownError}
        onRetry={() => {
          // Re-trigger the breakdown fetch by toggling the modal state
          setIsBreakdownOpen(false);
          setTimeout(() => setIsBreakdownOpen(true), 100);
        }}
      />

      {/* Story 0.6 Task 4: Time-to-Decision Drill-Down Modal */}
      <DrillDownModal<TimeToDecisionDrillDown>
        isOpen={isTimeToDecisionModalOpen}
        onClose={() => setIsTimeToDecisionModalOpen(false)}
        title="Time-to-Decision Details"
        data={timeToDecisionDrillDown}
        isLoading={isTimeToDecisionDrillDownLoading}
        error={timeToDecisionDrillDownError}
        onRetry={fetchTimeToDecisionDrillDown}
        columns={timeToDecisionColumns}
      />

      {/* Story 0.6 Task 5: Completion Rate Drill-Down Modal */}
      <DrillDownModal<CompletionRateDrillDown>
        isOpen={isCompletionRateModalOpen}
        onClose={() => setIsCompletionRateModalOpen(false)}
        title="Completion Rate Details"
        data={completionRateDrillDown}
        isLoading={isCompletionRateDrillDownLoading}
        error={completionRateDrillDownError}
        onRetry={fetchCompletionRateDrillDown}
        columns={completionRateColumns}
      />
    </div>
  );
}

// Story 0.6 Task 4: Column definitions for Time-to-Decision drill-down
const timeToDecisionColumns: DrillDownColumn<TimeToDecisionDrillDown>[] = [
  { key: 'title', label: 'Idea Title' },
  { key: 'statusLabel', label: 'Status' },
  {
    key: 'submittedAt',
    label: 'Submitted',
    render: (value) => value ? new Date(value as string).toLocaleDateString() : '-',
  },
  {
    key: 'approvedAt',
    label: 'Approved',
    render: (value) => value ? new Date(value as string).toLocaleDateString() : '-',
  },
  {
    key: 'prdCompletedAt',
    label: 'PRD Complete',
    render: (value) => value ? new Date(value as string).toLocaleDateString() : '-',
  },
  {
    key: 'totalDays',
    label: 'Total Days',
    render: (value) => {
      const days = value as number;
      if (days === 0) return '-';
      return `${days.toFixed(1)}d`;
    },
  },
];

// Story 0.6 Task 5: Column definitions for Completion Rate drill-down
const completionRateColumns: DrillDownColumn<CompletionRateDrillDown>[] = [
  { key: 'title', label: 'Idea Title' },
  { key: 'statusLabel', label: 'Status' },
  {
    key: 'stagesCompleted',
    label: 'Stages',
    render: (value, row) => `${value}/${row.totalStages}`,
  },
  {
    key: 'completionPercentage',
    label: 'Completion',
    render: (value) => {
      const pct = value as number;
      return (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-base-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${pct}%`,
                backgroundColor: pct === 100 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#E10514',
              }}
            />
          </div>
          <span className="text-sm">{pct}%</span>
        </div>
      );
    },
  },
  {
    key: 'submittedAt',
    label: 'Submitted',
    render: (value) => value ? new Date(value as string).toLocaleDateString() : '-',
  },
];
