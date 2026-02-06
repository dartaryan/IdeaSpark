// src/features/admin/components/analytics/TopContributorsLeaderboard.test.tsx
// Story 0.7 Task 4.2: Tests for TopContributorsLeaderboard navigation
// Code Review: Migrated fireEvent → userEvent, removed non-null assertions

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TopContributorsLeaderboard } from './TopContributorsLeaderboard';
import type { TopContributorData } from '../../analytics';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockContributors: TopContributorData[] = [
  {
    userId: 'user-gold-1',
    userName: 'Alice Johnson',
    userEmail: 'alice@example.com',
    ideasCount: 15,
    percentage: 30.0,
    joinDate: '2025-06-01T00:00:00Z',
    lastSubmissionDate: '2026-02-05T10:00:00Z',
  },
  {
    userId: 'user-silver-2',
    userName: 'Bob Smith',
    userEmail: 'bob@example.com',
    ideasCount: 10,
    percentage: 20.0,
    joinDate: '2025-07-01T00:00:00Z',
    lastSubmissionDate: '2026-02-04T14:30:00Z',
  },
  {
    userId: 'user-bronze-3',
    userName: null,
    userEmail: 'carol@example.com',
    ideasCount: 7,
    percentage: 14.0,
    joinDate: '2025-08-01T00:00:00Z',
    lastSubmissionDate: '2026-02-03T09:00:00Z',
  },
];

const renderComponent = (contributors: TopContributorData[] = mockContributors) => {
  return render(
    <BrowserRouter>
      <TopContributorsLeaderboard contributors={contributors} />
    </BrowserRouter>
  );
};

describe('TopContributorsLeaderboard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // Task 4.2: Test clicking contributor calls navigate with correct user ID
  it('should navigate to user detail page on click', async () => {
    const user = userEvent.setup();
    renderComponent();

    const firstContributor = screen.getByText('Alice Johnson').closest('[role="button"]');
    expect(firstContributor).toBeTruthy();
    await user.click(firstContributor!);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/user-gold-1');
  });

  it('should navigate to correct user for second contributor', async () => {
    const user = userEvent.setup();
    renderComponent();

    const secondContributor = screen.getByText('Bob Smith').closest('[role="button"]');
    expect(secondContributor).toBeTruthy();
    await user.click(secondContributor!);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/user-silver-2');
  });

  it('should navigate to correct user for contributor with null name', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Carol has null userName, so "Unknown User" is displayed
    const thirdContributor = screen.getByText('Unknown User').closest('[role="button"]');
    expect(thirdContributor).toBeTruthy();
    await user.click(thirdContributor!);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/user-bronze-3');
  });

  // Task 4.2: Test pressing Enter on contributor calls navigate
  it('should navigate on Enter key press', async () => {
    const user = userEvent.setup();
    renderComponent();

    const firstContributor = screen.getByText('Alice Johnson').closest('[role="button"]');
    expect(firstContributor).toBeTruthy();
    (firstContributor as HTMLElement).focus();
    await user.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/user-gold-1');
  });

  // Task 4.2: Test pressing Space on contributor calls navigate
  it('should navigate on Space key press', async () => {
    const user = userEvent.setup();
    renderComponent();

    const firstContributor = screen.getByText('Alice Johnson').closest('[role="button"]');
    expect(firstContributor).toBeTruthy();
    (firstContributor as HTMLElement).focus();
    await user.keyboard(' ');

    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/user-gold-1');
  });

  // Task 4.2: Test tabIndex is 0 for keyboard accessibility
  it('should have tabIndex 0 for keyboard accessibility', () => {
    renderComponent();

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('tabindex', '0');
    });
  });

  // Test that all clickable items have role="button"
  it('should have role="button" on all contributor rows', () => {
    renderComponent();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  // Test aria-label for accessibility (M3 fix)
  it('should have aria-label on contributor rows', () => {
    renderComponent();

    expect(screen.getByLabelText('View contributor: Alice Johnson')).toBeInTheDocument();
    expect(screen.getByLabelText('View contributor: Bob Smith')).toBeInTheDocument();
    expect(screen.getByLabelText('View contributor: Unknown User')).toBeInTheDocument();
  });

  // Test that navigate is NOT called for non-navigation keys
  it('should not navigate on non-navigation key press', async () => {
    const user = userEvent.setup();
    renderComponent();

    const firstContributor = screen.getByText('Alice Johnson').closest('[role="button"]');
    expect(firstContributor).toBeTruthy();
    (firstContributor as HTMLElement).focus();
    await user.keyboard('{Tab}');

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Test empty state renders correctly (no navigation)
  it('should display empty state when no contributors', () => {
    renderComponent([]);

    expect(screen.getByText('No contributors yet')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // Test contributor data displays correctly
  it('should display contributor names and emails', () => {
    renderComponent();

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  // Test fallback to "Unknown User" when userName is null
  it('should display "Unknown User" when userName is null', () => {
    renderComponent();

    expect(screen.getByText('Unknown User')).toBeInTheDocument();
  });

  // Test ideas count displays
  it('should display ideas count for each contributor', () => {
    renderComponent();

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  // Test medal icons for top 3
  it('should display medal icons for top 3 contributors', () => {
    renderComponent();

    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.getByText('🥉')).toBeInTheDocument();
  });

  // Task 4.3: Verify no console.log statements remain
  it('should not call console.log on click', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log');
    renderComponent();

    const firstContributor = screen.getByText('Alice Johnson').closest('[role="button"]');
    expect(firstContributor).toBeTruthy();
    await user.click(firstContributor!);

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should not call console.log on keyboard navigation', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log');
    renderComponent();

    const firstContributor = screen.getByText('Alice Johnson').closest('[role="button"]');
    expect(firstContributor).toBeTruthy();
    (firstContributor as HTMLElement).focus();
    await user.keyboard('{Enter}');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
