# Story 2.7: Submit Idea and Save to Database

Status: ready-for-dev

## Story

As a **user**,
I want **to submit my idea after review**,
So that **it enters the innovation pipeline**.

## Acceptance Criteria

1. **Given** I am on Step 4 Review **When** I click "Submit Idea" **Then** the idea is saved to the database with status "submitted"

2. **Given** submission succeeds **When** the database confirms the save **Then** I see a success message with confirmation (toast notification)

3. **Given** submission succeeds **Then** I am redirected to the My Ideas list page (`/ideas`)

4. **Given** I am redirected to My Ideas **When** the page loads **Then** the new idea appears at the top of my list

5. **Given** submission fails (network error, database error, etc.) **When** I try to submit **Then** I see a clear error message explaining what went wrong

6. **Given** submission fails **Then** my wizard data is preserved so I can retry without re-entering information

7. **Given** the user has chosen enhanced content **When** submitting **Then** both original and enhanced versions are saved to the database

8. **Given** the user declined AI enhancement **When** submitting **Then** only original content is saved (enhanced fields remain null)

## Tasks / Subtasks

- [ ] Task 1: Create useSubmitIdea hook with React Query mutation (AC: 1, 2, 5, 6)
  - [ ] Create `src/features/ideas/hooks/useSubmitIdea.ts`
  - [ ] Use `useMutation` from React Query
  - [ ] Call `ideaService.createIdea` with wizard data
  - [ ] Handle success: invalidate ideas query, show toast, navigate
  - [ ] Handle error: show error toast, preserve form state
  - [ ] Return mutation state: `isSubmitting`, `error`, `submitIdea`

- [ ] Task 2: Generate idea title from problem statement (AC: 1, 7)
  - [ ] Create `generateIdeaTitle` utility function
  - [ ] Extract first 50 characters of problem text
  - [ ] Trim at word boundary if possible
  - [ ] Add ellipsis if truncated
  - [ ] Place in `src/features/ideas/utils/ideaUtils.ts`

- [ ] Task 3: Integrate submit functionality into StepReview component (AC: 1, 6, 7, 8)
  - [ ] Import and use `useSubmitIdea` hook
  - [ ] Wire "Submit Idea" button to mutation
  - [ ] Disable button while `isSubmitting` is true
  - [ ] Show loading spinner on button during submission
  - [ ] Map wizard state to `CreateIdeaInput` format
  - [ ] Include enhanced content if user accepted AI enhancement

- [ ] Task 4: Implement success flow with navigation (AC: 2, 3, 4)
  - [ ] Show success toast: "Idea submitted successfully!"
  - [ ] Navigate to `/ideas` using `useNavigate` from react-router-dom
  - [ ] Ensure React Query cache invalidation triggers fresh ideas fetch
  - [ ] Clear wizard state after successful submission

- [ ] Task 5: Implement error handling and retry flow (AC: 5, 6)
  - [ ] Display error toast with user-friendly message
  - [ ] Keep wizard state intact on error (no clearing)
  - [ ] Enable retry by keeping "Submit Idea" button active after error
  - [ ] Log error details to console for debugging

- [ ] Task 6: Create integration test for submit flow (AC: 1-6)
  - [ ] Create `src/features/ideas/hooks/useSubmitIdea.test.ts`
  - [ ] Test successful submission flow
  - [ ] Test error handling flow
  - [ ] Test title generation from problem
  - [ ] Test data mapping (original vs enhanced)

## Dev Notes

### Architecture Patterns (MANDATORY)

**File Structure for This Story:**
```
src/features/ideas/
├── hooks/
│   ├── useSubmitIdea.ts       (THIS STORY - NEW)
│   └── useSubmitIdea.test.ts  (THIS STORY - NEW)
├── utils/
│   └── ideaUtils.ts           (THIS STORY - NEW)
├── components/
│   └── IdeaWizard/
│       └── StepReview.tsx     (THIS STORY - UPDATE)
└── index.ts                   (THIS STORY - UPDATE exports)
```

### useSubmitIdea Hook Implementation

