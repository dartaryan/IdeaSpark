// src/features/admin/hooks/useAdminMetrics.ts
// Task 5: React Query hook for fetching admin metrics

import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { MetricData } from '../types';
import type { AppError } from '../../../types/service';

interface UseAdminMetricsResult {
  data: MetricData | null;
  isLoading: boolean;
  error: AppError | null;
}

/**
 * Hook to fetch admin metrics with React Query
 * 
 * Features (Task 5):
 * - Subtask 5.2: Implements React Query with 30-second refetch interval
 * - Subtask 5.3: Provides loading and error states
 * - Subtask 5.4: Caches metrics with ['admin', 'metrics'] query key
 * 
 * @returns {UseAdminMetricsResult} Metrics data, loading state, and error state
 */
export function useAdminMetrics(): UseAdminMetricsResult {
  const { data, isLoading, error } = useQuery({
    // Subtask 5.4: Query key pattern
    queryKey: ['admin', 'metrics'],
    
    // Query function
    queryFn: async () => {
      const result = await adminService.getMetrics();
      
      // Handle service errors by throwing to trigger React Query error state
      if (result.error) {
        throw result.error;
      }
      
      return result.data;
    },
    
    // Subtask 5.2: Refetch every 30 seconds for real-time feel
    refetchInterval: 30000, // 30 seconds
    
    // Refetch on window focus for fresh data
    refetchOnWindowFocus: true,
    
    // Subtask 5.3: Stale time - data is considered fresh for 25 seconds
    // This prevents unnecessary refetches if data was just loaded
    staleTime: 25000,
  });

  return {
    data: data ?? null,
    isLoading,
    // Subtask 5.3: Error state (cast to AppError or null)
    error: (error as AppError) ?? null,
  };
}
