/**
 * Story 6.7 Task 4: useDateRange hook for state management
 * Subtask 4.1-4.10: State management, localStorage persistence, and date range logic
 */

import { useState, useEffect } from 'react';
import { getPresetDateRange, isValidDateRange } from '../../../lib/utils';
import { format } from 'date-fns';
import type { DateRange, DateRangePreset } from '../types';

const STORAGE_KEY = 'ideaspark-analytics-date-range-preset';

/**
 * Custom hook for managing date range state
 * 
 * Story 6.7 Task 4: Create useDateRange hook for state management
 * Story 6.7 Task 11: Add URL query parameter synchronization
 * Story 6.7 Task 20: Enhanced documentation with examples
 * 
 * Manages date range selection state for analytics filtering.
 * Features:
 * - State management for current date range and selected preset
 * - localStorage persistence of user's last selected preset
 * - URL query parameter synchronization for shareable links
 * - Support for preset ranges and custom date ranges
 * 
 * URL Formats:
 * - Preset: `/analytics?preset=last30days`
 * - Custom: `/analytics?start=2026-01-01&end=2026-01-31`
 * 
 * @param defaultPreset - Default preset to use if no stored/URL value (defaults to 'last30days')
 * @returns Hook state and functions
 * 
 * @example
 * ```typescript
 * function AnalyticsDashboard() {
 *   const { currentRange, selectedPreset, setPreset, setCustomRange } = useDateRange('last30days');
 *   
 *   // Use currentRange for filtering
 *   const { data } = useAnalytics(currentRange);
 *   
 *   // Change to preset
 *   setPreset('last7days');
 *   
 *   // Set custom range
 *   setCustomRange({
 *     start: new Date('2026-01-01'),
 *     end: new Date('2026-01-28'),
 *     label: 'Custom'
 *   });
 * }
 * ```
 */
export function useDateRange(defaultPreset: DateRangePreset = 'last30days') {
  // Task 11 Subtask 11.1-11.3: Read URL params on mount
  const getInitialStateFromURL = (): { preset: DateRangePreset; range: DateRange } | null => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const presetParam = searchParams.get('preset') as DateRangePreset | null;
      const startParam = searchParams.get('start');
      const endParam = searchParams.get('end');

      const validPresets: DateRangePreset[] = ['last7days', 'last30days', 'last90days', 'alltime', 'custom'];

      // Subtask 11.2: Parse preset query param: ?preset=last30days
      if (presetParam && validPresets.includes(presetParam) && presetParam !== 'custom') {
        const range = getPresetDateRange(presetParam);
        return { preset: presetParam, range };
      }

      // Subtask 11.3: Parse custom range query params: ?start=2026-01-01&end=2026-01-31
      if (startParam && endParam) {
        const customRange: DateRange = {
          start: new Date(startParam),
          end: new Date(endParam),
          label: 'Custom',
        };
        
        // Subtask 11.6: Validate URL params before applying
        if (isValidDateRange(customRange)) {
          return { preset: 'custom', range: customRange };
        }
      }
    } catch (error) {
      console.error('Failed to parse URL params:', error);
    }
    
    // Subtask 11.7: Fall back to default if URL params invalid
    return null;
  };

  // Subtask 4.9: Load persisted preset from localStorage (fallback if no URL params)
  const getInitialPreset = (): DateRangePreset => {
    // First check URL params
    const urlState = getInitialStateFromURL();
    if (urlState) {
      return urlState.preset;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const validPresets: DateRangePreset[] = ['last7days', 'last30days', 'last90days', 'alltime', 'custom'];
        if (data.preset && validPresets.includes(data.preset)) {
          return data.preset;
        }
      }
    } catch (error) {
      console.error('Failed to load date range preset from localStorage:', error);
    }
    return defaultPreset;
  };

  const getInitialRange = (): DateRange => {
    // First check URL params
    const urlState = getInitialStateFromURL();
    if (urlState) {
      return urlState.range;
    }
    
    return getPresetDateRange(getInitialPreset());
  };

  // Subtask 4.4: Use useState for selectedPreset
  const [selectedPreset, setSelectedPresetState] = useState<DateRangePreset>(getInitialPreset);
  
  // Subtask 4.3: Use useState for currentRange
  // Subtask 4.5: Initialize with getPresetDateRange() or URL params
  const [currentRange, setCurrentRange] = useState<DateRange>(getInitialRange);

  // Task 11 Subtask 11.4-11.5: Update URL when date range changes
  const updateURL = (preset: DateRangePreset, range: DateRange) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const searchParams = new URLSearchParams(window.location.search);
      
      if (preset !== 'custom') {
        // Subtask 11.2: Set preset query param
        searchParams.set('preset', preset);
        searchParams.delete('start');
        searchParams.delete('end');
      } else if (range.start) {
        // Subtask 11.3: Set custom range query params
        searchParams.delete('preset');
        searchParams.set('start', format(range.start, 'yyyy-MM-dd'));
        searchParams.set('end', format(range.end, 'yyyy-MM-dd'));
      }
      
      // Subtask 11.5: Use history.pushState() for URL updates (without page reload)
      const newURL = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState({}, '', newURL);
    } catch (error) {
      console.error('Failed to update URL:', error);
    }
  };

  // Subtask 4.8: Persist selected preset to localStorage
  const persistPreset = (preset: DateRangePreset) => {
    try {
      const data = {
        preset,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save date range preset to localStorage:', error);
    }
  };

  // Subtask 4.6: Create setPreset() function that updates both states
  // Task 11: Also update URL
  const setPreset = (preset: DateRangePreset) => {
    const range = getPresetDateRange(preset);
    setSelectedPresetState(preset);
    setCurrentRange(range);
    persistPreset(preset);
    updateURL(preset, range); // Subtask 11.4: Update URL
  };

  // Subtask 4.7: Create setCustomRange() function for custom dates
  // Task 11: Also update URL
  const setCustomRange = (range: DateRange) => {
    setSelectedPresetState('custom');
    setCurrentRange(range);
    persistPreset('custom');
    updateURL('custom', range); // Subtask 11.4: Update URL
  };

  // Subtask 4.10: Return all state and functions
  return {
    currentRange,
    selectedPreset,
    setPreset,
    setCustomRange,
  };
}
