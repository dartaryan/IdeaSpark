import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IdeaDetailContent } from './IdeaDetailContent';
import type { Idea } from '../types';

describe('IdeaDetailContent', () => {
  const baseIdea: Idea = {
    id: 'idea-1',
    user_id: 'user-1',
    title: 'Test Idea',
    problem: 'This is the problem statement',
    solution: 'This is the proposed solution',
    impact: 'This is the expected impact',
    enhanced_problem: null,
    enhanced_solution: null,
    enhanced_impact: null,
    status: 'submitted',
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-01-20T12:00:00Z',
  };

  describe('basic content display', () => {
    it('displays problem statement', () => {
      render(<IdeaDetailContent idea={baseIdea} />);
      
      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('Problem Statement')).toBeInTheDocument();
      expect(screen.getByText('This is the problem statement')).toBeInTheDocument();
    });

    it('displays proposed solution', () => {
      render(<IdeaDetailContent idea={baseIdea} />);
      
      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.getByText('Proposed Solution')).toBeInTheDocument();
      expect(screen.getByText('This is the proposed solution')).toBeInTheDocument();
    });

    it('displays expected impact', () => {
      render(<IdeaDetailContent idea={baseIdea} />);
      
      expect(screen.getByText('3.')).toBeInTheDocument();
      expect(screen.getByText('Expected Impact')).toBeInTheDocument();
      expect(screen.getByText('This is the expected impact')).toBeInTheDocument();
    });

    it('displays all three sections in order', () => {
      render(<IdeaDetailContent idea={baseIdea} />);
      
      const sections = screen.getAllByRole('heading', { level: 2 });
      expect(sections).toHaveLength(3);
      expect(sections[0]).toHaveTextContent('Problem Statement');
      expect(sections[1]).toHaveTextContent('Proposed Solution');
      expect(sections[2]).toHaveTextContent('Expected Impact');
    });
  });

  describe('enhanced content display', () => {
    it('shows AI enhanced problem when available', () => {
      const ideaWithEnhancement: Idea = {
        ...baseIdea,
        enhanced_problem: 'Enhanced problem statement',
      };

      render(<IdeaDetailContent idea={ideaWithEnhancement} />);
      
      expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
      expect(screen.getByText('Enhanced problem statement')).toBeInTheDocument();
    });

    it('shows AI enhanced solution when available', () => {
      const ideaWithEnhancement: Idea = {
        ...baseIdea,
        enhanced_solution: 'Enhanced solution description',
      };

      render(<IdeaDetailContent idea={ideaWithEnhancement} />);
      
      expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
      expect(screen.getByText('Enhanced solution description')).toBeInTheDocument();
    });

    it('shows AI enhanced impact when available', () => {
      const ideaWithEnhancement: Idea = {
        ...baseIdea,
        enhanced_impact: 'Enhanced impact description',
      };

      render(<IdeaDetailContent idea={ideaWithEnhancement} />);
      
      expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
      expect(screen.getByText('Enhanced impact description')).toBeInTheDocument();
    });

    it('shows all three enhanced sections when all are available', () => {
      const ideaWithAllEnhancements: Idea = {
        ...baseIdea,
        enhanced_problem: 'Enhanced problem',
        enhanced_solution: 'Enhanced solution',
        enhanced_impact: 'Enhanced impact',
      };

      render(<IdeaDetailContent idea={ideaWithAllEnhancements} />);
      
      const badges = screen.getAllByText('AI Enhanced');
      expect(badges).toHaveLength(3);
      expect(screen.getByText('Enhanced problem')).toBeInTheDocument();
      expect(screen.getByText('Enhanced solution')).toBeInTheDocument();
      expect(screen.getByText('Enhanced impact')).toBeInTheDocument();
    });

    it('does not show AI enhanced badge when no enhanced content', () => {
      render(<IdeaDetailContent idea={baseIdea} />);
      
      expect(screen.queryByText('AI Enhanced')).not.toBeInTheDocument();
    });

    it('shows original and enhanced content together', () => {
      const ideaWithEnhancement: Idea = {
        ...baseIdea,
        enhanced_problem: 'Enhanced problem statement',
      };

      render(<IdeaDetailContent idea={ideaWithEnhancement} />);
      
      // Both original and enhanced should be visible
      expect(screen.getByText('This is the problem statement')).toBeInTheDocument();
      expect(screen.getByText('Enhanced problem statement')).toBeInTheDocument();
    });
  });

  describe('whitespace handling', () => {
    it('preserves whitespace in problem statement', () => {
      const ideaWithNewlines: Idea = {
        ...baseIdea,
        problem: 'Line 1\nLine 2\nLine 3',
      };

      const { container } = render(<IdeaDetailContent idea={ideaWithNewlines} />);
      
      const problemText = container.querySelector('.whitespace-pre-wrap');
      expect(problemText).toBeInTheDocument();
      expect(problemText?.textContent).toBe('Line 1\nLine 2\nLine 3');
    });
  });
});
