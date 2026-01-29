// src/features/admin/hooks/useUserIdeas.ts
// Story 5.7 - Task 7: Hook for fetching user's submitted ideas

import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

/**
 * React Query hook to fetch all ideas submitted by a specific user
 * Story 5.7 - Task 7: Create useUserIdeas hook
 * Subtask 7.6: Create useUserIdeas(userId) hook for user's submitted ideas
 * Subtask 7.7: Query key: ['admin', 'user', userId, 'ideas']
 * Subtask 7.8: Handle loading, error, and success states in all hooks
 * 
 * @param userId - ID of the user whose ideas to fetch
 * @returns React Query result with user's ideas and states
 */
export function useUserIdeas(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId, 'ideas'],
    queryFn: async () => {
      const result = await adminService.getIdeasByUser(userId);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.data;
    },
    staleTime: 30000, // 30 seconds - ideas list can change more frequently
    enabled: !!userId, // Only run query if userId is provided
  });
}
