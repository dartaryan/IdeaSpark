# Story 2.4: Idea Wizard - Step 3 Impact Assessment

Status: ready-for-dev

## Story

As a **user**,
I want **to describe the expected impact of my idea**,
So that **reviewers understand the potential value**.

## Acceptance Criteria

1. **Given** I completed Step 2 **When** I proceed to Step 3 **Then** I see "What impact will this have?" heading

2. **Given** I am on Step 3 **Then** I see guidance prompts (e.g., "Who benefits?", "What metrics improve?", "What changes?") to help structure my response

3. **Given** I am on Step 3 **Then** I see a text area with placeholder text showing impact description examples

4. **Given** I am on Step 3 **Then** I see a character counter showing current count and minimum required (30 characters)

5. **Given** I enter less than 30 characters **When** I view the "Next" button **Then** it is disabled with validation message encouraging more detail

6. **Given** I enter 30 or more characters **When** I view the "Next" button **Then** it becomes enabled and clickable

7. **Given** I am on Step 3 **Then** I see a progress indicator showing I'm on step 3 of 4 (steps 1-2 complete, step 3 current, step 4 incomplete)

8. **Given** I click "Back" **When** I navigate to Step 2 **Then** my impact text, solution text, AND problem text are all preserved

9. **Given** I complete Step 3 and click "Next" **Then** my impact text is preserved and I navigate to Step 4 (Review)

## Tasks / Subtasks

