# Story 10.4: AI API Integration in Prototypes

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to **integrate AI API calls into my prototype**,
so that **I can demonstrate dynamic, AI-powered features like text generation, content suggestions, and intelligent responses without exposing API keys in the prototype code**.

## Acceptance Criteria

1. **Given** my prototype needs AI functionality, **When** I create a new API endpoint and toggle "AI Mode" on, **Then** the form shows AI-specific fields (model, system prompt, max tokens, temperature) instead of URL/method/headers fields, and the configuration is saved to the database with `is_ai = true`.
2. **Given** an AI endpoint is configured, **When** the prototype calls `apiCall('endpointName', { prompt: 'user input' })`, **Then** the request is routed through the `prototype-ai-call` Edge Function which uses the server-side `GEMINI_API_KEY` to call the Gemini 2.5 Flash API with the stored system prompt + user prompt, and returns the AI-generated text to the prototype.
3. **Given** the prototype makes an AI call, **When** the user triggers it (e.g., clicking "Generate Description"), **Then** the AI processes the request and the response is displayed in the prototype, and the interaction completes within 10 seconds for typical prompts.
4. **Given** AI API calls require authentication, **When** I configure an AI endpoint, **Then** the Gemini API key is never exposed in the prototype code — it remains server-side in the Edge Function environment variables, and only the Supabase proxy URL and user's session token are embedded in the generated client.
5. **Given** an AI endpoint is set to mock mode (`isMock = true`), **When** the prototype calls the AI endpoint, **Then** it returns the mock response (not the real AI) — the same mock behavior works for AI endpoints as for regular endpoints (no regression).
6. **Given** the `prototype-ai-call` Edge Function receives a request, **When** it processes the call, **Then** it enforces authentication (user must own the prototype), validates the endpoint exists and `is_ai = true`, applies the configured model/temperature/max tokens, and returns the AI response text with a 30-second timeout.
7. **Given** the AI call fails (API error, timeout, rate limit), **When** the error occurs, **Then** the Edge Function returns a structured error response with code and message, and the generated client surfaces a clear error to the prototype code without crashing.

## Tasks / Subtasks

