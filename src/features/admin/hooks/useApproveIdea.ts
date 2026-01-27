// src/features/admin/hooks/useApproveIdea.ts
// Task 6: Hook for approving ideas

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

/**
 * Hook for approving an idea
 * Subtask 6.1: Create useApproveIdea hook
 * Subtask 6.5: Update idea status in database
 * Subtask 6.6: Invalidate React Query cache
 * 
 * @returns Mutation for approving an idea
 */
export function useApproveIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ideaId: string) => {
      // Subtask 6.5: Update idea status to 'approved'
      const { data, error } = await supabase
        .from('ideas')
        .update({ status: 'approved' })
        .eq('id', ideaId);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },

    onSuccess: () => {
      // Subtask 6.6: Invalidate cache to refetch ideas list
      queryClient.invalidateQueries({ queryKey: ['admin', 'ideas'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}
