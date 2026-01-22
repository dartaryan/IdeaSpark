import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IdeaStatusBadge } from './IdeaStatusBadge';
import type { IdeaStatus } from '../types';

describe('IdeaStatusBadge', () => {
  describe('rendering', () => {
    it('renders the badge', () => {
      render(<IdeaStatusBadge status="submitted" />);

      expect(screen.getByTestId('idea-status-badge')).toBeInTheDocument();
    });

    it('has badge class', () => {
      render(<IdeaStatusBadge status="submitted" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge');
    });
  });

  describe('status labels', () => {
    it('displays "Submitted" for submitted status', () => {
      render(<IdeaStatusBadge status="submitted" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveTextContent('Submitted');
    });

    it('displays "Approved" for approved status', () => {
      render(<IdeaStatusBadge status="approved" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveTextContent('Approved');
    });

    it('displays "PRD Development" for prd_development status', () => {
      render(<IdeaStatusBadge status="prd_development" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveTextContent('PRD Development');
    });

    it('displays "Prototype Complete" for prototype_complete status', () => {
      render(<IdeaStatusBadge status="prototype_complete" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveTextContent('Prototype Complete');
    });

    it('displays "Rejected" for rejected status', () => {
      render(<IdeaStatusBadge status="rejected" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveTextContent('Rejected');
    });
  });

  describe('status colors (AC: 3)', () => {
    it('uses badge-neutral (gray) for submitted status', () => {
      render(<IdeaStatusBadge status="submitted" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-neutral');
    });

    it('uses badge-info (blue) for approved status', () => {
      render(<IdeaStatusBadge status="approved" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-info');
    });

    it('uses badge-warning (yellow) for prd_development status', () => {
      render(<IdeaStatusBadge status="prd_development" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-warning');
    });

    it('uses badge-success (green) for prototype_complete status', () => {
      render(<IdeaStatusBadge status="prototype_complete" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-success');
    });

    it('uses badge-error (red) for rejected status', () => {
      render(<IdeaStatusBadge status="rejected" />);

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-error');
    });
  });

  describe('fallback handling', () => {
    it('handles unknown status gracefully with badge-ghost', () => {
      // Force an unknown status for edge case testing
      render(<IdeaStatusBadge status={'unknown_status' as IdeaStatus} />);

      expect(screen.getByTestId('idea-status-badge')).toHaveClass('badge-ghost');
      expect(screen.getByTestId('idea-status-badge')).toHaveTextContent('unknown_status');
    });
  });
});
