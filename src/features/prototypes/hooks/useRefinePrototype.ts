// src/features/prototypes/hooks/useRefinePrototype.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { openLovableService } from '../../../services/openLovableService';
import { prototypeKeys } from './usePrototype';

interface RefinePrototypeInput {
  prototypeId: string;
  refinementPrompt: string;
}

export function useRefinePrototype() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prototypeId, refinementPrompt }: RefinePrototypeInput) => {
      // Start refinement
      const refineResult = await openLovableService.refine(prototypeId, refinementPrompt);
      if (refineResult.error) throw new Error(refineResult.error.message);

      const newPrototypeId = refineResult.data!.prototypeId;

      // Poll for completion
      const pollResult = await openLovableService.pollStatus(newPrototypeId);
      if (pollResult.error) throw new Error(pollResult.error.message);

      if (pollResult.data!.status === 'failed') {
        throw new Error('Refinement failed. Please try again.');
      }

      return {
        prototypeId: newPrototypeId,
        status: pollResult.data!.status,
        url: pollResult.data!.url,
        code: pollResult.data!.code,
      };
    },
    onSuccess: (data, variables) => {
      // Invalidate prototype queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: prototypeKeys.detail(variables.prototypeId) });
      queryClient.invalidateQueries({ queryKey: prototypeKeys.all });
    },
  });
}
