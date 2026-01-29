// src/features/admin/hooks/useUser.ts
// Story 5.7 - Task 7: Hook for fetching single user detail

import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

/**
 * React Query hook to fetch single user details with activity metrics
 * Story 5.7 - Task 7: Create useUser hook
 * Subtask 7.4: Create useUser(userId) hook for single user detail
 * Subtask 7.5: Query key: ['admin', 'user', userId]
 * Subtask 7.8: Handle loading, error, and success states in all hooks
 * 
 * @param userId - ID of the user to fetch
 * @returns React Query result with user detail data and states
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      const result = await adminService.getUserById(userId);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.data;
    },
    staleTime: 60000, // 60 seconds
    enabled: !!userId, // Only run query if userId is provided
  });
}
