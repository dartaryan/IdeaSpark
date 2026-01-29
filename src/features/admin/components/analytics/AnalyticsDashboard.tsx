// src/features/admin/components/analytics/AnalyticsDashboard.tsx
// Task 1: Create AnalyticsDashboard component with layout structure
// Story 6.1 - Analytics Dashboard Layout

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';
import { MetricsCards } from './MetricsCards';
import { SubmissionChart } from './SubmissionChart';
import { CompletionRateChart } from './CompletionRateChart';
import { PipelineBreakdownChart } from './PipelineBreakdownChart';
import { DateRangeFilter } from './DateRangeFilter';
import { IdeaBreakdownModal } from './IdeaBreakdownModal';
import { CompletionRatesCard } from './CompletionRatesCard';
import { TimeToDecisionCard } from './TimeToDecisionCard';
import { analyticsService } from '../../services/analyticsService';
import { formatDistanceToNow } from 'date-fns';
import type { DateRange, IdeaBreakdown } from '../../analytics/types';

/**
 * AnalyticsDashboard component - displays innovation metrics and charts
 * 
 * Features:
 * - Subtask 1.2: Responsive grid layout with 4 metric cards at top
 * - Subtask 1.3: Chart section below metric cards (2-column grid on desktop)
 * - Subtask 1.4: DaisyUI card components with PassportCard styling (20px border radius)
 * - Subtask 1.5: Page header with title "Innovation Analytics" and subtitle
 * - Subtask 1.6: Breadcrumb navigation: Admin Dashboard → Analytics
 * - Subtask 1.7: Consistent spacing using DSM tokens (p-6, gap-6)
 * - Subtask 1.8: Responsive layout (mobile-first, tablet breakpoint at 768px, desktop at 1024px)
 * 
 * Story 6.2 Task 6: Integrated date range filtering
 */
export function AnalyticsDashboard() {
  // Subtask 6.3: Manage dateRange state
  // Subtask 6.8: Reset filter when navigating away (don't persist across sessions)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Task 7: Manage breakdown modal state
  // Task 14: Add error state for breakdown
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState<IdeaBreakdown[]>([]);
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  // Task 5: useAnalytics hook for data fetching
  // Subtask 6.4: Pass dateRange to useAnalytics hook
  const { data: analytics, isLoading, error, refetch, dataUpdatedAt } = useAnalytics(dateRange);

  // Task 7: Fetch breakdown data when modal opens
  // Task 14: Enhanced error handling with specific messages
  useEffect(() => {
    if (isBreakdownOpen) {
      setIsBreakdownLoading(true);
      setBreakdownError(null);
      analyticsService.getIdeasBreakdown(dateRange)
        .then((result) => {
          if (result.data) {
            setBreakdownData(result.data);
            setBreakdownError(null);
          } else {
            console.error('Failed to fetch breakdown:', result.error);
            setBreakdownData([]);
            setBreakdownError(result.error?.message || 'Failed to load breakdown data');
          }
        })
        .catch((err) => {
          console.error('Breakdown fetch error:', err);
          setBreakdownData([]);
          setBreakdownError('An unexpected error occurred while loading breakdown data');
        })
        .finally(() => {
          setIsBreakdownLoading(false);
        });
    }
  }, [isBreakdownOpen, dateRange]);

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

  // Calculate last updated time for timestamp display (Task 4)
  const lastUpdated = dataUpdatedAt ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true }) : 'Never';

  // Subtask 6.6: Format timestamp text to show filtered period
  const getFilterDescription = () => {
    if (!dateRange) return 'All time';
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    
    // Format dates
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  };

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

        {/* Story 6.2 Task 6: Date filter and refresh controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Subtask 6.1 & 6.2: Add DateRangeFilter component to dashboard header (top-right) */}
          <DateRangeFilter
            onFilterChange={setDateRange}
            currentRange={dateRange}
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

      {/* Subtask 6.6: Display filtered period information */}
      <div className="mb-4 text-sm" style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}>
        <span className="font-medium">Showing data for:</span> {getFilterDescription()}
        <span className="ml-3">• Last updated: {lastUpdated}</span>
      </div>

      {/* Subtask 1.2: Responsive grid layout with 4 metric cards at top */}
      {/* Subtask 1.7: Apply consistent spacing using DSM tokens (p-6, gap-6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Task 2: MetricsCards component for key statistics */}
        {/* Task 7: Add onClick handler for Total Ideas card */}
        <MetricsCards 
          analytics={analytics} 
          onTotalIdeasClick={() => setIsBreakdownOpen(true)}
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
            />
          </div>
        )}

        {/* Task 3: Placeholder chart components */}
        <SubmissionChart />
        <CompletionRateChart />
      </div>

      {/* Task 7 & 9: Ideas Breakdown Modal */}
      {/* Task 14: Pass error and retry handler */}
      <IdeaBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        breakdown={breakdownData}
        isLoading={isBreakdownLoading}
        dateRange={dateRange}
        error={breakdownError}
        onRetry={() => {
          // Re-trigger the breakdown fetch by toggling the modal state
          setIsBreakdownOpen(false);
          setTimeout(() => setIsBreakdownOpen(true), 100);
        }}
      />
    </div>
  );
}
