// src/features/prototypes/hooks/useSandpackMonitorBridge.ts
//
// Hook that listens for postMessage API call log entries from the Sandpack iframe
// and provides the log data to the parent component for display in the API monitor panel.
// Follows the useSandpackStateBridge.ts pattern exactly. (Story 10.5)

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ApiCallLogEntry } from '../types/apiMonitor';

/** Source identifier expected in messages from the generated apiClient.js */
const EXPECTED_SOURCE = 'sandpack-api-monitor';

/** Message type for API call log entries */
const EXPECTED_TYPE = 'API_CALL_LOG';

/** Default maximum number of log entries to retain (FIFO) */
const DEFAULT_MAX_ENTRIES = 200;

export interface UseSandpackMonitorBridgeOptions {
  /** Whether monitoring is enabled (false disables the listener) */
  enabled?: boolean;
  /** Maximum number of log entries to keep (default: 200) */
  maxEntries?: number;
}

export interface UseSandpackMonitorBridgeReturn {
  /** Array of captured API call log entries */
  logs: ApiCallLogEntry[];
  /** Total number of API calls recorded */
  totalCount: number;
  /** Number of error calls recorded */
  errorCount: number;
  /** Clear all log entries */
  clearLogs: () => void;
}

/**
 * Hook that bridges API call monitoring messages from the Sandpack iframe to React state.
 *
 * Architecture:
 * - Registers a `message` event listener on the window
 * - Validates incoming messages: origin, type, and source
 * - Appends new log entries to state (FIFO, max 200 by default)
 * - Provides logs, counts, and clear functionality
 * - Cleans up listener on unmount
 */
export function useSandpackMonitorBridge({
  enabled = true,
  maxEntries = DEFAULT_MAX_ENTRIES,
}: UseSandpackMonitorBridgeOptions = {}): UseSandpackMonitorBridgeReturn {
  const [logs, setLogs] = useState<ApiCallLogEntry[]>([]);

  // Ref to track maxEntries without re-creating the handler
  const maxEntriesRef = useRef(maxEntries);
  maxEntriesRef.current = maxEntries;

  /**
   * Validate message origin. Accepts Sandpack bundler origins and localhost for dev.
   * Same logic as useSandpackStateBridge.
   */
  const isValidOrigin = useCallback((origin: string): boolean => {
    if (!origin) return true;
    if (origin.includes('sandpack')) return true;
    if (origin.includes('codesandbox')) return true;
    if (origin.includes('localhost')) return true;
    if (origin.includes('127.0.0.1')) return true;
    if (typeof window !== 'undefined' && origin === window.location.origin) return true;
    return false;
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    if (!enabled) {
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
          return;
        }

        // Extract and validate payload
        const entry = event.data.payload as ApiCallLogEntry;
        if (!entry || typeof entry.id !== 'string' || typeof entry.endpointName !== 'string') {
          return;
        }

        // Append to logs (FIFO, respect maxEntries)
        setLogs((prev) => {
          const next = [...prev, entry];
          if (next.length > maxEntriesRef.current) {
            return next.slice(next.length - maxEntriesRef.current);
          }
          return next;
        });
      } catch {
        // Silently ignore malformed messages
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [enabled, isValidOrigin]);

  // Compute derived counts (memoized to avoid re-filtering on every render)
  const totalCount = logs.length;
  const errorCount = useMemo(() => logs.filter((l) => l.isError).length, [logs]);

  return {
    logs,
    totalCount,
    errorCount,
    clearLogs,
  };
}
