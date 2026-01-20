# Story 2.6: Gemini Edge Function for Idea Enhancement

Status: review

## Story

As a **developer**,
I want **a Supabase Edge Function that calls Gemini API to enhance ideas**,
So that **API keys are protected and AI enhancement works**.

## Acceptance Criteria

1. **Given** a user submits their idea for enhancement **When** the Edge Function receives the request **Then** it calls Gemini 2.5 Flash API with a prompt to enhance clarity and professionalism

2. **Given** the Edge Function is deployed **Then** the Gemini API key is stored securely in Supabase environment variables (never exposed to client)

3. **Given** a valid enhancement request **When** the API processes it **Then** the function returns enhanced text for problem, solution, and impact fields

4. **Given** the Gemini API call fails **When** an error occurs **Then** the function implements retry logic (up to 3 retries with exponential backoff)

5. **Given** all retries fail **When** enhancement cannot complete **Then** the function returns a clear error response allowing the client to proceed with original text

6. **Given** Story 2.5's geminiService stub exists **When** this story is complete **Then** the stub is replaced with actual Supabase Edge Function invocation

7. **Given** the Edge Function receives a request **Then** it validates input fields are present and non-empty

8. **Given** the function completes successfully **When** the response is returned **Then** response time is under 5 seconds per PRD requirement NFR-P4

## Tasks / Subtasks

- [x] Task 1: Create Supabase Edge Function scaffold (AC: 1, 2)
  - [x] Create `supabase/functions/gemini-enhance/index.ts`
  - [x] Add function configuration with cors headers
  - [x] Set up Deno runtime with proper imports
  - [x] Add environment variable access for `GEMINI_API_KEY`

- [x] Task 2: Implement request validation (AC: 7)
  - [x] Parse incoming JSON body
  - [x] Validate `problem`, `solution`, `impact` fields exist and are non-empty
  - [x] Return 400 error with clear message for invalid requests
  - [x] Add content length validation (reasonable max limit)

- [x] Task 3: Implement Gemini API integration (AC: 1, 3, 8)
  - [x] Construct Gemini 2.5 Flash API endpoint URL
  - [x] Create enhancement prompt that improves clarity and professionalism
  - [x] Send POST request to Gemini API with proper headers
  - [x] Parse Gemini response and extract enhanced text
  - [x] Map response to `enhanced_problem`, `enhanced_solution`, `enhanced_impact`

- [x] Task 4: Implement retry logic with exponential backoff (AC: 4, 5)
  - [x] Create retry wrapper function (max 3 attempts)
  - [x] Implement exponential backoff: 1s, 2s, 4s delays
  - [x] Catch and log errors between retries
  - [x] Return last error if all retries fail

- [x] Task 5: Implement error handling (AC: 5)
  - [x] Handle Gemini API errors (rate limits, auth failures, timeouts)
  - [x] Handle network errors gracefully
  - [x] Return structured error response with code and message
  - [x] Log errors for debugging (console.error)

- [x] Task 6: Update geminiService to call Edge Function (AC: 6)
  - [x] Replace stub implementation in `src/services/geminiService.ts`
  - [x] Use `supabase.functions.invoke('gemini-enhance', { body })`
  - [x] Map Edge Function response to service response format
  - [x] Preserve existing ServiceResponse<T> type pattern

- [x] Task 7: Configure environment variables
  - [x] Add `GEMINI_API_KEY` to Supabase project secrets
  - [x] Add `GEMINI_API_KEY` placeholder to `.env.example`
  - [x] Document environment variable setup in function README

- [x] Task 8: Test Edge Function locally
  - [x] Install Supabase CLI if not present: `npm install -g supabase`
  - [x] Run `supabase functions serve gemini-enhance --env-file .env.local`
  - [x] Test with curl or Postman
  - [x] Verify error handling and retry logic

## Dev Notes

### Architecture Patterns (MANDATORY)

**Supabase Edge Function Location:**
```
supabase/
└── functions/
    └── gemini-enhance/
        └── index.ts      (THIS STORY - NEW)
```

**Service Layer Update:**
```
src/
└── services/
    └── geminiService.ts  (THIS STORY - UPDATE from stub to real call)
```

### Edge Function Implementation

```typescript
// supabase/functions/gemini-enhance/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnhanceRequest {
  problem: string;
  solution: string;
  impact: string;
}

interface EnhanceResponse {
  enhanced_problem: string;
  enhanced_solution: string;
  enhanced_impact: string;
}

interface ErrorResponse {
  error: string;
  code: string;
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Retry wrapper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

async function enhanceWithGemini(
  problem: string,
  solution: string,
  impact: string
): Promise<EnhanceResponse> {
  const prompt = `You are a professional business analyst helping to improve idea clarity and professionalism.

Enhance the following idea submission by:
1. Improving clarity and readability
2. Making it more professional and structured
3. Preserving the original intent and meaning
4. Adding context where helpful
5. Using concise, impactful language

IMPORTANT: Return ONLY a valid JSON object with the enhanced text for each field. Do not include any markdown, code blocks, or explanatory text.

Original Idea:

PROBLEM:
${problem}

