// src/features/prototypes/hooks/usePrototype.ts

import { useQuery } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';

export const prototypeKeys = {
  all: ['prototypes'] as const,
  lists: () => [...prototypeKeys.all, 'list'] as const,
  list: (userId: string) => [...prototypeKeys.lists(), userId] as const,
  details: () => [...prototypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...prototypeKeys.details(), id] as const,
  byPrd: (prdId: string) => [...prototypeKeys.all, 'prd', prdId] as const,
  latestByPrd: (prdId: string) => [...prototypeKeys.all, 'prd', prdId, 'latest'] as const,
  versionHistory: (prdId: string) => [...prototypeKeys.all, 'prd', prdId, 'history'] as const,
};

export function usePrototype(id: string) {
  return useQuery({
    queryKey: prototypeKeys.detail(id),
    queryFn: async () => {
      const result = await prototypeService.getById(id);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function usePrototypesByPrd(prdId: string) {
  return useQuery({
    queryKey: prototypeKeys.byPrd(prdId),
    queryFn: async () => {
      const result = await prototypeService.getByPrdId(prdId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prdId,
  });
}

export function useLatestPrototype(prdId: string) {
  return useQuery({
    queryKey: prototypeKeys.latestByPrd(prdId),
    queryFn: async () => {
      const result = await prototypeService.getLatestVersion(prdId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prdId,
  });
}

export function useVersionHistory(prdId: string) {
  return useQuery({
    queryKey: prototypeKeys.versionHistory(prdId),
    queryFn: async () => {
      const result = await prototypeService.getVersionHistory(prdId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prdId,
  });
}
