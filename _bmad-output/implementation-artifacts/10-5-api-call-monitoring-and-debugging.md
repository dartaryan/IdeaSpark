# Story 10.5: API Call Monitoring & Debugging

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to **see logs of all API calls made by my prototype in a monitoring panel**,
so that **I can debug issues, verify integrations work correctly, and identify errors or performance problems in real-time without leaving the prototype viewer**.

## Acceptance Criteria

1. **Given** my prototype makes API calls (mock, AI, or real proxy), **When** I open the API monitor panel, **Then** I see a chronological list of all requests made during this session, **And** each entry shows: Endpoint name, HTTP Method (or "AI" for AI endpoints), Status Code, Response Time (ms), and a timestamp.
2. **Given** I click on a logged API call in the monitor list, **When** the detail view opens, **Then** I see the full request details (endpoint name, URL/type, method, headers, body/prompt) **And** I see the full response details (status, headers, body/AI text, error details if any), **And** I can clearly identify errors or unexpected responses through color-coded status indicators.
3. **Given** no API calls have been made yet, **When** I open the API monitor, **Then** I see an empty state with a message like "No API calls recorded yet. Interact with the prototype to see API activity."
4. **Given** an API call fails (network error, timeout, 4xx/5xx status), **When** I view the monitor, **Then** the failed call is highlighted in red/error color, **And** clicking it shows the error details including the error message and status code.
5. **Given** the prototype has made multiple API calls, **When** I view the monitor list, **Then** I can filter calls by status (All, Success, Error) **And** I can clear the log to start fresh.
6. **Given** the API monitor is logging calls, **When** I view the monitor header, **Then** I see a live count badge showing total calls and error count (e.g., "12 calls, 2 errors").
7. **Given** the monitor panel is integrated into the prototype viewer, **When** I toggle the API monitor, **Then** it appears as a collapsible panel that doesn't obstruct the prototype preview, **And** I can resize or minimize it.

## Tasks / Subtasks

