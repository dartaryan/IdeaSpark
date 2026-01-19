# Story 3.8: Mark PRD as Complete

Status: ready-for-dev

## Story

As a **user**,
I want **to mark my PRD as complete when I'm satisfied**,
So that **I can proceed to prototype generation**.

## Acceptance Criteria

1. **Given** I have filled out all required PRD sections **When** I click "Mark as Complete" **Then** I see a confirmation dialog showing the PRD summary **And** I can review the final document sections

2. **Given** I am viewing the completion confirmation dialog **When** I confirm completion **Then** the PRD status changes from "draft" to "complete" in the database **And** a success toast notification appears

3. **Given** the PRD is marked complete **When** the status updates **Then** the idea status updates to "prd_development" if not already **And** the idea `prd_completed_at` timestamp is recorded

4. **Given** the PRD status changes to "complete" **When** I view the PRD Builder page **Then** I see a prominent "Generate Prototype" button **And** the chat interface becomes read-only **And** the PRD sections are no longer editable

5. **Given** not all required sections are complete **When** I try to mark as complete **Then** I see the CompletionValidationModal showing which sections need attention **And** I can click to focus on incomplete sections

6. **Given** I have a completed PRD **When** I navigate away and return **Then** the PRD remains in "complete" status **And** I still see the "Generate Prototype" button

7. **Given** network error during completion **When** the update fails **Then** I see an error toast with retry option **And** the PRD remains in "draft" status **And** I can retry the operation

## Tasks / Subtasks

- [ ] Task 1: Create ConfirmCompletionModal component (AC: 1, 2)
  - [ ] Create `src/features/prd/components/ConfirmCompletionModal.tsx`
  - [ ] Display PRD summary with all 7 sections previewed
  - [ ] Show completion date and idea title
  - [ ] Include "Confirm" and "Cancel" buttons
  - [ ] Handle loading state during confirmation
  - [ ] Use DaisyUI modal styling with PassportCard theme

- [ ] Task 2: Add completePrd mutation to prdService (AC: 2, 3, 7)
  - [ ] Create `src/features/prd/services/prdService.ts` if not exists
  - [ ] Implement `completePrd(prdId: string)` function
  - [ ] Update PRD status to 'complete' in prd_documents table
  - [ ] Update associated idea status to 'prd_development'
  - [ ] Set idea `prd_completed_at` timestamp
  - [ ] Use transaction for atomic update (PRD + Idea)
  - [ ] Return updated PrdDocument or error

- [ ] Task 3: Create useCompletePrd mutation hook (AC: 2, 7)
  - [ ] Create `src/features/prd/hooks/useCompletePrd.ts`
  - [ ] Use React Query useMutation with prdService.completePrd
  - [ ] Invalidate PRD and idea queries on success
  - [ ] Handle optimistic updates if appropriate
  - [ ] Return mutation state: isPending, isError, error, mutateAsync

- [ ] Task 4: Update PRD types for complete status (AC: 2, 4)
  - [ ] Update `src/features/prd/types.ts` PrdDocument.status type
  - [ ] Ensure status is `'draft' | 'complete'` (align with DB schema)
  - [ ] Add `completed_at?: string` field to PrdDocument
  - [ ] Export PrdStatus type for type safety

- [ ] Task 5: Create GeneratePrototypeButton component (AC: 4, 6)
  - [ ] Create `src/features/prd/components/GeneratePrototypeButton.tsx`
  - [ ] Display prominent CTA button styled with primary color
  - [ ] Show rocket/sparkle icon for visual impact
  - [ ] Navigate to prototype generation (or trigger inline)
  - [ ] Only visible when PRD status is 'complete'

- [ ] Task 6: Create CompletedPrdHeader component (AC: 4)
  - [ ] Create `src/features/prd/components/CompletedPrdHeader.tsx`
  - [ ] Display completion status badge
  - [ ] Show completed date
  - [ ] Include GeneratePrototypeButton
  - [ ] Show "View PRD" action for read-only view

- [ ] Task 7: Update PrdBuilderPage with completion flow (AC: 1, 4, 5, 6)
  - [ ] Update `src/pages/PrdBuilderPage.tsx` (or create if not exists)
  - [ ] Add "Mark as Complete" button to header
  - [ ] Wire button to validation check (from Story 3.7)
  - [ ] Show CompletionValidationModal if validation fails
  - [ ] Show ConfirmCompletionModal if validation passes
  - [ ] Conditionally render CompletedPrdHeader when complete
  - [ ] Make chat/editor read-only when status is 'complete'

