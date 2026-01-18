# Story 3.2: PRD Builder Page Layout

Status: ready-for-dev

## Story

As a **user**,
I want **a dedicated PRD building interface with chat and document preview**,
So that **I can see my PRD being built as I chat with the AI**.

## Acceptance Criteria

1. **Given** I have an approved idea and click "Build PRD" **When** the PRD Builder page loads **Then** I see a split-screen layout: chat interface on the left, PRD preview on the right

2. **Given** the PRD Builder page loads **When** I view the PRD preview panel **Then** I see empty section placeholders for all 7 PRD sections: Problem Statement, Goals & Metrics, User Stories, Requirements, Technical Considerations, Risks, Timeline

3. **Given** the PRD Builder page loads **When** I view the page header **Then** I see my original idea summary at the top for context (problem, solution, impact)

4. **Given** I am on a mobile device **When** the PRD Builder page loads **Then** the layout stacks vertically (chat on top, PRD preview below or tabbed)

5. **Given** I navigate to the PRD Builder for an idea **When** no PRD exists yet **Then** a new PRD document is created in draft status automatically

6. **Given** I navigate to the PRD Builder for an idea **When** a draft PRD already exists **Then** the existing PRD is loaded (resume functionality)

7. **Given** the page is loading (fetching idea or PRD) **When** the page renders **Then** I see appropriate skeleton loading placeholders

8. **Given** the idea is not found or not approved **When** the error is displayed **Then** I see a user-friendly error message with navigation options

9. **Given** I am on the PRD Builder page **When** I want to go back **Then** I can navigate back to the idea detail page

10. **Given** the page loads successfully **When** I view the chat panel **Then** I see a placeholder chat interface ready for messaging (Story 3.4 will implement full chat)

## Tasks / Subtasks

- [ ] Task 1: Create usePrdBuilder hook for PRD initialization and management (AC: 5, 6, 7, 8)
  - [ ] Create `src/features/prd/hooks/usePrdBuilder.ts`
  - [ ] Use `useQuery` from React Query to fetch idea by ID
  - [ ] Use `useQuery` to check if PRD exists for idea
  - [ ] Use `useMutation` to create PRD if not exists
  - [ ] Return `{ idea, prd, isLoading, error, isIdeaNotApproved }`
  - [ ] Auto-create PRD on first load if approved idea has no PRD

- [ ] Task 2: Create PrdBuilderLayout component (AC: 1, 4)
  - [ ] Create `src/features/prd/components/PrdBuilder/PrdBuilderLayout.tsx`
  - [ ] Implement split-screen layout: chat (left), preview (right)
  - [ ] Use CSS Grid or Flexbox for two-column layout
  - [ ] Add responsive breakpoints (stacked on mobile lg:grid-cols-2)
  - [ ] Include resizable panel divider (optional, can defer)

- [ ] Task 3: Create IdeaSummaryHeader component (AC: 3)
  - [ ] Create `src/features/prd/components/PrdBuilder/IdeaSummaryHeader.tsx`
  - [ ] Display idea title (truncated problem statement)
  - [ ] Show collapsible/expandable idea details (problem, solution, impact)
  - [ ] Include back navigation to idea detail page
  - [ ] Use PassportCard DaisyUI theme styling

- [ ] Task 4: Create PrdPreviewPanel component (AC: 2)
  - [ ] Create `src/features/prd/components/PrdBuilder/PrdPreviewPanel.tsx`
  - [ ] Render all 7 PRD sections with empty placeholders
  - [ ] Use PRD_SECTION_KEYS and PRD_SECTION_LABELS from types
  - [ ] Show section status indicators (empty, in_progress, complete)
  - [ ] Make sections visually distinct and scrollable

- [ ] Task 5: Create PrdSectionCard component (AC: 2)
  - [ ] Create `src/features/prd/components/PrdSection.tsx`
  - [ ] Display section title, status badge, content
  - [ ] Handle empty state with placeholder text
  - [ ] Support future highlighting of newly updated sections
  - [ ] Use DaisyUI card styling

