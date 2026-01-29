/**
 * Utility function to conditionally join class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format a date string to a localized format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Story 6.3 Task 11: Get PassportCard theme color for pipeline status
 * Subtask 11.2: Map statuses to PassportCard theme colors
 * Subtask 11.3: Return hex color code for given status
 * Subtask 11.4: Handle unknown status gracefully (return default gray)
 * Subtask 11.6: Document color choices
 * 
 * Color Rationale:
 * - submitted (gray): Neutral, awaiting review
 * - approved (blue): Positive signal, ready to start
 * - prd_development (yellow): In progress, active work
 * - prototype_complete (green): Success, completed
 * - rejected (red): Stopped, not moving forward
 */
export function getPipelineStageColor(status: string): string {
  const colorMap: Record<string, string> = {
    submitted: '#94A3B8',        // Neutral gray (Slate 400)
    approved: '#0EA5E9',          // Sky blue (Sky 500)
    prd_development: '#F59E0B',   // Amber yellow (Amber 500)
    prototype_complete: '#10B981', // Green (Emerald 500)
    rejected: '#EF4444',          // Red (Red 500)
  };
  
  // Subtask 11.4: Default to gray for unknown status
  return colorMap[status] || '#94A3B8';
}

import { subDays, format, differenceInDays, subYears } from 'date-fns';
import type { DateRange, DateRangePreset } from '../features/admin/types';

/**
 * Story 6.7 Task 1: Get preset date range
 * Story 6.7 Task 20: Enhanced documentation with examples
 * Subtask 1.3: Create getPresetDateRange() utility
 * Subtask 1.4: Implement getPresetDateRange() logic for each preset
 * Subtask 1.5: Handle "All time" range (null start date, current end date)
 * 
 * Calculates a DateRange object for the specified preset time period.
 * The end date is always the current moment, and the start date is calculated
 * based on the preset type.
 * 
 * @param preset - The preset date range to calculate
 * @returns DateRange object with start, end, and label
 * 
 * @example
 * ```typescript
 * // Get last 30 days range
 * const range = getPresetDateRange('last30days');
 * // { start: Date(30 days ago), end: Date(now), label: 'Last 30 days' }
 * 
 * // Get all time range
 * const allTime = getPresetDateRange('alltime');
 * // { start: null, end: Date(now), label: 'All time' }
 * ```
 */
export function getPresetDateRange(preset: DateRangePreset): DateRange {
  const end = new Date();
  let start: Date | null;
  let label: string;

  switch (preset) {
    case 'last7days':
      start = subDays(end, 7);
      label = 'Last 7 days';
      break;
    case 'last30days':
      start = subDays(end, 30);
      label = 'Last 30 days';
      break;
    case 'last90days':
      start = subDays(end, 90);
      label = 'Last 90 days';
      break;
    case 'alltime':
      start = null; // No start limit
      label = 'All time';
      break;
    case 'custom':
      // Custom preset is handled separately via user input
      start = subDays(end, 30);
      label = 'Custom';
      break;
    default:
      // Default to last 30 days for any unknown preset
      start = subDays(end, 30);
      label = 'Last 30 days';
  }

  return { start, end, label };
}

/**
 * Story 6.7 Task 1: Format date range for display
 * Story 6.7 Task 20: Enhanced documentation with examples
 * Subtask 1.6: Create formatDateRange() for display: "Jan 1 - Jan 31, 2026"
 * 
 * Formats a DateRange into a human-readable string representation.
 * Handles both regular ranges and "All time" (null start) ranges.
 * 
 * @param range - The date range to format
 * @returns Formatted date range string
 * 
 * @example
 * ```typescript
 * const range = { start: new Date('2026-01-01'), end: new Date('2026-01-31'), label: 'Custom' };
 * formatDateRange(range); // "Jan 1, 2026 - Jan 31, 2026"
 * 
 * const allTime = { start: null, end: new Date('2026-01-31'), label: 'All time' };
 * formatDateRange(allTime); // "All time - Jan 31, 2026"
 * ```
 */
export function formatDateRange(range: DateRange): string {
  const endStr = format(range.end, 'MMM d, yyyy');
  if (!range.start) {
    return `All time - ${endStr}`;
  }
  const startStr = format(range.start, 'MMM d, yyyy');
  return `${startStr} - ${endStr}`;
}

/**
 * Story 6.7 Task 1: Validate date range
 * Story 6.7 Task 20: Enhanced documentation with examples
 * Subtask 1.7: Create isValidDateRange() validator (start < end, start not in future)
 * 
 * Validates a DateRange to ensure it meets business rules:
 * - Start date must be before end date
 * - Neither date can be in the future
 * - "All time" ranges (null start) are always valid
 * 
 * @param range - The date range to validate
 * @returns true if valid, false otherwise
 * 
 * @example
 * ```typescript
 * const valid = { start: new Date('2026-01-01'), end: new Date('2026-01-28'), label: 'Custom' };
 * isValidDateRange(valid); // true
 * 
 * const invalid = { start: new Date('2026-01-31'), end: new Date('2026-01-01'), label: 'Invalid' };
 * isValidDateRange(invalid); // false (start > end)
 * 
 * const future = { start: new Date('2027-01-01'), end: new Date('2027-01-31'), label: 'Future' };
 * isValidDateRange(future); // false (dates in future)
 * ```
 */
export function isValidDateRange(range: DateRange): boolean {
  if (!range.start) return true; // "All time" is valid
  if (range.start > range.end) return false; // Start must be before end
  
  const now = new Date();
  if (range.start > now) return false; // Start cannot be in future
  if (range.end > now) return false; // End cannot be in future
  
  return true;
}

/**
 * Story 6.7 Task 9: Get previous period for trend comparison
 * Story 6.7 Task 20: Enhanced documentation with examples
 * Calculate previous period of same duration for trend comparison
 * 
 * Calculates the previous time period with the same duration as the given range.
 * This is used for trend analysis to compare current vs previous period metrics.
 * 
 * For "All time" ranges, the previous period is 1 year prior.
 * For specific ranges, the previous period has the same duration immediately before the current range.
 * 
 * @param range - The current date range
 * @returns DateRange for the previous period
 * 
 * @example
 * ```typescript
 * // 30-day range
 * const current = { start: new Date('2026-01-01'), end: new Date('2026-01-31'), label: 'Last 30 days' };
 * const previous = getPreviousPeriod(current);
 * // { start: Dec 2, 2025, end: Jan 1, 2026, label: 'Previous period' }
 * 
 * // All time range
 * const allTime = { start: null, end: new Date('2026-01-29'), label: 'All time' };
 * const previousYear = getPreviousPeriod(allTime);
 * // { start: Jan 30, 2024, end: Jan 29, 2025, label: 'Previous period' }
 * ```
 */
export function getPreviousPeriod(range: DateRange): DateRange {
  // For "All time", go back 1 year from the end date
  const end = range.start || subYears(range.end, 1);
  const duration = differenceInDays(range.end, end);
  const start = subDays(end, duration);
  
  return { start, end, label: 'Previous period' };
}
