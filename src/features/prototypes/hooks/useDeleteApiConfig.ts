// src/features/prototypes/hooks/useDeleteApiConfig.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiConfigService } from '../services/apiConfigService';
import { prototypeKeys } from './usePrototype';

interface DeleteApiConfigInput {
  id: string;
  prototypeId: string;
}

/**
 * Hook to delete an API config.
 * Invalidates the apiConfigs query on success.
 *
 * @returns React Query mutation for deleting an API config
 */
export function useDeleteApiConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteApiConfigInput) => {
      const result = await apiConfigService.deleteApiConfig(id);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: prototypeKeys.apiConfigs(variables.prototypeId),
      });
    },
  });
}
