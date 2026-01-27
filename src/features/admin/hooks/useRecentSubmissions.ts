// src/features/admin/hooks/useRecentSubmissions.ts
// Hook for fetching recent submitted ideas

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import type { RecentSubmission } from '../types';

interface UseRecentSubmissionsResult {
  data: RecentSubmission[] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch the last 10 ideas with status="submitted"
 * Ordered by created_at DESC (most recent first)
 * 
 * @returns Recent submissions data, loading state, and error state
 */
export function useRecentSubmissions(): UseRecentSubmissionsResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'recent-submissions'],
    
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          id,
          title,
          created_at,
          users!inner(email)
        `)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform data to match RecentSubmission type
      return (
        data?.map((idea) => ({
          id: idea.id,
          title: idea.title,
          submitter_name: idea.users?.email ?? 'Unknown',
          created_at: idea.created_at,
        })) ?? []
      );
    },
    
    // Refetch every 60 seconds
    refetchInterval: 60000,
    
    // Refetch on window focus
    refetchOnWindowFocus: true,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null,
  };
}
