import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ideaWizardSchema, type IdeaWizardFormData } from '../../schemas/ideaSchemas';
import { StepIndicator } from './StepIndicator';
import { StepProblem } from './StepProblem';
import { StepSolution } from './StepSolution';
import { StepImpact } from './StepImpact';

const TOTAL_STEPS = 4;

/**
 * IdeaWizard - Multi-step form for idea submission
 *
 * Step 1: Problem Definition (this story)
 * Step 2: Solution Description (story 2.3)
 * Step 3: Impact Assessment (story 2.4)
 * Step 4: Review & Submit (story 2.5)
 */
export function IdeaWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  const methods = useForm<IdeaWizardFormData>({
    resolver: zodResolver(ideaWizardSchema),
    mode: 'onChange', // Validate on change for real-time feedback
    defaultValues: {
      problem: '',
      solution: '',
      impact: '',
    },
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <FormProvider {...methods}>
        {currentStep === 1 && <StepProblem onNext={handleNext} />}

        {currentStep === 2 && <StepSolution onNext={handleNext} onBack={handleBack} />}

        {currentStep === 3 && <StepImpact onNext={handleNext} onBack={handleBack} />}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Step 4: Review & Submit - Coming in Story 2.5</span>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={handleBack} className="btn btn-ghost">
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled>
                Submit Idea
              </button>
            </div>
          </div>
        )}
      </FormProvider>
    </div>
  );
}
