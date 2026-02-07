// src/features/prototypes/hooks/useShareStats.ts

import { useQuery } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';

export interface ShareStats {
  viewCount: number;
  sharedAt: string | null;
  isPublic: boolean;
  expiresAt: string | null;
}

export const shareStatsKeys = {
  all: ['shareStats'] as const,
  detail: (prototypeId: string) => [...shareStatsKeys.all, prototypeId] as const,
};

/**
 * Hook to fetch share statistics (view count, shared date) for a prototype.
 *
 * @param prototypeId - The prototype ID to fetch stats for
 * @returns React Query result with ShareStats
 */
export function useShareStats(prototypeId: string) {
  return useQuery({
    queryKey: shareStatsKeys.detail(prototypeId),
    queryFn: async () => {
      const result = await prototypeService.getShareStats(prototypeId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prototypeId,
  });
}
