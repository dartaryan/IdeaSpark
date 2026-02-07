// src/features/prototypes/hooks/useSandpackStateBridge.ts
//
// Hook that listens for postMessage state updates from the Sandpack iframe
// and provides the latest captured PrototypeState to the parent component.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PrototypeState, StateCaptureMessage } from '../types/prototypeState';
import { validateStateSchema } from '../types/prototypeState';

/** Debounce interval for state updates (ms) */
const STATE_UPDATE_DEBOUNCE_MS = 500;

/** Source identifier expected in messages from the injected capture script */
const EXPECTED_SOURCE = 'sandpack-state-capture';

/** Message type for prototype state updates */
const EXPECTED_TYPE = 'PROTOTYPE_STATE_UPDATE';

export interface UseSandpackStateBridgeOptions {
  /** Whether state capture is enabled (false disables the listener) */
  enabled?: boolean;
  /** Optional callback invoked on each valid state update */
  onStateUpdate?: (state: PrototypeState) => void;
  /** Optional callback invoked on bridge errors */
  onError?: (error: Error) => void;
}

export interface UseSandpackStateBridgeReturn {
  /** Latest captured prototype state (null if none captured yet) */
  capturedState: PrototypeState | null;
  /** Whether the bridge is actively listening for state updates */
  isListening: boolean;
  /** Last error encountered (null if none) */
  lastError: Error | null;
  /** Timestamp of last successful state update */
  lastUpdateTime: number | null;
}

/**
 * Hook that bridges state capture messages from the Sandpack iframe to React state.
 *
 * Architecture:
 * - Registers a `message` event listener on the window
 * - Validates incoming messages: origin, type, source, and schema
 * - Debounces rapid state updates (500ms)
 * - Provides the latest captured state to consuming components
 * - Cleans up listener on unmount
 */
export function useSandpackStateBridge({
  enabled = true,
  onStateUpdate,
  onError,
}: UseSandpackStateBridgeOptions = {}): UseSandpackStateBridgeReturn {
  const [capturedState, setCapturedState] = useState<PrototypeState | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);

  // Refs to avoid stale closures in the message handler
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onStateUpdateRef = useRef(onStateUpdate);
  const onErrorRef = useRef(onError);

  // Keep callback refs in sync
  useEffect(() => {
    onStateUpdateRef.current = onStateUpdate;
  }, [onStateUpdate]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  /**
   * Validate message origin. Accepts Sandpack bundler origins and localhost for dev.
   * In production, this could be tightened to specific Sandpack CDN origins.
   */
  const isValidOrigin = useCallback((origin: string): boolean => {
    // Accept null/empty origin (same-origin iframes)
    if (!origin) return true;
    // Sandpack bundler origins
    if (origin.includes('sandpack')) return true;
    if (origin.includes('codesandbox')) return true;
    // Local development
    if (origin.includes('localhost')) return true;
    if (origin.includes('127.0.0.1')) return true;
    // Same origin
    if (typeof window !== 'undefined' && origin === window.location.origin) return true;
    return false;
  }, []);

  /**
   * Process an incoming state update with debouncing.
   */
  const processStateUpdate = useCallback((state: PrototypeState) => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setCapturedState(state);
      setLastUpdateTime(Date.now());
      setLastError(null);
      onStateUpdateRef.current?.(state);
    }, STATE_UPDATE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsListening(false);
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        // Skip non-object messages
        if (typeof event.data !== 'object' || event.data === null) return;

        // Validate message type
        if (event.data.type !== EXPECTED_TYPE) return;

        // Validate source identifier
        if (event.data.source !== EXPECTED_SOURCE) return;

        // Validate origin
        if (!isValidOrigin(event.origin)) {
          const err = new Error(`Rejected state update from untrusted origin: ${event.origin}`);
          setLastError(err);
          onErrorRef.current?.(err);
          console.debug('[StateBridge] Rejected untrusted origin:', event.origin);
          return;
        }

        // Extract payload
        const message = event.data as StateCaptureMessage;
        const { payload } = message;

        // Validate payload schema
        if (!validateStateSchema(payload)) {
          const err = new Error('State update failed schema validation');
          setLastError(err);
          onErrorRef.current?.(err);
          console.debug('[StateBridge] Schema validation failed:', payload);
          return;
        }

        // Process valid state update
        processStateUpdate(payload);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown state bridge error');
        setLastError(error);
        onErrorRef.current?.(error);
        console.debug('[StateBridge] Error processing message:', error.message);
      }
    };

    window.addEventListener('message', handleMessage);
    setIsListening(true);

    return () => {
      window.removeEventListener('message', handleMessage);
      setIsListening(false);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [enabled, isValidOrigin, processStateUpdate]);

  return {
    capturedState,
    isListening,
    lastError,
    lastUpdateTime,
  };
}
