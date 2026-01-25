import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { prdService } from '../services/prdService';
import type { PrdViewData } from '../types';

interface UsePrdViewOptions {
  prdId: string;
  redirectIfDraft?: boolean;
}

interface UsePrdViewResult {
  data: PrdViewData | null;
  isLoading: boolean;
  error: Error | null;
  isDraft: boolean;
}

export function usePrdView({ prdId, redirectIfDraft = true }: UsePrdViewOptions): UsePrdViewResult {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['prd', 'view', prdId],
    queryFn: async () => {
      const result = await prdService.getPrdWithIdea(prdId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!prdId,
  });

  const isDraft = data?.prd?.status === 'draft';

  // Redirect to builder if PRD is still draft
  useEffect(() => {
    if (redirectIfDraft && isDraft && data?.prd) {
      navigate(`/prd/build/${data.prd.idea_id}`, { replace: true });
    }
  }, [isDraft, redirectIfDraft, data, navigate]);

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null,
    isDraft,
  };
}
