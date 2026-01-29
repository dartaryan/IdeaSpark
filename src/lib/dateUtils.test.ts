/**
 * Story 6.7 Task 14: Unit tests for date range utilities
 * Tests for getPresetDateRange, formatDateRange, isValidDateRange, getPreviousPeriod
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPresetDateRange,
  formatDateRange,
  isValidDateRange,
  getPreviousPeriod,
} from './utils';
import type { DateRange, DateRangePreset } from '../features/admin/types';

describe('getPresetDateRange', () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed date: 2026-01-29 12:00:00 UTC
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-29T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return correct range for last7days preset', () => {
    const range = getPresetDateRange('last7days');
    
    expect(range.label).toBe('Last 7 days');
    expect(range.end).toEqual(new Date('2026-01-29T12:00:00.000Z'));
    expect(range.start).toEqual(new Date('2026-01-22T12:00:00.000Z'));
  });

  it('should return correct range for last30days preset', () => {
    const range = getPresetDateRange('last30days');
    
    expect(range.label).toBe('Last 30 days');
    expect(range.end).toEqual(new Date('2026-01-29T12:00:00.000Z'));
    expect(range.start).toEqual(new Date('2025-12-30T12:00:00.000Z'));
  });

  it('should return correct range for last90days preset', () => {
    const range = getPresetDateRange('last90days');
    
    expect(range.label).toBe('Last 90 days');
    expect(range.end).toEqual(new Date('2026-01-29T12:00:00.000Z'));
    expect(range.start).toEqual(new Date('2025-10-31T12:00:00.000Z'));
  });

  it('should return null start date for alltime preset', () => {
    const range = getPresetDateRange('alltime');
    
    expect(range.label).toBe('All time');
    expect(range.end).toEqual(new Date('2026-01-29T12:00:00.000Z'));
    expect(range.start).toBeNull();
  });

  it('should default to last30days for invalid preset', () => {
    const range = getPresetDateRange('invalid' as DateRangePreset);
    
    expect(range.label).toBe('Last 30 days');
    expect(range.end).toEqual(new Date('2026-01-29T12:00:00.000Z'));
    expect(range.start).toEqual(new Date('2025-12-30T12:00:00.000Z'));
  });
});

describe('formatDateRange', () => {
  it('should format date range with start and end dates', () => {
    const range: DateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31'),
      label: 'Custom',
    };
    
    const formatted = formatDateRange(range);
    expect(formatted).toBe('Jan 1, 2026 - Jan 31, 2026');
  });

  it('should format all time range with null start', () => {
    const range: DateRange = {
      start: null,
      end: new Date('2026-01-31'),
      label: 'All time',
    };
    
    const formatted = formatDateRange(range);
    expect(formatted).toBe('All time - Jan 31, 2026');
  });

  it('should handle same month date range', () => {
    const range: DateRange = {
      start: new Date('2026-01-15'),
      end: new Date('2026-01-25'),
      label: 'Custom',
    };
    
    const formatted = formatDateRange(range);
    expect(formatted).toBe('Jan 15, 2026 - Jan 25, 2026');
  });

  it('should handle cross-year date range', () => {
    const range: DateRange = {
      start: new Date('2025-12-15'),
      end: new Date('2026-01-15'),
      label: 'Custom',
    };
    
    const formatted = formatDateRange(range);
    expect(formatted).toBe('Dec 15, 2025 - Jan 15, 2026');
  });
});

describe('isValidDateRange', () => {
  it('should return true for valid date range', () => {
    // Use dates in the past relative to the mocked current time (2026-01-29)
    const range: DateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-28'),
      label: 'Custom',
    };
    
    expect(isValidDateRange(range)).toBe(true);
  });

  it('should return true for all time range (null start)', () => {
    const range: DateRange = {
      start: null,
      end: new Date('2026-01-31'),
      label: 'All time',
    };
    
    expect(isValidDateRange(range)).toBe(true);
  });

  it('should return false when start > end', () => {
    const range: DateRange = {
      start: new Date('2026-01-31'),
      end: new Date('2026-01-01'),
      label: 'Invalid',
    };
    
    expect(isValidDateRange(range)).toBe(false);
  });

  it('should return false when start is in future', () => {
    const range: DateRange = {
      start: new Date('2027-01-01'),
      end: new Date('2027-01-31'),
      label: 'Future',
    };
    
    expect(isValidDateRange(range)).toBe(false);
  });

  it('should return false when end is in future', () => {
    const range: DateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2027-01-31'),
      label: 'Future end',
    };
    
    expect(isValidDateRange(range)).toBe(false);
  });

  it('should allow end date to be today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-29T12:00:00.000Z'));
    
    const range: DateRange = {
      start: new Date('2026-01-15'),
      end: new Date('2026-01-29'),
      label: 'Until today',
    };
    
    expect(isValidDateRange(range)).toBe(true);
    vi.useRealTimers();
  });
});

describe('getPreviousPeriod', () => {
  it('should calculate previous period for 30-day range', () => {
    const currentRange: DateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31'),
      label: 'Last 30 days',
    };
    
    const previousPeriod = getPreviousPeriod(currentRange);
    
    expect(previousPeriod.label).toBe('Previous period');
    expect(previousPeriod.start).toEqual(new Date('2025-12-02'));
    expect(previousPeriod.end).toEqual(new Date('2026-01-01'));
  });

  it('should calculate previous period for 7-day range', () => {
    const currentRange: DateRange = {
      start: new Date('2026-01-22'),
      end: new Date('2026-01-29'),
      label: 'Last 7 days',
    };
    
    const previousPeriod = getPreviousPeriod(currentRange);
    
    expect(previousPeriod.label).toBe('Previous period');
    expect(previousPeriod.start).toEqual(new Date('2026-01-15'));
    expect(previousPeriod.end).toEqual(new Date('2026-01-22'));
  });

  it('should handle all time range (null start) by going back 1 year', () => {
    const currentRange: DateRange = {
      start: null,
      end: new Date('2026-01-29'),
      label: 'All time',
    };
    
    const previousPeriod = getPreviousPeriod(currentRange);
    
    expect(previousPeriod.label).toBe('Previous period');
    // When calculating previous period for "all time", we go back 1 year from end
    // Then calculate start as (end - duration), where duration = differenceInDays(2026-01-29, 2025-01-29)
    // Duration = 365 days (2025 is not a leap year)
    // Start = 2025-01-29 - 365 days = 2024-01-30 (not 01-29, due to non-leap year 2025)
    expect(previousPeriod.start).toEqual(new Date('2024-01-30'));
    expect(previousPeriod.end).toEqual(new Date('2025-01-29'));
  });

  it('should handle single-day range', () => {
    const currentRange: DateRange = {
      start: new Date('2026-01-29'),
      end: new Date('2026-01-29'),
      label: 'Today',
    };
    
    const previousPeriod = getPreviousPeriod(currentRange);
    
    expect(previousPeriod.label).toBe('Previous period');
    expect(previousPeriod.start).toEqual(new Date('2026-01-29'));
    expect(previousPeriod.end).toEqual(new Date('2026-01-29'));
  });
});
