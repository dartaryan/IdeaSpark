import { useFormContext } from 'react-hook-form';
import type { IdeaWizardFormData } from '../../schemas/ideaSchemas';
import { MIN_IMPACT_CHARS } from '../../schemas/ideaSchemas';

interface StepImpactProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * StepImpact - Step 3 of the Idea Wizard
 *
 * Allows users to describe the expected impact of their idea.
 * Includes guidance prompts to help structure impact thinking.
 * Includes character counter with visual feedback and validation.
 */
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">What impact will this have?</h2>
        <p className="text-base-content/70">
          Help reviewers understand the potential value of your idea. Consider who benefits and what
          improvements you expect.
        </p>
      </div>

      {/* Guidance prompts card */}
      <div className="bg-base-200 rounded-box p-4" data-testid="guidance-prompts-card">
        <h3 className="text-sm font-semibold text-base-content/70 mb-3">
          Consider these questions:
        </h3>
        <ul className="space-y-2 text-base-content">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Who benefits?</strong> Customers, employees, specific departments?
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>What metrics improve?</strong> Time saved, cost reduced, satisfaction
              increased?
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>What changes?</strong> Processes, experiences, capabilities?
            </span>
          </li>
        </ul>
      </div>

      {/* Textarea */}
      <div className="form-control">
        <textarea
          {...register('impact')}
          className={`textarea textarea-bordered min-h-[180px] text-base ${
            errors.impact ? 'textarea-error' : ''
          }`}
          placeholder="Example: This would reduce customer support call volume by 30%, saving the support team approximately 50 hours per week. Customers would get instant answers 24/7, improving satisfaction scores. It also frees up agents to handle complex cases that require human judgment..."
          data-testid="impact-textarea"
        />

        {/* Character counter and validation message */}
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-sm ${!isValid ? 'text-warning' : 'text-success'}`}
            data-testid="character-counter"
          >
            {charCount} / {MIN_IMPACT_CHARS} characters minimum
          </span>

          {errors.impact && (
            <span className="text-sm text-error" data-testid="error-message">
              {errors.impact.message}
            </span>
          )}
        </div>

        {/* Encouraging message when validation fails */}
        {!isValid && charCount > 0 && (
          <p className="text-sm text-warning mt-1" data-testid="encouragement-message">
            Please add more detail about the expected impact.
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
