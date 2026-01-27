// src/features/admin/hooks/useApproveIdea.ts
// Task 2: Hook for approving ideas with optimistic updates

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { useToast } from '../../../hooks/useToast';

/**
 * Hook for approving an idea for PRD development
 * Task 2: Create useApproveIdea React Query mutation hook
 * Subtask 2.1: Create useApproveIdea.ts in features/admin/hooks/
 * Subtask 2.2: Implement useMutation with approveIdea service function
 * Subtask 2.3: Add onMutate for optimistic UI updates
 * Subtask 2.4: Invalidate relevant React Query caches
 * Subtask 2.5: Show success toast notification on completion
 * Subtask 2.6: Handle errors with rollback and error toast
 * 
 * @returns Mutation for approving an idea with optimistic updates
 */
export function useApproveIdea() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    // Subtask 2.2: Use adminService.approveIdea service function
    mutationFn: async (ideaId: string) => {
      const result = await adminService.approveIdea(ideaId);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.data;
    },

    // Subtask 2.3: Add onMutate for optimistic UI updates
    onMutate: async (ideaId: string) => {
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
            ? { ...idea, status: 'approved', status_updated_at: new Date().toISOString() }
            : idea
        );
      });

      // Optimistically update pipeline view
      queryClient.setQueryData(['admin', 'pipeline'], (old: any) => {
        if (!old) return old;
        
        // Find idea in submitted column
        const ideaToMove = old.submitted?.find((idea: any) => idea.id === ideaId);
        if (!ideaToMove) return old;

        // Move from submitted to approved column
        return {
          ...old,
          submitted: old.submitted.filter((idea: any) => idea.id !== ideaId),
          approved: [
            { ...ideaToMove, status: 'approved', status_updated_at: new Date().toISOString() },
            ...(old.approved || []),
          ],
        };
      });

      return { previousIdeas, previousPipeline };
    },

    // Subtask 2.6: Handle errors with rollback and error toast
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousIdeas) {
        queryClient.setQueryData(['admin', 'ideas'], context.previousIdeas);
      }
      if (context?.previousPipeline) {
        queryClient.setQueryData(['admin', 'pipeline'], context.previousPipeline);
      }

      // Show error toast
      toast.error('Failed to approve idea. Please try again.');
      console.error('Approval error:', error);
    },

    // Subtask 2.4 & 2.5: Invalidate caches and show success toast
    onSuccess: () => {
      // Invalidate all related queries to trigger refetches
      queryClient.invalidateQueries({ queryKey: ['admin', 'ideas'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });

      // Show success toast
      toast.success('Idea approved successfully!');
    },
  });
}
