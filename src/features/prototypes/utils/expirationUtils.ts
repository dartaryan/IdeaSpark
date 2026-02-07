// src/features/prototypes/utils/expirationUtils.ts

import type { ExpirationDuration } from '../types';

/** Duration in milliseconds for each expiration option */
const DURATION_MS: Record<ExpirationDuration, number | null> = {
  'never': null,
  '24h': 24 * 60 * 60 * 1000,        // 86,400,000 ms
  '7d': 7 * 24 * 60 * 60 * 1000,     // 604,800,000 ms
  '30d': 30 * 24 * 60 * 60 * 1000,   // 2,592,000,000 ms
};

/**
 * Calculate an expiration date from a duration enum.
 * Returns ISO 8601 timestamp or null for "never expires".
 *
 * @param duration - The expiration duration to apply
 * @returns ISO 8601 date string or null
 */
export function calculateExpirationDate(duration: ExpirationDuration): string | null {
  const ms = DURATION_MS[duration];
  if (ms === null) return null; // Never expires
  return new Date(Date.now() + ms).toISOString();
}

/**
 * Get human-readable remaining time and expiration status.
 *
 * @param expiresAt - ISO 8601 expiration timestamp
 * @returns Object with label (e.g., "in 5 days") and isExpired boolean
 */
export function getTimeRemaining(expiresAt: string): { label: string; isExpired: boolean } {
  const now = Date.now();
  const expirationTime = new Date(expiresAt).getTime();

  if (isNaN(expirationTime)) {
    return { label: 'Invalid date', isExpired: true };
  }

  const diffMs = expirationTime - now;

  if (diffMs <= 0) {
    return { label: 'Expired', isExpired: true };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return { label: `in ${diffDays} day${diffDays === 1 ? '' : 's'}`, isExpired: false };
  }

  if (diffHours > 0) {
    return { label: `in ${diffHours} hour${diffHours === 1 ? '' : 's'}`, isExpired: false };
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes > 0) {
    return { label: `in ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`, isExpired: false };
  }

  return { label: 'in less than a minute', isExpired: false };
}

/**
 * Check if a share link has expired.
 *
 * @param expiresAt - ISO 8601 expiration timestamp, or null (never expires)
 * @returns true if the link has expired
 */
export function isExpired(expiresAt: string | null): boolean {
  if (expiresAt === null) return false; // Never expires
  const expirationTime = new Date(expiresAt).getTime();
  if (isNaN(expirationTime)) return true; // Invalid date treated as expired
  return expirationTime <= Date.now();
}

/**
 * Map a duration enum value to a user-friendly display label.
 *
 * @param duration - The expiration duration
 * @returns Human-readable label
 */
export function durationToLabel(duration: ExpirationDuration): string {
  const labels: Record<ExpirationDuration, string> = {
    'never': 'Never expires',
    '24h': '24 hours',
    '7d': '7 days',
    '30d': '30 days',
  };
  return labels[duration];
}

/**
 * Format an expiration date for display.
 * Uses user's locale for date/time formatting.
 *
 * @param expiresAt - ISO 8601 expiration timestamp
 * @returns Localized date string
 */
export function formatExpirationDate(expiresAt: string): string {
  const date = new Date(expiresAt);
  if (isNaN(date.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
