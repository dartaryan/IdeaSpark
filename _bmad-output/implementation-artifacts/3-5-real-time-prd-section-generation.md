# Story 3.5: Real-Time PRD Section Generation

Status: ready-for-dev

## Story

As a **user**,
I want **to see PRD sections being populated as I chat**,
So that **I can see my document taking shape in real-time**.

## Acceptance Criteria

1. **Given** I am chatting with the AI assistant **When** I provide information relevant to a PRD section **Then** the AI extracts that information and populates the corresponding section in the preview

2. **Given** the AI updates a PRD section **When** the update is applied **Then** the newly updated section is highlighted briefly (1-2 seconds) to draw attention

3. **Given** the PRD preview is displayed **When** content changes occur **Then** the PRD preview updates in real-time without page refresh

4. **Given** I am viewing the PRD preview **When** sections have content **Then** each section shows a status indicator ("Empty", "In Progress", or "Complete")

5. **Given** the AI asks about problem context **When** I provide a detailed answer **Then** the "Problem Statement" section updates with structured, professionally formatted content (not just my raw input)

6. **Given** multiple section updates are received **When** I view the PRD **Then** all updated sections reflect changes immediately and highlight sequentially

7. **Given** a section update fails to save **When** an error occurs **Then** the user sees a clear error notification and the local state is preserved for retry

8. **Given** the AI provides section updates **When** the response includes `sectionUpdates` **Then** the `onSectionUpdate` callback from ChatInterface is invoked with the updates

## Tasks / Subtasks

- [ ] Task 1: Create PrdPreview component (AC: 1, 3, 4)
  - [ ] Create `src/features/prd/components/PrdBuilder/PrdPreview.tsx`
  - [ ] Implement scrollable preview container with all 7 sections
  - [ ] Display section headers with status indicators
  - [ ] Pass through prdContent prop to render current state
  - [ ] Support real-time updates via prop changes
  - [ ] Style with DaisyUI card/collapse components

- [ ] Task 2: Create PrdSection component (AC: 2, 4, 5)
  - [ ] Create `src/features/prd/components/PrdSection.tsx`
  - [ ] Props: sectionKey, content, status, isHighlighted
  - [ ] Render section header with label and status badge
  - [ ] Render formatted content (support markdown-like formatting)
  - [ ] Apply highlight animation when isHighlighted=true
  - [ ] Handle empty state with placeholder text

- [ ] Task 3: Create SectionStatusBadge component (AC: 4)
  - [ ] Create `src/features/prd/components/SectionStatusBadge.tsx`
  - [ ] Display "Empty" (gray), "In Progress" (yellow), "Complete" (green) badges
  - [ ] Use DaisyUI badge classes with appropriate colors
  - [ ] Props: status ('empty' | 'in_progress' | 'complete')

- [ ] Task 4: Create usePrdBuilder hook for section state (AC: 1, 3, 6, 7)
  - [ ] Create `src/features/prd/hooks/usePrdBuilder.ts`
  - [ ] State: prdContent (full PRD state), highlightedSections (Set<string>)
  - [ ] Integrate with prdService.updatePrdSection from Story 3.1
  - [ ] handleSectionUpdates function: Process updates from ChatInterface
  - [ ] Auto-clear highlights after 2 seconds
  - [ ] Implement optimistic updates with error rollback
  - [ ] Debounce database saves to prevent excessive writes

- [ ] Task 5: Implement section update handler (AC: 1, 5, 8)
  - [ ] Accept PrdSectionUpdate[] from onSectionUpdate callback
  - [ ] For each update: update local state immediately (optimistic)
  - [ ] Format content professionally (the AI formats, we preserve)
  - [ ] Add section to highlightedSections Set
  - [ ] Persist to database via prdService.updatePrdSection
  - [ ] Handle errors with toast notification

- [ ] Task 6: Implement highlight animation (AC: 2)
  - [ ] Add CSS animation for highlight effect (pulse or glow)
  - [ ] Apply animation class when section in highlightedSections
  - [ ] Auto-remove highlight after 2 seconds using setTimeout
  - [ ] Stagger highlights if multiple sections update simultaneously

