import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { StepReview } from './StepReview';
import {
  ideaWizardSchema,
  MIN_IMPACT_CHARS,
  MIN_PROBLEM_CHARS,
  MIN_SOLUTION_CHARS,
  type IdeaWizardFormData,
} from '../../schemas/ideaSchemas';

// Mock state for controlling hook behavior in tests
const mockEnhanceMutate = vi.fn();
let mockEnhanceIsPending = false;
let mockEnhanceError: Error | null = null;
let mockEnhanceIsError = false;

// Mock the useEnhanceIdea hook
vi.mock('../../hooks/useEnhanceIdea', () => ({
  useEnhanceIdea: () => ({
    mutate: mockEnhanceMutate,
    isPending: mockEnhanceIsPending,
    error: mockEnhanceError,
    isError: mockEnhanceIsError,
  }),
}));

// Mock the useSubmitIdea hook
const mockSubmitIdea = vi.fn();
let mockSubmitIsSubmitting = false;
vi.mock('../../hooks/useSubmitIdea', () => ({
  useSubmitIdea: () => ({
    submitIdea: mockSubmitIdea,
    isSubmitting: mockSubmitIsSubmitting,
    error: null,
    reset: vi.fn(),
    isSuccess: false,
  }),
}));

// Create a fresh query client for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

beforeEach(() => {
  mockEnhanceMutate.mockReset();
  mockEnhanceIsPending = false;
  mockEnhanceError = null;
  mockEnhanceIsError = false;
  mockSubmitIdea.mockReset();
  mockSubmitIsSubmitting = false;
});

// Wrapper component to provide form context and required providers
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
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FormProvider {...methods}>{children}</FormProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Default valid texts for all steps
const validProblemText = 'a'.repeat(MIN_PROBLEM_CHARS);
const validSolutionText = 'a'.repeat(MIN_SOLUTION_CHARS);
const validImpactText = 'a'.repeat(MIN_IMPACT_CHARS);

const defaultValidValues = {
  problem: validProblemText,
  solution: validSolutionText,
  impact: validImpactText,
};

