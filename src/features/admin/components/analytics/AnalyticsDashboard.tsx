// src/features/admin/components/analytics/AnalyticsDashboard.tsx
// Task 1: Create AnalyticsDashboard component with layout structure
// Story 6.1 - Analytics Dashboard Layout

import { Link } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';
import { MetricsCards } from './MetricsCards';
import { SubmissionChart } from './SubmissionChart';
import { CompletionRateChart } from './CompletionRateChart';
import { formatDistanceToNow } from 'date-fns';

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
 */
export function AnalyticsDashboard() {
  // Task 5: useAnalytics hook for data fetching
  const { data: analytics, isLoading, error, refetch, dataUpdatedAt } = useAnalytics();

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
      <div className="flex items-center justify-between mb-6">
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

        {/* Task 4: Data refresh timestamp and refresh button */}
        <div className="flex items-center gap-3">
          <div className="text-sm" style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}>
            <span>Last updated: {lastUpdated}</span>
          </div>
          {/* Subtask 4.4: Add refresh button */}
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

      {/* Subtask 1.2: Responsive grid layout with 4 metric cards at top */}
      {/* Subtask 1.7: Apply consistent spacing using DSM tokens (p-6, gap-6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Task 2: MetricsCards component for key statistics */}
        <MetricsCards analytics={analytics} />
      </div>

      {/* Subtask 1.3: Chart section below metric cards (2-column grid on desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task 3: Placeholder chart components */}
        <SubmissionChart />
        <CompletionRateChart />
      </div>
    </div>
  );
}