- [ ] Task 7: Integrate PrdPreview into PrdBuilderPage (AC: all)
  - [ ] Import PrdPreview into PrdBuilderPage (from Story 3.2)
  - [ ] Pass prdContent, highlightedSections as props
  - [ ] Wire handleSectionUpdates to ChatInterface's onSectionUpdate
  - [ ] Ensure split-panel layout has proper proportions

- [ ] Task 8: Update ChatInterface to emit section updates (AC: 8)
  - [ ] Ensure onSectionUpdate prop is connected (Story 3.4)
  - [ ] Verify sectionUpdates are passed from usePrdChat

- [ ] Task 9: Update barrel exports
  - [ ] Export PrdPreview from `src/features/prd/components/PrdBuilder/index.ts`
  - [ ] Export PrdSection from `src/features/prd/components/index.ts`
  - [ ] Export SectionStatusBadge from `src/features/prd/components/index.ts`
  - [ ] Export usePrdBuilder from `src/features/prd/hooks/index.ts`

- [ ] Task 10: Implement auto-save for section updates (AC: 7)
  - [ ] Debounce save calls (300ms debounce)
  - [ ] Show subtle "Saving..." indicator during save
  - [ ] Show "Saved" confirmation briefly on success
  - [ ] Show error toast with retry on failure

## Dev Notes

### Architecture Patterns (MANDATORY)

**Component Location:**
```
src/features/prd/
├── components/
│   ├── PrdBuilder/
│   │   ├── PrdBuilder.tsx          (FROM 3.2 - parent component)
│   │   ├── ChatInterface.tsx       (FROM 3.4 - chat component)
│   │   ├── MessageBubble.tsx       (FROM 3.4)
│   │   ├── TypingIndicator.tsx     (FROM 3.4)
│   │   ├── PrdPreview.tsx          (THIS STORY - NEW)
│   │   └── index.ts                (UPDATE - add PrdPreview)
│   ├── PrdSection.tsx              (THIS STORY - NEW)
│   ├── SectionStatusBadge.tsx      (THIS STORY - NEW)
│   └── index.ts                    (UPDATE - add exports)
├── hooks/
│   ├── usePrdChat.ts               (FROM 3.4)
│   ├── usePrdBuilder.ts            (THIS STORY - NEW)
│   └── index.ts                    (UPDATE - add export)
├── services/
│   ├── prdService.ts               (FROM 3.1)
│   ├── prdMessageService.ts        (FROM 3.1)
│   └── prdChatService.ts           (FROM 3.3)
└── types.ts                        (FROM 3.1 - use existing types)
```

### Component Interfaces

**PrdPreview Props:**
```typescript
interface PrdPreviewProps {
  prdContent: PrdContent;
  highlightedSections: Set<string>;
  ideaTitle?: string;
}
```

**PrdSection Props:**
```typescript
interface PrdSectionProps {
  sectionKey: PrdSectionKey;
  section: PrdSection | undefined;
  isHighlighted: boolean;
}
```

**SectionStatusBadge Props:**
```typescript
interface SectionStatusBadgeProps {
  status: PrdSectionStatus; // 'empty' | 'in_progress' | 'complete'
}
```

**usePrdBuilder Return Type:**
```typescript
interface UsePrdBuilderReturn {
  prdContent: PrdContent;
  highlightedSections: Set<string>;
  isSaving: boolean;
  lastSaved: Date | null;
  handleSectionUpdates: (updates: PrdSectionUpdate[]) => Promise<void>;
  setPrdContent: (content: PrdContent) => void;
}
```

**PrdSectionUpdate Type (from Story 3.3 edge function):**
```typescript
interface PrdSectionUpdate {
  sectionKey: keyof PrdContent;
  content: string;
  status: 'in_progress' | 'complete';
}
```

### usePrdBuilder Hook Implementation

