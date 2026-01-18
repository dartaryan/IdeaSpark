import { useFormContext } from 'react-hook-form';
import type { IdeaWizardFormData } from '../../schemas/ideaSchemas';
import { MIN_PROBLEM_CHARS } from '../../schemas/ideaSchemas';

interface StepProblemProps {
  onNext: () => void;
}

/**
 * StepProblem - Step 1 of the Idea Wizard
 *
 * Allows users to describe the problem they're trying to solve.
 * Includes character counter with visual feedback and validation.
 */
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">What problem are you trying to solve?</h2>
        <p className="text-base-content/70">
          Describe the challenge, pain point, or opportunity you've identified. Be specific about who
          is affected and what the current situation looks like.
        </p>
      </div>

      {/* Textarea */}
      <div className="form-control">
        <textarea
          {...register('problem')}
          className={`textarea textarea-bordered min-h-[200px] text-base ${
            errors.problem ? 'textarea-error' : ''
          }`}
          placeholder="Example: Our customer service team spends 2+ hours daily answering repetitive questions about policy coverage. This delays responses to complex cases and frustrates both employees and customers..."
          data-testid="problem-textarea"
        />

        {/* Character counter and validation message */}
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-sm ${!isValid ? 'text-warning' : 'text-success'}`}
            data-testid="character-counter"
          >
            {charCount} / {MIN_PROBLEM_CHARS} characters minimum
          </span>

          {errors.problem && (
            <span className="text-sm text-error" data-testid="error-message">
              {errors.problem.message}
            </span>
          )}
        </div>

        {/* Encouraging message when validation fails */}
        {!isValid && charCount > 0 && (
          <p className="text-sm text-warning mt-1" data-testid="encouragement-message">
            Please add more detail to help reviewers understand the problem better.
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isValid}
          className="btn btn-primary"
          data-testid="next-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
