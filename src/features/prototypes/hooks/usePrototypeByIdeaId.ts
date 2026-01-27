import { useQuery } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';

/**
 * Hook to get the latest prototype for an idea (Task 7 - Story 4.8)
 * Returns null if no prototype exists (not an error state)
 *
 * @param ideaId - The idea ID
 * @returns React Query result with latest prototype or null
 */
export function usePrototypeByIdeaId(ideaId: string | undefined) {
  return useQuery({
    queryKey: ['prototypes', 'idea', ideaId],
    queryFn: async () => {
      if (!ideaId) return null;
      
      const result = await prototypeService.getByIdeaId(ideaId);
      if (result.error) {
        // Log error but don't throw - no prototype is a valid state
        console.warn('Failed to fetch prototype:', result.error);
        return null;
      }
      return result.data;
    },
    enabled: !!ideaId,
    staleTime: 5 * 60 * 1000, // 5 minutes - prototypes don't change often
  });
}

/**
 * Hook to get all prototypes for an idea (all versions) (Task 7 - Story 4.8)
 *
 * @param ideaId - The idea ID
 * @returns React Query result with all prototypes
 */
export function usePrototypesByIdeaId(ideaId: string | undefined) {
  return useQuery({
    queryKey: ['prototypes', 'idea', ideaId, 'all'],
    queryFn: async () => {
      if (!ideaId) return [];
      
      const result = await prototypeService.getAllByIdeaId(ideaId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!ideaId,
    staleTime: 5 * 60 * 1000,
  });
}
