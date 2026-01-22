import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SectionStatusBadge } from './SectionStatusBadge';
import type { PrdSectionStatus } from '../types';

describe('SectionStatusBadge', () => {
  describe('Status Display', () => {
    it('should display "Empty" for empty status', () => {
      render(<SectionStatusBadge status="empty" />);
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('should display "In Progress" for in_progress status', () => {
      render(<SectionStatusBadge status="in_progress" />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should display "Complete" for complete status', () => {
      render(<SectionStatusBadge status="complete" />);
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });

  describe('Badge Styling', () => {
    it('should apply badge-ghost class for empty status', () => {
      const { container } = render(<SectionStatusBadge status="empty" />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('badge-ghost');
    });

    it('should apply badge-warning class for in_progress status', () => {
      const { container } = render(<SectionStatusBadge status="in_progress" />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('badge-warning');
    });

    it('should apply badge-success class for complete status', () => {
      const { container } = render(<SectionStatusBadge status="complete" />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('badge-success');
    });

    it('should always include badge and badge-sm classes', () => {
      const { container } = render(<SectionStatusBadge status="empty" />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('badge');
      expect(badge).toHaveClass('badge-sm');
    });
  });

  describe('Default Handling', () => {
    it('should handle unknown status by defaulting to empty', () => {
      const { container } = render(<SectionStatusBadge status={'unknown' as PrdSectionStatus} />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass('badge-ghost');
    });
  });
});
