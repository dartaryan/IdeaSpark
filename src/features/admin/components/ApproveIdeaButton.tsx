// src/features/admin/components/ApproveIdeaButton.tsx
// Task 3: ApproveIdeaButton component with confirmation modal
// Subtasks 3.1-3.8: Approve button with confirmation dialog

import { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useApproveIdea } from '../hooks/useApproveIdea';

interface ApproveIdeaButtonProps {
  idea: {
    id: string;
    title: string;
    problem: string;
    submitter_name: string;
    status: string;
  };
}

/**
 * ApproveIdeaButton component
 * Task 3: Create ApproveIdeaButton component with confirmation dialog
 * 
 * Subtask 3.2: Display "Approve for PRD" button with success color styling
 * Subtask 3.3: Implement confirmation modal showing idea summary
 * Subtask 3.4: Modal content: idea title, submitter name, problem statement (truncated)
 * Subtask 3.5: Modal actions: "Confirm Approval" (primary) and "Cancel" (secondary)
 * Subtask 3.6: Call useApproveIdea mutation on confirmation
 * Subtask 3.7: Disable button and show loading spinner while mutation in progress
 * Subtask 3.8: Close modal after successful approval
 */
export function ApproveIdeaButton({ idea }: ApproveIdeaButtonProps) {
  // Subtask 3.1: Local state for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Subtask 3.6: Use approveIdea mutation hook
  const { mutate: approveIdea, isPending } = useApproveIdea();

  // Helper to truncate problem statement to 150 characters
  const truncateProblem = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Subtask 3.6: Handle confirmation
  const handleConfirm = () => {
    approveIdea(idea.id);
    // Subtask 3.8: Close modal after approval
    setIsModalOpen(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Subtask 3.2: Display "Approve for PRD" button with success color styling */}
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isPending}
        className="btn btn-success btn-sm rounded-[20px] flex items-center gap-2"
        aria-label="Approve for PRD"
      >
        {/* Subtask 3.7: Show loading spinner when mutation is pending */}
        {isPending ? (
          <span className="loading loading-spinner loading-xs" data-testid="loading-spinner"></span>
        ) : (
          <CheckCircleIcon className="w-4 h-4 text-[#525355]" />
        )}
        Approve for PRD
      </button>

      {/* Subtask 3.3-3.5: Confirmation modal */}
      {isModalOpen && (
        <dialog className="modal modal-open" role="dialog">
          <div className="modal-box rounded-[20px] max-w-lg">
            {/* Modal header */}
            <h3 className="font-montserrat font-bold text-xl mb-4">
              Approve Idea for PRD Development
            </h3>

            {/* Subtask 3.4: Modal content - idea summary */}
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

            {/* Subtask 3.5: Modal actions */}
            <div className="modal-action flex gap-3">
              {/* Cancel button (secondary) */}
              <button
                onClick={handleCancel}
                className="btn btn-ghost rounded-[20px]"
                aria-label="Cancel"
              >
                Cancel
              </button>
              
              {/* Confirm Approval button (primary) */}
              <button
                onClick={handleConfirm}
                className="btn btn-primary rounded-[20px] bg-[#E10514] hover:bg-[#c00410] border-none text-white"
                aria-label="Confirm Approval"
              >
                Confirm Approval
              </button>
            </div>
          </div>

          {/* Modal backdrop */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={handleCancel}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
}
