# Story 4.5: Chat-Based Prototype Refinement

Status: review

## Story

As a **user**,
I want **to refine my prototype through natural language chat**,
So that **I can iterate on the design without technical knowledge**.

## Acceptance Criteria

1. **Given** I am viewing my prototype **When** I type a refinement request (e.g., "Make the header larger" or "Add a sidebar") **Then** the request is sent to Open-Lovable for processing

2. **Given** a refinement request is processing **Then** I see a loading indicator during generation

3. **Given** refinement completes successfully **Then** the updated prototype appears within 10 seconds

4. **Given** refinement completes successfully **Then** a new version is saved to the database with incremented version number

5. **Given** I make multiple refinements **When** each refinement completes **Then** the prototype updates in place **And** I can see immediate results of my changes

6. **Given** refinement fails **Then** I see a clear error message with retry option **And** my refinement request is preserved for retry

7. **Given** I am not authenticated **Then** I cannot access the refinement interface

8. **Given** the refinement request is empty or invalid **Then** I see validation error before submission

## Tasks / Subtasks

- [x] Task 1: Create refinement Edge Function endpoint (AC: 1, 4)
  - [x] Add refinement endpoint to `supabase/functions/prototype-generate/index.ts`
  - [x] Accept prototypeId, refinementPrompt, and current code/url
  - [x] Validate authentication and input
  - [x] Call Open-Lovable API with refinement context
  - [x] Create new prototype version with incremented version number
  - [x] Return new prototype ID for polling

- [x] Task 2: Extend openLovableService for refinement (AC: 1, 3, 4)
  - [x] Add `refine()` method to openLovableService
  - [x] Accept prototypeId and refinementPrompt
  - [x] Call prototype-generate Edge Function with refinement flag
  - [x] Implement polling for refinement completion
  - [x] Return new prototype version data

- [x] Task 3: Create useRefinePrototype React Query hook (AC: 1, 3, 4, 5)
  - [x] Create `src/features/prototypes/hooks/useRefinePrototype.ts`
  - [x] Implement mutation with openLovableService.refine()
  - [x] Handle loading, success, and error states
  - [x] Invalidate prototype queries on success
  - [x] Update cache with new version

- [x] Task 4: Create RefinementChat component (AC: 1, 2, 6, 8)
  - [x] Create `src/features/prototypes/components/RefinementChat.tsx`
  - [x] Implement chat input with validation (min 10 characters)
  - [x] Show loading indicator during refinement
  - [x] Display error messages with retry button
  - [x] Preserve refinement prompt on error for retry
  - [x] Follow ChatInterface pattern from PRD Builder

- [x] Task 5: Integrate RefinementChat into PrototypeViewer (AC: 1, 5)
  - [x] Add RefinementChat component to PrototypeViewer page
  - [x] Position chat interface alongside prototype preview
  - [x] Pass current prototype data to RefinementChat
  - [x] Handle prototype updates when refinement completes
  - [x] Ensure responsive layout (stacks on mobile)

- [x] Task 6: Implement optimistic UI updates (AC: 5)
  - [x] Show "Refining..." indicator on prototype preview
  - [x] Disable refinement input during processing
  - [x] Update prototype preview immediately when new version ready
  - [x] Smooth transition between versions

- [x] Task 7: Add refinement history display (AC: 4, 5)
  - [x] Create `RefinementHistoryItem` component
  - [x] Display refinement prompts with timestamps
  - [x] Show version numbers for each refinement
  - [x] Allow clicking to view previous versions (future enhancement)

- [x] Task 8: Implement error handling and retry logic (AC: 6)
  - [x] Handle timeout errors (>10 seconds)
  - [x] Handle API errors from Open-Lovable
  - [x] Handle network errors
  - [x] Provide clear error messages
  - [x] Implement retry button that preserves prompt

- [x] Task 9: Add input validation (AC: 8)
  - [x] Minimum 10 characters for refinement prompt
  - [x] Maximum 500 characters to prevent abuse
  - [x] Show character counter
  - [x] Disable submit when invalid
  - [x] Show validation messages

- [x] Task 10: Test refinement flow end-to-end
  - [x] Test successful refinement with version creation
  - [x] Test error handling and retry
  - [x] Test validation rules
  - [x] Test UI updates and loading states
  - [x] Verify RLS policies allow version creation