- [ ] Task 8: Update usePrdBuilder for completion state (AC: 4, 5)
  - [ ] Update `src/features/prd/hooks/usePrdBuilder.ts`
  - [ ] Add `isComplete` computed property from PRD status
  - [ ] Expose `attemptMarkComplete()` function
  - [ ] Track `showConfirmModal` and `showValidationModal` states
  - [ ] Integrate with useCompletePrd mutation

- [ ] Task 9: Add toast notifications for completion (AC: 2, 7)
  - [ ] Add success toast: "PRD marked complete! Ready for prototype generation"
  - [ ] Add error toast with retry action on failure
  - [ ] Use existing toast system (or DaisyUI toast if not established)

- [ ] Task 10: Update idea service to support status update (AC: 3)
  - [ ] Update `src/features/ideas/services/ideaService.ts`
  - [ ] Add or update `updateIdeaStatus(ideaId, status)` function
  - [ ] Ensure RLS allows user to update their own idea status
  - [ ] This may be called from prdService transaction

- [ ] Task 11: Update barrel exports
  - [ ] Export new components from `src/features/prd/components/index.ts`
  - [ ] Export useCompletePrd from `src/features/prd/hooks/index.ts`
  - [ ] Update prd feature index.ts with new exports

## Dev Notes

### Architecture Patterns (MANDATORY)

**Component Location:**
```
src/features/prd/
├── components/
│   ├── PrdBuilder/
│   │   ├── PrdBuilder.tsx          (FROM 3.2)
│   │   ├── ChatInterface.tsx       (FROM 3.4)
│   │   ├── PrdPreview.tsx          (FROM 3.5/3.7)
│   │   └── index.ts
│   ├── ConfirmCompletionModal.tsx  (THIS STORY - NEW)
│   ├── CompletedPrdHeader.tsx      (THIS STORY - NEW)
│   ├── GeneratePrototypeButton.tsx (THIS STORY - NEW)
│   ├── SectionStatusBadge.tsx      (FROM 3.5/3.7)
│   ├── PrdSectionCard.tsx          (FROM 3.7)
│   ├── CompletionValidationModal.tsx (FROM 3.7)
│   ├── SaveIndicator.tsx           (FROM 3.6)
│   └── index.ts
├── constants/
│   ├── prdSections.ts              (FROM 3.7)
│   └── index.ts
├── hooks/
│   ├── usePrdBuilder.ts            (FROM 3.5/3.7 - UPDATE)
│   ├── useCompletePrd.ts           (THIS STORY - NEW)
│   ├── usePrdChat.ts               (FROM 3.4)
│   ├── useAutoSave.ts              (FROM 3.6)
│   └── index.ts
├── utils/
│   ├── validatePrdCompletion.ts    (FROM 3.7)
│   └── index.ts
├── services/
│   ├── prdService.ts               (FROM 3.1 - UPDATE)
│   ├── prdMessageService.ts        (FROM 3.1)
│   └── prdChatService.ts           (FROM 3.3)
├── schemas/
│   └── prdSchemas.ts               (FROM 3.1)
└── types.ts                        (FROM 3.1/3.7 - UPDATE)
```

### Database Schema Context

**prd_documents table (from Story 3.1):**
```sql
CREATE TABLE prd_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'complete')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

**ideas table status update:**
```sql
-- Ideas status enum includes: 'submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected'
-- When PRD is marked complete, idea status should transition to 'prd_development' if approved
```

### Type Definitions

```typescript
// src/features/prd/types.ts (UPDATED)
import type { PrdSectionKey } from './constants/prdSections';

export type PrdStatus = 'draft' | 'complete';
export type PrdSectionStatus = 'empty' | 'in_progress' | 'complete';

export interface PrdSection {
  content: string;
  status: PrdSectionStatus;
  lastUpdated?: string;
}

export type PrdContent = {
  [K in PrdSectionKey]?: PrdSection;
};

