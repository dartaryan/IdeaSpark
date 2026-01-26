// src/features/prototypes/hooks/useSharePrototype.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';
import { prototypeKeys } from './usePrototype';

interface SharePrototypeInput {
  prototypeId: string;
  prdId: string;
}

/**
 * Hook to generate a shareable public link for a prototype
 * Copies the URL to clipboard on success
 *
 * @returns React Query mutation for share link generation
 */
export function useSharePrototype() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prototypeId }: SharePrototypeInput) => {
      const result = await prototypeService.generateShareLink(prototypeId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: async (shareUrl, variables) => {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (err) {
        console.warn('Failed to copy to clipboard:', err);
      }

      // Invalidate prototype queries to refresh share status
      queryClient.invalidateQueries({ 
        queryKey: prototypeKeys.versionHistory(variables.prdId) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: prototypeKeys.detail(variables.prototypeId) 
      });
    },
  });
}
