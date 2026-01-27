// src/features/admin/hooks/useAllIdeas.ts
// Task 5: React Query hook for fetching all ideas with filters

import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { IdeaFilters } from '../types';

/**
 * Hook for fetching all ideas with filtering, sorting, and search
 * Subtask 5.1: Created in features/admin/hooks/
 * Subtask 5.2: Accept filter parameters
 * Subtask 5.3: Implement React Query with query key
 * Subtask 5.4: Add refetch interval (30 seconds)
 * Subtask 5.5: Handle loading, error, and empty states
 * 
 * @param filters - Filter parameters for ideas
 * @returns React Query result with ideas data
 */
export function useAllIdeas(filters: IdeaFilters) {
  return useQuery({
    // Subtask 5.3: Query key pattern includes filters
    queryKey: ['admin', 'ideas', filters],
    
    // Query function calls admin service
    queryFn: async () => {
      const result = await adminService.getAllIdeas(filters);
      
      // Handle service errors
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Subtask 5.5: Return empty array if data is null
      return result.data || [];
    },
    
    // Subtask 5.4: Refetch every 30 seconds for real-time feel
    refetchInterval: 30000,
    
    // Enable refetch on window focus for admin dashboards
    refetchOnWindowFocus: true,
    
    // Set stale time to 10 seconds
    staleTime: 10000,
  });
}