```typescript
// src/features/prd/hooks/usePrdBuilder.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prdService } from '../services';
import type { PrdContent, PrdDocument, PrdSectionKey, PrdSectionStatus } from '../types';
import { useToast } from '@/hooks/useToast';

interface PrdSectionUpdate {
  sectionKey: keyof PrdContent;
  content: string;
  status: 'in_progress' | 'complete';
}

interface UsePrdBuilderOptions {
  prdId: string;
  initialContent?: PrdContent;
}

export const prdBuilderQueryKeys = {
  prd: (id: string) => ['prd', id] as const,
};

export function usePrdBuilder({ prdId, initialContent }: UsePrdBuilderOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Local state for optimistic updates
  const [prdContent, setPrdContent] = useState<PrdContent>(initialContent ?? {});
  const [highlightedSections, setHighlightedSections] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Refs for debouncing and highlight timeouts
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const highlightTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load PRD data on mount
  const { data: prdData, isLoading } = useQuery({
    queryKey: prdBuilderQueryKeys.prd(prdId),
    queryFn: async () => {
      const result = await prdService.getPrdById(prdId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prdId,
  });

  // Sync fetched data to local state
  useEffect(() => {
    if (prdData?.content) {
      setPrdContent(prdData.content);
    }
  }, [prdData]);

  // Mutation for saving section updates
  const saveMutation = useMutation({
    mutationFn: async ({ 
      sectionKey, 
      sectionData 
    }: { 
      sectionKey: keyof PrdContent; 
      sectionData: { content: string; status: PrdSectionStatus } 
    }) => {
      const result = await prdService.updatePrdSection(prdId, sectionKey, sectionData);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: prdBuilderQueryKeys.prd(prdId) });
    },
    onError: (error) => {
      toast({ type: 'error', message: `Failed to save: ${error.message}` });
    },
  });

  // Clear highlights after timeout
  const scheduleHighlightClear = useCallback((sectionKey: string) => {
    // Clear any existing timeout for this section
    const existingTimeout = highlightTimeoutsRef.current.get(sectionKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      setHighlightedSections(prev => {
        const next = new Set(prev);
        next.delete(sectionKey);
        return next;
      });
      highlightTimeoutsRef.current.delete(sectionKey);
    }, 2000); // 2 second highlight duration

    highlightTimeoutsRef.current.set(sectionKey, timeout);
  }, []);

  // Debounced save function
  const debouncedSave = useCallback((
    sectionKey: keyof PrdContent,
    sectionData: { content: string; status: PrdSectionStatus }
  ) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    
    saveTimeoutRef.current = setTimeout(() => {
      saveMutation.mutate({ sectionKey, sectionData });
      setIsSaving(false);
    }, 300); // 300ms debounce
  }, [saveMutation]);

  // Handle section updates from AI
  const handleSectionUpdates = useCallback(async (updates: PrdSectionUpdate[]) => {
    if (!updates || updates.length === 0) return;

    // Process each update
    for (const update of updates) {
      const { sectionKey, content, status } = update;

      // Optimistic update to local state
      setPrdContent(prev => ({
        ...prev,
        [sectionKey]: {
          content,
          status,
        },
      }));

      // Add to highlighted sections
      setHighlightedSections(prev => new Set([...prev, sectionKey]));
      
      // Schedule highlight removal
      scheduleHighlightClear(sectionKey);

      // Debounced save to database
      debouncedSave(sectionKey, { content, status });
    }
  }, [scheduleHighlightClear, debouncedSave]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      highlightTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    prdContent,
    highlightedSections,
    isSaving,
    lastSaved,
    isLoading,
    handleSectionUpdates,
    setPrdContent,
  };
}
```

### PrdPreview Component Implementation

