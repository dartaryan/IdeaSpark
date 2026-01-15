import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export interface UseSessionOptions {
  onSessionExpired?: () => void;
  onTokenRefreshed?: () => void;
  onSignedOut?: () => void;
}

export interface UseSessionReturn {
  /** Last time the token was refreshed */
  lastRefreshTime: Date | null;
  /** Check if session is still valid */
  isSessionValid: () => Promise<boolean>;
  /** Manually refresh the session */
  refreshSession: () => Promise<Session | null>;
}

/**
 * Hook for monitoring session state changes
 * Useful for detecting token refresh, session expiry, and sign out events
 */
export function useSession(options: UseSessionOptions = {}): UseSessionReturn {
  const { onSessionExpired, onTokenRefreshed, onSignedOut } = options;
  
  // Track last refresh time
  const lastRefreshTimeRef = useRef<Date | null>(null);
  
  // Track if we had a valid session (to detect expiry vs never logged in)
  const hadSessionRef = useRef(false);

  useEffect(() => {
    // Check initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        hadSessionRef.current = true;
        lastRefreshTimeRef.current = new Date();
      }
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      switch (event) {
        case 'TOKEN_REFRESHED':
          lastRefreshTimeRef.current = new Date();
          onTokenRefreshed?.();
          break;
          
        case 'SIGNED_OUT':
          // Only trigger session expired if we previously had a session
          // and this wasn't a user-initiated logout (which would be handled by useAuth)
          if (hadSessionRef.current) {
            onSignedOut?.();
          }
          hadSessionRef.current = false;
          break;
          
        case 'SIGNED_IN':
          hadSessionRef.current = true;
          lastRefreshTimeRef.current = new Date();
          break;
          
        case 'USER_DELETED':
          hadSessionRef.current = false;
          onSessionExpired?.();
          break;
      }
      
      // Update session tracking
      if (session) {
        hadSessionRef.current = true;
      }
    });

    return () => subscription.unsubscribe();
  }, [onSessionExpired, onTokenRefreshed, onSignedOut]);

  const isSessionValid = useCallback(async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
  }, []);

  const refreshSession = useCallback(async (): Promise<Session | null> => {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Failed to refresh session:', error);
      return null;
    }
    if (session) {
      lastRefreshTimeRef.current = new Date();
    }
    return session;
  }, []);

  return {
    lastRefreshTime: lastRefreshTimeRef.current,
    isSessionValid,
    refreshSession,
  };
}
