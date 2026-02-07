// src/features/prototypes/hooks/useStateCapturePerformance.ts
//
// Performance monitoring hook for prototype state capture.
// Tracks capture metrics and logs warnings in development mode.

import { useRef, useCallback } from 'react';
import type { PrototypeState } from '../types/prototypeState';
import {
  MAX_CAPTURE_DURATION_MS,
  MAX_SERIALIZATION_DURATION_MS,
  MAX_STATE_SIZE_BYTES,
} from '../types/prototypeState';

export interface PerformanceEntry {
  timestamp: number;
  captureDurationMs: number;
  serializedSizeBytes: number;
  warnings: string[];
}

export interface UseStateCapturePerformanceReturn {
  /** Record a performance entry from a captured state */
  recordCapture: (state: PrototypeState) => PerformanceEntry;
  /** Get the last N performance entries */
  getRecentEntries: (count?: number) => PerformanceEntry[];
  /** Get average capture duration over recent entries */
  getAverageCaptureDuration: () => number;
}

const MAX_HISTORY_SIZE = 50;

/**
 * Hook for monitoring state capture performance.
 * Maintains a rolling history of capture metrics and logs warnings.
 */
export function useStateCapturePerformance(): UseStateCapturePerformanceReturn {
  const historyRef = useRef<PerformanceEntry[]>([]);

  const recordCapture = useCallback((state: PrototypeState): PerformanceEntry => {
    const warnings: string[] = [];
    const { captureDurationMs, serializedSizeBytes } = state.metadata;

    if (captureDurationMs > MAX_CAPTURE_DURATION_MS) {
      warnings.push(
        `Capture took ${captureDurationMs}ms (threshold: ${MAX_CAPTURE_DURATION_MS}ms)`,
      );
    }

    if (serializedSizeBytes > MAX_STATE_SIZE_BYTES) {
      warnings.push(
        `State size ${serializedSizeBytes} bytes exceeds ${MAX_STATE_SIZE_BYTES} byte limit`,
      );
    }

    // Log warnings in dev mode
    if (warnings.length > 0) {
      console.debug('[StateCapture Performance]', warnings);
    }

    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      captureDurationMs,
      serializedSizeBytes,
      warnings,
    };

    // Maintain rolling history
    historyRef.current.push(entry);
    if (historyRef.current.length > MAX_HISTORY_SIZE) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY_SIZE);
    }

    return entry;
  }, []);

  const getRecentEntries = useCallback((count: number = 10): PerformanceEntry[] => {
    return historyRef.current.slice(-count);
  }, []);

  const getAverageCaptureDuration = useCallback((): number => {
    const entries = historyRef.current;
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, e) => sum + e.captureDurationMs, 0);
    return total / entries.length;
  }, []);

  return {
    recordCapture,
    getRecentEntries,
    getAverageCaptureDuration,
  };
}
