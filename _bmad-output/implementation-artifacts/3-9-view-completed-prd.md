# Story 3.9: View Completed PRD

Status: ready-for-dev

## Story

As a **user**,
I want **to view my completed PRD in a readable format**,
So that **I can review it or share it with others**.

## Acceptance Criteria

1. **Given** I have a completed PRD **When** I view the PRD detail page **Then** I see all sections rendered in a professional, readable format **And** the document has proper headings, formatting, and structure

2. **Given** I am viewing a completed PRD **When** the page loads **Then** I can see the original idea it was based on (title, problem, solution, impact) **And** I see the completion date and status prominently displayed

3. **Given** I navigate from My Ideas to a completed PRD **When** I click on an idea with status "prd_development" or "prototype_complete" **Then** I can access the "View PRD" button/link **And** the PRD opens in view mode

4. **Given** the PRD has all 7 sections populated **When** I view the PRD **Then** each section is displayed with proper formatting: Problem Statement, Goals & Metrics, User Stories, Requirements, Technical Considerations, Risks, Timeline **And** sections are visually separated and easy to scan

5. **Given** I am viewing a completed PRD **When** I scroll through the document **Then** I see a table of contents or section navigation **And** I can jump to any section quickly

6. **Given** I want to generate a prototype from this PRD **When** I am viewing the completed PRD **Then** I see a prominent "Generate Prototype" call-to-action **And** clicking it navigates to prototype generation (Epic 4)

7. **Given** I navigate directly to a PRD URL **When** the PRD exists and belongs to me **Then** the PRD loads correctly **And** if the PRD is still in draft status, I am redirected to the PRD Builder page instead

## Tasks / Subtasks

- [ ] Task 1: Create PrdViewPage component (AC: 1, 2, 4)
  - [ ] Create `src/pages/PrdViewPage.tsx`
  - [ ] Add route `/prd/:prdId` in router configuration
  - [ ] Fetch PRD document by ID using prdService
  - [ ] Fetch associated idea for context display
  - [ ] Redirect to PrdBuilderPage if PRD status is 'draft'
  - [ ] Handle loading, error, and not-found states

- [ ] Task 2: Create PrdViewerHeader component (AC: 2, 6)
  - [ ] Create `src/features/prd/components/PrdViewerHeader.tsx`
  - [ ] Display idea title prominently
  - [ ] Show completion status badge with "Complete" indicator
  - [ ] Show completion date formatted nicely (e.g., "Completed January 15, 2026")
  - [ ] Include "Generate Prototype" CTA button (disabled if prototype exists)
  - [ ] Include "Back to Idea" navigation link

- [ ] Task 3: Create PrdIdeaSummary component (AC: 2)
  - [ ] Create `src/features/prd/components/PrdIdeaSummary.tsx`
  - [ ] Display collapsible/expandable idea context card
  - [ ] Show original problem, solution, and impact from idea
  - [ ] Show enhanced versions if available
  - [ ] Use subtle styling to differentiate from PRD content

- [ ] Task 4: Create PrdSectionViewer component (AC: 1, 4)
  - [ ] Create `src/features/prd/components/PrdSectionViewer.tsx`
  - [ ] Render individual section with proper typography
  - [ ] Display section title with appropriate heading level
  - [ ] Render content with markdown formatting support
  - [ ] Show section icon for visual interest
  - [ ] Handle empty/optional sections gracefully

- [ ] Task 5: Create PrdTableOfContents component (AC: 5)
  - [ ] Create `src/features/prd/components/PrdTableOfContents.tsx`
  - [ ] List all PRD sections with anchor links
  - [ ] Highlight current section based on scroll position
  - [ ] Make sticky on desktop, collapsible on mobile
  - [ ] Show section completion indicators (all complete for finished PRD)

- [ ] Task 6: Create PrdDocumentView component (AC: 1, 4, 5)
  - [ ] Create `src/features/prd/components/PrdDocumentView.tsx`
  - [ ] Compose PrdTableOfContents and PrdSectionViewer components
  - [ ] Render all 7 sections in order with proper IDs for anchor navigation
  - [ ] Add smooth scroll behavior for section navigation
  - [ ] Use clean, professional typography and spacing

