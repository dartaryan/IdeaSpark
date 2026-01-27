// src/features/admin/components/IdeaFilters.tsx
// Task 2: Filter controls for All Ideas list

import { useState, useCallback, useEffect } from 'react';
import type { IdeaFilters } from '../types';

interface IdeaFiltersProps {
  statusFilter: IdeaFilters['statusFilter'];
  sortBy: IdeaFilters['sortBy'];
  searchQuery: string;
  onFilterChange: (filters: IdeaFilters) => void;
}

/**
 * IdeaFilters component - Filter controls for ideas list
 * 
 * Features:
 * - Status filter dropdown
 * - Sort order dropdown
 * - Search input with 300ms debounce
 * - Clear filters button
 */
export function IdeaFilters({
  statusFilter,
  sortBy,
  searchQuery,
  onFilterChange,
}: IdeaFiltersProps) {
  // Local state for search input (for debouncing)
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);

  // Sync local search value when prop changes
  useEffect(() => {
    setSearchInputValue(searchQuery);
  }, [searchQuery]);

  // Debounced search handler - Subtask 2.4
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInputValue !== searchQuery) {
        onFilterChange({
          statusFilter,
          sortBy,
          searchQuery: searchInputValue,
        });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchInputValue, statusFilter, sortBy, searchQuery, onFilterChange]);

  // Handle status filter change - Subtask 2.2
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      statusFilter: e.target.value as IdeaFilters['statusFilter'],
      sortBy,
      searchQuery,
    });
  }, [sortBy, searchQuery, onFilterChange]);

  // Handle sort change - Subtask 2.3
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      statusFilter,
      sortBy: e.target.value as IdeaFilters['sortBy'],
      searchQuery,
    });
  }, [statusFilter, searchQuery, onFilterChange]);

  // Handle search input change - Subtask 2.4
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
  }, []);

  // Clear all filters - Subtask 2.5
  const handleClearFilters = useCallback(() => {
    setSearchInputValue('');
    onFilterChange({
      statusFilter: 'all',
      sortBy: 'newest',
      searchQuery: '',
    });
  }, [onFilterChange]);

  return (
    <div className="bg-base-100 rounded-[20px] shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter - Subtask 2.2 */}
        <div className="form-control">
          <label htmlFor="status-filter" className="label">
            <span className="label-text font-medium">Status</span>
          </label>
          <select
            id="status-filter"
            className="select select-bordered w-full"
            value={statusFilter}
            onChange={handleStatusChange}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="prd_development">PRD Development</option>
            <option value="prototype_complete">Prototype Complete</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Sort Dropdown - Subtask 2.3 */}
        <div className="form-control">
          <label htmlFor="sort-by" className="label">
            <span className="label-text font-medium">Sort By</span>
          </label>
          <select
            id="sort-by"
            className="select select-bordered w-full"
            value={sortBy}
            onChange={handleSortChange}
            aria-label="Sort by"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">By Status</option>
          </select>
        </div>

        {/* Search Input - Subtask 2.4 with debounce */}
        <div className="form-control md:col-span-2">
          <label htmlFor="search-input" className="label">
            <span className="label-text font-medium">Search</span>
          </label>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              placeholder="Search by title or problem..."
              className="input input-bordered w-full pr-10"
              value={searchInputValue}
              onChange={handleSearchChange}
              role="search"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#525355"
              className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Clear Filters Button - Subtask 2.5 */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
