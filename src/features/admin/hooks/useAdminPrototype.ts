// src/features/admin/hooks/useAdminPrototype.ts
// Story 5.6 - Task 6: React Query hook for fetching prototype by ID (admin)
// Subtask: Create useAdminPrototype hook for fetching any user's prototype

import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

/**
 * Hook for fetching prototype by ID (admin only)
 * Bypasses RLS to fetch any user's prototype
 * 
 * @param prototypeId - ID of the prototype to fetch
 * @returns React Query result with prototype details
 */
export function useAdminPrototype(prototypeId: string) {
  return useQuery({
    queryKey: ['admin', 'prototype', prototypeId],
    queryFn: () => adminService.getPrototypeById(prototypeId),
    staleTime: 60000, // 1 minute
    enabled: !!prototypeId,
  });
}
