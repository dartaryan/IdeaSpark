import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IdeaWizard } from './IdeaWizard';
import { MIN_PROBLEM_CHARS, MIN_SOLUTION_CHARS, MIN_IMPACT_CHARS } from '../../schemas/ideaSchemas';

describe('IdeaWizard', () => {
  it('renders the wizard container', () => {
    render(<IdeaWizard />);

    // Should show step indicator starting at step 1
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
  });

  it('renders step 1 content by default', () => {
    render(<IdeaWizard />);

    expect(screen.getByText(/What problem are you trying to solve\?/i)).toBeInTheDocument();
    expect(screen.getByTestId('problem-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('next-button')).toBeInTheDocument();
  });

  it('shows Step 1 indicator as current', () => {
    render(<IdeaWizard />);

    const step1 = screen.getByTestId('step-indicator-1');
    expect(step1).toHaveClass('bg-primary');
  });

  it('shows Steps 2-4 as incomplete initially', () => {
    render(<IdeaWizard />);

    expect(screen.getByTestId('step-indicator-2')).toHaveClass('bg-base-300');
    expect(screen.getByTestId('step-indicator-3')).toHaveClass('bg-base-300');
    expect(screen.getByTestId('step-indicator-4')).toHaveClass('bg-base-300');
  });

  it('navigates to step 2 when valid input is provided and Next is clicked', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    // Enter valid problem text
    const textarea = screen.getByTestId('problem-textarea');
    const validText = 'a'.repeat(MIN_PROBLEM_CHARS);
    await user.type(textarea, validText);

    // Click Next
    const nextButton = screen.getByTestId('next-button');
    await user.click(nextButton);

    // Should now be on step 2
    expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Describe Your Solution/i)).toBeInTheDocument();
  });

  it('shows problem context card on step 2', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    const problemText = 'This is my detailed problem description that is long enough to be valid';

    // Enter problem text and navigate to step 2
    await user.type(screen.getByTestId('problem-textarea'), problemText);
    await user.click(screen.getByTestId('next-button'));

    // Should show problem context card with the problem text
    expect(screen.getByTestId('problem-context-card')).toBeInTheDocument();
    expect(screen.getByTestId('problem-context-text')).toHaveTextContent(problemText);
  });

  it('shows solution textarea on step 2', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    // Navigate to step 2
    await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
    await user.click(screen.getByTestId('next-button'));

    // Should show solution textarea
    expect(screen.getByTestId('solution-textarea')).toBeInTheDocument();
  });

  it('disables Next button on step 2 when solution is too short', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    // Navigate to step 2
    await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
    await user.click(screen.getByTestId('next-button'));

    // Enter insufficient solution text
    await user.type(screen.getByTestId('solution-textarea'), 'Too short');

    // Next button should be disabled
    expect(screen.getByTestId('next-button')).toBeDisabled();
  });

  it('enables Next button on step 2 when solution meets minimum', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    // Navigate to step 2
    await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
    await user.click(screen.getByTestId('next-button'));

    // Enter valid solution text
    await user.type(screen.getByTestId('solution-textarea'), 'a'.repeat(MIN_SOLUTION_CHARS));

    // Next button should be enabled
    expect(screen.getByTestId('next-button')).not.toBeDisabled();
  });

  it('marks step 1 as complete when navigating to step 2', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    // Enter valid problem text and navigate
    const textarea = screen.getByTestId('problem-textarea');
    await user.type(textarea, 'a'.repeat(MIN_PROBLEM_CHARS));
    await user.click(screen.getByTestId('next-button'));

    // Step 1 should be complete
    const step1 = screen.getByTestId('step-indicator-1');
    expect(step1).toHaveClass('bg-success');
  });

  it('can navigate back from step 2 to step 1', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    // Go to step 2
    const textarea = screen.getByTestId('problem-textarea');
    await user.type(textarea, 'a'.repeat(MIN_PROBLEM_CHARS));
    await user.click(screen.getByTestId('next-button'));

    // Click Back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    // Should be back on step 1
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
    expect(screen.getByTestId('problem-textarea')).toBeInTheDocument();
  });

  it('preserves problem text when navigating back and forth', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    const problemText = 'This is my problem description that is long enough to be valid';

    // Enter problem text
    const textarea = screen.getByTestId('problem-textarea');
    await user.type(textarea, problemText);

    // Go to step 2
    await user.click(screen.getByTestId('next-button'));

    // Go back to step 1
    await user.click(screen.getByRole('button', { name: /back/i }));

    // Problem text should be preserved
    const textareaAfter = screen.getByTestId('problem-textarea');
    expect(textareaAfter).toHaveValue(problemText);
  });

  it('does not allow navigation without valid input', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    // Enter insufficient text
    const textarea = screen.getByTestId('problem-textarea');
    await user.type(textarea, 'Too short');

    // Next button should be disabled
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();

    // Should still be on step 1
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
  });

  it('preserves solution text when navigating back from step 2 and returning', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    const problemText = 'a'.repeat(MIN_PROBLEM_CHARS);
    const solutionText = 'This is my solution description that is long enough';

    // Navigate to step 2
    await user.type(screen.getByTestId('problem-textarea'), problemText);
    await user.click(screen.getByTestId('next-button'));

    // Enter solution text
    await user.type(screen.getByTestId('solution-textarea'), solutionText);

    // Go back to step 1
    await user.click(screen.getByTestId('back-button'));

    // Problem text should be preserved
    expect(screen.getByTestId('problem-textarea')).toHaveValue(problemText);

    // Go forward to step 2 again
    await user.click(screen.getByTestId('next-button'));

    // Solution text should be preserved
    expect(screen.getByTestId('solution-textarea')).toHaveValue(solutionText);
  });

  it('can navigate through all steps to step 4', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    // Step 1 -> 2
    await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
    await user.click(screen.getByTestId('next-button'));
    expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument();

    // Step 2 -> 3 (now requires valid solution)
    await user.type(screen.getByTestId('solution-textarea'), 'a'.repeat(MIN_SOLUTION_CHARS));
    await user.click(screen.getByTestId('next-button'));
    expect(screen.getByText(/Step 3 of 4/i)).toBeInTheDocument();

    // Step 3 -> 4 (now requires valid impact)
    await user.type(screen.getByTestId('impact-textarea'), 'a'.repeat(MIN_IMPACT_CHARS));
    await user.click(screen.getByTestId('next-button'));
    expect(screen.getByText(/Step 4 of 4/i)).toBeInTheDocument();
  });

  it('shows Submit button disabled on step 4', async () => {
    const user = userEvent.setup();
    render(<IdeaWizard />);

    // Navigate to step 4 (requires valid problem, solution, and impact)
    await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
    await user.click(screen.getByTestId('next-button'));
    await user.type(screen.getByTestId('solution-textarea'), 'a'.repeat(MIN_SOLUTION_CHARS));
    await user.click(screen.getByTestId('next-button'));
    await user.type(screen.getByTestId('impact-textarea'), 'a'.repeat(MIN_IMPACT_CHARS));
    await user.click(screen.getByTestId('next-button'));

    // Submit button should be disabled (until story 2.5)
    const submitButton = screen.getByRole('button', { name: /submit idea/i });
    expect(submitButton).toBeDisabled();
  });

  describe('Step 3 - Impact Assessment', () => {
    it('shows impact textarea on step 3', async () => {
      const user = userEvent.setup();
      render(<IdeaWizard />);

      // Navigate to step 3
      await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
      await user.click(screen.getByTestId('next-button'));
      await user.type(screen.getByTestId('solution-textarea'), 'a'.repeat(MIN_SOLUTION_CHARS));
      await user.click(screen.getByTestId('next-button'));

      // Should show impact textarea
      expect(screen.getByTestId('impact-textarea')).toBeInTheDocument();
    });

    it('shows guidance prompts card on step 3', async () => {
      const user = userEvent.setup();
      render(<IdeaWizard />);

      // Navigate to step 3
      await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
      await user.click(screen.getByTestId('next-button'));
      await user.type(screen.getByTestId('solution-textarea'), 'a'.repeat(MIN_SOLUTION_CHARS));
      await user.click(screen.getByTestId('next-button'));

      // Should show guidance prompts
      expect(screen.getByTestId('guidance-prompts-card')).toBeInTheDocument();
      expect(screen.getByText(/Who benefits\?/i)).toBeInTheDocument();
    });

    it('shows step indicator with steps 1-2 complete and step 3 current', async () => {
      const user = userEvent.setup();
      render(<IdeaWizard />);

      // Navigate to step 3
      await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
      await user.click(screen.getByTestId('next-button'));
      await user.type(screen.getByTestId('solution-textarea'), 'a'.repeat(MIN_SOLUTION_CHARS));
      await user.click(screen.getByTestId('next-button'));

      // Steps 1-2 should be complete (success)
      expect(screen.getByTestId('step-indicator-1')).toHaveClass('bg-success');
      expect(screen.getByTestId('step-indicator-2')).toHaveClass('bg-success');

      // Step 3 should be current (primary)
      expect(screen.getByTestId('step-indicator-3')).toHaveClass('bg-primary');

      // Step 4 should be incomplete
      expect(screen.getByTestId('step-indicator-4')).toHaveClass('bg-base-300');
    });

    it('disables Next button on step 3 when impact is too short', async () => {
      const user = userEvent.setup();
      render(<IdeaWizard />);

      // Navigate to step 3
      await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
      await user.click(screen.getByTestId('next-button'));
      await user.type(screen.getByTestId('solution-textarea'), 'a'.repeat(MIN_SOLUTION_CHARS));
      await user.click(screen.getByTestId('next-button'));

      // Enter insufficient impact text
      await user.type(screen.getByTestId('impact-textarea'), 'Too short');

      // Next button should be disabled
      expect(screen.getByTestId('next-button')).toBeDisabled();
    });

    it('enables Next button on step 3 when impact meets minimum', async () => {
      const user = userEvent.setup();
      render(<IdeaWizard />);

      // Navigate to step 3
      await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
      await user.click(screen.getByTestId('next-button'));
      await user.type(screen.getByTestId('solution-textarea'), 'a'.repeat(MIN_SOLUTION_CHARS));
      await user.click(screen.getByTestId('next-button'));

      // Enter valid impact text
      await user.type(screen.getByTestId('impact-textarea'), 'a'.repeat(MIN_IMPACT_CHARS));

      // Next button should be enabled
      expect(screen.getByTestId('next-button')).not.toBeDisabled();
    });

    it('can navigate back from step 3 to step 2', async () => {
      const user = userEvent.setup();
      render(<IdeaWizard />);

      // Navigate to step 3
      await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
      await user.click(screen.getByTestId('next-button'));
      await user.type(screen.getByTestId('solution-textarea'), 'a'.repeat(MIN_SOLUTION_CHARS));
      await user.click(screen.getByTestId('next-button'));

      // Click Back
      await user.click(screen.getByTestId('back-button'));

      // Should be back on step 2
      expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument();
      expect(screen.getByTestId('solution-textarea')).toBeInTheDocument();
    });

    it('preserves all data when navigating back from step 3', async () => {
      const user = userEvent.setup();
      render(<IdeaWizard />);

      const problemText = 'a'.repeat(MIN_PROBLEM_CHARS);
      const solutionText = 'a'.repeat(MIN_SOLUTION_CHARS);
      const impactText = 'This is my impact description';

      // Navigate to step 3 with data
      await user.type(screen.getByTestId('problem-textarea'), problemText);
      await user.click(screen.getByTestId('next-button'));
      await user.type(screen.getByTestId('solution-textarea'), solutionText);
      await user.click(screen.getByTestId('next-button'));
      await user.type(screen.getByTestId('impact-textarea'), impactText);

      // Go back to step 2
      await user.click(screen.getByTestId('back-button'));
      expect(screen.getByTestId('solution-textarea')).toHaveValue(solutionText);

      // Go back to step 1
      await user.click(screen.getByTestId('back-button'));
      expect(screen.getByTestId('problem-textarea')).toHaveValue(problemText);

      // Go forward to step 2
      await user.click(screen.getByTestId('next-button'));
      expect(screen.getByTestId('solution-textarea')).toHaveValue(solutionText);

      // Go forward to step 3
      await user.click(screen.getByTestId('next-button'));
      expect(screen.getByTestId('impact-textarea')).toHaveValue(impactText);
    });

    it('shows step label "Assess the Impact" on step 3', async () => {
      const user = userEvent.setup();
      render(<IdeaWizard />);

      // Navigate to step 3
      await user.type(screen.getByTestId('problem-textarea'), 'a'.repeat(MIN_PROBLEM_CHARS));
      await user.click(screen.getByTestId('next-button'));
      await user.type(screen.getByTestId('solution-textarea'), 'a'.repeat(MIN_SOLUTION_CHARS));
      await user.click(screen.getByTestId('next-button'));

      expect(screen.getByText(/Assess the Impact/i)).toBeInTheDocument();
    });
  });
});
