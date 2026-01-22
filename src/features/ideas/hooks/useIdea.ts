import { useQuery } from '@tanstack/react-query';
import { ideaService } from '../services/ideaService';
import { ideaQueryKeys } from './useSubmitIdea';

/**
 * Hook for fetching a single idea by ID
 *
 * Uses React Query for caching and automatic refetching.
 * Handles not-found scenario separately from errors.
 *
 * @param id - The idea ID to fetch (optional)
 * @returns Object with idea, loading state, error, and isNotFound flag
 */
export function useIdea(id: string | undefined) {
  const query = useQuery({
    queryKey: ideaQueryKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const result = await ideaService.getIdeaById(id);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    idea: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    isNotFound: !query.isLoading && !!query.error && query.error.message === 'Idea not found',
  };
}
