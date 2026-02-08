# Story 10.3: Real API Calls from Prototypes

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to **have my prototype make real API calls to configured endpoints**,
so that **I can demonstrate integration with actual backend services and validate my prototype's behavior with live data**.

## Acceptance Criteria

1. **Given** I configured an API endpoint with a real URL and mock mode is disabled, **When** the prototype executes an API call to that endpoint, **Then** the request is routed through a Supabase Edge Function CORS proxy that forwards it to the configured URL.
2. **Given** the proxied API call succeeds, **When** the response is returned, **Then** the prototype receives the real response data (status code, body, headers) and displays it correctly.
3. **Given** the proxied API call fails (network error, timeout, 4xx, 5xx), **When** the error occurs, **Then** the prototype receives a structured error response with status code and error message, and handles it gracefully without crashing.
4. **Given** I toggle an endpoint from mock mode to real mode, **When** the prototype reloads, **Then** subsequent calls to that endpoint use the proxy instead of returning mock data — and toggling back to mock mode restores mock behavior (no regression).
5. **Given** a real API call is made through the proxy, **When** custom headers are configured for the endpoint, **Then** those headers are forwarded in the proxied request to the target API.
6. **Given** the proxy Edge Function receives a request, **When** it processes the call, **Then** it enforces authentication (user must own the prototype), validates the endpoint exists and is not in mock mode, and applies a 30-second timeout to prevent hanging requests.
7. **Given** the Sandpack prototype is loaded with non-mock API configurations, **When** the `apiClient.js` is generated, **Then** it includes the proxy URL and authentication token so that `apiCall()` routes non-mock requests through the Edge Function proxy instead of direct `fetch()`.

## Tasks / Subtasks