- [ ] Task 7: Add usePrdView hook for data fetching (AC: 1, 2, 3, 7)
  - [ ] Create `src/features/prd/hooks/usePrdView.ts`
  - [ ] Fetch PRD document by ID with React Query
  - [ ] Fetch associated idea details
  - [ ] Return combined data: prd, idea, isLoading, error
  - [ ] Handle PRD not found scenario
  - [ ] Detect if PRD is draft and return redirect flag

- [ ] Task 8: Update prdService with getPrdById method (AC: 1, 7)
  - [ ] Add `getPrdById(prdId: string)` to `src/features/prd/services/prdService.ts`
  - [ ] Include related idea data via join or separate query
  - [ ] Apply RLS - users can only view their own PRDs
  - [ ] Return ServiceResponse<PrdDocument> pattern

- [ ] Task 9: Update IdeaDetailView to include "View PRD" link (AC: 3)
  - [ ] Update `src/features/ideas/components/IdeaDetailView.tsx` (or create if not exists)
  - [ ] Add "View PRD" button when idea has associated completed PRD
  - [ ] Button navigates to `/prd/:prdId`
  - [ ] Only show button when PRD status is 'complete'
  - [ ] Show "Continue Building PRD" if PRD is draft

- [ ] Task 10: Update router with PrdViewPage route
  - [ ] Add `/prd/:prdId` route to `src/routes/index.tsx`
  - [ ] Route should be protected (ProtectedRoute wrapper)
  - [ ] Handle route params extraction

- [ ] Task 11: Create print-friendly styles for PRD (AC: 1)
  - [ ] Add print media query styles for PrdDocumentView
  - [ ] Ensure proper page breaks between sections
  - [ ] Hide navigation elements in print view
  - [ ] Optimize typography for print

- [ ] Task 12: Update barrel exports
  - [ ] Export new components from `src/features/prd/components/index.ts`
  - [ ] Export usePrdView from `src/features/prd/hooks/index.ts`
  - [ ] Export PrdViewPage from `src/pages/index.ts`

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
│   ├── PrdDocumentView.tsx         (THIS STORY - NEW)
│   ├── PrdViewerHeader.tsx         (THIS STORY - NEW)
│   ├── PrdIdeaSummary.tsx          (THIS STORY - NEW)
│   ├── PrdSectionViewer.tsx        (THIS STORY - NEW)
│   ├── PrdTableOfContents.tsx      (THIS STORY - NEW)
│   ├── ConfirmCompletionModal.tsx  (FROM 3.8)
│   ├── CompletedPrdHeader.tsx      (FROM 3.8)
│   ├── GeneratePrototypeButton.tsx (FROM 3.8)
│   ├── SectionStatusBadge.tsx      (FROM 3.5/3.7)
│   ├── PrdSectionCard.tsx          (FROM 3.7)
│   ├── CompletionValidationModal.tsx (FROM 3.7)
│   ├── SaveIndicator.tsx           (FROM 3.6)
│   └── index.ts
├── constants/
│   ├── prdSections.ts              (FROM 3.7)
│   └── index.ts
├── hooks/
│   ├── usePrdBuilder.ts            (FROM 3.5/3.7/3.8)
│   ├── usePrdView.ts               (THIS STORY - NEW)
│   ├── useCompletePrd.ts           (FROM 3.8)
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
└── types.ts                        (FROM 3.1/3.7/3.8)

src/pages/
├── PrdViewPage.tsx                 (THIS STORY - NEW)
└── index.ts                        (UPDATE)
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

**ideas table (from Epic 2):**
```sql
-- Relevant columns for this story
id UUID PRIMARY KEY,
user_id UUID REFERENCES auth.users(id),
title TEXT,
problem TEXT,
solution TEXT,
impact TEXT,
enhanced_problem TEXT,
enhanced_solution TEXT,
enhanced_impact TEXT,
status TEXT CHECK (status IN ('submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected'))
```

### Type Definitions

```typescript
// src/features/prd/types.ts (existing types from 3.1/3.7/3.8)
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

// New types for this story
export interface PrdViewData {
  prd: PrdDocument;
  idea: IdeaSummary;
}

export interface IdeaSummary {
  id: string;
  title: string;
  problem: string;
  solution: string;
  impact: string;
  enhanced_problem?: string;
  enhanced_solution?: string;
  enhanced_impact?: string;
  status: string;
  created_at: string;
}
```

### Service Implementation

