// src/features/admin/components/analytics/DrillDownModal.test.tsx
// Story 0.6 Task 6: Tests for DrillDownModal component

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DrillDownModal } from './DrillDownModal';
import type { DrillDownColumn } from './DrillDownModal';
import type { TimeToDecisionDrillDown, CompletionRateDrillDown } from '../../analytics/types';

describe('DrillDownModal', () => {
  // Mock data for time-to-decision drill-down
  const mockTimeData: TimeToDecisionDrillDown[] = [
    {
      id: '1',
      title: 'Idea Alpha',
      submittedAt: '2026-01-10T00:00:00Z',
      approvedAt: '2026-01-12T00:00:00Z',
      prdCompletedAt: '2026-01-15T00:00:00Z',
      prototypeCompletedAt: null,
      totalDays: 5.0,
      currentStatus: 'prd_development',
      statusLabel: 'PRD Development',
    },
    {
      id: '2',
      title: 'Idea Beta',
      submittedAt: '2026-01-05T00:00:00Z',
      approvedAt: '2026-01-08T00:00:00Z',
      prdCompletedAt: '2026-01-12T00:00:00Z',
      prototypeCompletedAt: '2026-01-18T00:00:00Z',
      totalDays: 13.0,
      currentStatus: 'prototype_complete',
      statusLabel: 'Prototype Complete',
    },
    {
      id: '3',
      title: 'Idea Gamma',
      submittedAt: '2026-01-15T00:00:00Z',
      approvedAt: null,
      prdCompletedAt: null,
      prototypeCompletedAt: null,
      totalDays: 0,
      currentStatus: 'submitted',
      statusLabel: 'Submitted',
    },
  ];

  // Column definitions for time-to-decision
  const timeColumns: DrillDownColumn<TimeToDecisionDrillDown>[] = [
    { key: 'title', label: 'Idea Title' },
    { key: 'statusLabel', label: 'Status' },
    { key: 'totalDays', label: 'Total Days' },
  ];

  // Mock data for completion rate drill-down
  const mockCompletionData: CompletionRateDrillDown[] = [
    {
      id: '1',
      title: 'Completed Idea',
      currentStatus: 'prototype_complete',
      statusLabel: 'Prototype Complete',
      stagesCompleted: 4,
      totalStages: 4,
      completionPercentage: 100,
      submittedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'In Progress Idea',
      currentStatus: 'approved',
      statusLabel: 'Approved',
      stagesCompleted: 2,
      totalStages: 4,
      completionPercentage: 50,
      submittedAt: '2026-01-05T00:00:00Z',
    },
  ];

  const completionColumns: DrillDownColumn<CompletionRateDrillDown>[] = [
    { key: 'title', label: 'Idea Title' },
    { key: 'statusLabel', label: 'Status' },
    { key: 'completionPercentage', label: 'Completion' },
  ];

  // Subtask 6.1: Test renders modal when open
  it('should render modal when isOpen is true', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Idea Alpha')).toBeInTheDocument();
    expect(screen.getByText('Idea Beta')).toBeInTheDocument();
  });

  // Subtask 6.1: Test modal is hidden when isOpen=false
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <DrillDownModal
        isOpen={false}
        onClose={vi.fn()}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  // Subtask 6.1: Test calls onClose when close button clicked
  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <DrillDownModal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Close action button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <DrillDownModal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when modal backdrop is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <DrillDownModal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <DrillDownModal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    fireEvent.click(screen.getByText('Test Modal'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // Subtask 6.1: Test displays data in sortable table
  it('should display data in table with column headers', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    // Check column headers
    expect(screen.getByText('Idea Title')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Total Days')).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText('Idea Alpha')).toBeInTheDocument();
    expect(screen.getByText('PRD Development')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  // Subtask 6.1: Test sorting works correctly (ascending/descending)
  it('should sort data ascending when column header is clicked', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    // Click on "Total Days" header to sort ascending
    fireEvent.click(screen.getByText('Total Days'));

    // Get all rows - first should be smallest totalDays (0)
    const rows = screen.getAllByRole('row');
    // Header + 3 data rows
    expect(rows.length).toBe(4);

    // First data row should have the smallest totalDays value (0 from Idea Gamma)
    const firstDataRow = rows[1];
    expect(firstDataRow.textContent).toContain('Idea Gamma');
  });

  it('should sort data descending when column header is clicked twice', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    // Click twice for descending
    fireEvent.click(screen.getByText('Total Days'));
    fireEvent.click(screen.getByText('Total Days'));

    const rows = screen.getAllByRole('row');
    // First data row should have the largest totalDays value (13 from Idea Beta)
    const firstDataRow = rows[1];
    expect(firstDataRow.textContent).toContain('Idea Beta');
  });

  // Subtask 6.1: Test filtering works correctly
  it('should filter data by status when filter is changed', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    // Find filter dropdown and select 'submitted'
    const select = screen.getByLabelText('Filter by Status:');
    fireEvent.change(select, { target: { value: 'submitted' } });

    // Should only show Idea Gamma (submitted status)
    expect(screen.getByText('Idea Gamma')).toBeInTheDocument();
    expect(screen.queryByText('Idea Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('Idea Beta')).not.toBeInTheDocument();

    // Should show count
    expect(screen.getByText('Showing 1 of 3')).toBeInTheDocument();
  });

  // Subtask 6.1: Test shows loading skeleton when isLoading=true
  it('should show loading spinner when isLoading is true', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={[]}
        columns={timeColumns}
        isLoading={true}
      />
    );

    const spinner = screen.getByLabelText('Loading drill-down data');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('loading-spinner');
  });

  // Subtask 6.1: Test shows empty state when data is empty array
  it('should show empty state when data is empty array', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={[]}
        columns={timeColumns}
      />
    );

    expect(screen.getByText('No detailed data available')).toBeInTheDocument();
    expect(
      screen.getByText('There is no drill-down data for this metric in the selected period.')
    ).toBeInTheDocument();
  });

  // Test error state
  it('should show error state with retry button', () => {
    const mockRetry = vi.fn();
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={[]}
        columns={timeColumns}
        error="Failed to load data"
        onRetry={mockRetry}
      />
    );

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Retry'));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  // Test accessibility
  it('should have proper accessibility attributes', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'drilldown-modal-title');
  });

  // Test PassportCard styling
  it('should apply PassportCard styling with 20px border radius', () => {
    const { container } = render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    const modalBox = container.querySelector('.modal-box');
    expect(modalBox).toHaveStyle({ borderRadius: '20px' });
  });

  // Test with completion rate data type
  it('should render completion rate data correctly', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Completion Rate Details"
        data={mockCompletionData}
        columns={completionColumns}
      />
    );

    expect(screen.getByText('Completion Rate Details')).toBeInTheDocument();
    expect(screen.getByText('Completed Idea')).toBeInTheDocument();
    expect(screen.getByText('In Progress Idea')).toBeInTheDocument();
  });

  // Test custom render function in columns
  it('should use custom render function when provided', () => {
    const columnsWithRender: DrillDownColumn<TimeToDecisionDrillDown>[] = [
      { key: 'title', label: 'Title' },
      {
        key: 'totalDays',
        label: 'Duration',
        render: (value) => `${value} days total`,
      },
    ];

    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={mockTimeData}
        columns={columnsWithRender}
      />
    );

    expect(screen.getByText('5 days total')).toBeInTheDocument();
    expect(screen.getByText('13 days total')).toBeInTheDocument();
  });

  // Test item count display
  it('should display correct item count', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={mockTimeData}
        columns={timeColumns}
      />
    );

    expect(screen.getByText('3 items')).toBeInTheDocument();
  });

  // Test singular item count
  it('should display singular item count for one item', () => {
    render(
      <DrillDownModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        data={[mockTimeData[0]]}
        columns={timeColumns}
      />
    );

    expect(screen.getByText('1 item')).toBeInTheDocument();
  });
});
