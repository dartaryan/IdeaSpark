// src/features/prototypes/hooks/usePublicPrototype.ts

import { useQuery } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';

/**
 * Hook to fetch a public prototype by share_id
 * No authentication required - used by public viewer
 *
 * @param shareId - The share_id from the URL
 * @returns React Query result with public prototype data
 */
export function usePublicPrototype(shareId: string | undefined) {
  return useQuery({
    queryKey: ['prototypes', 'public', shareId],
    queryFn: async () => {
      if (!shareId) throw new Error('Share ID is required');
      
      const result = await prototypeService.getPublicPrototype(shareId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!shareId,
    retry: false, // Don't retry on 404
    staleTime: 10 * 60 * 1000, // 10 minutes (prototypes don't change)
  });
}
