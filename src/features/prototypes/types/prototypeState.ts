// src/features/prototypes/types/prototypeState.ts
//
// State capture schema and types for prototype runtime state persistence.
// Schema version: 1.0 - versioned for future migrations.

/** Current schema version for prototype state */
export const PROTOTYPE_STATE_VERSION = '1.0';

/** Maximum recommended state size in bytes (warn if exceeded) */
export const MAX_STATE_SIZE_BYTES = 100 * 1024; // 100KB

/** Maximum acceptable capture duration in milliseconds */
export const MAX_CAPTURE_DURATION_MS = 50;

/** Maximum acceptable serialization duration in milliseconds */
export const MAX_SERIALIZATION_DURATION_MS = 100;

// ---------------------------------------------------------------------------
// Sub-interfaces
// ---------------------------------------------------------------------------

/** Captured navigation/route state from the prototype */
export interface RouteState {
  /** Current URL pathname, e.g., "/dashboard/settings" */
  pathname: string;
  /** URL search/query string, e.g., "?tab=profile&id=123" */
  search: string;
  /** URL hash fragment, e.g., "#section-1" */
  hash: string;
  /** React Router state object (if available) */
  state: Record<string, unknown> | null;
}

/** Value descriptor for a single captured form field */
export interface FormFieldValue {
  /** Field value (string for text fields, boolean for checkbox, string[] for multi-select) */
  value: string | boolean | string[];
  /** HTML input type: "text", "email", "checkbox", "radio", "select", "textarea", etc. */
  type: string;
  /** Whether the field is checked (checkboxes and radios only) */
  checked?: boolean;
  /** Selected option values for multi-select fields */
  selectedOptions?: string[];
}

/** Map of captured form field values keyed by field name/id */
export interface FormFieldsState {
  [fieldKey: string]: FormFieldValue;
}

/** Value descriptor for a single captured UI component state */
export interface ComponentStateValue {
  /** Component type: "toggle", "modal", "accordion", "tabs" */
  type: string;
  /** Component-specific state (boolean for toggles, string for tabs, etc.) */
  state: boolean | string | number;
  /** Additional attributes for debugging/identification */
  attributes?: Record<string, string>;
}

/** Map of captured component states keyed by component identifier */
export interface ComponentState {
  [componentKey: string]: ComponentStateValue;
}

/** Map of captured localStorage key-value pairs (values are always strings) */
export interface LocalStorageState {
  [key: string]: string;
}

/** Metadata about the state capture event */
export interface StateMetadata {
  /** Time taken to capture state in milliseconds */
  captureDurationMs: number;
  /** Size of JSON.stringify(state) in bytes */
  serializedSizeBytes: number;
  /** ISO 8601 timestamp of when capture occurred */
  capturedAt: string;
  /** How the capture was triggered: "auto", "manual", "beforeUnload" */
  captureMethod: 'auto' | 'manual' | 'beforeUnload';
}

// ---------------------------------------------------------------------------
// Primary interface
// ---------------------------------------------------------------------------

/**
 * Complete captured state of a running prototype.
 * Versioned schema for forward compatibility.
 */
export interface PrototypeState {
  /** Schema version, e.g., "1.0" */
  version: string;
  /** ISO 8601 timestamp of capture */
  timestamp: string;
  /** UUID of the prototype this state belongs to */
  prototypeId: string;
  /** Current navigation/route state */
  route: RouteState;
  /** All captured form field values */
  forms: FormFieldsState;
  /** Component-specific states (toggles, modals, accordions, tabs) */
  components: ComponentState;
  /** localStorage key-value pairs */
  localStorage: LocalStorageState;
  /** Capture event metadata */
  metadata: StateMetadata;
}

// ---------------------------------------------------------------------------
// postMessage protocol types
// ---------------------------------------------------------------------------

/** Message sent from Sandpack iframe to parent window */
export interface StateCaptureMessage {
  /** Message type identifier */
  type: 'PROTOTYPE_STATE_UPDATE';
  /** Captured state payload */
  payload: PrototypeState;
  /** Source identifier for validation */
  source: 'sandpack-state-capture';
}

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Create an empty RouteState with default values.
 */
export function createEmptyRouteState(): RouteState {
  return {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  };
}

/**
 * Create an empty PrototypeState with default values.
 * @param prototypeId - UUID of the prototype
 */
export function createEmptyPrototypeState(prototypeId: string): PrototypeState {
  const now = new Date().toISOString();
  return {
    version: PROTOTYPE_STATE_VERSION,
    timestamp: now,
    prototypeId,
    route: createEmptyRouteState(),
    forms: {},
    components: {},
    localStorage: {},
    metadata: {
      captureDurationMs: 0,
      serializedSizeBytes: 0,
      capturedAt: now,
      captureMethod: 'auto',
    },
  };
}

// ---------------------------------------------------------------------------
// Serialization / Deserialization helpers
// ---------------------------------------------------------------------------

/**
 * Serialize a PrototypeState to a JSON string.
 * @returns JSON string representation
 */
export function serializeState(state: PrototypeState): string {
  return JSON.stringify(state);
}

/**
 * Deserialize a JSON string back to a PrototypeState.
 * Returns null if parsing or validation fails.
 * @param json - JSON string to parse
 */
export function deserializeState(json: string): PrototypeState | null {
  try {
    const parsed: unknown = JSON.parse(json);
    if (validateStateSchema(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

/**
 * Validate that an unknown value conforms to the PrototypeState schema.
 * Performs structural type checking without external libraries.
 */
export function validateStateSchema(value: unknown): value is PrototypeState {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  // Required top-level string fields
  if (typeof obj.version !== 'string') return false;
  if (typeof obj.timestamp !== 'string') return false;
  if (typeof obj.prototypeId !== 'string') return false;

  // Route validation
  if (!isValidRouteState(obj.route)) return false;

  // Forms - must be an object (can be empty)
  if (typeof obj.forms !== 'object' || obj.forms === null || Array.isArray(obj.forms)) return false;

  // Components - must be an object (can be empty)
  if (typeof obj.components !== 'object' || obj.components === null || Array.isArray(obj.components))
    return false;

  // localStorage - must be an object (can be empty)
  if (
    typeof obj.localStorage !== 'object' ||
    obj.localStorage === null ||
    Array.isArray(obj.localStorage)
  )
    return false;

  // Metadata validation
  if (!isValidMetadata(obj.metadata)) return false;

  return true;
}

/**
 * Validate RouteState sub-schema.
 */
function isValidRouteState(value: unknown): value is RouteState {
  if (typeof value !== 'object' || value === null) return false;
  const route = value as Record<string, unknown>;
  return (
    typeof route.pathname === 'string' &&
    typeof route.search === 'string' &&
    typeof route.hash === 'string' &&
    (route.state === null || typeof route.state === 'object')
  );
}

/**
 * Validate StateMetadata sub-schema.
 */
function isValidMetadata(value: unknown): value is StateMetadata {
  if (typeof value !== 'object' || value === null) return false;
  const meta = value as Record<string, unknown>;
  return (
    typeof meta.captureDurationMs === 'number' &&
    typeof meta.serializedSizeBytes === 'number' &&
    typeof meta.capturedAt === 'string' &&
    typeof meta.captureMethod === 'string' &&
    ['auto', 'manual', 'beforeUnload'].includes(meta.captureMethod as string)
  );
}
