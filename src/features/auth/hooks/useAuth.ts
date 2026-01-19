import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import type { User as AuthUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { User } from '../../../types/database';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  authUser: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  sessionExpired: boolean;
}

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Track if logout was user-initiated to distinguish from session expiry
  const isUserInitiatedLogout = useRef(false);
  
  const [state, setState] = useState<AuthState>({
    user: null,
    authUser: null,
    session: null,
    isLoading: true,
    sessionExpired: false,
  });

  const setSessionExpired = useCallback((expired: boolean) => {
    setState((prev) => ({ ...prev, sessionExpired: expired }));
  }, []);

  const clearSessionExpired = useCallback(() => {
    setState((prev) => ({ ...prev, sessionExpired: false }));
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    console.log('[useAuth] Starting session check...');
    
    // Subscribe to auth changes FIRST - this ensures we catch login events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (!isMounted) return;
      
      // Clear timeout since auth state changed
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      console.log('[useAuth] Auth state changed:', event, session ? 'has session' : 'no session');
      
      if (session?.user) {
        try {
          const user = await authService.getCurrentUser();
          if (!isMounted) return;
          setState((prev) => ({
            ...prev,
            user,
            authUser: session.user,
            session,
            isLoading: false,
          }));
        } catch (error) {
          // Handle abort errors gracefully
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('[useAuth] Request aborted, likely due to component unmount');
            return;
          }
          console.error('[useAuth] Failed to get current user:', error);
          if (isMounted) setState((prev) => ({ ...prev, isLoading: false }));
        }
      } else {
        // Session ended - determine if it was user-initiated or expired
        const wasUserInitiated = isUserInitiatedLogout.current;
        isUserInitiatedLogout.current = false; // Reset flag
        
        setState((prev) => ({
          user: null,
          authUser: null,
          session: null,
          isLoading: false,
          // Mark as expired only if it wasn't user-initiated and we had a previous session
          sessionExpired: !wasUserInitiated && prev.session !== null && event === 'SIGNED_OUT',
        }));
      }
    });

    // Get initial session
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (!isMounted) return;
        
        console.log('[useAuth] Got session result:', session ? 'has session' : 'no session');
        if (session?.user) {
          try {
            console.log('[useAuth] Fetching user data...');
            const user = await authService.getCurrentUser();
            if (!isMounted) return;
            console.log('[useAuth] Got user:', user ? 'success' : 'null');
            setState((prev) => ({
              ...prev,
              user,
              authUser: session.user,
              session,
              isLoading: false,
            }));
          } catch (error) {
            // Handle abort errors gracefully
            if (error instanceof Error && error.name === 'AbortError') {
              console.warn('[useAuth] Request aborted, likely due to component unmount');
              return;
            }
            console.error('[useAuth] Failed to get current user:', error);
            if (isMounted) setState((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          console.log('[useAuth] No session, setting isLoading to false');
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      })
      .catch((error) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        // Handle abort errors gracefully
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('[useAuth] Session check aborted, likely due to component unmount');
          return;
        }
        console.error('[useAuth] Failed to get session:', error);
        if (isMounted) setState((prev) => ({ ...prev, isLoading: false }));
      });
    
    // Add timeout as fallback to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[useAuth] Session check timed out after 10s');
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }, 10000);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    // Mark as user-initiated logout
    isUserInitiatedLogout.current = true;
    
    // Sign out from Supabase
    await authService.signOut();
    
    // Clear React Query cache to remove any cached user data
    queryClient.clear();
    
    // Update local state immediately
    setState({
      user: null,
      authUser: null,
      session: null,
      isLoading: false,
      sessionExpired: false,
    });
    
    // Navigate to login page
    navigate('/login');
  }, [navigate, queryClient]);

  // Keep signOut as alias for backward compatibility
  const signOut = logout;

  return {
    ...state,
    isAuthenticated: !!state.user,
    logout,
    signOut,
    setSessionExpired,
    clearSessionExpired,
  };
}