- [ ] Task 1: Create StepImpact component (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Create `StepImpact.tsx` in `src/features/ideas/components/IdeaWizard/`
  - [ ] Implement heading "What impact will this have?"
  - [ ] Implement guidance prompts card with helpful questions
  - [ ] Implement textarea with guiding placeholder text
  - [ ] Implement character counter (current/minimum display)
  - [ ] Implement validation logic (minimum 30 characters)
  - [ ] Style validation message for insufficient characters

- [ ] Task 2: Extend IdeaWizard for Step 3 navigation (AC: 7, 8, 9)
  - [ ] Add StepImpact import and render for `currentStep === 3`
  - [ ] Implement "Back" navigation handler to return to Step 2
  - [ ] Ensure form data persists across all steps (forward and backward navigation)
  - [ ] Pass `onNext` and `onBack` props to StepImpact

- [ ] Task 3: Update StepIndicator for step 3 state (AC: 7)
  - [ ] Verify steps 1-2 show as complete (success green with checkmarks)
  - [ ] Verify step 3 shows as current (primary red with number 3)
  - [ ] Verify step 4 shows as incomplete (gray)
  - [ ] Verify step label updates to "Describe the Impact"

- [ ] Task 4: Apply DaisyUI styling (AC: 2, 3, 4)
  - [ ] Style guidance prompts card with muted background
  - [ ] Style textarea with proper focus states (matches Steps 1-2)
  - [ ] Style character counter (warning when invalid, success when valid)
  - [ ] Style Back button as ghost/outline, Next as primary
  - [ ] Ensure responsive layout matches previous steps

## Dev Notes

### Architecture Patterns (MANDATORY)

**Feature Folder Structure:**
```
src/features/ideas/
├── components/
│   └── IdeaWizard/
│       ├── IdeaWizard.tsx       (UPDATE - add Step 3 routing)
│       ├── StepIndicator.tsx    (FROM Story 2.2 - no changes)
│       ├── StepProblem.tsx      (FROM Story 2.2 - no changes)
│       ├── StepSolution.tsx     (FROM Story 2.3 - no changes)
│       ├── StepImpact.tsx       (THIS STORY - NEW)
│       ├── StepReview.tsx       (Story 2.5)
│       └── index.ts             (UPDATE - export StepImpact)
├── pages/
│   └── NewIdeaPage.tsx          (FROM Story 2.2 - no changes)
├── schemas/
│   └── ideaSchemas.ts           (FROM Story 2.2 - already has stepImpactSchema)
└── types.ts                     (FROM Story 2.1)
```

### StepImpact Component Implementation

```tsx
// src/features/ideas/components/IdeaWizard/StepImpact.tsx
import { useFormContext } from 'react-hook-form';
import type { IdeaWizardFormData } from '../../schemas/ideaSchemas';

const MIN_IMPACT_CHARS = 30;

interface StepImpactProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepImpact({ onNext, onBack }: StepImpactProps) {
  const {
    register,
    watch,
    formState: { errors },
    trigger,
  } = useFormContext<IdeaWizardFormData>();

  const impactValue = watch('impact') || '';
  const charCount = impactValue.length;
  const isValid = charCount >= MIN_IMPACT_CHARS;

  const handleNext = async () => {
    const valid = await trigger('impact');
    if (valid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold mb-2">What impact will this have?</h2>
        <p className="text-base-content/70">
          Help reviewers understand the potential value of your idea. Consider who 
          benefits and what improvements you expect.
        </p>
      </div>

      {/* Guidance prompts card */}
      <div className="bg-base-200 rounded-box p-4">
        <h3 className="text-sm font-semibold text-base-content/70 mb-3">
          Consider these questions:
        </h3>
        <ul className="space-y-2 text-base-content">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>Who benefits?</strong> Customers, employees, specific departments?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>What metrics improve?</strong> Time saved, cost reduced, satisfaction increased?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>What changes?</strong> Processes, experiences, capabilities?</span>
          </li>
        </ul>
      </div>

      <div className="form-control">
        <textarea
          {...register('impact')}
          className={`textarea textarea-bordered min-h-[180px] text-base ${
            errors.impact ? 'textarea-error' : ''
          }`}
          placeholder="Example: This would reduce customer support call volume by 30%, saving the support team approximately 50 hours per week. Customers would get instant answers 24/7, improving satisfaction scores. It also frees up agents to handle complex cases that require human judgment..."
        />
        
        {/* Character counter */}
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-sm ${
              !isValid ? 'text-warning' : 'text-success'
            }`}
          >
            {charCount} / {MIN_IMPACT_CHARS} characters minimum
          </span>
          
          {errors.impact && (
            <span className="text-sm text-error">{errors.impact.message}</span>
          )}
        </div>
        
        {!isValid && charCount > 0 && (
          <p className="text-sm text-warning mt-1">
            Please add more detail about the expected impact.
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
// Add to existing file - Step 3 routing

import { StepImpact } from './StepImpact';

// Inside the return statement, add after StepSolution:
{currentStep === 3 && (
  <StepImpact 
    onNext={handleNext} 
    onBack={handleBack} 
  />
)}
```

### Existing Schema (FROM Story 2.2)

The schema already exists in `ideaSchemas.ts`:
```typescript
export const stepImpactSchema = z.object({
  impact: z
    .string()
    .min(30, 'Please provide at least 30 characters to describe the impact'),
});

// Already part of ideaWizardSchema
export const ideaWizardSchema = z.object({
  problem: stepProblemSchema.shape.problem,
  solution: stepSolutionSchema.shape.solution,
  impact: stepImpactSchema.shape.impact,  // ALREADY EXISTS
});
```

### Barrel Export Update

```tsx
// src/features/ideas/components/IdeaWizard/index.ts
export { IdeaWizard } from './IdeaWizard';
export { StepIndicator } from './StepIndicator';
export { StepProblem } from './StepProblem';
export { StepSolution } from './StepSolution';
export { StepImpact } from './StepImpact';  // ADD THIS LINE
```

### UX Requirements (from UX Design Spec)

**Guidance Prompts Purpose:**
- Step 3 is unique: it includes guidance prompts to help structure impact thinking
- Non-technical users (Maya persona) often struggle to quantify impact
- Prompts scaffold thinking without being prescriptive
- Questions focus on: beneficiaries, metrics, and changes

**Step Indicator States for Step 3:**
| Step | State | Style |
|------|-------|-------|
| Step 1 | Complete | Success green with checkmark |
| Step 2 | Complete | Success green with checkmark |
| Step 3 | Current | Primary red (#E10514) filled |
| Step 4 | Incomplete | Gray outline |

**Navigation Pattern:**
| Button | Position | Style | Behavior |
|--------|----------|-------|----------|
| Back | Left | `btn-ghost` | Returns to Step 2, preserves all data |
| Next | Right | `btn-primary` | Disabled when < 30 chars, validates before advancing |

**Key Difference from Steps 1-2:**
- Lower character minimum (30 vs 50) - impact can be concise
- Includes guidance prompts card (not context card showing previous input)
- Placeholder shows quantifiable impact example
- Questions help users think about value proposition

### PassportCard Theme Colors

| Element | Color | DaisyUI Class |
|---------|-------|---------------|
| Next button | #E10514 | `btn-primary` |
| Back button | Transparent | `btn-ghost` |
| Current step | #E10514 | `bg-primary` |
| Complete steps | Success green | `bg-success` |
| Guidance card | Muted gray | `bg-base-200` |
| Bullet points | Primary red | `text-primary` |
| Warning text | Warning amber | `text-warning` |
| Valid counter | Success green | `text-success` |

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Components | `PascalCase` | `StepImpact` |
| Files | `PascalCase.tsx` | `StepImpact.tsx` |
| Props interfaces | `{Component}Props` | `StepImpactProps` |
| Event handlers | `handle{Action}` | `handleNext`, `handleBack` |
| CSS classes | DaisyUI conventions | `btn-ghost`, `bg-base-200` |
| Constants | `SCREAMING_SNAKE_CASE` | `MIN_IMPACT_CHARS` |

### Anti-Patterns to AVOID

1. **DO NOT** create a separate form for Step 3 - use FormProvider from parent
2. **DO NOT** store impact in local component state - use useFormContext
3. **DO NOT** lose previous step data when navigating back - React Hook Form preserves
4. **DO NOT** show previous step context cards in Step 3 - use guidance prompts instead
5. **DO NOT** use different validation UX than previous steps - maintain consistency
6. **DO NOT** use `btn-secondary` for Back - use `btn-ghost` per pattern
7. **DO NOT** skip trigger('impact') before onNext - always validate
8. **DO NOT** create new schema - stepImpactSchema already exists
9. **DO NOT** set higher character minimum than 30 - impact descriptions can be concise

### Form State Preservation

React Hook Form with FormProvider (set up in Story 2.2) automatically preserves form data across step navigation:
- Parent `IdeaWizard` holds the form context via `FormProvider`
- Each step uses `useFormContext` to read/write to shared form state
- Navigating back/forward never loses data
- `defaultValues` in parent ensures empty string initialization
- By Step 3, user has: problem, solution, (now adding) impact

### Validation Flow

```
User types in textarea
    ↓
watch('impact') updates in real-time
    ↓
charCount calculated, isValid evaluated
    ↓
Character counter color updates (warning/success)
    ↓
"Next" button enabled/disabled based on isValid
    ↓
On click "Next": trigger('impact') validates against Zod schema
    ↓
If valid: onNext() advances to Step 4 (Review)
If invalid: form errors display
```

### Guidance Prompts Design Rationale

Unlike Steps 1 and 2 which show context from previous steps, Step 3 includes guidance prompts because:
1. **Impact is harder to articulate** - Users often struggle with "why does this matter?"
2. **Scaffolding thinking** - Questions prompt structured value proposition thinking
3. **Not prescriptive** - Questions are suggestive, not required to answer all
4. **Business-oriented** - Helps translate ideas into business value language

The guidance prompts card uses the same `bg-base-200` styling as context cards in previous steps for visual consistency, but contains forward-looking questions rather than backward-looking context.

### Dependencies on Previous Stories

- **Story 2.2 (Step 1):** IdeaWizard, StepIndicator, StepProblem, schemas, FormProvider setup
- **Story 2.2:** `stepImpactSchema` in ideaSchemas.ts (already defined)
- **Story 2.3 (Step 2):** StepSolution component and pattern
- **Story 2.2/2.3:** handleNext/handleBack functions in IdeaWizard
- **Story 1.2:** PassportCard DaisyUI theme configured

### Dependencies for Future Stories

- **Story 2.5 (Step 4 Review):** Will display problem + solution + impact + AI enhancement
- **Story 2.6 (Gemini Edge Function):** Will enhance the impact along with problem/solution
- **Story 2.7 (Submit):** Will save all three fields to database

### Git Intelligence - Recent Patterns

Based on recent commit history (`ac65d2d` - initial project setup):
- Project uses Vite + React + TypeScript foundation
- ESLint configured for code quality
- Feature-based folder structure established
- Follow established component patterns from previous wizard steps

### Testing Checklist

- [ ] StepImpact renders when currentStep === 3
- [ ] Heading displays "What impact will this have?"
- [ ] Description text renders below heading
- [ ] Guidance prompts card displays with three questions
- [ ] Guidance prompts use bullet list with primary red bullets
- [ ] Step indicator shows steps 1-2 complete, step 3 current
- [ ] Step label reads "Describe the Impact"
- [ ] Textarea renders with placeholder text
- [ ] Character counter shows current count
- [ ] Character counter shows warning style when < 30 chars
- [ ] Character counter shows success style when >= 30 chars
- [ ] "Next" button is disabled when < 30 chars
- [ ] "Next" button is enabled when >= 30 chars
- [ ] Clicking "Next" with valid input proceeds to Step 4
- [ ] Clicking "Back" returns to Step 2
- [ ] Impact text preserved when navigating back
- [ ] Solution text still present when returning from Step 2
- [ ] Problem text still present when navigating back to Step 1
- [ ] Responsive layout works on mobile
- [ ] Guidance card displays correctly on all screen sizes

### Project Structure Notes

- Extends existing IdeaWizard folder from Story 2.2/2.3
- Follows same component patterns established in StepProblem and StepSolution
- Uses existing schema from ideaSchemas.ts (no new schema needed)
- Consistent DaisyUI styling throughout
- Introduces guidance prompts pattern (unique to this step)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Idea Wizard]
- [Source: _bmad-output/implementation-artifacts/2-2-idea-wizard-step-1-problem-definition.md]
- [Source: _bmad-output/implementation-artifacts/2-3-idea-wizard-step-2-solution-description.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
