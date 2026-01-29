// src/features/admin/components/analytics/DateRangeFilter.tsx
// Story 6.2 Task 4: Date range filter component

import { useState } from 'react';
import type { DateRange } from '../../analytics/types';

interface DateRangeFilterProps {
  onFilterChange: (dateRange: DateRange | undefined) => void;
  currentRange?: DateRange;
}

/**
 * DateRangeFilter component - allows filtering analytics by date range
 * Subtask 4.1: Create DateRangeFilter.tsx in features/admin/components/analytics/
 */
export function DateRangeFilter({ onFilterChange, currentRange }: DateRangeFilterProps) {
  // Subtask 4.8: Display currently selected filter prominently
  const [selectedPreset, setSelectedPreset] = useState<string>('all-time');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Subtask 4.2: Implement preset options
  const presets = [
    { value: 'last-7-days', label: 'Last 7 days' },
    { value: 'last-30-days', label: 'Last 30 days' },
    { value: 'last-90-days', label: 'Last 90 days' },
    { value: 'all-time', label: 'All time' },
    { value: 'custom', label: 'Custom range' },
  ];

  // Calculate date range based on preset
  const calculatePresetRange = (preset: string): DateRange | undefined => {
    if (preset === 'all-time') {
      return undefined; // No filter
    }

    const now = new Date();
    const start = new Date();

    switch (preset) {
      case 'last-7-days':
        start.setDate(now.getDate() - 7);
        break;
      case 'last-30-days':
        start.setDate(now.getDate() - 30);
        break;
      case 'last-90-days':
        start.setDate(now.getDate() - 90);
        break;
      default:
        return undefined;
    }

    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
    };
  };

  // Subtask 4.6: Apply filter button triggers analytics data refetch
  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);

    if (preset === 'custom') {
      setShowCustom(true);
      return;
    }

    setShowCustom(false);
    const range = calculatePresetRange(preset);
    onFilterChange(range);
  };

  // Subtask 4.6: Apply filter button for custom range
  const handleApplyCustomRange = () => {
    // Subtask 4.9: Validate: start date must be before end date
    if (!customStart || !customEnd) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(customStart);
    const end = new Date(customEnd);

    // Subtask 4.10: Validate: dates cannot be in the future
    const now = new Date();
    if (start > now || end > now) {
      alert('Dates cannot be in the future');
      return;
    }

    if (start >= end) {
      alert('Start date must be before end date');
      return;
    }

    const range: DateRange = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };

    onFilterChange(range);
  };

  // Subtask 4.7: Clear filter button resets to "All time"
  const handleClearFilter = () => {
    setSelectedPreset('all-time');
    setShowCustom(false);
    setCustomStart('');
    setCustomEnd('');
    onFilterChange(undefined);
  };

  return (
    // Subtask 4.11 & 4.12: Position filter, make responsive
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      {/* Subtask 4.4: Use DaisyUI select for preset options */}
      <select
        className="select select-bordered w-full sm:w-auto"
        value={selectedPreset}
        onChange={(e) => handlePresetChange(e.target.value)}
        style={{ fontFamily: 'Rubik, sans-serif' }}
      >
        {presets.map((preset) => (
          <option key={preset.value} value={preset.value}>
            {preset.label}
          </option>
        ))}
      </select>

      {/* Subtask 4.3 & 4.5: Custom date range picker */}
      {showCustom && (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="date"
            className="input input-bordered w-full sm:w-auto"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={{ fontFamily: 'Rubik, sans-serif' }}
          />
          <input
            type="date"
            className="input input-bordered w-full sm:w-auto"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={{ fontFamily: 'Rubik, sans-serif' }}
          />
          <button
            className="btn btn-primary"
            onClick={handleApplyCustomRange}
            style={{
              fontFamily: 'Rubik, sans-serif',
              backgroundColor: '#E10514',
              borderColor: '#E10514',
            }}
          >
            Apply
          </button>
        </div>
      )}

      {/* Subtask 4.7: Clear filter button */}
      {selectedPreset !== 'all-time' && (
        <button
          className="btn btn-outline btn-sm"
          onClick={handleClearFilter}
          style={{ fontFamily: 'Rubik, sans-serif' }}
        >
          Clear Filter
        </button>
      )}
    </div>
  );
}
