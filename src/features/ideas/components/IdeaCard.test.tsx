import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { IdeaCard } from './IdeaCard';
import type { Idea } from '../types';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('IdeaCard', () => {
  const mockIdea: Idea = {
    id: 'test-idea-id',
    user_id: 'test-user-id',
    title: 'Test Idea Title',
    problem: 'This is a test problem statement',
    solution: 'This is a test solution',
    impact: 'This is the test impact',
    enhanced_problem: null,
    enhanced_solution: null,
    enhanced_impact: null,
    status: 'submitted',
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-01-20T12:00:00Z',
  };

  const renderCard = (idea: Idea = mockIdea) => {
    return render(
      <BrowserRouter>
        <IdeaCard idea={idea} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the idea card', () => {
      renderCard();

      expect(screen.getByTestId('idea-card')).toBeInTheDocument();
    });

    it('displays the idea title', () => {
      renderCard();

      expect(screen.getByTestId('idea-card-title')).toHaveTextContent('Test Idea Title');
    });

    it('displays truncated problem if title is empty', () => {
      const ideaWithoutTitle = { ...mockIdea, title: '' };
      renderCard(ideaWithoutTitle);

      expect(screen.getByTestId('idea-card-title')).toHaveTextContent(mockIdea.problem);
    });

    it('displays the status badge', () => {
      renderCard();

      expect(screen.getByTestId('idea-status-badge')).toBeInTheDocument();
      expect(screen.getByTestId('idea-status-badge')).toHaveTextContent('Submitted');
    });

    it('displays the submission date', () => {
      renderCard();

      expect(screen.getByTestId('idea-card-date')).toHaveTextContent('Submitted on Jan 20, 2026');
    });

    it('formats date correctly for different dates', () => {
      const ideaWithDifferentDate = { ...mockIdea, created_at: '2025-12-25T08:30:00Z' };
      renderCard(ideaWithDifferentDate);

      expect(screen.getByTestId('idea-card-date')).toHaveTextContent('Submitted on Dec 25, 2025');
    });
  });

  describe('status badge colors', () => {
    it('shows correct badge for submitted status', () => {
      renderCard({ ...mockIdea, status: 'submitted' });

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-neutral');
    });

    it('shows correct badge for approved status', () => {
      renderCard({ ...mockIdea, status: 'approved' });

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-info');
    });

    it('shows correct badge for prd_development status', () => {
      renderCard({ ...mockIdea, status: 'prd_development' });

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-warning');
    });

    it('shows correct badge for prototype_complete status', () => {
      renderCard({ ...mockIdea, status: 'prototype_complete' });

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-success');
    });

    it('shows correct badge for rejected status', () => {
      renderCard({ ...mockIdea, status: 'rejected' });

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-error');
    });
  });

  describe('title truncation', () => {
    it('displays full title when under 50 characters', () => {
      const shortTitle = 'Short title';
      renderCard({ ...mockIdea, title: shortTitle });

      expect(screen.getByTestId('idea-card-title')).toHaveTextContent(shortTitle);
    });

    it('truncates problem statement when title is empty and problem exceeds 50 chars', () => {
      const longProblem =
        'This is a very long problem statement that definitely exceeds fifty characters and should be truncated';
      const ideaWithLongProblem = { ...mockIdea, title: '', problem: longProblem };
      renderCard(ideaWithLongProblem);

      const displayedText = screen.getByTestId('idea-card-title').textContent;
      expect(displayedText?.length).toBeLessThan(longProblem.length);
      expect(displayedText).toContain('...');
    });
  });

  describe('navigation', () => {
    it('navigates to idea detail page on click', async () => {
      const user = userEvent.setup();
      renderCard();

      const card = screen.getByTestId('idea-card');
      await user.click(card);

      expect(mockNavigate).toHaveBeenCalledWith('/ideas/test-idea-id');
    });

    it('navigates on Enter key press', async () => {
      const user = userEvent.setup();
      renderCard();

      const card = screen.getByTestId('idea-card');
      card.focus();
      await user.keyboard('{Enter}');

      expect(mockNavigate).toHaveBeenCalledWith('/ideas/test-idea-id');
    });

    it('navigates on Space key press', async () => {
      const user = userEvent.setup();
      renderCard();

      const card = screen.getByTestId('idea-card');
      card.focus();
      await user.keyboard(' ');

      expect(mockNavigate).toHaveBeenCalledWith('/ideas/test-idea-id');
    });
  });

  describe('accessibility', () => {
    it('has role="button"', () => {
      renderCard();

      const card = screen.getByTestId('idea-card');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('is focusable via tabIndex', () => {
      renderCard();

      const card = screen.getByTestId('idea-card');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('has aria-label with idea title', () => {
      renderCard();

      const card = screen.getByTestId('idea-card');
      expect(card).toHaveAttribute('aria-label', 'View idea: Test Idea Title');
    });

    it('has cursor-pointer class for visual click affordance', () => {
      renderCard();

      const card = screen.getByTestId('idea-card');
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  describe('styling', () => {
    it('has hover shadow effect class', () => {
      renderCard();

      const card = screen.getByTestId('idea-card');
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('has transition class for smooth effect', () => {
      renderCard();

      const card = screen.getByTestId('idea-card');
      expect(card).toHaveClass('transition-shadow');
    });
  });
});
