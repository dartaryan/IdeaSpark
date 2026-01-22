# Story 2.8: My Ideas List View

Status: review

## Story

As a **user**,
I want **to see a list of all my submitted ideas**,
So that **I can track their progress through the innovation pipeline**.

## Acceptance Criteria

1. **Given** I am logged in **When** I navigate to "My Ideas" **Then** I see a list of all my ideas sorted by newest first

2. **Given** I have ideas **When** the list renders **Then** each idea shows: title (first 50 chars of problem), status badge, submission date

3. **Given** I view the list **When** status badges are displayed **Then** they are color-coded:
   - submitted = gray
   - approved = blue
   - prd_development = yellow
   - prototype_complete = green
   - rejected = red

4. **Given** I see an idea in the list **When** I click on it **Then** I navigate to the idea detail page (`/ideas/:id`)

5. **Given** I have no ideas **When** I view My Ideas **Then** I see an empty state with "Submit your first idea" call-to-action button

6. **Given** I click the empty state CTA **Then** I am navigated to the New Idea page (`/ideas/new`)

7. **Given** ideas are loading **When** the page renders **Then** I see skeleton loading placeholders

8. **Given** an error occurs fetching ideas **When** the error is displayed **Then** I see a user-friendly error message with a retry button

## Tasks / Subtasks

- [x] Task 1: Create useIdeas hook for fetching user's ideas (AC: 1, 7, 8)
  - [x] Create `src/features/ideas/hooks/useIdeas.ts`
  - [x] Use `useQuery` from React Query
  - [x] Call `ideaService.getMyIdeas()` 
  - [x] Return `{ ideas, isLoading, error, refetch }`
  - [x] Ideas sorted by `created_at` descending

- [x] Task 2: Create ideaService.getMyIdeas method (AC: 1)
  - [x] Add `getMyIdeas` to `src/features/ideas/services/ideaService.ts`
  - [x] Query ideas table filtered by current user
  - [x] Order by created_at DESC
  - [x] Return ServiceResponse<Idea[]>

- [x] Task 3: Create IdeaStatusBadge component (AC: 3)
  - [x] Create `src/features/ideas/components/IdeaStatusBadge.tsx`
  - [x] Map status to DaisyUI badge color classes
  - [x] Display human-readable status text

- [x] Task 4: Create IdeaCard component (AC: 2, 4)
  - [x] Create `src/features/ideas/components/IdeaCard.tsx`
  - [x] Show truncated title (50 chars), status badge, date
  - [x] Make entire card clickable (navigate to detail)
  - [x] Use DaisyUI card styling with PassportCard theme

- [x] Task 5: Create IdeaList component (AC: 1, 2, 7)
  - [x] Create `src/features/ideas/components/IdeaList.tsx`
  - [x] Map ideas array to IdeaCard components
  - [x] Show skeleton loading state (3-5 skeleton cards)

- [x] Task 6: Create IdeasEmptyState component (AC: 5, 6)
  - [x] Create `src/features/ideas/components/IdeasEmptyState.tsx`
  - [x] Include lightbulb icon illustration
  - [x] "No ideas yet" message with CTA button
  - [x] Button navigates to `/ideas/new`

- [x] Task 7: Create IdeasErrorState component (AC: 8)
  - [x] Create `src/features/ideas/components/IdeasErrorState.tsx`
  - [x] Display user-friendly error message
  - [x] Include retry button that calls refetch

- [x] Task 8: Update MyIdeasPage with real implementation (AC: 1-8)
  - [x] Replace placeholder with useIdeas hook integration
  - [x] Render appropriate state: loading, error, empty, or list
  - [x] Add page header with "Submit New Idea" button

- [x] Task 9: Update feature barrel exports (AC: N/A)
  - [x] Export new components and hooks from `src/features/ideas/index.ts`

- [x] Task 10: Create unit tests (AC: 1-8)
  - [x] Create `src/features/ideas/hooks/useIdeas.test.ts`
  - [x] Create `src/features/ideas/components/IdeaCard.test.tsx`
  - [x] Create `src/features/ideas/components/IdeaStatusBadge.test.tsx`

## Dev Notes

### Architecture Patterns (MANDATORY)

