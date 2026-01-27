// src/features/admin/components/IdeaFilters.test.tsx
// Test suite for IdeaFilters component

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IdeaFilters } from './IdeaFilters';

describe('IdeaFilters', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter controls', () => {
    render(
      <IdeaFilters
        statusFilter="all"
        sortBy="newest"
        searchQuery=""
        onFilterChange={mockOnFilterChange}
      />
    );

    // Check for status filter
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    
    // Check for sort dropdown
    expect(screen.getByLabelText(/sort/i)).toBeInTheDocument();
    
    // Check for search input
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    
    // Check for clear filters button
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
  });

  it('displays all status options', () => {
    render(
      <IdeaFilters
        statusFilter="all"
        sortBy="newest"
        searchQuery=""
        onFilterChange={mockOnFilterChange}
      />
    );

    const statusSelect = screen.getByLabelText(/status/i);
    expect(statusSelect).toContainHTML('all');
    expect(statusSelect).toContainHTML('submitted');
    expect(statusSelect).toContainHTML('approved');
    expect(statusSelect).toContainHTML('prd_development');
    expect(statusSelect).toContainHTML('prototype_complete');
    expect(statusSelect).toContainHTML('rejected');
  });

  it('displays all sort options', () => {
    render(
      <IdeaFilters
        statusFilter="all"
        sortBy="newest"
        searchQuery=""
        onFilterChange={mockOnFilterChange}
      />
    );

    const sortSelect = screen.getByLabelText(/sort/i);
    expect(sortSelect).toContainHTML('newest');
    expect(sortSelect).toContainHTML('oldest');
    expect(sortSelect).toContainHTML('status');
  });

  it('calls onFilterChange when status filter changes', () => {
    render(
      <IdeaFilters
        statusFilter="all"
        sortBy="newest"
        searchQuery=""
        onFilterChange={mockOnFilterChange}
      />
    );

    const statusSelect = screen.getByLabelText(/status/i);
    fireEvent.change(statusSelect, { target: { value: 'submitted' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      statusFilter: 'submitted',
      sortBy: 'newest',
      searchQuery: '',
    });
  });

  it('calls onFilterChange when sort changes', () => {
    render(
      <IdeaFilters
        statusFilter="all"
        sortBy="newest"
        searchQuery=""
        onFilterChange={mockOnFilterChange}
      />
    );

    const sortSelect = screen.getByLabelText(/sort/i);
    fireEvent.change(sortSelect, { target: { value: 'oldest' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      statusFilter: 'all',
      sortBy: 'oldest',
      searchQuery: '',
    });
  });

  it('debounces search input changes', async () => {
    render(
      <IdeaFilters
        statusFilter="all"
        sortBy="newest"
        searchQuery=""
        onFilterChange={mockOnFilterChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    
    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should not call immediately
    expect(mockOnFilterChange).not.toHaveBeenCalled();

    // Wait for debounce (300ms)
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        statusFilter: 'all',
        sortBy: 'newest',
        searchQuery: 'test',
      });
    }, { timeout: 500 });

    // Should only be called once after debounce
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
  });

  it('clears all filters when clear button is clicked', () => {
    render(
      <IdeaFilters
        statusFilter="submitted"
        sortBy="oldest"
        searchQuery="test query"
        onFilterChange={mockOnFilterChange}
      />
    );

    const clearButton = screen.getByText(/clear filters/i);
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      statusFilter: 'all',
      sortBy: 'newest',
      searchQuery: '',
    });
  });

  it('applies current filter values to inputs', () => {
    render(
      <IdeaFilters
        statusFilter="approved"
        sortBy="status"
        searchQuery="innovation"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByLabelText(/status/i)).toHaveValue('approved');
    expect(screen.getByLabelText(/sort/i)).toHaveValue('status');
    expect(screen.getByPlaceholderText(/search/i)).toHaveValue('innovation');
  });
});
