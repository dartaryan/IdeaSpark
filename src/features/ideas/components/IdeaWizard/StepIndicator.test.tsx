import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepIndicator } from './StepIndicator';

describe('StepIndicator', () => {
  it('renders the correct number of steps', () => {
    render(<StepIndicator currentStep={1} totalSteps={4} />);

    // Should have 4 step indicators
    expect(screen.getByTestId('step-indicator-1')).toBeInTheDocument();
    expect(screen.getByTestId('step-indicator-2')).toBeInTheDocument();
    expect(screen.getByTestId('step-indicator-3')).toBeInTheDocument();
    expect(screen.getByTestId('step-indicator-4')).toBeInTheDocument();
  });

  it('displays current step label correctly', () => {
    render(<StepIndicator currentStep={1} totalSteps={4} />);

    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Define the Problem/i)).toBeInTheDocument();
  });

  it('displays step 2 label correctly', () => {
    render(<StepIndicator currentStep={2} totalSteps={4} />);

    expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Describe Your Solution/i)).toBeInTheDocument();
  });

  it('displays step 3 label correctly', () => {
    render(<StepIndicator currentStep={3} totalSteps={4} />);

    expect(screen.getByText(/Step 3 of 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Assess the Impact/i)).toBeInTheDocument();
  });

  it('displays step 4 label correctly', () => {
    render(<StepIndicator currentStep={4} totalSteps={4} />);

    expect(screen.getByText(/Step 4 of 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Review & Submit/i)).toBeInTheDocument();
  });

  it('marks current step with aria-current attribute', () => {
    render(<StepIndicator currentStep={2} totalSteps={4} />);

    const step2 = screen.getByTestId('step-indicator-2');
    expect(step2).toHaveAttribute('aria-current', 'step');

    const step1 = screen.getByTestId('step-indicator-1');
    expect(step1).not.toHaveAttribute('aria-current');
  });

  it('applies correct styles for current step', () => {
    render(<StepIndicator currentStep={2} totalSteps={4} />);

    const currentStep = screen.getByTestId('step-indicator-2');
    expect(currentStep).toHaveClass('bg-primary');
    expect(currentStep).toHaveClass('text-primary-content');
  });

  it('applies correct styles for completed steps', () => {
    render(<StepIndicator currentStep={3} totalSteps={4} />);

    // Step 1 and 2 should be complete
    const step1 = screen.getByTestId('step-indicator-1');
    const step2 = screen.getByTestId('step-indicator-2');

    expect(step1).toHaveClass('bg-success');
    expect(step2).toHaveClass('bg-success');
  });

  it('applies correct styles for incomplete steps', () => {
    render(<StepIndicator currentStep={1} totalSteps={4} />);

    // Steps 2, 3, 4 should be incomplete
    const step2 = screen.getByTestId('step-indicator-2');
    const step3 = screen.getByTestId('step-indicator-3');
    const step4 = screen.getByTestId('step-indicator-4');

    expect(step2).toHaveClass('bg-base-300');
    expect(step3).toHaveClass('bg-base-300');
    expect(step4).toHaveClass('bg-base-300');
  });

  it('shows checkmark for completed steps', () => {
    render(<StepIndicator currentStep={3} totalSteps={4} />);

    // Completed steps should have SVG checkmark (not the number)
    const step1 = screen.getByTestId('step-indicator-1');
    const step2 = screen.getByTestId('step-indicator-2');

    expect(step1.querySelector('svg')).toBeInTheDocument();
    expect(step2.querySelector('svg')).toBeInTheDocument();
  });

  it('shows step number for current and incomplete steps', () => {
    render(<StepIndicator currentStep={2} totalSteps={4} />);

    const step2 = screen.getByTestId('step-indicator-2');
    const step3 = screen.getByTestId('step-indicator-3');
    const step4 = screen.getByTestId('step-indicator-4');

    expect(step2).toHaveTextContent('2');
    expect(step3).toHaveTextContent('3');
    expect(step4).toHaveTextContent('4');
  });
});
