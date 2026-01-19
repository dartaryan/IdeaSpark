# Story 3.7: PRD Section Structure and Content

Status: ready-for-dev

## Story

As a **user**,
I want **my PRD to have all the standard sections filled out**,
So that **my document is comprehensive and professional**.

## Acceptance Criteria

1. **Given** I am building a PRD **When** the AI guides me through the process **Then** it covers all required sections: Problem Statement, Goals & Metrics, User Stories, Requirements, Technical Considerations, Risks, Timeline **And** the AI asks relevant questions for each section

2. **Given** I am chatting with the AI assistant **When** I provide information relevant to a PRD section **Then** I can see which sections are complete vs incomplete **And** sections show clear status indicators (empty, in_progress, complete)

3. **Given** I am viewing the PRD preview **When** sections are being populated **Then** each section displays its current status prominently **And** empty sections show placeholder guidance on what information is needed

4. **Given** the AI assistant is guiding me **When** we've covered enough for a section **Then** the AI suggests when we have sufficient content for that section **And** the AI naturally transitions to the next incomplete section

5. **Given** I try to mark PRD as complete **When** required sections are missing or incomplete **Then** I see a validation summary showing which sections need more information **And** I am guided back to complete them with specific prompts

6. **Given** I want to focus on a specific section **When** I click on an incomplete section in the PRD preview **Then** the AI assistant focuses its questions on that section **And** I can request to work on any section out of order

7. **Given** all required sections are complete **When** I view the PRD **Then** I see a clear "Ready to Complete" indicator **And** the "Mark as Complete" button becomes enabled

## Tasks / Subtasks

- [ ] Task 1: Define PRD section schema and validation rules (AC: 1, 5)
  - [ ] Create `src/features/prd/constants/prdSections.ts` with section definitions
  - [ ] Define PRD_SECTIONS array with id, title, description, required flag, minContentLength
  - [ ] Define section order for guided flow
  - [ ] Create section validation utility functions
  - [ ] Export PrdSectionKey type for type safety

- [ ] Task 2: Update PrdContent type with proper section typing (AC: 1, 2)
  - [ ] Update `src/features/prd/types.ts` with detailed PrdContent interface
  - [ ] Add PrdSection interface with content, status, lastUpdated
  - [ ] Add PrdSectionStatus type: 'empty' | 'in_progress' | 'complete'
  - [ ] Add validation state types for completion check

- [ ] Task 3: Create section completion validation logic (AC: 5, 7)
  - [ ] Create `src/features/prd/utils/validatePrdCompletion.ts`
  - [ ] Implement validateSection(section, rules) function
  - [ ] Implement validateAllSections(prdContent) returning ValidationResult
  - [ ] Return array of incomplete sections with specific guidance messages
  - [ ] Export isReadyToComplete(prdContent) helper

- [ ] Task 4: Create SectionStatusBadge component (AC: 2, 3)
  - [ ] Update `src/features/prd/components/SectionStatusBadge.tsx`
  - [ ] Display different badge styles: empty (gray), in_progress (warning/yellow), complete (success/green)
  - [ ] Show appropriate icons for each status
  - [ ] Use DaisyUI badge styling with PassportCard theme

- [ ] Task 5: Create PrdSectionCard component for preview (AC: 3, 6)
  - [ ] Create `src/features/prd/components/PrdSectionCard.tsx`
  - [ ] Display section title, status badge, and content preview
  - [ ] Show placeholder guidance for empty sections
  - [ ] Make clickable to focus AI on that section
  - [ ] Highlight when section was recently updated

- [ ] Task 6: Update PrdPreview to show section completion status (AC: 2, 3, 7)
  - [ ] Update `src/features/prd/components/PrdBuilder/PrdPreview.tsx`
  - [ ] Display all 7 sections with current status
  - [ ] Show overall completion progress indicator
  - [ ] Display "Ready to Complete" banner when all sections complete
  - [ ] Wire section clicks to onSectionFocus callback

- [ ] Task 7: Enhance AI prompting for section-focused guidance (AC: 1, 4, 6)
  - [ ] Update `supabase/functions/gemini-prd-chat/index.ts`
  - [ ] Add PRD_SECTION_PROMPTS with section-specific questions
  - [ ] Add logic to detect which section conversation relates to
  - [ ] Add section completion detection in AI responses
  - [ ] Add natural transition prompts between sections
  - [ ] Support user-requested section focus

