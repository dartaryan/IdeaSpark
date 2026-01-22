import { useQuery } from '@tanstack/react-query';
import { ideaService } from '../services/ideaService';
import { ideaQueryKeys } from './useSubmitIdea';

/**
 * Hook for fetching the current user's ideas
 *
 * Uses React Query for caching and automatic refetching.
 * Ideas are sorted by created_at descending (newest first).
 *
 * @returns Object with ideas array, loading state, error, and refetch function
 */
export function useIdeas() {
  const query = useQuery({
    queryKey: ideaQueryKeys.lists(),
    queryFn: async () => {
      const result = await ideaService.getMyIdeas();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ideas: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
