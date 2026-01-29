// src/features/admin/components/RejectIdeaModal.tsx
// Story 5.5 - Task 4: Feedback modal component for rejection

import { useState, useEffect } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { useRejectIdea } from '../hooks/useRejectIdea';
import type { IdeaWithSubmitter } from '../types';

interface RejectIdeaModalProps {
  idea: IdeaWithSubmitter;
  isOpen: boolean;
  onClose: () => void;
}

const MIN_FEEDBACK_LENGTH = 20;
const MAX_FEEDBACK_LENGTH = 500;

/**
 * RejectIdeaModal - Feedback modal for rejecting ideas
 * 
 * Story 5.5 - Task 4:
 * Subtask 4.3: Implement feedback modal with textarea for rejection reason
 * Subtask 4.4: Modal content: idea title, submitter name, feedback textarea (min 20 chars, max 500)
 * Subtask 4.5: Add character counter showing remaining characters (500 max)
 * Subtask 4.6: Modal actions: "Confirm Rejection" (danger) and "Cancel" (secondary)
 * Subtask 4.7: Validate feedback is at least 20 characters before enabling submit
 * Subtask 4.8: Call useRejectIdea mutation on confirmation
 * Subtask 4.9: Disable button and show loading spinner while mutation in progress
 * Subtask 4.10: Close modal after successful rejection
 */
export function RejectIdeaModal({ idea, isOpen, onClose }: RejectIdeaModalProps) {
  const [feedback, setFeedback] = useState('');
  const { mutate: rejectIdea, isPending } = useRejectIdea();

  // Reset feedback when modal opens
  useEffect(() => {
    if (isOpen) {
      setFeedback('');
    }
  }, [isOpen]);

  // Subtask 4.7: Validate feedback length
  const isValid = feedback.length >= MIN_FEEDBACK_LENGTH && feedback.length <= MAX_FEEDBACK_LENGTH;
  const remainingChars = MAX_FEEDBACK_LENGTH - feedback.length;
  const isTooShort = feedback.length > 0 && feedback.length < MIN_FEEDBACK_LENGTH;
  const isTooLong = feedback.length > MAX_FEEDBACK_LENGTH;

  // Subtask 4.8: Handle rejection confirmation
  const handleConfirmReject = () => {
    if (!isValid) return;
    
    rejectIdea(
      { ideaId: idea.id, feedback },
      {
        onSuccess: () => {
          // Subtask 4.10: Close modal after successful rejection
          onClose();
        },
      }
    );
  };

  // Handle backdrop click
  const handleBackdropClick = () => {
    if (!isPending) {
      onClose();
    }
  };

  // Helper to truncate problem statement for display
  const truncateProblem = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box rounded-[20px] max-w-lg">
        {/* Modal header */}
        <div className="flex items-center gap-3 mb-4">
          {/* Subtask 4.2: Display with danger color styling */}
          <div className="p-2 rounded-full bg-red-100">
            <XCircleIcon className="w-6 h-6 text-[#EF4444]" />
          </div>
          <h3 
            className="font-bold text-xl"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Reject Idea
          </h3>
        </div>

        {/* Modal content - idea summary */}
        <div className="space-y-4" style={{ fontFamily: 'Rubik, sans-serif' }}>
          {/* Subtask 4.4: Idea title */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Idea Title</p>
            <p className="font-semibold">{idea.title}</p>
          </div>

          {/* Subtask 4.4: Submitter name */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Submitted by</p>
            <p className="font-medium">{idea.submitter_name}</p>
          </div>

          {/* Problem statement (truncated) */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Problem Statement</p>
            <p className="text-sm text-gray-700">{truncateProblem(idea.problem)}</p>
          </div>

          {/* Subtask 4.3: Feedback textarea */}
          <div>
            <label htmlFor="rejection-feedback" className="text-sm text-gray-500 mb-1 block">
              Rejection Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejection-feedback"
              className={`textarea textarea-bordered w-full h-32 rounded-[20px] ${
                isTooShort ? 'textarea-error' : ''
              } ${isTooLong ? 'textarea-error' : ''}`}
              placeholder="Provide constructive feedback explaining why this idea is being rejected (minimum 20 characters)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isPending}
              aria-describedby="feedback-counter feedback-error"
              aria-invalid={isTooShort || isTooLong}
            />
            
            {/* Subtask 4.5: Character counter */}
            <div className="flex justify-between mt-2">
              {/* Validation message */}
              <div id="feedback-error">
                {isTooShort && (
                  <span className="text-xs text-red-500">
                    Minimum {MIN_FEEDBACK_LENGTH} characters required ({MIN_FEEDBACK_LENGTH - feedback.length} more needed)
                  </span>
                )}
                {isTooLong && (
                  <span className="text-xs text-red-500">
                    Maximum {MAX_FEEDBACK_LENGTH} characters exceeded
                  </span>
                )}
              </div>
              
              {/* Character counter */}
              <span 
                id="feedback-counter"
                className={`text-xs ${
                  isTooLong ? 'text-red-500 font-bold' : 
                  remainingChars < 50 ? 'text-amber-500' : 'text-gray-500'
                }`}
              >
                {feedback.length}/{MAX_FEEDBACK_LENGTH}
              </span>
            </div>
          </div>

          {/* Warning message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              Rejecting this idea will notify the creator and end its journey in the pipeline.
              Please provide constructive feedback to help them improve future submissions.
            </p>
          </div>
        </div>

        {/* Subtask 4.6: Modal actions */}
        <div className="modal-action flex gap-3">
          {/* Cancel button */}
          <button
            onClick={handleBackdropClick}
            className="btn btn-ghost rounded-[20px]"
            disabled={isPending}
            aria-label="Cancel"
          >
            Cancel
          </button>
          
          {/* Subtask 4.6 & 4.7: Confirm Rejection button - danger color */}
          <button
            onClick={handleConfirmReject}
            disabled={!isValid || isPending}
            className="btn rounded-[20px] bg-[#EF4444] hover:bg-[#DC2626] border-none text-white disabled:bg-gray-300 disabled:text-gray-500"
            aria-label="Confirm Rejection"
          >
            {/* Subtask 4.9: Loading spinner */}
            {isPending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : null}
            Confirm Rejection
          </button>
        </div>
      </div>

      {/* Modal backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleBackdropClick} disabled={isPending}>close</button>
      </form>
    </dialog>
  );
}
