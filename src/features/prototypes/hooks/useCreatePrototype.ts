// src/features/prototypes/hooks/useCreatePrototype.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';
import { prototypeKeys } from './usePrototype';
import type { CreatePrototypeInput, CreateVersionInput, UpdatePrototypeInput, PrototypeStatus } from '../types';

export function useCreatePrototype() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePrototypeInput) => {
      const result = await prototypeService.create(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: prototypeKeys.byPrd(data.prdId) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.lists() });
      }
    },
  });
}

export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVersionInput) => {
      const result = await prototypeService.createVersion(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: prototypeKeys.byPrd(data.prdId) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.latestByPrd(data.prdId) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.versionHistory(data.prdId) });
      }
    },
  });
}

export function useUpdatePrototype() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdatePrototypeInput }) => {
      const result = await prototypeService.update(id, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: prototypeKeys.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.byPrd(data.prdId) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.latestByPrd(data.prdId) });
      }
    },
  });
}

export function useUpdatePrototypeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PrototypeStatus }) => {
      const result = await prototypeService.updateStatus(id, status);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: prototypeKeys.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.byPrd(data.prdId) });
      }
    },
  });
}