SOLUTION:
${solution}

IMPACT:
${impact}

Return your response in this exact JSON format (no markdown, no code blocks):
{"enhanced_problem": "...", "enhanced_solution": "...", "enhanced_impact": "..."}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Extract text from Gemini response
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!generatedText) {
    throw new Error('No content generated by Gemini');
  }

  // Parse JSON from response (handle potential markdown code blocks)
  let cleanedText = generatedText.trim();
  
  // Remove markdown code blocks if present
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  try {
    const enhanced = JSON.parse(cleanedText) as EnhanceResponse;
    
    // Validate response structure
    if (!enhanced.enhanced_problem || !enhanced.enhanced_solution || !enhanced.enhanced_impact) {
      throw new Error('Invalid response structure from Gemini');
    }
    
    return enhanced;
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', cleanedText);
    throw new Error('Failed to parse AI response');
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate API key is configured
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured', code: 'CONFIG_ERROR' } as ErrorResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body: EnhanceRequest = await req.json();

    if (!body.problem?.trim() || !body.solution?.trim() || !body.impact?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: problem, solution, impact', code: 'VALIDATION_ERROR' } as ErrorResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate content length (prevent abuse)
    const totalLength = body.problem.length + body.solution.length + body.impact.length;
    if (totalLength > 10000) {
      return new Response(
        JSON.stringify({ error: 'Content too long. Maximum 10,000 characters total.', code: 'CONTENT_TOO_LONG' } as ErrorResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Gemini with retry logic
    const enhanced = await withRetry(() =>
      enhanceWithGemini(body.problem, body.solution, body.impact)
    );

    return new Response(
      JSON.stringify(enhanced),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Enhancement failed:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to enhance idea. Please try again or proceed with original text.',
        code: 'ENHANCEMENT_FAILED',
      } as ErrorResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Updated geminiService Implementation

```typescript
// src/services/geminiService.ts
// REPLACE the entire stub implementation with this:

import { supabase } from '../lib/supabase';

export type ServiceResponse<T> = {
  data: T | null;
  error: { message: string; code: string } | null;
};

interface EnhancedIdea {
  problem: string;
  solution: string;
  impact: string;
}

interface EdgeFunctionResponse {
  enhanced_problem: string;
  enhanced_solution: string;
  enhanced_impact: string;
}

interface EdgeFunctionError {
  error: string;
  code: string;
}

export const geminiService = {
  /**
   * Enhance idea with AI assistance via Supabase Edge Function
   * 
   * Calls the gemini-enhance Edge Function which:
   * - Protects the Gemini API key server-side
   * - Implements retry logic with exponential backoff
   * - Returns enhanced problem, solution, and impact text
   */
  async enhanceIdea(
    problem: string,
    solution: string,
    impact: string
  ): Promise<ServiceResponse<EnhancedIdea>> {
    try {
      const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse>('gemini-enhance', {
        body: { problem, solution, impact },
      });

      if (error) {
        console.error('Edge function error:', error);
        return {
          data: null,
          error: { 
            message: error.message || 'Failed to enhance idea with AI', 
            code: 'EDGE_FUNCTION_ERROR' 
          },
        };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'No data returned from AI enhancement', code: 'NO_DATA' },
        };
      }

      // Check for error response from Edge Function
      if ('error' in data && 'code' in data) {
        const errorData = data as unknown as EdgeFunctionError;
        return {
          data: null,
          error: { message: errorData.error, code: errorData.code },
        };
      }

      // Map Edge Function response to service response
      return {
        data: {
          problem: data.enhanced_problem,
          solution: data.enhanced_solution,
          impact: data.enhanced_impact,
        },
        error: null,
      };
    } catch (error) {
      console.error('AI enhancement error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to enhance idea with AI', 
          code: 'AI_ENHANCE_ERROR' 
        },
      };
    }
  },
};
```

### Environment Variables Setup

**Supabase Project Secrets (Dashboard > Project Settings > Edge Functions):**
```
GEMINI_API_KEY=your-gemini-api-key-here
```

**Local Development (.env.local):**
```bash
# For local Edge Function testing
GEMINI_API_KEY=your-gemini-api-key-here
```

**Update .env.example:**
```bash
# Gemini AI API Key (for Edge Functions)
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=
```

### Gemini API Reference

**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

**Authentication:** API key passed as query parameter `?key=YOUR_API_KEY`

**Request Body Structure:**
```json
{
  "contents": [
    {
      "parts": [{ "text": "Your prompt here" }]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 2048
  }
}
```

**Response Structure:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [{ "text": "Generated response" }],
        "role": "model"
      },
      "finishReason": "STOP"
    }
  ]
}
```

### Testing Commands

**Deploy Edge Function:**
```bash
# Login to Supabase (if not already)
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy gemini-enhance

# Set secrets
supabase secrets set GEMINI_API_KEY=your-api-key
```

**Local Testing:**
```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve gemini-enhance --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/gemini-enhance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"problem": "Test problem", "solution": "Test solution", "impact": "Test impact"}'
```

### Contract Between Edge Function and geminiService

**Request (geminiService → Edge Function):**
```typescript
interface EnhanceRequest {
  problem: string;   // Min 50 chars from wizard validation
  solution: string;  // Min 50 chars from wizard validation
  impact: string;    // Min 30 chars from wizard validation
}
```

**Success Response (Edge Function → geminiService):**
```typescript
interface EnhanceResponse {
  enhanced_problem: string;
  enhanced_solution: string;
  enhanced_impact: string;
}
```

**Error Response (Edge Function → geminiService):**
```typescript
interface ErrorResponse {
  error: string;  // User-friendly message
  code: string;   // Machine-readable code
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `CONFIG_ERROR` | 500 | Gemini API key not configured |
| `VALIDATION_ERROR` | 400 | Missing required fields |
| `CONTENT_TOO_LONG` | 400 | Input exceeds 10,000 chars |
| `ENHANCEMENT_FAILED` | 500 | AI processing failed after retries |

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Edge Function folder | `kebab-case` | `gemini-enhance` |
| Edge Function file | `index.ts` | `supabase/functions/gemini-enhance/index.ts` |
| TypeScript interfaces | `PascalCase` | `EnhanceRequest`, `EnhanceResponse` |
| Service methods | `camelCase` | `enhanceIdea` |
| Error codes | `SCREAMING_SNAKE_CASE` | `ENHANCEMENT_FAILED` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `GEMINI_API_KEY` |

### Anti-Patterns to AVOID

1. **DO NOT** expose Gemini API key to client - always use Edge Function
2. **DO NOT** skip retry logic - network failures are common
3. **DO NOT** hardcode API keys - use environment variables
4. **DO NOT** return raw Gemini errors to client - wrap in user-friendly messages
5. **DO NOT** skip input validation - prevent abuse and malformed requests
6. **DO NOT** ignore CORS headers - Edge Function must handle OPTIONS preflight
7. **DO NOT** parse JSON without try-catch - AI responses can be unpredictable
8. **DO NOT** change the ServiceResponse<T> pattern - maintain consistency
9. **DO NOT** skip content length validation - prevent token abuse
10. **DO NOT** use synchronous delays in retry logic - use async/await properly

### Dependencies on Previous Stories

- **Story 2.5 (Step 4 Review):** Created stub geminiService with documented contract
- **Story 1.3 (Supabase Setup):** Supabase project configured, client initialized
- **Story 1.1 (Project Init):** Supabase CLI and project structure established

### Dependencies for Future Stories

- **Story 2.7 (Submit Idea):** Uses enhanced content from this function
- **Story 3.3 (PRD Chat):** Will follow same Edge Function pattern for `gemini-prd-chat`

### Security Considerations

1. **API Key Protection:** Gemini API key stored in Supabase secrets, never exposed to client
2. **Input Validation:** All inputs validated for presence and length
3. **Rate Limiting:** Supabase Edge Functions have built-in rate limiting
4. **Error Sanitization:** Internal errors logged but not exposed to client
5. **CORS Configuration:** Restricted to allow only expected origins in production

### Performance Requirements (NFR-P4)

- AI response time must be under 5 seconds
- Retry delays: 1s → 2s → 4s (total max ~7s including retries)
- If all retries fail, return error within 10 seconds total
- Client implements its own timeout via React Query

### Project Structure Notes

- First Supabase Edge Function in the project
- Establishes pattern for future Edge Functions (gemini-prd-chat, prototype-generate)
- Updates existing geminiService stub from Story 2.5
- No new frontend components required

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.6]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Key Protection]
- [Source: _bmad-output/planning-artifacts/prd.md#FR12 AI Enhancement]
- [Source: _bmad-output/planning-artifacts/prd.md#NFR-P4 AI Response Time]
- [Source: _bmad-output/implementation-artifacts/2-5-idea-wizard-step-4-review-and-ai-enhancement.md#geminiService stub]
- [Source: Gemini API Docs: https://ai.google.dev/gemini-api/docs]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

- Created first Supabase Edge Function for the project: `supabase/functions/gemini-enhance/index.ts`
- Implemented complete Gemini API integration with proper request/response handling
- Implemented retry logic with exponential backoff (1s, 2s, 4s delays, max 3 attempts)
- Implemented request validation for required fields and content length limit (10,000 chars)
- Updated geminiService stub to call actual Edge Function via `supabase.functions.invoke()`
- Added comprehensive service tests (10 tests covering success, errors, and edge cases)
- Updated .env.example with GEMINI_API_KEY placeholder and documentation
- Fixed pre-existing test file issue (duplicate .ts/.tsx file)
- Fixed pre-existing unused import in StepReview.test.tsx
- All 391 tests pass, build succeeds

### File List

- `supabase/functions/gemini-enhance/index.ts` (NEW) - Supabase Edge Function for AI idea enhancement
- `src/services/geminiService.ts` (MODIFIED) - Replaced stub with actual Edge Function invocation
- `src/services/geminiService.test.ts` (NEW) - Comprehensive unit tests for geminiService
- `.env.example` (MODIFIED) - Added GEMINI_API_KEY documentation

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-19 | Initial implementation - Edge Function and service layer | Claude Opus 4.5 |