```typescript
// src/features/ideas/hooks/useSubmitIdea.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ideaService } from '../services/ideaService';
import { useToast } from '@/hooks/useToast';
import { generateIdeaTitle } from '../utils/ideaUtils';
import type { CreateIdeaInput } from '@/types/database';

interface WizardData {
  problem: string;
  solution: string;
  impact: string;
  enhancedProblem?: string;
  enhancedSolution?: string;
  enhancedImpact?: string;
  useEnhanced: boolean;  // User's choice to use AI-enhanced version
}

interface UseSubmitIdeaOptions {
  onSuccess?: () => void;  // Optional callback for additional cleanup
}

export function useSubmitIdea(options?: UseSubmitIdeaOptions) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (wizardData: WizardData) => {
      // Map wizard data to CreateIdeaInput
      const input: CreateIdeaInput = {
        title: generateIdeaTitle(wizardData.problem),
        problem: wizardData.problem,
        solution: wizardData.solution,
        impact: wizardData.impact,
        // Include enhanced content if user chose to use it
        enhanced_problem: wizardData.useEnhanced ? wizardData.enhancedProblem : undefined,
        enhanced_solution: wizardData.useEnhanced ? wizardData.enhancedSolution : undefined,
        enhanced_impact: wizardData.useEnhanced ? wizardData.enhancedImpact : undefined,
      };

      const result = await ideaService.createIdea(input);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.data;
    },
    onSuccess: () => {
      // Invalidate ideas cache to trigger fresh fetch
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      
      // Show success message
      toast({
        title: 'Success!',
        description: 'Your idea has been submitted successfully.',
        variant: 'success',
      });

      // Call optional success callback (e.g., clear wizard state)
      options?.onSuccess?.();
      
      // Navigate to ideas list
      navigate('/ideas');
    },
    onError: (error: Error) => {
      console.error('Submit idea error:', error);
      
      // Show error toast with user-friendly message
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit idea. Please try again.',
        variant: 'error',
      });
      
      // NOTE: Wizard data is preserved automatically - no clearing on error
    },
  });

  return {
    submitIdea: mutation.mutate,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
```

### Idea Title Generation Utility

```typescript
// src/features/ideas/utils/ideaUtils.ts

/**
 * Generate a title from the problem statement
 * - Takes first 50 characters
 * - Trims at word boundary if possible
 * - Adds ellipsis if truncated
 */
export function generateIdeaTitle(problem: string, maxLength: number = 50): string {
  // Clean and normalize whitespace
  const cleaned = problem.trim().replace(/\s+/g, ' ');
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  // Find last space before maxLength to avoid cutting words
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If we found a space and it's not too early in the string
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  // Otherwise just truncate at maxLength
  return truncated + '...';
}
```

### StepReview Component Integration

```typescript
// src/features/ideas/components/IdeaWizard/StepReview.tsx
// ADD these imports and integration to existing component

import { useSubmitIdea } from '../../hooks/useSubmitIdea';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

// Inside StepReview component:
export function StepReview({ 
  wizardData, 
  onBack,
  onClearWizard,  // Callback to clear wizard state on success
}: StepReviewProps) {
  const { submitIdea, isSubmitting } = useSubmitIdea({
    onSuccess: onClearWizard,
  });

  const handleSubmit = () => {
    submitIdea({
      problem: wizardData.problem,
      solution: wizardData.solution,
      impact: wizardData.impact,
      enhancedProblem: wizardData.enhancedProblem,
      enhancedSolution: wizardData.enhancedSolution,
      enhancedImpact: wizardData.enhancedImpact,
      useEnhanced: wizardData.useEnhanced ?? false,
    });
  };

  return (
    <div>
      {/* Existing review content... */}
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Submitting...
            </>
          ) : (
            'Submit Idea'
          )}
        </Button>
      </div>
    </div>
  );
}
```

### Update Feature Barrel Export

```typescript
// src/features/ideas/index.ts
// ADD these exports to existing file

// Services
export { ideaService } from './services/ideaService';

// Hooks
export { useSubmitIdea } from './hooks/useSubmitIdea';

// Utils
export { generateIdeaTitle } from './utils/ideaUtils';

// Types
export type * from './types';
```

### CreateIdeaInput Type Reference

From Story 2.1, the `CreateIdeaInput` type in `src/types/database.ts`:

```typescript
export interface CreateIdeaInput {
  title: string;
  problem: string;
  solution: string;
  impact: string;
  enhanced_problem?: string;
  enhanced_solution?: string;
  enhanced_impact?: string;
}
```

**Note:** Status is NOT included - the database defaults to 'submitted'.

### Toast Hook Pattern (if not exists)

```typescript
// src/hooks/useToast.ts
// If this doesn't exist from previous stories, create it:

import { useState, useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

// Simple toast state management
// In production, integrate with DaisyUI toast component
export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    // DaisyUI toast implementation
    // For now, use alert as fallback - replace with proper DaisyUI toast
    const message = `${options.title}${options.description ? ': ' + options.description : ''}`;
    
    if (options.variant === 'error') {
      console.error(message);
      // Show error toast
    } else {
      console.log(message);
      // Show success/info toast
    }
  }, []);

  return { toast };
}
```

### React Query Configuration