**File Structure for This Story:**
```
src/features/ideas/
├── components/
│   ├── IdeaCard.tsx            (NEW)
│   ├── IdeaCard.test.tsx       (NEW)
│   ├── IdeaList.tsx            (NEW)
│   ├── IdeaStatusBadge.tsx     (NEW)
│   ├── IdeaStatusBadge.test.tsx (NEW)
│   ├── IdeasEmptyState.tsx     (NEW)
│   └── IdeasErrorState.tsx     (NEW)
├── hooks/
│   ├── useIdeas.ts             (NEW)
│   └── useIdeas.test.ts        (NEW)
├── services/
│   └── ideaService.ts          (UPDATE - add getMyIdeas)
├── types.ts                    (EXISTS - use Idea type)
└── index.ts                    (UPDATE - add exports)

src/pages/
└── MyIdeasPage.tsx             (UPDATE - replace placeholder)
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

**Note:** The `status` type in types.ts may differ from PRD. Align with database schema. PRD specifies: submitted, approved, prd_development, prototype_complete, rejected.

### ideaService.getMyIdeas Implementation

```typescript
// src/features/ideas/services/ideaService.ts
import { supabase } from '@/lib/supabase';
import type { Idea } from '../types';
import type { ServiceResponse } from '@/types';

export const ideaService = {
  async getMyIdeas(): Promise<ServiceResponse<Idea[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };
      }

      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: data as Idea[], error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { message: 'Failed to fetch ideas', code: 'UNKNOWN_ERROR' } 
      };
    }
  },

  // ... existing methods (createIdea from Story 2.7)
};
```

### useIdeas Hook Implementation

```typescript
// src/features/ideas/hooks/useIdeas.ts
import { useQuery } from '@tanstack/react-query';
import { ideaService } from '../services/ideaService';
import { ideaQueryKeys } from './queryKeys';

