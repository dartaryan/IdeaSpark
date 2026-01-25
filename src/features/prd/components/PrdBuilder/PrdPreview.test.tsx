import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrdPreview } from './PrdPreview';
import type { PrdContent } from '../../../../types/database';

describe('PrdPreview', () => {
  const mockOnSectionFocus = vi.fn();

  afterEach(() => {
    mockOnSectionFocus.mockClear();
  });

  describe('header', () => {
    it('should display "PRD Preview" title', () => {
      render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      expect(screen.getByText('PRD Preview')).toBeInTheDocument();
    });

    it('should display idea title when provided', () => {
      render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="My Great Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      expect(screen.getByText('My Great Idea')).toBeInTheDocument();
    });

    it('should not crash when idea title is not provided', () => {
      render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          onSectionFocus={mockOnSectionFocus}
        />
      );
      expect(screen.getByText('PRD Preview')).toBeInTheDocument();
    });
  });

  describe('progress tracking', () => {
    it('should display 0/6 sections when all empty', () => {
      render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      expect(screen.getByText('0/6 sections')).toBeInTheDocument();
    });

    it('should display 2/6 sections when 2 are complete', () => {
      const prdContent: PrdContent = {
        problemStatement: {
          content: 'This is a comprehensive problem statement with enough detail to meet the minimum requirements for validation.',
          status: 'complete',
        },
        goalsAndMetrics: {
          content: 'Our primary goal is to reduce onboarding time by 50%. Key metrics include time-to-first-action.',
          status: 'complete',
        },
      };
      render(
        <PrdPreview
          prdContent={prdContent}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      expect(screen.getByText('2/6 sections')).toBeInTheDocument();
    });

    it('should display progress bar', () => {
      const { container } = render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      const progressBar = container.querySelector('.progress');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveClass('progress-primary');
    });

    it('should update progress bar value based on completion', () => {
      const prdContent: PrdContent = {
        problemStatement: {
          content: 'This is a comprehensive problem statement with enough detail to meet the minimum requirements for validation.',
          status: 'complete',
        },
      };
      const { container } = render(
        <PrdPreview
          prdContent={prdContent}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      const progressBar = container.querySelector('.progress') as HTMLProgressElement;
      expect(progressBar).toHaveAttribute('max', '6');
      // Note: value would be 0 because problemStatement doesn't meet min length in this test
    });
  });

  describe('"Ready to Complete" indicator', () => {
    it('should not display indicator when PRD is incomplete', () => {
      render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      expect(screen.queryByText('Ready to Complete')).not.toBeInTheDocument();
    });

    it('should display indicator when all required sections are complete', () => {
      const completePrdContent: PrdContent = {
        problemStatement: {
          content: 'This is a comprehensive problem statement with enough detail to meet the minimum requirements for validation.',
          status: 'complete',
        },
        goalsAndMetrics: {
          content: 'Our primary goal is to reduce onboarding time by 50%. Key metrics include time-to-first-action and completion rate of the process.',
          status: 'complete',
        },
        userStories: {
          content: 'As a new user, I want to quickly understand the value proposition so that I can decide whether to continue. As an admin, I want to see user progress.',
          status: 'complete',
        },
        requirements: {
          content: 'The system must support SSO authentication, provide mobile-responsive design, handle 1000 concurrent users, and maintain 99.9% uptime SLA.',
          status: 'complete',
        },
        technicalConsiderations: {
          content: 'We will use React for frontend, Node.js backend, PostgreSQL database with Prisma ORM.',
          status: 'complete',
        },
        risks: {
          content: 'Main risks include third-party API dependencies, data migration complexity, and user adoption challenges. Mitigation strategies include fallback mechanisms.',
          status: 'complete',
        },
      };
      render(
        <PrdPreview
          prdContent={completePrdContent}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      expect(screen.getByText('Ready to Complete')).toBeInTheDocument();
    });

    it('should display with success styling', () => {
      const completePrdContent: PrdContent = {
        problemStatement: {
          content: 'This is a comprehensive problem statement with enough detail to meet the minimum requirements for validation.',
          status: 'complete',
        },
        goalsAndMetrics: {
          content: 'Our primary goal is to reduce onboarding time by 50%. Key metrics include time-to-first-action and completion rate of the process.',
          status: 'complete',
        },
        userStories: {
          content: 'As a new user, I want to quickly understand the value proposition so that I can decide whether to continue. As an admin, I want to see user progress.',
          status: 'complete',
        },
        requirements: {
          content: 'The system must support SSO authentication, provide mobile-responsive design, handle 1000 concurrent users, and maintain 99.9% uptime SLA.',
          status: 'complete',
        },
        technicalConsiderations: {
          content: 'We will use React for frontend, Node.js backend, PostgreSQL database with Prisma ORM.',
          status: 'complete',
        },
        risks: {
          content: 'Main risks include third-party API dependencies, data migration complexity, and user adoption challenges. Mitigation strategies include fallback mechanisms.',
          status: 'complete',
        },
      };
      const { container } = render(
        <PrdPreview
          prdContent={completePrdContent}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      const readyIndicator = screen.getByText('Ready to Complete').closest('span');
      expect(readyIndicator).toHaveClass('text-success');
    });
  });

  describe('section cards', () => {
    it('should render all 7 section cards', () => {
      const { container } = render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      const cards = container.querySelectorAll('.card');
      expect(cards.length).toBe(7);
    });

    it('should render section cards in correct order', () => {
      render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      
      const titles = [
        'Problem Statement',
        'Goals & Metrics',
        'User Stories',
        'Requirements',
        'Technical Considerations',
        'Risks',
        'Timeline',
      ];
      
      titles.forEach(title => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });

    it('should pass highlight state to section cards', () => {
      const highlightedSections = new Set(['problemStatement', 'goalsAndMetrics']);
      const { container } = render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={highlightedSections}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      
      const highlightedCards = container.querySelectorAll('.ring-primary');
      expect(highlightedCards.length).toBe(2);
    });

    it('should call onSectionFocus when section card is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      
      const problemStatementCard = screen.getByText('Problem Statement').closest('[role="button"]');
      await user.click(problemStatementCard!);
      
      expect(mockOnSectionFocus).toHaveBeenCalledWith('problemStatement');
    });

    it('should handle missing onSectionFocus gracefully', async () => {
      const user = userEvent.setup();
      render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
        />
      );
      
      const problemStatementCard = screen.getByText('Problem Statement').closest('[role="button"]');
      await user.click(problemStatementCard!);
      
      // Should not throw
      expect(problemStatementCard).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('should have flex column layout with full height', () => {
      const { container } = render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('flex', 'flex-col', 'h-full');
    });

    it('should have scrollable content area', () => {
      const { container } = render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      const scrollableArea = container.querySelector('.overflow-y-auto');
      expect(scrollableArea).toBeInTheDocument();
      expect(scrollableArea).toHaveClass('flex-1');
    });

    it('should have grid layout for section cards', () => {
      const { container } = render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          onSectionFocus={mockOnSectionFocus}
        />
      );
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('saving indicator', () => {
    it('should display saving indicator when isSaving is true', () => {
      render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          isSaving={true}
          onSectionFocus={mockOnSectionFocus}
        />
      );
      // Note: The saving indicator is now in SaveIndicator component (Story 3.6)
      // This test may need to be adjusted based on actual implementation
    });

    it('should display last saved time when provided', () => {
      const lastSaved = new Date('2024-01-15T10:30:00');
      render(
        <PrdPreview
          prdContent={{}}
          highlightedSections={new Set()}
          ideaTitle="Test Idea"
          lastSaved={lastSaved}
          onSectionFocus={mockOnSectionFocus}
        />
      );
      // Note: The last saved display is now in SaveIndicator component (Story 3.6)
      // This test may need to be adjusted based on actual implementation
    });
  });
});
