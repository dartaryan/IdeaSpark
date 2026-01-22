# Story 2.9: Idea Detail View

Status: review

## Story

As a **user**,
I want **to view the full details of my idea**,
So that **I can see what I submitted and its current status**.

## Acceptance Criteria

1. **Given** I click on an idea in my list **When** the detail page loads **Then** I see the complete idea: problem, solution, impact (both original and enhanced if applicable)

2. **Given** the detail page loads **When** AI-enhanced content exists **Then** I see both original and enhanced versions with clear distinction

3. **Given** the detail page loads **When** I view the status **Then** I see the current status prominently displayed with appropriate color coding

4. **Given** the detail page loads **When** I view timestamps **Then** I see submission date and any status change dates

5. **Given** the detail page loads **When** I view status information **Then** I see a clear next step message based on status:
   - submitted → "Waiting for review"
   - under_review → "Under review by innovation team"
   - approved → "Ready to build PRD"
   - rejected → "Idea was not approved"

6. **Given** my idea status is "approved" **When** I view the detail page **Then** I see a prominent "Build PRD" button

7. **Given** my idea status is "approved" **When** I click "Build PRD" **Then** I navigate to the PRD builder page (`/prd/:ideaId`)

8. **Given** the page is loading **When** the page renders **Then** I see appropriate skeleton loading placeholders

9. **Given** the idea is not found or an error occurs **When** the error is displayed **Then** I see a user-friendly error message with navigation options

10. **Given** I am on the detail page **When** I want to go back **Then** I can navigate back to My Ideas list

## Tasks / Subtasks

- [x] Task 1: Create useIdea hook for fetching single idea by ID (AC: 1, 8, 9)
  - [x] Create `src/features/ideas/hooks/useIdea.ts`
  - [x] Use `useQuery` from React Query
  - [x] Call `ideaService.getIdeaById(id)`
  - [x] Return `{ idea, isLoading, error, isNotFound }`
  - [x] Handle not found scenario (idea is null but no error)

- [x] Task 2: Create ideaService.getIdeaById method (AC: 1)
  - [x] Add `getIdeaById` to `src/features/ideas/services/ideaService.ts`
  - [x] Query ideas table by ID with RLS filter
  - [x] Return ServiceResponse<Idea | null>

- [x] Task 3: Create IdeaDetailContent component (AC: 1, 2)
  - [x] Create `src/features/ideas/components/IdeaDetailContent.tsx`
  - [x] Display problem, solution, impact in structured sections
  - [x] Show both original and enhanced content if available
  - [x] Use DaisyUI card/collapse for content sections

- [x] Task 4: Create IdeaStatusInfo component (AC: 3, 4, 5)
  - [x] Create `src/features/ideas/components/IdeaStatusInfo.tsx`
  - [x] Display status badge prominently
  - [x] Show submission date formatted
  - [x] Display next step message based on status

- [x] Task 5: Create IdeaDetailActions component (AC: 6, 7, 10)
  - [x] Create `src/features/ideas/components/IdeaDetailActions.tsx`
  - [x] Show "Build PRD" button when status is "approved"
  - [x] Include back navigation to My Ideas
  - [x] Navigate to PRD builder on button click

- [x] Task 6: Create IdeaDetailSkeleton component (AC: 8)
  - [x] Create `src/features/ideas/components/IdeaDetailSkeleton.tsx`
  - [x] Match layout of IdeaDetailContent
  - [x] Use DaisyUI skeleton classes

- [x] Task 7: Create IdeaNotFound component (AC: 9)
  - [x] Create `src/features/ideas/components/IdeaNotFound.tsx`
  - [x] Display friendly "not found" message
  - [x] Include navigation back to My Ideas

- [x] Task 8: Create IdeaDetailPage (AC: 1-10)
  - [x] Create `src/pages/IdeaDetailPage.tsx`
  - [x] Use useParams to get idea ID from URL
  - [x] Integrate useIdea hook
  - [x] Render appropriate state: loading, not found, error, or content
  - [x] Compose IdeaDetailContent, IdeaStatusInfo, IdeaDetailActions

- [x] Task 9: Update routing to include IdeaDetailPage
  - [x] Add route for `/ideas/:id` in routes configuration
  - [x] Import and configure IdeaDetailPage component

- [x] Task 10: Update feature barrel exports
  - [x] Export new components and hooks from `src/features/ideas/index.ts`

