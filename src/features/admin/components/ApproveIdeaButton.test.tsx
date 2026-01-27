// src/features/admin/components/ApproveIdeaButton.test.tsx
// Task 3: Test suite for ApproveIdeaButton component
// Tests for approval button with confirmation modal

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { ApproveIdeaButton } from './ApproveIdeaButton';
import type { ReactNode } from 'react';

// Mock useApproveIdea hook
const mockMutate = vi.fn();
let mockIsPending = false;

vi.mock('../hooks/useApproveIdea', () => ({
  useApproveIdea: () => ({
    mutate: mockMutate,
    get isPending() {
      return mockIsPending;
    },
  }),
}));

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const mockIdea = {
  id: 'idea-123',
  title: 'Build Mobile App',
  problem: 'Customers struggle to engage with our platform on mobile devices',
  submitter_name: 'john.doe',
  status: 'submitted' as const,
};

describe('ApproveIdeaButton - Task 3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Subtask 3.2: Display "Approve for PRD" button with success color styling', () => {
    it('renders approve button with correct text', () => {
      render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      expect(button).toBeInTheDocument();
    });

    it('applies success green color styling (#10B981)', () => {
      render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      expect(button).toHaveClass('btn-success');
    });
  });

  describe('Subtask 3.3-3.5: Confirmation modal with idea summary', () => {
    it('opens confirmation modal when button is clicked', async () => {
      const user = userEvent.setup();
      render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(button);

      // Modal should be visible - look for modal content
      expect(screen.getByText('Approve Idea for PRD Development')).toBeInTheDocument();
    });

    it('displays idea title in modal', async () => {
      const user = userEvent.setup();
      render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(button);

      expect(screen.getByText('Build Mobile App')).toBeInTheDocument();
    });

    it('displays submitter name in modal', async () => {
      const user = userEvent.setup();
      render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(button);

      expect(screen.getByText(/john.doe/i)).toBeInTheDocument();
    });

    it('displays truncated problem statement in modal', async () => {
      const longProblemIdea = {
        ...mockIdea,
        problem: 'B'.repeat(200), // Very long problem with unique character
      };

      const user = userEvent.setup();
      render(<ApproveIdeaButton idea={longProblemIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(button);

      // Problem should be truncated - look for the specific pattern
      const problemText = screen.getByText(/B{150}\.{3}/);
      expect(problemText.textContent!.length).toBe(153); // 150 chars + '...'
    });

    it('displays "Confirm Approval" primary action button', async () => {
      const user = userEvent.setup();
      const { container } = render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(button);

      // Query within the modal dialog
      const confirmButton = container.querySelector('button[aria-label="Confirm Approval"]');
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).toHaveClass('btn-primary');
    });

    it('displays "Cancel" secondary action button', async () => {
      const user = userEvent.setup();
      const { container } = render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(button);

      const cancelButton = container.querySelector('button[aria-label="Cancel"]');
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe('Subtask 3.6: Call useApproveIdea mutation on confirmation', () => {
    it('calls approveIdea mutation when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      // Open modal
      const approveButton = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(approveButton);

      // Click confirm
      const confirmButton = container.querySelector('button[aria-label="Confirm Approval"]') as HTMLElement;
      await user.click(confirmButton);

      expect(mockMutate).toHaveBeenCalledWith('idea-123');
    });

    it('does not call mutation when cancel is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      // Open modal
      const approveButton = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(approveButton);

      // Click cancel
      const cancelButton = container.querySelector('button[aria-label="Cancel"]') as HTMLElement;
      await user.click(cancelButton);

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('Subtask 3.7: Disable button and show loading spinner while mutation in progress', () => {
    it('disables button when mutation is pending', () => {
      mockIsPending = true;
      
      render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      expect(button).toBeDisabled();
      
      // Reset for other tests
      mockIsPending = false;
    });

    it('shows loading spinner when mutation is pending', () => {
      mockIsPending = true;
      
      render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      // Look for loading spinner element
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      // Reset for other tests
      mockIsPending = false;
    });
  });

  describe('Subtask 3.8: Close modal after successful approval', () => {
    it('closes modal after confirmation', async () => {
      const user = userEvent.setup();
      const { container } = render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      // Open modal
      const approveButton = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(approveButton);

      // Confirm approval
      const confirmButton = container.querySelector('button[aria-label="Confirm Approval"]') as HTMLElement;
      await user.click(confirmButton);

      // Modal should close - check that modal content is no longer visible
      await waitFor(() => {
        expect(screen.queryByText('Approve Idea for PRD Development')).not.toBeInTheDocument();
      });
    });

    it('closes modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      // Open modal
      const approveButton = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(approveButton);

      // Click cancel
      const cancelButton = container.querySelector('button[aria-label="Cancel"]') as HTMLElement;
      await user.click(cancelButton);

      // Modal should close - check that modal content is no longer visible
      await waitFor(() => {
        expect(screen.queryByText('Approve Idea for PRD Development')).not.toBeInTheDocument();
      });
    });
  });

  describe('PassportCard DSM styling', () => {
    it('applies 20px border radius to modal', async () => {
      const user = userEvent.setup();
      const { container } = render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      await user.click(button);

      // Find the modal box div
      const modalBox = container.querySelector('.modal-box');
      expect(modalBox).toHaveClass('rounded-[20px]');
    });

    it('uses Heroicons check-circle icon in neutral gray', () => {
      render(<ApproveIdeaButton idea={mockIdea} />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /approve for prd/i });
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});
