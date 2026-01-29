/**
 * Story 6.7 Task 14: Unit tests for CustomDateRangeModal component
 * Subtask 14.10-14.13: Test date input validation and modal interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomDateRangeModal } from './CustomDateRangeModal';

describe('CustomDateRangeModal', () => {
  const mockOnClose = vi.fn();
  const mockOnApply = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnApply.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(
      <CustomDateRangeModal
        isOpen={false}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Custom Date Range')).toBeInTheDocument();
  });

  it('should render start and end date inputs', () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('should set max date to today for both inputs', () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    const startInput = screen.getByLabelText('Start Date') as HTMLInputElement;
    const endInput = screen.getByLabelText('End Date') as HTMLInputElement;

    const today = new Date().toISOString().split('T')[0];
    expect(startInput.max).toBe(today);
    expect(endInput.max).toBe(today);
  });

  it('should show validation error when start > end', async () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    const startInput = screen.getByLabelText('Start Date');
    const endInput = screen.getByLabelText('End Date');

    fireEvent.change(startInput, { target: { value: '2026-01-31' } });
    fireEvent.change(endInput, { target: { value: '2026-01-01' } });

    await waitFor(() => {
      expect(screen.getByText(/Start date must be before end date/i)).toBeInTheDocument();
    });
  });

  it('should disable Apply button when range is invalid', async () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    const startInput = screen.getByLabelText('Start Date');
    const endInput = screen.getByLabelText('End Date');
    const applyButton = screen.getByText('Apply');

    fireEvent.change(startInput, { target: { value: '2026-01-31' } });
    fireEvent.change(endInput, { target: { value: '2026-01-01' } });

    await waitFor(() => {
      expect(applyButton).toBeDisabled();
    });
  });

  it('should enable Apply button when range is valid', async () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    const startInput = screen.getByLabelText('Start Date');
    const endInput = screen.getByLabelText('End Date');
    const applyButton = screen.getByText('Apply');

    fireEvent.change(startInput, { target: { value: '2026-01-01' } });
    fireEvent.change(endInput, { target: { value: '2026-01-28' } });

    await waitFor(() => {
      expect(applyButton).not.toBeDisabled();
    });
  });

  it('should call onApply with valid date range when Apply is clicked', async () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    const startInput = screen.getByLabelText('Start Date');
    const endInput = screen.getByLabelText('End Date');
    const applyButton = screen.getByText('Apply');

    fireEvent.change(startInput, { target: { value: '2026-01-01' } });
    fireEvent.change(endInput, { target: { value: '2026-01-28' } });

    await waitFor(() => {
      expect(applyButton).not.toBeDisabled();
    });

    fireEvent.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledTimes(1);
    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Custom',
        start: expect.any(Date),
        end: expect.any(Date),
      })
    );
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal on backdrop click', () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should close modal on Escape key', () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should initially disable Apply button when no dates selected', () => {
    render(
      <CustomDateRangeModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
      />
    );

    const applyButton = screen.getByText('Apply');
    expect(applyButton).toBeDisabled();
  });
});