- [x] Task 11: Create unit tests (AC: 1-10)
  - [x] Create `src/features/ideas/hooks/useIdea.test.tsx`
  - [x] Create `src/features/ideas/components/IdeaDetailContent.test.tsx`
  - [x] Create `src/features/ideas/components/IdeaStatusInfo.test.tsx`
  - [x] Test status-based next step messages
  - [x] Test Build PRD button visibility

## Dev Notes

### Architecture Patterns (MANDATORY)

**File Structure for This Story:**
```
src/features/ideas/
├── components/
│   ├── IdeaDetailContent.tsx      (NEW)
│   ├── IdeaDetailContent.test.tsx (NEW)
│   ├── IdeaStatusInfo.tsx         (NEW)
│   ├── IdeaStatusInfo.test.tsx    (NEW)
│   ├── IdeaDetailActions.tsx      (NEW)
│   ├── IdeaDetailSkeleton.tsx     (NEW)
│   ├── IdeaNotFound.tsx           (NEW)
│   ├── IdeaCard.tsx               (FROM 2.8)
│   ├── IdeaList.tsx               (FROM 2.8)
│   └── IdeaStatusBadge.tsx        (FROM 2.8 - REUSE)
├── hooks/
│   ├── useIdea.ts                 (NEW)
│   ├── useIdea.test.ts            (NEW)
│   ├── useIdeas.ts                (FROM 2.8)
│   └── queryKeys.ts               (UPDATE - add detail key)
├── services/
│   └── ideaService.ts             (UPDATE - add getIdeaById)
├── types.ts                       (EXISTS - use Idea type)
└── index.ts                       (UPDATE - add exports)

src/pages/
└── IdeaDetailPage.tsx             (NEW)

src/routes/
└── index.tsx                      (UPDATE - add route)
```

### Idea Type Reference

From `src/features/ideas/types.ts`:

```typescript
export interface Idea {
  id: string;
  user_id: string;
  title: string;
  problem_statement: string;
  proposed_solution: string;
  expected_impact: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  ai_enhanced_content: string | null;
  created_at: string;
  updated_at: string;
}
```

**Note:** The PRD mentions additional statuses (prd_development, prototype_complete). The current types.ts uses the above. Align with database schema - extend type if DB supports more statuses.

### Route Constants Reference

From `src/routes/routeConstants.ts`:
- `ROUTES.IDEA_DETAIL` = `/ideas/:id`
- `ROUTES.PRD_BUILDER` = `/prd/:id`
- `ROUTES.IDEAS` = `/ideas`

### ideaService.getIdeaById Implementation

```typescript
// src/features/ideas/services/ideaService.ts
import { supabase } from '@/lib/supabase';
import type { Idea } from '../types';
import type { ServiceResponse } from '@/types';

export const ideaService = {
  // ... existing methods (getMyIdeas from Story 2.8)

  async getIdeaById(id: string): Promise<ServiceResponse<Idea | null>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        // PGRST116 = Row not found
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: data as Idea, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { message: 'Failed to fetch idea', code: 'UNKNOWN_ERROR' } 
      };
    }
  },
};
```

### useIdea Hook Implementation

```typescript
// src/features/ideas/hooks/useIdea.ts
import { useQuery } from '@tanstack/react-query';
import { ideaService } from '../services/ideaService';
import { ideaQueryKeys } from './queryKeys';

export function useIdea(id: string | undefined) {
  const query = useQuery({
    queryKey: ideaQueryKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const result = await ideaService.getIdeaById(id);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    idea: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    isNotFound: !query.isLoading && !query.error && query.data === null,
  };
}
```

### Query Keys Update

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

### Status Next Step Messages

```typescript
// Status configuration for next step messages
const statusNextSteps: Record<Idea['status'], { message: string; action?: string }> = {
  draft: { 
    message: 'Continue editing your idea', 
    action: 'Edit' 
  },
  submitted: { 
    message: 'Your idea is waiting for review by the innovation team' 
  },
  under_review: { 
    message: 'Your idea is being reviewed by the innovation team' 
  },
  approved: { 
    message: 'Congratulations! Your idea is approved. Start building your PRD.', 
    action: 'Build PRD' 
  },
  rejected: { 
    message: 'This idea was not approved. Check the feedback for details.' 
  },
};
```

### IdeaDetailContent Component

