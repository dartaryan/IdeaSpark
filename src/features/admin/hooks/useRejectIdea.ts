// src/features/admin/hooks/useRejectIdea.ts
// Task 6: Hook for rejecting ideas

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

interface RejectIdeaParams {
  ideaId: string;
  feedback: string;
}

/**
 * Hook for rejecting an idea with feedback
 * Subtask 6.2: Create useRejectIdea hook
 * Subtask 6.5: Update idea status in database
 * Subtask 6.6: Invalidate React Query cache
 * 
 * @returns Mutation for rejecting an idea
 */
export function useRejectIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ideaId, feedback }: RejectIdeaParams) => {
      // Subtask 6.5: Update idea status to 'rejected' with feedback
      const { data, error } = await supabase
        .from('ideas')
        .update({
          status: 'rejected',
          rejection_feedback: feedback,
        })
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
