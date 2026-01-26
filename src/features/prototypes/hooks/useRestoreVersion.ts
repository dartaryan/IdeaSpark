// src/features/prototypes/hooks/useRestoreVersion.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';
import { prototypeKeys } from './usePrototype';

interface RestoreVersionInput {
  prototypeId: string;
  prdId: string;
}

/**
 * Hook to restore a previous prototype version
 * Creates a new version copying code/url from selected version
 *
 * @returns React Query mutation for version restoration
 */
export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prototypeId }: RestoreVersionInput) => {
      const result = await prototypeService.restore(prototypeId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data, variables) => {
      // Invalidate version history to refetch
      queryClient.invalidateQueries({ 
        queryKey: prototypeKeys.versionHistory(variables.prdId) 
      });
      
      // Invalidate prototypes by PRD
      queryClient.invalidateQueries({ 
        queryKey: prototypeKeys.byPrd(variables.prdId) 
      });

      // Invalidate latest prototype
      queryClient.invalidateQueries({ 
        queryKey: prototypeKeys.latestByPrd(variables.prdId) 
      });

      // Invalidate all prototypes list
      queryClient.invalidateQueries({ 
        queryKey: prototypeKeys.all 
      });
    },
  });
}
