import { useState, useEffect, useRef, useCallback } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions<T> {
  data: T;
  saveFunction: (data: T) => Promise<void>;
  debounceMs?: number;
  savedDisplayMs?: number;
  enabled?: boolean;
}

export interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
  triggerSave: () => Promise<void>;
  clearError: () => void;
}

export function useAutoSave<T>({
  data,
  saveFunction,
  debounceMs = 1000,
  savedDisplayMs = 3000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and debouncing
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedDisplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingDataRef = useRef<T | null>(null);
  const dataRef = useRef(data);

  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Actual save execution
  const executeSave = useCallback(
    async (dataToSave: T) => {
      if (isSavingRef.current) {
        // Queue this data for after current save completes
        pendingDataRef.current = dataToSave;
        return;
      }

      isSavingRef.current = true;
      setSaveStatus('saving');
      setError(null);

      try {
        await saveFunction(dataToSave);
        setLastSaved(new Date());
        setSaveStatus('saved');

        // Clear "saved" status after display duration
        if (savedDisplayTimeoutRef.current) {
          clearTimeout(savedDisplayTimeoutRef.current);
        }
        savedDisplayTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, savedDisplayMs);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save';
        setError(errorMessage);
        setSaveStatus('error');
      } finally {
        isSavingRef.current = false;

        // Process any pending save request
        if (pendingDataRef.current) {
          const pendingData = pendingDataRef.current;
          pendingDataRef.current = null;
          executeSave(pendingData);
        }
      }
    },
    [saveFunction, savedDisplayMs]
  );

  // Debounced auto-save trigger
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new debounce timeout
    debounceTimeoutRef.current = setTimeout(() => {
      executeSave(data);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [data, debounceMs, enabled, executeSave]);

  // Manual save function (bypasses debounce)
  const triggerSave = useCallback(async () => {
    // Cancel any pending debounced save
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Execute save immediately with current data
    await executeSave(dataRef.current);
  }, [executeSave]);

  const clearError = useCallback(() => {
    setError(null);
    setSaveStatus('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (savedDisplayTimeoutRef.current) {
        clearTimeout(savedDisplayTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    lastSaved,
    error,
    triggerSave,
    clearError,
  };
}
