// src/features/admin/hooks/useChartBreakdown.ts
// Code Review Fix: Extract chart breakdown data fetching to React Query hook

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import type { IdeaBreakdown } from '../analytics/types';
import type { DateRange } from '../types';

/**
 * Custom hook for fetching chart breakdown data with React Query
 *
 * Code Review Fix: This addresses architecture inconsistency by using React Query
 * for chart data fetching, matching the pattern used in useAnalytics.
 *
 * Features:
 * - Uses React Query for caching and automatic refetching
 * - Consistent error handling with retry logic
 * - Matches useAnalytics pattern for consistency
 * - Provides loading, error, and success states
 *
 * @param dateRange Date range filter { start: Date | null, end: Date, label: string }
 * @returns React Query result with idea breakdown data
 */
export function useChartBreakdown(dateRange: DateRange) {
  return useQuery<IdeaBreakdown[], Error>({
    // Query key with ISO strings for stable caching
    queryKey: [
      'admin',
      'chartBreakdown',
      dateRange.start?.toISOString() || 'alltime',
      dateRange.end.toISOString(),
    ],

    // Fetch breakdown data
    queryFn: async () => {
      const result = await analyticsService.getIdeasBreakdown(dateRange);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.data) {
        throw new Error('No breakdown data returned');
      }

      return result.data;
    },

    // Set staleTime to 60 seconds (same as useAnalytics)
    staleTime: 60 * 1000,

    // Set gcTime to 5 minutes (same as useAnalytics)
    gcTime: 5 * 60 * 1000,

    // Always enabled since dateRange is required
    enabled: true,

    // React Query automatically handles loading, error, and success states
    // refetch function is automatically provided by useQuery
  });
}
