# Story 2.2: Idea Wizard - Step 1 Problem Definition

Status: review

## Story

As a **user**,
I want **to describe the problem I'm trying to solve**,
So that **my idea starts with a clear problem statement**.

## Acceptance Criteria

1. **Given** I am logged in and on the "New Idea" page **When** I click "Start New Idea" **Then** I see Step 1 of 4: "What problem are you trying to solve?"

2. **Given** I am on Step 1 **Then** I see a text area with placeholder text guiding me on what to write

3. **Given** I am on Step 1 **Then** I see a character counter showing current count and minimum required (50 characters)

4. **Given** I enter less than 50 characters **When** I try to click "Next" **Then** the button is disabled and I see a validation message encouraging more detail

5. **Given** I enter 50 or more characters **When** I view the "Next" button **Then** it becomes enabled and clickable

6. **Given** I am on Step 1 **Then** I see a progress indicator showing I'm on step 1 of 4 with visual states (current step highlighted in primary red)

7. **Given** I complete Step 1 and click "Next" **Then** my problem text is preserved and I navigate to Step 2

## Tasks / Subtasks

- [x] Task 1: Create IdeaWizard folder structure and base component (AC: 1, 6)
  - [x] Create `src/features/ideas/components/IdeaWizard/` folder
  - [x] Create `IdeaWizard.tsx` - main wizard container with step routing
  - [x] Create `StepIndicator.tsx` - visual progress indicator (1 of 4)
  - [x] Create `index.ts` barrel export
  - [x] Implement wizard state management with Zustand store or local state

- [x] Task 2: Create StepProblem component (AC: 1, 2, 3, 4, 5)
  - [x] Create `StepProblem.tsx` in IdeaWizard folder
  - [x] Implement textarea with guiding placeholder text
  - [x] Implement character counter (current/minimum display)
  - [x] Implement validation logic (minimum 50 characters)
  - [x] Style validation message for insufficient characters

- [x] Task 3: Create Zod validation schema for idea wizard (AC: 4)
  - [x] Create `src/features/ideas/schemas/ideaSchemas.ts`
  - [x] Define `stepProblemSchema` with min 50 char validation
  - [x] Define `IdeaWizardFormData` type for full wizard
  - [x] Export schemas and types

- [x] Task 4: Implement wizard navigation and state persistence (AC: 5, 7)
  - [x] Implement "Next" button with disabled state when invalid
  - [x] Implement step transition with state preservation
  - [x] Ensure form data persists across step navigation
  - [x] Use React Hook Form with Zod resolver for validation

- [x] Task 5: Create NewIdeaPage route and navigation (AC: 1)
  - [x] Create `src/features/ideas/pages/NewIdeaPage.tsx`
  - [x] Add route `/ideas/new` to router configuration
  - [x] Ensure route is protected (requires authentication)
  - [x] Add navigation entry point ("New Idea" button)

