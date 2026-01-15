import { useState, useCallback } from 'react';
import { authService } from '../services/authService';

interface ForgotPasswordState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export function useForgotPassword() {
  const [state, setState] = useState<ForgotPasswordState>({
    isLoading: false,
    isSuccess: false,
    error: null,
  });

  const requestReset = useCallback(async (email: string) => {
    setState({ isLoading: true, isSuccess: false, error: null });

    try {
      await authService.requestPasswordReset(email);

      // Always show success regardless of whether email exists
      // This is a security best practice to prevent email enumeration
      setState({ isLoading: false, isSuccess: true, error: null });
    } catch (error) {
      // Even on error, show success to prevent enumeration
      console.error('Password reset error:', error);
      setState({ isLoading: false, isSuccess: true, error: null });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, isSuccess: false, error: null });
  }, []);

  return {
    ...state,
    requestReset,
    reset,
  };
}
