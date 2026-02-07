// src/features/prototypes/hooks/useStatePersistence.ts
//
// Hook for automatically persisting prototype interaction state to the database.
// Implements debounced auto-save, retry with exponential backoff,
// visibilitychange save-on-hide, and fetch+keepalive as a last-resort fallback.
// Story 8.2: Save Prototype State to Database

import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import type { PrototypeState } from '../types/prototypeState';
import { validateStateSchema, serializeState } from '../types/prototypeState';
import { prototypeService } from '../services/prototypeService';
import { supabase } from '../../../lib/supabase';

/** Auto-save debounce interval in milliseconds (AC: #1, #5) */
const DEBOUNCE_MS = 10_000; // 10 seconds

/** Maximum number of retry attempts on save failure (AC: #4) */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (AC: #4): 1s, 2s, 4s */
const BASE_RETRY_DELAY_MS = 1000;

/** Save status type for UI indicators */
export type StatePersistenceStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseStatePersistenceOptions {
  /** Prototype ID for database association */
  prototypeId: string;
  /** Latest captured state from useSandpackStateBridge */
  capturedState: PrototypeState | null;
  /** Whether persistence is active (false disables all saves) */
  enabled: boolean;
}

export interface UseStatePersistenceReturn {
  /** Current save status for UI display */
  saveStatus: StatePersistenceStatus;
  /** Timestamp of last successful save (null if never saved) */
  lastSavedAt: Date | null;
  /** Last error encountered during save (null if none) */
  lastError: Error | null;
  /** Manual save trigger — bypasses debounce, saves immediately */
  saveNow: () => Promise<void>;
}

/**
 * Hook for persisting prototype interaction state to the database with
 * debounced auto-save, retry logic, and save-on-hide behavior.
 *
 * Architecture:
 * - When `capturedState` changes, starts a 10-second debounce timer
 * - On debounce fire, saves via prototypeService.saveState() (upsert)
 * - On failure, retries up to 3 times with exponential backoff (1s, 2s, 4s)
 * - Shows toast only after all retries exhausted
 * - On visibilitychange (hidden), saves immediately (no debounce)
 * - Uses fetch() with keepalive:true as last-resort on tab close (AC: #2)
 * - Caches auth credentials for synchronous access in visibility handler
 * - Prevents concurrent saves via in-flight flag
 * - Cleans up all timers, listeners, and auth subscriptions on unmount
 */
export function useStatePersistence({
  prototypeId,
  capturedState,
  enabled,
}: UseStatePersistenceOptions): UseStatePersistenceReturn {
  const [saveStatus, setSaveStatus] = useState<StatePersistenceStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);

  // Refs for avoiding stale closures and managing concurrent saves
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const latestStateRef = useRef<PrototypeState | null>(capturedState);
  const lastSavedSerializedRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const prototypeIdRef = useRef(prototypeId);
  const enabledRef = useRef(enabled);

  // Cached auth credentials for synchronous access in visibilitychange handler.
  // sendBeacon cannot set custom headers, so we use fetch+keepalive instead,
  // which requires the access token and user ID to be available synchronously.
  const cachedAccessTokenRef = useRef<string | null>(null);
  const cachedUserIdRef = useRef<string | null>(null);

  // Keep refs in sync
  useEffect(() => {
    latestStateRef.current = capturedState;
  }, [capturedState]);

  useEffect(() => {
    prototypeIdRef.current = prototypeId;
  }, [prototypeId]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cache auth credentials for synchronous access in visibilitychange handler.
  // Uses onAuthStateChange to keep the cache fresh across token refreshes.
  useEffect(() => {
    // Seed cache with current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      cachedAccessTokenRef.current = session?.access_token ?? null;
      cachedUserIdRef.current = session?.user?.id ?? null;
    });

    // Keep cache updated on auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      cachedAccessTokenRef.current = session?.access_token ?? null;
      cachedUserIdRef.current = session?.user?.id ?? null;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Core save function with retry logic.
   * Prevents concurrent saves and retries with exponential backoff.
   */
  const performSave = useCallback(
    async (state: PrototypeState, retryCount = 0): Promise<boolean> => {
      // Prevent concurrent saves (AC: #5)
      if (isSavingRef.current) {
        return false;
      }

      // Validate state before saving
      if (!validateStateSchema(state)) {
        if (isMountedRef.current) {
          setLastError(new Error('Invalid state schema'));
          setSaveStatus('error');
        }
        return false;
      }

      // Check if state has changed since last save (skip if identical)
      const serialized = serializeState(state);
      if (serialized === lastSavedSerializedRef.current) {
        return true; // No change, skip save
      }

      isSavingRef.current = true;
      if (isMountedRef.current) {
        setSaveStatus('saving');
        setLastError(null);
      }

      const result = await prototypeService.saveState(prototypeIdRef.current, state);

      if (result.error) {
        isSavingRef.current = false;

        // Retry with exponential backoff (AC: #4)
        if (retryCount < MAX_RETRIES) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
          return new Promise<boolean>((resolve) => {
            retryTimerRef.current = setTimeout(async () => {
              const retryResult = await performSave(state, retryCount + 1);
              resolve(retryResult);
            }, delay);
          });
        }

        // All retries exhausted — show toast notification (AC: #4)
        if (isMountedRef.current) {
          const error = new Error(result.error.message);
          setLastError(error);
          setSaveStatus('error');
          toast.error('Failed to save prototype state. Changes retained in memory.');
        }
        return false;
      }

      // Save successful
      isSavingRef.current = false;
      lastSavedSerializedRef.current = serialized;

      if (isMountedRef.current) {
        const now = new Date();
        setLastSavedAt(now);
        setSaveStatus('saved');
        setLastError(null);
      }
      return true;
    },
    [], // no deps — uses refs to avoid stale closures
  );

  /**
   * Manual save trigger — bypasses debounce, saves immediately.
   */
  const saveNow = useCallback(async () => {
    // Clear pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const state = latestStateRef.current;
    if (!state || !enabledRef.current) return;

    await performSave(state);
  }, [performSave]);

  /**
   * Debounced auto-save: triggered when capturedState changes.
   * 10-second debounce ensures only the latest state is saved (AC: #1, #5).
   */
  useEffect(() => {
    if (!enabled || !capturedState) return;

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const stateToSave = latestStateRef.current;
      if (stateToSave && enabledRef.current) {
        performSave(stateToSave);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [capturedState, enabled, performSave]);

  /**
   * Fire a fetch request with keepalive:true for guaranteed delivery on tab close.
   * Uses cached auth credentials (synchronous) and Supabase REST API directly.
   * This is fire-and-forget — errors are silently ignored.
   *
   * Why fetch+keepalive instead of sendBeacon:
   * - sendBeacon cannot set custom HTTP headers (Authorization, apikey)
   * - fetch+keepalive supports custom headers AND survives page unload
   * - Supabase REST API requires Authorization + apikey headers for RLS
   */
  const fireKeepAliveSave = useCallback((state: PrototypeState) => {
    try {
      const token = cachedAccessTokenRef.current;
      const userId = cachedUserIdRef.current;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!token || !userId || !supabaseUrl || !supabaseKey) return;

      fetch(`${supabaseUrl}/rest/v1/prototype_states`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseKey,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          prototype_id: prototypeIdRef.current,
          user_id: userId,
          state: state,
        }),
        keepalive: true,
      }).catch(() => {
        // Fire-and-forget — silently ignore failures
      });
    } catch {
      // Best-effort — silently ignore failures
      console.debug('[useStatePersistence] keepalive save fallback failed');
    }
  }, []);

  /**
   * Save on visibilitychange (AC: #2).
   * When user hides the tab, save immediately without debounce.
   * Uses fetch+keepalive as last-resort fallback for guaranteed delivery.
   *
   * The fetch+keepalive fires REGARDLESS of whether a service save is in-flight,
   * because the in-flight save may not complete before the browser kills the tab.
   * Since both use upsert, concurrent execution is safe (last write wins).
   */
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden && enabledRef.current) {
        const state = latestStateRef.current;
        if (!state) return;

        // Check if state changed since last save
        const serialized = serializeState(state);
        if (serialized === lastSavedSerializedRef.current) return;

        // Attempt 1: Service layer save (may not complete if tab is closing)
        if (!isSavingRef.current) {
          performSave(state);
        }

        // Attempt 2: fetch+keepalive for guaranteed delivery on tab close.
        // Fires independently of the service save — even if a save is in-flight,
        // the keepalive request survives page unload. Since both use upsert,
        // concurrent writes are safe (last write wins).
        fireKeepAliveSave(state);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, performSave, fireKeepAliveSave]);

  /**
   * Reset state when prototype ID changes (e.g., version switch).
   * Uses a mount guard so the first mount doesn't clear timers set by
   * the capturedState effect (effects fire in declaration order).
   *
   * Design decision: We reset in-memory tracking state but do NOT delete the
   * database row for the previous prototype. Each prototype version has its own
   * state row keyed by (prototype_id, user_id). The old row is harmless and will
   * be useful when Story 8.3 restores state on return. Orphaned rows are cleaned
   * up via CASCADE when the prototype itself is deleted.
   */
  const prevPrototypeIdRef = useRef(prototypeId);
  useEffect(() => {
    // Skip on initial mount — only reset when prototypeId actually changes
    if (prevPrototypeIdRef.current === prototypeId) return;
    prevPrototypeIdRef.current = prototypeId;

    // Clear all timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    // Reset tracking state
    isSavingRef.current = false;
    lastSavedSerializedRef.current = null;
    setSaveStatus('idle');
    setLastSavedAt(null);
    setLastError(null);
  }, [prototypeId]);

  /**
   * Cleanup on unmount: clear all timers and listeners.
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, []);

  return {
    saveStatus,
    lastSavedAt,
    lastError,
    saveNow,
  };
}
