import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StepSolution } from './StepSolution';
import {
  ideaWizardSchema,
  MIN_SOLUTION_CHARS,
  MIN_PROBLEM_CHARS,
  type IdeaWizardFormData,
} from '../../schemas/ideaSchemas';

// Wrapper component to provide form context
function TestWrapper({
  children,
  defaultValues = { problem: '', solution: '', impact: '' },
}: {
  children: React.ReactNode;
  defaultValues?: IdeaWizardFormData;
}) {
  const methods = useForm<IdeaWizardFormData>({
    resolver: zodResolver(ideaWizardSchema),
    mode: 'onChange',
    defaultValues,
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

// Default problem text for tests (simulating Step 1 completion)
const validProblemText = 'a'.repeat(MIN_PROBLEM_CHARS);

describe('StepSolution', () => {
  describe('Rendering', () => {
    it('renders the solution description heading', () => {
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/What's your proposed solution\?/i)).toBeInTheDocument();
    });

    it('renders the textarea with placeholder', () => {
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('solution-textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder');
      expect(textarea.getAttribute('placeholder')).toContain('Example:');
    });

    it('renders the character counter', () => {
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const counter = screen.getByTestId('character-counter');
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveTextContent(`0 / ${MIN_SOLUTION_CHARS} characters minimum`);
    });

    it('renders both Back and Next buttons', () => {
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });
  });

  describe('Problem Context Card', () => {
    it('displays the problem statement from Step 1', () => {
      const problemText = 'This is my problem description that was entered in Step 1';
      render(
        <TestWrapper defaultValues={{ problem: problemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const contextCard = screen.getByTestId('problem-context-card');
      expect(contextCard).toBeInTheDocument();
      expect(screen.getByTestId('problem-context-text')).toHaveTextContent(problemText);
    });

    it('shows "Your Problem Statement:" label', () => {
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/Your Problem Statement:/i)).toBeInTheDocument();
    });

    it('displays full problem text without truncation', () => {
      const longProblemText =
        'This is a very long problem description that should be displayed in full without any truncation. It contains multiple sentences and goes on for quite a while to ensure that the context card properly shows all the content.';
      render(
        <TestWrapper defaultValues={{ problem: longProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('problem-context-text')).toHaveTextContent(longProblemText);
    });
  });

  describe('Character Counter', () => {
    it('updates character counter when typing', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('solution-textarea');
      await user.type(textarea, 'Hello world');

      const counter = screen.getByTestId('character-counter');
      expect(counter).toHaveTextContent(`11 / ${MIN_SOLUTION_CHARS} characters minimum`);
    });

    it('shows warning style when below minimum characters', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('solution-textarea');
      await user.type(textarea, 'Short text');

      const counter = screen.getByTestId('character-counter');
      expect(counter).toHaveClass('text-warning');
    });

    it('shows success style when at or above minimum characters', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('solution-textarea');
      const validText = 'a'.repeat(MIN_SOLUTION_CHARS);
      await user.type(textarea, validText);

      const counter = screen.getByTestId('character-counter');
      expect(counter).toHaveClass('text-success');
    });
  });

  describe('Validation Messages', () => {
    it('shows encouragement message when partially filled but below minimum', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('solution-textarea');
      await user.type(textarea, 'Partial input');

      expect(screen.getByTestId('encouragement-message')).toBeInTheDocument();
      expect(screen.getByTestId('encouragement-message')).toHaveTextContent(
        /Please add more detail/i
      );
    });

    it('does not show encouragement message when empty', () => {
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('encouragement-message')).not.toBeInTheDocument();
    });

    it('does not show encouragement message when valid', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('solution-textarea');
      const validText = 'a'.repeat(MIN_SOLUTION_CHARS);
      await user.type(textarea, validText);

      expect(screen.queryByTestId('encouragement-message')).not.toBeInTheDocument();
    });
  });

  describe('Next Button Validation', () => {
    it('disables Next button when below minimum characters', () => {
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });

    it('enables Next button when at minimum characters', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('solution-textarea');
      const validText = 'a'.repeat(MIN_SOLUTION_CHARS);
      await user.type(textarea, validText);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });

    it('calls onNext when Next button is clicked with valid input', async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={onNext} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('solution-textarea');
      const validText = 'a'.repeat(MIN_SOLUTION_CHARS);
      await user.type(textarea, validText);

      const nextButton = screen.getByTestId('next-button');
      await user.click(nextButton);

      expect(onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Back Button Navigation', () => {
    it('calls onBack when Back button is clicked', async () => {
      const user = userEvent.setup();
      const onBack = vi.fn();
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={onBack} />
        </TestWrapper>
      );

      const backButton = screen.getByTestId('back-button');
      await user.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('Back button is always enabled regardless of validation state', () => {
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const backButton = screen.getByTestId('back-button');
      expect(backButton).not.toBeDisabled();
    });
  });

  describe('Data Persistence', () => {
    it('preserves solution text when re-rendered', () => {
      const defaultValues = {
        problem: validProblemText,
        solution: 'Previously entered solution description that is long enough to be valid',
        impact: '',
      };

      render(
        <TestWrapper defaultValues={defaultValues}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('solution-textarea');
      expect(textarea).toHaveValue(defaultValues.solution);
    });

    it('shows correct character count for pre-filled solution', () => {
      const solutionText = 'Pre-filled solution text that is long enough';
      const defaultValues = {
        problem: validProblemText,
        solution: solutionText,
        impact: '',
      };

      render(
        <TestWrapper defaultValues={defaultValues}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const counter = screen.getByTestId('character-counter');
      expect(counter).toHaveTextContent(
        `${solutionText.length} / ${MIN_SOLUTION_CHARS} characters minimum`
      );
    });
  });

  describe('Button Styling', () => {
    it('Back button has ghost style', () => {
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const backButton = screen.getByTestId('back-button');
      expect(backButton).toHaveClass('btn-ghost');
    });

    it('Next button has primary style', () => {
      render(
        <TestWrapper defaultValues={{ problem: validProblemText, solution: '', impact: '' }}>
          <StepSolution onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toHaveClass('btn-primary');
    });
  });
});
