import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import type { RegisterFormData } from '../schemas/authSchemas';

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: Omit<RegisterFormData, 'confirmPassword'>) => {
      const result = await authService.register(data.email, data.password);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('Account created successfully! Welcome to IdeaSpark.');
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed. Please try again.');
    },
  });
}
