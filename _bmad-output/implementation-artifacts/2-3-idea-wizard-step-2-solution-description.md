# Story 2.3: Idea Wizard - Step 2 Solution Description

Status: review

## Story

As a **user**,
I want **to describe my proposed solution**,
So that **reviewers understand what I'm suggesting**.

## Acceptance Criteria

1. **Given** I completed Step 1 **When** I proceed to Step 2 **Then** I see "What's your proposed solution?" heading

2. **Given** I am on Step 2 **Then** I see my problem statement from Step 1 displayed in a context card for reference

3. **Given** I am on Step 2 **Then** I see a text area with placeholder text guiding me on solution description

4. **Given** I am on Step 2 **Then** I see a character counter showing current count and minimum required (50 characters)

5. **Given** I enter less than 50 characters **When** I view the "Next" button **Then** it is disabled with validation message encouraging more detail

6. **Given** I enter 50 or more characters **When** I view the "Next" button **Then** it becomes enabled and clickable

7. **Given** I am on Step 2 **Then** I see a progress indicator showing I'm on step 2 of 4 (step 1 complete, step 2 current, steps 3-4 incomplete)

8. **Given** I click "Back" **When** I navigate to Step 1 **Then** my solution text AND problem text are both preserved

9. **Given** I complete Step 2 and click "Next" **Then** my solution text is preserved and I navigate to Step 3

## Tasks / Subtasks

- [x] Task 1: Create StepSolution component (AC: 1, 2, 3, 4, 5, 6)
  - [x] Create `StepSolution.tsx` in `src/features/ideas/components/IdeaWizard/`
  - [x] Implement context card displaying problem statement from Step 1
  - [x] Implement textarea with guiding placeholder text
  - [x] Implement character counter (current/minimum display)
  - [x] Implement validation logic (minimum 50 characters)
  - [x] Style validation message for insufficient characters

- [x] Task 2: Extend IdeaWizard for Step 2 navigation (AC: 7, 8, 9)
  - [x] Add StepSolution import and render for `currentStep === 2`
  - [x] Implement "Back" navigation handler to return to Step 1
  - [x] Ensure form data persists across both forward and backward navigation
  - [x] Pass `onNext` and `onBack` props to StepSolution

- [x] Task 3: Update StepIndicator for step 2 state (AC: 7)
  - [x] Verify step 1 shows as complete (success green with checkmark)
  - [x] Verify step 2 shows as current (primary red with number 2)
  - [x] Verify steps 3-4 show as incomplete (gray)
  - [x] Verify step label updates to "Describe Your Solution"

- [x] Task 4: Apply DaisyUI styling (AC: 2, 3, 4)
  - [x] Style context card with muted background for problem display
  - [x] Style textarea with proper focus states (matches Step 1)
  - [x] Style character counter (warning when invalid, success when valid)
  - [x] Style Back button as ghost/outline, Next as primary
  - [x] Ensure responsive layout matches Step 1

## Dev Notes

### Architecture Patterns (MANDATORY)

**Feature Folder Structure:**
```
src/features/ideas/
├── components/
│   └── IdeaWizard/
│       ├── IdeaWizard.tsx       (UPDATE - add Step 2 routing)
│       ├── StepIndicator.tsx    (FROM Story 2.2 - no changes)
│       ├── StepProblem.tsx      (FROM Story 2.2 - no changes)
│       ├── StepSolution.tsx     (THIS STORY - NEW)
│       ├── StepImpact.tsx       (Story 2.4)
│       ├── StepReview.tsx       (Story 2.5)
│       └── index.ts             (UPDATE - export StepSolution)
├── pages/
│   └── NewIdeaPage.tsx          (FROM Story 2.2 - no changes)
├── schemas/
│   └── ideaSchemas.ts           (FROM Story 2.2 - already has stepSolutionSchema)
└── types.ts                     (FROM Story 2.1)
```

### StepSolution Component Implementation

