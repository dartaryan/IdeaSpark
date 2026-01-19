import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

// Custom lock function to prevent AbortError conflicts with React StrictMode
// The default navigator.locks can cause issues when effects run twice in development
const customLock = async <R>(
  _name: string,
  acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => {
  // Simple implementation that doesn't use navigator.locks
  // This avoids AbortError issues while still working correctly
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Lock timeout')), acquireTimeout);
  });
  return Promise.race([fn(), timeoutPromise]);
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    lock: customLock,
  },
});

// Export typed client for type inference
export type SupabaseClient = typeof supabase;
