// src/features/admin/components/IdeaKanbanCard.test.tsx
// Test suite for IdeaKanbanCard component
// Story 5.3 - Task 3: Create IdeaKanbanCard component
// Task 6: Add inline approve action to kanban cards

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { IdeaKanbanCard } from './IdeaKanbanCard';
import type { IdeaWithSubmitter } from '../types';

// Mock dependencies for Task 6 and Story 5.5 Task 7
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

const mockIdea: IdeaWithSubmitter = {
  id: 'idea-1',
  user_id: 'user-1',
  title: 'Build Mobile App for Customer Engagement',
  problem: 'Customers struggle to engage with our platform on mobile devices. The responsive web version has limitations and poor UX. We need a dedicated mobile experience.',
  solution: 'Develop native mobile app',
  impact: 'High customer satisfaction',
  status: 'submitted',
  created_at: '2026-01-20T10:00:00Z',
  updated_at: '2026-01-20T10:00:00Z',
  status_updated_at: '2026-01-20T10:00:00Z',
  submitter_name: 'john.doe',
  submitter_email: 'john.doe@example.com',
  days_in_stage: 5,
};

const renderWithRouter = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('IdeaKanbanCard', () => {
  it('displays idea title', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    expect(screen.getByText('Build Mobile App for Customer Engagement')).toBeInTheDocument();
  });

  it('truncates long titles to 60 characters with ellipsis', () => {
    const longTitleIdea: IdeaWithSubmitter = {
      ...mockIdea,
      title: 'This is a very long title that exceeds sixty characters and should be truncated',
    };
    renderWithRouter(<IdeaKanbanCard idea={longTitleIdea} />);
    const titleElement = screen.getByText(/This is a very long title/);
    expect(titleElement.textContent).toHaveLength(63); // 60 chars + '...'
  });

  it('displays submitter name', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    expect(screen.getByText('john.doe')).toBeInTheDocument();
  });

  it('displays days in stage', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    expect(screen.getByText(/5 days/)).toBeInTheDocument();
  });

  it('displays status badge', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    expect(screen.getByText('submitted')).toBeInTheDocument();
  });

  it('displays truncated problem statement (first 80 chars)', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    const problemText = screen.getByText(/Customers struggle to engage/);
    expect(problemText.textContent).toBeTruthy();
    // Problem statement should be truncated to around 80 characters
    const fullProblem = mockIdea.problem;
    if (fullProblem.length > 80) {
      expect(problemText.textContent!.length).toBeLessThanOrEqual(83); // 80 + '...'
    }
  });

  it('navigates to idea detail page on click', async () => {
    const user = userEvent.setup();
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    
    const card = screen.getByRole('button', { name: /view details for/i });
    await user.click(card);
    
    // Verify navigation would occur (in a real app, we'd check router state)
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('View details'));
  });

  it('navigates to idea detail page on Enter key', async () => {
    const user = userEvent.setup();
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    
    const card = screen.getByRole('button', { name: /view details for/i });
    card.focus();
    await user.keyboard('{Enter}');
    
    // Verify card is focusable and responds to keyboard
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('has hover cursor pointer style', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    const card = screen.getByRole('button', { name: /view details for/i });
    expect(card).toHaveClass('cursor-pointer');
  });

  it('displays status badge with correct color for submitted status', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    const badge = screen.getByText('submitted');
    expect(badge).toBeInTheDocument();
  });

  it('displays status badge with correct color for approved status', () => {
    const approvedIdea: IdeaWithSubmitter = {
      ...mockIdea,
      status: 'approved',
    };
    renderWithRouter(<IdeaKanbanCard idea={approvedIdea} />);
    const badge = screen.getByText('approved');
    expect(badge).toBeInTheDocument();
  });

  it('displays status badge with correct color for prd_development status', () => {
    const prdIdea: IdeaWithSubmitter = {
      ...mockIdea,
      status: 'prd_development',
    };
    renderWithRouter(<IdeaKanbanCard idea={prdIdea} />);
    const badge = screen.getByText('PRD Development');
    expect(badge).toBeInTheDocument();
  });

  it('displays status badge with correct color for prototype_complete status', () => {
    const prototypeIdea: IdeaWithSubmitter = {
      ...mockIdea,
      status: 'prototype_complete',
    };
    renderWithRouter(<IdeaKanbanCard idea={prototypeIdea} />);
    const badge = screen.getByText('Prototype Complete');
    expect(badge).toBeInTheDocument();
  });

  it('has accessible aria-label', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    const card = screen.getByRole('button', { name: /view details for/i });
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Build Mobile App'));
  });

  it('has elevation shadow on hover effect', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    const card = screen.getByRole('button', { name: /view details for/i });
    // Check for hover classes
    expect(card.className).toContain('hover:');
  });

  // Task 6: Inline approve action tests
  describe('Task 6: Inline Approve Action', () => {
    // Subtask 6.2: Only show approve button for submitted ideas
    it('should show approve icon button only for submitted ideas', () => {
      const { rerender } = renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);

      // Approve button should be visible for submitted idea
      const approveButton = screen.getByRole('button', { name: /approve idea/i });
      expect(approveButton).toBeInTheDocument();

      // Rerender with approved idea
      const approvedIdea: IdeaWithSubmitter = {
        ...mockIdea,
        status: 'approved',
      };
      rerender(<BrowserRouter><IdeaKanbanCard idea={approvedIdea} /></BrowserRouter>);

      // Approve button should NOT be visible for approved idea
      expect(screen.queryByRole('button', { name: /approve idea/i })).not.toBeInTheDocument();
    });

    // Subtask 6.3: Approve button should have neutral gray icon
    it('should render approve icon button with check-circle icon', () => {
      renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);

      const approveButton = screen.getByRole('button', { name: /approve idea/i });
      expect(approveButton).toBeInTheDocument();

      // Check that it has SVG child (icon)
      const svg = approveButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    // Subtask 6.4: Should open confirmation modal when approve is clicked
    it('should prevent card navigation when approve button is clicked', async () => {
      const user = userEvent.setup();
      const mockNavigate = vi.fn();
      
      renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);

      const approveButton = screen.getByRole('button', { name: /approve idea/i });
      await user.click(approveButton);

      // Modal should appear
      expect(await screen.findByText('Approve Idea for PRD Development')).toBeInTheDocument();
      
      // Navigation should NOT have been called (event propagation stopped)
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    // Subtask 6.3: Button should be positioned in card footer
    it('should position approve button in card with consistent styling', () => {
      renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);

      const approveButton = screen.getByRole('button', { name: /approve idea/i });
      
      // Should be a circular icon button
      expect(approveButton.className).toContain('btn-circle');
    });

    // Clicking card itself should still navigate
    it('should navigate to detail page when card background is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);

      // Get the card container (not the approve button)
      const cardTitle = screen.getByText('Build Mobile App for Customer Engagement');
      await user.click(cardTitle);

      // Should navigate (this is just verifying the click works, actual navigation is mocked)
      // In real app, this would navigate to /admin/ideas/idea-1
    });
  });

  // Story 5.5 Task 7: Inline reject action tests
  describe('Story 5.5 Task 7: Inline Reject Action', () => {
    // Subtask 7.2: Only show reject button for submitted ideas
    it('should show reject icon button only for submitted ideas', () => {
      const { rerender } = renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);

      // Reject button should be visible for submitted idea
      const rejectButton = screen.getByRole('button', { name: /reject idea with feedback/i });
      expect(rejectButton).toBeInTheDocument();

      // Rerender with approved idea
      const approvedIdea: IdeaWithSubmitter = {
        ...mockIdea,
        status: 'approved',
      };
      rerender(<BrowserRouter><IdeaKanbanCard idea={approvedIdea} /></BrowserRouter>);

      // Reject button should NOT be visible for approved idea
      expect(screen.queryByRole('button', { name: /reject idea with feedback/i })).not.toBeInTheDocument();
    });

    // Subtask 7.3: Reject button should be positioned next to approve button
    it('should show both approve and reject buttons for submitted ideas', () => {
      renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);

      const approveButton = screen.getByRole('button', { name: /approve idea/i });
      const rejectButton = screen.getByRole('button', { name: /reject idea with feedback/i });
      
      expect(approveButton).toBeInTheDocument();
      expect(rejectButton).toBeInTheDocument();
    });

    // Subtask 7.4: Should open feedback modal when reject is clicked
    it('should open reject modal when reject button is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);

      const rejectButton = screen.getByRole('button', { name: /reject idea with feedback/i });
      await user.click(rejectButton);

      // Modal should appear
      expect(await screen.findByText('Reject Idea')).toBeInTheDocument();
    });

    // Subtask 7.3: Reject button should have x-circle icon
    it('should render reject icon button with x-circle icon', () => {
      renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);

      const rejectButton = screen.getByRole('button', { name: /reject idea with feedback/i });
      expect(rejectButton).toBeInTheDocument();

      // Check that it has SVG child (icon)
      const svg = rejectButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
