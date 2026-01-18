import { z } from 'zod';

// Minimum character requirements for wizard steps
export const MIN_PROBLEM_CHARS = 50;
export const MIN_SOLUTION_CHARS = 50;
export const MIN_IMPACT_CHARS = 30;

/**
 * Schema for Step 1: Problem Definition
 */
export const stepProblemSchema = z.object({
  problem: z
    .string()
    .min(MIN_PROBLEM_CHARS, `Please provide at least ${MIN_PROBLEM_CHARS} characters to clearly describe the problem`),
});

/**
 * Schema for Step 2: Solution Description (future story 2.3)
 */
export const stepSolutionSchema = z.object({
  solution: z
    .string()
    .min(MIN_SOLUTION_CHARS, `Please provide at least ${MIN_SOLUTION_CHARS} characters to describe your solution`),
});

/**
 * Schema for Step 3: Impact Assessment (future story 2.4)
 */
export const stepImpactSchema = z.object({
  impact: z
    .string()
    .min(MIN_IMPACT_CHARS, `Please provide at least ${MIN_IMPACT_CHARS} characters to describe the expected impact`),
});

/**
 * Combined schema for the full Idea Wizard form
 * Used by the FormProvider to validate all steps
 */
export const ideaWizardSchema = z.object({
  problem: stepProblemSchema.shape.problem,
  solution: stepSolutionSchema.shape.solution,
  impact: stepImpactSchema.shape.impact,
});

// Type exports
export type StepProblemData = z.infer<typeof stepProblemSchema>;
export type StepSolutionData = z.infer<typeof stepSolutionSchema>;
export type StepImpactData = z.infer<typeof stepImpactSchema>;
export type IdeaWizardFormData = z.infer<typeof ideaWizardSchema>;
