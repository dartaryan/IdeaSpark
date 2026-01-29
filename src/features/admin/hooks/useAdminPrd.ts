// src/features/admin/hooks/useAdminPrd.ts
// Story 5.6 - Task 6: React Query hook for fetching PRD by ID (admin)
// Subtask: Create useAdminPrd hook for fetching any user's PRD

import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

/**
 * Hook for fetching PRD by ID (admin only)
 * Bypasses RLS to fetch any user's PRD
 * 
 * @param prdId - ID of the PRD to fetch
 * @returns React Query result with PRD details
 */
export function useAdminPrd(prdId: string) {
  return useQuery({
    queryKey: ['admin', 'prd', prdId],
    queryFn: () => adminService.getPrdById(prdId),
    staleTime: 60000, // 1 minute
    enabled: !!prdId,
  });
}
