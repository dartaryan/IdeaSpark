// src/features/admin/components/AllIdeasPage.tsx
// Task 1: All Ideas Page component - main list view for admin
// Story 5.5: Updated to use RejectIdeaButton component in IdeaListItem

import { useState } from 'react';
import { useAllIdeas } from '../hooks';
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
 * - Inline reject action handled by IdeaListItem component (Story 5.5)
 */
export function AllIdeasPage() {
  // Local state for filters
  const [filters, setFilters] = useState<IdeaFiltersType>({
    statusFilter: 'all',
    sortBy: 'newest',
    searchQuery: '',
  });

  const { data: ideas, isLoading, error } = useAllIdeas(filters);

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
        {/* Story 5.5 Task 6: IdeaListItem now contains inline reject action with modal */}
        {hasIdeas ? (
          <div className="space-y-4">
            {ideas?.map((idea) => (
              <IdeaListItem
                key={idea.id}
                idea={idea}
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
    </div>
  );
}
