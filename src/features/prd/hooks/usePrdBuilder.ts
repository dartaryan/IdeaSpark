import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { prdService } from '../services';
import { useAutoSave } from './useAutoSave';
import type { PrdContent, PrdSectionUpdate } from '../types';
import type { SaveStatus } from './useAutoSave';
import { useToast } from '../../../hooks/useToast';

interface UsePrdBuilderOptions {
  prdId: string;
  initialContent?: PrdContent;
}

export const prdBuilderQueryKeys = {
  prd: (id: string) => ['prd', id] as const,
};

export interface UsePrdBuilderReturn {
  prdContent: PrdContent;
  highlightedSections: Set<string>;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  saveError: string | null;
  isLoading: boolean;
  handleSectionUpdates: (updates: PrdSectionUpdate[]) => Promise<void>;
  setPrdContent: (content: PrdContent) => void;
  triggerSave: () => Promise<void>;
  clearSaveError: () => void;
}

export function usePrdBuilder({ prdId, initialContent }: UsePrdBuilderOptions): UsePrdBuilderReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Local state for optimistic updates
  const [prdContent, setPrdContent] = useState<PrdContent>(initialContent ?? {});
  const [highlightedSections, setHighlightedSections] = useState<Set<string>>(new Set());

  // Refs for highlight timeouts
  const highlightTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load PRD data on mount
  const { data: prdData, isLoading } = useQuery({
    queryKey: prdBuilderQueryKeys.prd(prdId),
    queryFn: async () => {
      const result = await prdService.getPrdById(prdId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prdId,
  });

  // Sync fetched data to local state (for restoration - AC3)
  useEffect(() => {
    if (prdData?.content) {
      setPrdContent(prdData.content);
    }
  }, [prdData]);

  // Save function for auto-save
  const savePrdContent = useCallback(
    async (content: PrdContent) => {
      const result = await prdService.updatePrd(prdId, { content });
      if (result.error) {
        throw new Error(result.error.message);
      }
      // Invalidate query to sync cache
      queryClient.invalidateQueries({ queryKey: prdBuilderQueryKeys.prd(prdId) });
    },
    [prdId, queryClient]
  );

  // Auto-save hook integration (AC1, AC2, AC5, AC7)
  const {
    saveStatus,
    lastSaved,
    error: saveError,
    triggerSave,
    clearError: clearSaveError,
  } = useAutoSave({
    data: prdContent,
    saveFunction: savePrdContent,
    debounceMs: 1000, // Save within 1 second per AC1
    savedDisplayMs: 3000, // Show "Saved" for 3 seconds per AC2
    enabled: !!prdId,
  });

  // Clear highlights after timeout
  const scheduleHighlightClear = useCallback((sectionKey: string) => {
    const existingTimeout = highlightTimeoutsRef.current.get(sectionKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      setHighlightedSections((prev) => {
        const next = new Set(prev);
        next.delete(sectionKey);
        return next;
      });
      highlightTimeoutsRef.current.delete(sectionKey);
    }, 2000);

    highlightTimeoutsRef.current.set(sectionKey, timeout);
  }, []);

  // Handle section updates from AI (triggers auto-save automatically via state change)
  const handleSectionUpdates = useCallback(
    async (updates: PrdSectionUpdate[]) => {
      if (!updates || updates.length === 0) return;

      for (const update of updates) {
        const { sectionKey, content, status } = update;

        // Optimistic update to local state (will trigger auto-save)
        setPrdContent((prev) => ({
          ...prev,
          [sectionKey]: {
            content,
            status,
          },
        }));

        // Add to highlighted sections
        setHighlightedSections((prev) => new Set([...prev, sectionKey]));
        scheduleHighlightClear(sectionKey);
      }
    },
    [scheduleHighlightClear]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      highlightTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // Handle save error with toast
  useEffect(() => {
    if (saveError) {
      toast({ type: 'error', message: `Auto-save failed: ${saveError}` });
    }
  }, [saveError, toast]);

  return {
    prdContent,
    highlightedSections,
    saveStatus,
    lastSaved,
    saveError,
    isLoading,
    handleSectionUpdates,
    setPrdContent,
    triggerSave, // Manual save capability (AC6)
    clearSaveError,
  };
}