- [x] Task 1: Database Migration — Add AI columns to `prototype_api_configs` (AC: #1)
  - [x] 1.1 Create `supabase/migrations/00025_add_ai_columns_to_prototype_api_configs.sql`
  - [x] 1.2 Add columns: `is_ai BOOLEAN NOT NULL DEFAULT false`, `ai_model TEXT DEFAULT 'gemini-2.5-flash'`, `ai_system_prompt TEXT`, `ai_max_tokens INTEGER DEFAULT 1024`, `ai_temperature NUMERIC(3,2) DEFAULT 0.7`
  - [x] 1.3 Add CHECK constraint: `is_ai = false OR ai_system_prompt IS NOT NULL` (AI endpoints must have a system prompt)
  - [x] 1.4 Add comment annotations for new columns

- [x] Task 2: Update TypeScript Types (AC: #1, #2)
  - [x] 2.1 Update `ApiConfig` interface in `src/features/prototypes/types.ts`: add `isAi`, `aiModel`, `aiSystemPrompt`, `aiMaxTokens`, `aiTemperature`
  - [x] 2.2 Update `ApiConfigRow` interface: add `is_ai`, `ai_model`, `ai_system_prompt`, `ai_max_tokens`, `ai_temperature`
  - [x] 2.3 Update `CreateApiConfigInput`: add AI optional fields
  - [x] 2.4 Update `UpdateApiConfigInput`: add AI optional fields
  - [x] 2.5 Update `mapApiConfigRow()`: map new DB columns to camelCase

- [x] Task 3: Update Zod Schemas (AC: #1)
  - [x] 3.1 Update `apiConfigSchema` in `src/features/prototypes/schemas/apiConfigSchemas.ts`
  - [x] 3.2 Add `isAi: z.boolean().default(false)`
  - [x] 3.3 Add `aiModel: z.string().default('gemini-2.5-flash')` (only validated when `isAi = true`)
  - [x] 3.4 Add `aiSystemPrompt: z.string().min(1).max(10000).optional()` (required when `isAi = true`)
  - [x] 3.5 Add `aiMaxTokens: z.number().int().min(1).max(8192).default(1024)`
  - [x] 3.6 Add `aiTemperature: z.number().min(0).max(2).default(0.7)`
  - [x] 3.7 Add Zod `.refine()` to enforce: when `isAi = true`, `aiSystemPrompt` must be provided

- [x] Task 4: Update Service Layer (AC: #1)
  - [x] 4.1 Update `createApiConfig()` in `src/features/prototypes/services/apiConfigService.ts` to handle AI fields
  - [x] 4.2 Update `updateApiConfig()` to handle AI fields
  - [x] 4.3 Ensure AI fields are included in insert/update payloads with proper snake_case mapping

- [x] Task 5: Create `prototype-ai-call` Edge Function (AC: #2, #3, #4, #6, #7)
  - [x] 5.1 Create `supabase/functions/prototype-ai-call/index.ts` following existing Edge Function patterns
  - [x] 5.2 Implement CORS handling (OPTIONS preflight + CORS headers on all responses)
  - [x] 5.3 Validate HTTP method is POST, return 405 otherwise
  - [x] 5.4 Validate environment variables `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` at startup
  - [x] 5.5 Implement auth verification: extract JWT from Authorization header, verify user via Supabase Auth
  - [x] 5.6 Accept POST body: `{ prototypeId: string, endpointName: string, prompt: string, context?: string }`
  - [x] 5.7 Look up `prototype_api_configs` row by `prototype_id` + `name`, verify `is_ai === true`
  - [x] 5.8 Verify user owns the prototype (join `prototypes` table → check `user_id`)
  - [x] 5.9 Construct Gemini API request: system prompt from config + user prompt + optional context
  - [x] 5.10 Call Gemini API (`https://generativelanguage.googleapis.com/v1beta/models/{ai_model}:generateContent`) with `ai_temperature`, `ai_max_tokens`
  - [x] 5.11 Parse Gemini response: extract `candidates[0].content.parts[0].text`, strip markdown code blocks if present
  - [x] 5.12 Apply 30-second timeout using `AbortController` + `setTimeout`
  - [x] 5.13 Return success response: `{ text: string, model: string, usage?: { promptTokens, completionTokens } }`
  - [x] 5.14 Handle errors: timeout → 504, Gemini API error → 502, auth fail → 401, ownership fail → 403, not AI endpoint → 400, missing prompt → 400, GEMINI_API_KEY not set → 500

- [x] Task 6: Update `apiClientInjector.ts` — AI endpoint code generation (AC: #2, #4, #5)
  - [x] 6.1 Add `isAi` field to the config map in `generateApiClientFile()`
  - [x] 6.2 Add AI-specific code path in generated `apiCall()` function: when `config.isAi && !config.isMock`, route through `prototype-ai-call` Edge Function
  - [x] 6.3 AI call sends: `{ prototypeId, endpointName, prompt: options.prompt || options.body, context: options.context }`
  - [x] 6.4 Return AI response matching standard interface: `{ ok, status, json: () => { text, model }, text: () => aiText }`
  - [x] 6.5 Ensure mock path still works for AI endpoints when `isMock = true` (no regression)
  - [x] 6.6 Ensure regular (non-AI) proxy path is completely unchanged (no regression)

- [x] Task 7: Update `SandpackLivePreview.tsx` — AI proxy awareness (AC: #2, #4)
  - [x] 7.1 No structural changes needed — the existing `proxyConfig` already provides `supabaseUrl`, `supabaseAnonKey`, `prototypeId`, `accessToken`
  - [x] 7.2 Verify that AI endpoints are included when checking for non-mock endpoints (the check `!cfg.isMock` already covers AI endpoints with `isMock = false`)
  - [x] 7.3 If the existing check only looks for `!cfg.isMock` (not `cfg.isAi`), it already works — AI endpoints with `isMock = false` will trigger proxyConfig creation

- [x] Task 8: Update UI — ApiEndpointForm AI mode (AC: #1)
  - [x] 8.1 Add "AI Mode" toggle (`isAi`) to `ApiEndpointForm.tsx` — DaisyUI toggle component
  - [x] 8.2 When AI mode is ON: hide URL, Method, Headers fields; show AI-specific fields (model dropdown, system prompt textarea, max tokens input, temperature slider)
  - [x] 8.3 Model dropdown options: `gemini-2.5-flash` (default), `gemini-2.0-flash` — simple select, extensible
  - [x] 8.4 System prompt textarea: placeholder with example, min height 120px, character count
  - [x] 8.5 Max tokens: number input with range 1-8192, default 1024
  - [x] 8.6 Temperature: range slider 0-2 with step 0.1, default 0.7, show current value
  - [x] 8.7 When AI mode is OFF: show standard URL/method/headers fields (current behavior, no change)
  - [x] 8.8 Ensure form validation: when AI mode is ON, system prompt is required; URL is not required

- [x] Task 9: Update UI — ApiEndpointCard AI indicator (AC: #1)
  - [x] 9.1 Update `ApiEndpointCard.tsx` to show an "AI" badge when `config.isAi === true`
  - [x] 9.2 Show model name instead of URL for AI endpoints
  - [x] 9.3 Show truncated system prompt preview (first 80 chars)

- [x] Task 10: Tests (all ACs)
  - [x] 10.1 Unit tests for updated `apiClientInjector.ts`: verify AI endpoints route through `prototype-ai-call`, mock AI endpoints use mock path, regular endpoints unchanged
  - [x] 10.2 Unit tests for `SandpackLivePreview.tsx`: verify proxyConfig includes AI endpoints in non-mock check
  - [x] 10.3 Unit tests for `ApiEndpointForm.tsx`: verify AI mode toggle shows/hides correct fields, validation enforces system prompt when AI mode on
  - [x] 10.4 Unit tests for `ApiEndpointCard.tsx`: verify AI badge rendering, model display
  - [x] 10.5 Update Zod schema tests: verify AI field validation, refine rules
  - [x] 10.6 Regression: all existing `apiClientInjector.test.ts` tests pass
  - [x] 10.7 Regression: all existing `SandpackLivePreview.test.tsx` tests pass
  - [x] 10.8 Regression: all existing `ApiEndpointForm` and `ApiEndpointCard` tests pass
  - [x] 10.9 Regression: run full `src/features/prototypes/` test suite

## Dev Notes

### Architecture & Patterns

- **CRITICAL: Stories 10.1, 10.2, and 10.3 built the complete API configuration pipeline.** Database schema (`prototype_api_configs`), TypeScript types, Zod schemas, service layer, React Query hooks, Sandpack `apiClient.js` injection, API config UI, mock editing UI, and CORS proxy Edge Function ALL already exist. This story adds AI-specific fields to the existing schema and a new Edge Function for AI calls.
- **The core architectural decision:** AI API keys (Gemini) MUST remain server-side. The prototype code NEVER sees the `GEMINI_API_KEY`. The generated `apiClient.js` only has the Supabase proxy URL + user's session token. The Edge Function uses the server-side key to call Gemini.
- **AI endpoints reuse the existing API config system** — they are a *type* of endpoint, not a separate system. The `is_ai` boolean flag distinguishes them. When `is_ai = true`, the URL/method/headers fields are irrelevant (the Edge Function manages the Gemini connection). Mock mode still works exactly the same for AI endpoints.
- **Service Response Pattern**: `ServiceResponse<T>` = `{ data: T | null, error: Error | null }`. See `apiConfigService.ts`.
- **Edge Function Pattern**: Deno runtime, `serve()` handler, CORS headers, JWT auth, service role Supabase client. Follow `supabase/functions/gemini-enhance/index.ts` for Gemini API call patterns and `supabase/functions/api-proxy/index.ts` for proxy auth/ownership patterns.

### New Edge Function: `prototype-ai-call`

**Endpoint:** `POST /functions/v1/prototype-ai-call`

**Request body:**
```json
{
  "prototypeId": "uuid-of-prototype",
  "endpointName": "generateDescription",
  "prompt": "Write a product description for a smart water bottle",
  "context": "optional additional context string"
}
```

**Success response (200):**
```json
{
  "text": "The SmartHydrate Pro is an innovative...",
  "model": "gemini-2.5-flash",
  "usage": {
    "promptTokens": 45,
    "completionTokens": 128
  }
}
```

**Error responses:**
| Status | Scenario | Body |
|--------|----------|------|
| 400 | Missing prompt | `{ "error": "Missing required field: prompt", "code": "VALIDATION_ERROR" }` |
| 400 | Endpoint not AI type | `{ "error": "Endpoint is not configured as AI", "code": "NOT_AI_ENDPOINT" }` |
| 400 | Endpoint is in mock mode | `{ "error": "Endpoint is configured for mock mode", "code": "MOCK_MODE" }` |
| 401 | Invalid/missing auth token | `{ "error": "Unauthorized", "code": "AUTH_ERROR" }` |
| 403 | User doesn't own prototype | `{ "error": "Forbidden", "code": "FORBIDDEN" }` |
| 404 | Endpoint config not found | `{ "error": "Endpoint not found", "code": "NOT_FOUND" }` |
| 500 | GEMINI_API_KEY not configured | `{ "error": "AI service not configured", "code": "CONFIG_ERROR" }` |
| 502 | Gemini API error | `{ "error": "AI service error", "code": "AI_ERROR", "details": "..." }` |
| 504 | Gemini API timeout (30s) | `{ "error": "AI service timeout", "code": "TIMEOUT" }` |

**Implementation pattern (follow `gemini-enhance` for Gemini calls, `api-proxy` for auth/ownership):**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  // 1. Validate env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY)
  // 2. Auth: Extract and verify JWT, get user ID
  // 3. Parse body: prototypeId, endpointName, prompt, context
  // 4. DB: Look up prototype_api_configs + verify ownership + verify is_ai = true
  // 5. Build Gemini request: system_prompt + prompt + context, using ai_model, ai_temperature, ai_max_tokens
  // 6. Call Gemini with 30s timeout
  // 7. Parse response, strip markdown blocks, return { text, model, usage }
});
```

**Gemini API call format (from `gemini-enhance/index.ts` — PROVEN PATTERN):**
```typescript
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const response = await fetch(
  `${GEMINI_API_BASE}/${aiModel}:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal, // 30s AbortController
    body: JSON.stringify({
      contents: [
        { parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
      ],
      generationConfig: {
        temperature: aiTemperature,
        maxOutputTokens: aiMaxTokens,
        topK: 40,
        topP: 0.95,
      },
    }),
  }
);

// Parse: data.candidates[0].content.parts[0].text
// Strip markdown code blocks (```json...```) if present
```

### Updated `apiClientInjector.ts` — AI Code Path

**Current generated `apiCall()` has two branches:**
1. `if (config.isMock)` → mock response
2. else → proxy or direct fetch

**New generated `apiCall()` adds a third branch BEFORE the proxy path:**
```javascript
// In generated apiCall() function, after mock check:
if (config.isAi) {
  // Route through AI Edge Function
  const aiUrl = '${supabaseUrl}/functions/v1/prototype-ai-call';
  let aiResponse;
  try {
    aiResponse = await fetch(aiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${accessToken}',
        'apikey': '${supabaseAnonKey}',
      },
      body: JSON.stringify({
        prototypeId: '${prototypeId}',
        endpointName: endpointName,
        prompt: options.prompt || (typeof options.body === 'string' ? options.body : ''),
        context: options.context || undefined,
      }),
    });
  } catch (fetchErr) {
    return {
      ok: false, status: 0,
      statusText: fetchErr.message || 'Network error',
      json: async () => ({ error: fetchErr.message || 'Network error' }),
      text: async () => fetchErr.message || 'Network error',
      headers: new Headers(),
    };
  }

  let aiData;
  try {
    aiData = await aiResponse.json();
  } catch {
    return {
      ok: false, status: aiResponse.status,
      statusText: 'Invalid AI response',
      json: async () => ({ error: 'Invalid AI response' }),
      text: async () => 'Invalid AI response',
      headers: new Headers(),
    };
  }

  if (!aiResponse.ok) {
    return {
      ok: false,
      status: aiResponse.status,
      statusText: aiData.error || aiResponse.statusText,
      json: async () => aiData,
      text: async () => JSON.stringify(aiData),
      headers: new Headers(),
    };
  }

  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => aiData,
    text: async () => aiData.text || JSON.stringify(aiData),
    headers: new Headers({ 'content-type': 'application/json' }),
  };
}
```

**Key design decisions:**
- Mock check comes FIRST (before AI check), so `isMock + isAi` endpoints use mock path
- AI check comes SECOND (before proxy/direct check), so AI endpoints never hit the regular proxy
- The response interface matches mock and proxy responses: `{ ok, status, json(), text() }`
- `options.prompt` is the primary way prototype code passes the user prompt; `options.body` is a fallback
- `options.context` allows passing additional context (e.g., conversation history)

### What Currently Exists (From Stories 10.1, 10.2, 10.3)

| File | Role | Changes Needed |
|------|------|---------------|
| `supabase/migrations/00024_create_prototype_api_configs.sql` | Original schema | No changes (add new migration instead) |
| `src/features/prototypes/types.ts` | TypeScript types | **MODIFY**: Add AI fields to `ApiConfig`, `ApiConfigRow`, inputs, `mapApiConfigRow()` |
| `src/features/prototypes/schemas/apiConfigSchemas.ts` | Zod schemas | **MODIFY**: Add AI fields with conditional validation |
| `src/features/prototypes/services/apiConfigService.ts` | CRUD service | **MODIFY**: Handle AI fields in create/update payloads |
| `src/features/prototypes/hooks/useApiConfigs.ts` | Query hook | No changes (generic CRUD) |
| `src/features/prototypes/utils/apiClientInjector.ts` | Generates apiClient.js | **MODIFY**: Add `isAi` to config map, add AI code path in generated `apiCall()` |
| `src/features/prototypes/utils/apiClientInjector.test.ts` | Injector tests | **MODIFY**: Add AI routing tests |
| `src/features/prototypes/components/SandpackLivePreview.tsx` | Sandpack integration | **VERIFY**: proxyConfig logic already covers AI endpoints (non-mock check) |
| `src/features/prototypes/components/SandpackLivePreview.test.tsx` | Sandpack tests | **MODIFY**: Add AI endpoint scenarios |
| `src/features/prototypes/components/ApiEndpointForm.tsx` | Config form | **MODIFY**: Add AI mode toggle and AI-specific fields |
| `src/features/prototypes/components/ApiEndpointCard.tsx` | Card display | **MODIFY**: Add AI badge and model display |
| `src/features/prototypes/components/ApiConfigurationPanel.tsx` | Panel orchestration | No changes (generic CRUD, handles any config) |
| `src/pages/PrototypeViewerPage.tsx` | Page integration | No changes (apiConfigs already passed) |

### New Files

| File | Role |
|------|------|
| `supabase/migrations/00025_add_ai_columns_to_prototype_api_configs.sql` | **NEW**: Migration adding AI columns |
| `supabase/functions/prototype-ai-call/index.ts` | **NEW**: Edge Function for AI API calls |

### Database Migration Details

```sql
-- 00025_add_ai_columns_to_prototype_api_configs.sql
-- Epic 10, Story 10.4: AI API Integration in Prototypes

ALTER TABLE prototype_api_configs
  ADD COLUMN is_ai BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN ai_model TEXT DEFAULT 'gemini-2.5-flash',
  ADD COLUMN ai_system_prompt TEXT,
  ADD COLUMN ai_max_tokens INTEGER DEFAULT 1024,
  ADD COLUMN ai_temperature NUMERIC(3,2) DEFAULT 0.7;

-- AI endpoints must have a system prompt
ALTER TABLE prototype_api_configs
  ADD CONSTRAINT chk_ai_system_prompt
  CHECK (is_ai = false OR ai_system_prompt IS NOT NULL);

-- AI temperature must be between 0 and 2
ALTER TABLE prototype_api_configs
  ADD CONSTRAINT chk_ai_temperature
  CHECK (ai_temperature IS NULL OR (ai_temperature >= 0 AND ai_temperature <= 2));

-- AI max tokens must be positive
ALTER TABLE prototype_api_configs
  ADD CONSTRAINT chk_ai_max_tokens
  CHECK (ai_max_tokens IS NULL OR (ai_max_tokens >= 1 AND ai_max_tokens <= 8192));

COMMENT ON COLUMN prototype_api_configs.is_ai IS 'When true, endpoint routes through AI Edge Function instead of API proxy';
COMMENT ON COLUMN prototype_api_configs.ai_model IS 'AI model identifier (e.g., gemini-2.5-flash)';
COMMENT ON COLUMN prototype_api_configs.ai_system_prompt IS 'System instructions for the AI model';
COMMENT ON COLUMN prototype_api_configs.ai_max_tokens IS 'Maximum output tokens for AI response (default 1024)';
COMMENT ON COLUMN prototype_api_configs.ai_temperature IS 'AI generation temperature 0-2 (default 0.7)';
```

### Existing File References

**Gemini API call pattern to follow:**
- `supabase/functions/gemini-enhance/index.ts` — Proven Gemini API call with retry, response parsing, markdown stripping

**Proxy auth/ownership pattern to follow:**
- `supabase/functions/api-proxy/index.ts` — JWT auth, ownership verification, structured error responses, CORS, timeout

**Injector to modify:**
- `src/features/prototypes/utils/apiClientInjector.ts` — Add `isAi` to config map, new AI code path before proxy path

**Form component to modify:**
- `src/features/prototypes/components/ApiEndpointForm.tsx` — Add AI toggle with conditional field rendering

**Card component to modify:**
- `src/features/prototypes/components/ApiEndpointCard.tsx` — Add AI badge and model info

**Auth/session access:**
- `src/features/auth/hooks/useAuth.ts` — Provides session with access_token
- `src/lib/supabase.ts` — Supabase client configuration

### Project Structure Notes

```
supabase/functions/
├── prototype-ai-call/
│   └── index.ts                    ← NEW (AI API Edge Function)
├── api-proxy/
│   └── index.ts                    (existing, auth/ownership reference)
├── gemini-enhance/
│   └── index.ts                    (existing, Gemini API call reference)
├── gemini-prd-chat/
│   └── index.ts                    (existing)
├── prototype-generate/
│   └── index.ts                    (existing)
└── verify-prototype-password/
    └── index.ts                    (existing)

supabase/migrations/
├── 00024_create_prototype_api_configs.sql  (existing)
└── 00025_add_ai_columns_to_prototype_api_configs.sql ← NEW

src/features/prototypes/
├── types.ts                        ← MODIFIED (add AI fields)
├── schemas/
│   └── apiConfigSchemas.ts         ← MODIFIED (add AI validation)
├── services/
│   └── apiConfigService.ts         ← MODIFIED (handle AI fields in CRUD)
├── utils/
│   ├── apiClientInjector.ts        ← MODIFIED (add isAi to config, AI code path)
│   └── apiClientInjector.test.ts   ← MODIFIED (add AI routing tests)
├── components/
│   ├── SandpackLivePreview.tsx     ← VERIFY (proxyConfig covers AI endpoints)
│   ├── SandpackLivePreview.test.tsx ← MODIFIED (add AI endpoint scenarios)
│   ├── ApiEndpointForm.tsx         ← MODIFIED (add AI mode toggle + fields)
│   ├── ApiEndpointCard.tsx         ← MODIFIED (add AI badge + model display)
│   └── ... (existing unchanged)
└── ... (existing unchanged)
```

### Critical Do's and Don'ts

**DO:**
- Follow `gemini-enhance/index.ts` EXACTLY for Gemini API call format: URL pattern, request body structure, response parsing, markdown stripping
- Follow `api-proxy/index.ts` EXACTLY for auth, ownership verification, CORS headers, error response structure, timeout handling
- Use `Deno.env.get('GEMINI_API_KEY')` in the Edge Function (same key already used by `gemini-enhance`)
- Keep `is_ai` and `isMock` independent — an AI endpoint CAN be in mock mode (returns mock data instead of calling Gemini)
- Add the AI check AFTER mock check but BEFORE proxy check in generated `apiCall()` code
- Make `url` field NOT required when `isAi = true` in the form (set a default like `'ai://gemini'` or make it optional in the schema)
- Use `Deno.env.get()` for all environment variables in Edge Functions (not `process.env`)
- Follow co-located test pattern: update existing test files, don't create new test files for modified code
- Use Vitest + React Testing Library for tests
- Keep the response interface consistent: `{ ok, status, json(), text(), headers }` — same for mock, AI, and proxy responses
- Strip markdown code blocks from Gemini response (```json...```) using the same logic from `gemini-enhance`

**DON'T:**
- Don't expose `GEMINI_API_KEY` in the generated `apiClient.js` — this is the ENTIRE POINT of the Edge Function
- Don't modify the mock response path in `apiClientInjector.ts` — it works perfectly for both regular and AI endpoints
- Don't modify the regular proxy path (Story 10.3) — AI endpoints have their own code path
- Don't add retry logic in the Edge Function (same decision as `api-proxy` — let the prototype code decide on retries)
- Don't modify `ApiConfigurationPanel.tsx` — it handles CRUD generically and doesn't need changes
- Don't modify `useApiConfigs.ts` hooks — they're generic CRUD hooks that work with any fields
- Don't modify `api-proxy/index.ts` — AI calls go through the NEW `prototype-ai-call` function
- Don't install any new npm packages — everything needed is already available (react-hook-form, Zod, DaisyUI, CodeMirror)
- Don't log AI request prompts or responses in the Edge Function (privacy concern — that's Story 10.5's monitoring feature)
- Don't add AI-specific fields to the `ApiEndpointForm` schema that also affect non-AI endpoints (use `.refine()` for conditional validation)

### ApiEndpointForm UI Design

**AI Mode Toggle:**
```
┌──────────────────────────────────────────┐
│ Endpoint Name: [generateDescription    ] │
│                                          │
│ 🤖 AI Mode  [████████ ON]               │
│                                          │
│ ┌─ AI Configuration ──────────────────┐  │
│ │ Model:  [gemini-2.5-flash    ▾]    │  │
│ │                                     │  │
│ │ System Prompt: *                    │  │
│ │ ┌─────────────────────────────────┐ │  │
│ │ │ You are a helpful assistant     │ │  │
│ │ │ that generates product          │ │  │
│ │ │ descriptions...                 │ │  │
│ │ └─────────────────────────────────┘ │  │
│ │ 128/10000 characters               │  │
│ │                                     │  │
│ │ Max Tokens: [1024]  Temperature:    │  │
│ │             1-8192  [■■■■□□□] 0.7   │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ 🔀 Mock Mode  [░░░░░░░ OFF]             │
│                                          │
│        [Cancel]  [Save Endpoint]         │
└──────────────────────────────────────────┘
```

**When AI Mode is OFF (standard endpoint):**
```
┌──────────────────────────────────────────┐
│ Endpoint Name: [getUsers               ] │
│                                          │
│ 🤖 AI Mode  [░░░░░░░ OFF]               │
│                                          │
│ URL:    [https://api.example.com/users ] │
│ Method: [GET ▾]                          │
│ Headers: [+ Add Header]                  │
│                                          │
│ 🔀 Mock Mode  [░░░░░░░ OFF]             │
│                                          │
│        [Cancel]  [Save Endpoint]         │
└──────────────────────────────────────────┘
```

### ApiEndpointCard AI Display

```
┌──────────────────────────────────────────┐
│ 🤖 AI  generateDescription              │
│ Model: gemini-2.5-flash                  │
│ "You are a helpful assistant that gen..."│
│                 [Edit] [Delete]          │
└──────────────────────────────────────────┘
```

vs standard:
```
┌──────────────────────────────────────────┐
│ GET  getUsers                            │
│ https://api.example.com/users            │
│                 [Edit] [Delete]          │
└──────────────────────────────────────────┘
```

### Testing Approach

**`apiClientInjector.test.ts` additions:**
- Test that AI endpoint with `isAi: true, isMock: false` generates AI proxy code path
- Test that AI endpoint with `isAi: true, isMock: true` uses mock path (not AI path)
- Test that non-AI endpoints are completely unaffected by AI code path
- Test that AI proxy URL uses `prototype-ai-call` (not `api-proxy`)
- Test that generated AI call sends `prompt` and `context` fields
- Test that generated AI error handling returns clean error response
- Test backward compatibility: `generateApiClientFile(configs)` without proxyConfig still works
- Test mixed configs: some AI, some regular, some mock — all route correctly

**`SandpackLivePreview.test.tsx` additions:**
- Test that proxyConfig is created when apiConfigs contain non-mock AI endpoints
- Test that proxyConfig is NOT created when all AI endpoints are in mock mode

**`ApiEndpointForm.test.tsx` additions:**
- Test AI mode toggle shows/hides correct fields
- Test system prompt is required when AI mode is on
- Test URL is not required when AI mode is on
- Test AI-specific field defaults (model, max tokens, temperature)
- Test form submission includes AI fields when AI mode is on
- Test form submission does NOT include AI fields when AI mode is off

**`ApiEndpointCard.test.tsx` additions:**
- Test AI badge renders when `isAi = true`
- Test model name displayed instead of URL for AI endpoints
- Test truncated system prompt preview

**Regression tests:**
- All existing `apiClientInjector.test.ts` tests must still pass
- All existing `SandpackLivePreview.test.tsx` tests must still pass
- All existing form and card tests must still pass
- Run full `src/features/prototypes/` test suite

### Cross-Story Context (Epic 10)

- **Story 10.1** (done): Built the entire API configuration foundation — database, types, schemas, service, hooks, form, card, panel, Sandpack injection with mock support. The `apiClientInjector.ts` already has mock and direct-fetch/proxy code paths. The `ApiEndpointForm.tsx` already has a mock mode toggle pattern we follow for the AI toggle.
- **Story 10.2** (done): Enhanced mock editing UI with CodeMirror editor, templates, and preview. No impact on this story.
- **Story 10.3** (done): Added CORS proxy Edge Function and updated injector/SandpackLivePreview. The proxy auth/ownership pattern is the reference for the AI Edge Function. The generated code error handling patterns (H2, M3 fixes) should be replicated in AI code path.
- **Story 10.5** (next): API Call Monitoring & Debugging — adds request logging. Will log AI calls too. No impact on this story.

### Previous Story Intelligence (10.3)

**Learnings from Story 10.3 code review that apply here:**
- **H1 fix (double body consumption):** In the Edge Function, read response as text first then `JSON.parse`, never call `.json()` then `.text()` on the same response.
- **H2 fix (non-JSON body):** In generated code, wrap body parsing in try/catch. The AI path should use `options.prompt` directly (string), not parse JSON body.
- **M1 fix (method validation):** Edge Function MUST check `req.method !== 'POST'` and return 405.
- **M2 fix (env var validation):** Edge Function MUST validate env vars upfront and return 500 "Service not configured" if missing.
- **M3 fix (non-JSON response):** Generated code must wrap `.json()` parsing in try/catch for the AI proxy response too.
- **Dev agent must mark task checkboxes `[x]` upon completion** and populate the Dev Agent Record section.
- Clean up unused imports.
- Mock `console.error` in tests where errors are expected.

### Git Intelligence

**Last 5 commits:**
```
9e47950 Complete Story 10.3: Real API Calls from Prototypes - Code Review Fixes
b3453de Complete Story 10.2: Mock API Response System - Code Review Fixes
3a8bb22 Complete Story 10.1: API Configuration Interface - Code Review Fixes
7fb9de6 Complete Story 9.5: Revoke Public Access - Code Review Fixes
7e63745 Complete Story 9.4: Public Prototype Viewer (No Authentication) - Code Review Fixes
```

**Patterns established in Epic 10:**
- Feature code in `src/features/prototypes/`, co-located tests
- Barrel exports via `index.ts`
- React Query for server state, Zustand for client state
- DaisyUI components with PassportCard theme
- Edge Functions: Deno serve, CORS headers, JWT auth, service role client
- `apiClientInjector.ts` generates self-contained JavaScript for Sandpack injection
- Mock and real API call paths share the same response interface: `{ ok, status, json(), text() }`
- Form patterns: react-hook-form + Zod resolver, DaisyUI form controls, toggle switches
- Card patterns: DaisyUI card with action buttons, status badges

### Latest Technical Information

**Gemini 2.5 Flash API (current as of Feb 2026):**
- **Model ID:** `gemini-2.5-flash`
- **API URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Max input tokens:** 1,048,576
- **Max output tokens:** 65,535 (default varies)
- **Supports:** Text, Code, Images, Audio, Video inputs; Text output
- **Features:** Thinking capabilities, function calling, structured output, context caching
- **Pricing:** $0.30/M input tokens, $2.50/M output tokens (via OpenRouter); free tier available via Google AI Studio

**IMPORTANT: The existing `gemini-enhance` function uses `gemini-2.0-flash` (line 28 of `gemini-enhance/index.ts`).** The AI config defaults to `gemini-2.5-flash` (the newer model). Both models use the same API format. The `ai_model` field in the database allows users to choose their model.

**Gemini API request format (verified from existing codebase):**
```json
{
  "contents": [{ "parts": [{ "text": "prompt here" }] }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 1024
  }
}
```

**Gemini API response parsing (verified from existing codebase):**
```
data.candidates[0].content.parts[0].text
```
May include markdown code blocks (```json...```) that need stripping.

### References

- [Source: planning-artifacts/epics.md#Epic 10, Story 10.4]
- [Source: planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: planning-artifacts/architecture.md#Authentication & Security]
- [Source: planning-artifacts/architecture.md#Architectural Boundaries — Edge Functions]
- [Source: planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: implementation-artifacts/10-3-real-api-calls-from-prototypes.md — Previous story context & learnings]
- [Source: src/features/prototypes/utils/apiClientInjector.ts — Injector to modify]
- [Source: src/features/prototypes/components/SandpackLivePreview.tsx — Sandpack integration to verify]
- [Source: src/features/prototypes/components/ApiEndpointForm.tsx — Form to modify with AI toggle]
- [Source: src/features/prototypes/components/ApiEndpointCard.tsx — Card to modify with AI badge]
- [Source: src/features/prototypes/types.ts — Types to extend]
- [Source: src/features/prototypes/schemas/apiConfigSchemas.ts — Schemas to extend]
- [Source: src/features/prototypes/services/apiConfigService.ts — Service to update]
- [Source: supabase/functions/gemini-enhance/index.ts — Gemini API call reference pattern]
- [Source: supabase/functions/api-proxy/index.ts — Auth/ownership/proxy reference pattern]
- [Source: supabase/migrations/00024_create_prototype_api_configs.sql — Existing schema reference]

## Dev Agent Record

### Agent Model Used

Claude (via Cursor IDE)

### Debug Log References

None — all tests passed on first run (1046 tests, 65 test files).

### Completion Notes List

- All 7 Acceptance Criteria implemented and verified.
- Database migration adds 5 AI columns with CHECK constraints (system prompt required for AI, temperature 0-2, max tokens 1-8192).
- Edge Function `prototype-ai-call` follows proven patterns from `gemini-enhance` (Gemini API) and `api-proxy` (auth/ownership).
- Generated `apiClient.js` correctly routes: mock → AI → proxy, with AI check after mock check to preserve mock behavior for AI endpoints.
- SandpackLivePreview's existing `!cfg.isMock` check naturally covers AI endpoints — no structural changes needed (verified with tests).
- Code review fixes applied: safe JSON body parsing in Edge Function (M1), error logging in outer catch (M2).
- All existing regression tests pass — no breaking changes to mock, proxy, or form behavior.

### File List

- `supabase/migrations/00025_add_ai_columns_to_prototype_api_configs.sql` — NEW: Migration adding AI columns
- `supabase/functions/prototype-ai-call/index.ts` — NEW: Edge Function for AI API calls
- `src/features/prototypes/types.ts` — MODIFIED: Added AI fields to ApiConfig, ApiConfigRow, Create/Update inputs, mapApiConfigRow
- `src/features/prototypes/schemas/apiConfigSchemas.ts` — MODIFIED: Added AI fields with conditional validation (isAi + aiSystemPrompt refine)
- `src/features/prototypes/services/apiConfigService.ts` — MODIFIED: AI fields in create/update payloads with snake_case mapping
- `src/features/prototypes/utils/apiClientInjector.ts` — MODIFIED: Added isAi to config map, generateAiCodePath() for AI Edge Function routing
- `src/features/prototypes/utils/apiClientInjector.test.ts` — MODIFIED: Added 16 AI routing tests
- `src/features/prototypes/components/ApiEndpointForm.tsx` — MODIFIED: AI mode toggle, conditional AI/standard fields, form validation
- `src/features/prototypes/components/ApiEndpointForm.test.tsx` — MODIFIED: Added 8 AI mode form tests
- `src/features/prototypes/components/ApiEndpointCard.tsx` — MODIFIED: AI badge, model display, system prompt preview
- `src/features/prototypes/components/ApiEndpointCard.test.tsx` — MODIFIED: Added 8 AI display tests
- `src/features/prototypes/components/SandpackLivePreview.test.tsx` — MODIFIED: Added 3 AI proxy config tests
- `src/features/prototypes/schemas/apiConfigSchemas.test.ts` — MODIFIED: Added 16 AI field validation tests
- `src/features/prototypes/services/apiConfigService.test.ts` — MODIFIED: Updated sample rows with AI fields
- `src/features/prototypes/hooks/useApiConfigs.test.tsx` — MODIFIED: Updated test data with AI fields
- `src/features/prototypes/hooks/useCreateApiConfig.test.tsx` — MODIFIED: Updated test data with AI fields
- `src/features/prototypes/hooks/useUpdateApiConfig.test.tsx` — MODIFIED: Updated test data with AI fields
- `src/features/prototypes/components/ApiEndpointList.test.tsx` — MODIFIED: Updated test data with AI fields
- `src/features/prototypes/components/ApiConfigurationPanel.test.tsx` — MODIFIED: Updated test data with AI fields
