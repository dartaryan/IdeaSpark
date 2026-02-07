// src/features/prototypes/hooks/useUpdateApiConfig.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiConfigService } from '../services/apiConfigService';
import { prototypeKeys } from './usePrototype';
import type { UpdateApiConfigInput } from '../types';

interface UpdateApiConfigMutationInput {
  id: string;
  prototypeId: string;
  input: UpdateApiConfigInput;
}

/**
 * Hook to update an existing API config.
 * Invalidates the apiConfigs query on success.
 *
 * @returns React Query mutation for updating an API config
 */
export function useUpdateApiConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: UpdateApiConfigMutationInput) => {
      const result = await apiConfigService.updateApiConfig(id, input);
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
