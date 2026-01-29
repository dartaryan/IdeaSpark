// src/features/admin/components/IdeaListItem.tsx
// Task 3: Individual idea list item component
// Task 5: Add inline approve action with confirmation modal
// Story 5.5 Task 6: Add inline reject action with feedback modal

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useApproveIdea } from '../hooks/useApproveIdea';
import { RejectIdeaButton } from './RejectIdeaButton';
import type { IdeaWithSubmitter } from '../types';

interface IdeaListItemProps {
  idea: IdeaWithSubmitter;
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
 * - Quick action buttons (Approve icon/Reject)
 * 
 * Task 5: Inline approve action with confirmation modal
 */
export function IdeaListItem({ idea }: IdeaListItemProps) {
  // Task 5: Local state for approve confirmation modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  
  // Task 5: Use approve mutation hook
  const { mutate: approveIdea, isPending } = useApproveIdea();

  // Subtask 3.2: Truncate title to 80 chars with ellipsis
  const truncatedTitle = idea.title.length > 80 
    ? `${idea.title.substring(0, 80)}...` 
    : idea.title;

  // Subtask 3.5: Format submission date as relative time
  const relativeTime = formatDistanceToNow(new Date(idea.created_at), { addSuffix: true });

  // Get status badge configuration
  const statusConfig = getStatusConfig(idea.status);

  // Task 5: Helper to truncate problem statement for modal
  const truncateProblem = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Task 5: Handle approve confirmation
  const handleConfirmApprove = () => {
    approveIdea(idea.id);
    setIsApproveModalOpen(false);
  };

  // Task 5: Subtask 5.2 - Only show approve button for submitted ideas
  const showApproveButton = idea.status === 'submitted';

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

          {/* Task 5: Inline approve icon button - Only for submitted ideas */}
          {showApproveButton && (
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => setIsApproveModalOpen(true)}
              aria-label="Approve idea for PRD development"
              title="Approve idea for PRD development"
            >
              {/* Subtask 5.3: Check-circle icon in neutral gray */}
              <CheckCircleIcon className="w-5 h-5" style={{ color: '#525355' }} />
            </button>
          )}

          {/* Story 5.5 Task 6: Inline reject button with feedback modal */}
          {/* Subtask 6.1-6.6: Only show for submitted ideas, uses RejectIdeaButton with icon variant */}
          <RejectIdeaButton idea={idea} variant="icon" size="sm" />
        </div>
      </div>

      {/* Task 5: Subtask 5.4 - Confirmation modal (same as ApproveIdeaButton) */}
      {isApproveModalOpen && (
        <dialog className="modal modal-open" role="dialog">
          <div className="modal-box rounded-[20px] max-w-lg">
            {/* Modal header */}
            <h3 className="font-montserrat font-bold text-xl mb-4">
              Approve Idea for PRD Development
            </h3>

            {/* Modal content - idea summary */}
            <div className="space-y-4 font-rubik">
              {/* Idea title */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Idea Title</p>
                <p className="font-semibold">{idea.title}</p>
              </div>

              {/* Submitter name */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Submitted by</p>
                <p className="font-medium">{idea.submitter_name}</p>
              </div>

              {/* Problem statement (truncated) */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Problem Statement</p>
                <p className="text-sm text-gray-700">{truncateProblem(idea.problem)}</p>
              </div>

              {/* Approval message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-green-800">
                  Approving this idea will allow the creator to start building a Product Requirements Document (PRD).
                  The idea will move to the "Approved" stage in the pipeline.
                </p>
              </div>
            </div>

            {/* Modal actions */}
            <div className="modal-action flex gap-3">
              {/* Cancel button */}
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="btn btn-ghost rounded-[20px]"
                aria-label="Cancel"
              >
                Cancel
              </button>
              
              {/* Confirm Approval button */}
              <button
                onClick={handleConfirmApprove}
                disabled={isPending}
                className="btn btn-primary rounded-[20px] bg-[#E10514] hover:bg-[#c00410] border-none text-white"
                aria-label="Confirm Approval"
              >
                {isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : null}
                Confirm Approval
              </button>
            </div>
          </div>

          {/* Modal backdrop */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsApproveModalOpen(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