- [ ] Task 6: Create ChatPanelPlaceholder component (AC: 10)
  - [ ] Create `src/features/prd/components/PrdBuilder/ChatPanelPlaceholder.tsx`
  - [ ] Display chat interface skeleton/placeholder
  - [ ] Show welcome message area
  - [ ] Include disabled message input field
  - [ ] Note: Full implementation in Story 3.4

- [ ] Task 7: Create PrdBuilderSkeleton component (AC: 7)
  - [ ] Create `src/features/prd/components/PrdBuilder/PrdBuilderSkeleton.tsx`
  - [ ] Match layout of PrdBuilderLayout
  - [ ] Use DaisyUI skeleton classes
  - [ ] Skeleton for header, chat panel, preview panel

- [ ] Task 8: Create PrdBuilderError component (AC: 8)
  - [ ] Create `src/features/prd/components/PrdBuilder/PrdBuilderError.tsx`
  - [ ] Handle "idea not found" scenario
  - [ ] Handle "idea not approved" scenario
  - [ ] Handle generic error scenario
  - [ ] Include navigation back to ideas list

- [ ] Task 9: Create PrdBuilderPage (AC: 1-10)
  - [ ] Create `src/pages/PrdBuilderPage.tsx`
  - [ ] Use useParams to get idea ID from URL
  - [ ] Integrate usePrdBuilder hook
  - [ ] Render appropriate state: loading, error, or content
  - [ ] Compose all PrdBuilder components

- [ ] Task 10: Add route for PRD Builder page (AC: 9)
  - [ ] Add route for `/prd/:id` in routes configuration
  - [ ] Import and configure PrdBuilderPage component
  - [ ] Ensure route is protected (requires auth)

- [ ] Task 11: Create prd query keys (AC: 5, 6)
  - [ ] Create `src/features/prd/hooks/queryKeys.ts`
  - [ ] Define query keys: all, byIdea, detail
  - [ ] Follow pattern from ideaQueryKeys

- [ ] Task 12: Update feature barrel exports
  - [ ] Export new components from `src/features/prd/index.ts`
  - [ ] Export new hooks

## Dev Notes

### Architecture Patterns (MANDATORY)

**File Structure for This Story:**
```
src/features/prd/
├── components/
│   ├── PrdBuilder/
│   │   ├── PrdBuilderLayout.tsx      (NEW)
│   │   ├── IdeaSummaryHeader.tsx     (NEW)
│   │   ├── PrdPreviewPanel.tsx       (NEW)
│   │   ├── ChatPanelPlaceholder.tsx  (NEW)
│   │   ├── PrdBuilderSkeleton.tsx    (NEW)
│   │   ├── PrdBuilderError.tsx       (NEW)
│   │   └── index.ts                  (NEW)
│   ├── PrdSection.tsx                (NEW)
│   └── index.ts                      (UPDATE)
├── hooks/
│   ├── usePrdBuilder.ts              (NEW)
│   ├── queryKeys.ts                  (NEW)
│   └── index.ts                      (NEW)
├── services/
│   ├── prdService.ts                 (FROM 3.1)
│   ├── prdMessageService.ts          (FROM 3.1)
│   └── index.ts                      (FROM 3.1)
├── types.ts                          (FROM 3.1 - use existing)
└── index.ts                          (UPDATE)

src/pages/
└── PrdBuilderPage.tsx                (NEW)

src/routes/
└── index.tsx                         (UPDATE - add route)
```

### PRD Section Constants (from Story 3.1)

