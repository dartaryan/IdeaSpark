// Ideas feature barrel export

// Services
export { ideaService } from './services';

// Hooks
export { useEnhanceIdea, useIdeas, useSubmitIdea, ideaQueryKeys } from './hooks';
export type { WizardSubmitData } from './hooks';

// Components - Wizard
export { IdeaWizard, StepIndicator, StepProblem } from './components/IdeaWizard';

// Components - List View
export { IdeaCard } from './components/IdeaCard';
export { IdeaList, IdeaListSkeleton } from './components/IdeaList';
export { IdeaStatusBadge } from './components/IdeaStatusBadge';
export { IdeasEmptyState } from './components/IdeasEmptyState';
export { IdeasErrorState } from './components/IdeasErrorState';

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