import { supabase } from '../../../lib/supabase';
import type { User } from '../../../types/database';

export type ServiceResponse<T> = {
  data: T | null;
  error: { message: string; code: string } | null;
};

export const authService = {
  async register(email: string, password: string): Promise<ServiceResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          return {
            data: null,
            error: { message: 'This email is already registered', code: 'AUTH_EMAIL_EXISTS' },
          };
        }
        return {
          data: null,
          error: { message: error.message, code: 'AUTH_ERROR' },
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: { message: 'Registration failed', code: 'AUTH_NO_USER' },
        };
      }

      // Fetch the user record from public.users (created by trigger)
      // Small delay to ensure trigger has completed
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        console.error('Failed to fetch user record:', userError);
        // User was created in auth, but public.users fetch failed
        // Return basic user data from auth
        return {
          data: {
            id: data.user.id,
            email: data.user.email!,
            role: 'user' as const,
            created_at: data.user.created_at!,
            updated_at: data.user.created_at!,
          },
          error: null,
        };
      }

      return { data: userData, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        data: null,
        error: { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  async login(email: string, password: string): Promise<ServiceResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Supabase returns generic error for invalid credentials
        // Map to user-friendly message
        if (error.message.includes('Invalid login credentials')) {
          return {
            data: null,
            error: { message: 'Invalid email or password', code: 'AUTH_INVALID_CREDENTIALS' },
          };
        }
        return {
          data: null,
          error: { message: error.message, code: 'AUTH_ERROR' },
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: { message: 'Login failed', code: 'AUTH_NO_USER' },
        };
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        return {
          data: null,
          error: { message: 'Failed to fetch user data', code: 'USER_FETCH_ERROR' },
        };
      }

      return { data: userData, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return {
        data: null,
        error: { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  async signOut(): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        // Still return success - local session should be cleared regardless
        // This allows graceful degradation when network is unavailable
      }
      return { data: null, error: null };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Graceful handling - return success to allow local state clearing
      return { data: null, error: null };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return data;
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
};
