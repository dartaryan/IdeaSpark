// src/features/admin/components/AdminDashboard.tsx
// Task 2: Admin Dashboard page component with layout structure
// Story 5.8 - Task 2: Integrate realtime updates into AdminDashboard

import { Link } from 'react-router-dom';
import { useAdminMetrics } from '../hooks/useAdminMetrics';
import { useRealtimeIdeas } from '../hooks/useRealtimeIdeas';
import { MetricCard } from './MetricCard';
import { RecentSubmissions } from './RecentSubmissions';
import { RealtimeIndicator } from './RealtimeIndicator';
import { ROUTES } from '../../../routes/routeConstants';

/**
 * Admin Dashboard component - main admin page showing pipeline metrics
 * 
 * Features:
 * - Displays metric cards for each pipeline stage
 * - Responsive grid layout (4 columns desktop, 2 columns tablet, 1 column mobile)
 * - Loading and error states
 * - Real-time metrics with live updates (<500ms latency)
 * - Story 5.8: Real-time dashboard updates via Supabase Realtime
 */
export function AdminDashboard() {
  const { data: metrics, isLoading, error } = useAdminMetrics();
  
  // Story 5.8 - Task 2: Enable realtime subscription when dashboard is mounted
  const { isConnected, error: realtimeError } = useRealtimeIdeas();

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]" role="status">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Admin Dashboard
        </h1>
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
          <span>Failed to load metrics. Please try again later.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header with Realtime Indicator - Story 5.8 Task 7 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Admin Dashboard
        </h1>
        {/* Story 5.8 - Task 7: Visual feedback for realtime connection */}
        <RealtimeIndicator isConnected={isConnected} error={realtimeError} />
      </div>

      {/* Quick Navigation Links */}
      <div className="flex gap-3 mb-8">
        <Link
          to={ROUTES.ADMIN_IDEAS}
          className="btn btn-outline btn-sm"
        >
          All Ideas
        </Link>
        <Link
          to={ROUTES.ADMIN_PIPELINE}
          className="btn btn-outline btn-sm"
        >
          Pipeline View
        </Link>
        <Link
          to="/admin/users"
          className="btn btn-outline btn-sm"
        >
          Users
        </Link>
      </div>

      {/* Metric Cards Grid - Task 3: Using MetricCard component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Submitted"
          count={metrics?.submitted ?? 0}
          description="New ideas awaiting review"
          color="gray"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#525355"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          }
        />

        <MetricCard
          title="Approved"
          count={metrics?.approved ?? 0}
          description="Approved for development"
          color="blue"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#525355"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        <MetricCard
          title="PRD Development"
          count={metrics?.prd_development ?? 0}
          description="PRDs in progress"
          color="yellow"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#525355"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          }
        />

        <MetricCard
          title="Prototype Complete"
          count={metrics?.prototype_complete ?? 0}
          description="Completed prototypes"
          color="green"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#525355"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          }
        />
      </div>

      {/* Recent Submissions - Task 6 */}
      <div className="mt-8">
        <RecentSubmissions />
      </div>
    </div>
  );
}
