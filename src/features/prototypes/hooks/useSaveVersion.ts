// src/features/prototypes/hooks/useSaveVersion.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { EditorFile } from '../types';
import { serializeFiles } from '../types';
import { prototypeService } from '../services/prototypeService';

/** Save version status */
export type SaveVersionStatus = 'idle' | 'saving' | 'success' | 'error';

export interface UseSaveVersionProps {
  /** Current prototype ID */
  prototypeId: string;
  /** Current editor files from useCodePersistence */
  currentFiles: Record<string, EditorFile>;
  /** PRD ID for the new version */
  prdId: string;
  /** Idea ID for the new version */
  ideaId: string;
}

export interface UseSaveVersionReturn {
  /** Create a new version with optional note. Returns new prototype ID or null on error. */
  saveVersion: (versionNote?: string) => Promise<string | null>;
  /** Current save status */
  status: SaveVersionStatus;
  /** Whether currently saving */
  isSaving: boolean;
}

const STATUS_RESET_MS = 3000;

/**
 * Hook for creating new prototype versions.
 *
 * Flow:
 * 1. Serialize current files to JSON string
 * 2. Call prototypeService.createVersion() to create new DB record
 * 3. Update the new record status to 'ready' (createVersion defaults to 'generating')
 * 4. Return new prototype ID for navigation
 */
export function useSaveVersion({
  prototypeId,
  currentFiles,
  prdId,
  ideaId,
}: UseSaveVersionProps): UseSaveVersionReturn {
  const [status, setStatus] = useState<SaveVersionStatus>('idle');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const scheduleReset = useCallback(() => {
    clearResetTimer();
    resetTimerRef.current = setTimeout(() => {
      setStatus('idle');
    }, STATUS_RESET_MS);
  }, [clearResetTimer]);

  // Cleanup reset timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => clearResetTimer();
  }, [clearResetTimer]);

  const saveVersion = useCallback(
    async (versionNote?: string): Promise<string | null> => {
      if (!prototypeId || !prdId || !ideaId) {
        toast.error('Missing required data to save version.');
        return null;
      }

      if (Object.keys(currentFiles).length === 0) {
        toast.error('No files to save.');
        return null;
      }

      clearResetTimer();
      setStatus('saving');

      try {
        // Serialize current editor files to JSON string
        const serializedCode = serializeFiles(currentFiles);

        // Create new version record in database
        const result = await prototypeService.createVersion({
          prdId,
          ideaId,
          code: serializedCode,
          refinementPrompt: versionNote || '',
        });

        if (result.error || !result.data) {
          setStatus('error');
          toast.error(`Failed to save version: ${result.error?.message || 'Unknown error'}`);
          scheduleReset();
          return null;
        }

        const newPrototype = result.data;

        // createVersion sets status='generating' by default.
        // Update to 'ready' since this is a manual save with existing code.
        // If this update fails, the version is created but stuck as 'generating',
        // so we still return the ID but warn the user.
        const updateResult = await prototypeService.update(newPrototype.id, { status: 'ready' });
        if (updateResult.error) {
          console.error('Failed to update new version status to ready:', updateResult.error.message);
          toast.error('Version saved but may show as "generating". Refresh to fix.');
        }

        setStatus('success');
        scheduleReset();

        return newPrototype.id;
      } catch (err) {
        setStatus('error');
        const message = err instanceof Error ? err.message : 'Unexpected error';
        toast.error(`Failed to save version: ${message}`);
        scheduleReset();
        return null;
      }
    },
    [prototypeId, currentFiles, prdId, ideaId, clearResetTimer, scheduleReset],
  );

  return {
    saveVersion,
    status,
    isSaving: status === 'saving',
  };
}
