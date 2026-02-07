// src/features/prototypes/hooks/usePrototype.ts

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';
import type { PrototypeState } from '../types/prototypeState';
import { validateStateSchema } from '../types/prototypeState';

/** Status of saved state loading */
export type StateLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

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
  const query = useQuery({
    queryKey: prototypeKeys.detail(id),
    queryFn: async () => {
      const result = await prototypeService.getById(id);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });

  // Load saved prototype state (Story 8.3, Task 1)
  const [savedState, setSavedState] = useState<PrototypeState | null>(null);
  const [stateLoadStatus, setStateLoadStatus] = useState<StateLoadStatus>('idle');

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setStateLoadStatus('loading');

    prototypeService.getState(id).then((result) => {
      if (cancelled) return;

      if (result.error) {
        console.warn('Failed to load saved state:', result.error.message);
        setStateLoadStatus('error');
        return;
      }

      // Validate schema before trusting loaded state (Story 8.3 review fix H2)
      if (result.data && !validateStateSchema(result.data)) {
        console.warn('Loaded state failed schema validation, discarding');
        setSavedState(null);
        setStateLoadStatus('loaded');
        return;
      }

      setSavedState(result.data);
      setStateLoadStatus('loaded');
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  /** Clear local savedState (e.g., after reset). Does NOT touch database. */
  const clearSavedState = useCallback(() => {
    setSavedState(null);
  }, []);

  return {
    ...query,
    savedState,
    stateLoadStatus,
    clearSavedState,
  };
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