```typescript
// Already defined in src/features/prd/types.ts
export const PRD_SECTION_KEYS = [
  'problemStatement',
  'goalsAndMetrics',
  'userStories',
  'requirements',
  'technicalConsiderations',
  'risks',
  'timeline',
] as const;

export type PrdSectionKey = typeof PRD_SECTION_KEYS[number];

export const PRD_SECTION_LABELS: Record<PrdSectionKey, string> = {
  problemStatement: 'Problem Statement',
  goalsAndMetrics: 'Goals & Metrics',
  userStories: 'User Stories',
  requirements: 'Requirements',
  technicalConsiderations: 'Technical Considerations',
  risks: 'Risks',
  timeline: 'Timeline',
};
```

### PRD Query Keys

```typescript
// src/features/prd/hooks/queryKeys.ts
export const prdQueryKeys = {
  all: ['prds'] as const,
  byIdea: (ideaId: string) => [...prdQueryKeys.all, 'byIdea', ideaId] as const,
  details: () => [...prdQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...prdQueryKeys.details(), id] as const,
};
```

### usePrdBuilder Hook Implementation

```typescript
// src/features/prd/hooks/usePrdBuilder.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ideaService } from '@/features/ideas/services/ideaService';
import { prdService } from '../services/prdService';
import { ideaQueryKeys } from '@/features/ideas/hooks/queryKeys';
import { prdQueryKeys } from './queryKeys';
import type { Idea } from '@/features/ideas/types';
import type { PrdDocument } from '../types';

interface UsePrdBuilderReturn {
  idea: Idea | null;
  prd: PrdDocument | null;
  isLoading: boolean;
  error: Error | null;
  isIdeaNotFound: boolean;
  isIdeaNotApproved: boolean;
  isCreatingPrd: boolean;
}

export function usePrdBuilder(ideaId: string | undefined): UsePrdBuilderReturn {
  const queryClient = useQueryClient();

  // Fetch the idea
  const ideaQuery = useQuery({
    queryKey: ideaQueryKeys.detail(ideaId ?? ''),
    queryFn: async () => {
      if (!ideaId) return null;
      const result = await ideaService.getIdeaById(ideaId);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    enabled: !!ideaId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch existing PRD for this idea
  const prdQuery = useQuery({
    queryKey: prdQueryKeys.byIdea(ideaId ?? ''),
    queryFn: async () => {
      if (!ideaId) return null;
      const result = await prdService.getPrdByIdeaId(ideaId);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    enabled: !!ideaId && ideaQuery.data?.status === 'approved',
    staleTime: 30 * 1000, // 30 seconds - PRD may change frequently
  });

  // Mutation to create PRD
  const createPrdMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      const result = await prdService.createPrd(ideaId);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: (newPrd) => {
      // Update cache with new PRD
      queryClient.setQueryData(prdQueryKeys.byIdea(ideaId ?? ''), newPrd);
    },
  });

  // Auto-create PRD if idea is approved but no PRD exists
  useEffect(() => {
    const shouldCreatePrd = 
      ideaId &&
      ideaQuery.data?.status === 'approved' &&
      !prdQuery.isLoading &&
      prdQuery.data === null &&
      !createPrdMutation.isPending &&
      !createPrdMutation.isSuccess;

    if (shouldCreatePrd) {
      createPrdMutation.mutate(ideaId);
    }
  }, [
    ideaId,
    ideaQuery.data?.status,
    prdQuery.isLoading,
    prdQuery.data,
    createPrdMutation.isPending,
    createPrdMutation.isSuccess,
  ]);

  const isIdeaNotFound = !ideaQuery.isLoading && !ideaQuery.error && ideaQuery.data === null;
  const isIdeaNotApproved = ideaQuery.data !== null && ideaQuery.data.status !== 'approved';

  return {
    idea: ideaQuery.data ?? null,
    prd: prdQuery.data ?? createPrdMutation.data ?? null,
    isLoading: ideaQuery.isLoading || (prdQuery.isLoading && ideaQuery.data?.status === 'approved'),
    error: ideaQuery.error ?? prdQuery.error ?? createPrdMutation.error ?? null,
    isIdeaNotFound,
    isIdeaNotApproved,
    isCreatingPrd: createPrdMutation.isPending,
  };
}
```