- [ ] Task 8: Update usePrdBuilder to track section completion (AC: 2, 5, 7)
  - [ ] Update `src/features/prd/hooks/usePrdBuilder.ts`
  - [ ] Add sectionStatuses computed property
  - [ ] Add completionValidation state for mark-complete check
  - [ ] Expose validateForCompletion() function
  - [ ] Track which sections need attention

- [ ] Task 9: Create CompletionValidationModal component (AC: 5)
  - [ ] Create `src/features/prd/components/CompletionValidationModal.tsx`
  - [ ] Display list of incomplete sections with specific issues
  - [ ] Provide "Focus on this section" buttons
  - [ ] Show clear call-to-action to continue building
  - [ ] Use DaisyUI modal styling

- [ ] Task 10: Integrate completion validation into PrdBuilderPage (AC: 5, 7)
  - [ ] Add "Mark as Complete" button to PrdBuilderPage header
  - [ ] Wire button to validation check before status change
  - [ ] Show CompletionValidationModal if validation fails
  - [ ] Enable/disable button based on completion readiness
  - [ ] Integrate with Story 3.8 completion flow

- [ ] Task 11: Update barrel exports
  - [ ] Export new components from `src/features/prd/components/index.ts`
  - [ ] Export constants from `src/features/prd/constants/index.ts`
  - [ ] Export utils from `src/features/prd/utils/index.ts`

## Dev Notes

### Architecture Patterns (MANDATORY)

**Component Location:**
```
src/features/prd/
├── components/
│   ├── PrdBuilder/
│   │   ├── PrdBuilder.tsx          (FROM 3.2)
│   │   ├── ChatInterface.tsx       (FROM 3.4)
│   │   ├── PrdPreview.tsx          (FROM 3.5 - UPDATE)
│   │   └── index.ts
│   ├── SectionStatusBadge.tsx      (FROM 3.5 - UPDATE)
│   ├── PrdSectionCard.tsx          (THIS STORY - NEW)
│   ├── CompletionValidationModal.tsx (THIS STORY - NEW)
│   ├── SaveIndicator.tsx           (FROM 3.6)
│   └── index.ts                    (UPDATE - add exports)
├── constants/
│   ├── prdSections.ts              (THIS STORY - NEW)
│   └── index.ts                    (THIS STORY - NEW)
├── hooks/
│   ├── usePrdBuilder.ts            (FROM 3.5 - UPDATE)
│   ├── usePrdChat.ts               (FROM 3.4)
│   ├── useAutoSave.ts              (FROM 3.6)
│   └── index.ts
├── utils/
│   ├── validatePrdCompletion.ts    (THIS STORY - NEW)
│   └── index.ts                    (THIS STORY - NEW)
├── services/
│   ├── prdService.ts               (FROM 3.1)
│   ├── prdMessageService.ts        (FROM 3.1)
│   └── prdChatService.ts           (FROM 3.3)
└── types.ts                        (FROM 3.1 - UPDATE)
```

### PRD Section Definitions (FR22)

Per PRD FR22, the PRD includes these sections:
1. **problem_statement** - Clear articulation of the problem being solved
2. **goals_metrics** - Goals & Metrics (success criteria, KPIs)
3. **user_stories** - User Stories (who uses it, what they do)
4. **requirements** - Functional and non-functional requirements
5. **technical_considerations** - Technical architecture, constraints, dependencies
6. **risks** - Risk assessment and mitigation strategies
7. **timeline** - Implementation timeline and milestones

### PRD Sections Constant Definition

