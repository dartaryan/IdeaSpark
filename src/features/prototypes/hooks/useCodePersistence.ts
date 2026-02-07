// src/features/prototypes/hooks/useCodePersistence.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import type { EditorFile } from '../types';
import { serializeFiles, parsePrototypeCode, detectLanguage } from '../types';
import { prototypeService } from '../services/prototypeService';

/** Save status for UI indicator */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseCodePersistenceOptions {
  /** Prototype ID for database saves */
  prototypeId: string;
  /** Initial prototype code from database (JSON string or single file) */
  initialCode: string | null;
}

export interface UseCodePersistenceReturn {
  /** Current files state (loaded from DB, updated by edits) */
  files: Record<string, EditorFile>;
  /** Update a single file's content - triggers debounced DB save */
  updateFile: (path: string, content: string) => void;
  /** Current save status for UI display */
  saveStatus: SaveStatus;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Manually trigger a save (e.g., on exit edit mode) */
  flushSave: () => Promise<void>;
}

const DB_SAVE_DEBOUNCE_MS = 2000;

/**
 * Hook for persisting code edits to the database with debounced auto-save.
 *
 * Architecture:
 * - On mount, loads files from initialCode (prototype.code field)
 * - On each file update, marks hasUnsavedChanges and starts a 2-second debounce timer
 * - When debounce fires, serializes files and saves via prototypeService.update()
 * - On unmount, flushes any pending save
 */
export function useCodePersistence({
  prototypeId,
  initialCode,
}: UseCodePersistenceOptions): UseCodePersistenceReturn {
  const [files, setFiles] = useState<Record<string, EditorFile>>(() =>
    parsePrototypeCode(initialCode),
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filesRef = useRef(files);
  const isMountedRef = useRef(true);

  // Keep filesRef in sync
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset files when prototype changes (e.g., version switch via VersionHistoryPanel)
  const prevPrototypeIdRef = useRef(prototypeId);
  useEffect(() => {
    if (prevPrototypeIdRef.current !== prototypeId) {
      prevPrototypeIdRef.current = prototypeId;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setFiles(parsePrototypeCode(initialCode));
      setHasUnsavedChanges(false);
      setSaveStatus('idle');
    }
  }, [prototypeId, initialCode]);

  // Perform the actual save to database
  const performSave = useCallback(
    async (filesToSave: Record<string, EditorFile>) => {
      if (!prototypeId) return;

      const serialized = serializeFiles(filesToSave);
      if (isMountedRef.current) setSaveStatus('saving');

      const result = await prototypeService.update(prototypeId, { code: serialized });

      if (result.error) {
        if (isMountedRef.current) {
          setSaveStatus('error');
          toast.error('Failed to save changes. Your edits are preserved locally.');
        }
      } else {
        if (isMountedRef.current) {
          setSaveStatus('saved');
          setHasUnsavedChanges(false);
        }
      }
    },
    [prototypeId],
  );

  // Update a single file's content
  const updateFile = useCallback(
    (path: string, content: string) => {
      setFiles((prev) => {
        const existing = prev[path];
        const updated = {
          ...prev,
          [path]: {
            path: existing?.path ?? path,
            language: existing?.language ?? detectLanguage(path),
            content,
          },
        };
        filesRef.current = updated;
        return updated;
      });

      setHasUnsavedChanges(true);
      setSaveStatus('idle');

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Start new debounce timer for DB save
      debounceTimerRef.current = setTimeout(() => {
        performSave(filesRef.current);
      }, DB_SAVE_DEBOUNCE_MS);
    },
    [performSave],
  );

  // Flush pending save (called on unmount or exit edit mode)
  const flushSave = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (hasUnsavedChanges) {
      await performSave(filesRef.current);
    }
  }, [hasUnsavedChanges, performSave]);

  // Cleanup: flush pending save on unmount (only if debounce timer was active)
  useEffect(() => {
    return () => {
      const hadPendingTimer = debounceTimerRef.current !== null;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      // Only fire save on unmount if there was a pending debounce (actual unsaved changes)
      if (hadPendingTimer && filesRef.current && Object.keys(filesRef.current).length > 0) {
        const serialized = serializeFiles(filesRef.current);
        prototypeService.update(prototypeId, { code: serialized }).catch(() => {
          // Silently fail on unmount - user navigated away
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prototypeId]);

  return {
    files,
    updateFile,
    saveStatus,
    hasUnsavedChanges,
    flushSave,
  };
}
