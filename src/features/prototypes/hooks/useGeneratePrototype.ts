import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { openLovableService } from '../../../services/openLovableService';
import { supabase } from '../../../lib/supabase';

interface UseGeneratePrototypeOptions {
  onSuccess?: (prototypeId: string) => void;
  onError?: (error: Error) => void;
}

interface GenerationProgress {
  stage: 'analyzing' | 'generating' | 'building' | 'complete';
  percent: number;
}

export function useGeneratePrototype(options?: UseGeneratePrototypeOptions) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    stage: 'analyzing',
    percent: 0,
  });
  const [error, setError] = useState<Error | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [currentPrdId, setCurrentPrdId] = useState<string>('');
  const [currentIdeaId, setCurrentIdeaId] = useState<string>('');

  // Persist generation state to handle page reload
  useEffect(() => {
    const savedState = localStorage.getItem('prototype_generation_state');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.isGenerating && state.prototypeId) {
        // Resume polling
        setIsGenerating(true);
        setStartTime(state.startTime);
        setCurrentPrdId(state.prdId);
        setCurrentIdeaId(state.ideaId);
        pollPrototypeStatus(state.prototypeId, state.ideaId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProgress = useCallback(
    (stage: GenerationProgress['stage'], percent: number) => {
      setProgress({ stage, percent });
    },
    []
  );

  const updateIdeaStatus = async (ideaId: string, status: string) => {
    const { error } = await supabase
      .from('ideas')
      .update({ status })
      .eq('id', ideaId);

    if (error) {
      console.error('Failed to update idea status:', error);
    }
  };

  const pollPrototypeStatus = useCallback(
    async (prototypeId: string, ideaId: string) => {
      const { data, error } = await openLovableService.pollStatus(
        prototypeId,
        60,
        1000
      );

      if (error) {
        setError(new Error(error.message));
        setIsGenerating(false);
        localStorage.removeItem('prototype_generation_state');
        options?.onError?.(new Error(error.message));
        return;
      }

      if (data?.status === 'ready') {
        // Success - update idea status
        await updateIdeaStatus(ideaId, 'prototype_complete');

        // Invalidate caches
        queryClient.invalidateQueries({ queryKey: ['ideas'] });
        queryClient.invalidateQueries({ queryKey: ['prototypes'] });

        setIsGenerating(false);
        updateProgress('complete', 100);
        localStorage.removeItem('prototype_generation_state');
        options?.onSuccess?.(prototypeId);
      } else if (data?.status === 'failed') {
        setError(
          new Error('Prototype generation failed. Please try again.')
        );
        setIsGenerating(false);
        localStorage.removeItem('prototype_generation_state');
        options?.onError?.(new Error('Generation failed'));
      }
    },
    [queryClient, options, updateProgress]
  );

  const generate = useCallback(
    async (prdId: string, ideaId: string) => {
      try {
        setIsGenerating(true);
        setError(null);
        setStartTime(Date.now());
        setCurrentPrdId(prdId);
        setCurrentIdeaId(ideaId);
        updateProgress('analyzing', 10);

        // Fetch PRD content
        const { data: prd, error: prdError } = await supabase
          .from('prd_documents')
          .select('content')
          .eq('id', prdId)
          .single();

        if (prdError || !prd) {
          throw new Error('Failed to load PRD content');
        }

        // Extract and format PRD content
        const prdContent = {
          problemStatement: prd.content.problemStatement || '',
          goals: prd.content.goalsAndMetrics || '',
          userStories: prd.content.userStories || '',
          requirements: prd.content.requirements || '',
          technicalConsiderations: prd.content.technicalConsiderations || '',
        };

        updateProgress('generating', 30);

        // Call Edge Function
        const { data, error: generateError } = await openLovableService.generate(
          prdId,
          ideaId,
          prdContent
        );

        if (generateError || !data) {
          throw new Error(generateError?.message || 'Failed to start generation');
        }

        // Save state for persistence
        localStorage.setItem(
          'prototype_generation_state',
          JSON.stringify({
            isGenerating: true,
            prototypeId: data.prototypeId,
            startTime: Date.now(),
            prdId,
            ideaId,
          })
        );

        updateProgress('building', 60);

        // Start polling for completion
        await pollPrototypeStatus(data.prototypeId, ideaId);
      } catch (err) {
        const error = err as Error;
        console.error('[useGeneratePrototype] Generation failed:', error);
        setError(error);
        setIsGenerating(false);
        localStorage.removeItem('prototype_generation_state');
        options?.onError?.(error);
      }
    },
    [updateProgress, pollPrototypeStatus, options]
  );

  const retry = useCallback(() => {
    if (currentPrdId && currentIdeaId) {
      generate(currentPrdId, currentIdeaId);
    }
  }, [currentPrdId, currentIdeaId, generate]);

  return {
    generate,
    retry,
    isGenerating,
    progress,
    error,
    startTime,
  };
}
