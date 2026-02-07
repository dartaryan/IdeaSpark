// src/features/prototypes/hooks/useCreateApiConfig.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiConfigService } from '../services/apiConfigService';
import { prototypeKeys } from './usePrototype';
import type { CreateApiConfigInput } from '../types';

/**
 * Hook to create a new API config for a prototype.
 * Invalidates the apiConfigs query on success.
 *
 * @returns React Query mutation for creating an API config
 */
export function useCreateApiConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateApiConfigInput) => {
      const result = await apiConfigService.createApiConfig(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: prototypeKeys.apiConfigs(variables.prototypeId),
      });
    },
  });
}