```typescript
// src/features/ideas/components/IdeaDetailContent.tsx
import type { Idea } from '../types';

interface IdeaDetailContentProps {
  idea: Idea;
}

export function IdeaDetailContent({ idea }: IdeaDetailContentProps) {
  const hasEnhancedContent = !!idea.ai_enhanced_content;
  
  // Parse enhanced content if exists (JSON structure expected)
  const enhancedData = hasEnhancedContent 
    ? JSON.parse(idea.ai_enhanced_content!) 
    : null;

  return (
    <div className="space-y-6">
      {/* Problem Section */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-primary">1.</span> Problem Statement
        </h2>
        <div className="bg-base-200 rounded-box p-4">
          <p className="text-base-content whitespace-pre-wrap">
            {idea.problem_statement}
          </p>
        </div>
        {enhancedData?.problem && (
          <div className="mt-3">
            <div className="badge badge-primary badge-sm mb-2">AI Enhanced</div>
            <div className="bg-primary/10 rounded-box p-4 border border-primary/20">
              <p className="text-base-content whitespace-pre-wrap">
                {enhancedData.problem}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Solution Section */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-primary">2.</span> Proposed Solution
        </h2>
        <div className="bg-base-200 rounded-box p-4">
          <p className="text-base-content whitespace-pre-wrap">
            {idea.proposed_solution}
          </p>
        </div>
        {enhancedData?.solution && (
          <div className="mt-3">
            <div className="badge badge-primary badge-sm mb-2">AI Enhanced</div>
            <div className="bg-primary/10 rounded-box p-4 border border-primary/20">
              <p className="text-base-content whitespace-pre-wrap">
                {enhancedData.solution}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Impact Section */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-primary">3.</span> Expected Impact
        </h2>
        <div className="bg-base-200 rounded-box p-4">
          <p className="text-base-content whitespace-pre-wrap">
            {idea.expected_impact}
          </p>
        </div>
        {enhancedData?.impact && (
          <div className="mt-3">
            <div className="badge badge-primary badge-sm mb-2">AI Enhanced</div>
            <div className="bg-primary/10 rounded-box p-4 border border-primary/20">
              <p className="text-base-content whitespace-pre-wrap">
                {enhancedData.impact}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
```

### IdeaStatusInfo Component

```typescript
// src/features/ideas/components/IdeaStatusInfo.tsx
import { IdeaStatusBadge } from './IdeaStatusBadge';
import type { Idea } from '../types';

interface IdeaStatusInfoProps {
  idea: Idea;
}

const statusNextSteps: Record<Idea['status'], string> = {
  draft: 'Continue editing your idea to submit it for review.',
  submitted: 'Your idea is waiting for review by the innovation team.',
  under_review: 'Your idea is being reviewed by the innovation team.',
  approved: 'Congratulations! Your idea is approved. Start building your PRD.',
  rejected: 'This idea was not approved. Check any feedback for details.',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function IdeaStatusInfo({ idea }: IdeaStatusInfoProps) {
  const nextStepMessage = statusNextSteps[idea.status];

  return (
    <div className="card bg-base-100 border border-base-200">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Status</h3>
          <IdeaStatusBadge status={idea.status} />
        </div>
        
        <p className="text-base-content/70 text-sm mb-4">
          {nextStepMessage}
        </p>
        
        <div className="divider my-2"></div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/60">Submitted</span>
            <span>{formatDate(idea.created_at)}</span>
          </div>
          {idea.updated_at !== idea.created_at && (
            <div className="flex justify-between">
              <span className="text-base-content/60">Last Updated</span>
              <span>{formatDate(idea.updated_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### IdeaDetailActions Component

```typescript
// src/features/ideas/components/IdeaDetailActions.tsx
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routeConstants';
import type { Idea } from '../types';

interface IdeaDetailActionsProps {
  idea: Idea;
}

export function IdeaDetailActions({ idea }: IdeaDetailActionsProps) {
  const navigate = useNavigate();
  const canBuildPrd = idea.status === 'approved';

  const handleBuildPrd = () => {
    // Navigate to PRD builder with idea ID
    navigate(ROUTES.PRD_BUILDER.replace(':id', idea.id));
  };

  const handleBackToList = () => {
    navigate(ROUTES.IDEAS);
  };

  return (
    <div className="flex flex-col gap-3">
      {canBuildPrd && (
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleBuildPrd}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Build PRD
        </button>
      )}
      
      <button
        className="btn btn-ghost"
        onClick={handleBackToList}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        Back to My Ideas
      </button>
    </div>
  );
}
```

### IdeaDetailSkeleton Component

```typescript
// src/features/ideas/components/IdeaDetailSkeleton.tsx

