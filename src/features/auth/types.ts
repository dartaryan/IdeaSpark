// Auth feature types
// Re-export User from database types for consistency
import type { User } from '../../types/database';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

export type { User };

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
}

export interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  setSessionExpired: (expired: boolean) => void;
  clearSessionExpired: () => void;
}

/** Auth state change events from Supabase */
export type AuthEvent = AuthChangeEvent;

/** Session expiry state */
export interface SessionState {
  isExpired: boolean;
  lastRefreshTime: Date | null;
}
