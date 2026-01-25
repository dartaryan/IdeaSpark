// src/features/prototypes/hooks/usePrototypes.ts

import { useQuery } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';
import { prototypeKeys } from './usePrototype';

export function usePrototypes(userId: string) {
  return useQuery({
    queryKey: prototypeKeys.list(userId),
    queryFn: async () => {
      const result = await prototypeService.getByUserId(userId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!userId,
  });
}