export function IdeaDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-base-300 rounded w-3/4 mb-6" />
      
      {/* Status card skeleton */}
      <div className="card bg-base-100 border border-base-200 mb-6">
        <div className="card-body p-4">
          <div className="flex justify-between mb-4">
            <div className="h-5 bg-base-300 rounded w-16" />
            <div className="h-6 bg-base-300 rounded w-24" />
          </div>
          <div className="h-4 bg-base-300 rounded w-full mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-base-300 rounded w-1/2" />
            <div className="h-4 bg-base-300 rounded w-1/3" />
          </div>
        </div>
      </div>

      {/* Content sections skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-6 bg-base-300 rounded w-40 mb-3" />
            <div className="bg-base-200 rounded-box p-4">
              <div className="space-y-2">
                <div className="h-4 bg-base-300 rounded w-full" />
                <div className="h-4 bg-base-300 rounded w-5/6" />
                <div className="h-4 bg-base-300 rounded w-4/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### IdeaNotFound Component

```typescript
// src/features/ideas/components/IdeaNotFound.tsx
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routeConstants';

export function IdeaNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-20 w-20 mb-6 text-base-content/30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      
      <h2 className="text-xl font-semibold text-base-content mb-2">
        Idea Not Found
      </h2>
      <p className="text-base-content/60 mb-6 max-w-md">
        The idea you're looking for doesn't exist or you don't have permission to view it.
      </p>
      
      <button
        className="btn btn-primary"
        onClick={() => navigate(ROUTES.IDEAS)}
      >
        Go to My Ideas
      </button>
    </div>
  );
}
```

### IdeaDetailPage Implementation

```typescript
// src/pages/IdeaDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useIdea } from '@/features/ideas/hooks/useIdea';
import { IdeaDetailContent } from '@/features/ideas/components/IdeaDetailContent';
import { IdeaStatusInfo } from '@/features/ideas/components/IdeaStatusInfo';
import { IdeaDetailActions } from '@/features/ideas/components/IdeaDetailActions';
import { IdeaDetailSkeleton } from '@/features/ideas/components/IdeaDetailSkeleton';
import { IdeaNotFound } from '@/features/ideas/components/IdeaNotFound';

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { idea, isLoading, error, isNotFound } = useIdea(id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <IdeaDetailSkeleton />
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="max-w-4xl mx-auto">
        <IdeaNotFound />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error.message || 'Failed to load idea'}</span>
        </div>
      </div>
    );
  }

  if (!idea) return null;

  // Use title or truncated problem statement
  const displayTitle = idea.title || idea.problem_statement.substring(0, 50) + (idea.problem_statement.length > 50 ? '...' : '');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <h1 className="text-2xl font-bold mb-6">{displayTitle}</h1>
      
      {/* Two-column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width on desktop */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <IdeaDetailContent idea={idea} />
        </div>
        
        {/* Sidebar - 1/3 width on desktop */}
        <div className="lg:col-span-1 order-1 lg:order-2 space-y-4">
          <IdeaStatusInfo idea={idea} />
          <IdeaDetailActions idea={idea} />
        </div>
      </div>
    </div>
  );
}
```

### Feature Barrel Export Update

```typescript
// src/features/ideas/index.ts
// Types
export * from './types';

// Services
export { ideaService } from './services/ideaService';

// Hooks
export { useIdea } from './hooks/useIdea';
export { useIdeas } from './hooks/useIdeas';
export { useSubmitIdea } from './hooks/useSubmitIdea';

// Query Keys
export { ideaQueryKeys } from './hooks/queryKeys';

// Components
export { IdeaCard } from './components/IdeaCard';
export { IdeaList, IdeaListSkeleton } from './components/IdeaList';
export { IdeaStatusBadge } from './components/IdeaStatusBadge';
export { IdeasEmptyState } from './components/IdeasEmptyState';
export { IdeasErrorState } from './components/IdeasErrorState';
export { IdeaDetailContent } from './components/IdeaDetailContent';
export { IdeaStatusInfo } from './components/IdeaStatusInfo';
export { IdeaDetailActions } from './components/IdeaDetailActions';
export { IdeaDetailSkeleton } from './components/IdeaDetailSkeleton';
export { IdeaNotFound } from './components/IdeaNotFound';
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Hook files | `camelCase` | `useIdea.ts` |
| Hook functions | `use` + `PascalCase` | `useIdea` |
| Component files | `PascalCase` | `IdeaDetailContent.tsx` |
| Component functions | `PascalCase` | `IdeaDetailContent` |
| Service methods | `camelCase` | `getIdeaById` |
| Route params | `camelCase` | `:id` |

