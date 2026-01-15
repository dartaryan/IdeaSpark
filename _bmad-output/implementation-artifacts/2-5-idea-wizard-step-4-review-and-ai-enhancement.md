# Story 2.5: Idea Wizard - Step 4 Review and AI Enhancement

Status: ready-for-dev

## Story

As a **user**,
I want **to review my complete idea and see AI enhancements**,
So that **I can submit a polished, professional proposal**.

## Acceptance Criteria

1. **Given** I completed Steps 1-3 **When** I proceed to Step 4 **Then** I see all my inputs displayed in a review format (problem, solution, impact sections)

2. **Given** I am on Step 4 **Then** I see an "Enhance with AI" button prominently displayed

3. **Given** I am on Step 4 **Then** I can edit any section by clicking on it (inline editing or modal)

4. **Given** I am on Step 4 **Then** I see a progress indicator showing step 4 of 4 (steps 1-3 complete, step 4 current)

5. **Given** I click "Enhance with AI" **When** the AI is processing **Then** I see a loading indicator with status message

6. **Given** I click "Enhance with AI" **When** the AI processes my idea **Then** within 5 seconds I see enhanced versions of my problem, solution, and impact

7. **Given** AI enhancement completes **Then** I can compare original vs enhanced text side-by-side for each section

8. **Given** I see enhanced text **Then** I can choose to use the enhanced version or keep original for each section independently (toggle/radio per section)

9. **Given** I have selected my preferred versions **Then** clicking "Back" returns to Step 3 with my current text preserved (original or enhanced)

10. **Given** AI enhancement fails **Then** I see a user-friendly error message and can proceed with original text OR retry

## Tasks / Subtasks

- [ ] Task 1: Create StepReview component structure (AC: 1, 2, 4)
  - [ ] Create `StepReview.tsx` in `src/features/ideas/components/IdeaWizard/`
  - [ ] Implement review card layout displaying problem, solution, impact
  - [ ] Style review cards with `bg-base-200` background
  - [ ] Add "Enhance with AI" button (`btn-primary` with sparkle icon)
  - [ ] Pass step 4 rendering to IdeaWizard parent

- [ ] Task 2: Implement inline editing capability (AC: 3)
  - [ ] Add edit icon button to each review section
  - [ ] Implement collapsible/expandable edit mode per section
  - [ ] Use controlled textarea for editing (tied to form context)
  - [ ] Show "Save" and "Cancel" buttons in edit mode
  - [ ] Validate edited content meets minimum character requirements

- [ ] Task 3: Create useEnhanceIdea hook (AC: 5, 6, 10)
  - [ ] Create `src/features/ideas/hooks/useEnhanceIdea.ts`
  - [ ] Use React Query mutation pattern
  - [ ] Call geminiService.enhanceIdea() (or stub for now)
  - [ ] Handle loading, success, and error states
  - [ ] Return enhanced versions of problem, solution, impact

- [ ] Task 4: Implement AI enhancement UI flow (AC: 5, 6)
  - [ ] Show loading spinner with "Enhancing your idea..." message when processing
  - [ ] Disable "Enhance with AI" button during processing
  - [ ] Display enhanced content in comparison view on success
  - [ ] Show toast notification on success

- [ ] Task 5: Implement comparison view (AC: 7, 8)
  - [ ] Create `ComparisonSection.tsx` sub-component for each field
  - [ ] Display "Original" and "Enhanced" side-by-side (or stacked on mobile)
  - [ ] Add radio buttons/toggle to select which version to use per section
  - [ ] Highlight differences visually (optional - nice to have)
  - [ ] Update form context with selected version

- [ ] Task 6: Handle error states (AC: 10)
  - [ ] Display error alert with "Try Again" button
  - [ ] Allow proceeding with original text on error
  - [ ] Implement retry logic (up to 3 attempts built into service)
  - [ ] Show helpful error message explaining the issue

- [ ] Task 7: Update IdeaWizard for Step 4 routing (AC: 4, 9)
  - [ ] Add StepReview import and render for `currentStep === 4`
  - [ ] Update step indicator label to "Review & Enhance"
  - [ ] Ensure form data persists across all steps
  - [ ] Add "Back" navigation to return to Step 3

- [ ] Task 8: Create geminiService stub (dependency for Story 2.6)
  - [ ] Create `src/services/geminiService.ts` if not exists
  - [ ] Add `enhanceIdea(problem, solution, impact)` function signature
  - [ ] For now, implement with mock delay + mock enhanced text
  - [ ] Document Edge Function contract for Story 2.6