### PrdBuilderLayout Component

```typescript
// src/features/prd/components/PrdBuilder/PrdBuilderLayout.tsx
import type { ReactNode } from 'react';

interface PrdBuilderLayoutProps {
  chatPanel: ReactNode;
  previewPanel: ReactNode;
}

export function PrdBuilderLayout({ chatPanel, previewPanel }: PrdBuilderLayoutProps) {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4">
      {/* Chat Panel - Left side on desktop, top on mobile */}
      <div className="lg:w-1/2 h-1/2 lg:h-full flex flex-col border border-base-200 rounded-box bg-base-100">
        {chatPanel}
      </div>
      
      {/* Preview Panel - Right side on desktop, bottom on mobile */}
      <div className="lg:w-1/2 h-1/2 lg:h-full flex flex-col border border-base-200 rounded-box bg-base-100 overflow-hidden">
        {previewPanel}
      </div>
    </div>
  );
}
```

### IdeaSummaryHeader Component

```typescript
// src/features/prd/components/PrdBuilder/IdeaSummaryHeader.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routeConstants';
import type { Idea } from '@/features/ideas/types';

interface IdeaSummaryHeaderProps {
  idea: Idea;
}

export function IdeaSummaryHeader({ idea }: IdeaSummaryHeaderProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate display title from problem statement
  const displayTitle = idea.title || 
    idea.problem_statement.substring(0, 60) + (idea.problem_statement.length > 60 ? '...' : '');

  const handleBackClick = () => {
    navigate(ROUTES.IDEA_DETAIL.replace(':id', idea.id));
  };

  return (
    <div className="bg-base-100 border-b border-base-200 px-4 py-3">
      {/* Back button and title row */}
      <div className="flex items-center gap-3 mb-2">
        <button
          className="btn btn-ghost btn-sm btn-square"
          onClick={handleBackClick}
          aria-label="Back to idea"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
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
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">
            PRD: {displayTitle}
          </h1>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide Details' : 'Show Idea'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </button>
      </div>

      {/* Expandable idea details */}
      {isExpanded && (
        <div className="mt-3 p-3 bg-base-200 rounded-box space-y-3 text-sm">
          <div>
            <span className="font-medium text-base-content/70">Problem:</span>
            <p className="text-base-content mt-1">{idea.problem_statement}</p>
          </div>
          <div>
            <span className="font-medium text-base-content/70">Solution:</span>
            <p className="text-base-content mt-1">{idea.proposed_solution}</p>
          </div>
          <div>
            <span className="font-medium text-base-content/70">Impact:</span>
            <p className="text-base-content mt-1">{idea.expected_impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### PrdPreviewPanel Component

```typescript
// src/features/prd/components/PrdBuilder/PrdPreviewPanel.tsx
import { PrdSection } from '../PrdSection';
import { PRD_SECTION_KEYS, PRD_SECTION_LABELS } from '../../types';
import type { PrdDocument } from '../../types';

interface PrdPreviewPanelProps {
  prd: PrdDocument | null;
}

export function PrdPreviewPanel({ prd }: PrdPreviewPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-base-200 flex items-center justify-between">
        <h2 className="font-semibold">PRD Preview</h2>
        <div className="badge badge-outline">
          {prd?.status === 'complete' ? 'Complete' : 'Draft'}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {PRD_SECTION_KEYS.map((sectionKey) => {
          const section = prd?.content?.[sectionKey];
          return (
            <PrdSection
              key={sectionKey}
              title={PRD_SECTION_LABELS[sectionKey]}
              content={section?.content || ''}
              status={section?.status || 'empty'}
            />
          );
        })}
      </div>
    </div>
  );
}
```

### PrdSection Component

```typescript
// src/features/prd/components/PrdSection.tsx
import type { PrdSectionStatus } from '../types';

interface PrdSectionProps {
  title: string;
  content: string;
  status: PrdSectionStatus;
  isHighlighted?: boolean;
}

