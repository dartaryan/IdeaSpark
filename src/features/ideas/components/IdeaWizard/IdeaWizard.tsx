import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ideaWizardSchema, type IdeaWizardFormData } from '../../schemas/ideaSchemas';
import { StepIndicator } from './StepIndicator';
import { StepProblem } from './StepProblem';
import { StepSolution } from './StepSolution';
import { StepImpact } from './StepImpact';
import { StepReview } from './StepReview';

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

  const handleSubmit = () => {
    // TODO: Story 2.7 - Implement actual submission to database
    console.log('Submit idea:', methods.getValues());
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <FormProvider {...methods}>
        {currentStep === 1 && <StepProblem onNext={handleNext} />}

        {currentStep === 2 && <StepSolution onNext={handleNext} onBack={handleBack} />}

        {currentStep === 3 && <StepImpact onNext={handleNext} onBack={handleBack} />}

        {currentStep === 4 && (
          <StepReview onBack={handleBack} onSubmit={handleSubmit} />
        )}
      </FormProvider>
    </div>
  );
}