```tsx
// src/features/prd/components/PrdBuilder/PrdPreview.tsx
import { PrdSection } from '../PrdSection';
import { PRD_SECTION_KEYS, PRD_SECTION_LABELS } from '../../types';
import type { PrdContent, PrdSectionKey } from '../../types';

interface PrdPreviewProps {
  prdContent: PrdContent;
  highlightedSections: Set<string>;
  ideaTitle?: string;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function PrdPreview({ 
  prdContent, 
  highlightedSections, 
  ideaTitle,
  isSaving,
  lastSaved 
}: PrdPreviewProps) {
  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="border-b border-base-300 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">PRD Preview</h2>
            {ideaTitle && (
              <p className="text-sm text-base-content/60">{ideaTitle}</p>
            )}
          </div>
          <div className="text-xs text-base-content/50">
            {isSaving && (
              <span className="flex items-center gap-1">
                <span className="loading loading-spinner loading-xs" />
                Saving...
              </span>
            )}
            {!isSaving && lastSaved && (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {PRD_SECTION_KEYS.map((sectionKey) => (
          <PrdSection
            key={sectionKey}
            sectionKey={sectionKey as PrdSectionKey}
            section={prdContent[sectionKey]}
            isHighlighted={highlightedSections.has(sectionKey)}
          />
        ))}
      </div>
    </div>
  );
}
```

### PrdSection Component Implementation

```tsx
// src/features/prd/components/PrdSection.tsx
import { SectionStatusBadge } from './SectionStatusBadge';
import { PRD_SECTION_LABELS } from '../types';
import type { PrdSectionKey, PrdSection as PrdSectionType } from '../types';

interface PrdSectionProps {
  sectionKey: PrdSectionKey;
  section: PrdSectionType | undefined;
  isHighlighted: boolean;
}

export function PrdSection({ sectionKey, section, isHighlighted }: PrdSectionProps) {
  const label = PRD_SECTION_LABELS[sectionKey];
  const status = section?.status ?? 'empty';
  const content = section?.content ?? '';

  // Format content with basic markdown support
  const formatContent = (text: string) => {
    if (!text) return null;
    
    // Convert **bold** to <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br />');
    // Convert bullet points
    formatted = formatted.replace(/^- /gm, '• ');
    
    return formatted;
  };

  return (
    <div 
      className={`
        card bg-base-200 transition-all duration-300
        ${isHighlighted ? 'ring-2 ring-primary ring-offset-2 animate-pulse' : ''}
      `}
    >
      <div className="card-body p-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="card-title text-base">{label}</h3>
          <SectionStatusBadge status={status} />
        </div>

        {/* Section Content */}
        {content ? (
          <div 
            className="prose prose-sm max-w-none text-base-content/80"
            dangerouslySetInnerHTML={{ __html: formatContent(content) || '' }}
          />
        ) : (
          <p className="text-base-content/40 italic text-sm">
            This section will be populated as you discuss with the AI assistant...
          </p>
        )}
      </div>
    </div>
  );
}
```

### SectionStatusBadge Component Implementation

```tsx
// src/features/prd/components/SectionStatusBadge.tsx
import type { PrdSectionStatus } from '../types';

interface SectionStatusBadgeProps {
  status: PrdSectionStatus;
}

const statusConfig: Record<PrdSectionStatus, { label: string; className: string }> = {
  empty: { label: 'Empty', className: 'badge-ghost' },
  in_progress: { label: 'In Progress', className: 'badge-warning' },
  complete: { label: 'Complete', className: 'badge-success' },
};

export function SectionStatusBadge({ status }: SectionStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.empty;
  
  return (
    <span className={`badge badge-sm ${config.className}`}>
      {config.label}
    </span>
  );
}
```

### Integration with PrdBuilderPage

