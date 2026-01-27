// src/features/admin/components/IdeaListItem.tsx
// Task 3: Individual idea list item component

import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { IdeaWithSubmitter } from '../types';

interface IdeaListItemProps {
  idea: IdeaWithSubmitter;
  onApprove: (ideaId: string) => void;
  onReject: (ideaId: string) => void;
}

/**
 * Get status badge configuration with semantic colors
 * Subtask 3.4: Status badges with colors matching design system
 */
function getStatusConfig(status: IdeaWithSubmitter['status']) {
  const configs = {
    submitted: {
      label: 'Submitted',
      className: 'badge-neutral',
      bgColor: '#6B7280',
    },
    approved: {
      label: 'Approved',
      className: 'badge-info',
      bgColor: '#3B82F6',
    },
    prd_development: {
      label: 'PRD Development',
      className: 'badge-warning',
      bgColor: '#F59E0B',
    },
    prototype_complete: {
      label: 'Prototype Complete',
      className: 'badge-success',
      bgColor: '#10B981',
    },
    rejected: {
      label: 'Rejected',
      className: 'badge-error',
      bgColor: '#EF4444',
    },
  };
  return configs[status];
}

/**
 * IdeaListItem component - Individual idea in the list
 * 
 * Features:
 * - Displays title (truncated to 80 chars)
 * - Shows submitter name
 * - Status badge with semantic colors
 * - Relative submission date
 * - View Details link
 * - Quick action buttons (Approve/Reject)
 */
export function IdeaListItem({ idea, onApprove, onReject }: IdeaListItemProps) {
  // Subtask 3.2: Truncate title to 80 chars with ellipsis
  const truncatedTitle = idea.title.length > 80 
    ? `${idea.title.substring(0, 80)}...` 
    : idea.title;

  // Subtask 3.5: Format submission date as relative time
  const relativeTime = formatDistanceToNow(new Date(idea.created_at), { addSuffix: true });

  // Get status badge configuration
  const statusConfig = getStatusConfig(idea.status);

  return (
    <div className="bg-base-100 border border-base-300 rounded-[20px] p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Left section: Title, submitter, metadata */}
        <div className="flex-1 min-w-0">
          {/* Title - Subtask 3.2 */}
          <h3 
            className="text-lg font-semibold mb-2 break-words"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {truncatedTitle}
          </h3>

          {/* Submitter name - Subtask 3.3 */}
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#525355"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <span className="text-sm text-base-content/70">{idea.submitter_name}</span>
          </div>

          {/* Status and Date - Subtasks 3.4 and 3.5 */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`badge ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
            <span className="text-xs text-base-content/60 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#525355"
                className="w-3 h-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {relativeTime}
            </span>
          </div>
        </div>

        {/* Right section: Actions */}
        <div className="flex flex-col md:flex-row gap-2 md:items-start">
          {/* View Details link - Subtask 3.6 */}
          <Link
            to={`/ideas/${idea.id}`}
            className="btn btn-sm btn-ghost"
          >
            View Details
          </Link>

          {/* Quick action buttons - Subtask 3.7 */}
          <button
            type="button"
            className="btn btn-sm"
            style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none' }}
            onClick={() => onApprove(idea.id)}
          >
            Approve
          </button>
          <button
            type="button"
            className="btn btn-sm btn-error"
            onClick={() => onReject(idea.id)}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
