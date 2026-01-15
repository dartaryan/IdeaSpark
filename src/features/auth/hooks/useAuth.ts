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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        authService.getCurrentUser().then((user) => {
          setState((prev) => ({
            ...prev,
            user,
            authUser: session.user,
            session,
            isLoading: false,
          }));
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (session?.user) {
        const user = await authService.getCurrentUser();
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

    return () => subscription.unsubscribe();
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
