// src/features/admin/components/IdeaListItem.test.tsx
// Task 5: Tests for inline approve action in IdeaListItem
// Story 5.5 Task 6: Tests for inline reject action

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { IdeaListItem } from './IdeaListItem';
import type { IdeaWithSubmitter } from '../types';

// Mock dependencies
vi.mock('../hooks/useApproveIdea', () => ({
  useApproveIdea: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('../hooks/useRejectIdea', () => ({
  useRejectIdea: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('IdeaListItem - Task 5: Inline Approve Action', () => {
  const submittedIdea: IdeaWithSubmitter = {
    id: '1',
    title: 'Test Idea',
    problem: 'Test problem description for the idea that needs approval',
    solution: 'Test solution',
    impact: 'Test impact',
    status: 'submitted',
    submitter_name: 'John Doe',
    submitter_email: 'john@example.com',
    user_id: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    status_updated_at: '2024-01-15T10:00:00Z',
  };

  const approvedIdea: IdeaWithSubmitter = {
    ...submittedIdea,
    id: '2',
    status: 'approved',
  };

  // Subtask 5.2: Only show approve button for ideas with status='submitted'
  it('should show approve icon button only for submitted ideas', () => {
    const { rerender } = render(
      <TestWrapper>
        <IdeaListItem idea={submittedIdea} />
      </TestWrapper>
    );

    // Approve button should be visible for submitted idea
    const approveButton = screen.getByRole('button', { name: /approve idea for prd development/i });
    expect(approveButton).toBeInTheDocument();

    // Rerender with approved idea
    rerender(
      <TestWrapper>
        <IdeaListItem idea={approvedIdea} />
      </TestWrapper>
    );

    // Approve button should NOT be visible for approved idea
    expect(screen.queryByRole('button', { name: /approve idea for prd development/i })).not.toBeInTheDocument();
  });

  // Subtask 5.3 & 5.6: Use check-circle icon with aria-label
  it('should render approve icon button with correct icon and aria-label', () => {
    render(
      <TestWrapper>
        <IdeaListItem idea={submittedIdea} />
      </TestWrapper>
    );

    const approveButton = screen.getByRole('button', { name: /approve idea for prd development/i });
    expect(approveButton).toBeInTheDocument();
    
    // Check that it's an icon button (has SVG child)
    const svg = approveButton.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  // Subtask 5.4: Trigger confirmation modal when clicked
  it('should open confirmation modal when approve icon is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <IdeaListItem idea={submittedIdea} />
      </TestWrapper>
    );

    const approveButton = screen.getByRole('button', { name: /approve idea for prd development/i });
    await user.click(approveButton);

    // Modal should appear with unique header text
    expect(await screen.findByText('Approve Idea for PRD Development')).toBeInTheDocument();

    // Modal should show submitter label (unique to modal)
    expect(screen.getByText('Submitted by')).toBeInTheDocument();
    expect(screen.getAllByText(submittedIdea.submitter_name).length).toBeGreaterThan(0);

    // Modal should have Confirm and Cancel buttons (check by text content)
    expect(screen.getByText('Confirm Approval')).toBeInTheDocument();
    expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
  });

  // Subtask 5.4: Cancel should close modal
  it('should close confirmation modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <IdeaListItem idea={submittedIdea} />
      </TestWrapper>
    );

    // Open modal
    const approveButton = screen.getByRole('button', { name: /approve idea for prd development/i });
    await user.click(approveButton);

    // Wait for modal to appear - check for unique modal header
    await screen.findByText('Approve Idea for PRD Development');
    
    // Click cancel button in modal (get first one which should be in modal)
    const cancelButtons = screen.getAllByText('Cancel');
    await user.click(cancelButtons[0]);

    // Modal should close - check that modal content is gone
    await waitFor(() => {
      expect(screen.queryByText('Approve Idea for PRD Development')).not.toBeInTheDocument();
    });
  });

  // Subtask 5.5: Status badge should update (optimistic update handled by hook)
  it('should display correct status badge for idea status', () => {
    const { rerender } = render(
      <TestWrapper>
        <IdeaListItem idea={submittedIdea} />
      </TestWrapper>
    );

    // Should show "Submitted" badge
    expect(screen.getByText('Submitted')).toBeInTheDocument();

    // Rerender with approved status
    rerender(
      <TestWrapper>
        <IdeaListItem idea={approvedIdea} />
      </TestWrapper>
    );

    // Should show "Approved" badge
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  // Story 5.5 Task 6: Reject button should be present for submitted ideas
  it('should show reject icon button alongside approve for submitted ideas', () => {
    render(
      <TestWrapper>
        <IdeaListItem idea={submittedIdea} />
      </TestWrapper>
    );

    // Both approve and reject buttons should be present
    expect(screen.getByRole('button', { name: /approve idea for prd development/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject idea with feedback/i })).toBeInTheDocument();
  });

  // Test for accessibility
  it('should have proper accessibility attributes on approve button', () => {
    render(
      <TestWrapper>
        <IdeaListItem idea={submittedIdea} />
      </TestWrapper>
    );

    const approveButton = screen.getByRole('button', { name: /approve idea for prd development/i });
    
    // Should have aria-label for screen readers
    expect(approveButton).toHaveAttribute('aria-label', 'Approve idea for PRD development');
  });

  // Story 5.5 Task 6: Reject button should not show for non-submitted ideas
  it('should not show reject button for approved ideas', () => {
    render(
      <TestWrapper>
        <IdeaListItem idea={approvedIdea} />
      </TestWrapper>
    );

    // Reject button should NOT be visible for approved idea
    expect(screen.queryByRole('button', { name: /reject idea with feedback/i })).not.toBeInTheDocument();
  });
});
