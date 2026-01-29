// src/features/admin/hooks/useAnalytics.ts
// Task 5: Create useAnalytics hook for data fetching

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsData } from '../analytics/types';

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
 * @returns React Query result with analytics data
 */
export function useAnalytics() {
  return useQuery<AnalyticsData, Error>({
    // Subtask 5.2: Query key for React Query
    queryKey: ['admin', 'analytics'],
    
    // Subtask 5.3: Fetch function calling analyticsService
    queryFn: async () => {
      const result = await analyticsService.getAnalytics();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      if (!result.data) {
        throw new Error('No analytics data returned');
      }
      
      return result.data;
    },
    
    // Subtask 5.4: Set staleTime to 60 seconds
    staleTime: 60 * 1000, // 60 seconds
    
    // Subtask 5.5: Set cacheTime (now called gcTime in React Query v5) to 5 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    
    // Subtask 5.6: React Query automatically handles loading, error, and success states
    // Subtask 5.7: TypeScript types ensure proper return type
    // Subtask 5.8: refetch function is automatically provided by useQuery
  });
}