```typescript
// src/features/prd/services/prdService.ts (ADDITIONS)
import { supabase } from '@/lib/supabase';
import type { PrdDocument, PrdViewData, IdeaSummary } from '../types';

interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

export const prdService = {
  // ... existing methods from 3.1/3.8 ...

  /**
   * Get PRD by ID with associated idea data
   * For viewing completed PRDs
   */
  async getPrdById(prdId: string): Promise<ServiceResponse<PrdViewData>> {
    try {
      // Fetch PRD document
      const { data: prd, error: prdError } = await supabase
        .from('prd_documents')
        .select('*')
        .eq('id', prdId)
        .single();

      if (prdError || !prd) {
        throw new Error(prdError?.message || 'PRD not found');
      }

      // Fetch associated idea
      const { data: idea, error: ideaError } = await supabase
        .from('ideas')
        .select('id, title, problem, solution, impact, enhanced_problem, enhanced_solution, enhanced_impact, status, created_at')
        .eq('id', prd.idea_id)
        .single();

      if (ideaError || !idea) {
        throw new Error(ideaError?.message || 'Associated idea not found');
      }

      return {
        data: {
          prd: prd as PrdDocument,
          idea: idea as IdeaSummary,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch PRD'),
      };
    }
  },

  /**
   * Get PRD by idea ID (for linking from idea detail)
   */
  async getPrdByIdeaId(ideaId: string): Promise<ServiceResponse<PrdDocument>> {
    try {
      const { data, error } = await supabase
        .from('prd_documents')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // No PRD exists for this idea - not an error
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        throw new Error(error.message);
      }

      return { data: data as PrdDocument, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch PRD'),
      };
    }
  },
};
```

### Hook Implementation

```typescript
// src/features/prd/hooks/usePrdView.ts
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { prdService } from '../services/prdService';
import type { PrdViewData } from '../types';

interface UsePrdViewOptions {
  prdId: string;
  redirectIfDraft?: boolean;
}

interface UsePrdViewResult {
  data: PrdViewData | null;
  isLoading: boolean;
  error: Error | null;
  isDraft: boolean;
}

export function usePrdView({ prdId, redirectIfDraft = true }: UsePrdViewOptions): UsePrdViewResult {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['prd', 'view', prdId],
    queryFn: async () => {
      const result = await prdService.getPrdById(prdId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!prdId,
  });

  const isDraft = data?.prd?.status === 'draft';

  // Redirect to builder if PRD is still draft
  useEffect(() => {
    if (redirectIfDraft && isDraft && data?.prd) {
      navigate(`/prd/build/${data.prd.idea_id}`, { replace: true });
    }
  }, [isDraft, redirectIfDraft, data, navigate]);

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null,
    isDraft,
  };
}
```

### PrdViewPage Component

```tsx
// src/pages/PrdViewPage.tsx
import { useParams } from 'react-router-dom';
import { usePrdView } from '@/features/prd/hooks/usePrdView';
import { 
  PrdDocumentView, 
  PrdViewerHeader, 
  PrdIdeaSummary 
} from '@/features/prd/components';
import { Spinner } from '@/components/ui';

export function PrdViewPage() {
  const { prdId } = useParams<{ prdId: string }>();
  const { data, isLoading, error, isDraft } = usePrdView({ 
    prdId: prdId ?? '',
    redirectIfDraft: true,
  });

  if (isLoading || isDraft) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl font-semibold text-error">PRD Not Found</h2>
        <p className="text-base-content/60">
          {error?.message || 'The requested PRD could not be found.'}
        </p>
        <a href="/ideas" className="btn btn-primary">
          Back to My Ideas
        </a>
      </div>
    );
  }

  const { prd, idea } = data;

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <PrdViewerHeader
        prd={prd}
        idea={idea}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Idea Summary (Collapsible) */}
        <PrdIdeaSummary idea={idea} />

        {/* PRD Document */}
        <PrdDocumentView prdContent={prd.content} />
      </div>
    </div>
  );
}
```

### PrdViewerHeader Component

