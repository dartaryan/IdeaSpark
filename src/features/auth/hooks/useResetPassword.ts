import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ResetPasswordState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export function useResetPassword() {
  const [state, setState] = useState<ResetPasswordState>({
    isLoading: false,
    isSuccess: false,
    error: null,
  });
  const navigate = useNavigate();

  const updatePassword = useCallback(async (newPassword: string) => {
    setState({ isLoading: true, isSuccess: false, error: null });

    try {
      const result = await authService.updatePassword(newPassword);

      if (result.error) {
        setState({
          isLoading: false,
          isSuccess: false,
          error: result.error.message,
        });
        return;
      }

      setState({ isLoading: false, isSuccess: true, error: null });

      // Redirect to login with success message
      navigate('/login?reset=success');
    } catch (error) {
      console.error('Password update error:', error);
      setState({
        isLoading: false,
        isSuccess: false,
        error: 'An unexpected error occurred. Please try again.',
      });
    }
  }, [navigate]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    updatePassword,
    clearError,
  };
}