## Dev Notes

### Architecture Patterns (MANDATORY)

**Feature Folder Structure:**
```
src/features/ideas/
├── components/
│   └── IdeaWizard/
│       ├── IdeaWizard.tsx           (UPDATE - add Step 4 routing)
│       ├── StepIndicator.tsx        (FROM Story 2.2 - no changes)
│       ├── StepProblem.tsx          (FROM Story 2.2 - no changes)
│       ├── StepSolution.tsx         (FROM Story 2.3 - no changes)
│       ├── StepImpact.tsx           (FROM Story 2.4 - no changes)
│       ├── StepReview.tsx           (THIS STORY - NEW)
│       ├── ComparisonSection.tsx    (THIS STORY - NEW sub-component)
│       └── index.ts                 (UPDATE - export StepReview)
├── hooks/
│   ├── useEnhanceIdea.ts            (THIS STORY - NEW)
│   └── index.ts                     (UPDATE - export hook)
├── pages/
│   └── NewIdeaPage.tsx              (FROM Story 2.2 - no changes)
├── schemas/
│   └── ideaSchemas.ts               (FROM Story 2.2 - may need update)
├── services/
│   └── ideaService.ts               (Story 2.1 - exists, may need update)
└── types.ts                         (FROM Story 2.1 - may need update)

src/services/
└── geminiService.ts                 (THIS STORY - NEW global service)
```

### StepReview Component Implementation

```tsx
// src/features/ideas/components/IdeaWizard/StepReview.tsx
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { IdeaWizardFormData } from '../../schemas/ideaSchemas';
import { useEnhanceIdea } from '../../hooks/useEnhanceIdea';
import { ComparisonSection } from './ComparisonSection';

interface StepReviewProps {
  onBack: () => void;
  onSubmit: () => void;  // Will be implemented in Story 2.7
}

interface EnhancedContent {
  problem: string;
  solution: string;
  impact: string;
}

export function StepReview({ onBack, onSubmit }: StepReviewProps) {
  const { watch, setValue } = useFormContext<IdeaWizardFormData>();
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState<EnhancedContent | null>(null);
  const [selectedVersions, setSelectedVersions] = useState({
    problem: 'original' as 'original' | 'enhanced',
    solution: 'original' as 'original' | 'enhanced',
    impact: 'original' as 'original' | 'enhanced',
  });
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const problemValue = watch('problem');
  const solutionValue = watch('solution');
  const impactValue = watch('impact');

  const { mutate: enhanceIdea, isPending: isEnhancing, error } = useEnhanceIdea();

  const handleEnhance = () => {
    enhanceIdea(
      { problem: problemValue, solution: solutionValue, impact: impactValue },
      {
        onSuccess: (data) => {
          setEnhancedContent(data);
          setIsEnhanced(true);
        },
      }
    );
  };

  const handleSelectVersion = (field: keyof typeof selectedVersions, version: 'original' | 'enhanced') => {
    setSelectedVersions((prev) => ({ ...prev, [field]: version }));
    
    // Update form value based on selection
    if (enhancedContent && version === 'enhanced') {
      setValue(field, enhancedContent[field]);
    } else {
      // Keep original (already in form)
    }
  };

  const handleEditSection = (section: string) => {
    setEditingSection(section);
  };

  const handleSaveEdit = () => {
    setEditingSection(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Idea</h2>
        <p className="text-base-content/70">
          Review your idea below. You can edit any section or enhance all sections with AI assistance.
        </p>
      </div>

      {/* Enhance with AI button */}
      {!isEnhanced && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleEnhance}
            disabled={isEnhancing}
            className="btn btn-primary btn-lg gap-2"
          >
            {isEnhancing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Enhancing your idea...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                </svg>
                Enhance with AI
              </>
            )}
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Enhancement failed</h3>
            <p className="text-sm">AI enhancement is temporarily unavailable. You can proceed with your original text or try again.</p>
          </div>
          <button type="button" onClick={handleEnhance} className="btn btn-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Review sections with comparison (if enhanced) or plain view */}
      {isEnhanced && enhancedContent ? (
        <div className="space-y-6">
          <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>AI enhancement complete! Select your preferred version for each section below.</span>
          </div>
          
          <ComparisonSection
            label="Problem Statement"
            original={problemValue}
            enhanced={enhancedContent.problem}
            selectedVersion={selectedVersions.problem}
            onSelectVersion={(v) => handleSelectVersion('problem', v)}
          />
          <ComparisonSection
            label="Proposed Solution"
            original={solutionValue}
            enhanced={enhancedContent.solution}
            selectedVersion={selectedVersions.solution}
            onSelectVersion={(v) => handleSelectVersion('solution', v)}
          />
          <ComparisonSection
            label="Expected Impact"
            original={impactValue}
            enhanced={enhancedContent.impact}
            selectedVersion={selectedVersions.impact}
            onSelectVersion={(v) => handleSelectVersion('impact', v)}
          />
        </div>
      ) : (
        /* Plain review cards when not enhanced */
        <div className="space-y-4">
          <ReviewCard
            label="Problem Statement"
            content={problemValue}
            isEditing={editingSection === 'problem'}
            onEdit={() => handleEditSection('problem')}
            onSave={handleSaveEdit}
            fieldName="problem"
            minChars={50}
          />
          <ReviewCard
            label="Proposed Solution"
            content={solutionValue}
            isEditing={editingSection === 'solution'}
            onEdit={() => handleEditSection('solution')}
            onSave={handleSaveEdit}
            fieldName="solution"
            minChars={50}
          />
          <ReviewCard
            label="Expected Impact"
            content={impactValue}
            isEditing={editingSection === 'impact'}
            onEdit={() => handleEditSection('impact')}
            onSave={handleSaveEdit}
            fieldName="impact"
            minChars={30}
          />
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="btn btn-ghost">
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="btn btn-primary"
          disabled={isEnhancing}
        >
          Submit Idea
        </button>
      </div>
    </div>
  );
}

// Internal sub-component for review cards (non-comparison mode)
interface ReviewCardProps {
  label: string;
  content: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  fieldName: 'problem' | 'solution' | 'impact';
  minChars: number;
}

function ReviewCard({ label, content, isEditing, onEdit, onSave, fieldName, minChars }: ReviewCardProps) {
  const { register, watch, formState: { errors } } = useFormContext<IdeaWizardFormData>();
  const currentValue = watch(fieldName);
  const charCount = currentValue?.length || 0;
  const isValid = charCount >= minChars;

  if (isEditing) {
    return (
      <div className="bg-base-200 rounded-box p-4">
        <h3 className="font-semibold mb-2">{label}</h3>
        <textarea
          {...register(fieldName)}
          className={`textarea textarea-bordered w-full min-h-[120px] ${
            errors[fieldName] ? 'textarea-error' : ''
          }`}
        />
        <div className="flex justify-between items-center mt-2">
          <span className={`text-sm ${!isValid ? 'text-warning' : 'text-success'}`}>
            {charCount} / {minChars} characters minimum
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onSave} className="btn btn-sm btn-primary" disabled={!isValid}>
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-box p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{label}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="btn btn-ghost btn-xs"
          aria-label={`Edit ${label}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </div>
      <p className="text-base-content whitespace-pre-wrap">{content}</p>
    </div>
  );
}
```

### ComparisonSection Component

```tsx
// src/features/ideas/components/IdeaWizard/ComparisonSection.tsx