- [x] Task 1: Add API call logging to generated `apiClient.js` (AC: #1, #4)
  - [x] 1.1 Update `apiClientInjector.ts` — Add a `__apiLog` array and `__apiCallId` counter to the generated code
  - [x] 1.2 Wrap each code path (mock, AI, proxy/direct) with timing and logging: capture start time, endpoint name, method, request details, then response status, body, duration
  - [x] 1.3 After each API call resolves, push a log entry to `__apiLog` and post a message to `parent` via `postMessage` with type `'API_CALL_LOG'`, source `'sandpack-api-monitor'`
  - [x] 1.4 Expose `window.__apiLog` for debugging access
  - [x] 1.5 Ensure logging does NOT break existing mock/AI/proxy behavior (wrapping, not modifying)

- [x] Task 2: Create API monitor message protocol and types (AC: #1, #2)
  - [x] 2.1 Create `src/features/prototypes/types/apiMonitor.ts` — Define `ApiCallLogEntry` interface: `{ id, timestamp, endpointName, method, url, requestHeaders, requestBody, responseStatus, responseHeaders, responseBody, durationMs, isError, isAi, isMock, errorMessage }`
  - [x] 2.2 Define `ApiMonitorMessage` type: `{ type: 'API_CALL_LOG', payload: ApiCallLogEntry, source: 'sandpack-api-monitor' }`
  - [x] 2.3 Define `ApiMonitorFilter` type: `'all' | 'success' | 'error'`
  - [x] 2.4 Export types from `src/features/prototypes/types.ts` barrel

- [x] Task 3: Create monitoring bridge hook (AC: #1, #6)
  - [x] 3.1 Create `src/features/prototypes/hooks/useSandpackMonitorBridge.ts` — Follow `useSandpackStateBridge.ts` pattern exactly
  - [x] 3.2 Listen for `'API_CALL_LOG'` messages from Sandpack iframe
  - [x] 3.3 Validate message source is `'sandpack-api-monitor'`
  - [x] 3.4 Validate origin using same `isValidOrigin()` pattern from state bridge
  - [x] 3.5 Maintain a `useState<ApiCallLogEntry[]>` array (max 200 entries, FIFO)
  - [x] 3.6 Expose: `{ logs, totalCount, errorCount, clearLogs, isEnabled }`
  - [x] 3.7 Add `enabled` prop to control whether monitoring is active

- [x] Task 4: Create `ApiMonitorPanel.tsx` component (AC: #1, #3, #5, #6, #7)
  - [x] 4.1 Create `src/features/prototypes/components/ApiMonitorPanel.tsx`
  - [x] 4.2 Panel header: title "API Monitor", live count badge (total/errors), filter buttons (All/Success/Error), Clear button
  - [x] 4.3 Request list: scrollable list of `ApiCallLogEntry` items, each showing endpoint name, method badge, status code badge (color-coded: green 2xx, yellow 3xx, red 4xx/5xx/error), duration in ms, timestamp
  - [x] 4.4 Empty state: when no logs, show informative message with icon (AC #3)
  - [x] 4.5 Error highlighting: failed calls get `bg-error/10` background and red status badge (AC #4)
  - [x] 4.6 Use DaisyUI components: `card`, `badge`, `btn`, `btn-group`, `collapse`, `table` or custom list
  - [x] 4.7 Apply PassportCard theme styling

- [x] Task 5: Create `ApiCallDetail.tsx` component (AC: #2, #4)
  - [x] 5.1 Create `src/features/prototypes/components/ApiCallDetail.tsx`
  - [x] 5.2 Display as modal or slide-over panel when user clicks a log entry
  - [x] 5.3 Request section: endpoint name, URL/type (show "AI: model-name" for AI calls, mock indicator for mock calls), method, headers (collapsible JSON), body/prompt (syntax-highlighted or formatted)
  - [x] 5.4 Response section: status code with color indicator, headers (collapsible JSON), body (syntax-highlighted JSON or AI text), error message if present
  - [x] 5.5 Timing section: total duration, timestamp
  - [x] 5.6 Copy buttons for request body and response body
  - [x] 5.7 Use DaisyUI `modal` or `drawer` component

- [x] Task 6: Integrate monitor into `PrototypeViewerPage.tsx` (AC: #7)
  - [x] 6.1 Add `useSandpackMonitorBridge` hook to PrototypeViewerPage
  - [x] 6.2 Add "API Monitor" toggle button in the prototype viewer toolbar/controls area
  - [x] 6.3 Render `ApiMonitorPanel` as a collapsible bottom panel or side panel
  - [x] 6.4 Pass `logs`, `totalCount`, `errorCount`, `clearLogs` from the bridge hook
  - [x] 6.5 Show monitor count badge on the toggle button (show error count in red if > 0)
  - [x] 6.6 Ensure monitor panel doesn't obstruct prototype preview when open

- [x] Task 7: Update `apiClientInjector.ts` monitoring code generation (AC: #1)
  - [x] 7.1 Create `generateMonitoringCodePath()` function in `apiClientInjector.ts`
  - [x] 7.2 The monitoring code wraps each existing code path (mock, AI, proxy) with try/catch timing
  - [x] 7.3 Generate the postMessage call after each response
  - [x] 7.4 Include request details (sanitized — no auth tokens in logs)
  - [x] 7.5 Include response details (truncated body if > 10KB to avoid performance issues)

- [x] Task 8: Tests (all ACs)
  - [x] 8.1 Unit tests for updated `apiClientInjector.ts`: verify monitoring code is generated, postMessage calls included, logging wraps all three paths
  - [x] 8.2 Unit tests for `useSandpackMonitorBridge.ts`: verify message handling, origin validation, log accumulation, max entries, clearLogs, error counting
  - [x] 8.3 Unit tests for `ApiMonitorPanel.tsx`: verify list rendering, empty state, filter buttons, clear button, error highlighting, count badges
  - [x] 8.4 Unit tests for `ApiCallDetail.tsx`: verify request/response display, error details, copy buttons, AI/mock indicators
  - [x] 8.5 Regression: all existing `apiClientInjector.test.ts` tests pass (monitoring code doesn't break existing paths)
  - [x] 8.6 Regression: all existing `SandpackLivePreview.test.tsx` tests pass
  - [x] 8.7 Regression: run full `src/features/prototypes/` test suite

## Dev Notes

### Architecture & Patterns

- **CRITICAL: This is a client-side-only monitoring feature.** No database changes, no new Edge Functions, no new migrations. All monitoring data lives in React state and is ephemeral (per session). Do NOT persist API call logs to the database.
- **The core approach:** Enhance the generated `apiClient.js` (via `apiClientInjector.ts`) to log every API call and send logs to the parent via `postMessage`. The parent app listens via a bridge hook and displays logs in a UI panel.
- **Follow the state capture bridge pattern EXACTLY:** The state capture system (`useSandpackStateBridge.ts` + `stateCaptureInjector.ts`) already implements the iframe-to-parent messaging pattern. The monitoring feature uses the same architecture with different message types.
- **Service Response Pattern**: `ServiceResponse<T>` = `{ data: T | null, error: Error | null }`. See `apiConfigService.ts`.
- **Stories 10.1-10.4 built the complete API configuration pipeline.** The generated `apiCall()` function has three code paths: mock → AI → proxy/direct. This story adds monitoring hooks that WRAP (not replace) these existing paths.
- **Generated code structure:** The `apiClientInjector.ts` generates self-contained JavaScript for Sandpack injection. The monitoring code must be generated JavaScript (not TypeScript) embedded in the generated file.

### Message Protocol (New)

**API Call Log Message (Sandpack → Parent):**
```json
{
  "type": "API_CALL_LOG",
  "payload": {
    "id": "call-1",
    "timestamp": "2026-02-08T10:30:00.000Z",
    "endpointName": "getUsers",
    "method": "GET",
    "url": "https://api.example.com/users",
    "requestHeaders": { "Content-Type": "application/json" },
    "requestBody": null,
    "responseStatus": 200,
    "responseStatusText": "OK",
    "responseHeaders": {},
    "responseBody": "{\"users\": [...]}",
    "durationMs": 245,
    "isError": false,
    "isAi": false,
    "isMock": false,
    "errorMessage": null
  },
  "source": "sandpack-api-monitor"
}
```

**AI Call Log Example:**
```json
{
  "type": "API_CALL_LOG",
  "payload": {
    "id": "call-2",
    "endpointName": "generateDescription",
    "method": "AI",
    "url": "prototype-ai-call",
    "requestBody": "{\"prompt\": \"Write a product description...\"}",
    "responseStatus": 200,
    "responseBody": "{\"text\": \"The SmartHydrate Pro...\", \"model\": \"gemini-2.5-flash\"}",
    "durationMs": 3200,
    "isAi": true,
    "isMock": false
  },
  "source": "sandpack-api-monitor"
}
```

**Mock Call Log Example:**
```json
{
  "type": "API_CALL_LOG",
  "payload": {
    "id": "call-3",
    "endpointName": "getUsers",
    "method": "GET",
    "url": "mock://getUsers",
    "requestBody": null,
    "responseStatus": 200,
    "responseBody": "{\"users\": [...]}",
    "durationMs": 102,
    "isMock": true
  },
  "source": "sandpack-api-monitor"
}
```

### Generated `apiClient.js` Monitoring Enhancement

**Current `apiCall()` structure (simplified):**
```javascript
async function apiCall(endpointName, options = {}) {
  const config = configs[endpointName];
  if (!config) throw new Error('Unknown endpoint');

  // Path 1: Mock
  if (config.isMock) { /* return mock response */ }

  // Path 2: AI
  if (config.isAi) { /* route through prototype-ai-call */ }

  // Path 3: Proxy/Direct
  /* route through api-proxy or direct fetch */
}
```

**New `apiCall()` structure with monitoring:**
```javascript
var __apiCallId = 0;
var __apiLog = [];

async function apiCall(endpointName, options = {}) {
  var callId = 'call-' + (++__apiCallId);
  var startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  var config = configs[endpointName];
  if (!config) throw new Error('Unknown endpoint: ' + endpointName);

  var logEntry = {
    id: callId,
    timestamp: new Date().toISOString(),
    endpointName: endpointName,
    method: config.isAi ? 'AI' : (options.method || config.method || 'GET'),
    url: config.isMock ? 'mock://' + endpointName : (config.isAi ? 'prototype-ai-call' : config.url),
    requestHeaders: config.isMock ? {} : (options.headers || {}),
    requestBody: options.body || options.prompt || null,
    responseStatus: 0,
    responseStatusText: '',
    responseHeaders: {},
    responseBody: null,
    durationMs: 0,
    isError: false,
    isAi: !!config.isAi,
    isMock: !!config.isMock,
    errorMessage: null
  };

  var response;
  try {
    // ... existing mock/AI/proxy logic (unchanged) ...
    response = /* result from existing code path */;

    // Capture response
    logEntry.responseStatus = response.status;
    logEntry.responseStatusText = response.statusText || '';
    logEntry.isError = !response.ok;
    // Clone response body for logging (truncate if > 10KB)
    try {
      var bodyClone = await response.json();
      var bodyStr = JSON.stringify(bodyClone);
      logEntry.responseBody = bodyStr.length > 10240 ? bodyStr.substring(0, 10240) + '...[truncated]' : bodyStr;
    } catch(e) {
      logEntry.responseBody = '[Unable to parse response body]';
    }
  } catch (err) {
    logEntry.isError = true;
    logEntry.errorMessage = err.message || 'Unknown error';
    logEntry.responseStatus = 0;
  }

  // Record timing
  logEntry.durationMs = Math.round(
    ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime) * 100
  ) / 100;

  // Store log
  __apiLog.push(logEntry);
  if (__apiLog.length > 200) __apiLog.shift();

  // Send to parent
  try {
    parent.postMessage({
      type: 'API_CALL_LOG',
      payload: logEntry,
      source: 'sandpack-api-monitor'
    }, '*');
  } catch(e) { /* silently fail */ }

  if (logEntry.isError && !response) {
    throw new Error(logEntry.errorMessage || 'API call failed');
  }
  return response;
}
```

**CRITICAL: The response body logging approach** — The current `apiCall()` returns response objects with `json()` and `text()` methods. These are single-use (can only be called once). The monitoring code must NOT consume the response body before the prototype code does. Solution: For mock and AI paths, the response body is already available as data (not a stream). For proxy/direct paths, clone the response or capture the body during the existing response construction.

**Better approach for proxy/direct path:** Since the proxy already reads the response and constructs a response object, capture the body at construction time (it's already parsed). Don't call `.json()` again on the returned object.

### Hook Pattern: `useSandpackMonitorBridge`

```typescript
// src/features/prototypes/hooks/useSandpackMonitorBridge.ts

interface UseSandpackMonitorBridgeOptions {
  enabled?: boolean;
  maxEntries?: number;
}

interface UseSandpackMonitorBridgeReturn {
  logs: ApiCallLogEntry[];
  totalCount: number;
  errorCount: number;
  clearLogs: () => void;
}

// Follow useSandpackStateBridge.ts pattern:
// - useEffect with message event listener
// - Validate type === 'API_CALL_LOG'
// - Validate source === 'sandpack-api-monitor'
// - Validate origin with isValidOrigin()
// - Append to logs state (FIFO, max 200)
// - Cleanup on unmount
```

### UI Components

**ApiMonitorPanel.tsx:**
```
┌─ API Monitor ──────── 12 calls, 2 errors ─── [All] [✓] [✗] [🗑 Clear] ─┐
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────┤
│ │ 10:30:02  GET   getUsers           200  ●  245ms                      │
│ │ 10:30:05  AI    generateDesc       200  ●  3200ms                     │
│ │ 10:30:08  POST  createItem         201  ●  156ms                      │
│ │ 10:30:12  GET   getProducts        500  ●  89ms     ← red bg          │
│ │ 10:30:15  GET   getUsers (mock)    200  ●  102ms                      │
│ │ ...                                                                    │
│ └─────────────────────────────────────────────────────────────────────────┤
└───────────────────────────────────────────────────────────────────────────┘
```

**ApiCallDetail.tsx (Modal):**
```
┌─ API Call Detail ──────────────────────────────────────── [✕] ──┐
│                                                                  │
│ GET getUsers                                    245ms            │
│ https://api.example.com/users                   10:30:02 AM     │
│                                                                  │
│ ┌─ Request ──────────────────────────────────────────────────┐  │
│ │ Headers:                                        [Copy]     │  │
│ │ { "Content-Type": "application/json",                      │  │
│ │   "Authorization": "[redacted]" }                          │  │
│ │                                                            │  │
│ │ Body: (none)                                               │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌─ Response ─────────────────────────────────── 200 OK ──────┐  │
│ │ Body:                                           [Copy]     │  │
│ │ {                                                          │  │
│ │   "users": [                                               │  │
│ │     { "id": 1, "name": "John" },                          │  │
│ │     ...                                                    │  │
│ │   ]                                                        │  │
│ │ }                                                          │  │
│ └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### What Currently Exists (Relevant Files)

| File | Role | Changes Needed |
|------|------|---------------|
| `src/features/prototypes/utils/apiClientInjector.ts` | Generates apiClient.js for Sandpack | **MODIFY**: Add monitoring code generation — timing, logging, postMessage calls |
| `src/features/prototypes/utils/apiClientInjector.test.ts` | Injector tests | **MODIFY**: Add monitoring code generation tests |
| `src/features/prototypes/hooks/useSandpackStateBridge.ts` | State capture bridge | **REFERENCE**: Pattern to follow for monitoring bridge |
| `src/features/prototypes/hooks/useStateCapturePerformance.ts` | Performance monitoring | **REFERENCE**: Performance measurement patterns |
| `src/features/prototypes/scripts/stateCaptureInjector.ts` | Injected JS for state capture | **REFERENCE**: postMessage and injection patterns |
| `src/features/prototypes/types.ts` | Types barrel | **MODIFY**: Export new monitoring types |
| `src/pages/PrototypeViewerPage.tsx` | Prototype viewer page | **MODIFY**: Add monitor bridge hook and panel toggle |
| `src/features/prototypes/components/SandpackLivePreview.tsx` | Sandpack integration | **NO CHANGES**: apiClientInjector changes are sufficient |

### New Files

| File | Role |
|------|------|
| `src/features/prototypes/types/apiMonitor.ts` | **NEW**: Monitoring type definitions |
| `src/features/prototypes/hooks/useSandpackMonitorBridge.ts` | **NEW**: Bridge hook for monitoring messages |
| `src/features/prototypes/hooks/useSandpackMonitorBridge.test.ts` | **NEW**: Bridge hook tests |
| `src/features/prototypes/components/ApiMonitorPanel.tsx` | **NEW**: Monitor panel component |
| `src/features/prototypes/components/ApiMonitorPanel.test.tsx` | **NEW**: Monitor panel tests |
| `src/features/prototypes/components/ApiCallDetail.tsx` | **NEW**: Call detail modal component |
| `src/features/prototypes/components/ApiCallDetail.test.tsx` | **NEW**: Call detail tests |

### Project Structure Notes

```
src/features/prototypes/
├── types.ts                           ← MODIFIED (export monitoring types)
├── types/
│   ├── prototypeState.ts              (existing)
│   └── apiMonitor.ts                  ← NEW (monitoring types)
├── utils/
│   ├── apiClientInjector.ts           ← MODIFIED (add monitoring code generation)
│   └── apiClientInjector.test.ts      ← MODIFIED (add monitoring tests)
├── hooks/
│   ├── useSandpackStateBridge.ts      (existing, REFERENCE pattern)
│   ├── useStateCapturePerformance.ts  (existing, REFERENCE pattern)
│   ├── useSandpackMonitorBridge.ts    ← NEW (monitoring bridge hook)
│   └── useSandpackMonitorBridge.test.ts ← NEW (bridge hook tests)
├── components/
│   ├── SandpackLivePreview.tsx        (existing, NO CHANGES)
│   ├── ApiConfigurationPanel.tsx      (existing, NO CHANGES)
│   ├── ApiMonitorPanel.tsx            ← NEW (monitor panel UI)
│   ├── ApiMonitorPanel.test.tsx       ← NEW (panel tests)
│   ├── ApiCallDetail.tsx              ← NEW (call detail modal)
│   └── ApiCallDetail.test.tsx         ← NEW (detail tests)
└── ... (existing unchanged)

src/pages/
└── PrototypeViewerPage.tsx            ← MODIFIED (add monitor integration)
```

### Critical Do's and Don'ts

**DO:**
- Follow `useSandpackStateBridge.ts` pattern EXACTLY for the monitoring bridge hook — same message validation, origin checking, cleanup
- Follow `stateCaptureInjector.ts` pattern for the postMessage sending code in the generated apiClient.js
- Keep the monitoring code WRAPPING the existing apiCall paths — do NOT restructure the existing mock/AI/proxy code
- Truncate response bodies > 10KB in log entries to prevent performance issues
- Redact sensitive headers (Authorization, apikey) in log entries — replace values with `"[redacted]"` 
- Use DaisyUI components consistently: `card`, `badge`, `btn`, `btn-group`, `modal`, `table`
- Apply PassportCard theme: primary color #E10514, border-radius 20px
- Use `performance.now()` for timing in the generated code (with `Date.now()` fallback)
- Keep logs in React state only — do NOT persist to database
- Follow co-located test pattern: tests next to their source files
- Use Vitest + React Testing Library for tests
- Use `var` (not `let`/`const`) in generated JavaScript code for Sandpack compatibility
- Guard against double-registration of monitoring (use `window.__IDEASPARK_API_MONITOR_INITIALIZED__` flag)
- Make the monitor panel responsive — it should work on different viewport sizes

**DON'T:**
- Don't modify the existing mock/AI/proxy code paths — only add monitoring hooks around them
- Don't consume the response body before the prototype code does — capture body at construction time, not by calling `.json()` again
- Don't persist API call logs to the database — this is ephemeral session data only
- Don't create a new Edge Function — monitoring is entirely client-side
- Don't create database migrations — no schema changes needed
- Don't log the full Gemini API key or auth tokens — always redact sensitive values
- Don't modify `SandpackLivePreview.tsx` — the injector changes propagate automatically through the generated file
- Don't modify `ApiConfigurationPanel.tsx` — the monitor is a separate panel
- Don't modify `useSandpackStateBridge.ts` — create a new hook, don't extend the existing one
- Don't install any new npm packages — everything needed is already available (DaisyUI, React, etc.)
- Don't use `console.log` in the generated monitoring code — use `postMessage` only
- Don't break the existing response object interface (`{ ok, status, json(), text() }`) — monitoring must be transparent

### Response Body Capture Strategy

**The key challenge:** The `apiCall()` function returns response objects with `json()` and `text()` methods. These are promise-based and can typically only be consumed once on real fetch responses. However, the current generated code already constructs custom response objects where `json()` and `text()` return pre-parsed data. This means we CAN safely capture the body.

**For mock responses:** Body is already the mock data — capture it directly from the mock construction.

**For AI responses:** Body is already parsed `aiData` — capture it directly.

**For proxy/direct responses:** The generated code reads the fetch response and constructs a new response object. Capture the parsed body at that point.

**Implementation:** Add a `var __lastResponseBody = null;` variable. Set it in each path's response construction. Read it for the log entry.

### Previous Story Intelligence (10.4)

**Learnings from Story 10.4 that apply here:**
- H1 fix: Read response as text first then `JSON.parse`, never call `.json()` then `.text()` on the same response — relevant for how we capture response bodies in logs
- H2 fix: Wrap body parsing in try/catch — apply same pattern for log body capture
- M3 fix: Non-JSON response handling — monitoring should handle non-JSON responses gracefully (show as text)
- Clean up unused imports
- Mock `console.error` in tests where errors are expected
- Dev agent must mark task checkboxes `[x]` upon completion

### Git Intelligence

**Last 5 commits:**
```
7960545 Complete Story 10.4: AI API Integration in Prototypes - Code Review Fixes
9e47950 Complete Story 10.3: Real API Calls from Prototypes - Code Review Fixes
b3453de Complete Story 10.2: Mock API Response System - Code Review Fixes
3a8bb22 Complete Story 10.1: API Configuration Interface - Code Review Fixes
7fb9de6 Complete Story 9.5: Revoke Public Access - Code Review Fixes
```

**Patterns established in Epic 10:**
- Feature code in `src/features/prototypes/`, co-located tests
- Barrel exports via `index.ts`
- React Query for server state, Zustand for client state
- DaisyUI components with PassportCard theme
- `apiClientInjector.ts` generates self-contained JavaScript for Sandpack injection with `var` declarations
- Mock, AI, and proxy code paths share the same response interface: `{ ok, status, json(), text(), headers }`
- Form patterns: react-hook-form + Zod resolver, DaisyUI form controls
- Injected Sandpack code uses `parent.postMessage()` for iframe-to-parent communication
- Message validation: check `type`, `source`, and origin before processing
- Performance measurement: `performance.now()` with `Date.now()` fallback

### Cross-Story Context (Epic 10)

- **Story 10.1** (done): Built the complete API configuration foundation — database, types, schemas, service, hooks, form, card, panel, Sandpack injection with mock support. The `apiClientInjector.ts` generates the `apiCall()` function with mock and direct-fetch code paths.
- **Story 10.2** (done): Enhanced mock editing UI with CodeMirror editor, templates, and preview. Mock responses are configurable JSON with delay.
- **Story 10.3** (done): Added CORS proxy Edge Function (`api-proxy`), updated `apiClientInjector.ts` with proxy path, `SandpackLivePreview.tsx` with `proxyConfig`. Error handling patterns (H2/M3 fixes) established.
- **Story 10.4** (done): Added AI API integration — `prototype-ai-call` Edge Function, AI fields in database/types/schemas, AI code path in generated `apiCall()`, AI mode toggle in form, AI badge in card.
- **This story (10.5)** is the FINAL story in Epic 10. It completes the API integration layer with debugging and monitoring capabilities.

### Existing Sandpack Bridge Patterns (Reference)

**State Capture Bridge (`useSandpackStateBridge.ts`):**
- Listens for `'PROTOTYPE_STATE_UPDATE'` messages from `'sandpack-state-capture'` source
- Validates: object message → correct type → correct source → valid origin → valid schema
- Uses 500ms debounce for rapid updates
- Accepted origins: sandpack, codesandbox, localhost, 127.0.0.1, same origin, empty

**State Capture Injector (`stateCaptureInjector.ts`):**
- Generates JavaScript code injected into Sandpack via `postMessage({ type: 'evaluate', command: script })`
- Uses `window.__IDEASPARK_STATE_CAPTURE_INJECTED__` guard against double-injection
- Sends data via `parent.postMessage({ type, payload, source }, '*')`
- Performance measurement with `performance.now()`

**The monitoring bridge follows these same patterns** but with different message types and no debouncing needed (each API call is a discrete event).

### Latest Technical Information

**No new libraries required.** All technologies are already in the project:
- React 19.x with hooks
- DaisyUI 5.x with PassportCard theme
- Vitest + React Testing Library for tests
- Sandpack for prototype preview (postMessage communication)

**Sandpack postMessage protocol:**
- `{ type: 'evaluate', command: '...' }` — Execute JavaScript in the iframe
- Custom messages via `parent.postMessage()` from iframe code — Any structure is supported
- Origin validation required on the receiving end

### Testing Approach

**`apiClientInjector.test.ts` additions:**
- Verify monitoring variables (`__apiCallId`, `__apiLog`) are generated in the output
- Verify `postMessage` call with type `'API_CALL_LOG'` is included after each code path
- Verify timing code (`performance.now()`) wraps each path
- Verify response body capture in each path (mock, AI, proxy)
- Verify sensitive header redaction
- Verify body truncation for large responses
- Verify backward compatibility: all existing tests still pass

**`useSandpackMonitorBridge.test.ts`:**
- Test message handling: valid messages added to logs
- Test message rejection: wrong type, wrong source, invalid origin
- Test max entries (200 FIFO)
- Test clearLogs resets state
- Test totalCount and errorCount calculations
- Test enabled/disabled toggling
- Test cleanup on unmount

**`ApiMonitorPanel.test.tsx`:**
- Test list rendering with sample log entries
- Test empty state when no logs
- Test filter buttons (All/Success/Error)
- Test clear button calls clearLogs
- Test count badges show correct numbers
- Test error highlighting on failed calls
- Test click on entry triggers detail view

**`ApiCallDetail.test.tsx`:**
- Test request details display (endpoint, method, URL, headers, body)
- Test response details display (status, body, error)
- Test AI call display (shows model instead of URL)
- Test mock call display (shows mock indicator)
- Test error call display (red status, error message)
- Test copy buttons functionality
- Test close button

**Regression tests:**
- All existing `apiClientInjector.test.ts` tests must still pass
- All existing `SandpackLivePreview.test.tsx` tests must still pass
- Run full `src/features/prototypes/` test suite

### References

- [Source: planning-artifacts/epics.md#Epic 10, Story 10.5]
- [Source: planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: planning-artifacts/architecture.md#Frontend Architecture]
- [Source: planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: planning-artifacts/ux-design-specification.md#Accessibility, Performance UX]
- [Source: implementation-artifacts/10-4-ai-api-integration-in-prototypes.md — Previous story context & learnings]
- [Source: src/features/prototypes/utils/apiClientInjector.ts — Injector to modify]
- [Source: src/features/prototypes/hooks/useSandpackStateBridge.ts — Bridge pattern reference]
- [Source: src/features/prototypes/hooks/useStateCapturePerformance.ts — Performance monitoring reference]
- [Source: src/features/prototypes/scripts/stateCaptureInjector.ts — postMessage injection reference]
- [Source: src/features/prototypes/types.ts — Types barrel to extend]
- [Source: src/pages/PrototypeViewerPage.tsx — Page to add monitor integration]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Cursor)

### Debug Log References

- 5 existing tests updated to match new `var` declarations and `async function()` syntax (was `const` and arrow functions)
- 1 test fix for AI badge: multiple "AI" text elements in ApiCallDetail (method badge + AI indicator badge) — fixed to use `getAllByText`

### Completion Notes List

- **Task 1+7 (apiClientInjector.ts):** Restructured generated `apiCall()` function with monitoring. Added `generateMonitoringHelpers()` producing `__apiCallId`, `__apiLog[]`, `__redactHeaders()`, `__truncateBody()` (10KB limit), `__elapsed()`, `__sendLog()` (postMessage + FIFO 200). All three code paths (mock, AI, proxy/direct) now capture timing, response status, body, and error info in `__logEntry` before each return. Sensitive headers (authorization, apikey, cookie) redacted. `window.__apiLog` exposed for debugging. Changed `const`→`var` and arrow functions→`async function()` for Sandpack compatibility.
- **Task 2 (types/apiMonitor.ts):** Created `ApiCallLogEntry`, `ApiMonitorMessage`, `ApiMonitorFilter` types. Exported from `types.ts` barrel.
- **Task 3 (useSandpackMonitorBridge.ts):** Created hook following `useSandpackStateBridge.ts` pattern exactly. Validates type='API_CALL_LOG', source='sandpack-api-monitor', origin. FIFO 200 entries. Exposes `logs`, `totalCount`, `errorCount`, `clearLogs`. `enabled` prop controls listener.
- **Task 4 (ApiMonitorPanel.tsx):** Created panel with DaisyUI card, header with Activity icon, live count/error badges, join filter buttons (All/Success/Error), Clear button. Scrollable log list with method badges, color-coded status, duration, timestamp. Empty state with informative message. Error entries get `bg-error/10` background. Click opens ApiCallDetail modal.
- **Task 5 (ApiCallDetail.tsx):** Created modal using DaisyUI dialog. Shows method badge, endpoint name, mock/AI indicators, URL, timing, timestamp. Collapsible request section (headers, body/prompt) and response section (status badge, body/AI response). Copy buttons for request/response body. Error alert for failed calls.
- **Task 6 (PrototypeViewerPage.tsx):** Added `useSandpackMonitorBridge` hook (enabled in edit mode). Added "API Monitor" toggle button with Activity icon, total count badge, error count badge (red). Renders `ApiMonitorPanel` as collapsible bottom panel below Sandpack preview.
- **Task 8 (Tests):** 21 new monitoring tests in `apiClientInjector.test.ts` (monitoring section). 15 tests in `useSandpackMonitorBridge.test.ts`. 12 tests in `ApiMonitorPanel.test.tsx`. 14 tests in `ApiCallDetail.test.tsx`. All 38 existing injector tests updated and passing. Full regression: 1108 tests across 68 files — all pass.

### Change Log

- 2026-02-08: Implemented Story 10.5 — API Call Monitoring & Debugging. Added client-side monitoring to generated apiClient.js, created types, bridge hook, monitor panel, call detail modal, integrated into prototype viewer page. 62 new tests, 0 regressions.

### File List

**Modified:**
- `src/features/prototypes/utils/apiClientInjector.ts` — Added `generateMonitoringHelpers()`, monitoring code in mock/AI/proxy/direct paths
- `src/features/prototypes/utils/apiClientInjector.test.ts` — Updated 5 existing tests for var/function syntax, added 21 monitoring tests
- `src/features/prototypes/types.ts` — Added re-export of apiMonitor types
- `src/pages/PrototypeViewerPage.tsx` — Added monitor bridge hook, toggle button, monitor panel integration

**New:**
- `src/features/prototypes/types/apiMonitor.ts` — ApiCallLogEntry, ApiMonitorMessage, ApiMonitorFilter types
- `src/features/prototypes/hooks/useSandpackMonitorBridge.ts` — Bridge hook for monitoring messages
- `src/features/prototypes/hooks/useSandpackMonitorBridge.test.ts` — 15 unit tests
- `src/features/prototypes/components/ApiMonitorPanel.tsx` — Monitor panel UI component
- `src/features/prototypes/components/ApiMonitorPanel.test.tsx` — 12 unit tests
- `src/features/prototypes/components/ApiCallDetail.tsx` — Call detail modal component
- `src/features/prototypes/components/ApiCallDetail.test.tsx` — 14 unit tests
