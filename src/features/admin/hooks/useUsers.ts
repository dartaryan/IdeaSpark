// src/features/admin/hooks/useUsers.ts
// Story 5.7 - Task 7: Hook for fetching all users with activity counts

import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

/**
 * React Query hook to fetch all users with activity counts
 * Story 5.7 - Task 7: Create useUsers hook
 * Subtask 7.1: Create useUsers hook in features/admin/hooks/useUsers.ts
 * Subtask 7.2: Hook calls adminService.getAllUsers() with query key: ['admin', 'users']
 * Subtask 7.3: Set staleTime to 60 seconds (user list doesn't change frequently)
 * Subtask 7.8: Handle loading, error, and success states in all hooks
 * 
 * @returns React Query result with users data and states
 */
export function useUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const result = await adminService.getAllUsers();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.data;
    },
    staleTime: 60000, // 60 seconds - user list doesn't change frequently
  });
}
