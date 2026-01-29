/**
 * Story 6.7 Task 2: DateRangeFilter component with preset buttons
 * Story 6.7 Task 12: Implement keyboard shortcuts for quick range changes
 * Subtask 2.1-2.10: Render preset buttons with responsive design and keyboard navigation
 * Subtask 12.1-12.8: Keyboard shortcuts and help modal
 */

import { useState, useEffect } from 'react';
import { getPresetDateRange, formatDateRange } from '../../../../lib/utils';
import { CustomDateRangeModal } from './CustomDateRangeModal';
import type { DateRange, DateRangePreset } from '../../types';

interface DateRangeFilterProps {
  /** Current selected date range */
  currentRange: DateRange;
  /** Callback when date range changes */
  onDateRangeChange: (range: DateRange) => void;
}

/**
 * DateRangeFilter component
 * Allows users to select preset date ranges or custom date range for analytics filtering
 * 
 * Story 6.7 Task 2: Create DateRangeFilter component with preset buttons
 * - Subtask 2.2: Accept onDateRangeChange callback
 * - Subtask 2.3: Accept currentRange via props
 * - Subtask 2.4: Render 4 preset buttons
 * - Subtask 2.5: Add Custom button with modal
 * - Subtask 2.6: Style active button with primary color
 * - Subtask 2.7: Use DaisyUI btn-group
 * - Subtask 2.8: Responsive layout
 * - Subtask 2.9: Keyboard navigation
 * - Subtask 2.10: Display selected range label
 */
export function DateRangeFilter({ currentRange, onDateRangeChange }: DateRangeFilterProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);

  const presets: Array<{ key: DateRangePreset; label: string; shortcut: string }> = [
    { key: 'last7days', label: 'Last 7 days', shortcut: 'Ctrl+1' }, // Subtask 12.2
    { key: 'last30days', label: 'Last 30 days', shortcut: 'Ctrl+2' }, // Subtask 12.3
    { key: 'last90days', label: 'Last 90 days', shortcut: 'Ctrl+3' }, // Subtask 12.4
    { key: 'alltime', label: 'All time', shortcut: 'Ctrl+4' }, // Subtask 12.5
  ];

  // Task 12 Subtask 12.1-12.6: Add keyboard shortcuts for quick range changes
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Detect Mac vs Windows for modifier key
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;
      
      if (!modifier) return;
      
      switch (event.key) {
        case '1': // Subtask 12.2: Ctrl+1 for Last 7 days
          event.preventDefault();
          handlePresetClick('last7days');
          break;
        case '2': // Subtask 12.3: Ctrl+2 for Last 30 days
          event.preventDefault();
          handlePresetClick('last30days');
          break;
        case '3': // Subtask 12.4: Ctrl+3 for Last 90 days
          event.preventDefault();
          handlePresetClick('last90days');
          break;
        case '4': // Subtask 12.5: Ctrl+4 for All time
          event.preventDefault();
          handlePresetClick('alltime');
          break;
        case 'c':
        case 'C': // Subtask 12.6: Ctrl+C for Custom range
          event.preventDefault();
          setShowCustomModal(true);
          break;
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePresetClick = (preset: DateRangePreset) => {
    const range = getPresetDateRange(preset);
    onDateRangeChange(range);
  };

  const handleCustomClick = () => {
    setShowCustomModal(true);
  };

  const handleCustomApply = (customRange: DateRange) => {
    onDateRangeChange(customRange);
    setShowCustomModal(false);
  };

  const handleCustomClose = () => {
    setShowCustomModal(false);
  };

  const isActive = (label: string) => currentRange.label === label;

  return (
    <div className="space-y-3">
      {/* Preset button group - Subtask 2.7: DaisyUI btn-group */}
      {/* Subtask 2.8: Responsive - vertical on mobile, horizontal on desktop */}
      <div className="btn-group flex flex-col md:flex-row w-full md:w-auto">
        {presets.map(({ key, label, shortcut }) => (
          <button
            key={key}
            type="button"
            onClick={() => handlePresetClick(key)}
            className={`btn ${
              isActive(label) 
                ? 'btn-primary' // Subtask 2.6: Active button with primary color (#E10514)
                : 'btn-outline'
            } flex-1 md:flex-none`}
            aria-label={`Filter analytics by ${label.toLowerCase()}`}
            aria-pressed={isActive(label)}
            title={`${label} (${shortcut})`} // Subtask 12.7: Display keyboard shortcuts in tooltip
          >
            {label}
          </button>
        ))}
        
        {/* Subtask 2.5: Custom button opens date picker modal */}
        <button
          type="button"
          onClick={handleCustomClick}
          className={`btn ${
            isActive('Custom') 
              ? 'btn-primary'
              : 'btn-outline'
          } flex-1 md:flex-none`}
          aria-label="Open custom date range picker"
          aria-pressed={isActive('Custom')}
          title="Custom (Ctrl+C)" // Subtask 12.7: Display keyboard shortcut in tooltip
        >
          Custom
        </button>
      </div>

      {/* Subtask 2.10: Display selected range label */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">Showing:</span> {formatDateRange(currentRange)}
      </div>

      {/* Custom date range modal */}
      <CustomDateRangeModal
        isOpen={showCustomModal}
        onClose={handleCustomClose}
        onApply={handleCustomApply}
      />
    </div>
  );
}