```tsx
// In PrdBuilderPage.tsx (from Story 3.2), update to include PrdPreview:
import { ChatInterface, PrdPreview } from '../features/prd/components';
import { usePrdBuilder } from '../features/prd/hooks';

function PrdBuilderPage() {
  const { prdId, idea, prd } = usePrdPageData(); // existing hook from 3.2

  const {
    prdContent,
    highlightedSections,
    isSaving,
    lastSaved,
    handleSectionUpdates,
  } = usePrdBuilder({ prdId: prd?.id ?? '', initialContent: prd?.content });

  return (
    <div className="flex h-screen">
      {/* Left Panel: Chat Interface */}
      <div className="w-1/2 border-r border-base-300">
        <ChatInterface
          prdId={prd.id}
          ideaContext={{
            id: idea.id,
            title: idea.title,
            problem: idea.problem,
            solution: idea.solution,
            impact: idea.impact,
            enhancedProblem: idea.enhanced_problem,
            enhancedSolution: idea.enhanced_solution,
            enhancedImpact: idea.enhanced_impact,
          }}
          prdContent={prdContent}
          onSectionUpdate={handleSectionUpdates}
        />
      </div>

      {/* Right Panel: PRD Preview */}
      <div className="w-1/2">
        <PrdPreview
          prdContent={prdContent}
          highlightedSections={highlightedSections}
          ideaTitle={idea.title ?? idea.problem.substring(0, 50)}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />
      </div>
    </div>
  );
}
```

### CSS for Highlight Animation

```css
/* Add to src/styles/globals.css or component styles */

/* Highlight pulse animation */
@keyframes section-highlight {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(225, 5, 20, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(225, 5, 20, 0);
  }
}

.animate-section-highlight {
  animation: section-highlight 1s ease-out;
}

/* Or use DaisyUI's built-in animate-pulse class with ring */
```

### Barrel Export Updates

**Update `src/features/prd/components/PrdBuilder/index.ts`:**
```typescript
export { PrdBuilder } from './PrdBuilder';
export { ChatInterface } from './ChatInterface';
export { MessageBubble } from './MessageBubble';
export { TypingIndicator } from './TypingIndicator';
export { PrdPreview } from './PrdPreview';
```

**Update `src/features/prd/components/index.ts`:**
```typescript
export * from './PrdBuilder';
export { PrdSection } from './PrdSection';
export { SectionStatusBadge } from './SectionStatusBadge';
export { PrdViewer } from './PrdViewer';
export { PrdProgress } from './PrdProgress';
```

**Update `src/features/prd/hooks/index.ts`:**
```typescript
export { usePrdChat } from './usePrdChat';
export { usePrdBuilder, prdBuilderQueryKeys } from './usePrdBuilder';
export { useAutoSave } from './useAutoSave';
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Component files | `PascalCase.tsx` | `PrdPreview.tsx`, `PrdSection.tsx` |
| Hook files | `camelCase.ts` | `usePrdBuilder.ts` |
| Interface names | `PascalCase` | `PrdPreviewProps`, `PrdSectionProps` |
| CSS classes | DaisyUI pattern | `card`, `badge`, `ring-primary` |
| State variables | `camelCase` | `highlightedSections`, `prdContent` |
| Event handlers | `handle` prefix | `handleSectionUpdates` |
| Query keys | object pattern | `prdBuilderQueryKeys.prd(id)` |

### Anti-Patterns to AVOID

1. **DO NOT** mutate state directly - always use setter functions
2. **DO NOT** forget to clean up timeouts on unmount - causes memory leaks
3. **DO NOT** save to database on every keystroke - use debouncing
4. **DO NOT** block UI during save - use optimistic updates
5. **DO NOT** lose highlight state on re-render - use proper state management
6. **DO NOT** forget error handling for save failures - show user feedback
7. **DO NOT** skip the highlight animation - it's required UX per AC
8. **DO NOT** hardcode section labels - use PRD_SECTION_LABELS constant
9. **DO NOT** render unsanitized HTML without formatting - sanitize user input
10. **DO NOT** forget responsive behavior - preview should stack on mobile

### Performance Requirements (NFR-P5)

- Real-time updates MUST appear within 500ms of AI response
- Debounce database saves to prevent excessive writes (300ms minimum)
- Highlight animations should not block UI thread
- Use optimistic updates for instant visual feedback

### UX Design Requirements (from UX Spec)

1. **Live building experience** - Users see PRD structure emerge as they answer questions
2. **Visual feedback** - Highlighted sections draw attention to new content
3. **Progress visibility** - Status badges show which sections are complete
4. **Non-intrusive saving** - Auto-save happens silently with subtle indicator
5. **Error recovery** - Clear feedback and retry option if save fails
6. **Professional formatting** - Content appears polished, not raw user input

### Dependencies on Previous Stories

- **Story 3.1 (PRD Database):** PrdContent type, prdService.updatePrdSection, PrdSection type
- **Story 3.2 (PRD Builder Page):** PrdBuilderPage component that will embed PrdPreview
- **Story 3.3 (Gemini Edge Function):** Returns sectionUpdates array in response
- **Story 3.4 (Chat Interface):** onSectionUpdate callback prop, usePrdChat integration

### Dependencies for Future Stories

- **Story 3.6 (Auto-Save):** Will extend usePrdBuilder with more robust auto-save logic
- **Story 3.7 (PRD Section Structure):** Will use PrdSection component for section editing
- **Story 3.8 (Mark PRD Complete):** Will use section status to determine completeness
- **Story 3.9 (View Completed PRD):** Will reuse PrdSection component in read-only mode

### Data Flow

```
AI Response received (Story 3.4 ChatInterface)
  → usePrdChat extracts sectionUpdates from response
    → onSectionUpdate callback invoked
      → usePrdBuilder.handleSectionUpdates() processes updates
        → FOR EACH update:
          → Update local prdContent state (optimistic)
          → Add sectionKey to highlightedSections Set
          → Schedule highlight removal (2 second timeout)
          → Debounce database save (300ms)
            → prdService.updatePrdSection() called
              → Database updated
                → Query cache invalidated
                  → "Saved" indicator shown