const statusConfig: Record<PrdSectionStatus, { badge: string; badgeClass: string }> = {
  empty: { badge: 'Empty', badgeClass: 'badge-ghost' },
  in_progress: { badge: 'In Progress', badgeClass: 'badge-warning' },
  complete: { badge: 'Complete', badgeClass: 'badge-success' },
};

export function PrdSection({ title, content, status, isHighlighted }: PrdSectionProps) {
  const { badge, badgeClass } = statusConfig[status];

  return (
    <div 
      className={`card bg-base-100 border transition-all duration-300 ${
        isHighlighted 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'border-base-200'
      }`}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-base">{title}</h3>
          <span className={`badge badge-sm ${badgeClass}`}>{badge}</span>
        </div>

        {/* Content */}
        {content ? (
          <div className="prose prose-sm max-w-none text-base-content/80">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        ) : (
          <p className="text-base-content/40 text-sm italic">
            This section will be filled as you chat with the AI assistant.
          </p>
        )}
      </div>
    </div>
  );
}
```

### ChatPanelPlaceholder Component

```typescript
// src/features/prd/components/PrdBuilder/ChatPanelPlaceholder.tsx

export function ChatPanelPlaceholder() {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-base-200">
        <h2 className="font-semibold">AI Assistant</h2>
        <p className="text-sm text-base-content/60">Build your PRD through conversation</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Welcome Message Placeholder */}
        <div className="chat chat-start">
          <div className="chat-bubble chat-bubble-primary">
            <p className="font-medium mb-2">Welcome! 👋</p>
            <p className="text-sm">
              I'm here to help you build a professional Product Requirements Document. 
              Let's start by exploring your idea in more detail.
            </p>
            <p className="text-sm mt-2 text-primary-content/70">
              (Chat functionality coming in the next update)
            </p>
          </div>
        </div>
      </div>

      {/* Input Area (Disabled) */}
      <div className="p-4 border-t border-base-200">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Chat will be enabled soon..."
            className="input input-bordered flex-1"
            disabled
          />
          <button className="btn btn-primary" disabled>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
```

### PrdBuilderSkeleton Component

```typescript
// src/features/prd/components/PrdBuilder/PrdBuilderSkeleton.tsx

export function PrdBuilderSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-base-100 border-b border-base-200 px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-base-300 rounded" />
          <div className="h-6 bg-base-300 rounded w-64" />
        </div>
      </div>

      {/* Layout Skeleton */}
      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
        {/* Chat Panel Skeleton */}
        <div className="lg:w-1/2 h-1/2 lg:h-full border border-base-200 rounded-box bg-base-100 p-4">
          <div className="h-6 bg-base-300 rounded w-32 mb-4" />
          <div className="space-y-4">
            <div className="h-16 bg-base-300 rounded w-3/4" />
            <div className="h-16 bg-base-300 rounded w-2/3 ml-auto" />
          </div>
        </div>

        {/* Preview Panel Skeleton */}
        <div className="lg:w-1/2 h-1/2 lg:h-full border border-base-200 rounded-box bg-base-100 p-4">
          <div className="h-6 bg-base-300 rounded w-32 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="border border-base-200 rounded-box p-4">
                <div className="flex justify-between mb-2">
                  <div className="h-5 bg-base-300 rounded w-32" />
                  <div className="h-5 bg-base-300 rounded w-16" />
                </div>
                <div className="h-4 bg-base-300 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### PrdBuilderError Component

