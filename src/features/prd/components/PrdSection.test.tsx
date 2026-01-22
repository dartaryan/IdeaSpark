import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrdSection } from './PrdSection';
import type { PrdSectionKey, PrdSection as PrdSectionType } from '../types';

describe('PrdSection', () => {
  const mockSection: PrdSectionType = {
    content: 'Test content for section',
    status: 'in_progress',
  };

  describe('Header Display', () => {
    it('should display section label from PRD_SECTION_LABELS', () => {
      render(
        <PrdSection
          sectionKey="problemStatement"
          section={mockSection}
          isHighlighted={false}
        />
      );
      expect(screen.getByText('Problem Statement')).toBeInTheDocument();
    });

    it('should display status badge', () => {
      render(
        <PrdSection
          sectionKey="problemStatement"
          section={mockSection}
          isHighlighted={false}
        />
      );
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('should display section content when present', () => {
      render(
        <PrdSection
          sectionKey="problemStatement"
          section={mockSection}
          isHighlighted={false}
        />
      );
      expect(screen.getByText('Test content for section')).toBeInTheDocument();
    });

    it('should display placeholder when section is undefined', () => {
      render(
        <PrdSection
          sectionKey="problemStatement"
          section={undefined}
          isHighlighted={false}
        />
      );
      expect(screen.getByText(/this section will be populated as you discuss/i)).toBeInTheDocument();
    });

    it('should display placeholder when content is empty', () => {
      render(
        <PrdSection
          sectionKey="problemStatement"
          section={{ content: '', status: 'empty' }}
          isHighlighted={false}
        />
      );
      expect(screen.getByText(/this section will be populated as you discuss/i)).toBeInTheDocument();
    });
  });

  describe('Highlight Animation', () => {
    it('should apply highlight styles when isHighlighted is true', () => {
      const { container } = render(
        <PrdSection
          sectionKey="problemStatement"
          section={mockSection}
          isHighlighted={true}
        />
      );
      const card = container.querySelector('.card');
      expect(card).toHaveClass('ring-2');
      expect(card).toHaveClass('ring-primary');
    });

    it('should not apply highlight styles when isHighlighted is false', () => {
      const { container } = render(
        <PrdSection
          sectionKey="problemStatement"
          section={mockSection}
          isHighlighted={false}
        />
      );
      const card = container.querySelector('.card');
      expect(card).not.toHaveClass('ring-2');
      expect(card).not.toHaveClass('ring-primary');
    });

    it('should have transition classes for smooth animation', () => {
      const { container } = render(
        <PrdSection
          sectionKey="problemStatement"
          section={mockSection}
          isHighlighted={false}
        />
      );
      const card = container.querySelector('.card');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-300');
    });
  });

  describe('Content Formatting', () => {
    it('should preserve newlines in content', () => {
      const multilineContent = {
        content: 'Line 1\nLine 2\nLine 3',
        status: 'in_progress' as const,
      };
      const { container } = render(
        <PrdSection
          sectionKey="problemStatement"
          section={multilineContent}
          isHighlighted={false}
        />
      );
      // Check that content is wrapped in prose div
      const proseDiv = container.querySelector('.prose');
      expect(proseDiv).toBeInTheDocument();
    });

    it('should apply prose styling to content', () => {
      const { container } = render(
        <PrdSection
          sectionKey="problemStatement"
          section={mockSection}
          isHighlighted={false}
        />
      );
      const proseDiv = container.querySelector('.prose');
      expect(proseDiv).toHaveClass('prose-sm');
      expect(proseDiv).toHaveClass('max-w-none');
    });
  });

  describe('Card Structure', () => {
    it('should render as a card component', () => {
      const { container } = render(
        <PrdSection
          sectionKey="problemStatement"
          section={mockSection}
          isHighlighted={false}
        />
      );
      expect(container.querySelector('.card')).toBeInTheDocument();
    });

    it('should have card-body with proper padding', () => {
      const { container } = render(
        <PrdSection
          sectionKey="problemStatement"
          section={mockSection}
          isHighlighted={false}
        />
      );
      const cardBody = container.querySelector('.card-body');
      expect(cardBody).toHaveClass('p-4');
    });
  });

  describe('Different Section Keys', () => {
    const sectionKeys: PrdSectionKey[] = [
      'problemStatement',
      'goalsAndMetrics',
      'userStories',
      'requirements',
      'technicalConsiderations',
      'risks',
      'timeline',
    ];

    sectionKeys.forEach((sectionKey) => {
      it(`should render ${sectionKey} section correctly`, () => {
        render(
          <PrdSection
            sectionKey={sectionKey}
            section={mockSection}
            isHighlighted={false}
          />
        );
        // Just verify it renders without error
        expect(screen.getByText('Test content for section')).toBeInTheDocument();
      });
    });
  });

  describe('Status Variations', () => {
    it('should render with empty status', () => {
      render(
        <PrdSection
          sectionKey="problemStatement"
          section={{ content: '', status: 'empty' }}
          isHighlighted={false}
        />
      );
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('should render with in_progress status', () => {
      render(
        <PrdSection
          sectionKey="problemStatement"
          section={{ content: 'Test', status: 'in_progress' }}
          isHighlighted={false}
        />
      );
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should render with complete status', () => {
      render(
        <PrdSection
          sectionKey="problemStatement"
          section={{ content: 'Test', status: 'complete' }}
          isHighlighted={false}
        />
      );
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });
});