### DaisyUI Component Classes Reference

| Element | Classes |
|---------|---------|
| Card container | `card bg-base-100 border border-base-200` |
| Card body | `card-body p-4` |
| Section background | `bg-base-200 rounded-box p-4` |
| Enhanced content | `bg-primary/10 rounded-box p-4 border border-primary/20` |
| Badge | `badge badge-primary badge-sm` |
| Button primary | `btn btn-primary` |
| Button ghost | `btn btn-ghost` |
| Alert error | `alert alert-error` |
| Divider | `divider my-2` |
| Grid layout | `grid grid-cols-1 lg:grid-cols-3 gap-6` |

### Anti-Patterns to AVOID

1. **DO NOT** fetch idea without checking for null - handle isNotFound properly
2. **DO NOT** hardcode route paths - use ROUTES constants
3. **DO NOT** parse ai_enhanced_content without null check and try-catch
4. **DO NOT** forget loading states - always show skeleton while loading
5. **DO NOT** forget accessibility - use semantic HTML and ARIA labels
6. **DO NOT** duplicate IdeaStatusBadge - reuse from Story 2.8
7. **DO NOT** forget responsive design - test on mobile viewport
8. **DO NOT** assume ai_enhanced_content structure - handle gracefully if malformed
9. **DO NOT** use inline styles - only DaisyUI/Tailwind classes
10. **DO NOT** forget error boundaries for component failures

### Dependencies on Previous Stories

- **Story 1.1 (Project Init):** React Query, React Router setup
- **Story 1.2 (Theme):** PassportCard DaisyUI theme
- **Story 1.3 (Supabase):** Database connection and ideas table
- **Story 1.8 (Protected Routes):** AuthenticatedLayout wraps this page
- **Story 2.1 (Ideas DB):** ideas table schema and RLS policies
- **Story 2.5 (AI Enhancement):** ai_enhanced_content JSON structure
- **Story 2.7 (Submit Idea):** ideaService pattern, types
- **Story 2.8 (Ideas List):** IdeaStatusBadge component (REUSE), queryKeys

### Dependencies for Future Stories

- **Story 3.2 (PRD Builder):** "Build PRD" button navigates to PRD builder
- **Story 5.6 (Admin View):** Admin version will view any user's idea detail

### AI Enhanced Content Structure

From Story 2.5/2.6, the `ai_enhanced_content` field stores JSON:

```typescript
interface EnhancedContent {
  problem?: string;
  solution?: string;
  impact?: string;
}
```

**Safe parsing pattern:**
```typescript
function parseEnhancedContent(content: string | null): EnhancedContent | null {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    console.warn('Failed to parse ai_enhanced_content');
    return null;
  }
}
```

### Data Flow

```
User clicks IdeaCard in MyIdeasPage
  → Navigate to /ideas/:id
    → IdeaDetailPage renders
      → useIdea hook initializes with id param
        → React Query executes queryFn
          → ideaService.getIdeaById(id)
            → Supabase query with RLS filter
              → Returns idea or null
                → Query cache populated
                  → Conditional rendering:
                    - isLoading → IdeaDetailSkeleton
                    - isNotFound → IdeaNotFound
                    - error → Error alert
                    - idea → IdeaDetailContent + IdeaStatusInfo + IdeaDetailActions
```

### Testing Checklist

- [ ] Detail page loads with correct idea data
- [ ] Problem, solution, impact sections display correctly
- [ ] AI enhanced content shows when available
- [ ] AI enhanced content hidden when null
- [ ] Status badge displays with correct color
- [ ] Next step message matches status
- [ ] Submission date formatted correctly
- [ ] Updated date shows only if different from created
- [ ] "Build PRD" button visible when status is "approved"
- [ ] "Build PRD" button hidden for other statuses
- [ ] "Build PRD" navigates to `/prd/:ideaId`
- [ ] "Back to My Ideas" navigates to `/ideas`
- [ ] Skeleton displays during loading
- [ ] "Not Found" displays for invalid ID
- [ ] Error alert displays on fetch failure
- [ ] Responsive layout works on mobile
- [ ] Page is accessible via keyboard navigation

### UI/UX Requirements (from UX Design)