```typescript
// src/features/prd/constants/prdSections.ts
export const PRD_SECTION_KEYS = [
  'problem_statement',
  'goals_metrics',
  'user_stories',
  'requirements',
  'technical_considerations',
  'risks',
  'timeline',
] as const;

export type PrdSectionKey = typeof PRD_SECTION_KEYS[number];

export interface PrdSectionDefinition {
  key: PrdSectionKey;
  title: string;
  description: string;
  placeholder: string;
  required: boolean;
  minContentLength: number;
  guideQuestions: string[];
}

export const PRD_SECTIONS: PrdSectionDefinition[] = [
  {
    key: 'problem_statement',
    title: 'Problem Statement',
    description: 'A clear articulation of the problem you\'re solving',
    placeholder: 'What specific problem does your idea address? Who experiences this problem?',
    required: true,
    minContentLength: 100,
    guideQuestions: [
      'What specific problem are you trying to solve?',
      'Who experiences this problem most acutely?',
      'What is the current impact of this problem?',
      'Why is this problem worth solving now?',
    ],
  },
  {
    key: 'goals_metrics',
    title: 'Goals & Metrics',
    description: 'Success criteria and key performance indicators',
    placeholder: 'How will you measure success? What specific metrics will improve?',
    required: true,
    minContentLength: 80,
    guideQuestions: [
      'What does success look like for this solution?',
      'What specific metrics will you use to measure success?',
      'What are your target improvements (e.g., 30% reduction in X)?',
      'How will you track and report on these metrics?',
    ],
  },
  {
    key: 'user_stories',
    title: 'User Stories',
    description: 'Descriptions of who uses this and what they can do',
    placeholder: 'As a [user type], I want [capability], so that [benefit]...',
    required: true,
    minContentLength: 100,
    guideQuestions: [
      'Who are the primary users of this solution?',
      'What are the key actions they need to perform?',
      'What benefit does each action provide?',
      'Are there different user types with different needs?',
    ],
  },
  {
    key: 'requirements',
    title: 'Requirements',
    description: 'Functional and non-functional requirements',
    placeholder: 'What must the solution do? What constraints must it meet?',
    required: true,
    minContentLength: 100,
    guideQuestions: [
      'What are the must-have features?',
      'What are nice-to-have features?',
      'Are there performance requirements?',
      'Are there security or compliance requirements?',
    ],
  },
  {
    key: 'technical_considerations',
    title: 'Technical Considerations',
    description: 'Architecture, constraints, and technical dependencies',
    placeholder: 'What technical aspects need to be considered?',
    required: true,
    minContentLength: 50,
    guideQuestions: [
      'What existing systems does this need to integrate with?',
      'Are there technical constraints to consider?',
      'What data or APIs will be needed?',
      'Are there scalability considerations?',
    ],
  },
  {
    key: 'risks',
    title: 'Risks',
    description: 'Risk assessment and mitigation strategies',
    placeholder: 'What could go wrong? How would you mitigate these risks?',
    required: true,
    minContentLength: 50,
    guideQuestions: [
      'What are the biggest risks to this project?',
      'What technical risks exist?',
      'What could cause delays or failures?',
      'How would you mitigate each risk?',
    ],
  },
  {
    key: 'timeline',
    title: 'Timeline',
    description: 'Implementation timeline and milestones',
    placeholder: 'What is the expected timeline? What are the key milestones?',
    required: false,
    minContentLength: 30,
    guideQuestions: [
      'What is the expected timeline for implementation?',
      'What are the key milestones?',
      'Are there dependencies that affect timing?',
      'What would a phased rollout look like?',
    ],
  },
];

export const REQUIRED_SECTIONS = PRD_SECTIONS.filter(s => s.required);

export function getSectionByKey(key: PrdSectionKey): PrdSectionDefinition | undefined {
  return PRD_SECTIONS.find(s => s.key === key);
}
```

### Updated Type Definitions

```typescript
// src/features/prd/types.ts (UPDATED)
import type { PrdSectionKey } from './constants/prdSections';

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
  status: 'draft' | 'complete';
  created_at: string;
  updated_at: string;
}

export interface PrdMessage {
  id: string;
  prd_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SectionValidationResult {
  key: PrdSectionKey;
  isValid: boolean;
  issues: string[];
}

export interface PrdCompletionValidation {
  isReady: boolean;
  completedCount: number;
  totalRequired: number;
  sectionResults: SectionValidationResult[];
  incompleteRequired: SectionValidationResult[];
}
```

### Validation Utility Implementation

