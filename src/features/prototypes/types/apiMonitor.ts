// src/features/prototypes/types/apiMonitor.ts
//
// Type definitions for the API Call Monitoring feature (Story 10.5).
// These types define the message protocol between the Sandpack iframe
// (generated apiClient.js) and the parent app (monitoring bridge hook).

/**
 * A single API call log entry captured by the monitoring code
 * in the generated apiClient.js and sent via postMessage.
 */
export interface ApiCallLogEntry {
  /** Unique ID for this call (e.g., "call-1") */
  id: string;
  /** ISO 8601 timestamp when the call was initiated */
  timestamp: string;
  /** The endpoint name from the API config (e.g., "getUsers") */
  endpointName: string;
  /** HTTP method or "AI" for AI endpoints */
  method: string;
  /** Target URL, "mock://<name>" for mock, "prototype-ai-call" for AI */
  url: string;
  /** Request headers (sensitive values redacted) */
  requestHeaders: Record<string, string>;
  /** Request body/prompt (truncated if > 10KB) */
  requestBody: string | null;
  /** HTTP response status code (0 for network errors) */
  responseStatus: number;
  /** HTTP response status text */
  responseStatusText: string;
  /** Response headers */
  responseHeaders: Record<string, string>;
  /** Response body (truncated if > 10KB) */
  responseBody: string | null;
  /** Call duration in milliseconds */
  durationMs: number;
  /** Whether the call resulted in an error */
  isError: boolean;
  /** Whether this is an AI endpoint call */
  isAi: boolean;
  /** Whether this is a mock endpoint call */
  isMock: boolean;
  /** Error message if the call failed */
  errorMessage: string | null;
}

/**
 * postMessage structure sent from Sandpack iframe to parent window.
 */
export interface ApiMonitorMessage {
  type: 'API_CALL_LOG';
  payload: ApiCallLogEntry;
  source: 'sandpack-api-monitor';
}

/**
 * Filter options for the API monitor panel.
 */
export type ApiMonitorFilter = 'all' | 'success' | 'error';
