// src/features/admin/components/analytics/RecentSubmissionsList.test.tsx
// Story 0.7 Task 4.1: Tests for RecentSubmissionsList navigation
// Code Review: Migrated fireEvent → userEvent, removed non-null assertions

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { RecentSubmissionsList } from './RecentSubmissionsList';
import type { RecentSubmissionData } from '../../analytics';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSubmissions: RecentSubmissionData[] = [
  {
    ideaId: 'idea-abc-123',
    title: 'Improve Customer Onboarding',
    status: 'submitted',
    createdAt: '2026-02-05T10:00:00Z',
    userId: 'user-1',
    userName: 'Jane Doe',
    userEmail: 'jane@example.com',
  },
  {
    ideaId: 'idea-def-456',
    title: 'Mobile App Redesign',
    status: 'approved',
    createdAt: '2026-02-04T14:30:00Z',
    userId: 'user-2',
    userName: null,
    userEmail: 'bob@example.com',
  },
];

const renderComponent = (submissions: RecentSubmissionData[] = mockSubmissions) => {
  return render(
    <BrowserRouter>
      <RecentSubmissionsList submissions={submissions} />
    </BrowserRouter>
  );
};

describe('RecentSubmissionsList', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // Task 4.1: Test clicking submission calls navigate with correct idea ID
  it('should navigate to idea detail page on click', async () => {
    const user = userEvent.setup();
    renderComponent();

    const firstSubmission = screen.getByText('Improve Customer Onboarding').closest('[role="button"]');
    expect(firstSubmission).toBeTruthy();
    await user.click(firstSubmission!);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/ideas/idea-abc-123');
  });

  it('should navigate to correct idea for second submission', async () => {
    const user = userEvent.setup();
    renderComponent();

    const secondSubmission = screen.getByText('Mobile App Redesign').closest('[role="button"]');
    expect(secondSubmission).toBeTruthy();
    await user.click(secondSubmission!);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/ideas/idea-def-456');
  });

  // Task 4.1: Test pressing Enter on submission calls navigate
  it('should navigate on Enter key press', async () => {
    const user = userEvent.setup();
    renderComponent();

    const firstSubmission = screen.getByText('Improve Customer Onboarding').closest('[role="button"]');
    expect(firstSubmission).toBeTruthy();
    (firstSubmission as HTMLElement).focus();
    await user.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/admin/ideas/idea-abc-123');
  });

  // Task 4.1: Test pressing Space on submission calls navigate
  it('should navigate on Space key press', async () => {
    const user = userEvent.setup();
    renderComponent();

    const firstSubmission = screen.getByText('Improve Customer Onboarding').closest('[role="button"]');
    expect(firstSubmission).toBeTruthy();
    (firstSubmission as HTMLElement).focus();
    await user.keyboard(' ');

    expect(mockNavigate).toHaveBeenCalledWith('/admin/ideas/idea-abc-123');
  });

  // Task 4.1: Test tabIndex is 0 for keyboard accessibility
  it('should have tabIndex 0 for keyboard accessibility', () => {
    renderComponent();

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('tabindex', '0');
    });
  });

  // Test that all clickable items have role="button"
  it('should have role="button" on clickable items', () => {
    renderComponent();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  // Test aria-label for accessibility (M3 fix)
  it('should have aria-label on clickable items', () => {
    renderComponent();

    expect(screen.getByLabelText('View idea: Improve Customer Onboarding')).toBeInTheDocument();
    expect(screen.getByLabelText('View idea: Mobile App Redesign')).toBeInTheDocument();
  });

  // Test that navigate is NOT called for non-navigation keys
  it('should not navigate on non-navigation key press', async () => {
    const user = userEvent.setup();
    renderComponent();

    const firstSubmission = screen.getByText('Improve Customer Onboarding').closest('[role="button"]');
    expect(firstSubmission).toBeTruthy();
    (firstSubmission as HTMLElement).focus();
    await user.keyboard('{Tab}');

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Test empty state renders correctly (no navigation)
  it('should display empty state when no submissions', () => {
    renderComponent([]);

    expect(screen.getByText('No recent submissions')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // Test submission data displays correctly
  it('should display submission title and submitter', () => {
    renderComponent();

    expect(screen.getByText('Improve Customer Onboarding')).toBeInTheDocument();
    expect(screen.getByText('by Jane Doe')).toBeInTheDocument();
  });

  // Test fallback to email when userName is null
  it('should display email when userName is null', () => {
    renderComponent();

    expect(screen.getByText('by bob@example.com')).toBeInTheDocument();
  });

  // Test status badges display
  it('should display status badges', () => {
    renderComponent();

    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  // Task 4.3: Verify no console.log statements remain
  it('should not call console.log on click', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log');
    renderComponent();

    const firstSubmission = screen.getByText('Improve Customer Onboarding').closest('[role="button"]');
    expect(firstSubmission).toBeTruthy();
    await user.click(firstSubmission!);

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should not call console.log on keyboard navigation', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log');
    renderComponent();

    const firstSubmission = screen.getByText('Improve Customer Onboarding').closest('[role="button"]');
    expect(firstSubmission).toBeTruthy();
    (firstSubmission as HTMLElement).focus();
    await user.keyboard('{Enter}');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
