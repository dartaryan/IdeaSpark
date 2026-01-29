// src/features/admin/hooks/useAdminIdea.ts
// Story 5.6 - Task 6: React Query hook for fetching idea with details (admin)
// Subtask: Create useAdminIdea hook for fetching idea with submitter and related data

import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

/**
 * Hook for fetching idea with complete details (admin only)
 * Includes submitter information and related PRD/prototype IDs
 * 
 * @param ideaId - ID of the idea to fetch
 * @returns React Query result with idea details
 */
export function useAdminIdea(ideaId: string) {
  return useQuery({
    queryKey: ['admin', 'idea', ideaId],
    queryFn: () => adminService.getIdeaWithDetails(ideaId),
    staleTime: 30000, // 30 seconds
    enabled: !!ideaId,
  });
}