- [x] Task 1: Create Supabase Edge Function `api-proxy` (AC: #1, #2, #3, #5, #6)
  - [x] 1.1 Create `supabase/functions/api-proxy/index.ts` following existing Edge Function patterns (`prototype-generate`, `verify-prototype-password`)
  - [x] 1.2 Implement CORS handling (OPTIONS preflight + CORS headers on all responses) using shared pattern
  - [x] 1.3 Implement auth verification: extract JWT from Authorization header, verify user via Supabase Auth
  - [x] 1.4 Accept POST body: `{ prototypeId: string, endpointName: string, body?: unknown, method?: string, headers?: Record<string, string> }`
  - [x] 1.5 Look up `prototype_api_configs` row by `prototype_id` + `name`, verify `is_mock === false`
  - [x] 1.6 Verify user owns the prototype (join `prototypes` table → check `user_id`)
  - [x] 1.7 Forward the request to `config.url` with configured method, merged headers (config headers + request headers), and body
  - [x] 1.8 Apply 30-second timeout using `AbortController` + `setTimeout`
  - [x] 1.9 Return proxied response: `{ status, statusText, headers (as object), body (parsed JSON or text) }`
  - [x] 1.10 Handle errors: timeout → 504, network error → 502, endpoint not found → 404, auth fail → 401, mock endpoint → 400
- [x] Task 2: Update `apiClientInjector.ts` to route non-mock calls through proxy (AC: #1, #4, #7)
  - [x] 2.1 Add new parameter to `generateApiClientFile()`: `proxyConfig: { supabaseUrl: string, supabaseAnonKey: string, prototypeId: string, accessToken: string }`
  - [x] 2.2 For non-mock endpoints, generate `apiCall()` code that POSTs to `${supabaseUrl}/functions/v1/api-proxy` with Authorization header and endpoint payload
  - [x] 2.3 For mock endpoints, keep existing mock response logic unchanged (no regression)
  - [x] 2.4 Include proper error parsing in the generated client: extract error message from proxy error responses
  - [x] 2.5 Generated `apiCall()` should return a fetch-like Response object for non-mock calls (matching mock response interface: `{ ok, status, json(), text() }`)
- [x] Task 3: Update `SandpackLivePreview.tsx` to pass proxy config to injector (AC: #7)
  - [x] 3.1 Import `useAuth` hook (or Supabase session) to get current user's access token
  - [x] 3.2 Read Supabase URL from environment config (`import.meta.env.VITE_SUPABASE_URL`)
  - [x] 3.3 Read Supabase anon key from environment config (`import.meta.env.VITE_SUPABASE_ANON_KEY`)
  - [x] 3.4 Pass `proxyConfig` (supabaseUrl, supabaseAnonKey, prototypeId, accessToken) to `generateApiClientFile()`
  - [x] 3.5 Ensure `proxyConfig` is included in the `useMemo` dependency array so the apiClient regenerates when the auth token refreshes
- [x] Task 4: Tests (all ACs)
  - [x] 4.1 Unit tests for updated `apiClientInjector.ts`: verify generated code routes mock calls through mock logic and non-mock calls through proxy URL
  - [x] 4.2 Unit tests for proxy error scenarios in generated code: timeout, network error, auth failure
  - [x] 4.3 Update `apiClientInjector.test.ts`: ensure existing mock tests still pass (no regression)
  - [x] 4.4 Update `SandpackLivePreview` tests: verify `proxyConfig` is passed when apiConfigs contain non-mock endpoints
  - [x] 4.5 Regression: run full prototype feature test suite to confirm no breakage

## Dev Notes

### Architecture & Patterns

- **CRITICAL: Story 10.1 and 10.2 built the full API configuration pipeline.** The database schema (`prototype_api_configs`), TypeScript types, Zod schemas, service layer, React Query hooks, Sandpack `apiClient.js` injection, API config UI, and mock editing UI ALL already exist. This story adds a CORS proxy Edge Function and updates the injector to route real (non-mock) calls through it.
- **The `apiClientInjector.ts` already has real fetch logic** — but it does `fetch(config.url, ...)` directly from inside Sandpack's iframe, which hits CORS on most external APIs. The fix: route through an Edge Function proxy.
- **No database migration needed.** The `prototype_api_configs` table already has all fields needed.
- **No schema/type/hook changes needed.** The `isMock` toggle already exists. Real mode just means `isMock === false`.
- **No form changes needed.** `ApiEndpointForm.tsx` already supports configuring a URL, method, headers for real calls.
- **Service Response Pattern**: `ServiceResponse<T>` = `{ data: T | null, error: Error | null }`. See `apiConfigService.ts`.
- **Edge Function Pattern**: Deno runtime, `serve()` handler, CORS headers, JWT auth, service role Supabase client. See `supabase/functions/prototype-generate/index.ts` and `supabase/functions/verify-prototype-password/index.ts` for reference.

### Edge Function `api-proxy` Design

**Endpoint:** `POST /functions/v1/api-proxy`

**Request body:**
```json
{
  "prototypeId": "uuid-of-prototype",
  "endpointName": "getUsers",
  "body": { "optional": "request body" },
  "method": "GET",
  "headers": { "X-Custom-Header": "value" }
}
```

**Success response (200):**
```json
{
  "status": 200,
  "statusText": "OK",
  "headers": { "content-type": "application/json" },
  "body": { "any": "response data" }
}
```

**Error responses:**
| Status | Scenario | Body |
|--------|----------|------|
| 400 | Endpoint is in mock mode | `{ "error": "Endpoint is configured for mock mode" }` |
| 400 | Missing required fields | `{ "error": "Missing prototypeId or endpointName" }` |
| 401 | Invalid/missing auth token | `{ "error": "Unauthorized" }` |
| 403 | User doesn't own prototype | `{ "error": "Forbidden" }` |
| 404 | Endpoint config not found | `{ "error": "Endpoint not found" }` |
| 502 | Target API network error | `{ "error": "Bad Gateway", "details": "Connection refused" }` |
| 504 | Target API timeout (30s) | `{ "error": "Gateway Timeout" }` |

**Implementation skeleton:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Auth: Extract and verify JWT
    // 2. Parse body: prototypeId, endpointName, body, method, headers
    // 3. DB: Look up prototype_api_configs + verify prototype ownership
    // 4. Validate: is_mock must be false
    // 5. Forward: fetch(config.url, { method, headers: merged, body })
    //    with AbortController 30s timeout
    // 6. Parse response and return wrapped result
  } catch (error) {
    // Handle and return appropriate error status
  }
});
```

### Updated `apiClientInjector.ts` Logic

**Current non-mock code path (to be replaced):**
```javascript
// Current: Direct fetch (hits CORS in Sandpack)
const response = await fetch(config.url, { method: config.method, headers: mergedHeaders, ...options });
```

**New non-mock code path:**
```javascript
// New: Route through Edge Function proxy
const proxyUrl = '${proxyConfig.supabaseUrl}/functions/v1/api-proxy';
const proxyResponse = await fetch(proxyUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${proxyConfig.accessToken}',
    'apikey': '${proxyConfig.supabaseAnonKey}',
  },
  body: JSON.stringify({
    prototypeId: '${proxyConfig.prototypeId}',
    endpointName: endpointName,
    body: options.body ? JSON.parse(options.body) : undefined,
    method: config.method,
    headers: options.headers || {},
  }),
});

