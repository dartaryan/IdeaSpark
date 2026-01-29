// src/features/admin/hooks/useAnalytics.ts
// Task 5: Create useAnalytics hook for data fetching

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsData } from '../analytics/types';
import type { DateRange } from '../types'; // Story 6.7 Task 6: Use DateRange from admin types

/**
 * Subtask 5.1: Create useAnalytics.ts in features/admin/hooks/
 * Subtask 5.2: Implement React Query hook with query key: ['admin', 'analytics']
 * 
 * Custom hook for fetching analytics data with React Query
 * 
 * Features:
 * - Subtask 5.3: Call analyticsService.getAnalytics() to fetch metrics
 * - Subtask 5.4: Set staleTime to 60 seconds (analytics don't need real-time updates)
 * - Subtask 5.5: Set cacheTime to 5 minutes
 * - Subtask 5.6: Handle loading, error, and success states
 * - Subtask 5.7: Return analytics data with proper TypeScript types
 * - Subtask 5.8: Add refetch function for manual refresh capability
 * 
 * Story 6.7 Task 6: Updated to require dateRange parameter
 * Subtask 6.1: Update useAnalytics.ts to accept dateRange parameter
 * Subtask 6.2: Update React Query key with ISO strings for stable caching
 * Subtask 6.3: Pass dateRange to analyticsService.getAnalytics()
 * Subtask 6.4: Invalidate query when dateRange changes (handled by queryKey)
 * Subtask 6.6: Add enabled flag (only fetch when dateRange is valid)
 * 
 * @param dateRange Date range filter { start: Date | null, end: Date, label: string }
 * @returns React Query result with analytics data
 */
export function useAnalytics(dateRange: DateRange) {
  return useQuery<AnalyticsData, Error>({
    // Subtask 6.2: Query key with ISO strings for stable caching
    // Use ISO strings instead of Date objects for better cache key stability
    queryKey: [
      'admin',
      'analytics',
      dateRange.start?.toISOString() || 'alltime',
      dateRange.end.toISOString(),
    ],
    
    // Subtask 6.3: Pass dateRange to analyticsService.getAnalytics()
    queryFn: async () => {
      const result = await analyticsService.getAnalytics(dateRange);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      if (!result.data) {
        throw new Error('No analytics data returned');
      }
      
      return result.data;
    },
    
    // Subtask 5.4: Set staleTime to 60 seconds
    // Subtask 6.5: Updated to 60 seconds for date range filtering
    staleTime: 60 * 1000, // 60 seconds
    
    // Subtask 5.5: Set cacheTime (now called gcTime in React Query v5) to 5 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    
    // Subtask 6.6: Only fetch when dateRange is valid (enabled flag)
    // Always enabled since dateRange is now required and validated before passing
    enabled: true,
    
    // Subtask 6.4: Invalidate query when dateRange changes (handled automatically by queryKey)
    // Subtask 5.6: React Query automatically handles loading, error, and success states
    // Subtask 5.7: TypeScript types ensure proper return type
    // Subtask 5.8: refetch function is automatically provided by useQuery
  });
}
