// src/features/prototypes/services/stateCaptureService.test.ts

import { describe, it, expect, vi } from 'vitest';
import {
  validateState,
  serializeState,
  deserializeState,
  createInitialState,
  evaluatePerformance,
  mergeState,
  stateCaptureService,
} from './stateCaptureService';
import type { PrototypeState } from '../types/prototypeState';
import {
  PROTOTYPE_STATE_VERSION,
  MAX_STATE_SIZE_BYTES,
  MAX_CAPTURE_DURATION_MS,
  MAX_SERIALIZATION_DURATION_MS,
} from '../types/prototypeState';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidState(overrides: Partial<PrototypeState> = {}): PrototypeState {
  return {
    version: PROTOTYPE_STATE_VERSION,
    timestamp: '2026-02-07T12:00:00.000Z',
    prototypeId: 'proto-svc-123',
    route: {
      pathname: '/home',
      search: '',
      hash: '',
      state: null,
    },
    forms: {
      email: { value: 'test@example.com', type: 'email' },
    },
    components: {
      darkMode: { type: 'toggle', state: true },
    },
    localStorage: { lang: 'en' },
    metadata: {
      captureDurationMs: 8,
      serializedSizeBytes: 512,
      capturedAt: '2026-02-07T12:00:00.000Z',
      captureMethod: 'auto',
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// validateState
// ---------------------------------------------------------------------------

describe('validateState', () => {
  it('returns true for a valid state', () => {
    expect(validateState(makeValidState())).toBe(true);
  });

  it('returns false for null', () => {
    expect(validateState(null)).toBe(false);
  });

  it('returns false for a plain object without required fields', () => {
    expect(validateState({ foo: 'bar' })).toBe(false);
  });

  it('returns false for a string', () => {
    expect(validateState('not a state')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// serializeState
// ---------------------------------------------------------------------------

describe('serializeState', () => {
  it('returns a valid JSON string', () => {
    const result = serializeState(makeValidState());
    expect(() => JSON.parse(result.json)).not.toThrow();
  });

  it('reports size in bytes', () => {
    const result = serializeState(makeValidState());
    expect(result.sizeBytes).toBeGreaterThan(0);
  });

  it('reports duration in ms', () => {
    const result = serializeState(makeValidState());
    expect(typeof result.durationMs).toBe('number');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('returns no warnings for a small state', () => {
    const result = serializeState(makeValidState());
    expect(result.warnings).toEqual([]);
  });

  it('warns when state exceeds MAX_STATE_SIZE_BYTES', () => {
    const state = makeValidState();
    // Create a very large localStorage payload
    const bigValue = 'x'.repeat(MAX_STATE_SIZE_BYTES + 1000);
    state.localStorage = { bigKey: bigValue };
    const result = serializeState(state);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('exceeds');
  });
});

// ---------------------------------------------------------------------------
// deserializeState
// ---------------------------------------------------------------------------

describe('deserializeState', () => {
  it('round-trips a valid state', () => {
    const state = makeValidState();
    const { json } = serializeState(state);
    const result = deserializeState(json);
    expect(result).toEqual(state);
  });

  it('returns null for invalid JSON', () => {
    expect(deserializeState('not json {')).toBeNull();
  });

  it('returns null for valid JSON with invalid schema', () => {
    expect(deserializeState('{"bad": true}')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(deserializeState('')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// createInitialState
// ---------------------------------------------------------------------------

describe('createInitialState', () => {
  it('creates a valid state for the given prototype id', () => {
    const state = createInitialState('proto-init-1');
    expect(state.prototypeId).toBe('proto-init-1');
    expect(state.version).toBe(PROTOTYPE_STATE_VERSION);
    expect(validateState(state)).toBe(true);
  });

  it('starts with empty collections', () => {
    const state = createInitialState('proto-init-2');
    expect(state.forms).toEqual({});
    expect(state.components).toEqual({});
    expect(state.localStorage).toEqual({});
  });

  it('sets default route to /', () => {
    const state = createInitialState('proto-init-3');
    expect(state.route.pathname).toBe('/');
  });
});

// ---------------------------------------------------------------------------
// evaluatePerformance
// ---------------------------------------------------------------------------

describe('evaluatePerformance', () => {
  it('reports all thresholds met for a fast, small capture', () => {
    const state = makeValidState({
      metadata: {
        captureDurationMs: 5,
        serializedSizeBytes: 256,
        capturedAt: '2026-02-07T12:00:00.000Z',
        captureMethod: 'auto',
      },
    });
    const metrics = evaluatePerformance(state);
    expect(metrics.captureWithinThreshold).toBe(true);
    expect(metrics.sizeWithinThreshold).toBe(true);
    expect(metrics.warnings).toEqual([]);
  });

  it('flags slow capture duration', () => {
    const state = makeValidState({
      metadata: {
        captureDurationMs: MAX_CAPTURE_DURATION_MS + 10,
        serializedSizeBytes: 256,
        capturedAt: '2026-02-07T12:00:00.000Z',
        captureMethod: 'auto',
      },
    });
    const metrics = evaluatePerformance(state);
    expect(metrics.captureWithinThreshold).toBe(false);
    expect(metrics.warnings.length).toBeGreaterThan(0);
  });

  it('flags oversized state', () => {
    const state = makeValidState({
      metadata: {
        captureDurationMs: 5,
        serializedSizeBytes: MAX_STATE_SIZE_BYTES + 1,
        capturedAt: '2026-02-07T12:00:00.000Z',
        captureMethod: 'auto',
      },
    });
    const metrics = evaluatePerformance(state);
    expect(metrics.sizeWithinThreshold).toBe(false);
    expect(metrics.warnings.length).toBeGreaterThan(0);
  });

  it('defaults serializationWithinThreshold to true when no duration provided', () => {
    const state = makeValidState();
    const metrics = evaluatePerformance(state);
    expect(metrics.serializationWithinThreshold).toBe(true);
  });

  it('flags slow serialization when duration is provided', () => {
    const state = makeValidState();
    const metrics = evaluatePerformance(state, MAX_SERIALIZATION_DURATION_MS + 50);
    expect(metrics.serializationWithinThreshold).toBe(false);
    expect(metrics.warnings.some((w) => w.includes('Serialization'))).toBe(true);
  });

  it('passes serialization threshold when duration is within limit', () => {
    const state = makeValidState();
    const metrics = evaluatePerformance(state, 10);
    expect(metrics.serializationWithinThreshold).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// mergeState
// ---------------------------------------------------------------------------

describe('mergeState', () => {
  it('merges route update', () => {
    const base = makeValidState();
    const merged = mergeState(base, {
      route: { pathname: '/new', search: '', hash: '', state: null },
    });
    expect(merged.route.pathname).toBe('/new');
    // Forms should be unchanged
    expect(merged.forms).toEqual(base.forms);
  });

  it('merges form fields additively', () => {
    const base = makeValidState();
    const merged = mergeState(base, {
      forms: { name: { value: 'John', type: 'text' } },
    });
    expect(merged.forms.email).toEqual(base.forms.email);
    expect(merged.forms.name).toEqual({ value: 'John', type: 'text' });
  });

  it('merges components additively', () => {
    const base = makeValidState();
    const merged = mergeState(base, {
      components: { sidebar: { type: 'toggle', state: false } },
    });
    expect(merged.components.darkMode).toEqual(base.components.darkMode);
    expect(merged.components.sidebar.state).toBe(false);
  });

  it('merges localStorage additively', () => {
    const base = makeValidState();
    const merged = mergeState(base, {
      localStorage: { newKey: 'newVal' },
    });
    expect(merged.localStorage.lang).toBe('en');
    expect(merged.localStorage.newKey).toBe('newVal');
  });

  it('updates timestamp on merge', () => {
    const base = makeValidState();
    const merged = mergeState(base, {});
    expect(merged.timestamp).not.toBe(base.timestamp);
  });

  it('preserves fields not included in partial', () => {
    const base = makeValidState();
    const merged = mergeState(base, {
      route: { pathname: '/x', search: '', hash: '', state: null },
    });
    expect(merged.version).toBe(base.version);
    expect(merged.prototypeId).toBe(base.prototypeId);
    expect(merged.metadata).toEqual(base.metadata);
  });
});

// ---------------------------------------------------------------------------
// stateCaptureService object
// ---------------------------------------------------------------------------

describe('stateCaptureService export', () => {
  it('exposes all service functions', () => {
    expect(typeof stateCaptureService.validateState).toBe('function');
    expect(typeof stateCaptureService.serializeState).toBe('function');
    expect(typeof stateCaptureService.deserializeState).toBe('function');
    expect(typeof stateCaptureService.createInitialState).toBe('function');
    expect(typeof stateCaptureService.evaluatePerformance).toBe('function');
    expect(typeof stateCaptureService.mergeState).toBe('function');
  });
});
