# Story 4.6: Prototype Refinement History

Status: ready-for-dev

## Story

As a **user**,
I want **to see the history of my prototype refinements**,
So that **I can go back to previous versions if needed**.

## Acceptance Criteria

1. **Given** I have made refinements to my prototype **When** I view the refinement history **Then** I see a list of all versions with timestamps **And** each version shows the refinement prompt that created it **And** I can click on any version to preview it **And** I can set any previous version as the "current" version

2. **Given** I select a previous version **When** I click "Restore this version" **Then** that version becomes the active prototype **And** a new version entry is created (so history is preserved)

3. **Given** I have only the initial prototype (no refinements) **Then** I see a single version entry labeled "Initial prototype"

4. **Given** I am viewing a specific version **Then** I can clearly see which version is active **And** I can navigate between versions without page reload

5. **Given** I restore a previous version **Then** I see a success message **And** the prototype preview updates immediately **And** a new version appears at the top of the history

6. **Given** restoration fails **Then** I see a clear error message with retry option **And** the current active version remains unchanged

## Tasks / Subtasks

- [ ] Task 1: Create database query for version history (AC: 1)
  - [ ] Add `getVersionHistory()` method to prototypeService
  - [ ] Query all prototype versions for a given PRD, ordered by version DESC
  - [ ] Include refinement_prompt, created_at, version, status, url
  - [ ] Test with RLS policies to ensure proper access control
  - [ ] Return empty array for PRDs with no prototypes

- [ ] Task 2: Create useVersionHistory React Query hook (AC: 1)
  - [ ] Create `src/features/prototypes/hooks/useVersionHistory.ts`
  - [ ] Accept prdId as parameter
  - [ ] Fetch version history using prototypeService
  - [ ] Enable refetch on window focus
  - [ ] Cache with appropriate staleTime (5 minutes)

- [ ] Task 3: Create version restoration Edge Function endpoint (AC: 2, 5)
  - [ ] Extend `supabase/functions/prototype-generate/index.ts`
  - [ ] Add restoration endpoint accepting prototypeId to restore
  - [ ] Verify ownership (user can only restore their own prototypes)
  - [ ] Get current max version number
  - [ ] Create new prototype version copying code/url from selected version
  - [ ] Set refinement_prompt to "Restored from v{version}"
  - [ ] Return new prototype ID

- [ ] Task 4: Extend prototypeService for restoration (AC: 2, 5, 6)
  - [ ] Add `restore()` method to prototypeService
  - [ ] Accept prototypeId to restore
  - [ ] Call prototype-generate Edge Function with restoration flag
  - [ ] Return new prototype data
  - [ ] Handle errors gracefully

- [ ] Task 5: Create useRestoreVersion React Query hook (AC: 2, 5, 6)
  - [ ] Create `src/features/prototypes/hooks/useRestoreVersion.ts`
  - [ ] Implement mutation with prototypeService.restore()
  - [ ] Handle loading, success, and error states
  - [ ] Invalidate version history queries on success
  - [ ] Update cache with new version

- [ ] Task 6: Create VersionHistoryPanel component (AC: 1, 3, 4)
  - [ ] Create `src/features/prototypes/components/VersionHistoryPanel.tsx`
  - [ ] Display all versions with RefinementHistoryItem components (from Story 4.5)
  - [ ] Show timestamps in localized format
  - [ ] Show version numbers with badges
  - [ ] Highlight current active version
  - [ ] Handle empty state (no versions)
  - [ ] Show "Initial prototype" label for version 1 with no refinement_prompt

- [ ] Task 7: Add version preview functionality (AC: 1, 4)
  - [ ] Modify PrototypeViewer to accept activeVersionId state
  - [ ] Allow clicking on version history items to change active version
  - [ ] Update iframe URL when version changes
  - [ ] Show version badge on prototype preview
  - [ ] Smooth transition between version previews

- [ ] Task 8: Add restore button and confirmation (AC: 2, 5)
  - [ ] Add "Restore this version" button to each version history item
  - [ ] Only show button for non-active versions
  - [ ] Show confirmation modal before restoring
  - [ ] Display "This will create a new version copying v{X}"
  - [ ] Implement confirmation flow
  - [ ] Call useRestoreVersion mutation on confirm