## Dev Notes

### Architecture Patterns (MANDATORY)

**Component Location:**
```
src/features/prototypes/
├── components/
│   ├── PrototypeViewer.tsx     (EXISTING - will be modified)
│   ├── RefinementChat.tsx      (THIS STORY - NEW)
│   ├── RefinementHistoryItem.tsx (THIS STORY - NEW)
│   └── index.ts
├── hooks/
│   ├── useRefinePrototype.ts   (THIS STORY - NEW)
│   └── index.ts
└── services/
    └── (uses existing openLovableService)
```

**Edge Function Extension:**
```
supabase/functions/prototype-generate/
└── index.ts  (THIS STORY - EXTEND with refinement endpoint)
```

### Open-Lovable Refinement Integration

**Refinement Prompt Pattern:**

The refinement prompt must include:
1. **Original PRD context** - What the prototype is for
2. **Current prototype code** - The existing implementation
3. **User's refinement request** - What to change
4. **PassportCard theme enforcement** - Maintain branding

```typescript
function buildRefinementPrompt(
  originalPrdContent: PrdContent,
  currentCode: string,
  refinementRequest: string
): string {
  return `
${PASSPORTCARD_THEME_PROMPT}

You are refining an existing React prototype. The user wants to make changes.

## Original PRD Context
${originalPrdContent.problemStatement}
${originalPrdContent.userStories}

## Current Prototype Code
${currentCode}

## User's Refinement Request
${refinementRequest}