const proxyData = await proxyResponse.json();

if (!proxyResponse.ok) {
  // Return error-shaped response matching mock interface
  return {
    ok: false,
    status: proxyData.status || proxyResponse.status,
    statusText: proxyData.error || proxyResponse.statusText,
    json: async () => proxyData.body || proxyData,
    text: async () => JSON.stringify(proxyData.body || proxyData),
    headers: new Headers(proxyData.headers || {}),
  };
}

// Return success response matching mock interface
return {
  ok: proxyData.status >= 200 && proxyData.status < 300,
  status: proxyData.status,
  statusText: proxyData.statusText || '',
  json: async () => proxyData.body,
  text: async () => typeof proxyData.body === 'string' ? proxyData.body : JSON.stringify(proxyData.body),
  headers: new Headers(proxyData.headers || {}),
};
```

**Key design decisions:**
- The proxy response is unwrapped and re-wrapped into a fetch-like Response object, maintaining the same interface as mock responses. This means prototype code doesn't need to know whether it's talking to a mock or real API.
- The `proxyConfig` is injected as string literals into the generated JavaScript (not as runtime variables), since Sandpack's environment doesn't share the parent app's context.
- Auth token is embedded in generated code — it will expire with the session. This is acceptable for prototype testing (short-lived sessions). If token expires, the proxy returns 401 and the generated client surfaces a clear error.

### What Currently Exists (From Stories 10.1 & 10.2)

| File | Role | Changes Needed |
|------|------|---------------|
| `src/features/prototypes/utils/apiClientInjector.ts` | Generates apiClient.js for Sandpack | **MODIFY**: Update `generateApiClientFile()` signature to accept `proxyConfig`, update non-mock code path to route through proxy |
| `src/features/prototypes/utils/apiClientInjector.test.ts` | Injector tests | **MODIFY**: Add tests for proxy routing, update existing mock tests |
| `src/features/prototypes/components/SandpackLivePreview.tsx` | Sandpack integration | **MODIFY**: Pass proxyConfig to `generateApiClientFile()` |
| `src/features/prototypes/components/SandpackLivePreview.test.tsx` | Sandpack tests | **MODIFY**: Verify proxyConfig passed to injector |
| `src/features/prototypes/types.ts` | TypeScript types | No changes (ApiConfig type already has all fields) |
| `src/features/prototypes/schemas/apiConfigSchemas.ts` | Zod schemas | No changes |
| `src/features/prototypes/services/apiConfigService.ts` | CRUD service | No changes |
| `src/features/prototypes/hooks/useApiConfigs.ts` | Query hook | No changes |
| `src/features/prototypes/components/ApiEndpointForm.tsx` | Config form | No changes |
| `src/features/prototypes/components/ApiConfigurationPanel.tsx` | Panel orchestration | No changes |
| `src/features/prototypes/components/ApiEndpointCard.tsx` | Card display | No changes |
| `src/pages/PrototypeViewerPage.tsx` | Page integration | No changes (apiConfigs already passed to SandpackLivePreview) |

### Existing File References

**Edge Function patterns to follow:**
- `supabase/functions/prototype-generate/index.ts` — Deno serve pattern, CORS, auth, service role client
- `supabase/functions/verify-prototype-password/index.ts` — Simple request/response pattern

**Injector to modify:**
- `src/features/prototypes/utils/apiClientInjector.ts` — `generateApiClientFile(apiConfigs)` → `generateApiClientFile(apiConfigs, proxyConfig?)`

**Sandpack integration:**
- `src/features/prototypes/components/SandpackLivePreview.tsx` — Passes `apiConfigs` prop, generates apiClient.js in `useMemo`

**Auth/session access:**
- `src/features/auth/hooks/useAuth.ts` — Provides session with access_token
- `src/lib/supabase.ts` — Supabase client configuration

### Project Structure Notes

```
supabase/functions/
├── api-proxy/
│   └── index.ts                    ← NEW (Edge Function CORS proxy)
├── gemini-enhance/
│   └── index.ts                    (existing, reference pattern)
├── prototype-generate/
│   └── index.ts                    (existing, reference pattern)
└── verify-prototype-password/
    └── index.ts                    (existing, reference pattern)