interface ComparisonSectionProps {
  label: string;
  original: string;
  enhanced: string;
  selectedVersion: 'original' | 'enhanced';
  onSelectVersion: (version: 'original' | 'enhanced') => void;
}

export function ComparisonSection({
  label,
  original,
  enhanced,
  selectedVersion,
  onSelectVersion,
}: ComparisonSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">{label}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div
          className={`rounded-box p-4 cursor-pointer transition-all ${
            selectedVersion === 'original'
              ? 'bg-primary/10 ring-2 ring-primary'
              : 'bg-base-200 hover:bg-base-300'
          }`}
          onClick={() => onSelectVersion('original')}
        >
          <div className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              name={`${label}-version`}
              className="radio radio-primary radio-sm"
              checked={selectedVersion === 'original'}
              onChange={() => onSelectVersion('original')}
            />
            <span className="font-medium text-sm">Original</span>
          </div>
          <p className="text-base-content/80 text-sm whitespace-pre-wrap">{original}</p>
        </div>

        {/* Enhanced */}
        <div
          className={`rounded-box p-4 cursor-pointer transition-all ${
            selectedVersion === 'enhanced'
              ? 'bg-success/10 ring-2 ring-success'
              : 'bg-base-200 hover:bg-base-300'
          }`}
          onClick={() => onSelectVersion('enhanced')}
        >
          <div className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              name={`${label}-version`}
              className="radio radio-success radio-sm"
              checked={selectedVersion === 'enhanced'}
              onChange={() => onSelectVersion('enhanced')}
            />
            <span className="font-medium text-sm text-success">AI Enhanced ✨</span>
          </div>
          <p className="text-base-content/80 text-sm whitespace-pre-wrap">{enhanced}</p>
        </div>
      </div>
    </div>
  );
}
```

### useEnhanceIdea Hook Implementation

```tsx
// src/features/ideas/hooks/useEnhanceIdea.ts
import { useMutation } from '@tanstack/react-query';
import { geminiService } from '../../../services/geminiService';