```tsx
// src/features/ideas/components/IdeaWizard/StepSolution.tsx
import { useFormContext } from 'react-hook-form';
import type { IdeaWizardFormData } from '../../schemas/ideaSchemas';

const MIN_SOLUTION_CHARS = 50;

interface StepSolutionProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepSolution({ onNext, onBack }: StepSolutionProps) {
  const {
    register,
    watch,
    formState: { errors },
    trigger,
  } = useFormContext<IdeaWizardFormData>();

  const problemValue = watch('problem') || '';
  const solutionValue = watch('solution') || '';
  const charCount = solutionValue.length;
  const isValid = charCount >= MIN_SOLUTION_CHARS;

  const handleNext = async () => {
    const valid = await trigger('solution');
    if (valid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Problem context card */}
      <div className="bg-base-200 rounded-box p-4">
        <h3 className="text-sm font-semibold text-base-content/70 mb-2">
          Your Problem Statement:
        </h3>
        <p className="text-base-content">{problemValue}</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">What's your proposed solution?</h2>
        <p className="text-base-content/70">
          Describe how you would solve this problem. What would you build, change, 
          or implement? Be specific about the key features or changes you envision.
        </p>
      </div>

      <div className="form-control">
        <textarea
          {...register('solution')}
          className={`textarea textarea-bordered min-h-[200px] text-base ${
            errors.solution ? 'textarea-error' : ''
          }`}
          placeholder="Example: Create an interactive FAQ chatbot that answers common policy questions in real-time. It would integrate with our knowledge base and use simple language customers understand. The chatbot could also escalate to human agents when needed..."
        />
        
        {/* Character counter */}
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-sm ${
              !isValid ? 'text-warning' : 'text-success'
            }`}
          >
            {charCount} / {MIN_SOLUTION_CHARS} characters minimum
          </span>
          
          {errors.solution && (
            <span className="text-sm text-error">{errors.solution.message}</span>
          )}
        </div>
        
        {!isValid && charCount > 0 && (
          <p className="text-sm text-warning mt-1">
            Please add more detail about your proposed solution.
          </p>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost"
        >
          Back
        </button>
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

### IdeaWizard Update Pattern

```tsx
// src/features/ideas/components/IdeaWizard/IdeaWizard.tsx
// Add to existing file - Step 2 routing

import { StepSolution } from './StepSolution';

// Inside the return statement, add after StepProblem:
{currentStep === 2 && (
  <StepSolution 
    onNext={handleNext} 
    onBack={handleBack} 
  />
)}
```

### Existing Schema (FROM Story 2.2)

The schema already exists in `ideaSchemas.ts`:
```typescript
export const stepSolutionSchema = z.object({
  solution: z
    .string()
    .min(50, 'Please provide at least 50 characters to describe your solution'),
});

// Already part of ideaWizardSchema
export const ideaWizardSchema = z.object({
  problem: stepProblemSchema.shape.problem,
  solution: stepSolutionSchema.shape.solution,  // ALREADY EXISTS
  impact: stepImpactSchema.shape.impact,
});
```

### Barrel Export Update

```tsx
// src/features/ideas/components/IdeaWizard/index.ts
export { IdeaWizard } from './IdeaWizard';
export { StepIndicator } from './StepIndicator';
export { StepProblem } from './StepProblem';
export { StepSolution } from './StepSolution';  // ADD THIS LINE
```

### UX Requirements (from UX Design Spec)

**Problem Context Display:**
- Show problem statement in muted background card (`bg-base-200`)
- Use smaller label text for "Your Problem Statement:"
- Full problem text visible (not truncated)
- Provides context without being distracting

**Step Indicator States for Step 2:**
| Step | State | Style |
|------|-------|-------|
| Step 1 | Complete | Success green with checkmark |
| Step 2 | Current | Primary red (#E10514) filled |
| Step 3 | Incomplete | Gray outline |
| Step 4 | Incomplete | Gray outline |

**Navigation Pattern:**
| Button | Position | Style | Behavior |
|--------|----------|-------|----------|
| Back | Left | `btn-ghost` | Returns to Step 1, preserves all data |
| Next | Right | `btn-primary` | Disabled when < 50 chars, validates before advancing |

**Textarea Guidelines:**
- Same styling as Step 1 (min-h-[200px], textarea-bordered)
- Placeholder shows example solution format
- Real-time character counter with color feedback
- Visual feedback matches Step 1 pattern

### PassportCard Theme Colors

| Element | Color | DaisyUI Class |
|---------|-------|---------------|
| Next button | #E10514 | `btn-primary` |
| Back button | Transparent | `btn-ghost` |
| Current step | #E10514 | `bg-primary` |
| Complete step | Success green | `bg-success` |
| Context card | Muted gray | `bg-base-200` |
| Warning text | Warning amber | `text-warning` |
| Valid counter | Success green | `text-success` |

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Components | `PascalCase` | `StepSolution` |
| Files | `PascalCase.tsx` | `StepSolution.tsx` |
| Props interfaces | `{Component}Props` | `StepSolutionProps` |
| Event handlers | `handle{Action}` | `handleNext`, `handleBack` |
| CSS classes | DaisyUI conventions | `btn-ghost`, `bg-base-200` |

### Anti-Patterns to AVOID

1. **DO NOT** create a separate form for Step 2 - use FormProvider from parent
2. **DO NOT** store solution in local component state - use useFormContext
3. **DO NOT** lose problem data when navigating back - React Hook Form preserves
4. **DO NOT** truncate problem display - show full text for context
5. **DO NOT** use different validation UX than Step 1 - maintain consistency
6. **DO NOT** use `btn-secondary` for Back - use `btn-ghost` per pattern
7. **DO NOT** skip trigger('solution') before onNext - always validate
8. **DO NOT** create new schema - stepSolutionSchema already exists

### Form State Preservation

React Hook Form with FormProvider (set up in Story 2.2) automatically preserves form data across step navigation:
- Parent `IdeaWizard` holds the form context via `FormProvider`
- Each step uses `useFormContext` to read/write to shared form state
- Navigating back/forward never loses data
- `defaultValues` in parent ensures empty string initialization

### Validation Flow

```
User types in textarea
    ↓
watch('solution') updates in real-time
    ↓
charCount calculated, isValid evaluated
    ↓
Character counter color updates (warning/success)
    ↓
"Next" button enabled/disabled based on isValid
    ↓
On click "Next": trigger('solution') validates against Zod schema
    ↓
If valid: onNext() advances step
If invalid: form errors display
```

### Dependencies on Previous Stories

- **Story 2.2 (Step 1):** IdeaWizard, StepIndicator, StepProblem, schemas, FormProvider setup
- **Story 2.2:** `stepSolutionSchema` in ideaSchemas.ts (already defined)
- **Story 2.2:** handleNext/handleBack functions in IdeaWizard
- **Story 1.2:** PassportCard DaisyUI theme configured

### Dependencies for Future Stories

- **Story 2.4 (Step 3 Impact):** Will add `StepImpact.tsx` with similar pattern
- **Story 2.5 (Step 4 Review):** Will display problem + solution + impact

### Testing Checklist

- [x] StepSolution renders when currentStep === 2
- [x] Problem statement displays in context card
- [x] Context card shows full problem text (not truncated)
- [x] Step indicator shows step 1 complete, step 2 current
- [x] Step label reads "Describe Your Solution"
- [x] Textarea renders with placeholder text
- [x] Character counter shows current count
- [x] Character counter shows warning style when < 50 chars
- [x] Character counter shows success style when >= 50 chars
- [x] "Next" button is disabled when < 50 chars
- [x] "Next" button is enabled when >= 50 chars
- [x] Clicking "Next" with valid input proceeds to Step 3 (or logs/no-op until 2.4)
- [x] Clicking "Back" returns to Step 1
- [x] Solution text preserved when navigating back to Step 1
- [x] Problem text still present when returning from Step 1
- [x] Responsive layout works on mobile

### Project Structure Notes

- Extends existing IdeaWizard folder from Story 2.2
- Follows same component patterns established in StepProblem
- Uses existing schema from ideaSchemas.ts (no new schema needed)
- Consistent DaisyUI styling throughout

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Idea Wizard]
- [Source: _bmad-output/implementation-artifacts/2-2-idea-wizard-step-1-problem-definition.md]
- [Source: src/features/auth/components/LoginForm.tsx] - Form pattern reference

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

None - implementation proceeded without issues.

### Completion Notes List

- Created `StepSolution.tsx` component following the exact pattern from `StepProblem.tsx`
- Component includes problem context card (`bg-base-200`) displaying the problem statement from Step 1
- Implemented real-time character counter with warning/success color states
- Validation enforces minimum 50 characters using existing `MIN_SOLUTION_CHARS` from `ideaSchemas.ts`
- Back button (`btn-ghost`) and Next button (`btn-primary`) follow established navigation pattern
- Updated `IdeaWizard.tsx` to render `StepSolution` when `currentStep === 2`, replacing placeholder
- Updated barrel export in `index.ts` to include `StepSolution`
- Created comprehensive test suite in `StepSolution.test.tsx` with 22 tests covering all acceptance criteria
- Updated `IdeaWizard.test.tsx` with 6 new integration tests for Step 2 functionality
- All 291 tests pass (62 in IdeaWizard folder, 291 total)
- No lint errors in modified files (pre-existing lint errors in `src/routes/index.tsx` are unrelated)

### Change Log

- 2026-01-18: Implemented Story 2.3 - Idea Wizard Step 2 Solution Description

### File List

**Created:**
- `src/features/ideas/components/IdeaWizard/StepSolution.tsx`
- `src/features/ideas/components/IdeaWizard/StepSolution.test.tsx`

**Modified:**
- `src/features/ideas/components/IdeaWizard/IdeaWizard.tsx`
- `src/features/ideas/components/IdeaWizard/IdeaWizard.test.tsx`
- `src/features/ideas/components/IdeaWizard/index.ts`
