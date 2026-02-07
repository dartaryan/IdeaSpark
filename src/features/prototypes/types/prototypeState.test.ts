// src/features/prototypes/types/prototypeState.test.ts

import { describe, it, expect } from 'vitest';
import {
  PROTOTYPE_STATE_VERSION,
  MAX_STATE_SIZE_BYTES,
  MAX_CAPTURE_DURATION_MS,
  MAX_SERIALIZATION_DURATION_MS,
  createEmptyRouteState,
  createEmptyPrototypeState,
  serializeState,
  deserializeState,
  validateStateSchema,
} from './prototypeState';
import type {
  PrototypeState,
  RouteState,
  FormFieldValue,
  ComponentStateValue,
  StateMetadata,
} from './prototypeState';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidState(overrides: Partial<PrototypeState> = {}): PrototypeState {
  return {
    version: PROTOTYPE_STATE_VERSION,
    timestamp: '2026-02-07T12:00:00.000Z',
    prototypeId: 'proto-abc-123',
    route: {
      pathname: '/dashboard',
      search: '?tab=overview',
      hash: '#top',
      state: null,
    },
    forms: {
      username: { value: 'john', type: 'text' },
    },
    components: {
      sidebar: { type: 'toggle', state: true },
    },
    localStorage: { theme: 'dark' },
    metadata: {
      captureDurationMs: 12,
      serializedSizeBytes: 450,
      capturedAt: '2026-02-07T12:00:00.000Z',
      captureMethod: 'auto',
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('prototypeState constants', () => {
  it('has a schema version of "1.0"', () => {
    expect(PROTOTYPE_STATE_VERSION).toBe('1.0');
  });

  it('defines MAX_STATE_SIZE_BYTES as 100KB', () => {
    expect(MAX_STATE_SIZE_BYTES).toBe(102400);
  });

  it('defines MAX_CAPTURE_DURATION_MS as 50', () => {
    expect(MAX_CAPTURE_DURATION_MS).toBe(50);
  });

  it('defines MAX_SERIALIZATION_DURATION_MS as 100', () => {
    expect(MAX_SERIALIZATION_DURATION_MS).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// createEmptyRouteState
// ---------------------------------------------------------------------------

describe('createEmptyRouteState', () => {
  it('returns a valid empty route state', () => {
    const route: RouteState = createEmptyRouteState();
    expect(route.pathname).toBe('/');
    expect(route.search).toBe('');
    expect(route.hash).toBe('');
    expect(route.state).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// createEmptyPrototypeState
// ---------------------------------------------------------------------------

describe('createEmptyPrototypeState', () => {
  it('returns a valid empty prototype state for the given id', () => {
    const state = createEmptyPrototypeState('proto-42');
    expect(state.version).toBe(PROTOTYPE_STATE_VERSION);
    expect(state.prototypeId).toBe('proto-42');
    expect(state.route.pathname).toBe('/');
    expect(state.forms).toEqual({});
    expect(state.components).toEqual({});
    expect(state.localStorage).toEqual({});
    expect(state.metadata.captureMethod).toBe('auto');
    expect(state.metadata.captureDurationMs).toBe(0);
    expect(state.metadata.serializedSizeBytes).toBe(0);
  });

  it('contains valid ISO 8601 timestamps', () => {
    const state = createEmptyPrototypeState('proto-42');
    expect(() => new Date(state.timestamp)).not.toThrow();
    expect(() => new Date(state.metadata.capturedAt)).not.toThrow();
  });

  it('passes schema validation', () => {
    const state = createEmptyPrototypeState('proto-42');
    expect(validateStateSchema(state)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateStateSchema
// ---------------------------------------------------------------------------

describe('validateStateSchema', () => {
  it('validates a correct PrototypeState', () => {
    expect(validateStateSchema(makeValidState())).toBe(true);
  });

  it('rejects null', () => {
    expect(validateStateSchema(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(validateStateSchema(undefined)).toBe(false);
  });

  it('rejects a string', () => {
    expect(validateStateSchema('hello')).toBe(false);
  });

  it('rejects an array', () => {
    expect(validateStateSchema([])).toBe(false);
  });

  it('rejects missing version field', () => {
    const state = makeValidState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (state as any).version;
    expect(validateStateSchema(state)).toBe(false);
  });

  it('rejects missing timestamp field', () => {
    const state = makeValidState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (state as any).timestamp;
    expect(validateStateSchema(state)).toBe(false);
  });

  it('rejects missing prototypeId field', () => {
    const state = makeValidState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (state as any).prototypeId;
    expect(validateStateSchema(state)).toBe(false);
  });

  it('rejects when route is null', () => {
    expect(validateStateSchema(makeValidState({ route: null as unknown as RouteState }))).toBe(false);
  });

  it('rejects when route.pathname is missing', () => {
    const state = makeValidState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (state.route as any).pathname;
    expect(validateStateSchema(state)).toBe(false);
  });

  it('rejects when forms is an array', () => {
    expect(validateStateSchema({ ...makeValidState(), forms: [] })).toBe(false);
  });

  it('rejects when components is null', () => {
    expect(validateStateSchema({ ...makeValidState(), components: null })).toBe(false);
  });

  it('rejects when localStorage is an array', () => {
    expect(validateStateSchema({ ...makeValidState(), localStorage: [] })).toBe(false);
  });

  it('rejects when metadata is missing', () => {
    const state = makeValidState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (state as any).metadata;
    expect(validateStateSchema(state)).toBe(false);
  });

  it('rejects when metadata.captureMethod is invalid', () => {
    const state = makeValidState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state.metadata as any).captureMethod = 'invalid';
    expect(validateStateSchema(state)).toBe(false);
  });

  it('rejects when metadata.captureDurationMs is a string', () => {
    const state = makeValidState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state.metadata as any).captureDurationMs = 'fast';
    expect(validateStateSchema(state)).toBe(false);
  });

  it('accepts empty forms, components, and localStorage', () => {
    const state = makeValidState({ forms: {}, components: {}, localStorage: {} });
    expect(validateStateSchema(state)).toBe(true);
  });

  it('accepts route with non-null state object', () => {
    const state = makeValidState();
    state.route.state = { key: 'value' };
    expect(validateStateSchema(state)).toBe(true);
  });

  it('accepts all valid captureMethod values', () => {
    for (const method of ['auto', 'manual', 'beforeUnload'] as const) {
      const state = makeValidState();
      state.metadata.captureMethod = method;
      expect(validateStateSchema(state)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// serializeState / deserializeState round-trip
// ---------------------------------------------------------------------------

describe('serializeState', () => {
  it('returns valid JSON', () => {
    const state = makeValidState();
    const json = serializeState(state);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('preserves all fields', () => {
    const state = makeValidState();
    const json = serializeState(state);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(state.version);
    expect(parsed.prototypeId).toBe(state.prototypeId);
    expect(parsed.route.pathname).toBe(state.route.pathname);
  });
});

describe('deserializeState', () => {
  it('round-trips a valid state', () => {
    const state = makeValidState();
    const json = serializeState(state);
    const result = deserializeState(json);
    expect(result).toEqual(state);
  });

  it('returns null for invalid JSON', () => {
    expect(deserializeState('not json {')).toBeNull();
  });

  it('returns null for valid JSON that fails schema validation', () => {
    expect(deserializeState('{"foo": "bar"}')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(deserializeState('')).toBeNull();
  });

  it('returns null for a JSON array', () => {
    expect(deserializeState('[1, 2, 3]')).toBeNull();
  });

  it('returns null for a JSON string value', () => {
    expect(deserializeState('"just a string"')).toBeNull();
  });

  it('handles large state objects', () => {
    const state = makeValidState();
    // Add many form fields
    for (let i = 0; i < 100; i++) {
      state.forms[`field-${i}`] = { value: `value-${i}`, type: 'text' };
    }
    const json = serializeState(state);
    const result = deserializeState(json);
    expect(result).not.toBeNull();
    expect(Object.keys(result!.forms)).toHaveLength(101); // 100 + 1 original
  });
});

// ---------------------------------------------------------------------------
// Type-level checks (compile-time only, runtime assertion for structure)
// ---------------------------------------------------------------------------

describe('type structures', () => {
  it('FormFieldValue supports text field', () => {
    const field: FormFieldValue = { value: 'hello', type: 'text' };
    expect(field.value).toBe('hello');
    expect(field.type).toBe('text');
  });

  it('FormFieldValue supports checkbox field', () => {
    const field: FormFieldValue = { value: true, type: 'checkbox', checked: true };
    expect(field.checked).toBe(true);
  });

  it('FormFieldValue supports multi-select field', () => {
    const field: FormFieldValue = {
      value: ['a', 'b'],
      type: 'select',
      selectedOptions: ['a', 'b'],
    };
    expect(field.selectedOptions).toEqual(['a', 'b']);
  });

  it('ComponentStateValue supports toggle', () => {
    const comp: ComponentStateValue = { type: 'toggle', state: true };
    expect(comp.state).toBe(true);
  });

  it('ComponentStateValue supports tabs with string state', () => {
    const comp: ComponentStateValue = { type: 'tabs', state: 'settings' };
    expect(comp.state).toBe('settings');
  });

  it('ComponentStateValue supports optional attributes', () => {
    const comp: ComponentStateValue = {
      type: 'accordion',
      state: false,
      attributes: { 'data-id': 'section-1' },
    };
    expect(comp.attributes).toEqual({ 'data-id': 'section-1' });
  });

  it('StateMetadata has correct shape', () => {
    const meta: StateMetadata = {
      captureDurationMs: 5,
      serializedSizeBytes: 1024,
      capturedAt: '2026-02-07T12:00:00Z',
      captureMethod: 'manual',
    };
    expect(meta.captureMethod).toBe('manual');
  });
});
