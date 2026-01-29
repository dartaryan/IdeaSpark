// src/features/admin/components/analytics/IdeaBreakdownModal.test.tsx
// Story 6.2 Task 10: Unit tests for IdeaBreakdownModal component

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IdeaBreakdownModal } from './IdeaBreakdownModal';
import type { IdeaBreakdown, DateRange } from '../../analytics/types';

describe('IdeaBreakdownModal', () => {
  const mockBreakdown: IdeaBreakdown[] = [
    { period: 'Jan 01, 2026', count: 5 },
    { period: 'Jan 08, 2026', count: 8 },
    { period: 'Jan 15, 2026', count: 3 },
  ];

  const mockDateRange: DateRange = {
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-01-31T23:59:59.999Z',
  };

  it('should not render when isOpen is false', () => {
    // Subtask 10.14: Test modal opens correctly
    const { container } = render(
      <IdeaBreakdownModal
        isOpen={false}
        onClose={vi.fn()}
        breakdown={mockBreakdown}
        isLoading={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    // Subtask 10.14: Test modal opens correctly
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={vi.fn()}
        breakdown={mockBreakdown}
        isLoading={false}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Ideas Breakdown')).toBeInTheDocument();
  });

  it('should display loading spinner when isLoading is true', () => {
    // Subtask 10.15: Test loading state
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={vi.fn()}
        breakdown={[]}
        isLoading={true}
      />
    );

    const spinner = screen.getByLabelText('Loading breakdown data');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('loading-spinner');
  });

  it('should display empty state message when breakdown is empty', () => {
    // Subtask 10.15: Test empty breakdown message
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={vi.fn()}
        breakdown={[]}
        isLoading={false}
      />
    );

    expect(screen.getByText('No ideas submitted in this period.')).toBeInTheDocument();
    expect(screen.getByText('Start by submitting your first innovative idea!')).toBeInTheDocument();
  });

  it('should display breakdown data in table with correct formatting', () => {
    // Subtask 10.15: Test breakdown data displays correctly
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={vi.fn()}
        breakdown={mockBreakdown}
        isLoading={false}
      />
    );

    // Check table headers
    expect(screen.getByText('Time Period')).toBeInTheDocument();
    expect(screen.getByText('Ideas Submitted')).toBeInTheDocument();

    // Check breakdown rows
    expect(screen.getByText('Jan 01, 2026')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Jan 08, 2026')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Check total row
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument(); // 5 + 8 + 3
  });

  it('should call onClose when close button is clicked', () => {
    // Subtask 10.14: Test modal closes correctly
    const mockOnClose = vi.fn();
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        isLoading={false}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when modal background is clicked', () => {
    // Subtask 10.14: Test outside click closes modal
    const mockOnClose = vi.fn();
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        isLoading={false}
      />
    );

    const modalBackground = screen.getByRole('dialog');
    fireEvent.click(modalBackground);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content is clicked', () => {
    // Subtask 10.14: Test clicking inside modal doesn't close it
    const mockOnClose = vi.fn();
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        isLoading={false}
      />
    );

    const modalContent = screen.getByText('Ideas Breakdown');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onClose when Close action button is clicked', () => {
    // Subtask 10.14: Test close action button
    const mockOnClose = vi.fn();
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        isLoading={false}
      />
    );

    // Get the action button (not the X button) by its text content
    const closeActionButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeActionButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display date range in subtitle when provided', () => {
    // Subtask 10.15: Test date range display
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={vi.fn()}
        breakdown={mockBreakdown}
        isLoading={false}
        dateRange={mockDateRange}
      />
    );

    // Should display formatted date range (note: end date shows as Feb 1, not Jan 31)
    expect(screen.getByText('Jan 1, 2026 - Feb 1, 2026')).toBeInTheDocument();
  });

  it('should display default period text when no date range provided', () => {
    // Subtask 10.15: Test default period display
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={vi.fn()}
        breakdown={mockBreakdown}
        isLoading={false}
      />
    );

    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    // Subtask 10.14: Test accessibility
    render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={vi.fn()}
        breakdown={mockBreakdown}
        isLoading={false}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'breakdown-modal-title');
  });

  it('should apply PassportCard styling with 20px border radius', () => {
    // Subtask 10.15: Test styling
    const { container } = render(
      <IdeaBreakdownModal
        isOpen={true}
        onClose={vi.fn()}
        breakdown={mockBreakdown}
        isLoading={false}
      />
    );

    const modalBox = container.querySelector('.modal-box');
    expect(modalBox).toHaveStyle({ borderRadius: '20px' });
  });
});