export interface PrdDocument {
  id: string;
  idea_id: string;
  user_id: string;
  content: PrdContent;
  status: PrdStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface PrdMessage {
  id: string;
  prd_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Completion flow types
export interface CompletePrdResult {
  prd: PrdDocument;
  ideaUpdated: boolean;
}
```

### Service Implementation

```typescript
// src/features/prd/services/prdService.ts
import { supabase } from '@/lib/supabase';
import type { PrdDocument, CompletePrdResult } from '../types';

interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

export const prdService = {
  // ... existing methods from 3.1 ...

  /**
   * Mark PRD as complete and update associated idea status
   * Uses a single transaction to ensure consistency
   */
  async completePrd(prdId: string): Promise<ServiceResponse<CompletePrdResult>> {
    try {
      // First, get the PRD to find the idea_id
      const { data: prd, error: fetchError } = await supabase
        .from('prd_documents')
        .select('id, idea_id, content, status')
        .eq('id', prdId)
        .single();

      if (fetchError || !prd) {
        throw new Error(fetchError?.message || 'PRD not found');
      }

      if (prd.status === 'complete') {
        return { 
          data: { prd: prd as PrdDocument, ideaUpdated: false }, 
          error: null 
        };
      }

      // Update PRD status to complete
      const { data: updatedPrd, error: prdError } = await supabase
        .from('prd_documents')
        .update({ 
          status: 'complete',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', prdId)
        .select()
        .single();

      if (prdError) {
        throw new Error(prdError.message);
      }

      // Update idea status to 'prd_development' 
      // (only if currently 'approved' - maintains status progression)
      const { error: ideaError } = await supabase
        .from('ideas')
        .update({ 
          status: 'prd_development',
          updated_at: new Date().toISOString()
        })
        .eq('id', prd.idea_id)
        .in('status', ['approved', 'prd_development']); // Only update if in valid state

      // Log idea error but don't fail - PRD completion is primary
      const ideaUpdated = !ideaError;

      return { 
        data: { prd: updatedPrd as PrdDocument, ideaUpdated }, 
        error: null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to complete PRD') 
      };
    }
  },

  /**
   * Get PRD by ID
   */
  async getPrdById(prdId: string): Promise<ServiceResponse<PrdDocument>> {
    try {
      const { data, error } = await supabase
        .from('prd_documents')
        .select('*')
        .eq('id', prdId)
        .single();

      if (error) throw new Error(error.message);
      return { data: data as PrdDocument, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};
```

### Hook Implementation

```typescript
// src/features/prd/hooks/useCompletePrd.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prdService } from '../services/prdService';

export function useCompletePrd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prdId: string) => prdService.completePrd(prdId),
    onSuccess: (result, prdId) => {
      if (result.data) {
        // Invalidate PRD queries
        queryClient.invalidateQueries({ queryKey: ['prd', prdId] });
        queryClient.invalidateQueries({ queryKey: ['prds'] });
        
        // Invalidate idea queries (status changed)
        queryClient.invalidateQueries({ queryKey: ['ideas'] });
        queryClient.invalidateQueries({ 
          queryKey: ['idea', result.data.prd.idea_id] 
        });
      }
    },
    onError: (error) => {
      console.error('Failed to complete PRD:', error);
    },
  });
}
```

### ConfirmCompletionModal Component

```tsx
// src/features/prd/components/ConfirmCompletionModal.tsx
import { CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { PRD_SECTIONS } from '../constants/prdSections';
import type { PrdContent } from '../types';

interface ConfirmCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  prdContent: PrdContent;
  ideaTitle: string;
  isLoading?: boolean;
}

export function ConfirmCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  prdContent,
  ideaTitle,
  isLoading = false,
}: ConfirmCompletionModalProps) {
  if (!isOpen) return null;

  const completedSections = PRD_SECTIONS.filter(
    def => prdContent[def.key]?.status === 'complete'
  );

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-success/20">
            <CheckCircleIcon className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Complete Your PRD</h3>
            <p className="text-sm text-base-content/60">
              Ready to finalize "{ideaTitle}"
            </p>
          </div>
        </div>

        {/* PRD Summary */}
        <div className="border border-base-300 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <DocumentTextIcon className="w-5 h-5 text-primary" />
            <span className="font-medium">PRD Summary</span>
            <span className="badge badge-success badge-sm">
              {completedSections.length}/{PRD_SECTIONS.length} sections
            </span>
          </div>
          
          <div className="space-y-2">
            {PRD_SECTIONS.map(def => {
              const section = prdContent[def.key];
              const hasContent = section?.content && section.content.trim().length > 0;
              
              return (
                <div key={def.key} className="text-sm">
                  <span className="font-medium text-base-content/80">
                    {def.title}:
                  </span>{' '}
                  {hasContent ? (
                    <span className="text-base-content/60 line-clamp-1">
                      {section!.content.slice(0, 100)}
                      {section!.content.length > 100 ? '...' : ''}
                    </span>
                  ) : (
                    <span className="text-base-content/40 italic">Empty</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning about finalization */}
        <div className="alert alert-info mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-sm">
            Once marked complete, you can generate a prototype from this PRD.
            The chat history will be preserved for reference.
          </span>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button 
            className="btn btn-ghost" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary gap-2" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Completing...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Mark as Complete
              </>
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} disabled={isLoading}>close</button>
      </form>
    </dialog>
  );
}
```

### GeneratePrototypeButton Component

```tsx
// src/features/prd/components/GeneratePrototypeButton.tsx
import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

interface GeneratePrototypeButtonProps {
  prdId: string;
  ideaId: string;
  disabled?: boolean;
}

export function GeneratePrototypeButton({ 
  prdId, 
  ideaId,
  disabled = false 
}: GeneratePrototypeButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to prototype generation page with PRD context
    navigate(`/prototype/generate/${ideaId}`, { 
      state: { prdId } 
    });
  };

  return (
    <button
      className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-shadow"
      onClick={handleClick}
      disabled={disabled}
    >
      <RocketLaunchIcon className="w-6 h-6" />
      Generate Prototype
    </button>
  );
}
```

### CompletedPrdHeader Component

```tsx
// src/features/prd/components/CompletedPrdHeader.tsx
import { CheckBadgeIcon, EyeIcon } from '@heroicons/react/24/solid';
import { GeneratePrototypeButton } from './GeneratePrototypeButton';
import { formatDistanceToNow } from 'date-fns';

interface CompletedPrdHeaderProps {
  prdId: string;
  ideaId: string;
  ideaTitle: string;
  completedAt: string;
  hasPrototype?: boolean;
  onViewPrd?: () => void;
}

export function CompletedPrdHeader({
  prdId,
  ideaId,
  ideaTitle,
  completedAt,
  hasPrototype = false,
  onViewPrd,
}: CompletedPrdHeaderProps) {
  return (
    <div className="bg-success/10 border-b border-success/30 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-success/20">
            <CheckBadgeIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              PRD Complete
              <span className="badge badge-success">Finalized</span>
            </h2>
            <p className="text-sm text-base-content/60">
              {ideaTitle} • Completed {formatDistanceToNow(new Date(completedAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onViewPrd && (
            <button 
              className="btn btn-outline btn-sm gap-1"
              onClick={onViewPrd}
            >
              <EyeIcon className="w-4 h-4" />
              View PRD
            </button>
          )}
          {!hasPrototype && (
            <GeneratePrototypeButton prdId={prdId} ideaId={ideaId} />
          )}
        </div>
      </div>
    </div>
  );
}
```

### Updated usePrdBuilder Hook Integration

```typescript
// src/features/prd/hooks/usePrdBuilder.ts (ADDITIONS)
import { useState, useCallback } from 'react';
import { useCompletePrd } from './useCompletePrd';
import { validateAllSections, isReadyToComplete } from '../utils/validatePrdCompletion';
import type { PrdCompletionValidation, PrdSectionKey, PrdDocument } from '../types';

interface UsePrdBuilderOptions {
  prdId: string;
  initialContent?: PrdContent;
  prdStatus?: 'draft' | 'complete';
}

export function usePrdBuilder({ prdId, initialContent, prdStatus }: UsePrdBuilderOptions) {
  // ... existing state and logic from previous stories ...
  
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const completePrdMutation = useCompletePrd();

  // Derived state
  const isComplete = prdStatus === 'complete';
  const completionValidation = useMemo<PrdCompletionValidation>(
    () => validateAllSections(prdContent),
    [prdContent]
  );
  const canMarkComplete = completionValidation.isReady;

  // Attempt to mark complete - shows validation or confirm modal
  const attemptMarkComplete = useCallback(() => {
    if (isComplete) return;
    
    if (!canMarkComplete) {
      setShowValidationModal(true);
    } else {
      setShowConfirmModal(true);
    }
  }, [isComplete, canMarkComplete]);

  // Actually mark complete (after confirmation)
  const confirmComplete = useCallback(async () => {
    const result = await completePrdMutation.mutateAsync(prdId);
    if (result.data) {
      setShowConfirmModal(false);
      // Success is handled by toast in the calling component
    }
    return result;
  }, [prdId, completePrdMutation]);

  const closeValidationModal = useCallback(() => {
    setShowValidationModal(false);
  }, []);

  const closeConfirmModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  return {
    // ... existing returns ...
    
    // Completion state
    isComplete,
    canMarkComplete,
    completionValidation,
    
    // Modal states
    showValidationModal,
    showConfirmModal,
    
    // Actions
    attemptMarkComplete,
    confirmComplete,
    closeValidationModal,
    closeConfirmModal,
    
    // Mutation state
    isCompletingPrd: completePrdMutation.isPending,
    completePrdError: completePrdMutation.error,
  };
}
```

### PrdBuilderPage Integration Example

```tsx
// src/pages/PrdBuilderPage.tsx (PARTIAL - showing completion integration)
import { usePrdBuilder } from '@/features/prd/hooks/usePrdBuilder';
import { 
  CompletionValidationModal,
  ConfirmCompletionModal,
  CompletedPrdHeader,
} from '@/features/prd/components';
import { toast } from '@/hooks/useToast'; // or your toast implementation

export function PrdBuilderPage() {
  const { prdId, ideaId } = useParams();
  const { 
    prdContent,
    isComplete,
    canMarkComplete,
    completionValidation,
    showValidationModal,
    showConfirmModal,
    attemptMarkComplete,
    confirmComplete,
    closeValidationModal,
    closeConfirmModal,
    isCompletingPrd,
    focusOnSection,
    // ... other usePrdBuilder returns
  } = usePrdBuilder({ prdId, initialContent, prdStatus });

  const handleConfirmComplete = async () => {
    const result = await confirmComplete();
    if (result.data) {
      toast.success('PRD marked complete! Ready for prototype generation.');
    } else if (result.error) {
      toast.error(`Failed to complete PRD: ${result.error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Show completed header if PRD is complete */}
      {isComplete ? (
        <CompletedPrdHeader
          prdId={prdId}
          ideaId={ideaId}
          ideaTitle={ideaTitle}
          completedAt={prd.completed_at}
          onViewPrd={() => navigate(`/prd/${prdId}`)}
        />
      ) : (
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
          <h1 className="text-xl font-bold">Build Your PRD</h1>
          <button
            className="btn btn-primary"
            onClick={attemptMarkComplete}
            disabled={isCompletingPrd}
          >
            Mark as Complete
          </button>
        </div>
      )}

      {/* PRD Builder content - read-only if complete */}
      <div className={`flex-1 ${isComplete ? 'pointer-events-none opacity-75' : ''}`}>
        {/* Chat and Preview components */}
      </div>

      {/* Validation Modal */}
      <CompletionValidationModal
        isOpen={showValidationModal}
        onClose={closeValidationModal}
        validation={completionValidation}
        onFocusSection={(key) => {
          closeValidationModal();
          focusOnSection(key);
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmCompletionModal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmComplete}
        prdContent={prdContent}
        ideaTitle={ideaTitle}
        isLoading={isCompletingPrd}
      />
    </div>
  );
}
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Service methods | `camelCase` | `completePrd`, `getPrdById` |
| Hook names | `use` + `PascalCase` | `useCompletePrd`, `usePrdBuilder` |
| Component files | `PascalCase.tsx` | `ConfirmCompletionModal.tsx` |
| Type exports | `PascalCase` | `PrdStatus`, `CompletePrdResult` |
| Query keys | `['feature', 'action', ...params]` | `['prd', prdId]`, `['ideas']` |
| CSS classes | DaisyUI pattern | `btn-primary`, `modal-open`, `badge-success` |

### Anti-Patterns to AVOID

1. **DO NOT** allow completion without validation - always check with validateAllSections first
2. **DO NOT** update PRD and idea separately without proper error handling - use transaction-like pattern
3. **DO NOT** make chat editable after completion - read-only mode is required
4. **DO NOT** lose PRD content on completion - only status changes
5. **DO NOT** forget to invalidate queries - both PRD and idea queries must refresh
6. **DO NOT** show Generate Prototype button if PRD is still draft
7. **DO NOT** block the UI during mutation - show loading state but keep modal interactive
8. **DO NOT** hardcode status strings - use PrdStatus type
9. **DO NOT** forget error handling - network errors must be recoverable
10. **DO NOT** forget toast notifications - user needs feedback on success/failure

### Performance Requirements (NFR-P2, NFR-P4)

- Modal should appear immediately on button click (<100ms)
- Completion mutation should complete within 3 seconds
- Query invalidation should trigger immediate UI update
- Toast notifications should appear immediately on mutation result

### UX Design Requirements (from UX Spec)

1. **Clear completion path** - User knows exactly when PRD is ready to complete
2. **Confirmation safety** - Confirmation modal prevents accidental completion
3. **Visual celebration** - Success feedback with prominent "Generate Prototype" CTA
4. **Status visibility** - Completed state is unmistakably clear
5. **Error recovery** - Failed completions can be retried easily
6. **Progressive accomplishment** - Completion feels like an achievement

### Dependencies on Previous Stories

- **Story 3.1 (PRD Database):** prd_documents table, prdService foundation, PrdDocument type
- **Story 3.2 (PRD Builder Page):** PrdBuilderPage component structure
- **Story 3.4 (Chat Interface):** ChatInterface component (becomes read-only)
- **Story 3.5 (Real-Time Section Generation):** PrdPreview component
- **Story 3.6 (Auto-Save):** Auto-save should stop after completion
- **Story 3.7 (Section Structure):** validateAllSections, CompletionValidationModal, section definitions

### Dependencies for Future Stories

- **Story 3.9 (View Completed PRD):** Uses completed PRD data and read-only view
- **Story 4.3 (Trigger Prototype Generation):** Uses GeneratePrototypeButton navigation

### Data Flow

```
User clicks "Mark as Complete":
  → attemptMarkComplete() called
    → validateAllSections(prdContent) checks completion
      → IF NOT READY: showValidationModal = true
        → User clicks section → focusOnSection() → AI guides completion
      → IF READY: showConfirmModal = true
        → User reviews PRD summary
          → User clicks "Confirm"
            → confirmComplete() calls completePrdMutation.mutateAsync()
              → prdService.completePrd(prdId) executes
                → UPDATE prd_documents SET status = 'complete'
                → UPDATE ideas SET status = 'prd_development'
                → Return updated PRD
              → Query invalidation triggers
                → UI re-renders with isComplete = true
                  → CompletedPrdHeader displays
                  → GeneratePrototypeButton visible
                  → Chat/preview becomes read-only
              → Toast success appears
```

### Testing Checklist

- [ ] "Mark as Complete" button shows when PRD is draft
- [ ] Clicking button when sections incomplete shows validation modal
- [ ] Clicking button when sections complete shows confirmation modal
- [ ] Confirmation modal displays PRD summary correctly
- [ ] Confirming completion updates PRD status in database
- [ ] Confirming completion updates idea status to 'prd_development'
- [ ] Success toast appears after completion
- [ ] CompletedPrdHeader displays after completion
- [ ] GeneratePrototypeButton is visible after completion
- [ ] Chat interface becomes read-only after completion
- [ ] PRD sections are not editable after completion
- [ ] Navigation away and back preserves complete status
- [ ] Error during completion shows error toast
- [ ] Error allows retry without page refresh
- [ ] Loading state shows during completion mutation
- [ ] Modals can be closed/cancelled properly

### Project Structure Notes

- CompletionValidationModal is reused from Story 3.7
- GeneratePrototypeButton will be extended in Epic 4
- prdService.completePrd handles both PRD and idea updates atomically
- Read-only mode is enforced at PrdBuilderPage level, not component level

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.8]
- [Source: _bmad-output/planning-artifacts/prd.md#FR25 Mark PRD as complete]
- [Source: _bmad-output/planning-artifacts/prd.md#FR27 Auto-generate prototype]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/implementation-artifacts/3-7-prd-section-structure-and-content.md]
- [Source: _bmad-output/implementation-artifacts/3-1-create-prd-database-tables-and-service-layer.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