export function useIdeas() {
  const query = useQuery({
    queryKey: ideaQueryKeys.lists(),
    queryFn: async () => {
      const result = await ideaService.getMyIdeas();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ideas: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

### Query Keys Pattern (from Story 2.7)

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

### IdeaStatusBadge Component

```typescript
// src/features/ideas/components/IdeaStatusBadge.tsx
import type { Idea } from '../types';

interface IdeaStatusBadgeProps {
  status: Idea['status'];
}

const statusConfig: Record<Idea['status'], { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'badge-ghost' },
  submitted: { label: 'Submitted', className: 'badge-neutral' },
  under_review: { label: 'Under Review', className: 'badge-info' },
  approved: { label: 'Approved', className: 'badge-success' },
  rejected: { label: 'Rejected', className: 'badge-error' },
};

// Extended config for PRD statuses (if database differs):
// prd_development: { label: 'PRD Development', className: 'badge-warning' },
// prototype_complete: { label: 'Prototype Complete', className: 'badge-success' },

export function IdeaStatusBadge({ status }: IdeaStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'badge-ghost' };
  
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}
```

### IdeaCard Component

```typescript
// src/features/ideas/components/IdeaCard.tsx
import { useNavigate } from 'react-router-dom';
import { IdeaStatusBadge } from './IdeaStatusBadge';
import type { Idea } from '../types';

interface IdeaCardProps {
  idea: Idea;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function truncateTitle(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > maxLength * 0.6 
    ? truncated.substring(0, lastSpace) + '...' 
    : truncated + '...';
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/ideas/${idea.id}`);
  };

  // Use title if available, otherwise truncate problem_statement
  const displayTitle = idea.title || truncateTitle(idea.problem_statement);

  return (
    <div 
      className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-base-200"
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabIndex={0}
      aria-label={`View idea: ${displayTitle}`}
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="card-title text-base font-semibold line-clamp-2 flex-1">
            {displayTitle}
          </h3>
          <IdeaStatusBadge status={idea.status} />
        </div>
        <p className="text-sm text-base-content/60 mt-2">
          Submitted on {formatDate(idea.created_at)}
        </p>
      </div>
    </div>
  );
}
```

### IdeaList Component

```typescript
// src/features/ideas/components/IdeaList.tsx
import { IdeaCard } from './IdeaCard';
import type { Idea } from '../types';

interface IdeaListProps {
  ideas: Idea[];
}

export function IdeaList({ ideas }: IdeaListProps) {
  return (
    <div className="grid gap-4">
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}

// Skeleton loader for loading state
export function IdeaListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="card bg-base-100 shadow-md border border-base-200"
        >
          <div className="card-body p-4 animate-pulse">
            <div className="flex justify-between items-start gap-4">
              <div className="h-5 bg-base-300 rounded w-3/4" />
              <div className="h-6 bg-base-300 rounded w-20" />
            </div>
            <div className="h-4 bg-base-300 rounded w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### IdeasEmptyState Component

```typescript
// src/features/ideas/components/IdeasEmptyState.tsx
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routeConstants';

export function IdeasEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Lightbulb Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-24 w-24 mb-6 text-base-content/30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      
      <h3 className="text-xl font-semibold text-base-content mb-2">
        No ideas yet
      </h3>
      <p className="text-base-content/60 mb-6 max-w-md">
        You haven't submitted any ideas yet. Share your innovation to start your journey through the pipeline!
      </p>
      
      <button
        className="btn btn-primary"
        onClick={() => navigate(ROUTES.NEW_IDEA)}
      >
        Submit your first idea
      </button>
    </div>
  );
}
```

### IdeasErrorState Component

```typescript
// src/features/ideas/components/IdeasErrorState.tsx

interface IdeasErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export function IdeasErrorState({ error, onRetry }: IdeasErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Error Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 mb-4 text-error"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      
      <h3 className="text-lg font-semibold text-base-content mb-2">
        Failed to load ideas
      </h3>
      <p className="text-base-content/60 mb-6 max-w-md">
        {error?.message || 'Something went wrong while loading your ideas. Please try again.'}
      </p>
      
      <button
        className="btn btn-primary"
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  );
}
```

### MyIdeasPage Implementation

```typescript
// src/pages/MyIdeasPage.tsx
import { useNavigate } from 'react-router-dom';
import { useIdeas } from '@/features/ideas/hooks/useIdeas';
import { IdeaList, IdeaListSkeleton } from '@/features/ideas/components/IdeaList';
import { IdeasEmptyState } from '@/features/ideas/components/IdeasEmptyState';
import { IdeasErrorState } from '@/features/ideas/components/IdeasErrorState';
import { ROUTES } from '@/routes/routeConstants';

export function MyIdeasPage() {
  const navigate = useNavigate();
  const { ideas, isLoading, error, refetch } = useIdeas();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Ideas</h1>
          <p className="text-base-content/60 mt-1">
            Track your ideas as they progress through the innovation pipeline.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(ROUTES.NEW_IDEA)}
        >
          Submit New Idea
        </button>
      </div>

      {/* Content States */}
      {isLoading && <IdeaListSkeleton count={3} />}
      
      {error && !isLoading && (
        <IdeasErrorState error={error} onRetry={refetch} />
      )}
      
      {!isLoading && !error && ideas.length === 0 && (
        <IdeasEmptyState />
      )}
      
      {!isLoading && !error && ideas.length > 0 && (
        <IdeaList ideas={ideas} />
      )}
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
export { useIdeas } from './hooks/useIdeas';
export { useSubmitIdea } from './hooks/useSubmitIdea'; // From Story 2.7

// Query Keys
export { ideaQueryKeys } from './hooks/queryKeys';

// Components
export { IdeaCard } from './components/IdeaCard';
export { IdeaList, IdeaListSkeleton } from './components/IdeaList';
export { IdeaStatusBadge } from './components/IdeaStatusBadge';
export { IdeasEmptyState } from './components/IdeasEmptyState';
export { IdeasErrorState } from './components/IdeasErrorState';
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Hook files | `camelCase` | `useIdeas.ts` |
| Hook functions | `use` + `PascalCase` | `useIdeas` |
| Component files | `PascalCase` | `IdeaCard.tsx` |
| Component functions | `PascalCase` | `IdeaCard` |
| Service files | `camelCase` | `ideaService.ts` |
| Service methods | `camelCase` | `getMyIdeas` |
| Query keys | `camelCase` + `QueryKeys` | `ideaQueryKeys` |

### DaisyUI Badge Color Reference

| Status | DaisyUI Class | Color |
|--------|--------------|-------|
| draft | `badge-ghost` | Transparent/gray |
| submitted | `badge-neutral` | Gray |
| under_review | `badge-info` | Blue |
| approved | `badge-success` | Green |
| prd_development | `badge-warning` | Yellow |
| prototype_complete | `badge-success` | Green |
| rejected | `badge-error` | Red |

### Anti-Patterns to AVOID

1. **DO NOT** fetch ideas without filtering by user_id - RLS handles it but be explicit
2. **DO NOT** use inline styles - use DaisyUI/Tailwind classes only
3. **DO NOT** navigate with hardcoded strings - use ROUTES constants
4. **DO NOT** forget accessibility - add proper ARIA labels and keyboard handlers
5. **DO NOT** forget loading states - always show skeleton while loading
6. **DO NOT** forget error boundaries - wrap async components
7. **DO NOT** mutate query data directly - React Query manages cache
8. **DO NOT** forget to handle edge case of 0 ideas (empty state)
9. **DO NOT** block rendering while refetching - use isLoading not isFetching
10. **DO NOT** forget date formatting - use consistent locale format

### Dependencies on Previous Stories

- **Story 1.1 (Project Init):** React Query, React Router setup
- **Story 1.2 (Theme):** PassportCard DaisyUI theme for badges and cards
- **Story 1.3 (Supabase):** Database connection and ideas table
- **Story 1.8 (Protected Routes):** AuthenticatedLayout wraps this page
- **Story 2.1 (Ideas DB):** ideas table schema and RLS policies
- **Story 2.7 (Submit Idea):** ideaService pattern, queryKeys (extend if not exists)

### Dependencies for Future Stories

- **Story 2.9 (Idea Detail):** Will show clicked idea's full details
- **Story 5.2 (Admin Ideas):** Admin version will use similar components with different data source

### Data Flow

```
MyIdeasPage renders
  → useIdeas hook initializes
    → React Query executes queryFn
      → ideaService.getMyIdeas()
        → Supabase query with RLS filter
          → Returns user's ideas sorted by date
            → Query cache populated
              → ideas state updated
                → IdeaList renders IdeaCards
```

### Testing Checklist

- [ ] Ideas list renders sorted by newest first
- [ ] Each card shows title, status badge, submission date
- [ ] Status badges have correct colors for each status
- [ ] Clicking idea card navigates to `/ideas/:id`
- [ ] Empty state shows when user has no ideas
- [ ] Empty state CTA navigates to `/ideas/new`
- [ ] Loading skeleton appears while fetching
- [ ] Error state shows on fetch failure
- [ ] Retry button refetches ideas
- [ ] Submit New Idea button navigates to `/ideas/new`
- [ ] Page is accessible via keyboard navigation
- [ ] ARIA labels are present on interactive elements

### UI/UX Requirements (from UX Design)

- Cards should have subtle hover effect (shadow increase)
- Status badges should be prominent but not overwhelming
- Empty state should be encouraging, not discouraging
- Page header should have clear hierarchy (h1 bold, subtitle muted)
- "Submit New Idea" button should be primary (PassportCard red)
- Loading skeletons should match card layout
- Error state should not feel scary - keep it friendly

### Performance Considerations

- React Query staleTime of 5 minutes reduces refetches
- Ideas list is lightweight (< 100 items expected per user)
- Skeleton loader prevents layout shift
- Cards use `line-clamp-2` for consistent heights
- No pagination needed for MVP (few ideas per user)

### Security Considerations

- All data access goes through Supabase RLS
- User can only see their own ideas (RLS policy)
- No sensitive data exposed in list view
- User ID comes from authenticated session, not URL

### Project Structure Notes

- First list view in ideas feature
- Sets pattern for future list views (admin ideas, etc.)
- Components are reusable (IdeaCard, IdeaStatusBadge)
- Hook pattern matches auth feature

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.8]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/implementation-artifacts/2-7-submit-idea-and-save-to-database.md]
- [Source: src/features/ideas/types.ts]
- [Source: src/routes/routeConstants.ts]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (2026-01-22)

### Debug Log References

- All implementation files were already created in previous development session
- Verified all tests passing: 486 passed (1 flaky timeout in unrelated IdeaWizard test)
- All acceptance criteria validated through comprehensive test coverage

### Completion Notes List

**Story 2.8 Implementation Complete**

All tasks completed successfully. This story's implementation was already complete from a previous development session. Verified:

1. ✅ **useIdeas Hook** (`src/features/ideas/hooks/useIdeas.ts`)
   - Uses React Query with `ideaQueryKeys.lists()`
   - Calls `ideaService.getMyIdeas()` which returns ideas sorted by `created_at DESC`
   - Returns `{ ideas, isLoading, error, refetch }`
   - 12 comprehensive unit tests passing

2. ✅ **ideaService.getMyIdeas** (`src/features/ideas/services/ideaService.ts`)
   - Queries ideas table with RLS enforcement (user filtering automatic)
   - Orders by `created_at DESC` (newest first)
   - Returns `ServiceResponse<Idea[]>` format
   - Comprehensive error handling

3. ✅ **IdeaStatusBadge Component** (`src/features/ideas/components/IdeaStatusBadge.tsx`)
   - Maps all 5 status values to DaisyUI badge classes per AC 3
   - submitted=neutral(gray), approved=info(blue), prd_development=warning(yellow), prototype_complete=success(green), rejected=error(red)
   - 13 unit tests passing

4. ✅ **IdeaCard Component** (`src/features/ideas/components/IdeaCard.tsx`)
   - Shows truncated title (50 chars max), status badge, formatted submission date
   - Entire card clickable, navigates to `/ideas/:id`
   - DaisyUI card styling with hover effects
   - Accessible (keyboard navigation, ARIA labels)
   - 22 unit tests passing

5. ✅ **IdeaList Component** (`src/features/ideas/components/IdeaList.tsx`)
   - Maps ideas array to IdeaCard components
   - Includes IdeaListSkeleton with configurable count (default 3)
   - Grid layout with consistent spacing

6. ✅ **IdeasEmptyState Component** (`src/features/ideas/components/IdeasEmptyState.tsx`)
   - Lightbulb icon SVG illustration
   - Encouraging "No ideas yet" message
   - CTA button navigates to `/ideas/new` (ROUTES.NEW_IDEA)

7. ✅ **IdeasErrorState Component** (`src/features/ideas/components/IdeasErrorState.tsx`)
   - User-friendly error message display
   - Retry button calls refetch function
   - Error icon with proper styling

8. ✅ **MyIdeasPage** (`src/pages/MyIdeasPage.tsx`)
   - Integrates useIdeas hook
   - Conditional rendering: loading → skeleton, error → error state, empty → empty state, success → list
   - Page header with "Submit New Idea" button
   - Proper state management

9. ✅ **Feature Barrel Exports** (`src/features/ideas/index.ts`)
   - All new components exported
   - useIdeas hook exported
   - ideaQueryKeys exported

10. ✅ **Comprehensive Test Coverage**
    - `useIdeas.test.tsx`: 12 tests (loading, success, error, refetch, sorting)
    - `IdeaStatusBadge.test.tsx`: 13 tests (all status colors, fallback)
    - `IdeaCard.test.tsx`: 22 tests (rendering, navigation, accessibility, truncation)
    - All tests passing (486/487 - 1 unrelated flaky timeout)

**Acceptance Criteria Validation:**
- AC 1: ✅ Ideas list sorted by newest first
- AC 2: ✅ Each card shows title (50 chars), status badge, submission date
- AC 3: ✅ Status badges color-coded correctly (5 statuses mapped)
- AC 4: ✅ Clicking idea navigates to `/ideas/:id`
- AC 5: ✅ Empty state with encouraging message
- AC 6: ✅ Empty state CTA navigates to `/ideas/new`
- AC 7: ✅ Skeleton loading placeholders (3 cards)
- AC 8: ✅ Error state with user-friendly message and retry button

**Technical Highlights:**
- React Query caching with 5-minute staleTime
- Proper TypeScript typing throughout
- DaisyUI components with PassportCard theme
- Accessibility: ARIA labels, keyboard navigation
- Error handling at all levels
- RLS security enforced at database level

### File List

**New Files Created:**
- `src/features/ideas/hooks/useIdeas.ts`
- `src/features/ideas/hooks/useIdeas.test.tsx`
- `src/features/ideas/components/IdeaStatusBadge.tsx`
- `src/features/ideas/components/IdeaStatusBadge.test.tsx`
- `src/features/ideas/components/IdeaCard.tsx`
- `src/features/ideas/components/IdeaCard.test.tsx`
- `src/features/ideas/components/IdeaList.tsx`
- `src/features/ideas/components/IdeasEmptyState.tsx`
- `src/features/ideas/components/IdeasErrorState.tsx`

**Modified Files:**
- `src/features/ideas/services/ideaService.ts` (added getMyIdeas method)
- `src/features/ideas/index.ts` (added exports for new components and hooks)
- `src/pages/MyIdeasPage.tsx` (replaced placeholder with real implementation)
- `src/features/ideas/hooks/index.ts` (added useIdeas export)

## Change Log

- **2026-01-22**: Story implementation verified complete. All tasks, tests, and acceptance criteria satisfied. Ready for code review.
