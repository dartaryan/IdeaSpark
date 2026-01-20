// Ideas feature barrel export

// Services
export { ideaService } from './services';

// Hooks
export { useEnhanceIdea, useSubmitIdea, ideaQueryKeys } from './hooks';
export type { WizardSubmitData } from './hooks';

// Components
export { IdeaWizard, StepIndicator, StepProblem } from './components/IdeaWizard';

// Schemas
export {
  stepProblemSchema,
  stepSolutionSchema,
  stepImpactSchema,
  ideaWizardSchema,
  MIN_PROBLEM_CHARS,
  MIN_SOLUTION_CHARS,
  MIN_IMPACT_CHARS,
} from './schemas/ideaSchemas';

// Utils
export { generateIdeaTitle } from './utils/ideaUtils';

// Types
export * from './types';
export type {
  StepProblemData,
  StepSolutionData,
  StepImpactData,
  IdeaWizardFormData,
} from './schemas/ideaSchemas';