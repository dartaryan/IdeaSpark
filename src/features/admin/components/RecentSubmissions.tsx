// src/features/admin/components/RecentSubmissions.tsx
// Task 6: Recent submissions list component

import { Link } from 'react-router-dom';
import { useRecentSubmissions } from '../hooks/useRecentSubmissions';
import { ROUTES } from '../../../routes/routeConstants';

/**
 * Format date to readable string (e.g., "Jan 26, 2026")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Truncate text to specified length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * RecentSubmissions component - displays last 10 submitted ideas
 * 
 * Features (Task 6):
 * - Subtask 6.2: Fetches last 10 ideas with status="submitted"
 * - Subtask 6.3: Displays title (50 chars max), submitter name, date
 * - Subtask 6.4: View link to each idea detail
 * - Subtask 6.5: Empty state when no submissions
 */
export function RecentSubmissions() {
  const { data: submissions, isLoading, error } = useRecentSubmissions();

  // Loading state
  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
        <div className="card-body">
          <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Recent Submissions
          </h2>
          <div className="flex items-center justify-center py-8" role="status">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
        <div className="card-body">
          <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Recent Submissions
          </h2>
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
            <span>Failed to load recent submissions</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state (Subtask 6.5)
  if (!submissions || submissions.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
        <div className="card-body">
          <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Recent Submissions
          </h2>
          <div className="text-center py-8 text-base-content/60" style={{ fontFamily: 'Rubik, sans-serif' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>No recent submissions</p>
          </div>
        </div>
      </div>
    );
  }

  // Data loaded - display list (Subtask 6.2, 6.3, 6.4)
  return (
    <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
      <div className="card-body">
        <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Recent Submissions
        </h2>

        <div className="space-y-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="flex items-start justify-between py-3 border-b border-base-300 last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                {/* Title - max 50 chars (Subtask 6.3) */}
                <h3
                  className="font-medium text-base-content"
                  style={{ fontFamily: 'Rubik, sans-serif' }}
                >
                  {truncateText(submission.title, 50)}
                </h3>

                {/* Submitter and date (Subtask 6.3) */}
                <div className="flex items-center gap-3 mt-1 text-sm text-base-content/60" style={{ fontFamily: 'Rubik, sans-serif' }}>
                  <span>{submission.submitter_name}</span>
                  <span className="text-xs">•</span>
                  <span>{formatDate(submission.created_at)}</span>
                </div>
              </div>

              {/* View link (Subtask 6.4) */}
              <Link
                to={ROUTES.IDEA_DETAIL.replace(':id', submission.id)}
                className="btn btn-sm btn-ghost text-primary ml-4 flex-shrink-0"
                style={{ fontFamily: 'Rubik, sans-serif' }}
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