```

### Section Update Response Format (from Story 3.3)

```typescript
// The Gemini Edge Function returns this structure:
interface PrdChatResponse {
  aiMessage: string;
  sectionUpdates?: PrdSectionUpdate[];
}

// Each section update:
interface PrdSectionUpdate {
  sectionKey: 'problemStatement' | 'goalsAndMetrics' | 'userStories' | 
              'requirements' | 'technicalConsiderations' | 'risks' | 'timeline';
  content: string;  // Professionally formatted by AI
  status: 'in_progress' | 'complete';
}
```

### PRD Sections Reference (from PRD FR22)

The 7 PRD sections that must be populated:
1. **Problem Statement** → `problemStatement`
2. **Goals & Metrics** → `goalsAndMetrics`
3. **User Stories** → `userStories`
4. **Requirements** → `requirements`
5. **Technical Considerations** → `technicalConsiderations`
6. **Risks** → `risks`
7. **Timeline** → `timeline`

### Testing Checklist

- [ ] PrdPreview displays all 7 section placeholders on initial load
- [ ] Each section shows "Empty" status badge initially
- [ ] When AI updates a section, content appears immediately (optimistic)
- [ ] Updated section highlights with ring/pulse animation
- [ ] Highlight clears after approximately 2 seconds
- [ ] Status badge updates to "In Progress" or "Complete" per AI response
- [ ] Multiple simultaneous section updates all display and highlight
- [ ] "Saving..." indicator appears during database save
- [ ] "Saved" confirmation appears after successful save
- [ ] Error toast appears if save fails
- [ ] Content is preserved on save failure (no data loss)
- [ ] PRD preview scrolls if content exceeds viewport
- [ ] Section content renders with professional formatting (bold, lists)
- [ ] Responsive layout: preview stacks below chat on mobile
- [ ] Page refresh preserves all saved section content

### Project Structure Notes

- PrdPreview is a new component within PrdBuilder folder
- PrdSection and SectionStatusBadge are shared components in prd/components
- usePrdBuilder encapsulates all PRD content state and persistence
- Uses React Query for server state, local state for optimistic UI
- Integrates with existing ChatInterface via callback prop

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR21 Real-time PRD section generation]
- [Source: _bmad-output/planning-artifacts/prd.md#FR23 Live PRD building visualization]
- [Source: _bmad-output/planning-artifacts/prd.md#NFR-P5 Real-Time Updates]
- [Source: _bmad-output/implementation-artifacts/3-1-create-prd-database-tables-and-service-layer.md]
- [Source: _bmad-output/implementation-artifacts/3-4-chat-interface-with-ai-assistant.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
