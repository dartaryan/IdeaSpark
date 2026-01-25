import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prdService } from '../services/prdService';

export function useCompletePrd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prdId: string) => prdService.completePrd(prdId),
    onSuccess: (result, prdId) => {
      if (result.data) {
        // Invalidate PRD queries
        queryClient.invalidateQueries({ queryKey: ['prd', prdId] });
        queryClient.invalidateQueries({ queryKey: ['prds'] });

        // Invalidate idea queries (status changed)
        queryClient.invalidateQueries({ queryKey: ['ideas'] });
        queryClient.invalidateQueries({
          queryKey: ['idea', result.data.prd.idea_id],
        });
      }
    },
    onError: (error) => {
      console.error('Failed to complete PRD:', error);
    },
  });
}
