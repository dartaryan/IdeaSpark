// src/features/admin/components/IdeaListItem.test.tsx
// Test suite for IdeaListItem component

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IdeaListItem } from './IdeaListItem';
import { BrowserRouter } from 'react-router-dom';

// Test wrapper with router
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

const mockIdea = {
  id: 'idea-123',
  user_id: 'user-456',
  title: 'Innovative Solution for Customer Feedback Collection and Analysis System',
  problem: 'Current feedback system is inefficient',
  solution: 'AI-powered feedback analysis',
  impact: 'Reduce processing time by 50%',
  status: 'submitted' as const,
  created_at: '2026-01-20T10:00:00Z',
  updated_at: '2026-01-20T10:00:00Z',
  submitter_name: 'John Doe',
  submitter_email: 'john@example.com',
};

describe('IdeaListItem', () => {
  it('displays idea title truncated to 80 chars', () => {
    render(
      <TestWrapper>
        <IdeaListItem idea={mockIdea} onApprove={vi.fn()} onReject={vi.fn()} />
      </TestWrapper>
    );

    const displayedTitle = screen.getByText(/Innovative Solution for Customer Feedback/);
    expect(displayedTitle).toBeInTheDocument();
    expect(displayedTitle.textContent?.length).toBeLessThanOrEqual(83); // 80 + "..."
  });

  it('displays submitter name', () => {
    render(
      <TestWrapper>
        <IdeaListItem idea={mockIdea} onApprove={vi.fn()} onReject={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays status badge with correct color for submitted status', () => {
    render(
      <TestWrapper>
        <IdeaListItem idea={mockIdea} onApprove={vi.fn()} onReject={vi.fn()} />
      </TestWrapper>
    );

    const badge = screen.getByText('Submitted');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge');
  });

  it('displays relative time for submission date', () => {
    render(
      <TestWrapper>
        <IdeaListItem idea={mockIdea} onApprove={vi.fn()} onReject={vi.fn()} />
      </TestWrapper>
    );

    // Should show relative time like "6 days ago"
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });

  it('displays "View Details" link with correct path', () => {
    render(
      <TestWrapper>
        <IdeaListItem idea={mockIdea} onApprove={vi.fn()} onReject={vi.fn()} />
      </TestWrapper>
    );

    const viewLink = screen.getByText('View Details');
    expect(viewLink).toBeInTheDocument();
    expect(viewLink).toHaveAttribute('href', '/ideas/idea-123');
  });

  it('displays Approve and Reject buttons', () => {
    render(
      <TestWrapper>
        <IdeaListItem idea={mockIdea} onApprove={vi.fn()} onReject={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('calls onApprove when Approve button is clicked', () => {
    const mockOnApprove = vi.fn();
    render(
      <TestWrapper>
        <IdeaListItem idea={mockIdea} onApprove={mockOnApprove} onReject={vi.fn()} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Approve'));
    expect(mockOnApprove).toHaveBeenCalledWith('idea-123');
  });

  it('calls onReject when Reject button is clicked', () => {
    const mockOnReject = vi.fn();
    render(
      <TestWrapper>
        <IdeaListItem idea={mockIdea} onApprove={vi.fn()} onReject={mockOnReject} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Reject'));
    expect(mockOnReject).toHaveBeenCalledWith('idea-123');
  });

  it('shows correct badge color for approved status', () => {
    const approvedIdea = { ...mockIdea, status: 'approved' as const };
    render(
      <TestWrapper>
        <IdeaListItem idea={approvedIdea} onApprove={vi.fn()} onReject={vi.fn()} />
      </TestWrapper>
    );

    const badge = screen.getByText('Approved');
    expect(badge).toBeInTheDocument();
  });

  it('shows correct badge for prd_development status', () => {
    const prdIdea = { ...mockIdea, status: 'prd_development' as const };
    render(
      <TestWrapper>
        <IdeaListItem idea={prdIdea} onApprove={vi.fn()} onReject={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('PRD Development')).toBeInTheDocument();
  });

  it('shows correct badge for prototype_complete status', () => {
    const prototypeIdea = { ...mockIdea, status: 'prototype_complete' as const };
    render(
      <TestWrapper>
        <IdeaListItem idea={prototypeIdea} onApprove={vi.fn()} onReject={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('Prototype Complete')).toBeInTheDocument();
  });

  it('shows correct badge for rejected status', () => {
    const rejectedIdea = { ...mockIdea, status: 'rejected' as const };
    render(
      <TestWrapper>
        <IdeaListItem idea={rejectedIdea} onApprove={vi.fn()} onReject={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
});