CRITICAL REQUIREMENTS:
1. Make ONLY the changes requested by the user
2. Maintain ALL PassportCard branding (#E10514 red, 20px radius, Montserrat/Rubik fonts)
3. Keep all existing functionality unless explicitly asked to change
4. Ensure the refined prototype is fully functional
5. Maintain responsive design

Generate the complete refined React code.
`;
}
```

### Edge Function Refinement Endpoint

**Extend `supabase/functions/prototype-generate/index.ts`:**

```typescript
// Add to existing prototype-generate Edge Function

interface RefineRequest {
  prototypeId: string;
  refinementPrompt: string;
}

interface RefineResponse {
  newPrototypeId: string;
  status: 'generating' | 'ready' | 'failed';
  version: number;
}

// Add refinement handler
async function handleRefinement(
  supabase: any,
  user: any,
  body: RefineRequest
): Promise<Response> {
  // Get current prototype
  const { data: currentPrototype, error: fetchError } = await supabase
    .from('prototypes')
    .select('*, prd_documents!inner(*)')
    .eq('id', body.prototypeId)
    .single();

  if (fetchError || !currentPrototype) {
    return new Response(
      JSON.stringify({ 
        error: 'Prototype not found', 
        code: 'NOT_FOUND' 
      } as ErrorResponse),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify ownership
  if (currentPrototype.user_id !== user.id) {
    return new Response(
      JSON.stringify({ 
        error: 'Not authorized', 
        code: 'AUTH_ERROR' 
      } as ErrorResponse),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get current max version for this PRD
  const { data: maxVersionData } = await supabase
    .from('prototypes')
    .select('version')
    .eq('prd_id', currentPrototype.prd_id)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = maxVersionData ? maxVersionData.version + 1 : 1;

  // Create new prototype version with 'generating' status
  const { data: newPrototype, error: createError } = await supabase
    .from('prototypes')
    .insert({
      prd_id: currentPrototype.prd_id,
      idea_id: currentPrototype.idea_id,
      user_id: user.id,
      status: 'generating',
      version: nextVersion,
      refinement_prompt: body.refinementPrompt,
    })
    .select()
    .single();

  if (createError) {
    console.error('Failed to create refinement version:', createError);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create refinement version', 
        code: 'DB_ERROR' 
      } as ErrorResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Start refinement generation in background
  refinePrototypeAsync(
    supabase,
    newPrototype.id,
    currentPrototype.prd_documents.content,
    currentPrototype.code,
    body.refinementPrompt
  );

  const response: RefineResponse = {
    newPrototypeId: newPrototype.id,
    status: 'generating',
    version: nextVersion,
  };

  return new Response(
    JSON.stringify(response),
    { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Background refinement task
 */
async function refinePrototypeAsync(
  supabase: any,
  prototypeId: string,
  prdContent: any,
  currentCode: string,
  refinementPrompt: string
) {
  try {
    const prompt = buildRefinementPrompt(prdContent, currentCode, refinementPrompt);

    // Generate with retry logic
    const result = await withRetry(() => 
      generateWithOpenLovable({ prompt, isRefinement: true })
    );

    // Update prototype with success
    await supabase
      .from('prototypes')
      .update({
        code: result.code,
        url: result.url,
        status: 'ready',
      })
      .eq('id', prototypeId);

    console.log(`Prototype ${prototypeId} refined successfully`);

  } catch (error) {
    console.error(`Prototype ${prototypeId} refinement failed:`, error);

    // Update prototype with failure
    await supabase
      .from('prototypes')
      .update({
        status: 'failed',
      })
      .eq('id', prototypeId);
  }
}

// Modify serve() handler to support refinement
serve(async (req: Request) => {
  // ... existing CORS and auth checks ...

  const body = await req.json();

  // Check if this is a refinement request
  if (body.prototypeId && body.refinementPrompt) {
    return handleRefinement(supabase, user, body as RefineRequest);
  }

  // Otherwise, handle as initial generation (existing code)
  // ... existing generation logic ...
});
```

### Frontend Service Extension

**Extend `src/services/openLovableService.ts`:**

```typescript
// Add to existing openLovableService

export const openLovableService = {
  // ... existing generate() and pollStatus() methods ...

  /**
   * Refine an existing prototype
   * Returns immediately with new prototype ID for polling
   *
   * @param prototypeId - The current prototype ID
   * @param refinementPrompt - User's refinement request
   * @returns New prototype ID and initial status
   */
  async refine(
    prototypeId: string,
    refinementPrompt: string
  ): Promise<ServiceResponse<GeneratePrototypeResponse>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
        };
      }

      const response = await supabase.functions.invoke('prototype-generate', {
        body: { prototypeId, refinementPrompt },
      });

      if (response.error) {
        console.error('Prototype refinement error:', response.error);
        return {
          data: null,
          error: {
            message: response.error.message || 'Failed to start refinement',
            code: 'API_ERROR',
          },
        };
      }

      return { data: response.data, error: null };
    } catch (error) {
      console.error('Refine prototype error:', error);
      return {
        data: null,
        error: { message: 'Failed to refine prototype', code: 'UNKNOWN_ERROR' },
      };
    }
  },
};
```

### React Query Hook for Refinement

```typescript
// src/features/prototypes/hooks/useRefinePrototype.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { openLovableService } from '../../../services/openLovableService';
import { prototypeKeys } from './usePrototype';

interface RefinePrototypeInput {
  prototypeId: string;
  refinementPrompt: string;
}

export function useRefinePrototype() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prototypeId, refinementPrompt }: RefinePrototypeInput) => {
      // Start refinement
      const refineResult = await openLovableService.refine(prototypeId, refinementPrompt);
      if (refineResult.error) throw new Error(refineResult.error.message);

      const newPrototypeId = refineResult.data!.prototypeId;

      // Poll for completion
      const pollResult = await openLovableService.pollStatus(newPrototypeId);
      if (pollResult.error) throw new Error(pollResult.error.message);

      if (pollResult.data!.status === 'failed') {
        throw new Error('Refinement failed. Please try again.');
      }

      return {
        prototypeId: newPrototypeId,
        status: pollResult.data!.status,
        url: pollResult.data!.url,
        code: pollResult.data!.code,
      };
    },
    onSuccess: (data, variables) => {
      // Get PRD ID from current prototype to invalidate queries
      queryClient.invalidateQueries({ queryKey: prototypeKeys.detail(variables.prototypeId) });
      queryClient.invalidateQueries({ queryKey: prototypeKeys.all });
    },
  });
}
```

### RefinementChat Component

```typescript
// src/features/prototypes/components/RefinementChat.tsx

import { useState } from 'react';
import { useRefinePrototype } from '../hooks/useRefinePrototype';

interface RefinementChatProps {
  prototypeId: string;
  onRefinementComplete: (newPrototypeId: string) => void;
}

export function RefinementChat({ prototypeId, onRefinementComplete }: RefinementChatProps) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const refineMutation = useRefinePrototype();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (prompt.trim().length < 10) {
      setError('Please provide more detail (at least 10 characters)');
      return;
    }

    if (prompt.trim().length > 500) {
      setError('Refinement request too long (max 500 characters)');
      return;
    }

    try {
      const result = await refineMutation.mutateAsync({
        prototypeId,
        refinementPrompt: prompt.trim(),
      });

      // Success - notify parent component
      onRefinementComplete(result.prototypeId);
      setPrompt(''); // Clear input
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refinement failed. Please try again.');
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit(new Event('submit') as any);
  };

  const isLoading = refineMutation.isPending;
  const charCount = prompt.length;
  const isValid = charCount >= 10 && charCount <= 500;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title text-lg">Refine Your Prototype</h3>
        <p className="text-sm text-base-content/70">
          Describe what you'd like to change (e.g., "Make the header larger" or "Add a sidebar")
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <textarea
              className="textarea textarea-bordered h-24 resize-none"
              placeholder="Describe your refinement..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              maxLength={500}
            />
            <label className="label">
              <span className={`label-text-alt ${!isValid && charCount > 0 ? 'text-error' : ''}`}>
                {charCount < 10 ? `${10 - charCount} more characters needed` : `${charCount}/500`}
              </span>
            </label>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <button type="button" className="btn btn-sm btn-ghost" onClick={handleRetry}>
                Retry
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Refining Prototype...
              </>
            ) : (
              'Refine Prototype'
            )}
          </button>
        </form>

        {isLoading && (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Generating refined prototype... This may take up to 10 seconds.</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

### RefinementHistoryItem Component

```typescript
// src/features/prototypes/components/RefinementHistoryItem.tsx

import { Prototype } from '../types';

interface RefinementHistoryItemProps {
  prototype: Prototype;
  isActive: boolean;
  onClick: () => void;
}

export function RefinementHistoryItem({ prototype, isActive, onClick }: RefinementHistoryItemProps) {
  const formattedDate = new Date(prototype.createdAt).toLocaleString();

  return (
    <div
      className={`card bg-base-100 border-2 cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'border-primary' : 'border-base-300'
      }`}
      onClick={onClick}
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-sm">v{prototype.version}</span>
              {isActive && <span className="badge badge-success badge-sm">Current</span>}
            </div>
            {prototype.refinementPrompt ? (
              <p className="text-sm mt-2 text-base-content/80">
                "{prototype.refinementPrompt}"
              </p>
            ) : (
              <p className="text-sm mt-2 text-base-content/60 italic">
                Initial prototype
              </p>
            )}
          </div>
        </div>
        <div className="text-xs text-base-content/50 mt-2">
          {formattedDate}
        </div>
      </div>
    </div>
  );
}
```

### Integration into PrototypeViewer

**Modify existing `src/features/prototypes/components/PrototypeViewer.tsx`:**

```typescript
// Add to existing PrototypeViewer component

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLatestPrototype, useVersionHistory } from '../hooks/usePrototype';
import { RefinementChat } from './RefinementChat';
import { RefinementHistoryItem } from './RefinementHistoryItem';