describe('StepReview', () => {
  describe('Rendering (AC: 1, 4)', () => {
    it('renders the review heading', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByRole('heading', { name: /Review Your Idea/i })).toBeInTheDocument();
    });

    it('renders the description text', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/Review your idea below/i)).toBeInTheDocument();
    });

    it('displays problem section in review format', () => {
      const problem = 'This is my detailed problem description for the idea wizard review';
      render(
        <TestWrapper
          defaultValues={{ ...defaultValidValues, problem }}
        >
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/Problem Statement/i)).toBeInTheDocument();
      expect(screen.getByText(problem)).toBeInTheDocument();
    });

    it('displays solution section in review format', () => {
      const solution = 'This is my detailed solution description for the idea wizard review';
      render(
        <TestWrapper
          defaultValues={{ ...defaultValidValues, solution }}
        >
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/Proposed Solution/i)).toBeInTheDocument();
      expect(screen.getByText(solution)).toBeInTheDocument();
    });

    it('displays impact section in review format', () => {
      const impact = 'This is my expected impact description for the idea';
      render(
        <TestWrapper
          defaultValues={{ ...defaultValidValues, impact }}
        >
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      // Use getByRole to specifically target the heading
      expect(screen.getByRole('heading', { name: /Expected Impact/i })).toBeInTheDocument();
      expect(screen.getByText(impact)).toBeInTheDocument();
    });
  });

  describe('Enhance with AI Button (AC: 2)', () => {
    it('renders the Enhance with AI button prominently', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const enhanceButton = screen.getByRole('button', { name: /Enhance with AI/i });
      expect(enhanceButton).toBeInTheDocument();
    });

    it('Enhance with AI button has primary styling', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const enhanceButton = screen.getByRole('button', { name: /Enhance with AI/i });
      expect(enhanceButton).toHaveClass('btn-primary');
    });
  });

  describe('Navigation Buttons (AC: 4, 9)', () => {
    it('renders Back button', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('renders Submit Idea button', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('calls onBack when Back button is clicked', async () => {
      const user = userEvent.setup();
      const onBack = vi.fn();
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={onBack} />
        </TestWrapper>
      );

      const backButton = screen.getByTestId('back-button');
      await user.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('calls submitIdea hook when Submit Idea button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockSubmitIdea).toHaveBeenCalledTimes(1);
    });

    it('Back button has ghost styling', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const backButton = screen.getByTestId('back-button');
      expect(backButton).toHaveClass('btn-ghost');
    });

    it('Submit button has primary styling', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveClass('btn-primary');
    });
  });

  describe('Review Cards Styling', () => {
    it('review sections have bg-base-200 background', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const reviewCards = screen.getAllByTestId(/review-card-/);
      expect(reviewCards.length).toBe(3);
      reviewCards.forEach((card) => {
        expect(card).toHaveClass('bg-base-200');
      });
    });
  });

  describe('Edit Capability (AC: 3)', () => {
    it('renders edit button for problem section', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('edit-button-problem')).toBeInTheDocument();
    });

    it('renders edit button for solution section', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('edit-button-solution')).toBeInTheDocument();
    });

    it('renders edit button for impact section', () => {
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('edit-button-impact')).toBeInTheDocument();
    });

    it('clicking edit button shows textarea for editing', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const editButton = screen.getByTestId('edit-button-problem');
      await user.click(editButton);

      expect(screen.getByTestId('edit-textarea-problem')).toBeInTheDocument();
    });

    it('edit mode shows Save and Cancel buttons', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const editButton = screen.getByTestId('edit-button-problem');
      await user.click(editButton);

      expect(screen.getByTestId('save-edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-edit-button')).toBeInTheDocument();
    });

    it('clicking Save exits edit mode', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const editButton = screen.getByTestId('edit-button-problem');
      await user.click(editButton);

      const saveButton = screen.getByTestId('save-edit-button');
      await user.click(saveButton);

      expect(screen.queryByTestId('edit-textarea-problem')).not.toBeInTheDocument();
    });

    it('clicking Cancel exits edit mode without saving', async () => {
      const user = userEvent.setup();
      const originalProblem = 'Original problem text that is at least fifty characters long';
      render(
        <TestWrapper defaultValues={{ ...defaultValidValues, problem: originalProblem }}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const editButton = screen.getByTestId('edit-button-problem');
      await user.click(editButton);

      const textarea = screen.getByTestId('edit-textarea-problem');
      await user.clear(textarea);
      await user.type(textarea, 'New text that is completely different from the original');

      const cancelButton = screen.getByTestId('cancel-edit-button');
      await user.click(cancelButton);

      // Should show original text after cancel
      expect(screen.getByText(originalProblem)).toBeInTheDocument();
    });

    it('shows character count in edit mode', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const editButton = screen.getByTestId('edit-button-problem');
      await user.click(editButton);

      expect(screen.getByTestId('edit-char-counter')).toBeInTheDocument();
    });

    it('disables Save button when edited content is below minimum', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const editButton = screen.getByTestId('edit-button-problem');
      await user.click(editButton);

      const textarea = screen.getByTestId('edit-textarea-problem');
      await user.clear(textarea);
      await user.type(textarea, 'Too short');

      const saveButton = screen.getByTestId('save-edit-button');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('AI Enhancement Flow (AC: 5, 6)', () => {
    it('calls useEnhanceIdea mutate when Enhance with AI is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const enhanceButton = screen.getByTestId('enhance-button');
      await user.click(enhanceButton);

      expect(mockEnhanceMutate).toHaveBeenCalledTimes(1);
      expect(mockEnhanceMutate).toHaveBeenCalledWith(
        {
          problem: defaultValidValues.problem,
          solution: defaultValidValues.solution,
          impact: defaultValidValues.impact,
        },
        expect.any(Object)
      );
    });
  });

  describe('Loading State (AC: 5)', () => {
    it('shows loading indicator when AI is processing', () => {
      mockEnhanceIsPending = true;
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText(/Enhancing your idea/i)).toBeInTheDocument();
    });

    it('hides Enhance with AI button when loading', () => {
      mockEnhanceIsPending = true;
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('enhance-button')).not.toBeInTheDocument();
    });

    it('disables Submit button when loading', () => {
      mockEnhanceIsPending = true;
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('submit-button')).toBeDisabled();
    });

    it('hides review cards when loading', () => {
      mockEnhanceIsPending = true;
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('review-card-problem')).not.toBeInTheDocument();
    });
  });

  describe('Error State (AC: 10)', () => {
    it('shows error alert when enhancement fails', () => {
      mockEnhanceIsError = true;
      mockEnhanceError = new Error('AI service unavailable');
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('error-alert')).toBeInTheDocument();
      expect(screen.getByText(/Enhancement failed/i)).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      mockEnhanceIsError = true;
      mockEnhanceError = new Error('AI service unavailable');
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('shows error message in alert', () => {
      mockEnhanceIsError = true;
      mockEnhanceError = new Error('Custom error message from service');
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/Custom error message from service/i)).toBeInTheDocument();
    });

    it('allows proceeding with original text on error (Submit button enabled)', () => {
      mockEnhanceIsError = true;
      mockEnhanceError = new Error('AI service unavailable');
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('submit-button')).not.toBeDisabled();
    });

    it('calls enhance again when retry button is clicked', async () => {
      const user = userEvent.setup();
      mockEnhanceIsError = true;
      mockEnhanceError = new Error('AI service unavailable');
      render(
        <TestWrapper defaultValues={defaultValidValues}>
          <StepReview onBack={vi.fn()} />
        </TestWrapper>
      );

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      expect(mockEnhanceMutate).toHaveBeenCalledTimes(1);
    });
  });
});
