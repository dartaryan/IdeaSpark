/**
 * Story 6.7 Task 10: DateRangeInfo component
 * Subtask 10.1-10.8: Display date range information banner
 */

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { differenceInDays } from 'date-fns';
import { formatDateRange } from '../../../../lib/utils';
import type { DateRange } from '../../types';

interface DateRangeInfoProps {
  /** Current date range */
  dateRange: DateRange;
  /** Total number of ideas in the filtered period */
  totalIdeas: number;
}

/**
 * DateRangeInfo component
 * Displays information about the currently selected date range
 * 
 * Story 6.7 Task 10: Create DateRangeInfo component
 * - Subtask 10.2: Accept dateRange via props
 * - Subtask 10.3: Display formatted date range prominently
 * - Subtask 10.4: Show total days in range
 * - Subtask 10.5: Show data point count
 * - Subtask 10.6: Add info icon with tooltip
 * - Subtask 10.7: Use DaisyUI alert component with info styling
 * - Subtask 10.8: Position below DateRangeFilter, above metric cards
 */
export function DateRangeInfo({ dateRange, totalIdeas }: DateRangeInfoProps) {
  // Subtask 10.4: Calculate total days in range
  const totalDays = dateRange.start 
    ? differenceInDays(dateRange.end, dateRange.start) + 1 // +1 to include both start and end days
    : 'All time';

  // Subtask 10.3: Format date range for display
  const formattedRange = formatDateRange(dateRange);

  // Subtask 10.4: Format days text (singular/plural)
  const daysText = typeof totalDays === 'number' 
    ? `${totalDays} day${totalDays === 1 ? '' : 's'} selected`
    : totalDays;

  return (
    // Subtask 10.7: DaisyUI alert component with info styling (blue background)
    <div className="alert alert-info shadow-sm" style={{ borderRadius: '12px' }}>
      {/* Subtask 10.6: Info icon with tooltip */}
      <InformationCircleIcon 
        className="w-6 h-6 flex-shrink-0" 
        aria-hidden="true"
        title="Analytics are filtered by the selected date range. Change the filter above to view different time periods."
      />
      
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          {/* Subtask 10.3: Display formatted date range prominently */}
          <span className="font-semibold" style={{ fontFamily: 'Rubik, sans-serif' }}>
            {formattedRange}
          </span>
          
          {/* Subtask 10.4: Show total days in range */}
          <span className="text-sm opacity-80" style={{ fontFamily: 'Rubik, sans-serif' }}>
            {daysText}
          </span>
          
          {/* Subtask 10.5: Show data point count */}
          <span className="text-sm opacity-80" style={{ fontFamily: 'Rubik, sans-serif' }}>
            • Based on {totalIdeas} idea{totalIdeas === 1 ? '' : 's'} in this period
          </span>
        </div>
      </div>
    </div>
  );
}
