import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { useRedirectAfterLogin } from '../../../hooks/useRedirectAfterLogin';
import type { LoginFormData } from '../schemas/authSchemas';

export function useLogin() {
  const { redirectToStoredOrDefault } = useRedirectAfterLogin();

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const result = await authService.login(data.email, data.password);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('Welcome back to IdeaSpark!');
      // Redirect to stored URL (deep linking) or default to dashboard
      redirectToStoredOrDefault();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed. Please try again.');
    },
  });
}
