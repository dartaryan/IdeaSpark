// src/features/admin/hooks/usePipelineIdeas.ts
// Hook for fetching pipeline ideas with React Query and real-time updates
// Story 5.3 - Task 5: Create usePipelineIdeas hook with React Query

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { adminService } from '../services/adminService';
import { supabase } from '../../../lib/supabase';
import type { PipelineIdeas } from '../types';

/**
 * Subtask 5.1: Create usePipelineIdeas.ts in features/admin/hooks/
 * Subtask 5.2: Implement React Query with query key: ['admin', 'pipeline']
 * Subtask 5.3: Add refetch interval (10 seconds) for real-time feel
 * Subtask 5.4: Enable refetchOnWindowFocus for immediate updates
 * Subtask 5.5: Handle loading, error, and empty states
 * Subtask 5.6: Return grouped ideas by status
 */
export function usePipelineIdeas() {
  const queryClient = useQueryClient();

  // Subtask 5.2: React Query with query key
  const query = useQuery<PipelineIdeas>({
    queryKey: ['admin', 'pipeline'],
    queryFn: async () => {
      const result = await adminService.getIdeasByPipeline();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.data!;
    },
    // Subtask 5.3: Refetch interval for real-time feel
    refetchInterval: 10000, // 10 seconds
    // Subtask 5.4: Refetch on window focus
    refetchOnWindowFocus: true,
  });

  // Task 6: Implement real-time visual updates
  // Subtask 6.1-6.3: Supabase real-time subscription
  useEffect(() => {
    // Subtask 6.1: Create channel for real-time subscription
    const channel = supabase
      .channel('ideas-changes')
      // Subtask 6.2: Listen for INSERT, UPDATE, DELETE events on ideas table
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideas' },
        () => {
          // Subtask 6.3: Invalidate React Query cache on real-time event
          queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Subtask 5.5 & 5.6: Return query state and grouped ideas
  return query;
}
