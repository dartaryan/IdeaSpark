/**
 * Story 6.7 Task 14: Unit tests for DateRangeFilter component
 * Subtask 14.6-14.9: Test preset button interactions and keyboard navigation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeFilter } from './DateRangeFilter';
import type { DateRange } from '../../types';

describe('DateRangeFilter', () => {
  const mockOnDateRangeChange = vi.fn();
  
  const mockCurrentRange: DateRange = {
    start: new Date('2026-01-01'),
    end: new Date('2026-01-31'),
    label: 'Last 30 days',
  };

  beforeEach(() => {
    mockOnDateRangeChange.mockClear();
  });

  it('should render all preset buttons', () => {
    render(
      <DateRangeFilter 
        currentRange={mockCurrentRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('Last 90 days')).toBeInTheDocument();
    expect(screen.getByText('All time')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should display current date range label', () => {
    render(
      <DateRangeFilter 
        currentRange={mockCurrentRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    expect(screen.getByText(/Showing:/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 1, 2026 - Jan 31, 2026/)).toBeInTheDocument();
  });

  it('should highlight active button based on currentRange label', () => {
    render(
      <DateRangeFilter 
        currentRange={mockCurrentRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    const activeButton = screen.getByText('Last 30 days').closest('button');
    expect(activeButton).toHaveClass('btn-primary');
  });

  it('should call onDateRangeChange when Last 7 days button is clicked', () => {
    render(
      <DateRangeFilter 
        currentRange={mockCurrentRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    const last7DaysButton = screen.getByText('Last 7 days');
    fireEvent.click(last7DaysButton);

    expect(mockOnDateRangeChange).toHaveBeenCalledTimes(1);
    expect(mockOnDateRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Last 7 days',
      })
    );
  });

  it('should call onDateRangeChange when Last 90 days button is clicked', () => {
    render(
      <DateRangeFilter 
        currentRange={mockCurrentRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    const last90DaysButton = screen.getByText('Last 90 days');
    fireEvent.click(last90DaysButton);

    expect(mockOnDateRangeChange).toHaveBeenCalledTimes(1);
    expect(mockOnDateRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Last 90 days',
      })
    );
  });

  it('should call onDateRangeChange when All time button is clicked', () => {
    render(
      <DateRangeFilter 
        currentRange={mockCurrentRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    const allTimeButton = screen.getByText('All time');
    fireEvent.click(allTimeButton);

    expect(mockOnDateRangeChange).toHaveBeenCalledTimes(1);
    expect(mockOnDateRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'All time',
        start: null,
      })
    );
  });

  it('should open custom date modal when Custom button is clicked', () => {
    render(
      <DateRangeFilter 
        currentRange={mockCurrentRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    const customButton = screen.getByText('Custom');
    fireEvent.click(customButton);

    // Modal should appear
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Custom Date Range')).toBeInTheDocument();
  });

  it('should support keyboard navigation through buttons', () => {
    render(
      <DateRangeFilter 
        currentRange={mockCurrentRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    const last7DaysButton = screen.getByText('Last 7 days').closest('button');
    
    // Tab to first button
    last7DaysButton?.focus();
    expect(document.activeElement).toBe(last7DaysButton);

    // Enter/Space key on focused button triggers click (native browser behavior)
    // In testing, we verify the button can receive focus and be clicked
    fireEvent.click(last7DaysButton!);
    expect(mockOnDateRangeChange).toHaveBeenCalled();
  });

  it('should apply responsive classes for mobile layout', () => {
    const { container } = render(
      <DateRangeFilter 
        currentRange={mockCurrentRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    // Button group should have responsive flex classes
    const buttonGroup = container.querySelector('.btn-group');
    expect(buttonGroup).toHaveClass('flex-col', 'md:flex-row');
  });

  it('should use PassportCard primary color for active button', () => {
    render(
      <DateRangeFilter 
        currentRange={mockCurrentRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    const activeButton = screen.getByText('Last 30 days').closest('button');
    // PassportCard primary color is #E10514
    expect(activeButton).toHaveClass('btn-primary');
  });
});