```typescript
// src/features/prd/components/PrdBuilder/PrdBuilderError.tsx
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routeConstants';

interface PrdBuilderErrorProps {
  type: 'not-found' | 'not-approved' | 'error';
  message?: string;
  ideaId?: string;
}

export function PrdBuilderError({ type, message, ideaId }: PrdBuilderErrorProps) {
  const navigate = useNavigate();

  const errorConfig = {
    'not-found': {
      title: 'Idea Not Found',
      description: "The idea you're looking for doesn't exist or you don't have permission to view it.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      primaryAction: {
        label: 'Go to My Ideas',
        onClick: () => navigate(ROUTES.IDEAS),
      },
    },
    'not-approved': {
      title: 'Idea Not Approved Yet',
      description: 'You can only build a PRD for ideas that have been approved. Please wait for your idea to be reviewed.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      primaryAction: {
        label: 'View Idea Details',
        onClick: () => ideaId && navigate(ROUTES.IDEA_DETAIL.replace(':id', ideaId)),
      },
    },
    'error': {
      title: 'Something Went Wrong',
      description: message || 'An error occurred while loading the PRD builder. Please try again.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      primaryAction: {
        label: 'Go to My Ideas',
        onClick: () => navigate(ROUTES.IDEAS),
      },
    },
  };

  const config = errorConfig[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
      {config.icon}
      
      <h2 className="text-xl font-semibold text-base-content mt-6 mb-2">
        {config.title}
      </h2>
      <p className="text-base-content/60 mb-6">
        {config.description}
      </p>
      
      <button
        className="btn btn-primary"
        onClick={config.primaryAction.onClick}
      >
        {config.primaryAction.label}
      </button>
    </div>
  );
}
```

### PrdBuilderPage Implementation

```typescript
// src/pages/PrdBuilderPage.tsx
import { useParams } from 'react-router-dom';
import { usePrdBuilder } from '@/features/prd/hooks/usePrdBuilder';
import { IdeaSummaryHeader } from '@/features/prd/components/PrdBuilder/IdeaSummaryHeader';
import { PrdBuilderLayout } from '@/features/prd/components/PrdBuilder/PrdBuilderLayout';
import { PrdPreviewPanel } from '@/features/prd/components/PrdBuilder/PrdPreviewPanel';
import { ChatPanelPlaceholder } from '@/features/prd/components/PrdBuilder/ChatPanelPlaceholder';
import { PrdBuilderSkeleton } from '@/features/prd/components/PrdBuilder/PrdBuilderSkeleton';
import { PrdBuilderError } from '@/features/prd/components/PrdBuilder/PrdBuilderError';

export function PrdBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { 
    idea, 
    prd, 
    isLoading, 
    error, 
    isIdeaNotFound, 
    isIdeaNotApproved,
    isCreatingPrd,
  } = usePrdBuilder(id);

  // Loading state
  if (isLoading || isCreatingPrd) {
    return <PrdBuilderSkeleton />;
  }

  // Idea not found
  if (isIdeaNotFound) {
    return <PrdBuilderError type="not-found" />;
  }

  // Idea not approved
  if (isIdeaNotApproved) {
    return <PrdBuilderError type="not-approved" ideaId={id} />;
  }

  // Generic error
  if (error) {
    return <PrdBuilderError type="error" message={error.message} />;
  }

  // Main content
  if (!idea) return null;

  return (
    <div className="h-full">
      <IdeaSummaryHeader idea={idea} />
      <div className="p-4">
        <PrdBuilderLayout
          chatPanel={<ChatPanelPlaceholder />}
          previewPanel={<PrdPreviewPanel prd={prd} />}
        />
      </div>
    </div>
  );
}
```

### Route Constants Reference

```typescript
// Ensure these are in src/routes/routeConstants.ts
export const ROUTES = {
  // ... existing routes
  IDEAS: '/ideas',
  IDEA_DETAIL: '/ideas/:id',
  PRD_BUILDER: '/prd/:id',
  // ... other routes
} as const;
```

### Feature Barrel Exports

