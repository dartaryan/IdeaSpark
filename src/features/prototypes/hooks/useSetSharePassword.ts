// src/features/prototypes/hooks/useSetSharePassword.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';
import { shareStatsKeys } from './useShareStats';

interface SetSharePasswordInput {
  prototypeId: string;
  password: string | null; // null to remove password
}

/**
 * Hook to set or remove a password on a shared prototype.
 * Hashes the password client-side before storing to database.
 *
 * @returns React Query mutation for setting share password
 */
export function useSetSharePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prototypeId, password }: SetSharePasswordInput) => {
      const result = await prototypeService.setSharePassword(prototypeId, password);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate password status query
      queryClient.invalidateQueries({
        queryKey: ['passwordStatus', variables.prototypeId],
      });
      // Invalidate share stats to refresh badge
      queryClient.invalidateQueries({
        queryKey: shareStatsKeys.detail(variables.prototypeId),
      });
    },
  });
}