export function PrototypeViewer() {
  const { prdId } = useParams<{ prdId: string }>();
  const [activePrototypeId, setActivePrototypeId] = useState<string | null>(null);

  const { data: latestPrototype, isLoading } = useLatestPrototype(prdId!);
  const { data: versionHistory } = useVersionHistory(prdId!);

  // Set active prototype to latest on load
  const currentPrototype = activePrototypeId
    ? versionHistory?.find(p => p.id === activePrototypeId)
    : latestPrototype;

  const handleRefinementComplete = (newPrototypeId: string) => {
    setActivePrototypeId(newPrototypeId);
    // Queries will auto-invalidate and refetch
  };

  if (isLoading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (!currentPrototype) {
    return <div className="alert alert-error">Prototype not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prototype Preview - 2 columns on desktop */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                Prototype Preview
                <span className="badge badge-primary">v{currentPrototype.version}</span>
              </h2>
              
              {/* Prototype iframe or preview */}
              <div className="aspect-video bg-base-200 rounded-lg overflow-hidden">
                {currentPrototype.url ? (
                  <iframe
                    src={currentPrototype.url}
                    className="w-full h-full"
                    title="Prototype Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-base-content/50">Preview not available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Refinement Chat & History - 1 column on desktop */}
        <div className="space-y-6">
          {/* Refinement Chat */}
          <RefinementChat
            prototypeId={currentPrototype.id}
            onRefinementComplete={handleRefinementComplete}
          />

          {/* Version History */}
          {versionHistory && versionHistory.length > 1 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">Version History</h3>
                <div className="space-y-2">
                  {versionHistory.map((prototype) => (
                    <RefinementHistoryItem
                      key={prototype.id}
                      prototype={prototype}
                      isActive={prototype.id === currentPrototype.id}
                      onClick={() => setActivePrototypeId(prototype.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Barrel Export Updates

**Update `src/features/prototypes/components/index.ts`:**
```typescript
export { PrototypeViewer } from './PrototypeViewer';
export { RefinementChat } from './RefinementChat';
export { RefinementHistoryItem } from './RefinementHistoryItem';
```

**Update `src/features/prototypes/hooks/index.ts`:**
```typescript
export * from './usePrototype';
export * from './usePrototypes';
export * from './useCreatePrototype';
export { useRefinePrototype } from './useRefinePrototype';
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Component files | `PascalCase.tsx` | `RefinementChat.tsx` |
| Hook files | `camelCase.ts` | `useRefinePrototype.ts` |
| Interface names | `PascalCase` | `RefinePrototypeInput` |
| CSS classes | DaisyUI pattern | `card`, `btn-primary` |
| State variables | `camelCase` | `activePrototypeId`, `isLoading` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleRetry` |

### Anti-Patterns to AVOID

1. **DO NOT** call Edge Function directly from components - use openLovableService
2. **DO NOT** skip version creation - every refinement MUST create a new version
3. **DO NOT** show raw API errors - transform to user-friendly messages
4. **DO NOT** forget to disable input during refinement
5. **DO NOT** skip character validation - prevent empty or excessive prompts
6. **DO NOT** lose refinement prompt on error - preserve for retry
7. **DO NOT** forget to invalidate queries after refinement
8. **DO NOT** block UI thread during polling - use async/await properly
9. **DO NOT** skip loading indicators - users need feedback
10. **DO NOT** forget PassportCard theme enforcement in refinement prompt

### Performance Requirements (NFR-P4)

- Refinement MUST complete within 10 seconds (per AC)
- If taking longer, loading indicator MUST be visible
- Input should never feel laggy (immediate response to typing)
- Prototype preview updates MUST be smooth

### UX Design Requirements (from UX Spec)

1. **Conversational feel** - Refinement feels like chatting with a designer
2. **Visual feedback** - Clear loading states during generation
3. **Error recovery** - Clear retry option when things fail
4. **Persistence** - Version history preserved
5. **Responsive** - Works on mobile (chat stacks vertically on small screens)
6. **Immediate results** - Prototype updates in place when ready

### Dependencies on Previous Stories

- **Story 4.1 (Prototypes Table):** prototypes table with version column and refinement_prompt
- **Story 4.2 (Open-Lovable Edge Function):** prototype-generate Edge Function exists
- **Story 4.3 (Trigger Generation):** Initial prototype generation working
- **Story 4.4 (Prototype Viewer):** PrototypeViewer component exists to extend

### Dependencies for Future Stories

- **Story 4.6 (Refinement History):** Will use version history display from this story
- **Story 4.7 (Shareable URLs):** Will need to support sharing specific versions

### Data Flow

```
User types refinement request in RefinementChat
  → handleSubmit() validates input
    → useRefinePrototype() mutation called
      → openLovableService.refine() invoked
        → Edge Function creates new prototype version (status: 'generating')
          → Background task calls Open-Lovable with refinement prompt
            → Open-Lovable generates refined code
              → Edge Function updates prototype (status: 'ready')
                → pollStatus() detects completion
                  → React Query invalidates cache
                    → PrototypeViewer re-renders with new version
                      → User sees refined prototype
```

### Error Scenarios and Handling

| Scenario | User Experience | Technical Handling |
|----------|----------------|-------------------|
| Empty prompt | Validation error before submit | Check length >= 10 chars |
| Prompt too long | Validation error before submit | Check length <= 500 chars |
| Not authenticated | Redirect to login | Edge Function returns 401 |
| Prototype not found | Error message | Edge Function returns 404 |
| Open-Lovable timeout | Error with retry button | Timeout after 10 seconds |
| Open-Lovable API error | Error with retry button | Retry logic in Edge Function |
| Network error | Error with retry button | Catch in service layer |
| Generation failed | Error with retry button | Prototype status = 'failed' |

### Testing Considerations

**Unit Tests:**
- Test useRefinePrototype hook with mocked service
- Test RefinementChat component validation
- Test RefinementHistoryItem rendering
- Test error handling and retry logic

**Integration Tests:**
- Test full refinement flow from input to completion
- Test version creation and history display
- Test Edge Function with sample refinement requests
- Test RLS policies allow version creation

**E2E Tests:**
- User submits refinement request
- Loading indicator appears
- New version appears in history
- Prototype preview updates
- Error handling and retry work

### Security Considerations

1. **Authentication:** Every refinement request must have valid JWT token
2. **Authorization:** User can only refine their own prototypes
3. **Input Sanitization:** Validate and sanitize refinement prompts
4. **Rate Limiting:** Consider adding rate limits to prevent abuse (future enhancement)
5. **Version Integrity:** Ensure version numbers increment correctly

### Performance Considerations

- 10-second timeout prevents hung requests
- Async generation with polling provides responsive UX
- React Query caching reduces redundant database calls
- Optimistic UI updates improve perceived performance

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Open-Lovable Integration]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Conversational Interface]
- [Source: _bmad-output/implementation-artifacts/4-1-create-prototypes-database-table-and-service-layer.md]
- [Source: _bmad-output/implementation-artifacts/4-2-open-lovable-edge-function-for-prototype-generation.md]
- [Source: _bmad-output/implementation-artifacts/3-4-chat-interface-with-ai-assistant.md] (Pattern reference)
- [Source: src/services/openLovableService.ts] (Service layer pattern)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-20250514

### Debug Log References

No debug issues encountered during implementation.

### Completion Notes List

✅ **Task 1-3 Complete:** Backend refinement infrastructure implemented
- Extended Edge Function to handle refinement requests with version creation
- Added openLovableService.refine() method with polling support
- Created useRefinePrototype React Query hook with query invalidation

✅ **Task 4-7 Complete:** Frontend refinement UI implemented
- Created RefinementChat component with validation (10-500 chars) and error handling
- Integrated refinement chat into PrototypeViewerPage with responsive 3-column grid
- Created RefinementHistoryItem component showing version timeline
- Implemented optimistic UI updates with loading states and disabled inputs

✅ **Task 8-9 Complete:** Error handling and validation
- Comprehensive error handling for timeouts, API errors, and network issues
- Retry functionality that preserves user input
- Character counter with validation feedback
- Submit button disabled when input invalid

✅ **Task 10 Complete:** Testing
- useRefinePrototype: 5/5 tests passing
- RefinementChat: 10/10 tests passing
- RefinementHistoryItem: 11/11 tests passing
- PrototypeViewerPage: 12/12 tests passing
- All acceptance criteria covered by tests

**Technical Decisions:**
- Used character counter for validation feedback instead of error alerts for better UX
- Implemented version history display conditionally (only shows when > 1 version exists)
- Edge Function uses async background processing to avoid request timeouts
- Refinement prompt stored in database for history tracking

### File List

**Modified Files:**
- supabase/functions/prototype-generate/index.ts
- src/services/openLovableService.ts
- src/pages/PrototypeViewerPage.tsx
- src/pages/PrototypeViewerPage.test.tsx
- src/features/prototypes/hooks/index.ts
- src/features/prototypes/components/index.ts

**New Files:**
- src/features/prototypes/hooks/useRefinePrototype.ts
- src/features/prototypes/hooks/useRefinePrototype.test.tsx
- src/features/prototypes/components/RefinementChat.tsx
- src/features/prototypes/components/RefinementChat.test.tsx
- src/features/prototypes/components/RefinementHistoryItem.tsx
- src/features/prototypes/components/RefinementHistoryItem.test.tsx

## Change Log

- **2026-01-26**: Story implementation complete - All tasks finished, tests passing, ready for code review
