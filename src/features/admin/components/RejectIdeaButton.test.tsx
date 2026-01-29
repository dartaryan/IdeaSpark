// src/features/admin/components/RejectIdeaButton.test.tsx
// Story 5.5 - Task 4: Tests for RejectIdeaButton and RejectIdeaModal

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RejectIdeaButton } from './RejectIdeaButton';
import { RejectIdeaModal } from './RejectIdeaModal';
import type { IdeaWithSubmitter } from '../types';

// Mock the useRejectIdea hook
vi.mock('../hooks/useRejectIdea', () => ({
  useRejectIdea: () => ({
    mutate: vi.fn((params, options) => {
      // Simulate success callback
      if (options?.onSuccess) {
        setTimeout(() => options.onSuccess(), 0);
      }
    }),
    isPending: false,
  }),
}));

// Mock toast
vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// Mock idea data
const mockSubmittedIdea: IdeaWithSubmitter = {
  id: 'idea-123',
  user_id: 'user-456',
  title: 'Test Innovation Idea',
  problem: 'This is a test problem that needs solving in the organization.',
  solution: 'Test solution',
  impact: 'Test impact',
  status: 'submitted',
  created_at: '2026-01-27T10:00:00Z',
  updated_at: '2026-01-27T10:00:00Z',
  status_updated_at: '2026-01-27T10:00:00Z',
  submitter_name: 'Test User',
  submitter_email: 'test@example.com',
};

const mockApprovedIdea: IdeaWithSubmitter = {
  ...mockSubmittedIdea,
  id: 'idea-approved',
  status: 'approved',
};

