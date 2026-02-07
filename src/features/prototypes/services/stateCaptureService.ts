// src/features/prototypes/services/stateCaptureService.ts
//
// Service layer for prototype state capture operations.
// Provides serialization, deserialization, validation, and utility functions.

import type { PrototypeState } from '../types/prototypeState';
import {
  validateStateSchema,
  serializeState as serializeStateRaw,
  deserializeState as deserializeStateRaw,
  createEmptyPrototypeState,
  MAX_STATE_SIZE_BYTES,
  MAX_CAPTURE_DURATION_MS,
  MAX_SERIALIZATION_DURATION_MS,
} from '../types/prototypeState';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StateCaptureResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Error message if the operation failed */
  error?: string;
}

export interface SerializationResult {
  /** JSON string representation of state */
  json: string;
  /** Size in bytes */
  sizeBytes: number;
  /** Duration of serialization in ms */
  durationMs: number;
  /** Warnings (e.g., state too large) */
  warnings: string[];
}

export interface PerformanceMetrics {
  /** Whether capture duration is within threshold */
  captureWithinThreshold: boolean;
  /** Whether serialization duration is within threshold */
  serializationWithinThreshold: boolean;
  /** Whether state size is within threshold */
  sizeWithinThreshold: boolean;
  /** Specific warnings */
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Validate an unknown value against the PrototypeState schema.
 * Delegates to the core validation function from the types module.
 */
export function validateState(state: unknown): state is PrototypeState {
  return validateStateSchema(state);
}

/**
 * Serialize a PrototypeState to JSON with performance tracking.
 * @param state - Validated PrototypeState
 * @returns Serialization result with metrics
 */
export function serializeState(state: PrototypeState): SerializationResult {
  const warnings: string[] = [];
  const start = performance.now();

  const json = serializeStateRaw(state);

  const durationMs = performance.now() - start;
  const sizeBytes = new Blob([json]).size;

  if (sizeBytes > MAX_STATE_SIZE_BYTES) {
    warnings.push(
      `State size (${sizeBytes} bytes) exceeds ${MAX_STATE_SIZE_BYTES} byte limit`,
    );
  }

  if (durationMs > MAX_SERIALIZATION_DURATION_MS) {
    warnings.push(
      `Serialization took ${durationMs.toFixed(1)}ms, exceeding ${MAX_SERIALIZATION_DURATION_MS}ms threshold`,
    );
  }

  // Log warnings in development
  if (warnings.length > 0) {
    console.debug('[StateCaptureService] Serialization warnings:', warnings);
  }

  return { json, sizeBytes, durationMs, warnings };
}

/**
 * Deserialize a JSON string to PrototypeState.
 * Returns null if parsing or validation fails.
 */
export function deserializeState(json: string): PrototypeState | null {
  try {
    return deserializeStateRaw(json);
  } catch {
    console.debug('[StateCaptureService] Deserialization failed for input');
    return null;
  }
}

/**
 * Create an empty PrototypeState with sensible defaults.
 * Useful for initialization before any captures occur.
 */
export function createInitialState(prototypeId: string): PrototypeState {
  return createEmptyPrototypeState(prototypeId);
}

/**
 * Evaluate performance metrics for a captured state.
 * Checks capture duration, serialization time, and state size against thresholds.
 *
 * @param state - The captured prototype state to evaluate
 * @param serializationDurationMs - Optional serialization duration (from serializeState result).
 *   When provided, evaluates against MAX_SERIALIZATION_DURATION_MS threshold.
 */
export function evaluatePerformance(
  state: PrototypeState,
  serializationDurationMs?: number,
): PerformanceMetrics {
  const warnings: string[] = [];

  const captureWithinThreshold =
    state.metadata.captureDurationMs <= MAX_CAPTURE_DURATION_MS;
  if (!captureWithinThreshold) {
    warnings.push(
      `Capture took ${state.metadata.captureDurationMs}ms (limit: ${MAX_CAPTURE_DURATION_MS}ms)`,
    );
  }

  const sizeWithinThreshold =
    state.metadata.serializedSizeBytes <= MAX_STATE_SIZE_BYTES;
  if (!sizeWithinThreshold) {
    warnings.push(
      `State size ${state.metadata.serializedSizeBytes} bytes exceeds ${MAX_STATE_SIZE_BYTES} byte limit`,
    );
  }

  // Evaluate serialization duration when provided (from serializeState result)
  let serializationWithinThreshold = true;
  if (serializationDurationMs !== undefined) {
    serializationWithinThreshold =
      serializationDurationMs <= MAX_SERIALIZATION_DURATION_MS;
    if (!serializationWithinThreshold) {
      warnings.push(
        `Serialization took ${serializationDurationMs.toFixed(1)}ms (limit: ${MAX_SERIALIZATION_DURATION_MS}ms)`,
      );
    }
  }

  return {
    captureWithinThreshold,
    serializationWithinThreshold,
    sizeWithinThreshold,
    warnings,
  };
}

/**
 * Merge a partial state update into an existing state.
 * Useful for incremental updates where only some sections changed.
 */
export function mergeState(
  existing: PrototypeState,
  partial: Partial<Pick<PrototypeState, 'route' | 'forms' | 'components' | 'localStorage'>>,
): PrototypeState {
  return {
    ...existing,
    ...(partial.route !== undefined && { route: partial.route }),
    ...(partial.forms !== undefined && {
      forms: { ...existing.forms, ...partial.forms },
    }),
    ...(partial.components !== undefined && {
      components: { ...existing.components, ...partial.components },
    }),
    ...(partial.localStorage !== undefined && {
      localStorage: { ...existing.localStorage, ...partial.localStorage },
    }),
    timestamp: new Date().toISOString(),
  };
}

/** Convenience export grouping all service functions */
export const stateCaptureService = {
  validateState,
  serializeState,
  deserializeState,
  createInitialState,
  evaluatePerformance,
  mergeState,
};