```tsx
// src/features/prd/components/PrdViewerHeader.tsx
import { ArrowLeftIcon, CheckBadgeIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { GeneratePrototypeButton } from './GeneratePrototypeButton';
import type { PrdDocument, IdeaSummary } from '../types';

interface PrdViewerHeaderProps {
  prd: PrdDocument;
  idea: IdeaSummary;
  hasPrototype?: boolean;
}

export function PrdViewerHeader({ prd, idea, hasPrototype = false }: PrdViewerHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-base-100 border-b border-base-300 print:hidden">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Back + Title */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate(`/ideas/${idea.id}`)}
              className="btn btn-ghost btn-sm btn-circle mt-1"
              aria-label="Back to idea"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DocumentTextIcon className="w-6 h-6 text-primary" />
                <h1 className="text-xl md:text-2xl font-bold">
                  {idea.title || 'Product Requirements Document'}
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-base-content/60">
                <span className="badge badge-success gap-1">
                  <CheckBadgeIcon className="w-4 h-4" />
                  Complete
                </span>
                {prd.completed_at && (
                  <span>
                    Completed {format(new Date(prd.completed_at), 'MMMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn btn-outline btn-sm"
            >
              Print / Export
            </button>
            {!hasPrototype && (
              <GeneratePrototypeButton 
                prdId={prd.id} 
                ideaId={idea.id} 
              />
            )}
            {hasPrototype && (
              <button
                onClick={() => navigate(`/prototype/${idea.id}`)}
                className="btn btn-primary"
              >
                View Prototype
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

### PrdIdeaSummary Component

```tsx
// src/features/prd/components/PrdIdeaSummary.tsx
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import type { IdeaSummary } from '../types';

interface PrdIdeaSummaryProps {
  idea: IdeaSummary;
}

