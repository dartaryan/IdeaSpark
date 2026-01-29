// src/features/admin/hooks/useRejectIdea.ts
// Story 5.5 - Task 3: Hook for rejecting ideas with optimistic updates

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { useToast } from '../../../hooks/useToast';

interface RejectIdeaParams {
  ideaId: string;
  feedback: string;
}

/**
 * Hook for rejecting an idea with constructive feedback
 * Story 5.5 - Task 3: Create useRejectIdea React Query mutation hook
 * Subtask 3.1: Create useRejectIdea.ts in features/admin/hooks/
 * Subtask 3.2: Implement useMutation with rejectIdea service function
 * Subtask 3.3: Add onMutate for optimistic UI updates
 * Subtask 3.4: Invalidate relevant React Query caches
 * Subtask 3.5: Show success toast notification on completion
 * Subtask 3.6: Handle errors with rollback and error toast
 * 
 * @returns Mutation for rejecting an idea with optimistic updates
 */
export function useRejectIdea() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    // Subtask 3.2: Use adminService.rejectIdea service function
    mutationFn: async ({ ideaId, feedback }: RejectIdeaParams) => {
      const result = await adminService.rejectIdea(ideaId, feedback);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.data;
    },

    // Subtask 3.3: Add onMutate for optimistic UI updates
    onMutate: async ({ ideaId, feedback }: RejectIdeaParams) => {
      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['admin', 'ideas'] });
      await queryClient.cancelQueries({ queryKey: ['admin', 'pipeline'] });

      // Snapshot previous values for rollback
      const previousIdeas = queryClient.getQueryData(['admin', 'ideas']);
      const previousPipeline = queryClient.getQueryData(['admin', 'pipeline']);

      // Optimistically update admin ideas list
      queryClient.setQueryData(['admin', 'ideas'], (old: any) => {
        if (!old) return old;
        return old.map((idea: any) =>
          idea.id === ideaId
            ? { 
                ...idea, 
                status: 'rejected', 
                rejection_feedback: feedback,
                rejected_at: new Date().toISOString(),
                status_updated_at: new Date().toISOString() 
              }
            : idea
        );
      });

      // Optimistically update pipeline view - remove from submitted column
      // (rejected ideas don't appear in pipeline view)
      queryClient.setQueryData(['admin', 'pipeline'], (old: any) => {
        if (!old) return old;
        
        // Remove from submitted column (rejected ideas exit the pipeline)
        return {
          ...old,
          submitted: old.submitted?.filter((idea: any) => idea.id !== ideaId) || [],
        };
      });

      return { previousIdeas, previousPipeline };
    },

    // Subtask 3.6: Handle errors with rollback and error toast
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousIdeas) {
        queryClient.setQueryData(['admin', 'ideas'], context.previousIdeas);
      }
      if (context?.previousPipeline) {
        queryClient.setQueryData(['admin', 'pipeline'], context.previousPipeline);
      }

      // Show error toast
      toast({
        title: error.message || 'Failed to reject idea. Please try again.',
        variant: 'error',
      });
      console.error('Rejection error:', error);
    },

    // Subtask 3.4 & 3.5: Invalidate caches and show success toast
    onSuccess: () => {
      // Invalidate all related queries to trigger refetches
      queryClient.invalidateQueries({ queryKey: ['admin', 'ideas'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
      // Also invalidate user's ideas list so they see the rejection
      queryClient.invalidateQueries({ queryKey: ['ideas', 'list'] });

      // Show success toast
      toast({
        title: 'Idea rejected with feedback sent.',
        variant: 'success',
      });
    },
  });
}
