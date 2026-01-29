// src/features/admin/components/IdeaKanbanCard.tsx
// Individual idea card for kanban view
// Story 5.3 - Task 3: Create IdeaKanbanCard component
// Task 6: Add inline approve action to kanban cards
// Story 5.5 Task 7: Add inline reject action to kanban cards

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useApproveIdea } from '../hooks/useApproveIdea';
import { RejectIdeaButton } from './RejectIdeaButton';
import type { IdeaWithSubmitter } from '../types';

interface IdeaKanbanCardProps {
  idea: IdeaWithSubmitter;
}

/**
 * Subtask 3.1: Create IdeaKanbanCard.tsx component
 * Subtask 3.2: Display idea title (truncated to 60 chars with ellipsis)
 * Subtask 3.3: Display submitter name with avatar placeholder or initials
 * Subtask 3.4: Calculate and display "days in stage"
 * Subtask 3.5: Add status badge with semantic color
 * Subtask 3.6: Add click handler to navigate to idea detail page
 * Subtask 3.7: Add hover effect with elevation shadow
 * Subtask 3.8: Display truncated problem statement (first 80 chars)
 * Task 6: Inline approve action in kanban card
 */
export function IdeaKanbanCard({ idea }: IdeaKanbanCardProps) {
  const navigate = useNavigate();
  
  // Task 6: Local state for approve confirmation modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  
  // Task 6: Use approve mutation hook
  const { mutate: approveIdea, isPending } = useApproveIdea();

  // Subtask 3.2: Truncate title to 60 characters
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const displayTitle = truncateText(idea.title, 60);
  const displayProblem = truncateText(idea.problem, 80);

  // Subtask 3.5: Status badge colors (semantic)
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'submitted':
        return { text: 'submitted', colorClass: 'badge-neutral' };
      case 'approved':
        return { text: 'approved', colorClass: 'badge-info' };
      case 'prd_development':
        return { text: 'PRD Development', colorClass: 'badge-warning' };
      case 'prototype_complete':
        return { text: 'Prototype Complete', colorClass: 'badge-success' };
      default:
        return { text: status, colorClass: 'badge-ghost' };
    }
  };

  const statusDisplay = getStatusDisplay(idea.status);

  // Subtask 3.6: Click handler for navigation
  const handleClick = () => {
    navigate(`/admin/ideas/${idea.id}`);
  };

  // Subtask 3.6: Keyboard handler (Enter key)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  };

  // Task 6: Helper to truncate problem statement for modal
  const truncateProblem = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Task 6: Handle approve confirmation
  const handleConfirmApprove = () => {
    approveIdea(idea.id);
    setIsApproveModalOpen(false);
  };

  // Task 6: Handle approve button click (prevent event propagation)
  const handleApproveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    setIsApproveModalOpen(true);
  };

  // Task 6: Subtask 6.2 - Only show approve button for submitted ideas
  const showApproveButton = idea.status === 'submitted';

  return (
    <>
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${displayTitle}`}
        // Subtask 3.7: Hover effect with elevation shadow
        // DaisyUI card with 20px border radius and hover elevation
        className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer text-left w-full relative"
        style={{ borderRadius: '20px' }}
      >
      <div className="card-body p-4">
        {/* Subtask 3.2: Idea title */}
        <h3 className="card-title text-base font-montserrat text-neutral mb-2">
          {displayTitle}
        </h3>

        {/* Subtask 3.3: Submitter info with avatar */}
        <div className="flex items-center gap-2 mb-2">
          <UserCircleIcon className="w-5 h-5 text-[#525355]" />
          <span className="text-sm text-neutral font-rubik">{idea.submitter_name}</span>
        </div>

        {/* Subtask 3.8: Truncated problem statement */}
        <p className="text-sm text-neutral opacity-70 mb-3 font-rubik">
          {displayProblem}
        </p>

        {/* Bottom row: Status badge, approve button, and days in stage */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Subtask 3.5: Status badge */}
            <span className={`badge ${statusDisplay.colorClass} badge-sm`}>
              {statusDisplay.text}
            </span>

            {/* Task 6: Subtask 6.1 & 6.3 - Inline approve icon button */}
            {showApproveButton && (
              <button
                type="button"
                className="btn btn-xs btn-circle btn-ghost"
                onClick={handleApproveClick}
                aria-label="Approve idea"
                title="Approve idea for PRD development"
              >
                {/* Subtask 6.1: Check-circle icon in neutral gray */}
                <CheckCircleIcon className="w-4 h-4" style={{ color: '#525355' }} />
              </button>
            )}
            
            {/* Story 5.5 Task 7: Subtask 7.1-7.4 - Inline reject icon button */}
            {/* Only shows for submitted ideas (handled inside RejectIdeaButton) */}
            <RejectIdeaButton idea={idea} variant="icon" size="xs" />
          </div>

          {/* Subtask 3.4: Days in stage */}
          <span className="text-xs text-neutral opacity-60 font-rubik">
            {idea.days_in_stage} {idea.days_in_stage === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>
    </div>

    {/* Task 6: Subtask 6.4 - Confirmation modal (same as ApproveIdeaButton) */}
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
  </>
  );
}
