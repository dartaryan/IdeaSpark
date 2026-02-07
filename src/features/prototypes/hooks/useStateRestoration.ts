// src/features/prototypes/hooks/useStateRestoration.ts
//
// Hook that restores saved prototype state into the Sandpack iframe via postMessage.
// Sends a RESTORE_STATE message to the injected stateCaptureInjector script
// and waits for an acknowledgment before marking restoration as complete.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PrototypeState } from '../types/prototypeState';

/** Timeout in milliseconds to wait for restoration acknowledgment */
const RESTORATION_TIMEOUT_MS = 5000;

/** Source identifier for messages from parent → iframe */
const PARENT_SOURCE = 'ideaspark-parent';

/** Expected source identifier in acknowledgment messages from iframe */
const IFRAME_ACK_SOURCE = 'sandpack-state-capture';

/** CSS selector for the Sandpack preview iframe. Single source of truth for DOM lookup. */
export const SANDPACK_IFRAME_SELECTOR = 'iframe[title="Sandpack Preview"]';

/**
 * Validate message origin to prevent spoofed ACKs.
 * Matches the origin policy in useSandpackStateBridge.
 */
function isValidOrigin(origin: string): boolean {
  if (!origin) return true; // same-origin iframes send empty origin
  if (origin.includes('sandpack')) return true;
  if (origin.includes('codesandbox')) return true;
  if (origin.includes('localhost')) return true;
  if (origin.includes('127.0.0.1')) return true;
  if (typeof window !== 'undefined' && origin === window.location.origin) return true;
  return false;
}

/** Restoration status states */
export type RestorationStatus = 'idle' | 'restoring' | 'restored' | 'error';

export interface UseStateRestorationOptions {
  /** ID of the prototype being viewed */
  prototypeId: string;
  /** Saved state to restore (null if no saved state) */
  savedState: PrototypeState | null;
  /** Whether restoration is enabled (should be true only in edit mode) */
  enabled: boolean;
  /** Whether the Sandpack iframe is ready to receive messages */
  iframeReady: boolean;
}

export interface UseStateRestorationReturn {
  /** Current restoration status */
  restorationStatus: RestorationStatus;
  /** Error encountered during restoration (null if none) */
  restorationError: Error | null;
  /** Manual trigger to restore state */
  restoreNow: () => void;
}

/**
 * Hook to restore saved prototype state into the Sandpack iframe.
 *
 * Architecture:
 * - Automatically triggers restoration when savedState, enabled, and iframeReady are all truthy
 * - Sends RESTORE_STATE postMessage to the Sandpack iframe
 * - Listens for RESTORE_STATE_ACK from the injected script (with timeout)
 * - Tracks restoration status and errors
 * - Prevents duplicate restoration via hasRestoredRef
 * - Cleans up event listeners and timers on unmount
 */
export function useStateRestoration({
  prototypeId,
  savedState,
  enabled,
  iframeReady,
}: UseStateRestorationOptions): UseStateRestorationReturn {
  const [restorationStatus, setRestorationStatus] = useState<RestorationStatus>('idle');
  const [restorationError, setRestorationError] = useState<Error | null>(null);
  const hasRestoredRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const prevPrototypeIdRef = useRef(prototypeId);

  /** Clean up any pending timeout and message listener */
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (listenerRef.current) {
      window.removeEventListener('message', listenerRef.current);
      listenerRef.current = null;
    }
  }, []);

  /**
   * Send RESTORE_STATE message to iframe and listen for acknowledgment.
   * Uses event listener + timeout pattern (no floating promises).
   */
  const restoreNow = useCallback(() => {
    if (!savedState || !enabled || !iframeReady || hasRestoredRef.current) return;

    // Find the Sandpack preview iframe
    const iframe = document.querySelector(SANDPACK_IFRAME_SELECTOR) as HTMLIFrameElement;
    if (!iframe?.contentWindow) {
      setRestorationStatus('error');
      setRestorationError(new Error('Sandpack iframe not found'));
      return;
    }

    hasRestoredRef.current = true;
    setRestorationStatus('restoring');
    setRestorationError(null);

    // Clean up any previous listeners/timers
    cleanup();

    // Set up ack listener
    const handleAck = (event: MessageEvent) => {
      if (
        event.data?.type === 'RESTORE_STATE_ACK' &&
        event.data?.source === IFRAME_ACK_SOURCE &&
        isValidOrigin(event.origin)
      ) {
        cleanup();
        if (event.data.success) {
          setRestorationStatus('restored');
        } else {
          setRestorationStatus('error');
          setRestorationError(new Error(event.data.error || 'Restoration failed'));
        }
      }
    };

    listenerRef.current = handleAck;
    window.addEventListener('message', handleAck);

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      cleanup();
      setRestorationStatus('error');
      setRestorationError(new Error('Restoration timeout'));
    }, RESTORATION_TIMEOUT_MS);

    // Send restore message to iframe
    iframe.contentWindow.postMessage(
      {
        type: 'RESTORE_STATE',
        payload: savedState,
        source: PARENT_SOURCE,
      },
      '*',
    );
  }, [savedState, enabled, iframeReady, cleanup]);

  // Auto-restore when all conditions are met
  useEffect(() => {
    if (savedState && enabled && iframeReady && restorationStatus === 'idle' && !hasRestoredRef.current) {
      restoreNow();
    }
  }, [savedState, enabled, iframeReady, restorationStatus, restoreNow]);

  // Reset state when prototypeId changes (skip initial mount)
  useEffect(() => {
    if (prevPrototypeIdRef.current !== prototypeId) {
      prevPrototypeIdRef.current = prototypeId;
      hasRestoredRef.current = false;
      setRestorationStatus('idle');
      setRestorationError(null);
      cleanup();
    }
  }, [prototypeId, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return { restorationStatus, restorationError, restoreNow };
}