src/features/prototypes/
├── utils/
│   ├── apiClientInjector.ts        ← MODIFIED (add proxyConfig, update non-mock path)
│   ├── apiClientInjector.test.ts   ← MODIFIED (add proxy routing tests)
│   └── ... (existing unchanged)
├── components/
│   ├── SandpackLivePreview.tsx     ← MODIFIED (pass proxyConfig to injector)
│   ├── SandpackLivePreview.test.tsx ← MODIFIED (verify proxyConfig passing)
│   └── ... (existing unchanged)
└── ... (existing unchanged)
```

### Critical Do's and Don'ts

**DO:**
- Follow existing Edge Function patterns (`prototype-generate`, `verify-prototype-password`) for CORS headers, auth, and error handling
- Use `createClient` with `SUPABASE_SERVICE_ROLE_KEY` in the Edge Function (needs to read `prototype_api_configs` bypassing RLS)
- Return responses that match the mock response interface (`{ ok, status, json(), text() }`) so prototype code works identically with mock and real APIs
- Apply a 30-second timeout with `AbortController` to prevent hanging requests
- Keep `proxyConfig` parameter **optional** in `generateApiClientFile()` — if not provided, non-mock calls should fall back to direct `fetch()` (graceful degradation)
- Merge endpoint config headers with per-request headers (per-request headers override config headers)
- Handle the case where proxy response body is not JSON (return raw text)
- Use `Deno.env.get()` for environment variables in Edge Functions (not `process.env`)
- Follow co-located test pattern: update existing test files, don't create new test files for modified code
- Use Vitest + React Testing Library for tests
- Mock the `generateApiClientFile` function in `SandpackLivePreview.test.tsx` tests (don't test injection logic there)

**DON'T:**
- Don't expose API keys or sensitive headers in the generated `apiClient.js` — the proxy handles auth server-side
- Don't modify the database schema — all columns exist from Story 10.1
- Don't modify the service layer, React Query hooks, Zod schemas, or form components — they're already complete
- Don't add request body size limits less than 1MB (prototypes might send larger payloads)
- Don't log request/response bodies in the Edge Function (that's Story 10.5's monitoring feature)
- Don't add retry logic in the proxy itself (let the prototype code decide on retries)
- Don't change the mock response path in `apiClientInjector.ts` — it works perfectly
- Don't install any new npm packages — everything needed is already available
- Don't create a separate Edge Function for each HTTP method — one `api-proxy` function handles all methods via the `method` field in the request body

### Testing Approach

**Edge Function testing:** Edge Functions run in Deno and are typically tested via integration tests (deploy + call). For this story, focus on unit testing the client-side changes:

**`apiClientInjector.test.ts` additions:**
- Test that `generateApiClientFile(configs, proxyConfig)` generates code with proxy URL for non-mock endpoints
- Test that mock endpoints still use inline mock logic (no proxy) even when `proxyConfig` is provided
- Test that generated code handles proxy error responses correctly
- Test backward compatibility: `generateApiClientFile(configs)` without proxyConfig still works (direct fetch fallback)
- Test that auth token and Supabase URL are properly embedded in generated code

**`SandpackLivePreview.test.tsx` additions:**
- Test that `generateApiClientFile` is called with `proxyConfig` when auth session exists and apiConfigs contain non-mock endpoints
- Test that when no auth session exists, proxyConfig is not passed (graceful fallback)

**Regression tests:**
- All existing `apiClientInjector.test.ts` tests must still pass
- All existing `SandpackLivePreview.test.tsx` tests must still pass
- Run full `src/features/prototypes/` test suite

### Cross-Story Context (Epic 10)

- **Story 10.1** (done): Built the entire API configuration foundation — database, types, schemas, service, hooks, form, Sandpack injection with mock support. The `apiClientInjector.ts` already has mock and direct-fetch code paths.
- **Story 10.2** (done): Enhanced mock editing UI with CodeMirror editor, templates, and preview. No impact on this story.
- **Story 10.4** (next): AI API Integration in Prototypes — adds AI-specific endpoint types. Will use the same proxy infrastructure. No impact on this story.
- **Story 10.5**: API Call Monitoring & Debugging — adds request logging. Could extend the proxy to log calls, but that's future scope. No impact on this story.

### Previous Story Intelligence (10.2)

**Learnings from Story 10.2 code review:**
- CodeMirror mock pattern: Use `function EditorViewMock()` constructor syntax (not `vi.fn()` arrow) for `new EditorView()` mocks.
- Timer memory leaks: Always track timers with `useRef` and clean up on unmount.
- Error state flicker: Let the authoritative source (linter/validator) manage error state exclusively — don't eagerly clear errors in change handlers.
- NaN edge case: Use `||` instead of `??` for number inputs that can produce NaN from empty inputs.
- Dev agent must mark task checkboxes `[x]` upon completion and populate the Dev Agent Record section.
- Clean up unused imports.
- Mock `console.error` in tests where errors are expected.

### Git Intelligence

**Last 5 commits:**
```
b3453de Complete Story 10.2: Mock API Response System - Code Review Fixes
3a8bb22 Complete Story 10.1: API Configuration Interface - Code Review Fixes
7fb9de6 Complete Story 9.5: Revoke Public Access - Code Review Fixes
7e63745 Complete Story 9.4: Public Prototype Viewer (No Authentication) - Code Review Fixes
1574c8c Complete Story 9.3: Configurable Link Expiration - Code Review Fixes
```

**Patterns established in Epic 10:**
- Feature code in `src/features/prototypes/`, co-located tests
- Barrel exports via `index.ts`
- React Query for server state, Zustand for client state
- DaisyUI components with PassportCard theme
- Edge Functions: Deno serve, CORS headers, JWT auth, service role client
- `apiClientInjector.ts` generates self-contained JavaScript for Sandpack injection
- Mock and real API call paths share the same response interface

**Files from Story 10.1 relevant to this story (created/modified):**
- `src/features/prototypes/utils/apiClientInjector.ts` — The injector to modify
- `src/features/prototypes/utils/apiClientInjector.test.ts` — Tests to update
- `src/features/prototypes/components/SandpackLivePreview.tsx` — Passes apiConfigs, generates injected file
- `src/features/prototypes/types.ts` — `ApiConfig` type with `isMock`, `url`, `method`, `headers`

### Latest Technical Information

**Supabase Edge Functions (Deno):**
- CORS must be manually configured — no automatic CORS support
- Shared CORS headers pattern: define `corsHeaders` object with `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`
- OPTIONS preflight handler must be first check in the function (before any other logic)
- Include CORS headers on ALL responses (success AND error) or the browser will block them
- Use `Deno.env.get('SUPABASE_URL')` and `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` for server-side Supabase client
- Use `createClient` from `https://esm.sh/@supabase/supabase-js@2` for Deno compatibility

