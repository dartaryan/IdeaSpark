// src/features/admin/components/analytics/DateRangeFilter.test.tsx
// Story 6.2 Task 10: Unit tests for DateRangeFilter
// Subtask 10.9: Create DateRangeFilter.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeFilter } from './DateRangeFilter';

describe('DateRangeFilter', () => {
  it('should render preset filter options', () => {
    // Subtask 10.10: Test preset filter options work
    const mockOnFilterChange = vi.fn();
    render(<DateRangeFilter onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('Last 90 days')).toBeInTheDocument();
    expect(screen.getByText('All time')).toBeInTheDocument();
    expect(screen.getByText('Custom range')).toBeInTheDocument();
  });

  it('should call onFilterChange when preset is selected', () => {
    // Subtask 10.10: Test preset filter options work
    const mockOnFilterChange = vi.fn();
    render(<DateRangeFilter onFilterChange={mockOnFilterChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'last-7-days' } });

    expect(mockOnFilterChange).toHaveBeenCalled();
    const callArg = mockOnFilterChange.mock.calls[0][0];
    expect(callArg).toBeDefined();
    expect(callArg.startDate).toBeDefined();
    expect(callArg.endDate).toBeDefined();
  });

  it('should show custom date inputs when custom range is selected', () => {
    // Subtask 10.11: Test custom date range selection
    const mockOnFilterChange = vi.fn();
    const { container } = render(<DateRangeFilter onFilterChange={mockOnFilterChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'custom' } });

    // Should show date inputs and apply button
    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBe(2);
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('should validate start date is before end date', () => {
    // Subtask 10.12: Test date validation (start < end)
    const mockOnFilterChange = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const { container } = render(<DateRangeFilter onFilterChange={mockOnFilterChange} />);

    // Select custom range
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'custom' } });

    // Set end date before start date (using valid past dates)
    const dateInputs = container.querySelectorAll('input[type="date"]');
    const [startInput, endInput] = Array.from(dateInputs);
    fireEvent.change(startInput, { target: { value: '2025-12-15' } });
    fireEvent.change(endInput, { target: { value: '2025-12-01' } });

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    expect(alertSpy).toHaveBeenCalledWith('Start date must be before end date');
    expect(mockOnFilterChange).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('should validate dates are not in the future', () => {
    // Subtask 10.12: Test date validation (no future dates)
    const mockOnFilterChange = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const { container } = render(<DateRangeFilter onFilterChange={mockOnFilterChange} />);

    // Select custom range
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'custom' } });

    // Set future dates
    const dateInputs = container.querySelectorAll('input[type="date"]');
    const [startInput, endInput] = Array.from(dateInputs);
    fireEvent.change(startInput, { target: { value: '2027-01-01' } });
    fireEvent.change(endInput, { target: { value: '2027-02-01' } });

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    expect(alertSpy).toHaveBeenCalledWith('Dates cannot be in the future');
    expect(mockOnFilterChange).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('should show clear filter button when filter is active', () => {
    // Test clear filter functionality
    const mockOnFilterChange = vi.fn();
    render(<DateRangeFilter onFilterChange={mockOnFilterChange} />);

    // Select a preset
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'last-30-days' } });

    // Clear filter button should be visible
    const clearButton = screen.getByText('Clear Filter');
    expect(clearButton).toBeInTheDocument();

    // Click clear filter
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(undefined);
  });

  it('should apply custom date range correctly', () => {
    // Subtask 10.11: Test custom date range selection
    const mockOnFilterChange = vi.fn();
    const { container } = render(<DateRangeFilter onFilterChange={mockOnFilterChange} />);

    // Select custom range
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'custom' } });

    // Set valid dates (using past dates to avoid future validation)
    const dateInputs = container.querySelectorAll('input[type="date"]');
    const [startInput, endInput] = Array.from(dateInputs);
    fireEvent.change(startInput, { target: { value: '2025-12-01' } });
    fireEvent.change(endInput, { target: { value: '2025-12-31' } });

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalled();
    const callArg = mockOnFilterChange.mock.calls[0][0];
    expect(callArg).toBeDefined();
    expect(callArg.startDate).toContain('2025-12-01');
    expect(callArg.endDate).toContain('2025-12-31');
  });
});
