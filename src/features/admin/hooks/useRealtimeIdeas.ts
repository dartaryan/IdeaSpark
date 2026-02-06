// src/features/admin/hooks/useRealtimeIdeas.ts
// Story 5.8 - Task 1: Set up Supabase Realtime subscription for ideas table

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook for subscribing to real-time updates on the ideas table
 * Story 5.8 - Task 1: Set up Supabase Realtime subscription (AC: Dashboard updates within 500ms)
 * 
 * Subtasks implemented:
 * - 1.1: Create useRealtimeIdeas hook in features/admin/hooks/
 * - 1.2: Subscribe to Supabase Realtime channel for 'ideas' table
 * - 1.3: Listen for INSERT, UPDATE, DELETE events on ideas table
 * - 1.4: Invalidate React Query cache on realtime events
 * - 1.5: Handle subscription cleanup on component unmount
 * - 1.6: Add error handling for subscription failures
 * 
 * @returns Connection status and error state
 */
export function useRealtimeIdeas() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel;

    try {
      // Subtask 1.2: Subscribe to Supabase Realtime channel for 'ideas' table
      channel = supabase
        .channel('ideas-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Subtask 1.3: Listen for INSERT, UPDATE, DELETE events
            schema: 'public',
            table: 'ideas',
          },
          (payload) => {
            // Subtask 1.4: Invalidate React Query cache on realtime events
            // Invalidate all admin queries that depend on ideas data
            queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'recent-ideas'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'ideas'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
          }
        )
        .subscribe((status, err) => {
          // Subtask 1.6: Add error handling for subscription failures
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setError(null);
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            setError(err?.message || 'Failed to connect to live updates');
            console.error('[Realtime] Subscription error:', err);
          } else if (status === 'TIMED_OUT') {
            setIsConnected(false);
            setError('Connection timed out');
            console.error('[Realtime] Subscription timed out');
          } else if (status === 'CLOSED') {
            setIsConnected(false);
          }
        });

    } catch (err) {
      console.error('[Realtime] Failed to create subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
    }

    // Subtask 1.5: Handle subscription cleanup on component unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  return { isConnected, error };
}
