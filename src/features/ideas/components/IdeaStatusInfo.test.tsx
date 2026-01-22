import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IdeaStatusInfo } from './IdeaStatusInfo';
import type { Idea } from '../types';

describe('IdeaStatusInfo', () => {
  const baseIdea: Idea = {
    id: 'idea-1',
    user_id: 'user-1',
    title: 'Test Idea',
    problem: 'Problem',
    solution: 'Solution',
    impact: 'Impact',
    enhanced_problem: null,
    enhanced_solution: null,
    enhanced_impact: null,
    status: 'submitted',
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-01-20T12:00:00Z',
  };

  describe('status badge display', () => {
    it('displays status heading', () => {
      render(<IdeaStatusInfo idea={baseIdea} />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('displays status badge', () => {
      render(<IdeaStatusInfo idea={baseIdea} />);
      expect(screen.getByTestId('idea-status-badge')).toBeInTheDocument();
    });
  });

  describe('next step messages (AC 5)', () => {
    it('shows correct message for submitted status', () => {
      const idea: Idea = { ...baseIdea, status: 'submitted' };
      render(<IdeaStatusInfo idea={idea} />);
      
      expect(screen.getByText('Your idea is waiting for review by the innovation team.')).toBeInTheDocument();
    });

    it('shows correct message for approved status', () => {
      const idea: Idea = { ...baseIdea, status: 'approved' };
      render(<IdeaStatusInfo idea={idea} />);
      
      expect(screen.getByText('Congratulations! Your idea is approved. Start building your PRD.')).toBeInTheDocument();
    });

    it('shows correct message for prd_development status', () => {
      const idea: Idea = { ...baseIdea, status: 'prd_development' };
      render(<IdeaStatusInfo idea={idea} />);
      
      expect(screen.getByText('Your PRD is being developed.')).toBeInTheDocument();
    });

    it('shows correct message for prototype_complete status', () => {
      const idea: Idea = { ...baseIdea, status: 'prototype_complete' };
      render(<IdeaStatusInfo idea={idea} />);
      
      expect(screen.getByText('Your prototype is complete.')).toBeInTheDocument();
    });

    it('shows correct message for rejected status', () => {
      const idea: Idea = { ...baseIdea, status: 'rejected' };
      render(<IdeaStatusInfo idea={idea} />);
      
      expect(screen.getByText('This idea was not approved. Check any feedback for details.')).toBeInTheDocument();
    });
  });

  describe('timestamp display (AC 4)', () => {
    it('displays submission date', () => {
      render(<IdeaStatusInfo idea={baseIdea} />);
      
      // Use getAllByText since "Submitted" appears in the badge too
      const submittedLabels = screen.getAllByText('Submitted');
      expect(submittedLabels.length).toBeGreaterThan(0);
      expect(screen.getByText(/January 20, 2026/)).toBeInTheDocument();
    });

    it('formats date correctly', () => {
      const idea: Idea = {
        ...baseIdea,
        created_at: '2026-03-15T14:30:00Z',
      };
      
      render(<IdeaStatusInfo idea={idea} />);
      
      expect(screen.getByText(/March 15, 2026/)).toBeInTheDocument();
    });

    it('shows last updated date when different from created date', () => {
      const idea: Idea = {
        ...baseIdea,
        created_at: '2026-01-20T12:00:00Z',
        updated_at: '2026-01-21T14:00:00Z',
      };
      
      render(<IdeaStatusInfo idea={idea} />);
      
      expect(screen.getByText('Last Updated')).toBeInTheDocument();
      expect(screen.getByText(/January 21, 2026/)).toBeInTheDocument();
    });

    it('does not show last updated when same as created date', () => {
      render(<IdeaStatusInfo idea={baseIdea} />);
      
      expect(screen.queryByText('Last Updated')).not.toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('renders as a card', () => {
      const { container } = render(<IdeaStatusInfo idea={baseIdea} />);
      
      const card = container.querySelector('.card');
      expect(card).toBeInTheDocument();
    });

    it('includes divider between message and timestamps', () => {
      const { container } = render(<IdeaStatusInfo idea={baseIdea} />);
      
      const divider = container.querySelector('.divider');
      expect(divider).toBeInTheDocument();
    });
  });
});
