import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrdPreview } from './PrdPreview';
import type { PrdContent } from '../../types';

describe('PrdPreview', () => {
  const mockPrdContent: PrdContent = {
    problemStatement: { content: 'Test problem', status: 'complete' },
    goalsAndMetrics: { content: 'Test goals', status: 'in_progress' },
    userStories: { content: '', status: 'empty' },
    requirements: { content: '', status: 'empty' },
    technicalConsiderations: { content: '', status: 'empty' },
    risks: { content: '', status: 'empty' },
    timeline: { content: '', status: 'empty' },
  };

  describe('Header Display', () => {
    it('should display "PRD Preview" heading', () => {
      render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
        />
      );
      expect(screen.getByText('PRD Preview')).toBeInTheDocument();
    });

    it('should display idea title when provided', () => {
      render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
          ideaTitle="Test Idea Title"
        />
      );
      expect(screen.getByText('Test Idea Title')).toBeInTheDocument();
    });

    it('should not display idea title when not provided', () => {
      render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
        />
      );
      expect(screen.queryByText('Test Idea')).not.toBeInTheDocument();
    });
  });

  describe('Save Status Display', () => {
    it('should display "Saving..." when isSaving is true', () => {
      render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
          isSaving={true}
        />
      );
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should display last saved time when provided and not saving', () => {
      const lastSaved = new Date('2024-01-15T10:30:00');
      render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
          isSaving={false}
          lastSaved={lastSaved}
        />
      );
      expect(screen.getByText(/Saved/)).toBeInTheDocument();
    });

    it('should not display save status when not saving and no lastSaved', () => {
      render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
          isSaving={false}
        />
      );
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      expect(screen.queryByText(/Saved/)).not.toBeInTheDocument();
    });
  });

  describe('Section Rendering', () => {
    it('should render all 7 PRD sections', () => {
      render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
        />
      );
      
      expect(screen.getByText('Problem Statement')).toBeInTheDocument();
      expect(screen.getByText('Goals & Metrics')).toBeInTheDocument();
      expect(screen.getByText('User Stories')).toBeInTheDocument();
      expect(screen.getByText('Requirements')).toBeInTheDocument();
      expect(screen.getByText('Technical Considerations')).toBeInTheDocument();
      expect(screen.getByText('Risks')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
    });

    it('should render sections in correct order', () => {
      const { container } = render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
        />
      );
      
      const sectionHeaders = container.querySelectorAll('.card-title');
      const sectionTitles = Array.from(sectionHeaders).map(h => h.textContent);
      
      expect(sectionTitles).toEqual([
        'Problem Statement',
        'Goals & Metrics',
        'User Stories',
        'Requirements',
        'Technical Considerations',
        'Risks',
        'Timeline',
      ]);
    });
  });

  describe('Highlight Handling', () => {
    it('should pass highlighted status to sections', () => {
      const highlightedSections = new Set(['problemStatement', 'goalsAndMetrics']);
      const { container } = render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={highlightedSections}
        />
      );
      
      // Check that at least one section has highlight styles
      const highlightedCards = container.querySelectorAll('.ring-primary');
      expect(highlightedCards.length).toBeGreaterThan(0);
    });

    it('should handle empty highlighted sections set', () => {
      render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
        />
      );
      
      // Should render without error
      expect(screen.getByText('PRD Preview')).toBeInTheDocument();
    });
  });

  describe('Scrollable Container', () => {
    it('should have scrollable content area', () => {
      const { container } = render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
        />
      );
      
      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should have flex-1 to fill available space', () => {
      const { container } = render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
        />
      );
      
      const scrollContainer = container.querySelector('.flex-1');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have flex column layout', () => {
      const { container } = render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
        />
      );
      
      const mainContainer = container.querySelector('.flex');
      expect(mainContainer).toHaveClass('flex-col');
      expect(mainContainer).toHaveClass('h-full');
    });

    it('should have border at top of header', () => {
      const { container } = render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
        />
      );
      
      const header = container.querySelector('.border-b');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Empty Content Handling', () => {
    it('should render sections with empty content', () => {
      const emptyContent: PrdContent = {};
      
      render(
        <PrdPreview
          prdContent={emptyContent}
          highlightedSections={new Set()}
        />
      );
      
      // All sections should still be rendered
      expect(screen.getByText('Problem Statement')).toBeInTheDocument();
      expect(screen.getByText('Goals & Metrics')).toBeInTheDocument();
    });

    it('should show placeholder for empty sections', () => {
      const emptyContent: PrdContent = {};
      
      render(
        <PrdPreview
          prdContent={emptyContent}
          highlightedSections={new Set()}
        />
      );
      
      // Should have placeholder text
      const placeholders = screen.getAllByText(/this section will be populated as you discuss/i);
      expect(placeholders.length).toBeGreaterThan(0);
    });
  });

  describe('Section Spacing', () => {
    it('should have space between sections', () => {
      const { container } = render(
        <PrdPreview
          prdContent={mockPrdContent}
          highlightedSections={new Set()}
        />
      );
      
      const sectionsContainer = container.querySelector('.space-y-4');
      expect(sectionsContainer).toBeInTheDocument();
    });
  });
});