```typescript
// src/features/prd/components/PrdBuilder/index.ts
export { PrdBuilderLayout } from './PrdBuilderLayout';
export { IdeaSummaryHeader } from './IdeaSummaryHeader';
export { PrdPreviewPanel } from './PrdPreviewPanel';
export { ChatPanelPlaceholder } from './ChatPanelPlaceholder';
export { PrdBuilderSkeleton } from './PrdBuilderSkeleton';
export { PrdBuilderError } from './PrdBuilderError';

// src/features/prd/components/index.ts
export * from './PrdBuilder';
export { PrdSection } from './PrdSection';

// src/features/prd/hooks/index.ts
export { usePrdBuilder } from './usePrdBuilder';
export { prdQueryKeys } from './queryKeys';

// src/features/prd/index.ts (UPDATE)
// Services
export { prdService } from './services/prdService';
export { prdMessageService } from './services/prdMessageService';

// Hooks
export { usePrdBuilder, prdQueryKeys } from './hooks';

// Components
export * from './components';

// Types
export * from './types';
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Hook files | `camelCase` | `usePrdBuilder.ts` |
| Hook functions | `use` + `PascalCase` | `usePrdBuilder` |
| Component folders | `PascalCase` | `PrdBuilder/` |
| Component files | `PascalCase` | `PrdBuilderLayout.tsx` |
| Component functions | `PascalCase` | `PrdBuilderLayout` |
| Service methods | `camelCase` | `getPrdByIdeaId` |
| Query key objects | `camelCase` | `prdQueryKeys` |
| Route params | `camelCase` | `:id` |

### DaisyUI Component Classes Reference

| Element | Classes |
|---------|---------|
| Layout container | `h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4` |
| Panel border | `border border-base-200 rounded-box bg-base-100` |
| Chat bubble start | `chat chat-start` |
| Chat bubble primary | `chat-bubble chat-bubble-primary` |
| Section card | `card bg-base-100 border border-base-200` |
| Card body | `card-body p-4` |
| Badge outline | `badge badge-outline` |
| Badge status | `badge badge-sm badge-ghost/warning/success` |
| Input disabled | `input input-bordered flex-1` |
| Button primary | `btn btn-primary` |
| Button ghost | `btn btn-ghost btn-sm` |
| Skeleton | `animate-pulse` with `bg-base-300` |

### Anti-Patterns to AVOID

1. **DO NOT** create PRD before checking if idea is approved - verify status first
2. **DO NOT** create multiple PRDs for same idea - check existing PRD first
3. **DO NOT** hardcode route paths - use ROUTES constants
4. **DO NOT** forget loading states - show skeleton while fetching
5. **DO NOT** forget error boundaries - handle all error scenarios
6. **DO NOT** forget responsive design - test on mobile viewport
7. **DO NOT** block PRD creation with UI interaction - auto-create on first load
8. **DO NOT** make direct Supabase calls in components - use service layer via hooks
9. **DO NOT** skip accessibility - use semantic HTML and ARIA labels
10. **DO NOT** forget to import types from feature types.ts

### Previous Story Learnings Applied

From **Story 3.1** (PRD Database):
- prdService.createPrd initializes PRD with empty sections
- prdService.getPrdByIdeaId returns null if no PRD exists (not an error)
- PrdContent structure with status per section
- PRD_SECTION_KEYS and PRD_SECTION_LABELS constants

From **Story 2.9** (Idea Detail):
- useIdea hook pattern for fetching single idea
- ideaQueryKeys.detail pattern for query keys
- IdeaNotFound and error handling patterns
- Two-column responsive layout pattern
- ROUTES.IDEA_DETAIL for navigation

From **Story 2.8** (Ideas List):
- React Query patterns for data fetching
- Query invalidation on mutations
- Loading skeleton patterns

From **Story 1.8** (Protected Routes):
- PrdBuilderPage must be wrapped in AuthenticatedLayout
- Only authenticated users can access

### Dependencies on Previous Stories

- **Story 1.1 (Project Init):** React Query, React Router setup
- **Story 1.2 (Theme):** PassportCard DaisyUI theme
- **Story 1.3 (Supabase):** Database connection
- **Story 1.8 (Protected Routes):** AuthenticatedLayout
- **Story 2.1 (Ideas DB):** ideas table, Idea type, ideaService
- **Story 2.9 (Idea Detail):** useIdea hook, ideaQueryKeys, ROUTES constants
- **Story 3.1 (PRD DB):** prd_documents table, prdService, PrdDocument type

### Dependencies for Future Stories

- **Story 3.3 (Gemini Edge Function):** PRD chat endpoint
- **Story 3.4 (Chat Interface):** ChatPanelPlaceholder will be replaced with ChatInterface
- **Story 3.5 (Real-Time Section Generation):** PrdPreviewPanel will show live updates
- **Story 3.6 (Auto-Save):** usePrdBuilder will integrate auto-save
- **Story 3.8 (Mark Complete):** Complete button in PrdPreviewPanel
- **Story 3.9 (View PRD):** Separate view-only page for completed PRDs

### Data Flow

```
User clicks "Build PRD" on idea detail page (Story 2.9)
  → Navigate to /prd/:id
    → PrdBuilderPage renders
      → usePrdBuilder hook initializes with id param
        → Fetch idea via ideaService.getIdeaById
          → If idea.status !== 'approved' → Show error
          → If approved → Fetch PRD via prdService.getPrdByIdeaId
            → If PRD exists → Load existing PRD (resume)
            → If no PRD → Auto-create via prdService.createPrd
              → New PRD with empty sections created
                → Render PrdBuilderLayout
                  → IdeaSummaryHeader (idea context)
                  → ChatPanelPlaceholder (future chat)
                  → PrdPreviewPanel (7 empty sections)
