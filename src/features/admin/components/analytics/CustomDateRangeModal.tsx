/**
 * Story 6.7 Task 3: CustomDateRangeModal component
 * Subtask 3.1-3.12: Modal for custom date range selection with validation
 */

import { useState, useEffect } from 'react';
import { isValidDateRange } from '../../../../lib/utils';
import type { DateRange } from '../../types';

interface CustomDateRangeModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when valid date range is applied */
  onApply: (range: DateRange) => void;
}

/**
 * CustomDateRangeModal component
 * Modal dialog for selecting a custom date range
 * 
 * Story 6.7 Task 3: Create CustomDateRangeModal component
 * - Subtask 3.2: Accept isOpen, onClose, onApply props
 * - Subtask 3.3: Render DaisyUI modal with date inputs
 * - Subtask 3.4: Add Start Date input
 * - Subtask 3.5: Add End Date input
 * - Subtask 3.6: Set max date to today
 * - Subtask 3.7: Validate start < end
 * - Subtask 3.8: Disable Apply if invalid
 * - Subtask 3.9: Add Cancel button
 * - Subtask 3.10: Call onApply with valid range
 * - Subtask 3.11: Close on backdrop click
 * - Subtask 3.12: Handle Escape key
 */
export function CustomDateRangeModal({ isOpen, onClose, onApply }: CustomDateRangeModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationError, setValidationError] = useState('');

  // Get today's date in YYYY-MM-DD format for max attribute
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setStartDate('');
      setEndDate('');
      setValidationError('');
    }
  }, [isOpen]);

  useEffect(() => {
    // Validate whenever dates change
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const range: DateRange = {
        start,
        end,
        label: 'Custom',
      };

      if (!isValidDateRange(range)) {
        if (start > end) {
          setValidationError('Start date must be before end date');
        } else if (start > new Date() || end > new Date()) {
          setValidationError('Dates cannot be in the future');
        } else {
          setValidationError('Invalid date range');
        }
      } else {
        setValidationError('');
      }
    } else {
      setValidationError('');
    }
  }, [startDate, endDate]);

  const handleApply = () => {
    if (!startDate || !endDate || validationError) {
      return;
    }

    const range: DateRange = {
      start: new Date(startDate),
      end: new Date(endDate),
      label: 'Custom',
    };

    onApply(range);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const isApplyDisabled = !startDate || !endDate || !!validationError;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal modal-open"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-date-range-title"
      >
        <h3 id="custom-date-range-title" className="font-bold text-lg mb-4">
          Custom Date Range
        </h3>

        <div className="space-y-4">
          {/* Start Date Input */}
          <div className="form-control w-full">
            <label htmlFor="start-date" className="label">
              <span className="label-text">Start Date</span>
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              className="input input-bordered w-full"
              aria-label="Start Date"
            />
          </div>

          {/* End Date Input */}
          <div className="form-control w-full">
            <label htmlFor="end-date" className="label">
              <span className="label-text">End Date</span>
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={today}
              className="input input-bordered w-full"
              aria-label="End Date"
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="alert alert-error">
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="modal-action">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplyDisabled}
            className="btn btn-primary"
            aria-disabled={isApplyDisabled}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
