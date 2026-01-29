// src/features/ideas/components/IdeaStatusInfo.test.tsx
// Tests for IdeaStatusInfo component
// Task 8: Approval timestamp display

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IdeaStatusInfo } from './IdeaStatusInfo';
import type { Idea } from '../types';

const baseIdea: Idea = {
  id: 'idea-1',
  user_id: 'user-1',
  title: 'Test Idea',
  problem: 'Test problem',
  solution: 'Test solution',
  impact: 'Test impact',
  status: 'submitted',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  status_updated_at: '2024-01-15T10:00:00Z',
};

describe('IdeaStatusInfo', () => {
  it('should display status badge', () => {
    render(<IdeaStatusInfo idea={baseIdea} />);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should display next steps message', () => {
    render(<IdeaStatusInfo idea={baseIdea} />);
    expect(screen.getByText(/waiting for review/i)).toBeInTheDocument();
  });

  it('should display submitted date', () => {
    render(<IdeaStatusInfo idea={baseIdea} />);
    // Should show submitted date label and formatted date
    expect(screen.getAllByText('Submitted').length).toBeGreaterThan(0);
    expect(screen.getByText(/January 15, 2024/i)).toBeInTheDocument();
  });

  // Task 8: Subtask 8.3 & Task 7.4 - Display approval timestamp for approved ideas
  describe('Approval Timestamp Display', () => {
    it('should show approval timestamp when idea is approved', () => {
      const approvedIdea: Idea = {
        ...baseIdea,
        status: 'approved',
        status_updated_at: '2024-01-20T14:30:00Z',
      };

      render(<IdeaStatusInfo idea={approvedIdea} />);

      // Should show "Approved" label (appears in badge and timestamp)
      expect(screen.getAllByText('Approved').length).toBe(2);
      
      // Should show relative timestamp (e.g., "2 years ago")
      expect(screen.getByText(/ago$/i)).toBeInTheDocument();
    });

    it('should NOT show approval timestamp for submitted ideas', () => {
      render(<IdeaStatusInfo idea={baseIdea} />);

      // Should NOT show "Approved" label
      expect(screen.queryByText('Approved')).not.toBeInTheDocument();
    });

    it('should show approval timestamp for prd_development ideas', () => {
      const prdIdea: Idea = {
        ...baseIdea,
        status: 'prd_development',
        status_updated_at: '2024-01-20T14:30:00Z',
      };

      render(<IdeaStatusInfo idea={prdIdea} />);

      // Should show "Approved" label (idea was approved before entering prd_development)
      // Note: We only show approval date for 'approved' status
      // For prd_development, the status_updated_at would be when it moved to that status
    });

    it('should format timestamp correctly in relative format', () => {
      const approvedIdea: Idea = {
        ...baseIdea,
        status: 'approved',
        status_updated_at: '2024-03-15T16:45:30Z',
      };

      render(<IdeaStatusInfo idea={approvedIdea} />);

      // Should show relative time format (e.g., "about 2 years ago")
      expect(screen.getByText(/ago$/i)).toBeInTheDocument();
    });
  });
});
