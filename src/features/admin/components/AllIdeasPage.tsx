// src/features/admin/components/AllIdeasPage.tsx
// Task 1: All Ideas Page component - main list view for admin

import { useState } from 'react';
import { useAllIdeas, useApproveIdea, useRejectIdea } from '../hooks';
import { IdeaFilters } from './IdeaFilters';
import { IdeaListItem } from './IdeaListItem';
import type { IdeaFilters as IdeaFiltersType } from '../types';

/**
 * All Ideas Page - Admin view of all submitted ideas with filtering
 * 
 * Features:
 * - Displays all ideas from all users
 * - Filtering by status, sorting, and search
 * - Loading and error states
 * - Responsive layout
 */
export function AllIdeasPage() {
  // Local state for filters
  const [filters, setFilters] = useState<IdeaFiltersType>({
    statusFilter: 'all',
    sortBy: 'newest',
    searchQuery: '',
  });

  // Modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  const { data: ideas, isLoading, error } = useAllIdeas(filters);
  const approveMutation = useApproveIdea();
  const rejectMutation = useRejectIdea();

  // Subtask 6.3: Handler to open approve confirmation modal
  const handleApprove = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setApproveModalOpen(true);
  };

  // Subtask 6.3: Confirm approval action
  const confirmApprove = () => {
    if (selectedIdeaId) {
      approveMutation.mutate(selectedIdeaId, {
        onSuccess: () => {
          setApproveModalOpen(false);
          setSelectedIdeaId(null);
          // Subtask 6.7: Success toast handled by toast hook
        },
      });
    }
  };

  // Subtask 6.4: Handler to open reject feedback modal
  const handleReject = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setRejectionFeedback('');
    setRejectModalOpen(true);
  };

  // Subtask 6.4: Confirm rejection with feedback
  const confirmReject = () => {
    if (selectedIdeaId && rejectionFeedback.trim().length >= 20) {
      rejectMutation.mutate(
        { ideaId: selectedIdeaId, feedback: rejectionFeedback },
        {
          onSuccess: () => {
            setRejectModalOpen(false);
            setSelectedIdeaId(null);
            setRejectionFeedback('');
            // Subtask 6.7: Success toast handled by toast hook
          },
        }
      );
    }
  };

  // Loading state - Task 7
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]" role="status">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  // Error state - Task 7
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          All Ideas
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
          <span>Failed to load ideas. Please try again later.</span>
        </div>
      </div>
    );
  }

  const ideasCount = ideas?.length ?? 0;
  const hasIdeas = ideasCount > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header - Subtask 1.2: Title with count badge */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          All Ideas
        </h1>
        <span className="badge badge-lg" style={{ backgroundColor: '#E10514', color: 'white' }}>
          {ideasCount}
        </span>
      </div>

      {/* Subtask 1.3: Responsive grid layout for filters and list */}
      <div className="space-y-6">
        {/* Filters section - Task 2 */}
        <IdeaFilters
          statusFilter={filters.statusFilter}
          sortBy={filters.sortBy}
          searchQuery={filters.searchQuery}
          onFilterChange={setFilters}
        />

        {/* List section - Task 3 */}
        {hasIdeas ? (
          <div className="space-y-4">
            {ideas?.map((idea) => (
              <IdeaListItem
                key={idea.id}
                idea={idea}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : (
          // Empty state - Task 7
          <div className="bg-base-100 rounded-[20px] shadow-md p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#525355"
              className="w-16 h-16 mx-auto mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875l-2.25-2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No Ideas Found
            </h3>
            <p className="text-base-content/60">
              {filters.statusFilter !== 'all' || filters.searchQuery
                ? 'Try adjusting your filters to see more ideas.'
                : 'No ideas have been submitted yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Subtask 6.3: Approve Confirmation Modal */}
      {approveModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box" style={{ borderRadius: '20px' }}>
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Approve Idea
            </h3>
            <p className="mb-6">
              Are you sure you want to approve this idea? The submitter will be notified and can proceed to PRD development.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setApproveModalOpen(false)}
                disabled={approveMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none' }}
                onClick={confirmApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtask 6.4: Reject Feedback Modal */}
      {rejectModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box" style={{ borderRadius: '20px' }}>
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Reject Idea
            </h3>
            <p className="mb-4">
              Please provide feedback explaining why this idea is being rejected. The submitter will see this feedback.
            </p>
            <textarea
              className="textarea textarea-bordered w-full mb-2"
              placeholder="Enter feedback (minimum 20 characters)..."
              rows={4}
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              disabled={rejectMutation.isPending}
            />
            <p className="text-sm text-base-content/60 mb-6">
              {rejectionFeedback.length}/20 characters minimum
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setRejectModalOpen(false)}
                disabled={rejectMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={confirmReject}
                disabled={rejectMutation.isPending || rejectionFeedback.trim().length < 20}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
