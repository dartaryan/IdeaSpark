import { describe, it, expect } from 'vitest';
import {
  stepProblemSchema,
  stepSolutionSchema,
  stepImpactSchema,
  ideaWizardSchema,
  MIN_PROBLEM_CHARS,
  MIN_SOLUTION_CHARS,
  MIN_IMPACT_CHARS,
} from './ideaSchemas';

describe('ideaSchemas', () => {
  describe('stepProblemSchema', () => {
    it('should accept valid problem text with minimum characters', () => {
      const validProblem = 'a'.repeat(MIN_PROBLEM_CHARS);
      const result = stepProblemSchema.safeParse({ problem: validProblem });
      expect(result.success).toBe(true);
    });

    it('should accept problem text longer than minimum', () => {
      const validProblem = 'a'.repeat(MIN_PROBLEM_CHARS + 100);
      const result = stepProblemSchema.safeParse({ problem: validProblem });
      expect(result.success).toBe(true);
    });

    it('should reject problem text shorter than minimum', () => {
      const shortProblem = 'a'.repeat(MIN_PROBLEM_CHARS - 1);
      const result = stepProblemSchema.safeParse({ problem: shortProblem });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod v4 uses .issues instead of .errors
        expect(result.error.issues[0].message).toContain(`${MIN_PROBLEM_CHARS}`);
      }
    });

    it('should reject empty problem text', () => {
      const result = stepProblemSchema.safeParse({ problem: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('stepSolutionSchema', () => {
    it('should accept valid solution text with minimum characters', () => {
      const validSolution = 'a'.repeat(MIN_SOLUTION_CHARS);
      const result = stepSolutionSchema.safeParse({ solution: validSolution });
      expect(result.success).toBe(true);
    });

    it('should reject solution text shorter than minimum', () => {
      const shortSolution = 'a'.repeat(MIN_SOLUTION_CHARS - 1);
      const result = stepSolutionSchema.safeParse({ solution: shortSolution });
      expect(result.success).toBe(false);
    });
  });

  describe('stepImpactSchema', () => {
    it('should accept valid impact text with minimum characters', () => {
      const validImpact = 'a'.repeat(MIN_IMPACT_CHARS);
      const result = stepImpactSchema.safeParse({ impact: validImpact });
      expect(result.success).toBe(true);
    });

    it('should reject impact text shorter than minimum', () => {
      const shortImpact = 'a'.repeat(MIN_IMPACT_CHARS - 1);
      const result = stepImpactSchema.safeParse({ impact: shortImpact });
      expect(result.success).toBe(false);
    });
  });

  describe('ideaWizardSchema', () => {
    it('should accept valid complete wizard data', () => {
      const validData = {
        problem: 'a'.repeat(MIN_PROBLEM_CHARS),
        solution: 'a'.repeat(MIN_SOLUTION_CHARS),
        impact: 'a'.repeat(MIN_IMPACT_CHARS),
      };
      const result = ideaWizardSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject incomplete wizard data', () => {
      const incompleteData = {
        problem: 'a'.repeat(MIN_PROBLEM_CHARS),
        solution: '', // Too short
        impact: 'a'.repeat(MIN_IMPACT_CHARS),
      };
      const result = ideaWizardSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });

    it('should reject when any field is below minimum', () => {
      const invalidData = {
        problem: 'short',
        solution: 'short',
        impact: 'short',
      };
      const result = ideaWizardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('constants', () => {
    it('should have correct minimum character values', () => {
      expect(MIN_PROBLEM_CHARS).toBe(50);
      expect(MIN_SOLUTION_CHARS).toBe(50);
      expect(MIN_IMPACT_CHARS).toBe(30);
    });
  });
});
