// src/features/prototypes/hooks/useApiConfigs.ts

import { useQuery } from '@tanstack/react-query';
import { apiConfigService } from '../services/apiConfigService';
import { prototypeKeys } from './usePrototype';

/**
 * Hook to fetch all API configs for a prototype.
 *
 * @param prototypeId - The prototype ID to fetch configs for
 * @returns React Query result with ApiConfig[]
 */
export function useApiConfigs(prototypeId: string) {
  return useQuery({
    queryKey: prototypeKeys.apiConfigs(prototypeId),
    queryFn: async () => {
      const result = await apiConfigService.getApiConfigs(prototypeId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!prototypeId,
  });
}