```

### Testing Checklist

- [ ] Page loads successfully for approved idea
- [ ] PRD auto-creates if none exists
- [ ] Existing PRD loads on revisit (resume functionality)
- [ ] Idea summary header displays correctly
- [ ] Collapsible idea details work
- [ ] All 7 PRD sections display with empty placeholders
- [ ] Section status badges show correctly
- [ ] Chat panel placeholder displays welcome message
- [ ] Skeleton displays during loading
- [ ] "Idea not found" error displays for invalid ID
- [ ] "Idea not approved" error displays for non-approved idea
- [ ] Back navigation works to idea detail
- [ ] Layout is responsive - stacks on mobile
- [ ] Layout splits on desktop (50/50)
- [ ] Scrolling works in preview panel with many sections
- [ ] Page is accessible via keyboard navigation

### UI/UX Requirements (from UX Design)

- Split-screen with chat and PRD preview visible simultaneously
- Mobile-first responsive: stack vertically on small screens
- Idea context always visible but collapsible to maximize screen space
- PRD sections clearly labeled with status indicators
- Chat interface feels conversational, not form-like
- Empty states are helpful, not scary
- Loading skeleton prevents layout shift
- PassportCard red (#E10514) for primary actions and highlights

### Performance Considerations

- React Query staleTime optimized for each use case
- PRD staleTime is shorter (30s) as content changes frequently
- Auto-PRD creation only triggers once per session
- Skeleton prevents layout shift
- No unnecessary re-renders with proper query key structure

### Security Considerations

- All data access through Supabase RLS
- User can only view their own ideas (RLS policy)
- PRD created with current user's ID via prdService
- Idea approval status checked before PRD creation
- ID parameter sanitized by Supabase

### Project Structure Notes

- First split-screen/builder interface in the project
- Sets pattern for prototype builder in Epic 4
- ChatPanelPlaceholder designed for easy replacement in Story 3.4
- PrdSection component reusable for PRD viewer (Story 3.9)
- PrdBuilderLayout designed for potential panel resizing

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/prd.md#PRD Development with AI]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#PRD Builder]
- [Source: _bmad-output/implementation-artifacts/3-1-create-prd-database-tables-and-service-layer.md]
- [Source: _bmad-output/implementation-artifacts/2-9-idea-detail-view.md]
- [Source: src/features/prd/types.ts]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
