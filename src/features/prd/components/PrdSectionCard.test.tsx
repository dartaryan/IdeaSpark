import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrdSectionCard } from './PrdSectionCard';
import type { PrdSection } from '../../../types/database';

describe('PrdSectionCard', () => {
  const mockOnClick = vi.fn();

  afterEach(() => {
    mockOnClick.mockClear();
  });

  describe('section header', () => {
    it('should display section title', () => {
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText('Problem Statement')).toBeInTheDocument();
    });

    it('should display status badge', () => {
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });

    it('should display complete status for complete section', () => {
      const section: PrdSection = {
        content: 'This is the problem statement content.',
        status: 'complete',
      };
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={section}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });

  describe('section content', () => {
    it('should display placeholder when section is empty', () => {
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText(/What specific problem does your idea address/)).toBeInTheDocument();
    });

    it('should display content when section has content', () => {
      const section: PrdSection = {
        content: 'This is the problem statement content that describes the issue we are solving.',
        status: 'in_progress',
      };
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={section}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText(/This is the problem statement content/)).toBeInTheDocument();
    });

    it('should not display placeholder when section has content', () => {
      const section: PrdSection = {
        content: 'This is the problem statement content.',
        status: 'in_progress',
      };
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={section}
          onClick={mockOnClick}
        />
      );
      expect(screen.queryByText(/What specific problem does your idea address/)).not.toBeInTheDocument();
    });

    it('should truncate long content with line-clamp-3', () => {
      const section: PrdSection = {
        content: 'This is a very long content that should be truncated after three lines.',
        status: 'in_progress',
      };
      const { container } = render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={section}
          onClick={mockOnClick}
        />
      );
      const contentDiv = container.querySelector('.line-clamp-3');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when other keys are pressed', async () => {
      const user = userEvent.setup();
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Space}');
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should not crash when onClick is not provided', async () => {
      const user = userEvent.setup();
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
        />
      );
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      // Should not throw
      expect(card).toBeInTheDocument();
    });

    it('should display click hint text', () => {
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText('Click to focus AI on this section')).toBeInTheDocument();
    });
  });

  describe('highlighted state', () => {
    it('should not apply highlight styling by default', () => {
      const { container } = render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      const card = container.querySelector('.card');
      expect(card).not.toHaveClass('ring-2');
      expect(card).not.toHaveClass('ring-primary');
      expect(card).toHaveClass('border-base-300');
    });

    it('should apply highlight styling when isHighlighted is true', () => {
      const { container } = render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          isHighlighted={true}
          onClick={mockOnClick}
        />
      );
      const card = container.querySelector('.card');
      expect(card).toHaveClass('ring-2');
      expect(card).toHaveClass('ring-primary');
      expect(card).toHaveClass('border-primary');
    });

    it('should apply pulse animation when highlighted', () => {
      const { container } = render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          isHighlighted={true}
          onClick={mockOnClick}
        />
      );
      const card = container.querySelector('.card');
      expect(card).toHaveClass('animate-pulse-subtle');
    });
  });

  describe('styling', () => {
    it('should have card styling', () => {
      const { container } = render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      const card = container.querySelector('.card');
      expect(card).toHaveClass('bg-base-100');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should have hover effect', () => {
      const { container } = render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      const card = container.querySelector('.card');
      expect(card).toHaveClass('hover:shadow-md');
      expect(card).toHaveClass('transition-all');
    });

    it('should be keyboard accessible', () => {
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={undefined}
          onClick={mockOnClick}
        />
      );
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('all section types', () => {
    const sectionKeys = [
      'problemStatement',
      'goalsAndMetrics',
      'userStories',
      'requirements',
      'technicalConsiderations',
      'risks',
      'timeline',
    ] as const;

    it.each(sectionKeys)('should render %s section without errors', (key) => {
      const { container } = render(
        <PrdSectionCard
          sectionKey={key}
          section={undefined}
          onClick={mockOnClick}
        />
      );
      expect(container.querySelector('.card')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle invalid section key gracefully', () => {
      const { container } = render(
        <PrdSectionCard
          sectionKey={'invalid' as any}
          section={undefined}
          onClick={mockOnClick}
        />
      );
      // Should return null for invalid key
      expect(container.firstChild).toBeNull();
    });

    it('should display placeholder for section with whitespace-only content', () => {
      const section: PrdSection = {
        content: '   \n  ',
        status: 'empty',
      };
      render(
        <PrdSectionCard
          sectionKey="problemStatement"
          section={section}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText(/What specific problem does your idea address/)).toBeInTheDocument();
    });
  });
});
