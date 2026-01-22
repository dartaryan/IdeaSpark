import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prdService } from '../services';
import type { PrdContent, PrdSectionStatus, PrdSectionUpdate } from '../types';
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
  isSaving: boolean;
  lastSaved: Date | null;
  isLoading: boolean;
  handleSectionUpdates: (updates: PrdSectionUpdate[]) => Promise<void>;
  setPrdContent: (content: PrdContent) => void;
}

export function usePrdBuilder({ prdId, initialContent }: UsePrdBuilderOptions): UsePrdBuilderReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Local state for optimistic updates
  const [prdContent, setPrdContent] = useState<PrdContent>(initialContent ?? {});
  const [highlightedSections, setHighlightedSections] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Refs for debouncing and highlight timeouts
  const saveTimeoutRef = useRef<number | null>(null);
  const highlightTimeoutsRef = useRef<Map<string, number>>(new Map());

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

  // Sync fetched data to local state
  useEffect(() => {
    if (prdData?.content) {
      setPrdContent(prdData.content);
    }
  }, [prdData]);

  // Mutation for saving section updates
  const saveMutation = useMutation({
    mutationFn: async ({ 
      sectionKey, 
      sectionData 
    }: { 
      sectionKey: keyof PrdContent; 
      sectionData: { content: string; status: PrdSectionStatus } 
    }) => {
      const result = await prdService.updatePrdSection(prdId, sectionKey, sectionData);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: prdBuilderQueryKeys.prd(prdId) });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to save', 
        description: error.message,
        variant: 'error'
      });
    },
  });

  // Clear highlights after timeout
  const scheduleHighlightClear = useCallback((sectionKey: string) => {
    // Clear any existing timeout for this section
    const existingTimeout = highlightTimeoutsRef.current.get(sectionKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      setHighlightedSections(prev => {
        const next = new Set(prev);
        next.delete(sectionKey);
        return next;
      });
      highlightTimeoutsRef.current.delete(sectionKey);
    }, 2000); // 2 second highlight duration

    highlightTimeoutsRef.current.set(sectionKey, timeout);
  }, []);

  // Debounced save function
  const debouncedSave = useCallback((
    sectionKey: keyof PrdContent,
    sectionData: { content: string; status: PrdSectionStatus }
  ) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    
    saveTimeoutRef.current = setTimeout(() => {
      saveMutation.mutate({ sectionKey, sectionData });
      setIsSaving(false);
    }, 300); // 300ms debounce
  }, [saveMutation]);

  // Handle section updates from AI
  const handleSectionUpdates = useCallback(async (updates: PrdSectionUpdate[]) => {
    if (!updates || updates.length === 0) return;

    // Process each update
    for (const update of updates) {
      const { sectionKey, content, status } = update;
      const key = sectionKey as string;

      // Optimistic update to local state
      setPrdContent(prev => ({
        ...prev,
        [sectionKey]: {
          content,
          status,
        },
      }));

      // Add to highlighted sections
      setHighlightedSections(prev => new Set([...prev, key]));
      
      // Schedule highlight removal
      scheduleHighlightClear(key);

      // Debounced save to database
      debouncedSave(sectionKey as keyof PrdContent, { content, status });
    }
  }, [scheduleHighlightClear, debouncedSave]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      highlightTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    prdContent,
    highlightedSections,
    isSaving,
    lastSaved,
    isLoading,
    handleSectionUpdates,
    setPrdContent,
  };
}