```typescript
// src/features/prd/utils/validatePrdCompletion.ts
import { PRD_SECTIONS, REQUIRED_SECTIONS, type PrdSectionKey } from '../constants/prdSections';
import type { PrdContent, PrdSection, SectionValidationResult, PrdCompletionValidation } from '../types';

export function validateSection(
  key: PrdSectionKey,
  section: PrdSection | undefined
): SectionValidationResult {
  const definition = PRD_SECTIONS.find(s => s.key === key);
  if (!definition) {
    return { key, isValid: false, issues: ['Unknown section'] };
  }

  const issues: string[] = [];

  // Check if section exists and has content
  if (!section || !section.content || section.content.trim().length === 0) {
    issues.push(`${definition.title} is empty`);
    return { key, isValid: false, issues };
  }

  // Check minimum content length
  if (section.content.trim().length < definition.minContentLength) {
    issues.push(
      `${definition.title} needs more detail (minimum ${definition.minContentLength} characters, currently ${section.content.trim().length})`
    );
  }

  // Check if marked as complete
  if (section.status !== 'complete') {
    issues.push(`${definition.title} is still in progress`);
  }

  return {
    key,
    isValid: issues.length === 0,
    issues,
  };
}

export function validateAllSections(prdContent: PrdContent): PrdCompletionValidation {
  const sectionResults = REQUIRED_SECTIONS.map(def => 
    validateSection(def.key, prdContent[def.key])
  );

  const incompleteRequired = sectionResults.filter(r => !r.isValid);
  const completedCount = sectionResults.filter(r => r.isValid).length;

  return {
    isReady: incompleteRequired.length === 0,
    completedCount,
    totalRequired: REQUIRED_SECTIONS.length,
    sectionResults,
    incompleteRequired,
  };
}

export function isReadyToComplete(prdContent: PrdContent): boolean {
  return validateAllSections(prdContent).isReady;
}

export function getSectionStatus(section: PrdSection | undefined): PrdSectionStatus {
  if (!section || !section.content || section.content.trim().length === 0) {
    return 'empty';
  }
  return section.status || 'in_progress';
}
```

### SectionStatusBadge Component

```tsx
// src/features/prd/components/SectionStatusBadge.tsx
import { CheckCircleIcon, PencilSquareIcon, DocumentIcon } from '@heroicons/react/24/outline';
import type { PrdSectionStatus } from '../types';

interface SectionStatusBadgeProps {
  status: PrdSectionStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<PrdSectionStatus, {
  label: string;
  className: string;
  icon: typeof CheckCircleIcon;
}> = {
  empty: {
    label: 'Not Started',
    className: 'badge-ghost text-base-content/50',
    icon: DocumentIcon,
  },
  in_progress: {
    label: 'In Progress',
    className: 'badge-warning',
    icon: PencilSquareIcon,
  },
  complete: {
    label: 'Complete',
    className: 'badge-success',
    icon: CheckCircleIcon,
  },
};

export function SectionStatusBadge({ status, size = 'sm' }: SectionStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'badge-sm' : '';

  return (
    <span className={`badge gap-1 ${config.className} ${sizeClass}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </span>
  );
}
```

### PrdSectionCard Component

```tsx
// src/features/prd/components/PrdSectionCard.tsx
import { SectionStatusBadge } from './SectionStatusBadge';
import { getSectionByKey } from '../constants/prdSections';
import type { PrdSection, PrdSectionKey, PrdSectionStatus } from '../types';
import { getSectionStatus } from '../utils/validatePrdCompletion';