- Clear visual hierarchy: title prominent, status visible
- Enhanced content should be visually distinct but not overwhelming
- "Build PRD" button should be the primary CTA when visible
- Empty/error states should be friendly, not scary
- Loading skeleton should match final layout structure
- Desktop: two-column layout (content left, sidebar right)
- Mobile: stacked layout (status first, then content)
- Use PassportCard red (#E10514) for primary actions

### Performance Considerations

- React Query staleTime of 5 minutes reduces refetches
- Single idea fetch is lightweight
- Skeleton prevents layout shift
- No pagination needed (single item)

### Security Considerations

- All data access through Supabase RLS
- User can only view their own ideas (RLS policy enforces)
- ID parameter sanitized by Supabase
- No sensitive data exposed in URL

### Project Structure Notes

- First detail/single-item view in ideas feature
- Sets pattern for PRD detail, prototype detail views
- Components designed for reuse (IdeaStatusInfo, IdeaDetailActions)
- Two-column responsive layout pattern for detail pages

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.9]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/implementation-artifacts/2-8-my-ideas-list-view.md]
- [Source: _bmad-output/implementation-artifacts/2-5-idea-wizard-step-4-review-and-ai-enhancement.md]
- [Source: src/features/ideas/types.ts]
- [Source: src/routes/routeConstants.ts]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (via Cursor)

### Debug Log References

- All tests passed: 538 tests across 41 test files
- No linting errors
- Followed red-green-refactor cycle for useIdea hook
- Database fields use snake_case (problem, solution, impact, enhanced_problem, etc.)
- ideaService.getIdeaById already existed from previous story

### Completion Notes List

**Story 2.9: Idea Detail View - COMPLETE**

✅ **Task 1-2: Data Layer**
- Created `useIdea` hook with comprehensive tests (15 tests, all passing)
- Hook handles: loading, error, not-found, and success states
- Leveraged existing `ideaService.getIdeaById` method
- Query keys already existed in `useSubmitIdea.ts`

✅ **Task 3-7: UI Components**
- `IdeaDetailContent`: Displays problem/solution/impact with AI-enhanced versions
- `IdeaStatusInfo`: Shows status badge, next steps, and timestamps (AC 3-5)
- `IdeaDetailActions`: Build PRD button (approved only) + back navigation (AC 6-7, 10)
- `IdeaDetailSkeleton`: Loading state matching final layout (AC 8)
- `IdeaNotFound`: User-friendly not found state (AC 9)

✅ **Task 8-10: Page & Routing**
- Created `IdeaDetailPage` composing all components
- Added route `/ideas/:id` to router configuration
- Updated feature barrel exports for all new components/hooks

✅ **Task 11: Testing**
- `useIdea.test.tsx`: 15 tests covering all hook scenarios
- `IdeaDetailContent.test.tsx`: 11 tests for content display and AI enhancements
- `IdeaStatusInfo.test.tsx`: 13 tests for status messages and timestamps
- `IdeaDetailActions.test.tsx`: 12 tests for button visibility and navigation
- All tests passing, no regressions

**Technical Decisions:**
- Database fields are `problem`, `solution`, `impact` (not `problem_statement`, etc.)
- Enhanced fields: `enhanced_problem`, `enhanced_solution`, `enhanced_impact`
- Used existing `IdeaStatusBadge` component from Story 2.8 (reuse)
- Two-column responsive layout: content (2/3) + sidebar (1/3) on desktop
- Status next step messages per AC 5 requirements

**Acceptance Criteria Coverage:**
- AC 1-2: ✅ Full content display with original and enhanced versions
- AC 3-5: ✅ Status badge, timestamps, next step messages
- AC 6-7: ✅ Build PRD button (approved only) with navigation
- AC 8: ✅ Skeleton loading state
- AC 9: ✅ Error and not-found states
- AC 10: ✅ Back to My Ideas navigation

### File List

**New Files:**
- src/features/ideas/hooks/useIdea.ts
- src/features/ideas/hooks/useIdea.test.tsx
- src/features/ideas/components/IdeaDetailContent.tsx
- src/features/ideas/components/IdeaDetailContent.test.tsx
- src/features/ideas/components/IdeaStatusInfo.tsx
- src/features/ideas/components/IdeaStatusInfo.test.tsx
- src/features/ideas/components/IdeaDetailActions.tsx
- src/features/ideas/components/IdeaDetailActions.test.tsx
- src/features/ideas/components/IdeaDetailSkeleton.tsx
- src/features/ideas/components/IdeaNotFound.tsx
- src/pages/IdeaDetailPage.tsx

**Modified Files:**
- src/features/ideas/hooks/index.ts (added useIdea export)
- src/features/ideas/index.ts (added detail view component exports)
- src/routes/index.tsx (added IDEA_DETAIL route)
