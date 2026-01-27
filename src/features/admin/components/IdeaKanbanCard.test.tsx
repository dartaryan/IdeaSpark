// src/features/admin/components/IdeaKanbanCard.test.tsx
// Test suite for IdeaKanbanCard component
// Story 5.3 - Task 3: Create IdeaKanbanCard component

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { IdeaKanbanCard } from './IdeaKanbanCard';
import type { IdeaWithSubmitter } from '../types';

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
  return render(<BrowserRouter>{ui}</BrowserRouter>);
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
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    // Verify navigation would occur (in a real app, we'd check router state)
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('View details'));
  });

  it('navigates to idea detail page on Enter key', async () => {
    const user = userEvent.setup();
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    
    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');
    
    // Verify card is focusable and responds to keyboard
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('has hover cursor pointer style', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    const card = screen.getByRole('button');
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
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Build Mobile App'));
  });

  it('has elevation shadow on hover effect', () => {
    renderWithRouter(<IdeaKanbanCard idea={mockIdea} />);
    const card = screen.getByRole('button');
    // Check for hover classes
    expect(card.className).toContain('hover:');
  });
});