interface PrdSectionCardProps {
  sectionKey: PrdSectionKey;
  section: PrdSection | undefined;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export function PrdSectionCard({
  sectionKey,
  section,
  isHighlighted = false,
  onClick,
}: PrdSectionCardProps) {
  const definition = getSectionByKey(sectionKey);
  if (!definition) return null;

  const status = getSectionStatus(section);
  const hasContent = section?.content && section.content.trim().length > 0;

  return (
    <div
      className={`card bg-base-100 border cursor-pointer transition-all hover:shadow-md ${
        isHighlighted ? 'ring-2 ring-primary border-primary animate-pulse-subtle' : 'border-base-300'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-sm font-semibold">{definition.title}</h3>
          <SectionStatusBadge status={status} size="sm" />
        </div>

        {/* Content or Placeholder */}
        {hasContent ? (
          <div className="text-sm text-base-content/70 line-clamp-3 mt-2">
            {section!.content}
          </div>
        ) : (
          <div className="text-sm text-base-content/40 italic mt-2">
            {definition.placeholder}
          </div>
        )}

        {/* Click hint */}
        <div className="text-xs text-base-content/40 mt-2">
          Click to focus AI on this section
        </div>
      </div>
    </div>
  );
}
```

### CompletionValidationModal Component

```tsx
// src/features/prd/components/CompletionValidationModal.tsx
import { ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { PrdCompletionValidation, PrdSectionKey } from '../types';
import { getSectionByKey } from '../constants/prdSections';

interface CompletionValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: PrdCompletionValidation;
  onFocusSection: (key: PrdSectionKey) => void;
}

export function CompletionValidationModal({
  isOpen,
  onClose,
  validation,
  onFocusSection,
}: CompletionValidationModalProps) {
  if (!isOpen) return null;

  const handleFocusSection = (key: PrdSectionKey) => {
    onFocusSection(key);
    onClose();
  };

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-warning/20">
            <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h3 className="font-bold text-lg">PRD Not Ready</h3>
            <p className="text-sm text-base-content/60">
              {validation.completedCount} of {validation.totalRequired} required sections complete
            </p>
          </div>
        </div>

        {/* Incomplete Sections List */}
        <div className="space-y-3">
          <p className="text-sm text-base-content/70">
            Please complete the following sections before marking your PRD as complete:
          </p>
          
          <div className="space-y-2">
            {validation.incompleteRequired.map(result => {
              const definition = getSectionByKey(result.key);
              return (
                <div
                  key={result.key}
                  className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{definition?.title}</p>
                    <p className="text-xs text-base-content/60">
                      {result.issues[0]}
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-ghost gap-1"
                    onClick={() => handleFocusSection(result.key)}
                  >
                    Focus
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Continue Editing
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
```

### Updated PrdPreview Component

```tsx
// src/features/prd/components/PrdBuilder/PrdPreview.tsx (UPDATED)
import { PRD_SECTIONS, REQUIRED_SECTIONS } from '../../constants/prdSections';
import { PrdSectionCard } from '../PrdSectionCard';
import { validateAllSections } from '../../utils/validatePrdCompletion';
import type { PrdContent, PrdSectionKey } from '../../types';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface PrdPreviewProps {
  prdContent: PrdContent;
  highlightedSections: Set<string>;
  ideaTitle: string;
  isSaving?: boolean;
  lastSaved?: Date | null;
  onSectionFocus?: (key: PrdSectionKey) => void;
}

export function PrdPreview({
  prdContent,
  highlightedSections,
  ideaTitle,
  isSaving,
  lastSaved,
  onSectionFocus,
}: PrdPreviewProps) {
  const validation = validateAllSections(prdContent);
  const progressPercent = Math.round(
    (validation.completedCount / validation.totalRequired) * 100
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with Progress */}
      <div className="px-4 py-3 border-b border-base-300 bg-base-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">PRD Preview</h2>
          {validation.isReady && (
            <span className="flex items-center gap-1 text-success text-sm font-medium">
              <CheckCircleIcon className="w-5 h-5" />
              Ready to Complete
            </span>
          )}
        </div>
        <p className="text-sm text-base-content/60 mb-2">{ideaTitle}</p>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <progress
            className="progress progress-primary flex-1 h-2"
            value={validation.completedCount}
            max={validation.totalRequired}
          />
          <span className="text-xs text-base-content/60 whitespace-nowrap">
            {validation.completedCount}/{validation.totalRequired} sections
          </span>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-4">
          {PRD_SECTIONS.map(def => (
            <PrdSectionCard
              key={def.key}
              sectionKey={def.key}
              section={prdContent[def.key]}
              isHighlighted={highlightedSections.has(def.key)}
              onClick={() => onSectionFocus?.(def.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### AI Edge Function Enhancement for Section Focus

```typescript
// supabase/functions/gemini-prd-chat/index.ts (ADDITIONS)

// Add to the system prompt for section-aware conversations:
const SECTION_GUIDANCE_PROMPT = `
You are guiding the user to build a comprehensive PRD. The PRD has these sections:

1. Problem Statement - Clear articulation of the problem
2. Goals & Metrics - Success criteria and KPIs  
3. User Stories - Who uses this and what they do
4. Requirements - Functional and non-functional requirements
5. Technical Considerations - Architecture, constraints, dependencies
6. Risks - Risk assessment and mitigation
7. Timeline - Implementation timeline (optional)

CRITICAL BEHAVIORS:
- Always ask questions that relate to ONE specific section
- After each user response, extract information for the relevant section
- When a section has enough detail (2-3 substantive points), suggest moving to the next section
- Use natural transitions: "Great, that gives us a solid problem statement. Now let's think about how we'll measure success..."
- If user wants to focus on a specific section, pivot to that section's questions
- Track which sections are complete and guide user to incomplete sections
- When all sections have content, congratulate and suggest reviewing/completing

SECTION DETECTION:
Include in your response a JSON block that indicates section updates:
\`\`\`json
{
  "sectionUpdates": [
    {
      "sectionKey": "problem_statement",
      "content": "The extracted/generated content for this section",
      "status": "in_progress" | "complete"
    }
  ],
  "suggestedNextSection": "goals_metrics" | null,
  "allSectionsReady": false
}
\`\`\`
`;

// Handle user requesting focus on specific section
function buildSectionFocusPrompt(sectionKey: PrdSectionKey): string {
  const sectionQuestions: Record<string, string[]> = {
    problem_statement: [
      "Let's focus on the problem statement. Can you describe the specific problem you're trying to solve?",
      "Who experiences this problem? How does it impact them?",
    ],
    goals_metrics: [
      "Let's define success metrics. What would success look like for this solution?",
      "What specific numbers or KPIs would you track?",
    ],
    user_stories: [
      "Let's think about the users. Who are the primary users of this solution?",
      "What are the key things they need to be able to do?",
    ],
    requirements: [
      "Let's define the requirements. What must this solution do?",
      "Are there any constraints or must-haves we should capture?",
    ],
    technical_considerations: [
      "Let's consider technical aspects. What systems does this need to work with?",
      "Are there any technical constraints or dependencies?",
    ],
    risks: [
      "Let's identify risks. What could go wrong with this project?",
      "How might we mitigate the biggest risks?",
    ],
    timeline: [
      "Let's talk timeline. What's a realistic timeframe for this?",
      "What would the key milestones be?",
    ],
  };

  return sectionQuestions[sectionKey]?.[0] ?? "Let's work on that section.";
}
```

### Updated usePrdBuilder Hook

```typescript
// src/features/prd/hooks/usePrdBuilder.ts (ADDITIONS)
import { validateAllSections, isReadyToComplete } from '../utils/validatePrdCompletion';
import type { PrdCompletionValidation, PrdSectionKey } from '../types';

// Add to the hook return:
export function usePrdBuilder({ prdId, initialContent }: UsePrdBuilderOptions) {
  // ... existing implementation ...

  // Section completion tracking
  const completionValidation = useMemo<PrdCompletionValidation>(
    () => validateAllSections(prdContent),
    [prdContent]
  );

  const canMarkComplete = useMemo(
    () => isReadyToComplete(prdContent),
    [prdContent]
  );

  // Focus on specific section (sends message to AI to pivot)
  const [focusedSection, setFocusedSection] = useState<PrdSectionKey | null>(null);

  const focusOnSection = useCallback((sectionKey: PrdSectionKey) => {
    setFocusedSection(sectionKey);
    // The ChatInterface will pick this up and inform the AI
  }, []);

  const clearFocusedSection = useCallback(() => {
    setFocusedSection(null);
  }, []);

  return {
    // ... existing return values ...
    completionValidation,
    canMarkComplete,
    focusedSection,
    focusOnSection,
    clearFocusedSection,
  };
}
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Section keys | `snake_case` | `problem_statement`, `goals_metrics` |
| Component files | `PascalCase.tsx` | `PrdSectionCard.tsx`, `CompletionValidationModal.tsx` |
| Constant files | `camelCase.ts` | `prdSections.ts` |
| Utility files | `camelCase.ts` | `validatePrdCompletion.ts` |
| Interface names | `PascalCase` | `PrdSectionDefinition`, `PrdCompletionValidation` |
| Type exports | `PascalCase` | `PrdSectionKey`, `PrdSectionStatus` |
| CSS classes | DaisyUI pattern | `badge-success`, `modal-open`, `progress-primary` |

### Anti-Patterns to AVOID

1. **DO NOT** hardcode section names - always use PRD_SECTIONS constant
2. **DO NOT** allow marking complete without validation - always check all required sections
3. **DO NOT** show confusing status - status must be clear: empty, in_progress, complete
4. **DO NOT** block user from any section - allow working out of order
5. **DO NOT** lose section focus context - maintain focus state across messages
6. **DO NOT** forget to update section status - AI must include sectionUpdates in responses
7. **DO NOT** make validation too strict - minimum content lengths are guides, not hard blocks
8. **DO NOT** hide progress from user - always show completion status prominently
9. **DO NOT** forget accessibility - cards must be keyboard navigable
10. **DO NOT** create duplicate validation logic - use shared utility functions

### Performance Requirements (NFR-P4, NFR-P5)

- Section status calculations should be instant (computed from state)
- Validation modal should appear immediately on click
- Section focus should trigger AI pivot within 3 seconds
- Progress bar should update in real-time as sections complete

### UX Design Requirements (from UX Spec)

1. **Progressive accomplishment** - Visual progress tracking with section completion indicators
2. **Clear status visibility** - Users always know which sections are complete vs incomplete
3. **Guided experience** - AI naturally transitions between sections
4. **User control** - Users can work on any section in any order
5. **Professional validation** - Clear, helpful guidance when PRD isn't ready
6. **Celebration moment** - "Ready to Complete" indicator when all sections done

### Dependencies on Previous Stories

- **Story 3.1 (PRD Database):** prdService, PrdDocument type, prd_documents table
- **Story 3.2 (PRD Builder Page):** PrdBuilderPage component structure
- **Story 3.3 (Gemini Edge Function):** gemini-prd-chat Edge Function
- **Story 3.4 (Chat Interface):** ChatInterface component, usePrdChat hook
- **Story 3.5 (Real-Time Section Generation):** PrdPreview component, section highlighting
- **Story 3.6 (Auto-Save):** useAutoSave hook, SaveIndicator component

### Dependencies for Future Stories

- **Story 3.8 (Mark PRD Complete):** Uses completionValidation from this story
- **Story 3.9 (View Completed PRD):** Uses section structure from this story

### Data Flow

```
User viewing PRD Builder:
  → PrdPreview displays all sections with status
    → validateAllSections() computes completion state
      → Progress bar shows X/Y complete
        → "Ready to Complete" appears if all required sections done

User clicks on incomplete section:
  → onSectionFocus(sectionKey) called
    → usePrdBuilder.focusOnSection() sets focusedSection
      → ChatInterface detects focus change
        → Sends system message to AI: "User wants to focus on {section}"
          → AI pivots to ask questions for that section

User tries to mark complete with missing sections:
  → validateAllSections() returns incompleteRequired
    → CompletionValidationModal opens
      → Shows list of incomplete sections with issues
        → User clicks "Focus" on a section
          → focusOnSection() called, modal closes
            → AI guides user through completing that section

AI provides section update:
  → Response includes sectionUpdates JSON
    → handleSectionUpdates() processes updates
      → prdContent state updates
        → Auto-save triggers
          → PrdPreview re-renders with new status
            → Progress bar updates
```

### Testing Checklist

- [ ] All 7 PRD sections display in preview
- [ ] Section status badges show correct state (empty, in_progress, complete)
- [ ] Progress bar updates as sections are completed
- [ ] "Ready to Complete" indicator appears when all required sections done
- [ ] Clicking section card triggers AI focus on that section
- [ ] AI transitions naturally between sections
- [ ] AI suggests completion when section has enough content
- [ ] Validation modal appears when trying to complete with missing sections
- [ ] Validation modal shows specific issues for each incomplete section
- [ ] "Focus" button in modal closes modal and focuses AI on section
- [ ] Section minimum content length validation works
- [ ] Optional sections (timeline) don't block completion
- [ ] Keyboard navigation works on section cards
- [ ] Responsive layout works on mobile (stacked sections)

### Project Structure Notes

- PRD_SECTIONS constant is single source of truth for section definitions
- Validation logic is in utils for reuse across components
- Section status is computed, not stored separately (derived from content)
- AI is responsible for detecting section relevance and suggesting transitions
- CompletionValidationModal is reusable for Story 3.8 completion flow

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.7]
- [Source: _bmad-output/planning-artifacts/prd.md#FR22 PRD sections]
- [Source: _bmad-output/planning-artifacts/prd.md#FR21 Real-time section generation]
- [Source: _bmad-output/planning-artifacts/prd.md#FR25 Mark PRD as complete]
- [Source: _bmad-output/planning-artifacts/architecture.md#Feature Structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Progressive Accomplishment]
- [Source: _bmad-output/implementation-artifacts/3-5-real-time-prd-section-generation.md]
- [Source: _bmad-output/implementation-artifacts/3-6-prd-auto-save-functionality.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