**Sandpack iframe limitations:**
- Sandpack runs code in a sandboxed iframe
- `fetch()` calls from within Sandpack are subject to standard browser CORS rules
- The iframe has its own origin, so most external API calls will fail with CORS errors
- Solution: Route all real API calls through a server-side proxy (the Edge Function) which has no CORS restrictions
- The proxy URL (Supabase Functions URL) is on the same domain as the Supabase client, so calls from Sandpack to the proxy also hit CORS — but Supabase Edge Functions handle CORS headers explicitly

**AbortController for timeouts (Deno):**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);
try {
  const response = await fetch(url, { signal: controller.signal, ... });
  clearTimeout(timeoutId);
  return response;
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === 'AbortError') { /* timeout */ }
  throw error;
}
```

### References

- [Source: planning-artifacts/epics.md#Epic 10, Story 10.3]
- [Source: planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: planning-artifacts/architecture.md#Authentication & Security]
- [Source: planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: planning-artifacts/architecture.md#Architectural Boundaries — Edge Functions]
- [Source: implementation-artifacts/10-2-mock-api-response-system.md — Previous story context]
- [Source: implementation-artifacts/10-1-api-configuration-interface.md — Foundation story reference]
- [Source: src/features/prototypes/utils/apiClientInjector.ts — Injector to modify]
- [Source: src/features/prototypes/components/SandpackLivePreview.tsx — Sandpack integration to modify]
- [Source: src/features/prototypes/types.ts — ApiConfig type]
- [Source: supabase/functions/prototype-generate/index.ts — Edge Function reference pattern]
- [Source: supabase/functions/verify-prototype-password/index.ts — Edge Function reference pattern]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

- SandpackLivePreview tests initially failed: `useSandpack` mock missing `listen` function required by `SandpackStateCaptureInjector`. Fixed by adding `listen: vi.fn().mockReturnValue(vi.fn())` to the mock.

### Completion Notes List

- **Task 1**: Created `supabase/functions/api-proxy/index.ts` — Deno Edge Function implementing CORS proxy for Sandpack prototypes. Follows existing patterns (prototype-generate, verify-prototype-password). Handles: CORS preflight, JWT auth, prototype ownership verification, mock mode rejection, request forwarding with merged headers, 30s AbortController timeout, response wrapping, and structured error responses (400/401/403/404/502/504).
- **Task 2**: Updated `apiClientInjector.ts` — Added optional `ProxyConfig` interface and `proxyConfig` parameter to `generateApiClientFile()`. Non-mock endpoints route through the Edge Function proxy when proxyConfig is provided; falls back to direct fetch when absent. Mock endpoint path is completely unchanged. Proxy response objects match the mock response interface (`{ ok, status, json(), text(), headers }`). Added `escapeJsString` helper for safe string embedding in generated JS.
- **Task 3**: Updated `SandpackLivePreview.tsx` — Imported `useAuth` hook to get access token from session. Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from environment. Builds `proxyConfig` only when: (a) auth session exists, (b) prototypeId is provided, (c) apiConfigs contain at least one non-mock endpoint, and (d) env vars are available. Added `proxyConfig` to useMemo dependency array.
- **Task 4**: Added 12 new tests to `apiClientInjector.test.ts` covering proxy routing, mock preservation, direct fetch fallback, embedded values, error handling, response shape, mixed endpoints, special character escaping, and backward compatibility. Added 6 new tests to `SandpackLivePreview.test.tsx` covering proxyConfig passing with auth, no auth fallback, all-mock exclusion, missing prototypeId, no apiConfigs, and mixed endpoints. All 987 tests in the prototypes feature pass (65 test files, 0 regressions).

### File List

- `supabase/functions/api-proxy/index.ts` — NEW: Edge Function CORS proxy for real API calls
- `src/features/prototypes/utils/apiClientInjector.ts` — MODIFIED: Added ProxyConfig interface, optional proxyConfig parameter, proxy/direct-fetch code path generation
- `src/features/prototypes/utils/apiClientInjector.test.ts` — MODIFIED: Added 12 proxy routing tests (Story 10.3)
- `src/features/prototypes/components/SandpackLivePreview.tsx` — MODIFIED: Added useAuth import, proxyConfig building, passing proxyConfig to generateApiClientFile
- `src/features/prototypes/components/SandpackLivePreview.test.tsx` — MODIFIED: Added useAuth mock, generateApiClientFile mock, 6 proxy config tests (Story 10.3)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED: Story status updated to review
- `_bmad-output/implementation-artifacts/10-3-real-api-calls-from-prototypes.md` — MODIFIED: Tasks marked complete, Dev Agent Record populated

## Senior Developer Review (AI)

**Reviewer:** Ben.akiva on 2026-02-08
**Outcome:** Approved with fixes applied

### Findings (5 fixed, 2 noted as low-priority)

| # | Severity | Issue | File | Fix Applied |
|---|----------|-------|------|-------------|
| H1 | HIGH | Edge Function double body consumption: `targetResponse.json()` failure consumed body, making subsequent `.text()` fail | `supabase/functions/api-proxy/index.ts:153-161` | Read as text first, then `JSON.parse` |
| H2 | HIGH | Generated proxy code crashes on non-JSON string body: `JSON.parse(options.body)` with no try/catch | `apiClientInjector.ts:108` | Wrapped in try/catch, falls back to raw value |
| M1 | MEDIUM | Edge Function missing HTTP method validation: non-POST requests get opaque 500 | `supabase/functions/api-proxy/index.ts` | Added `req.method !== 'POST'` check returning 405 |
| M2 | MEDIUM | Edge Function uses `!` non-null assertion on `Deno.env.get()`: missing env vars produce cryptic errors | `supabase/functions/api-proxy/index.ts:46-47` | Added upfront env var validation returning 500 "Service not configured" |
| M3 | MEDIUM | Generated proxy code `proxyResponse.json()` has no try/catch: CDN error pages crash prototype | `apiClientInjector.ts:114` | Wrapped in try/catch, returns clean error response |
| L1 | LOW | `proxyConfig` useMemo depends on `apiConfigs` array ref, causing unnecessary re-computation | `SandpackLivePreview.tsx:70-82` | Noted, pre-existing pattern from Story 10.1 |
| L2 | LOW | `escapeJsString` doesn't handle `\0`, `\t`, `\u2028`, `\u2029` | `apiClientInjector.ts:152-158` | Noted, unlikely in URL/token values |

### Tests Added (Code Review)
- `should safely parse non-JSON string body in generated proxy code (H2 fix)` — apiClientInjector.test.ts
- `should handle non-JSON proxy response gracefully in generated code (M3 fix)` — apiClientInjector.test.ts
- `should handle network errors when calling proxy in generated code` — apiClientInjector.test.ts

### Test Results
- 41/41 tests pass for changed files (23 injector + 18 SandpackLivePreview)
- 0 regressions

## Change Log

- 2026-02-08: Implemented Story 10.3 — Real API Calls from Prototypes. Created api-proxy Edge Function, updated apiClientInjector to route non-mock calls through proxy, updated SandpackLivePreview to pass proxy config. All 987 prototype tests pass.
- 2026-02-08: Code Review — Fixed 5 issues (2 HIGH, 3 MEDIUM): Edge Function double body consumption, missing method/env validation, generated code error handling hardening. Added 3 review tests. All 41 tests pass.
