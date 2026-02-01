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
    // Store session reference for timeout fallback
    let currentSession: Session | null = null;
    console.log('[useAuth] Starting session check...');
    
    // Helper to create fallback user from session when database fetch fails/times out
    const createFallbackUser = (session: Session): User => ({
      id: session.user.id,
      email: session.user.email!,
      role: 'user' as const,
      created_at: session.user.created_at!,
      updated_at: session.user.created_at!,
    });

    // Helper to fetch user with timeout
    const fetchUserWithTimeout = async (session: Session): Promise<User | null> => {
      return new Promise((resolve) => {
        const fetchTimeout = setTimeout(() => {
          console.warn('[useAuth] User fetch timed out, using fallback');
          resolve(createFallbackUser(session));
        }, 5000); // 5 second timeout for user fetch

        authService.getCurrentUser()
          .then((user) => {
            clearTimeout(fetchTimeout);
            resolve(user || createFallbackUser(session));
          })
          .catch((error) => {
            clearTimeout(fetchTimeout);
            if (error instanceof Error && error.name === 'AbortError') {
              console.warn('[useAuth] Request aborted, using fallback');
            } else {
              console.error('[useAuth] Failed to get current user:', error);
            }
            resolve(createFallbackUser(session));
          });
      });
    };
    
    // Subscribe to auth changes FIRST - this ensures we catch login events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (!isMounted) return;
      
      // Clear main timeout since auth state changed
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Store session for potential timeout fallback
      currentSession = session;
      
      console.log('[useAuth] Auth state changed:', event, session ? 'has session' : 'no session');
      console.log('[useAuth] Event details:', { 
        event, 
        hasSession: !!session, 
        userId: session?.user?.id,
        expiresAt: session?.expires_at,
        stack: new Error().stack 
      });
      
      if (session?.user) {
        const user = await fetchUserWithTimeout(session);
        if (!isMounted) return;
        setState((prev) => ({
          ...prev,
          user,
          authUser: session.user,
          session,
          isLoading: false,
        }));
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
        
        // Store session for potential timeout fallback
        currentSession = session;
        
        console.log('[useAuth] Got session result:', session ? 'has session' : 'no session');
        if (session?.user) {
          console.log('[useAuth] Fetching user data...');
          const user = await fetchUserWithTimeout(session);
          if (!isMounted) return;
          console.log('[useAuth] Got user:', user ? 'success' : 'null');
          setState((prev) => ({
            ...prev,
            user,
            authUser: session.user,
            session,
            isLoading: false,
          }));
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
    
    // Add timeout as ultimate fallback to prevent infinite loading
    // If we have a session but couldn't fetch user, use session data as fallback
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[useAuth] Session check timed out after 10s');
        if (currentSession?.user) {
          console.log('[useAuth] Using session fallback for user data');
          const fallbackUser = createFallbackUser(currentSession);
          setState((prev) => ({
            ...prev,
            user: fallbackUser,
            authUser: currentSession!.user,
            session: currentSession,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
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
