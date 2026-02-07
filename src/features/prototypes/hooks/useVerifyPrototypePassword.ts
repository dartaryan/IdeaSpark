// src/features/prototypes/hooks/useVerifyPrototypePassword.ts

import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

interface VerifyPasswordInput {
  shareId: string;
  password: string;
}

interface VerifyPasswordResult {
  verified: boolean;
}

/**
 * Hook to verify a password for a protected public prototype.
 * Calls the verify-prototype-password Edge Function for server-side verification.
 *
 * @returns React Query mutation for password verification
 */
export function useVerifyPrototypePassword() {
  return useMutation({
    mutationFn: async ({ shareId, password }: VerifyPasswordInput): Promise<VerifyPasswordResult> => {
      const { data, error } = await supabase.functions.invoke('verify-prototype-password', {
        body: { shareId, password },
      });

      if (error) {
        // Check for rate limiting
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          throw new Error('Too many attempts. Please try again in a few minutes.');
        }
        throw new Error('Authentication error. Please try again.');
      }

      return data as VerifyPasswordResult;
    },
  });
}