- [ ] Task 9: Implement optimistic UI updates (AC: 5)
  - [ ] Show "Restoring..." indicator during restoration
  - [ ] Disable restore buttons during mutation
  - [ ] Update version history immediately when restoration completes
  - [ ] Scroll to newly created version
  - [ ] Update active version indicator

- [ ] Task 10: Implement error handling (AC: 6)
  - [ ] Handle "prototype not found" errors
  - [ ] Handle "unauthorized" errors
  - [ ] Handle database errors
  - [ ] Display error messages with retry button
  - [ ] Keep UI stable (don't lose active version on error)
  - [ ] Log errors for debugging

- [ ] Task 11: Add version comparison indicators (AC: 4)
  - [ ] Show version numbers clearly (v1, v2, v3)
  - [ ] Show "Current" badge on active version
  - [ ] Show relative timestamps ("2 hours ago", "3 days ago")
  - [ ] Show refinement prompt preview (truncated if long)
  - [ ] Add visual separation between versions

- [ ] Task 12: Test version history flow end-to-end
  - [ ] Test history display with multiple versions
  - [ ] Test version preview switching
  - [ ] Test version restoration and new version creation
  - [ ] Test error handling and retry
  - [ ] Test UI updates and loading states
  - [ ] Verify RLS policies allow restoration
  - [ ] Test edge cases (restoring initial version, restoring to same version)

## Dev Notes

### Architecture Patterns (MANDATORY)

**Component Location:**
```
src/features/prototypes/
├── components/
│   ├── PrototypeViewer.tsx          (EXISTING - will be modified)
│   ├── RefinementHistoryItem.tsx    (EXISTING from Story 4.5)
│   ├── VersionHistoryPanel.tsx      (THIS STORY - NEW)
│   └── index.ts
├── hooks/
│   ├── useVersionHistory.ts         (THIS STORY - NEW)
│   ├── useRestoreVersion.ts         (THIS STORY - NEW)
│   ├── useRefinePrototype.ts        (EXISTING from Story 4.5)
│   └── index.ts
├── services/
│   └── prototypeService.ts          (THIS STORY - EXTEND)
└── types.ts
```

**Edge Function Extension:**
```
supabase/functions/prototype-generate/
└── index.ts  (THIS STORY - EXTEND with restoration endpoint)
```

### Database Schema Context

**Prototypes Table (from Story 4.1):**
```sql
CREATE TABLE prototypes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prd_id UUID NOT NULL REFERENCES prd_documents(id),
  idea_id UUID NOT NULL REFERENCES ideas(id),
  user_id UUID NOT NULL REFERENCES users(id),
  url TEXT,
  code TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  refinement_prompt TEXT,
  status TEXT NOT NULL CHECK (status IN ('generating', 'ready', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prd_id, version)
);
```

**Key Fields for This Story:**
- `version` - Sequential version number per PRD
- `refinement_prompt` - What refinement created this version (NULL for initial)
- `code` - Full React code to restore from
- `url` - Prototype preview URL
- `created_at` - When this version was created

### Version History Service Layer

**Extend `src/services/prototypeService.ts`:**

```typescript
// Add to existing prototypeService

export const prototypeService = {
  // ... existing methods (generate, pollStatus, refine) ...

  /**
   * Get version history for a PRD
   * Returns all prototype versions ordered by version DESC (newest first)
   *
   * @param prdId - The PRD ID to get versions for
   * @returns Array of prototype versions
   */
  async getVersionHistory(prdId: string): Promise<ServiceResponse<Prototype[]>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
        };
      }

      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('prd_id', prdId)
        .order('version', { ascending: false });

      if (error) {
        console.error('Get version history error:', error);
        return {
          data: null,
          error: { 
            message: 'Failed to load version history', 
            code: 'DB_ERROR' 
          },
        };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get version history error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to load version history', 
          code: 'UNKNOWN_ERROR' 
        },
      };
    }
  },

  /**
   * Restore a previous prototype version
   * Creates a new version copying the code/url from the selected version
   *
   * @param prototypeId - The prototype version ID to restore
   * @returns New prototype data
   */
  async restore(prototypeId: string): Promise<ServiceResponse<Prototype>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
        };
      }

      const response = await supabase.functions.invoke('prototype-generate', {
        body: { restoreFromId: prototypeId },
      });

      if (response.error) {
        console.error('Prototype restoration error:', response.error);
        return {
          data: null,
          error: {
            message: response.error.message || 'Failed to restore version',
            code: 'API_ERROR',
          },
        };
      }

      return { data: response.data, error: null };
    } catch (error) {
      console.error('Restore prototype error:', error);
      return {
        data: null,
        error: { 
          message: 'Failed to restore version', 
          code: 'UNKNOWN_ERROR' 
        },
      };
    }
  },
};
```

### Edge Function Restoration Endpoint

**Extend `supabase/functions/prototype-generate/index.ts`:**

```typescript
// Add to existing prototype-generate Edge Function

interface RestoreRequest {
  restoreFromId: string;
}

interface RestoreResponse {
  id: string;
  version: number;
  status: 'ready';
  url: string;
  code: string;
}

/**
 * Handle version restoration
 * Creates a new version copying code/url from selected version
 */
async function handleRestoration(
  supabase: any,
  user: any,
  body: RestoreRequest
): Promise<Response> {
  // Get the prototype to restore from
  const { data: sourcePrototype, error: fetchError } = await supabase
    .from('prototypes')
    .select('*, prd_documents!inner(*)')
    .eq('id', body.restoreFromId)
    .eq('status', 'ready')  // Only restore from successful versions
    .single();

  if (fetchError || !sourcePrototype) {
    return new Response(
      JSON.stringify({ 
        error: 'Prototype version not found', 
        code: 'NOT_FOUND' 
      } as ErrorResponse),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify ownership
  if (sourcePrototype.user_id !== user.id) {
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
    .eq('prd_id', sourcePrototype.prd_id)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = maxVersionData ? maxVersionData.version + 1 : 1;

  // Create new prototype version copying from source
  const { data: newPrototype, error: createError } = await supabase
    .from('prototypes')
    .insert({
      prd_id: sourcePrototype.prd_id,
      idea_id: sourcePrototype.idea_id,
      user_id: user.id,
      code: sourcePrototype.code,
      url: sourcePrototype.url,
      status: 'ready',
      version: nextVersion,
      refinement_prompt: `Restored from v${sourcePrototype.version}`,
    })
    .select()
    .single();

  if (createError) {
    console.error('Failed to create restored version:', createError);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create restored version', 
        code: 'DB_ERROR' 
      } as ErrorResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const response: RestoreResponse = {
    id: newPrototype.id,
    version: nextVersion,
    status: 'ready',
    url: newPrototype.url,
    code: newPrototype.code,
  };

  return new Response(
    JSON.stringify(response),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Modify serve() handler to support restoration
serve(async (req: Request) => {
  // ... existing CORS and auth checks ...

  const body = await req.json();

  // Check if this is a restoration request
  if (body.restoreFromId) {
    return handleRestoration(supabase, user, body as RestoreRequest);
  }

  // Check if this is a refinement request (from Story 4.5)
  if (body.prototypeId && body.refinementPrompt) {
    return handleRefinement(supabase, user, body as RefineRequest);
  }

  // Otherwise, handle as initial generation (existing code)
  // ... existing generation logic ...
});
```

### React Query Hooks

**Create `src/features/prototypes/hooks/useVersionHistory.ts`:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { prototypeService } from '../../../services/prototypeService';

export const prototypeKeys = {
  all: ['prototypes'] as const,
  history: (prdId: string) => ['prototypes', 'history', prdId] as const,
  detail: (id: string) => ['prototypes', 'detail', id] as const,
};

/**
 * Hook to fetch version history for a PRD
 * Returns all prototype versions ordered by version DESC
 *
 * @param prdId - The PRD ID to get versions for
 * @returns React Query result with version history
 */
export function useVersionHistory(prdId: string) {
  return useQuery({
    queryKey: prototypeKeys.history(prdId),
    queryFn: async () => {
      const result = await prototypeService.getVersionHistory(prdId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
```

**Create `src/features/prototypes/hooks/useRestoreVersion.ts`:**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prototypeService } from '../../../services/prototypeService';
import { prototypeKeys } from './useVersionHistory';

interface RestoreVersionInput {
  prototypeId: string;
  prdId: string;
}

/**
 * Hook to restore a previous prototype version
 * Creates a new version copying code/url from selected version
 *
 * @returns React Query mutation for version restoration
 */
export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prototypeId }: RestoreVersionInput) => {
      const result = await prototypeService.restore(prototypeId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data, variables) => {
      // Invalidate version history to refetch
      queryClient.invalidateQueries({ 
        queryKey: prototypeKeys.history(variables.prdId) 
      });
      
      // Invalidate all prototypes list
      queryClient.invalidateQueries({ 
        queryKey: prototypeKeys.all 
      });
    },
  });
}
```

### VersionHistoryPanel Component

**Create `src/features/prototypes/components/VersionHistoryPanel.tsx`:**

```typescript
import { useState } from 'react';
import { RefinementHistoryItem } from './RefinementHistoryItem';
import { useVersionHistory } from '../hooks/useVersionHistory';
import { useRestoreVersion } from '../hooks/useRestoreVersion';
import { Prototype } from '../types';

interface VersionHistoryPanelProps {
  prdId: string;
  activeVersionId: string | null;
  onVersionSelect: (prototypeId: string) => void;
}

export function VersionHistoryPanel({ 
  prdId, 
  activeVersionId, 
  onVersionSelect 
}: VersionHistoryPanelProps) {
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const { data: versions, isLoading } = useVersionHistory(prdId);
  const restoreMutation = useRestoreVersion();

  const handleRestore = async (prototypeId: string) => {
    try {
      const result = await restoreMutation.mutateAsync({ 
        prototypeId, 
        prdId 
      });
      
      // Select the newly created version
      onVersionSelect(result.id);
      
      // Close confirmation modal
      setRestoreConfirmId(null);
    } catch (error) {
      // Error is handled by mutation error state
      console.error('Restoration failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        </div>
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-lg">Version History</h3>
          <p className="text-sm text-base-content/70">
            No versions available yet.
          </p>
        </div>
      </div>
    );
  }

  const versionToRestore = versions.find(v => v.id === restoreConfirmId);

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-lg">Version History</h3>
          <p className="text-sm text-base-content/70 mb-2">
            {versions.length} {versions.length === 1 ? 'version' : 'versions'}
          </p>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {versions.map((prototype) => (
              <div key={prototype.id} className="relative">
                <RefinementHistoryItem
                  prototype={prototype}
                  isActive={prototype.id === activeVersionId}
                  onClick={() => onVersionSelect(prototype.id)}
                />
                
                {/* Restore button - only show for non-active versions */}
                {prototype.id !== activeVersionId && (
                  <button
                    className="btn btn-sm btn-ghost absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRestoreConfirmId(prototype.id);
                    }}
                    disabled={restoreMutation.isPending}
                  >
                    Restore
                  </button>
                )}
              </div>
            ))}
          </div>

          {restoreMutation.isError && (
            <div className="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Failed to restore version. Please try again.</span>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => restoreMutation.reset()}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {restoreConfirmId && versionToRestore && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Restore Version {versionToRestore.version}?</h3>
            <p className="py-4">
              This will create a new version (v{(versions[0]?.version || 0) + 1}) copying the code from version {versionToRestore.version}.
            </p>
            <p className="text-sm text-base-content/70">
              Your current version will be preserved in history. This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setRestoreConfirmId(null)}
                disabled={restoreMutation.isPending}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleRestore(restoreConfirmId)}
                disabled={restoreMutation.isPending}
              >
                {restoreMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Restoring...
                  </>
                ) : (
                  'Restore Version'
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setRestoreConfirmId(null)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
}
```

### Integration into PrototypeViewer

**Modify existing `src/features/prototypes/components/PrototypeViewer.tsx`:**

```typescript
// Update PrototypeViewer to include VersionHistoryPanel

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVersionHistory } from '../hooks/useVersionHistory';
import { RefinementChat } from './RefinementChat';
import { VersionHistoryPanel } from './VersionHistoryPanel';

export function PrototypeViewer() {
  const { prdId } = useParams<{ prdId: string }>();
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  
  const { data: versions, isLoading } = useVersionHistory(prdId!);

  // Set active version to latest on initial load
  useEffect(() => {
    if (versions && versions.length > 0 && !activeVersionId) {
      setActiveVersionId(versions[0].id); // Latest version (DESC order)
    }
  }, [versions, activeVersionId]);

  const currentPrototype = versions?.find(v => v.id === activeVersionId);

  const handleRefinementComplete = (newPrototypeId: string) => {
    setActiveVersionId(newPrototypeId);
    // Queries will auto-invalidate and refetch
  };

  const handleVersionSelect = (versionId: string) => {
    setActiveVersionId(versionId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!currentPrototype) {
    return (
      <div className="container mx-auto p-6">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Prototype not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prototype Preview - 2 columns on desktop */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title">Prototype Preview</h2>
                <span className="badge badge-primary badge-lg">
                  v{currentPrototype.version}
                </span>
              </div>
              
              {/* Prototype iframe or preview */}
              <div className="aspect-video bg-base-200 rounded-lg overflow-hidden">
                {currentPrototype.url ? (
                  <iframe
                    key={currentPrototype.id} // Force re-render on version change
                    src={currentPrototype.url}
                    className="w-full h-full"
                    title={`Prototype Preview - Version ${currentPrototype.version}`}
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

          {/* Version History Panel */}
          <VersionHistoryPanel
            prdId={prdId!}
            activeVersionId={activeVersionId}
            onVersionSelect={handleVersionSelect}
          />
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
export { VersionHistoryPanel } from './VersionHistoryPanel';
```

**Update `src/features/prototypes/hooks/index.ts`:**
```typescript
export * from './usePrototype';
export * from './usePrototypes';
export * from './useCreatePrototype';
export { useRefinePrototype } from './useRefinePrototype';
export { useVersionHistory } from './useVersionHistory';
export { useRestoreVersion } from './useRestoreVersion';
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Component files | `PascalCase.tsx` | `VersionHistoryPanel.tsx` |
| Hook files | `camelCase.ts` | `useVersionHistory.ts`, `useRestoreVersion.ts` |
| Interface names | `PascalCase` | `RestoreVersionInput`, `VersionHistoryPanelProps` |
| CSS classes | DaisyUI pattern | `card`, `btn-primary`, `badge` |
| State variables | `camelCase` | `activeVersionId`, `restoreConfirmId` |
| Event handlers | `handle` prefix | `handleRestore`, `handleVersionSelect` |
| Query keys | Object with functions | `prototypeKeys.history(prdId)` |

### Anti-Patterns to AVOID

1. **DO NOT** call Edge Function directly from components - use prototypeService
2. **DO NOT** mutate version history - restoration creates NEW versions
3. **DO NOT** lose active version state on restoration error
4. **DO NOT** forget to invalidate queries after restoration
5. **DO NOT** skip confirmation modal - users need to understand restoration creates new version
6. **DO NOT** show raw version IDs - show human-readable version numbers
7. **DO NOT** forget empty state handling (no versions yet)
8. **DO NOT** allow restoring from failed versions - only restore from 'ready' status
9. **DO NOT** skip ownership verification in Edge Function
10. **DO NOT** forget to copy both code AND url when restoring

### Performance Requirements (NFR-P2, NFR-P4)

- Version history query should complete within 1 second
- Restoration should complete within 2 seconds (just database operations)
- Version switching should be instant (no refetch, just state change)
- List should handle 50+ versions without performance degradation
- Smooth scrolling in version history list

### UX Design Requirements (from UX Spec)

1. **Clear version indicators** - Version numbers, timestamps, "Current" badge
2. **Historical context** - Show refinement prompts for each version
3. **Undo confidence** - Users trust they can always go back
4. **Non-destructive** - Restoration creates new versions, preserving history
5. **Immediate preview** - Click version to see it, no reload
6. **Confirmation** - Clear explanation of what restoration does
7. **Responsive** - Works on mobile (version list scrolls vertically)

### Dependencies on Previous Stories

- **Story 4.1 (Prototypes Table):** prototypes table with version and refinement_prompt columns
- **Story 4.2 (Open-Lovable Edge Function):** prototype-generate Edge Function exists to extend
- **Story 4.3 (Trigger Generation):** Initial prototype generation working
- **Story 4.4 (Prototype Viewer):** PrototypeViewer component exists to extend
- **Story 4.5 (Refinement):** RefinementHistoryItem component exists, refinement creates versions

### Dependencies for Future Stories

- **Story 4.7 (Shareable URLs):** Will need to support sharing specific versions
- **Story 4.8 (Status Integration):** Will need to track which version is "current" for idea status

### Data Flow

```
User views PrototypeViewer
  → useVersionHistory() fetches all versions for PRD
    → prototypeService.getVersionHistory() queries database
      → Returns versions ordered by version DESC
        → VersionHistoryPanel displays versions
          → User clicks on version
            → activeVersionId state changes
              → PrototypeViewer re-renders with new version iframe
                
User clicks "Restore this version"
  → Confirmation modal opens
    → User confirms restoration
      → useRestoreVersion() mutation called
        → prototypeService.restore() invoked
          → Edge Function creates new version copying code/url
            → Database returns new version data
              → React Query invalidates version history
                → Version history refetches
                  → New version appears at top
                    → activeVersionId set to new version
                      → PrototypeViewer shows restored prototype
```

### Error Scenarios and Handling

| Scenario | User Experience | Technical Handling |
|----------|----------------|-------------------|
| No versions exist | Empty state message | Check versions.length === 0 |
| Version not found | Error message | Edge Function returns 404 |
| Not authenticated | Redirect to login | Edge Function returns 401 |
| Not authorized | Error message | Edge Function returns 403 |
| Database error | Error with retry | Catch in service layer |
| Restoration fails | Error with retry | Mutation error state |
| Source version failed | Can't restore | Only allow restore from status='ready' |

### Testing Considerations

**Unit Tests:**
- Test useVersionHistory hook with mocked service
- Test useRestoreVersion hook with mocked service
- Test VersionHistoryPanel rendering with various version counts
- Test restoration confirmation flow
- Test error handling and retry logic

**Integration Tests:**
- Test full version history display
- Test version switching (preview changes)
- Test version restoration end-to-end
- Test Edge Function with sample restoration requests
- Test RLS policies allow restoration

**E2E Tests:**
- User views version history
- User clicks on different versions (preview updates)
- User restores previous version
- Confirmation modal appears
- New version created and appears at top
- Active version indicator updates
- Error handling works

### Security Considerations

1. **Authentication:** Every version history request must have valid JWT token
2. **Authorization:** User can only view/restore their own prototypes
3. **Version Integrity:** Ensure version numbers don't skip or duplicate
4. **RLS Enforcement:** Database policies must restrict access to user's own data
5. **Input Validation:** Validate prototypeId exists and is accessible before restoration

### Performance Considerations

- Version history query is cached for 5 minutes
- Refetch on window focus ensures fresh data
- Version switching is instant (no API call, just state change)
- Restoration is fast (< 2s) - just database operations, no AI generation
- List handles 50+ versions with virtual scrolling if needed

### Accessibility Considerations

- Version history items are keyboard navigable
- Restoration confirmation modal traps focus
- Screen readers announce version numbers and status
- Clear visual indicators for current version
- Tooltips explain restoration behavior

### Mobile Responsiveness

- Version history panel stacks below prototype preview on mobile
- Version list scrolls vertically with touch-friendly items
- Confirmation modal adapts to small screens
- Touch targets meet 44px minimum size
- Restoration button accessible on mobile

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.6]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Version History]
- [Source: _bmad-output/implementation-artifacts/4-1-create-prototypes-database-table-and-service-layer.md]
- [Source: _bmad-output/implementation-artifacts/4-2-open-lovable-edge-function-for-prototype-generation.md]
- [Source: _bmad-output/implementation-artifacts/4-5-chat-based-prototype-refinement.md] (RefinementHistoryItem component)
- [Source: src/services/prototypeService.ts] (Service layer pattern)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