Ensure React Query is configured in the app (from Story 1.1):

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
    mutations: {
      retry: 0, // Don't auto-retry mutations
    },
  },
});
```

### Query Keys Pattern (MANDATORY)

```typescript
// src/features/ideas/hooks/queryKeys.ts
export const ideaQueryKeys = {
  all: ['ideas'] as const,
  lists: () => [...ideaQueryKeys.all, 'list'] as const,
  list: (filters?: { status?: string }) => [...ideaQueryKeys.lists(), filters] as const,
  details: () => [...ideaQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...ideaQueryKeys.details(), id] as const,
};
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Hook files | `camelCase` | `useSubmitIdea.ts` |
| Hook functions | `use` + `PascalCase` | `useSubmitIdea` |
| Utility files | `camelCase` | `ideaUtils.ts` |
| Utility functions | `camelCase` | `generateIdeaTitle` |
| Component props | `PascalCase` + `Props` | `StepReviewProps` |
| Query keys | `camelCase` + `QueryKeys` | `ideaQueryKeys` |

### Anti-Patterns to AVOID

1. **DO NOT** call ideaService directly from components - use the `useSubmitIdea` hook
2. **DO NOT** clear wizard state before navigation succeeds - only clear on confirmed success
3. **DO NOT** show technical error messages to users - wrap in user-friendly language
4. **DO NOT** hardcode navigation paths - consider using route constants
5. **DO NOT** forget to invalidate the ideas cache - stale data will show
6. **DO NOT** skip the loading state on the submit button - prevents double-submit
7. **DO NOT** forget to disable navigation buttons during submission
8. **DO NOT** use snake_case in TypeScript - convert from database types properly
9. **DO NOT** include status in CreateIdeaInput - let database default handle it
10. **DO NOT** forget to handle the case where AI enhancement failed but user still submits

### Dependencies on Previous Stories

- **Story 2.1 (Ideas DB/Service):** `ideaService.createIdea` method and types
- **Story 2.5 (Step 4 Review):** StepReview component to integrate with
- **Story 2.6 (Gemini Edge Function):** Enhanced content fields
- **Story 1.1 (Project Init):** React Query, React Router DOM setup
- **Story 1.4/1.5 (Auth):** User must be authenticated to submit

### Dependencies for Future Stories

- **Story 2.8 (My Ideas List):** Will display submitted ideas using `ideaQueryKeys`
- **Story 2.9 (Idea Detail):** Will show submitted idea details

### Integration Points

**Data Flow:**
```
User clicks "Submit Idea" 
  → useSubmitIdea.submitIdea(wizardData)
    → generateIdeaTitle(problem)
    → ideaService.createIdea(input)
      → Supabase INSERT with user_id from auth
        → RLS validates user can insert
          → Database sets status='submitted'
            → Return created idea
    → React Query cache invalidation
    → Toast notification
    → Navigate to /ideas
```

### Error Scenarios to Handle

| Error | User Message | Developer Action |
|-------|--------------|------------------|
| Network error | "Network error. Please check your connection and try again." | Log full error |
| Auth expired | "Session expired. Please log in again." | Redirect to login |
| Database error | "Failed to save idea. Please try again." | Log error details |
| Validation error | "Invalid idea data. Please review and try again." | Should not happen (validated earlier) |

### Testing Checklist

- [ ] Submit idea saves to database with status "submitted"
- [ ] Title is generated correctly from problem (50 chars max, word boundary)
- [ ] Success toast appears after submission
- [ ] User is redirected to /ideas page
- [ ] New idea appears at top of ideas list
- [ ] Submit button shows loading state during submission
- [ ] Submit button is disabled during submission
- [ ] Back button is disabled during submission
- [ ] Error toast appears on submission failure
- [ ] Wizard data is preserved after error (can retry)
- [ ] Enhanced content is saved when user chose "use enhanced"
- [ ] Enhanced content is null when user declined enhancement
- [ ] Enhanced content is null when AI enhancement failed
- [ ] React Query cache is invalidated on success

### UI/UX Requirements (from UX Design)

- Submit button should be prominent (primary variant, PassportCard red)
- Loading spinner should appear inside button during submission
- Success toast should be visible for 3-5 seconds
- Error toast should persist until dismissed
- Navigation to /ideas should feel instant (optimistic UI via cache)

### Performance Considerations

- Single database insert operation
- No retry on mutation (user initiates retry manually)
- Cache invalidation triggers background refetch of ideas list
- Navigation happens immediately after success callback

### Security Considerations

- User must be authenticated (protected route)
- user_id is set server-side via `supabase.auth.getUser()`
- RLS policy validates insert permission
- Input data should be sanitized (Zod validation from wizard steps)

### Project Structure Notes

- First hook in ideas feature (sets pattern for future hooks)
- Utils folder created for feature-specific utilities
- Test file co-located with hook file
- Follows established patterns from auth feature

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.7]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling]
- [Source: _bmad-output/planning-artifacts/prd.md#FR7-FR17 Idea Submission]
- [Source: _bmad-output/implementation-artifacts/2-1-create-ideas-database-table-and-service-layer.md]
- [Source: _bmad-output/implementation-artifacts/2-5-idea-wizard-step-4-review-and-ai-enhancement.md]
- [React Query Mutations Documentation](https://tanstack.com/query/latest/docs/react/guides/mutations)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
