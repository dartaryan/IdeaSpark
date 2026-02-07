// src/features/prototypes/hooks/useRevokePublicAccess.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';
import { shareStatsKeys } from './useShareStats';

interface RevokePublicAccessInput {
  prototypeId: string;
}

/**
 * Hook to revoke public access to a shared prototype.
 * Sets share_revoked = true in the database, immediately blocking public access via RLS.
 *
 * @returns React Query mutation for revoking public access
 */
export function useRevokePublicAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prototypeId }: RevokePublicAccessInput) => {
      const result = await prototypeService.revokePublicAccess(prototypeId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate all share-related queries to refresh UI state
      queryClient.invalidateQueries({
        queryKey: shareStatsKeys.detail(variables.prototypeId),
      });
      queryClient.invalidateQueries({
        queryKey: ['shareUrl', variables.prototypeId],
      });
      queryClient.invalidateQueries({
        queryKey: ['passwordStatus', variables.prototypeId],
      });
    },
  });
}
