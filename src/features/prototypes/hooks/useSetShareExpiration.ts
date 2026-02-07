// src/features/prototypes/hooks/useSetShareExpiration.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';
import { shareStatsKeys } from './useShareStats';

interface SetShareExpirationInput {
  prototypeId: string;
  expiresAt: string | null; // ISO 8601 timestamp or null (never expires)
}

/**
 * Hook to set or remove expiration on a shared prototype link.
 *
 * @returns React Query mutation for setting share expiration
 */
export function useSetShareExpiration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prototypeId, expiresAt }: SetShareExpirationInput) => {
      const result = await prototypeService.setShareExpiration(prototypeId, expiresAt);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate share stats query to refresh expiration display
      queryClient.invalidateQueries({
        queryKey: shareStatsKeys.detail(variables.prototypeId),
      });
    },
  });
}
