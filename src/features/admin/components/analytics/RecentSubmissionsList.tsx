// src/features/admin/components/analytics/RecentSubmissionsList.tsx
// Story 6.6 Task 8: Recent Submissions List Component

import { formatDistanceToNow } from 'date-fns';
import { RecentSubmissionData } from '../../analytics/types';

/**
 * Story 6.6 Task 8: RecentSubmissionsList Component
 * Subtask 8.2: Accept recentSubmissions via props
 */
interface RecentSubmissionsListProps {
  submissions: RecentSubmissionData[];
}

/**
 * Story 6.6 Task 8: RecentSubmissionsList Component
 * Displays recent idea submissions with submitter info
 * Subtask 8.3-8.10: List with title, submitter, status, date, clickable
 */
export function RecentSubmissionsList({ submissions }: RecentSubmissionsListProps) {
  // Subtask 8.8: Empty state
  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        <p>No recent submissions</p>
        <p className="text-sm mt-2">Ideas will appear here as they are submitted</p>
      </div>
    );
  }

  // Subtask 8.7: Get status badge color
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'submitted': 'badge-neutral',
      'approved': 'badge-info',
      'prd_development': 'badge-warning',
      'prototype_complete': 'badge-success',
      'rejected': 'badge-error',
    };
    return colorMap[status] || 'badge-neutral';
  };

  // Format status label
  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      'submitted': 'Submitted',
      'approved': 'Approved',
      'prd_development': 'PRD Dev',
      'prototype_complete': 'Complete',
      'rejected': 'Rejected',
    };
    return labelMap[status] || status;
  };

  return (
    <div>
      {/* Subtask 8.3: Section title */}
      <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>

      {/* Subtask 8.9: Compact list layout */}
      <div className="space-y-3">
        {submissions.map((submission) => (
          <div
            key={submission.ideaId}
            className="p-3 rounded-lg border border-base-300 hover:bg-base-200 cursor-pointer transition-colors"
            onClick={() => {
              // Subtask 8.5: Make clickable (placeholder for navigation)
              console.log('Navigate to idea:', submission.ideaId);
            }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                console.log('Navigate to idea:', submission.ideaId);
              }
            }}
          >
            {/* Subtask 8.4: Display title, submitter name, status badge, date */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">
                  {submission.title || 'Untitled Idea'}
                </h4>
                <p className="text-sm text-base-content/60 truncate">
                  by {submission.userName || submission.userEmail}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {/* Subtask 8.7: Status badge with color coding */}
                <span className={`badge badge-sm ${getStatusColor(submission.status)}`}>
                  {getStatusLabel(submission.status)}
                </span>

                {/* Subtask 8.6: Relative time display */}
                <span 
                  className="text-xs text-base-content/60"
                  title={new Date(submission.createdAt).toLocaleString()}
                >
                  {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
