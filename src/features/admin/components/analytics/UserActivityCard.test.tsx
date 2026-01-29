// src/features/admin/components/analytics/UserActivityCard.test.tsx
// Story 6.6 Task 15: Unit tests for UserActivityCard

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserActivityCard } from './UserActivityCard';
import type { UserActivityMetrics } from '../../analytics/types';

describe('UserActivityCard', () => {
  const mockUserActivity: UserActivityMetrics = {
    totalUsers: 50,
    activeUsers: 20,
    activePercentage: 40,
    trend: {
      direction: 'up',
      change: 5,
      changePercentage: 33.3,
    },
    topContributors: [],
    recentSubmissions: [],
  };

  // Subtask 15.8: Test card renders with user activity data
  it('should render user activity stats correctly', () => {
    render(<UserActivityCard data={mockUserActivity} />);

    // Verify card title
    expect(screen.getByText('User Activity')).toBeInTheDocument();

    // Verify total users stat
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    // Verify active users stat
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();

    // Verify engagement rate
    expect(screen.getByText('Engagement Rate')).toBeInTheDocument();
    expect(screen.getByText('40.0%')).toBeInTheDocument();
  });

  // Test trend indicator display
  it('should display trend indicator correctly', () => {
    render(<UserActivityCard data={mockUserActivity} />);

    // Verify trend direction (up arrow)
    expect(screen.getByText('↑')).toBeInTheDocument();
    
    // Verify trend description
    expect(screen.getByText('+5 from previous period')).toBeInTheDocument();
  });

  // Test different trend directions
  it('should display down trend correctly', () => {
    const dataWithDownTrend: UserActivityMetrics = {
      ...mockUserActivity,
      trend: {
        direction: 'down',
        change: -3,
        changePercentage: -15,
      },
    };

    render(<UserActivityCard data={dataWithDownTrend} />);

    // Verify down arrow
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('-3 from previous period')).toBeInTheDocument();
  });

  it('should display neutral trend correctly', () => {
    const dataWithNeutralTrend: UserActivityMetrics = {
      ...mockUserActivity,
      trend: {
        direction: 'neutral',
        change: 0,
        changePercentage: 0,
      },
    };

    render(<UserActivityCard data={dataWithNeutralTrend} />);

    // Verify neutral arrow
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('0 from previous period')).toBeInTheDocument();
  });

  // Test engagement level colors
  it('should display high engagement message for >50%', () => {
    const highEngagementData: UserActivityMetrics = {
      ...mockUserActivity,
      activePercentage: 60,
    };

    render(<UserActivityCard data={highEngagementData} />);

    expect(screen.getByText('High engagement')).toBeInTheDocument();
  });

  it('should display medium engagement message for 25-50%', () => {
    const mediumEngagementData: UserActivityMetrics = {
      ...mockUserActivity,
      activePercentage: 35,
    };

    render(<UserActivityCard data={mediumEngagementData} />);

    expect(screen.getByText('Medium engagement')).toBeInTheDocument();
  });

  it('should display low engagement message for <25%', () => {
    const lowEngagementData: UserActivityMetrics = {
      ...mockUserActivity,
      activePercentage: 15,
    };

    render(<UserActivityCard data={lowEngagementData} />);

    expect(screen.getByText(/Low engagement/)).toBeInTheDocument();
  });

  // Subtask 15.9: Test empty state displays correctly
  it('should display empty state when no data', () => {
    render(<UserActivityCard data={undefined} />);

    expect(screen.getByText('User Activity')).toBeInTheDocument();
    expect(screen.getByText('No user data available')).toBeInTheDocument();
  });

  it('should display empty state when total users is 0', () => {
    const emptyData: UserActivityMetrics = {
      totalUsers: 0,
      activeUsers: 0,
      activePercentage: 0,
      trend: {
        direction: 'neutral',
        change: 0,
        changePercentage: 0,
      },
      topContributors: [],
      recentSubmissions: [],
    };

    render(<UserActivityCard data={emptyData} />);

    expect(screen.getByText('No user data available')).toBeInTheDocument();
  });

  // Test loading state
  it('should display loading skeleton when isLoading is true', () => {
    render(<UserActivityCard data={undefined} isLoading={true} />);

    expect(screen.getByText('User Activity')).toBeInTheDocument();
    // Check for loading skeleton (animate-pulse class)
    const loadingSkeleton = screen.getByText('User Activity').closest('.card-body');
    expect(loadingSkeleton?.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
