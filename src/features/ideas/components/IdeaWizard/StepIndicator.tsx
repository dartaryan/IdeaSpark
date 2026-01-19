interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * Step labels for the Idea Wizard
 */
const STEP_LABELS: Record<number, string> = {
  1: 'Define the Problem',
  2: 'Describe Your Solution',
  3: 'Assess the Impact',
  4: 'Review & Enhance',
};

/**
 * StepIndicator - Visual progress indicator for the Idea Wizard
 *
 * Displays step circles with connecting lines and labels.
 * States: incomplete (gray), current (primary red), complete (success green with check)
 */
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
              data-testid={`step-indicator-${step}`}
            >
              {step < currentStep ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step
              )}
            </div>

            {/* Connecting line (except after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-1 transition-colors ${
                  step < currentStep ? 'bg-success' : 'bg-base-300'
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <p className="text-center mt-4 text-lg font-semibold">
        Step {currentStep} of {totalSteps}: {STEP_LABELS[currentStep] || ''}
      </p>
    </div>
  );
}