describe('RejectIdeaButton - Story 5.5 Task 4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Subtask 4.1: Button component creation', () => {
    it('renders reject button for submitted ideas', () => {
      render(<RejectIdeaButton idea={mockSubmittedIdea} />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
    });

    it('does not render for non-submitted ideas', () => {
      render(<RejectIdeaButton idea={mockApprovedIdea} />, { wrapper: createWrapper() });
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Subtask 4.2: Button styling', () => {
    it('renders with danger color styling', () => {
      render(<RejectIdeaButton idea={mockSubmittedIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /reject/i });
      expect(button).toHaveClass('bg-[#EF4444]');
    });

    it('renders icon variant with neutral gray icon', () => {
      render(<RejectIdeaButton idea={mockSubmittedIdea} variant="icon" />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /reject idea with feedback/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('btn-circle');
    });
  });

  describe('Subtask 4.3-4.4: Modal opens on click', () => {
    it('opens modal when button is clicked', async () => {
      const user = userEvent.setup();
      render(<RejectIdeaButton idea={mockSubmittedIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /reject/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Reject Idea')).toBeInTheDocument();
      });
      expect(screen.getByText('Test Innovation Idea')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('opens modal when icon button is clicked', async () => {
      const user = userEvent.setup();
      render(<RejectIdeaButton idea={mockSubmittedIdea} variant="icon" />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /reject idea with feedback/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Reject Idea')).toBeInTheDocument();
      });
    });
  });

  describe('Button variants and sizes', () => {
    it('renders different sizes correctly', () => {
      const { rerender } = render(
        <RejectIdeaButton idea={mockSubmittedIdea} variant="icon" size="xs" />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByRole('button')).toHaveClass('btn-xs');

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <RejectIdeaButton idea={mockSubmittedIdea} variant="icon" size="sm" />
        </QueryClientProvider>
      );
      
      expect(screen.getByRole('button')).toHaveClass('btn-sm');
    });
  });

  describe('Event propagation', () => {
    it('stops event propagation on click', async () => {
      const user = userEvent.setup();
      const parentClickHandler = vi.fn();
      
      render(
        <div onClick={parentClickHandler}>
          <RejectIdeaButton idea={mockSubmittedIdea} variant="icon" />
        </div>,
        { wrapper: createWrapper() }
      );
      
      const button = screen.getByRole('button', { name: /reject idea with feedback/i });
      await user.click(button);

      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });
});

describe('RejectIdeaModal - Story 5.5 Task 4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Subtask 4.4: Modal content', () => {
    it('displays idea title and submitter name', () => {
      render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={true} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Test Innovation Idea')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('displays truncated problem statement', () => {
      const longProblemIdea = {
        ...mockSubmittedIdea,
        problem: 'A'.repeat(200),
      };
      
      render(
        <RejectIdeaModal idea={longProblemIdea} isOpen={true} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );
      
      // Should be truncated to 150 chars + '...'
      expect(screen.getByText(/A{150}\.\.\./)).toBeInTheDocument();
    });
  });

  describe('Subtask 4.5: Character counter', () => {
    it('displays character counter', async () => {
      render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={true} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );
      
      await waitFor(() => {
        expect(screen.getByText('0/500')).toBeInTheDocument();
      });
    });

    it('updates character counter as user types', async () => {
      const user = userEvent.setup();
      render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={true} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );
      
      await waitFor(() => {
        expect(screen.getByLabelText(/rejection feedback/i)).toBeInTheDocument();
      });
      
      const textarea = screen.getByLabelText(/rejection feedback/i);
      await user.type(textarea, 'This is test feedback');

      await waitFor(() => {
        expect(screen.getByText('21/500')).toBeInTheDocument();
      });
    });
  });

  describe('Subtask 4.7: Validation', () => {
    it('disables submit button when feedback is too short', async () => {
      const user = userEvent.setup();
      render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={true} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );
      
      const textarea = await screen.findByLabelText(/rejection feedback/i);
      await user.type(textarea, 'Too short');

      // Get button by text content since aria-label might not match with disabled state
      const submitButton = await screen.findByText('Confirm Rejection');
      expect(submitButton.closest('button')).toBeDisabled();
    });

    it('enables submit button when feedback meets minimum length', async () => {
      const user = userEvent.setup();
      render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={true} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );
      
      const textarea = await screen.findByLabelText(/rejection feedback/i);
      await user.type(textarea, 'This feedback is long enough to meet the minimum requirement.');

      const submitButton = await screen.findByText('Confirm Rejection');
      expect(submitButton.closest('button')).not.toBeDisabled();
    });

    it('shows validation message when feedback is too short', async () => {
      const user = userEvent.setup();
      render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={true} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );
      
      const textarea = await screen.findByLabelText(/rejection feedback/i);
      await user.type(textarea, 'Short');

      await waitFor(() => {
        expect(screen.getByText(/minimum 20 characters required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Subtask 4.6: Modal actions', () => {
    it('has cancel button', async () => {
      render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={true} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );
      
      const cancelButton = await screen.findByText('Cancel');
      expect(cancelButton).toBeInTheDocument();
    });

    it('calls onClose when cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={true} onClose={onClose} />,
        { wrapper: createWrapper() }
      );
      
      const cancelButton = await screen.findByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('Modal visibility', () => {
    it('does not render when isOpen is false', () => {
      render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={false} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.queryByText('Reject Idea')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', async () => {
      render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={true} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );
      
      await waitFor(() => {
        expect(screen.getByText('Reject Idea')).toBeInTheDocument();
      });
    });
  });

  describe('Subtask 4.10: Modal closes after successful rejection', () => {
    it('resets feedback when modal opens', async () => {
      const { rerender } = render(
        <RejectIdeaModal idea={mockSubmittedIdea} isOpen={false} onClose={() => {}} />,
        { wrapper: createWrapper() }
      );

      // Open modal
      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <RejectIdeaModal idea={mockSubmittedIdea} isOpen={true} onClose={() => {}} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/rejection feedback/i)).toBeInTheDocument();
      });
      
      const textarea = screen.getByLabelText(/rejection feedback/i);
      expect(textarea).toHaveValue('');
    });
  });
});
