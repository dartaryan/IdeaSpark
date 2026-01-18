import { useFormContext } from 'react-hook-form';
import type { IdeaWizardFormData } from '../../schemas/ideaSchemas';
import { MIN_SOLUTION_CHARS } from '../../schemas/ideaSchemas';

interface StepSolutionProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * StepSolution - Step 2 of the Idea Wizard
 *
 * Allows users to describe their proposed solution to the problem.
 * Displays the problem statement from Step 1 for context.
 * Includes character counter with visual feedback and validation.
 */
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
      <div className="bg-base-200 rounded-box p-4" data-testid="problem-context-card">
        <h3 className="text-sm font-semibold text-base-content/70 mb-2">
          Your Problem Statement:
        </h3>
        <p className="text-base-content" data-testid="problem-context-text">
          {problemValue}
        </p>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">What's your proposed solution?</h2>
        <p className="text-base-content/70">
          Describe how you would solve this problem. What would you build, change, or implement? Be
          specific about the key features or changes you envision.
        </p>
      </div>

      {/* Textarea */}
      <div className="form-control">
        <textarea
          {...register('solution')}
          className={`textarea textarea-bordered min-h-[200px] text-base ${
            errors.solution ? 'textarea-error' : ''
          }`}
          placeholder="Example: Create an interactive FAQ chatbot that answers common policy questions in real-time. It would integrate with our knowledge base and use simple language customers understand. The chatbot could also escalate to human agents when needed..."
          data-testid="solution-textarea"
        />

        {/* Character counter and validation message */}
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-sm ${!isValid ? 'text-warning' : 'text-success'}`}
            data-testid="character-counter"
          >
            {charCount} / {MIN_SOLUTION_CHARS} characters minimum
          </span>

          {errors.solution && (
            <span className="text-sm text-error" data-testid="error-message">
              {errors.solution.message}
            </span>
          )}
        </div>

        {/* Encouraging message when validation fails */}
        {!isValid && charCount > 0 && (
          <p className="text-sm text-warning mt-1" data-testid="encouragement-message">
            Please add more detail about your proposed solution.
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost"
          data-testid="back-button"
        >
          Back
        </button>
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
