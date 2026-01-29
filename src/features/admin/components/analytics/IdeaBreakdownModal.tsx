// src/features/admin/components/analytics/IdeaBreakdownModal.tsx
// Story 6.2 Task 9: Create IdeaBreakdownModal component
// Displays weekly breakdown of ideas submitted in a modal dialog

import { XMarkIcon } from '@heroicons/react/24/outline';
import type { IdeaBreakdown, DateRange } from '../../analytics/types';

interface IdeaBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: IdeaBreakdown[];
  isLoading: boolean;
  dateRange?: DateRange;
  error?: string | null; // Task 14: Error message
  onRetry?: () => void; // Task 14: Retry handler
}

/**
 * IdeaBreakdownModal - Modal component to display ideas breakdown by time period
 * 
 * Features:
 * - Subtask 9.1: Component created in features/admin/components/analytics/
 * - Subtask 9.2: Accepts breakdown data, isOpen, onClose props
 * - Subtask 9.3: Displays breakdown as simple table
 * - Subtask 9.4: Uses DaisyUI modal component
 * - Subtask 9.5: Shows period labels and idea counts
 * - Subtask 9.6: Highlights periods with data
 * - Subtask 9.7: Close button (X icon) in modal header
 * - Subtask 9.8: Responsive (full screen on mobile)
 * - Subtask 9.9: PassportCard styling (20px border radius)
 */
export function IdeaBreakdownModal({
  isOpen,
  onClose,
  breakdown,
  isLoading,
  dateRange,
  error,
  onRetry,
}: IdeaBreakdownModalProps) {
  // Don't render if not open
  if (!isOpen) return null;

  // Calculate total ideas from breakdown
  const totalIdeas = breakdown.reduce((sum, item) => sum + item.count, 0);

  // Format date range display
  const getDateRangeText = () => {
    if (!dateRange) return 'Last 30 days';
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  };

  return (
    // Subtask 9.4: DaisyUI modal component
    <div 
      className="modal modal-open" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="breakdown-modal-title"
      onClick={onClose}
    >
      <div 
        className="modal-box max-w-2xl w-full"
        style={{ borderRadius: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtask 9.7: Modal header with close button */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 
              id="breakdown-modal-title"
              className="text-2xl font-bold" 
              style={{ fontFamily: 'Montserrat, sans-serif', color: '#E10514' }}
            >
              Ideas Breakdown
            </h2>
            <p 
              className="text-sm mt-1" 
              style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
            >
              {getDateRangeText()}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" style={{ color: '#525355' }} />
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <span 
              className="loading loading-spinner loading-lg" 
              style={{ color: '#E10514' }}
              aria-label="Loading breakdown data"
            ></span>
          </div>
        )}

        {/* Task 14: Error state with retry option */}
        {!isLoading && error && (
          <div className="text-center py-12">
            <div className="alert alert-error mb-4">
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
              <span style={{ fontFamily: 'Rubik, sans-serif' }}>{error}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn"
                style={{
                  backgroundColor: '#E10514',
                  color: 'white',
                  borderRadius: '20px'
                }}
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && breakdown.length === 0 && (
          <div className="text-center py-12">
            <p 
              className="text-lg" 
              style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
            >
              No ideas submitted in this period.
            </p>
            <p 
              className="text-sm mt-2" 
              style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
            >
              Start by submitting your first innovative idea!
            </p>
          </div>
        )}

        {/* Subtask 9.3 & 9.5: Breakdown table */}
        {!isLoading && !error && breakdown.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th 
                    className="text-left" 
                    style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
                  >
                    Time Period
                  </th>
                  <th 
                    className="text-right" 
                    style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
                  >
                    Ideas Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((item, index) => (
                  // Subtask 9.6: Highlight periods with data
                  <tr 
                    key={index}
                    className="hover:bg-base-200 transition-colors"
                  >
                    <td style={{ fontFamily: 'Rubik, sans-serif' }}>
                      {item.period}
                    </td>
                    <td 
                      className="text-right font-semibold" 
                      style={{ fontFamily: 'Montserrat, sans-serif', color: '#E10514' }}
                    >
                      {item.count}
                    </td>
                  </tr>
                ))}
                
                {/* Total row */}
                <tr className="border-t-2 border-base-300 font-bold">
                  <td style={{ fontFamily: 'Rubik, sans-serif' }}>
                    Total
                  </td>
                  <td 
                    className="text-right" 
                    style={{ fontFamily: 'Montserrat, sans-serif', color: '#E10514' }}
                  >
                    {totalIdeas}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Modal actions */}
        <div className="modal-action">
          <button 
            onClick={onClose} 
            className="btn"
            style={{ 
              backgroundColor: '#E10514', 
              color: 'white',
              borderRadius: '20px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