interface EnhanceIdeaInput {
  problem: string;
  solution: string;
  impact: string;
}

interface EnhanceIdeaOutput {
  problem: string;
  solution: string;
  impact: string;
}

export function useEnhanceIdea() {
  return useMutation<EnhanceIdeaOutput, Error, EnhanceIdeaInput>({
    mutationFn: async (input) => {
      const response = await geminiService.enhanceIdea(
        input.problem,
        input.solution,
        input.impact
      );
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return response.data!;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
```

### geminiService Implementation (Stub for Story 2.6)

```tsx
// src/services/geminiService.ts
import { supabase } from '../lib/supabase';

export type ServiceResponse<T> = {
  data: T | null;
  error: { message: string; code: string } | null;
};

interface EnhancedIdea {
  problem: string;
  solution: string;
  impact: string;
}

export const geminiService = {
  /**
   * Enhance idea with AI assistance
   * 
   * NOTE: This is a STUB implementation for Story 2.5.
   * Story 2.6 will implement the actual Supabase Edge Function.
   * 
   * Edge Function contract:
   * - Endpoint: /functions/v1/gemini-enhance
   * - Method: POST
   * - Body: { problem: string, solution: string, impact: string }
   * - Response: { enhanced_problem: string, enhanced_solution: string, enhanced_impact: string }
   */
  async enhanceIdea(
    problem: string,
    solution: string,
    impact: string
  ): Promise<ServiceResponse<EnhancedIdea>> {
    try {
      // TODO: Story 2.6 - Replace with actual Edge Function call:
      // const { data, error } = await supabase.functions.invoke('gemini-enhance', {
      //   body: { problem, solution, impact }
      // });
      
      // STUB: Simulate API delay and return mock enhanced content
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Mock enhancement logic (prefix with polished language)
      const enhancedData: EnhancedIdea = {
        problem: `**Core Challenge:** ${problem}\n\nThis represents a significant opportunity to improve operational efficiency and user experience. The current situation creates friction that impacts key stakeholders and business outcomes.`,
        solution: `**Proposed Solution:** ${solution}\n\nThis approach leverages modern best practices to address the identified challenges. The implementation would follow an iterative methodology, ensuring continuous validation with stakeholders.`,
        impact: `**Expected Outcomes:** ${impact}\n\nImplementing this solution is projected to deliver measurable improvements in efficiency, user satisfaction, and cost reduction. Success metrics would be tracked through defined KPIs.`,
      };
      
      return { data: enhancedData, error: null };
    } catch (error) {
      console.error('AI enhancement error:', error);
      return {
        data: null,
        error: { message: 'Failed to enhance idea with AI', code: 'AI_ENHANCE_ERROR' },
      };
    }
  },
};
```

### IdeaWizard Update Pattern

```tsx
// src/features/ideas/components/IdeaWizard/IdeaWizard.tsx
// Add to existing file - Step 4 routing

import { StepReview } from './StepReview';

// Inside the return statement, add after StepImpact:
{currentStep === 4 && (
  <StepReview 
    onBack={handleBack}
    onSubmit={handleSubmit}  // Stub for now, Story 2.7 implements
  />
)}

// Add handleSubmit stub:
const handleSubmit = () => {
  // TODO: Story 2.7 - Implement actual submission
  console.log('Submit idea:', methods.getValues());
};
```

### Barrel Export Updates

```tsx
// src/features/ideas/components/IdeaWizard/index.ts
export { IdeaWizard } from './IdeaWizard';
export { StepIndicator } from './StepIndicator';
export { StepProblem } from './StepProblem';
export { StepSolution } from './StepSolution';
export { StepImpact } from './StepImpact';
export { StepReview } from './StepReview';         // ADD
export { ComparisonSection } from './ComparisonSection';  // ADD

// src/features/ideas/hooks/index.ts
export { useEnhanceIdea } from './useEnhanceIdea';  // ADD

// src/services/index.ts
export { geminiService } from './geminiService';    // ADD
```

### Schema Update (if needed)

```typescript
// src/features/ideas/schemas/ideaSchemas.ts
// May need to add enhanced versions to schema

// Add to existing schema or keep separate for flexibility
export const ideaWizardWithEnhancementSchema = z.object({
  problem: z.string().min(50),
  solution: z.string().min(50),
  impact: z.string().min(30),
  // Enhanced versions (optional, set after AI enhancement)
  enhancedProblem: z.string().optional(),
  enhancedSolution: z.string().optional(),
  enhancedImpact: z.string().optional(),
  // Track which versions are selected
  useEnhancedProblem: z.boolean().default(false),
  useEnhancedSolution: z.boolean().default(false),
  useEnhancedImpact: z.boolean().default(false),
});

// Alternative: Keep schema simple, handle enhancement state in component
// This is the RECOMMENDED approach for Story 2.5
```

### UX Requirements (from UX Design Spec)

**Step 4 Review Layout:**
- Full review of all 3 inputs (problem, solution, impact)
- Each section in a card with edit capability
- Prominent "Enhance with AI" CTA button
- Loading state during AI processing
- Comparison view after enhancement

**Step Indicator States for Step 4:**
| Step | State | Style |
|------|-------|-------|
| Step 1 | Complete | Success green with checkmark |
| Step 2 | Complete | Success green with checkmark |
| Step 3 | Complete | Success green with checkmark |
| Step 4 | Current | Primary red (#E10514) filled |

**AI Enhancement UX Flow:**
1. User sees review of all inputs
2. Clicks "Enhance with AI" button
3. Loading spinner with message "Enhancing your idea..."
4. On success: Display comparison view with original vs enhanced
5. User selects preferred version for each section (radio buttons)
6. Selected versions update form state
7. User can proceed to submit or go back

**Comparison View Requirements:**
- Side-by-side on desktop (grid-cols-2)
- Stacked on mobile (grid-cols-1)
- Clear visual distinction: Original (neutral) vs Enhanced (success border)
- Radio buttons for selection
- Click anywhere in card to select

**Error Handling UX:**
- Non-blocking: User can proceed without AI enhancement
- Clear error message with retry option
- Graceful degradation: "Enhance with AI" button remains, can retry

### PassportCard Theme Colors

| Element | Color | DaisyUI Class |
|---------|-------|---------------|
| Enhance button | #E10514 | `btn-primary` |
| Back button | Transparent | `btn-ghost` |
| Submit button | #E10514 | `btn-primary` |
| Current step | #E10514 | `bg-primary` |
| Complete steps | Success green | `bg-success` |
| Review cards | Muted gray | `bg-base-200` |
| Selected original | Primary tint | `bg-primary/10 ring-primary` |
| Selected enhanced | Success tint | `bg-success/10 ring-success` |
| Error alert | Error red | `alert-error` |
| Success alert | Success green | `alert-success` |

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Components | `PascalCase` | `StepReview`, `ComparisonSection` |
| Files | `PascalCase.tsx` | `StepReview.tsx` |
| Hooks | `use` + `PascalCase` | `useEnhanceIdea` |
| Services | `camelCase` | `geminiService` |
| Props interfaces | `{Component}Props` | `StepReviewProps` |
| Event handlers | `handle{Action}` | `handleEnhance`, `handleSelectVersion` |
| State variables | `camelCase` | `isEnhanced`, `enhancedContent` |
| CSS classes | DaisyUI conventions | `btn-primary`, `alert-error` |

### Anti-Patterns to AVOID

1. **DO NOT** fetch AI enhancement on page load - only on explicit user action
2. **DO NOT** block navigation if AI enhancement fails - allow proceeding with original
3. **DO NOT** store enhanced content in separate state outside form - sync with form context
4. **DO NOT** lose form data during enhancement process - preserve all inputs
5. **DO NOT** skip error handling - always provide retry and fallback options
6. **DO NOT** use different button styles than established pattern - maintain consistency
7. **DO NOT** make comparison selection confusing - clear visual feedback required
8. **DO NOT** call Edge Function directly from component - use service layer abstraction
9. **DO NOT** hardcode timeout - use React Query's built-in retry mechanism
10. **DO NOT** implement actual Gemini API call - that's Story 2.6, use stub

### Form State Management

**Enhancement State Tracking:**
```typescript
// Track enhancement state in component (NOT in form schema)
const [isEnhanced, setIsEnhanced] = useState(false);
const [enhancedContent, setEnhancedContent] = useState<EnhancedContent | null>(null);
const [selectedVersions, setSelectedVersions] = useState({
  problem: 'original',
  solution: 'original',
  impact: 'original',
});
```

**Form Value Updates on Selection:**
```typescript
// When user selects enhanced version, update form value
const handleSelectVersion = (field, version) => {
  if (version === 'enhanced' && enhancedContent) {
    setValue(field, enhancedContent[field]);
  }
  // If original selected, form already has original value
  setSelectedVersions((prev) => ({ ...prev, [field]: version }));
};
```

**Navigation Preservation:**
- Form values persist via React Hook Form FormProvider
- Enhanced content state persists in component (lost on remount - acceptable)
- Selected versions persist in component state
- Back navigation preserves current form values (original or enhanced)

### Service Layer Pattern

**Service Response Type:**
```typescript
type ServiceResponse<T> = {
  data: T | null;
  error: { message: string; code: string } | null;
};
```

**geminiService Contract (for Story 2.6):**
```typescript
// Supabase Edge Function: gemini-enhance
// Location: supabase/functions/gemini-enhance/index.ts

// Request body:
interface EnhanceRequest {
  problem: string;
  solution: string;
  impact: string;
}

// Response body:
interface EnhanceResponse {
  enhanced_problem: string;
  enhanced_solution: string;
  enhanced_impact: string;
}

// Error response:
interface ErrorResponse {
  error: string;
  code: string;
}
```

### Dependencies on Previous Stories

- **Story 2.2 (Step 1):** IdeaWizard, StepIndicator, StepProblem, FormProvider setup
- **Story 2.3 (Step 2):** StepSolution component
- **Story 2.4 (Step 3):** StepImpact component
- **Story 2.2:** `ideaWizardSchema` and form types
- **Story 1.1:** React Query configured
- **Story 1.2:** PassportCard DaisyUI theme configured
- **Story 1.3:** Supabase client configured

### Dependencies for Future Stories

- **Story 2.6 (Gemini Edge Function):** Will replace stub implementation with real API call
- **Story 2.7 (Submit Idea):** Will implement handleSubmit to save idea to database
- **Story 2.8 (My Ideas List):** Will display submitted ideas
- **Story 2.9 (Idea Detail):** Will show full idea details

### Git Intelligence - Recent Patterns

Based on commit history (`ac65d2d` - initial project setup):
- Project uses Vite + React + TypeScript foundation
- Feature-based folder structure established
- Service layer pattern established in authService
- Consistent use of ServiceResponse type wrapper
- DaisyUI components with PassportCard theme

### Testing Checklist

- [ ] StepReview renders when currentStep === 4
- [ ] Step indicator shows steps 1-3 complete, step 4 current
- [ ] Step label reads "Review & Enhance"
- [ ] Problem, solution, impact display in review cards
- [ ] Edit button appears on each review card
- [ ] Clicking edit enables inline editing mode
- [ ] "Enhance with AI" button is visible and styled as primary
- [ ] Clicking "Enhance with AI" shows loading spinner
- [ ] Loading spinner shows "Enhancing your idea..." message
- [ ] After ~2s (stub delay), comparison view appears
- [ ] Success alert displays after enhancement
- [ ] Original and Enhanced versions shown side-by-side (desktop)
- [ ] Radio buttons allow selecting version per section
- [ ] Clicking card selects that version
- [ ] Selected version has visual ring highlight
- [ ] Form values update when enhanced version selected
- [ ] "Back" button returns to Step 3
- [ ] Form data preserved when navigating back
- [ ] "Submit Idea" button visible (non-functional until Story 2.7)
- [ ] Error state displays if enhancement fails
- [ ] Retry button works on error
- [ ] Can proceed with original text after error
- [ ] Responsive layout: stacked on mobile, side-by-side on desktop

### Project Structure Notes

- Extends existing IdeaWizard folder from Stories 2.2-2.4
- Introduces `useEnhanceIdea` hook in feature hooks folder
- Introduces `geminiService` in global services folder
- Creates reusable `ComparisonSection` sub-component
- Follows established patterns from authService and previous steps

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#Idea Submission & Management]
- [Source: _bmad-output/implementation-artifacts/2-2-idea-wizard-step-1-problem-definition.md]
- [Source: _bmad-output/implementation-artifacts/2-3-idea-wizard-step-2-solution-description.md]
- [Source: _bmad-output/implementation-artifacts/2-4-idea-wizard-step-3-impact-assessment.md]
- [Source: src/features/auth/services/authService.ts] - Service pattern reference

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