- [x] Task 6: Style components with DaisyUI/PassportCard theme (AC: 2, 3, 6)
  - [x] Apply PassportCard theme colors (#E10514 primary)
  - [x] Style step indicator with proper states (incomplete, current, complete)
  - [x] Style textarea with proper focus states
  - [x] Style character counter (neutral when valid, warning when invalid)
  - [x] Ensure responsive layout (desktop-first, mobile-friendly)

- [x] Task 7: Create feature barrel exports
  - [x] Update `src/features/ideas/index.ts` with new exports
  - [x] Export IdeaWizard components
  - [x] Export schemas and types

## Dev Notes

### Architecture Patterns (MANDATORY)

**Feature Folder Structure:**
```
src/features/ideas/
├── components/
│   └── IdeaWizard/
│       ├── IdeaWizard.tsx       (THIS STORY)
│       ├── StepIndicator.tsx    (THIS STORY)
│       ├── StepProblem.tsx      (THIS STORY)
│       ├── StepSolution.tsx     (Story 2.3)
│       ├── StepImpact.tsx       (Story 2.4)
│       ├── StepReview.tsx       (Story 2.5)
│       └── index.ts             (THIS STORY)
├── pages/
│   └── NewIdeaPage.tsx          (THIS STORY)
├── hooks/
│   ├── useIdeas.ts              (Story 2.8)
│   ├── useCreateIdea.ts         (Story 2.7)
│   └── useIdeaWizard.ts         (THIS STORY - optional)
├── schemas/
│   └── ideaSchemas.ts           (THIS STORY)
├── services/
│   └── ideaService.ts           (Story 2.1 - exists)
├── types.ts                     (Story 2.1 - exists)
└── index.ts
```

### IdeaWizard Component Pattern

```tsx
// src/features/ideas/components/IdeaWizard/IdeaWizard.tsx
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ideaWizardSchema, type IdeaWizardFormData } from '../../schemas/ideaSchemas';
import { StepIndicator } from './StepIndicator';
import { StepProblem } from './StepProblem';

const TOTAL_STEPS = 4;

export function IdeaWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const methods = useForm<IdeaWizardFormData>({
    resolver: zodResolver(ideaWizardSchema),
    mode: 'onChange', // Validate on change for real-time feedback
    defaultValues: {
      problem: '',
      solution: '',
      impact: '',
    },
  });

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      
      <FormProvider {...methods}>
        {currentStep === 1 && (
          <StepProblem onNext={handleNext} />
        )}
        {/* Steps 2-4 in future stories */}
      </FormProvider>
    </div>
  );
}
```

### StepIndicator Component Pattern

```tsx
// src/features/ideas/components/IdeaWizard/StepIndicator.tsx
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="mb-8">
      {/* Step circles with connecting lines */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            {/* Step circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step < currentStep
                  ? 'bg-success text-success-content' // Complete
                  : step === currentStep
                  ? 'bg-primary text-primary-content' // Current
                  : 'bg-base-300 text-base-content/50' // Incomplete
              }`}
              aria-current={step === currentStep ? 'step' : undefined}
            >
              {step < currentStep ? '✓' : step}
            </div>
            
            {/* Connecting line (except after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-1 ${
                  step < currentStep ? 'bg-success' : 'bg-base-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Step label */}
      <p className="text-center mt-4 text-lg font-semibold">
        Step {currentStep} of {totalSteps}: {getStepLabel(currentStep)}
      </p>
    </div>
  );
}

function getStepLabel(step: number): string {
  const labels: Record<number, string> = {
    1: 'Define the Problem',
    2: 'Describe Your Solution',
    3: 'Assess the Impact',
    4: 'Review & Submit',
  };
  return labels[step] || '';
}
```

### StepProblem Component Pattern

```tsx
// src/features/ideas/components/IdeaWizard/StepProblem.tsx
import { useFormContext } from 'react-hook-form';
import type { IdeaWizardFormData } from '../../schemas/ideaSchemas';

const MIN_PROBLEM_CHARS = 50;

interface StepProblemProps {
  onNext: () => void;
}

