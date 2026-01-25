import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionStatusBadge } from './SectionStatusBadge';
import type { PrdSectionStatus } from '../../../types/database';

describe('SectionStatusBadge', () => {
  describe('empty status', () => {
    it('should render "Not Started" badge for empty status', () => {
      render(<SectionStatusBadge status="empty" />);
      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });

    it('should apply ghost badge styling for empty status', () => {
      const { container } = render(<SectionStatusBadge status="empty" />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('badge-ghost');
    });

    it('should render DocumentIcon for empty status', () => {
      const { container } = render(<SectionStatusBadge status="empty" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('in_progress status', () => {
    it('should render "In Progress" badge for in_progress status', () => {
      render(<SectionStatusBadge status="in_progress" />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should apply warning badge styling for in_progress status', () => {
      const { container } = render(<SectionStatusBadge status="in_progress" />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('badge-warning');
    });

    it('should render PencilSquareIcon for in_progress status', () => {
      const { container } = render(<SectionStatusBadge status="in_progress" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('complete status', () => {
    it('should render "Complete" badge for complete status', () => {
      render(<SectionStatusBadge status="complete" />);
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('should apply success badge styling for complete status', () => {
      const { container } = render(<SectionStatusBadge status="complete" />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('badge-success');
    });

    it('should render CheckCircleIcon for complete status', () => {
      const { container } = render(<SectionStatusBadge status="complete" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('should apply sm size class by default', () => {
      const { container } = render(<SectionStatusBadge status="complete" />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('badge-sm');
    });

    it('should apply sm size class when explicitly set', () => {
      const { container } = render(<SectionStatusBadge status="complete" size="sm" />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('badge-sm');
    });

    it('should not apply size class for md size', () => {
      const { container } = render(<SectionStatusBadge status="complete" size="md" />);
      const badge = container.querySelector('.badge');
      expect(badge).not.toHaveClass('badge-sm');
    });

    it('should render smaller icon for sm size', () => {
      const { container } = render(<SectionStatusBadge status="complete" size="sm" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-3', 'h-3');
    });

    it('should render larger icon for md size', () => {
      const { container } = render(<SectionStatusBadge status="complete" size="md" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4');
    });
  });

  describe('accessibility', () => {
    it('should have gap between icon and text', () => {
      const { container } = render(<SectionStatusBadge status="complete" />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('gap-1');
    });

    it('should render as a span element', () => {
      const { container } = render(<SectionStatusBadge status="complete" />);
      const badge = container.querySelector('span.badge');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('all statuses rendering', () => {
    const statuses: PrdSectionStatus[] = ['empty', 'in_progress', 'complete'];
    
    it.each(statuses)('should render %s status without errors', (status) => {
      const { container } = render(<SectionStatusBadge status={status} />);
      const badge = container.querySelector('.badge');
      expect(badge).toBeInTheDocument();
    });
  });
});
