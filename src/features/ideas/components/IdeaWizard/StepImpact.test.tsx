import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StepImpact } from './StepImpact';
import {
  ideaWizardSchema,
  MIN_IMPACT_CHARS,
  MIN_PROBLEM_CHARS,
  MIN_SOLUTION_CHARS,
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

// Default valid texts for previous steps (simulating Step 1 & 2 completion)
const validProblemText = 'a'.repeat(MIN_PROBLEM_CHARS);
const validSolutionText = 'a'.repeat(MIN_SOLUTION_CHARS);

describe('StepImpact', () => {
  describe('Rendering', () => {
    it('renders the impact assessment heading', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/What impact will this have\?/i)).toBeInTheDocument();
    });

    it('renders the description text', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/Help reviewers understand/i)).toBeInTheDocument();
    });

    it('renders the textarea with placeholder', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder');
      expect(textarea.getAttribute('placeholder')).toContain('Example:');
    });

    it('renders the character counter', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const counter = screen.getByTestId('character-counter');
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveTextContent(`0 / ${MIN_IMPACT_CHARS} characters minimum`);
    });

    it('renders both Back and Next buttons', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });
  });

  describe('Guidance Prompts Card', () => {
    it('displays the guidance prompts card', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const guidanceCard = screen.getByTestId('guidance-prompts-card');
      expect(guidanceCard).toBeInTheDocument();
    });

    it('shows "Consider these questions:" label', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/Consider these questions:/i)).toBeInTheDocument();
    });

    it('displays "Who benefits?" guidance prompt', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/Who benefits\?/i)).toBeInTheDocument();
    });

    it('displays "What metrics improve?" guidance prompt', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/What metrics improve\?/i)).toBeInTheDocument();
    });

    it('displays "What changes?" guidance prompt', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/What changes\?/i)).toBeInTheDocument();
    });
  });

  describe('Character Counter', () => {
    it('updates character counter when typing', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      await user.type(textarea, 'Hello world');

      const counter = screen.getByTestId('character-counter');
      expect(counter).toHaveTextContent(`11 / ${MIN_IMPACT_CHARS} characters minimum`);
    });

    it('shows warning style when below minimum characters', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      await user.type(textarea, 'Short text');

      const counter = screen.getByTestId('character-counter');
      expect(counter).toHaveClass('text-warning');
    });

    it('shows success style when at or above minimum characters', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      const validText = 'a'.repeat(MIN_IMPACT_CHARS);
      await user.type(textarea, validText);

      const counter = screen.getByTestId('character-counter');
      expect(counter).toHaveClass('text-success');
    });
  });

  describe('Validation Messages', () => {
    it('shows encouragement message when partially filled but below minimum', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      await user.type(textarea, 'Partial input');

      expect(screen.getByTestId('encouragement-message')).toBeInTheDocument();
      expect(screen.getByTestId('encouragement-message')).toHaveTextContent(
        /Please add more detail/i
      );
    });

    it('does not show encouragement message when empty', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('encouragement-message')).not.toBeInTheDocument();
    });

    it('does not show encouragement message when valid', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      const validText = 'a'.repeat(MIN_IMPACT_CHARS);
      await user.type(textarea, validText);

      expect(screen.queryByTestId('encouragement-message')).not.toBeInTheDocument();
    });
  });

  describe('Next Button Validation', () => {
    it('disables Next button when below minimum characters', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });

    it('enables Next button when at minimum characters', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      const validText = 'a'.repeat(MIN_IMPACT_CHARS);
      await user.type(textarea, validText);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });

    it('calls onNext when Next button is clicked with valid input', async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={onNext} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      const validText = 'a'.repeat(MIN_IMPACT_CHARS);
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
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={onBack} />
        </TestWrapper>
      );

      const backButton = screen.getByTestId('back-button');
      await user.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('Back button is always enabled regardless of validation state', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const backButton = screen.getByTestId('back-button');
      expect(backButton).not.toBeDisabled();
    });
  });

  describe('Data Persistence', () => {
    it('preserves impact text when re-rendered', () => {
      const defaultValues = {
        problem: validProblemText,
        solution: validSolutionText,
        impact: 'Previously entered impact description that is long enough to be valid',
      };

      render(
        <TestWrapper defaultValues={defaultValues}>
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      expect(textarea).toHaveValue(defaultValues.impact);
    });

    it('shows correct character count for pre-filled impact', () => {
      const impactText = 'Pre-filled impact text that is long enough';
      const defaultValues = {
        problem: validProblemText,
        solution: validSolutionText,
        impact: impactText,
      };

      render(
        <TestWrapper defaultValues={defaultValues}>
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const counter = screen.getByTestId('character-counter');
      expect(counter).toHaveTextContent(
        `${impactText.length} / ${MIN_IMPACT_CHARS} characters minimum`
      );
    });
  });

  describe('Button Styling', () => {
    it('Back button has ghost style', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const backButton = screen.getByTestId('back-button');
      expect(backButton).toHaveClass('btn-ghost');
    });

    it('Next button has primary style', () => {
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toHaveClass('btn-primary');
    });
  });

  describe('Minimum Character Requirement', () => {
    it('uses correct minimum character count (30 for impact)', () => {
      // Verify the constant is 30 as specified in the story
      expect(MIN_IMPACT_CHARS).toBe(30);
    });

    it('enables Next button at exactly 30 characters', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      const exactMinText = 'a'.repeat(30);
      await user.type(textarea, exactMinText);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });

    it('disables Next button at 29 characters', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          defaultValues={{ problem: validProblemText, solution: validSolutionText, impact: '' }}
        >
          <StepImpact onNext={vi.fn()} onBack={vi.fn()} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('impact-textarea');
      const belowMinText = 'a'.repeat(29);
      await user.type(textarea, belowMinText);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });
  });
});