export function PrdIdeaSummary({ idea }: PrdIdeaSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-8 print:mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-warning" />
          <span className="font-medium">Original Idea Context</span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 bg-base-200/50 rounded-lg space-y-4">
          {/* Problem */}
          <div>
            <h4 className="text-sm font-semibold text-base-content/70 mb-1">Problem</h4>
            <p className="text-sm">{idea.enhanced_problem || idea.problem}</p>
          </div>

          {/* Solution */}
          <div>
            <h4 className="text-sm font-semibold text-base-content/70 mb-1">Solution</h4>
            <p className="text-sm">{idea.enhanced_solution || idea.solution}</p>
          </div>

          {/* Impact */}
          <div>
            <h4 className="text-sm font-semibold text-base-content/70 mb-1">Expected Impact</h4>
            <p className="text-sm">{idea.enhanced_impact || idea.impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### PrdTableOfContents Component

```tsx
// src/features/prd/components/PrdTableOfContents.tsx
import { useState, useEffect } from 'react';
import { ListBulletIcon } from '@heroicons/react/24/outline';
import { PRD_SECTIONS } from '../constants/prdSections';
import type { PrdContent } from '../types';

interface PrdTableOfContentsProps {
  prdContent: PrdContent;
}

export function PrdTableOfContents({ prdContent }: PrdTableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Track scroll position to highlight current section
  useEffect(() => {
    const handleScroll = () => {
      const sections = PRD_SECTIONS.map(s => ({
        key: s.key,
        element: document.getElementById(`section-${s.key}`),
      }));

      for (const section of sections.reverse()) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section.key);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (sectionKey: string) => {
    const element = document.getElementById(`section-${sectionKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter to only show sections with content
  const sectionsWithContent = PRD_SECTIONS.filter(
    section => prdContent[section.key]?.content
  );

  return (
    <nav className="hidden lg:block sticky top-24 print:hidden">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 text-sm font-semibold mb-3"
      >
        <ListBulletIcon className="w-5 h-5" />
        Contents
      </button>

      {!isCollapsed && (
        <ul className="space-y-1 border-l-2 border-base-300 pl-4">
          {sectionsWithContent.map(section => (
            <li key={section.key}>
              <button
                onClick={() => handleSectionClick(section.key)}
                className={`text-sm text-left w-full py-1 px-2 rounded transition-colors ${
                  activeSection === section.key
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                }`}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
```

### PrdSectionViewer Component

```tsx
// src/features/prd/components/PrdSectionViewer.tsx
import { 
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CpuChipIcon,
  ShieldExclamationIcon,
  CalendarDaysIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import type { PrdSectionKey, PrdSection } from '../types';
import { getSectionByKey } from '../constants/prdSections';

const sectionIcons: Record<PrdSectionKey, typeof ExclamationTriangleIcon> = {
  problem_statement: ExclamationTriangleIcon,
  goals_metrics: ChartBarIcon,
  user_stories: UserGroupIcon,
  requirements: ClipboardDocumentListIcon,
  technical_considerations: CpuChipIcon,
  risks: ShieldExclamationIcon,
  timeline: CalendarDaysIcon,
};

interface PrdSectionViewerProps {
  sectionKey: PrdSectionKey;
  section: PrdSection | undefined;
}

export function PrdSectionViewer({ sectionKey, section }: PrdSectionViewerProps) {
  const definition = getSectionByKey(sectionKey);
  if (!definition) return null;

  const Icon = sectionIcons[sectionKey] || QuestionMarkCircleIcon;
  const hasContent = section?.content && section.content.trim().length > 0;

  if (!hasContent) {
    return null; // Don't render empty sections in view mode
  }

  return (
    <section
      id={`section-${sectionKey}`}
      className="mb-8 scroll-mt-24 print:break-inside-avoid"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-base-300">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{definition.title}</h2>
      </div>

      {/* Section Content */}
      <div className="prose prose-sm max-w-none">
        {/* Render content with basic formatting */}
        {section!.content.split('\n').map((paragraph, idx) => {
          if (!paragraph.trim()) return null;
          
          // Check if it's a list item
          if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('• ')) {
            return (
              <li key={idx} className="ml-4">
                {paragraph.replace(/^[-•]\s*/, '')}
              </li>
            );
          }
          
          // Check if it's a numbered list item
          if (/^\d+\.\s/.test(paragraph.trim())) {
            return (
              <li key={idx} className="ml-4 list-decimal">
                {paragraph.replace(/^\d+\.\s*/, '')}
              </li>
            );
          }

          return <p key={idx}>{paragraph}</p>;
        })}
      </div>
    </section>
  );
}
```

### PrdDocumentView Component

```tsx
// src/features/prd/components/PrdDocumentView.tsx
import { PRD_SECTIONS } from '../constants/prdSections';
import { PrdSectionViewer } from './PrdSectionViewer';
import { PrdTableOfContents } from './PrdTableOfContents';
import type { PrdContent } from '../types';

interface PrdDocumentViewProps {
  prdContent: PrdContent;
}

export function PrdDocumentView({ prdContent }: PrdDocumentViewProps) {
  return (
    <div className="flex gap-8">
      {/* Table of Contents (Desktop Sidebar) */}
      <aside className="w-48 flex-shrink-0">
        <PrdTableOfContents prdContent={prdContent} />
      </aside>

      {/* Main Document Content */}
      <article className="flex-1 min-w-0">
        {PRD_SECTIONS.map(section => (
          <PrdSectionViewer
            key={section.key}
            sectionKey={section.key}
            section={prdContent[section.key]}
          />
        ))}

        {/* Print-only footer */}
        <footer className="hidden print:block mt-8 pt-4 border-t border-base-300 text-sm text-base-content/60">
          <p>Generated by IdeaSpark • {new Date().toLocaleDateString()}</p>
        </footer>
      </article>
    </div>
  );
}
```

### Route Configuration Update

```tsx
// src/routes/index.tsx (ADD to existing routes)
import { PrdViewPage } from '@/pages/PrdViewPage';

// Add this route inside the protected routes section:
{
  path: 'prd/:prdId',
  element: (
    <ProtectedRoute>
      <PrdViewPage />
    </ProtectedRoute>
  ),
}
```

### Print Styles

```css
/* src/styles/globals.css (ADD) */
@media print {
  /* Hide non-printable elements */
  .print\\:hidden {
    display: none !important;
  }

  /* Show print-only elements */
  .print\\:block {
    display: block !important;
  }

  /* Reset backgrounds for print */
  body {
    background: white !important;
  }

  /* Ensure sections don't break awkwardly */
  .print\\:break-inside-avoid {
    break-inside: avoid;
  }

  /* Adjust margins for print */
  .print\\:mb-4 {
    margin-bottom: 1rem !important;
  }

  /* Typography adjustments */
  h1, h2, h3 {
    page-break-after: avoid;
  }

  /* Remove decorative elements */
  .badge,
  .btn {
    border: 1px solid #ccc !important;
    background: transparent !important;
  }
}
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Page components | `PascalCase` + `Page` suffix | `PrdViewPage.tsx` |
| Viewer components | `PascalCase` + `Viewer` suffix | `PrdSectionViewer.tsx` |
| Hook names | `use` + `PascalCase` | `usePrdView` |
| Route paths | `kebab-case` | `/prd/:prdId` |
| Query keys | `['feature', 'action', ...params]` | `['prd', 'view', prdId]` |
| CSS classes | DaisyUI + Tailwind pattern | `prose prose-sm`, `scroll-mt-24` |

### Anti-Patterns to AVOID

1. **DO NOT** render empty sections - skip sections with no content in view mode
2. **DO NOT** allow viewing draft PRDs here - redirect to PRD Builder
3. **DO NOT** hardcode section definitions - use PRD_SECTIONS constant
4. **DO NOT** duplicate the PRD Builder UI - view mode is read-only and different layout
5. **DO NOT** break print functionality - test print preview during development
6. **DO NOT** forget scroll behavior - use `scroll-mt-24` for fixed header offset
7. **DO NOT** make the page too wide - limit to max-w-5xl for readability
8. **DO NOT** forget RLS - users can only view their own PRDs
9. **DO NOT** forget error handling - handle not found, unauthorized gracefully
10. **DO NOT** forget loading states - show spinner while fetching data

### Performance Requirements (NFR-P1, NFR-P2)

- Page should load within 3 seconds (NFR-P1)
- UI interactions (scroll, expand/collapse) should respond within 100ms (NFR-P2)
- Table of contents scroll tracking should not cause jank
- Print dialog should open immediately when button clicked

### UX Design Requirements (from UX Spec)

1. **Professional presentation** - PRD should look polished and printable
2. **Clear hierarchy** - Sections are visually distinct with proper typography
3. **Easy navigation** - Table of contents for quick section access
4. **Context preservation** - Original idea summary is accessible but not prominent
5. **Clear next action** - "Generate Prototype" CTA is prominent and inviting
6. **Print-friendly** - Document prints cleanly for offline review

### Dependencies on Previous Stories

- **Story 3.1 (PRD Database):** prd_documents table, prdService foundation, PrdDocument type
- **Story 3.7 (Section Structure):** PRD_SECTIONS constant, PrdSectionKey type, section definitions
- **Story 3.8 (Mark Complete):** GeneratePrototypeButton component, completed_at field

### Dependencies for Future Stories

- **Story 4.3 (Trigger Prototype Generation):** GeneratePrototypeButton navigates to prototype flow
- **Story 5.6 (Admin View PRDs):** Admin may reuse PrdDocumentView with different permissions

### Data Flow

```
User navigates to /prd/:prdId:
  → PrdViewPage extracts prdId from URL params
    → usePrdView hook fetches PRD and associated idea
      → prdService.getPrdById(prdId) queries Supabase
        → RLS ensures user owns this PRD
          → IF draft status: redirect to /prd/build/:ideaId
          → IF complete: render PrdViewerHeader + PrdDocumentView
            → PrdTableOfContents tracks scroll position
              → User clicks section → smooth scroll to section
            → User clicks "Generate Prototype" → navigate to Epic 4

User navigates from idea detail:
  → IdeaDetailView shows "View PRD" button if PRD is complete
    → Button links to /prd/:prdId
      → PrdViewPage loads as above
```

### Testing Checklist

- [ ] PRD view page loads correctly for completed PRDs
- [ ] Draft PRDs redirect to PRD Builder page
- [ ] All 7 sections display with proper formatting
- [ ] Empty/optional sections are not rendered
- [ ] Table of contents shows only sections with content
- [ ] Clicking TOC item scrolls to correct section
- [ ] Current section highlights in TOC while scrolling
- [ ] Original idea context expands/collapses correctly
- [ ] Header shows completion status and date
- [ ] "Generate Prototype" button appears and works
- [ ] "Print / Export" opens print dialog
- [ ] Print preview shows clean, readable document
- [ ] Unauthorized users cannot view others' PRDs
- [ ] Non-existent PRDs show error state
- [ ] Loading state shows spinner
- [ ] Mobile layout works (stacked, no TOC sidebar)
- [ ] All links navigate correctly

### Project Structure Notes

- PrdViewPage is a top-level page component in `src/pages/`
- View components are separate from Builder components for clarity
- usePrdView is distinct from usePrdBuilder - different data needs
- PrdDocumentView can be reused for admin viewing (with permission check)
- Print styles use Tailwind's print: variant

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.9]
- [Source: _bmad-output/planning-artifacts/prd.md#FR26 View completed PRDs]
- [Source: _bmad-output/planning-artifacts/prd.md#FR25 Mark PRD as complete]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/implementation-artifacts/3-7-prd-section-structure-and-content.md]
- [Source: _bmad-output/implementation-artifacts/3-8-mark-prd-as-complete.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
