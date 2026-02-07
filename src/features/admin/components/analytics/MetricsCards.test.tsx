// src/features/admin/components/analytics/MetricsCards.test.tsx
// Task 13: Comprehensive unit tests for MetricsCards
// Subtask 13.8: Create MetricsCards.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsCards } from './MetricsCards';
import type { AnalyticsData } from '../../analytics/types';
import type { DateRange } from '../../types';

const mockDateRange: DateRange = {
  start: new Date('2026-01-01'),
  end: new Date('2026-01-31'),
  label: 'Last 30 days',
};

const mockAnalyticsData: AnalyticsData = {
  totalIdeas: 42,
  previousPeriodTotal: 35,
  trendPercentage: 20, // (42-35)/35 * 100 = 20%
  pipelineBreakdown: [
    { status: 'submitted', count: 15, percentage: 36 },
    { status: 'approved', count: 12, percentage: 29 },
    { status: 'prd_development', count: 10, percentage: 24 },
    { status: 'prototype_complete', count: 5, percentage: 12 },
  ],
  completionRate: 12,
  timeMetrics: {
    avgTimeToApproval: 2,
    avgTimeToPRD: 4,
    avgTimeToPrototype: 10,
  },
  timestamp: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
};

describe('MetricsCards', () => {
  it('should render loading skeleton when analytics data is undefined', () => {
    // Subtask 13.8: Test loading state
    const { container } = render(<MetricsCards analytics={undefined} dateRange={mockDateRange} />);
    
    // Should render 4 skeleton cards
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render metric cards with correct values', () => {
    // Subtask 13.9: Test metric cards render with correct values
    render(<MetricsCards analytics={mockAnalyticsData} dateRange={mockDateRange} />);
    
    // Subtask 2.3: Check all 4 metric cards
    expect(screen.getByText('Total Ideas')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    
    expect(screen.getByText('Pipeline Stages')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
    
    expect(screen.getByText('Avg Time')).toBeInTheDocument();
    expect(screen.getByText('10d')).toBeInTheDocument();
  });

  it('should render trend indicators correctly', () => {
    // Subtask 13.10: Test trend indicators display correctly
    const { container } = render(<MetricsCards analytics={mockAnalyticsData} dateRange={mockDateRange} />);
    
    // Subtask 2.5 & 2.6: Check for trend indicators and percentages
    // Story 6.2: Now displays real trend from analytics data
    expect(screen.getByText('+20%')).toBeInTheDocument(); // Real trend from mock data
    expect(screen.getByText('+5%')).toBeInTheDocument();
    expect(screen.getByText('-2d')).toBeInTheDocument();
    
    // Check for trend arrows/icons in the rendered output
    const upArrows = container.querySelectorAll('.text-green-600');
    expect(upArrows.length).toBeGreaterThan(0);
    
    const downArrows = container.querySelectorAll('.text-red-600');
    expect(downArrows.length).toBeGreaterThan(0);
  });

  it('should use PassportCard styling on metric cards', () => {
    // Subtask 12.1 & 12.2: Verify PassportCard styling
    const { container } = render(<MetricsCards analytics={mockAnalyticsData} dateRange={mockDateRange} />);
    
    // Subtask 1.4: Check for 20px border radius
    const cards = container.querySelectorAll('[style*="border-radius: 20px"]');
    expect(cards.length).toBe(4);
    
    // Subtask 2.7: Check for PassportCard red (#E10514) in metric values
    const redElements = container.querySelectorAll('[style*="rgb(225, 5, 20)"]');
    expect(redElements.length).toBeGreaterThan(0);
  });

  it('should render all required Heroicons', () => {
    // Subtask 2.4: Verify all metric icons are present
    const { container } = render(<MetricsCards analytics={mockAnalyticsData} dateRange={mockDateRange} />);
    
    // Should have 4 icons (light-bulb, chart-bar, check-circle, clock)
    const icons = container.querySelectorAll('svg.w-12');
    expect(icons.length).toBe(4);
  });

  it('should apply hover effects on cards', () => {
    // Subtask 12.9: Verify hover effects exist
    // Task 7: Only clickable cards (Total Ideas) have enhanced hover effects when onClick provided
    const { container } = render(<MetricsCards analytics={mockAnalyticsData} dateRange={mockDateRange} />);
    
    const allCards = container.querySelectorAll('.card');
    expect(allCards.length).toBe(4);
    
    // When no onClick is provided, cards should not have enhanced clickable hover effects
    const clickableHoverCards = container.querySelectorAll('.hover\\:scale-105');
    expect(clickableHoverCards.length).toBe(0);
  });

  // Story 6.2 Task 3: Tests for real trend data display
  it('should display real trend from analytics data', () => {
    // Subtask 10.7: Test metric card displays totalIdeas from props
    const analyticsWithPositiveTrend: AnalyticsData = {
      ...mockAnalyticsData,
      totalIdeas: 50,
      previousPeriodTotal: 40,
      trendPercentage: 25, // ((50-40)/40)*100
    };

    render(<MetricsCards analytics={analyticsWithPositiveTrend} dateRange={mockDateRange} />);
    
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('+25%')).toBeInTheDocument();
  });

  it('should display negative trend correctly', () => {
    // Subtask 10.8: Test trend indicator displays correctly (negative)
    const analyticsWithNegativeTrend: AnalyticsData = {
      ...mockAnalyticsData,
      totalIdeas: 30,
      previousPeriodTotal: 50,
      trendPercentage: -40, // ((30-50)/50)*100
    };

    const { container } = render(<MetricsCards analytics={analyticsWithNegativeTrend} dateRange={mockDateRange} />);
    
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('-40%')).toBeInTheDocument();
    
    // Check for red color on negative trend
    const redElements = container.querySelectorAll('.text-red-600');
    expect(redElements.length).toBeGreaterThan(0);
  });

  it('should display zero trend correctly', () => {
    // Subtask 10.8: Test trend indicator for zero change
    const analyticsWithZeroTrend: AnalyticsData = {
      ...mockAnalyticsData,
      totalIdeas: 40,
      previousPeriodTotal: 40,
      trendPercentage: 0,
    };

    const { container } = render(<MetricsCards analytics={analyticsWithZeroTrend} dateRange={mockDateRange} />);
    
    expect(screen.getByText('40')).toBeInTheDocument();
    // Check that there are multiple "0%" (one for Total Ideas trend, one for Pipeline Stages)
    const zeroPercents = screen.getAllByText('0%');
    expect(zeroPercents.length).toBeGreaterThan(0);
    
    // Check for neutral indicator (gray) on Total Ideas card
    const neutralIcons = container.querySelectorAll('[style*="rgb(82, 83, 85)"]');
    expect(neutralIcons.length).toBeGreaterThan(0);
  });

  it('should handle zero ideas case', () => {
    // Subtask 3.9: Test zero ideas case
    const analyticsWithZeroIdeas: AnalyticsData = {
      ...mockAnalyticsData,
      totalIdeas: 0,
      previousPeriodTotal: 0,
      trendPercentage: 0,
      pipelineBreakdown: [],
    };

    const { container } = render(<MetricsCards analytics={analyticsWithZeroIdeas} dateRange={mockDateRange} />);
    
    // Find the Total Ideas card specifically
    const totalIdeasLabel = screen.getByText('Total Ideas');
    expect(totalIdeasLabel).toBeInTheDocument();
    
    // Find the parent card and verify it shows 0
    const card = totalIdeasLabel.closest('.card');
    expect(card).toBeInTheDocument();
    expect(card?.textContent).toContain('0');
    expect(card?.textContent).toContain('0%');
  });
});