export function StepProblem({ onNext }: StepProblemProps) {
  const {
    register,
    watch,
    formState: { errors },
    trigger,
  } = useFormContext<IdeaWizardFormData>();

  const problemValue = watch('problem') || '';
  const charCount = problemValue.length;
  const isValid = charCount >= MIN_PROBLEM_CHARS;

  const handleNext = async () => {
    const valid = await trigger('problem');
    if (valid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">What problem are you trying to solve?</h2>
        <p className="text-base-content/70">
          Describe the challenge, pain point, or opportunity you've identified. 
          Be specific about who is affected and what the current situation looks like.
        </p>
      </div>

      <div className="form-control">
        <textarea
          {...register('problem')}
          className={`textarea textarea-bordered min-h-[200px] text-base ${
            errors.problem ? 'textarea-error' : ''
          }`}
          placeholder="Example: Our customer service team spends 2+ hours daily answering repetitive questions about policy coverage. This delays responses to complex cases and frustrates both employees and customers..."
        />
        
        {/* Character counter */}
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-sm ${
              !isValid ? 'text-warning' : 'text-success'
            }`}
          >
            {charCount} / {MIN_PROBLEM_CHARS} characters minimum
          </span>
          
          {errors.problem && (
            <span className="text-sm text-error">{errors.problem.message}</span>
          )}
        </div>
        
        {!isValid && charCount > 0 && (
          <p className="text-sm text-warning mt-1">
            Please add more detail to help reviewers understand the problem better.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isValid}
          className="btn btn-primary"
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Zod Schema Pattern

```typescript
// src/features/ideas/schemas/ideaSchemas.ts
import { z } from 'zod';

export const stepProblemSchema = z.object({
  problem: z
    .string()
    .min(50, 'Please provide at least 50 characters to clearly describe the problem'),
});

export const stepSolutionSchema = z.object({
  solution: z
    .string()
    .min(50, 'Please provide at least 50 characters to describe your solution'),
});

export const stepImpactSchema = z.object({
  impact: z
    .string()
    .min(30, 'Please provide at least 30 characters to describe the expected impact'),
});

// Combined schema for full wizard
export const ideaWizardSchema = z.object({
  problem: stepProblemSchema.shape.problem,
  solution: stepSolutionSchema.shape.solution,
  impact: stepImpactSchema.shape.impact,
});

export type StepProblemData = z.infer<typeof stepProblemSchema>;
export type StepSolutionData = z.infer<typeof stepSolutionSchema>;
export type StepImpactData = z.infer<typeof stepImpactSchema>;
export type IdeaWizardFormData = z.infer<typeof ideaWizardSchema>;
```

### NewIdeaPage Route Pattern

```tsx
// src/features/ideas/pages/NewIdeaPage.tsx
import { IdeaWizard } from '../components/IdeaWizard';

export function NewIdeaPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Submit a New Idea</h1>
      <IdeaWizard />
    </div>
  );
}
```

### Router Configuration Update

```tsx
// Add to existing router configuration
import { NewIdeaPage } from './features/ideas/pages/NewIdeaPage';

// Inside protected routes:
{
  path: 'ideas/new',
  element: <NewIdeaPage />,
}
```

### UX Requirements (from UX Design Spec)

**Step Indicator States:**
| State | Style | Description |
|-------|-------|-------------|
| Incomplete | Gray circle (`bg-base-300`) | Step not yet reached |
| Current | Primary red filled (`bg-primary`) | Active step |
| Complete | Success green check (`bg-success`) | Step finished |

**Wizard Layout:**
- Full-page layout (not modal) for idea submission
- Max width container (~2xl/672px) centered on page
- Step indicator at top with connecting lines
- Step label below indicator ("Step 1 of 4: Define the Problem")
- Form content in middle
- Navigation buttons at bottom (Back on left, Next/Submit on right)

**Textarea Guidelines:**
- Min height 200px for comfortable writing
- Placeholder with example text showing expected format
- Real-time character counter
- Visual feedback when approaching/meeting minimum

**Validation UX:**
- Validate on change (`mode: 'onChange'`) for real-time feedback
- "Next" button disabled when invalid
- Warning color for character count when below minimum
- Encouraging message when validation fails (not harsh error)

### PassportCard Theme Colors

| Element | Color | DaisyUI Class |
|---------|-------|---------------|
| Primary CTA | #E10514 | `btn-primary` |
| Current step | #E10514 | `bg-primary` |
| Complete step | Success green | `bg-success` |
| Incomplete step | Gray | `bg-base-300` |
| Warning text | Warning amber | `text-warning` |
| Error text | Error red | `text-error` |
| Valid counter | Success green | `text-success` |

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Components | `PascalCase` | `IdeaWizard`, `StepProblem` |
| Files | `PascalCase.tsx` | `IdeaWizard.tsx` |
| Hooks | `use` + `PascalCase` | `useIdeaWizard` |
| Schemas | `camelCase` | `stepProblemSchema` |
| Types | `PascalCase` | `IdeaWizardFormData` |
| CSS classes | DaisyUI conventions | `btn-primary`, `textarea-bordered` |

### Anti-Patterns to AVOID

1. **DO NOT** store wizard state in URL params - use React state or Zustand
2. **DO NOT** use uncontrolled forms - always use React Hook Form
3. **DO NOT** skip validation - always validate before allowing step transition
4. **DO NOT** hardcode colors - use DaisyUI theme classes
5. **DO NOT** create custom validation logic - use Zod schemas
6. **DO NOT** lose form data on navigation - preserve across steps
7. **DO NOT** use alert() for validation errors - use inline messages
8. **DO NOT** disable entire form while typing - only disable Next button

### Dependencies on Previous Stories

- **Story 1.1:** Project initialized with React, TypeScript, Vite
- **Story 1.2:** PassportCard DaisyUI theme configured
- **Story 1.4/1.5:** Auth patterns established (for protected routes)
- **Story 2.1:** Ideas types exist in `src/features/ideas/types.ts`

### Dependencies for Future Stories

- **Story 2.3 (Step 2 Solution):** Will add `StepSolution.tsx`, extend wizard routing
- **Story 2.4 (Step 3 Impact):** Will add `StepImpact.tsx`
- **Story 2.5 (Step 4 Review):** Will add `StepReview.tsx`, AI enhancement trigger
- **Story 2.7 (Submit):** Will use ideaService.createIdea() to save

### Testing Checklist

- [x] IdeaWizard renders on `/ideas/new` route
- [x] Step indicator shows step 1 as current (primary color)
- [x] Textarea renders with placeholder text
- [x] Character counter shows current count
- [x] Character counter shows warning style when < 50 chars
- [x] Character counter shows success style when >= 50 chars
- [x] "Next" button is disabled when < 50 chars
- [x] "Next" button is enabled when >= 50 chars
- [x] Clicking "Next" with valid input proceeds (currently just logs/no-op)
- [x] Form data is preserved (for future step navigation)
- [x] Route is protected (redirects unauthenticated users)
- [x] Responsive layout works on mobile

### Project Structure Notes

- Path alias `@/` maps to `src/` (verify in tsconfig.json)
- Components go in feature folders, not global components folder
- Page components go in `pages/` subfolder within feature
- Schemas go in `schemas/` subfolder within feature

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Idea Wizard]
- [Source: src/features/auth/schemas/authSchemas.ts] - Zod schema pattern
- [Source: src/features/auth/services/authService.ts] - Service pattern

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- All 65 tests pass in src/features/ideas (including 47 new tests for this story)
- Full test suite passes: 264 tests across 25 test files
- No regressions introduced

### Completion Notes List

- Created IdeaWizard multi-step form component with React Hook Form and FormProvider
- Implemented StepIndicator with visual states: incomplete (gray), current (primary red), complete (success green with checkmark)
- Implemented StepProblem with textarea, real-time character counter, and validation
- Created Zod schemas for wizard validation (stepProblemSchema, ideaWizardSchema)
- Updated NewIdeaPage to render the IdeaWizard component
- Route `/ideas/new` already existed and was protected via AuthenticatedLayout
- All DaisyUI/PassportCard theme classes applied (bg-primary, bg-success, text-warning, etc.)
- Wizard uses local React state for step management (useState) rather than Zustand
- Steps 2-4 show placeholder alerts indicating they are coming in future stories

### File List

**New Files:**
- src/features/ideas/schemas/ideaSchemas.ts
- src/features/ideas/schemas/ideaSchemas.test.ts
- src/features/ideas/components/IdeaWizard/IdeaWizard.tsx
- src/features/ideas/components/IdeaWizard/IdeaWizard.test.tsx
- src/features/ideas/components/IdeaWizard/StepIndicator.tsx
- src/features/ideas/components/IdeaWizard/StepIndicator.test.tsx
- src/features/ideas/components/IdeaWizard/StepProblem.tsx
- src/features/ideas/components/IdeaWizard/StepProblem.test.tsx
- src/features/ideas/components/IdeaWizard/index.ts

**Modified Files:**
- src/features/ideas/index.ts (added exports for wizard components and schemas)
- src/pages/NewIdeaPage.tsx (replaced placeholder with IdeaWizard component)

## Change Log

- 2026-01-18: Implemented Story 2.2 - Idea Wizard Step 1 (Problem Definition)
