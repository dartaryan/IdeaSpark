// src/features/prototypes/utils/expirationUtils.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateExpirationDate,
  getTimeRemaining,
  isExpired,
  durationToLabel,
  formatExpirationDate,
} from './expirationUtils';

describe('expirationUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set a fixed "now": 2026-02-07T12:00:00Z
    vi.setSystemTime(new Date('2026-02-07T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // calculateExpirationDate
  // =========================================================================
  describe('calculateExpirationDate', () => {
    it('returns null for "never" duration', () => {
      expect(calculateExpirationDate('never')).toBeNull();
    });

    it('returns ISO string 24 hours from now for "24h"', () => {
      const result = calculateExpirationDate('24h');
      expect(result).toBe(new Date('2026-02-08T12:00:00.000Z').toISOString());
    });

    it('returns ISO string 7 days from now for "7d"', () => {
      const result = calculateExpirationDate('7d');
      expect(result).toBe(new Date('2026-02-14T12:00:00.000Z').toISOString());
    });

    it('returns ISO string 30 days from now for "30d"', () => {
      const result = calculateExpirationDate('30d');
      expect(result).toBe(new Date('2026-03-09T12:00:00.000Z').toISOString());
    });

    it('returns valid ISO 8601 string', () => {
      const result = calculateExpirationDate('7d');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });
  });

  // =========================================================================
  // getTimeRemaining
  // =========================================================================
  describe('getTimeRemaining', () => {
    it('returns "in 7 days" for date 7 days in the future', () => {
      const result = getTimeRemaining('2026-02-14T12:00:00Z');
      expect(result).toEqual({ label: 'in 7 days', isExpired: false });
    });

    it('returns "in 1 day" for date 1 day in the future', () => {
      const result = getTimeRemaining('2026-02-08T12:00:00Z');
      expect(result).toEqual({ label: 'in 1 day', isExpired: false });
    });

    it('returns "in 5 hours" for date 5 hours in the future', () => {
      const result = getTimeRemaining('2026-02-07T17:00:00Z');
      expect(result).toEqual({ label: 'in 5 hours', isExpired: false });
    });

    it('returns "in 1 hour" for date 1 hour in the future', () => {
      const result = getTimeRemaining('2026-02-07T13:00:00Z');
      expect(result).toEqual({ label: 'in 1 hour', isExpired: false });
    });

    it('returns "in 30 minutes" for date 30 minutes in the future', () => {
      const result = getTimeRemaining('2026-02-07T12:30:00Z');
      expect(result).toEqual({ label: 'in 30 minutes', isExpired: false });
    });

    it('returns "in 1 minute" for date 1 minute in the future', () => {
      const result = getTimeRemaining('2026-02-07T12:01:00Z');
      expect(result).toEqual({ label: 'in 1 minute', isExpired: false });
    });

    it('returns "in less than a minute" for date seconds in the future', () => {
      const result = getTimeRemaining('2026-02-07T12:00:30Z');
      expect(result).toEqual({ label: 'in less than a minute', isExpired: false });
    });

    it('returns expired for a date in the past', () => {
      const result = getTimeRemaining('2026-02-06T12:00:00Z');
      expect(result).toEqual({ label: 'Expired', isExpired: true });
    });

    it('returns expired for the exact current time', () => {
      const result = getTimeRemaining('2026-02-07T12:00:00Z');
      expect(result).toEqual({ label: 'Expired', isExpired: true });
    });

    it('returns "Invalid date" for malformed input', () => {
      const result = getTimeRemaining('not-a-date');
      expect(result).toEqual({ label: 'Invalid date', isExpired: true });
    });

    it('returns "Invalid date" for empty string', () => {
      const result = getTimeRemaining('');
      expect(result).toEqual({ label: 'Invalid date', isExpired: true });
    });
  });

  // =========================================================================
  // isExpired
  // =========================================================================
  describe('isExpired', () => {
    it('returns false when expiresAt is null (never expires)', () => {
      expect(isExpired(null)).toBe(false);
    });

    it('returns false for a future date', () => {
      expect(isExpired('2026-02-14T12:00:00Z')).toBe(false);
    });

    it('returns true for a past date', () => {
      expect(isExpired('2026-02-06T12:00:00Z')).toBe(true);
    });

    it('returns true for the exact current time (boundary)', () => {
      expect(isExpired('2026-02-07T12:00:00Z')).toBe(true);
    });

    it('returns true for an invalid date string', () => {
      expect(isExpired('invalid-date')).toBe(true);
    });

    it('returns true for empty string', () => {
      expect(isExpired('')).toBe(true);
    });

    it('returns false for a date far in the future', () => {
      expect(isExpired('2099-12-31T23:59:59Z')).toBe(false);
    });
  });

  // =========================================================================
  // durationToLabel
  // =========================================================================
  describe('durationToLabel', () => {
    it('returns "Never expires" for "never"', () => {
      expect(durationToLabel('never')).toBe('Never expires');
    });

    it('returns "24 hours" for "24h"', () => {
      expect(durationToLabel('24h')).toBe('24 hours');
    });

    it('returns "7 days" for "7d"', () => {
      expect(durationToLabel('7d')).toBe('7 days');
    });

    it('returns "30 days" for "30d"', () => {
      expect(durationToLabel('30d')).toBe('30 days');
    });
  });

  // =========================================================================
  // formatExpirationDate
  // =========================================================================
  describe('formatExpirationDate', () => {
    it('returns a formatted date string for a valid ISO date', () => {
      const result = formatExpirationDate('2026-02-14T15:30:00Z');
      // The exact format depends on locale, but it should contain the date components
      expect(result).toBeTruthy();
      expect(result).not.toBe('Invalid date');
      // Should contain year 2026
      expect(result).toContain('2026');
    });

    it('returns "Invalid date" for malformed input', () => {
      expect(formatExpirationDate('not-a-date')).toBe('Invalid date');
    });

    it('returns "Invalid date" for empty string', () => {
      expect(formatExpirationDate('')).toBe('Invalid date');
    });
  });
});
