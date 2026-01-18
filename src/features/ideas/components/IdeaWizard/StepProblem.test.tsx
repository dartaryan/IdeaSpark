import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StepProblem } from './StepProblem';
import { ideaWizardSchema, MIN_PROBLEM_CHARS, type IdeaWizardFormData } from '../../schemas/ideaSchemas';

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

describe('StepProblem', () => {
  it('renders the problem definition heading', () => {
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText(/What problem are you trying to solve\?/i)).toBeInTheDocument();
  });

  it('renders the textarea with placeholder', () => {
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    const textarea = screen.getByTestId('problem-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder');
    expect(textarea.getAttribute('placeholder')).toContain('Example:');
  });

  it('renders the character counter', () => {
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    const counter = screen.getByTestId('character-counter');
    expect(counter).toBeInTheDocument();
    expect(counter).toHaveTextContent(`0 / ${MIN_PROBLEM_CHARS} characters minimum`);
  });

  it('updates character counter when typing', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    const textarea = screen.getByTestId('problem-textarea');
    await user.type(textarea, 'Hello world');

    const counter = screen.getByTestId('character-counter');
    expect(counter).toHaveTextContent(`11 / ${MIN_PROBLEM_CHARS} characters minimum`);
  });

  it('shows warning style when below minimum characters', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    const textarea = screen.getByTestId('problem-textarea');
    await user.type(textarea, 'Short text');

    const counter = screen.getByTestId('character-counter');
    expect(counter).toHaveClass('text-warning');
  });

  it('shows success style when at or above minimum characters', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    const textarea = screen.getByTestId('problem-textarea');
    const validText = 'a'.repeat(MIN_PROBLEM_CHARS);
    await user.type(textarea, validText);

    const counter = screen.getByTestId('character-counter');
    expect(counter).toHaveClass('text-success');
  });

  it('shows encouragement message when partially filled but below minimum', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    const textarea = screen.getByTestId('problem-textarea');
    await user.type(textarea, 'Partial input');

    expect(screen.getByTestId('encouragement-message')).toBeInTheDocument();
    expect(screen.getByTestId('encouragement-message')).toHaveTextContent(
      /Please add more detail/i
    );
  });

  it('does not show encouragement message when empty', () => {
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.queryByTestId('encouragement-message')).not.toBeInTheDocument();
  });

  it('does not show encouragement message when valid', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    const textarea = screen.getByTestId('problem-textarea');
    const validText = 'a'.repeat(MIN_PROBLEM_CHARS);
    await user.type(textarea, validText);

    expect(screen.queryByTestId('encouragement-message')).not.toBeInTheDocument();
  });

  it('disables Next button when below minimum characters', () => {
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();
  });

  it('enables Next button when at minimum characters', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    const textarea = screen.getByTestId('problem-textarea');
    const validText = 'a'.repeat(MIN_PROBLEM_CHARS);
    await user.type(textarea, validText);

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onNext when Next button is clicked with valid input', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(
      <TestWrapper>
        <StepProblem onNext={onNext} />
      </TestWrapper>
    );

    const textarea = screen.getByTestId('problem-textarea');
    const validText = 'a'.repeat(MIN_PROBLEM_CHARS);
    await user.type(textarea, validText);

    const nextButton = screen.getByTestId('next-button');
    await user.click(nextButton);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('preserves form data when re-rendered', () => {
    const defaultValues = {
      problem: 'Previously entered problem description that is long enough',
      solution: '',
      impact: '',
    };

    render(
      <TestWrapper defaultValues={defaultValues}>
        <StepProblem onNext={vi.fn()} />
      </TestWrapper>
    );

    const textarea = screen.getByTestId('problem-textarea');
    expect(textarea).toHaveValue(defaultValues.problem);
  });
});
