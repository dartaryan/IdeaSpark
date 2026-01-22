import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ideaService } from '../../ideas/services/ideaService';
import { prdService } from '../services/prdService';
import { ideaQueryKeys } from '../../ideas/hooks/useSubmitIdea';
import { prdQueryKeys } from './queryKeys';
import type { Idea } from '../../ideas/types';
import type { PrdDocument } from '../types';

interface UsePrdBuilderReturn {
  idea: Idea | null;
  prd: PrdDocument | null;
  isLoading: boolean;
  error: Error | null;
  isIdeaNotFound: boolean;
  isIdeaNotApproved: boolean;
  isCreatingPrd: boolean;
}

export function usePrdBuilder(ideaId: string | undefined): UsePrdBuilderReturn {
  const queryClient = useQueryClient();

  // Fetch the idea
  const ideaQuery = useQuery({
    queryKey: ideaQueryKeys.detail(ideaId ?? ''),
    queryFn: async () => {
      if (!ideaId) return null;
      const result = await ideaService.getIdeaById(ideaId);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    enabled: !!ideaId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch existing PRD for this idea
  const prdQuery = useQuery({
    queryKey: prdQueryKeys.byIdea(ideaId ?? ''),
    queryFn: async () => {
      if (!ideaId) return null;
      const result = await prdService.getPrdByIdeaId(ideaId);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    enabled: !!ideaId && ideaQuery.data?.status === 'approved',
    staleTime: 30 * 1000, // 30 seconds - PRD may change frequently
  });

  // Mutation to create PRD
  const createPrdMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      const result = await prdService.createPrd(ideaId);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: (newPrd) => {
      // Update cache with new PRD
      queryClient.setQueryData(prdQueryKeys.byIdea(ideaId ?? ''), newPrd);
    },
  });

  // Auto-create PRD if idea is approved but no PRD exists
  useEffect(() => {
    const shouldCreatePrd =
      ideaId &&
      ideaQuery.data?.status === 'approved' &&
      !prdQuery.isLoading &&
      prdQuery.data === null &&
      !createPrdMutation.isPending &&
      !createPrdMutation.isSuccess;

    if (shouldCreatePrd) {
      createPrdMutation.mutate(ideaId);
    }
  }, [
    ideaId,
    ideaQuery.data?.status,
    prdQuery.isLoading,
    prdQuery.data,
    createPrdMutation,
  ]);

  const isIdeaNotFound = !ideaQuery.isLoading && !ideaQuery.error && ideaQuery.data === null;
  const isIdeaNotApproved = !!ideaQuery.data && ideaQuery.data.status !== 'approved';

  return {
    idea: ideaQuery.data ?? null,
    prd: prdQuery.data ?? createPrdMutation.data ?? null,
    isLoading: ideaQuery.isLoading || (prdQuery.isLoading && ideaQuery.data?.status === 'approved'),
    error: ideaQuery.error ?? prdQuery.error ?? createPrdMutation.error ?? null,
    isIdeaNotFound,
    isIdeaNotApproved,
    isCreatingPrd: createPrdMutation.isPending,
  };
}
