// src/features/admin/components/analytics/MetricsCards.test.tsx
// Task 13: Comprehensive unit tests for MetricsCards
// Subtask 13.8: Create MetricsCards.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsCards } from './MetricsCards';
import type { AnalyticsData } from '../../analytics/types';

const mockAnalyticsData: AnalyticsData = {
  totalIdeas: 42,
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
};

describe('MetricsCards', () => {
  it('should render loading skeleton when analytics data is undefined', () => {
    // Subtask 13.8: Test loading state
    const { container } = render(<MetricsCards analytics={undefined} />);
    
    // Should render 4 skeleton cards
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render metric cards with correct values', () => {
    // Subtask 13.9: Test metric cards render with correct values
    render(<MetricsCards analytics={mockAnalyticsData} />);
    
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
    const { container } = render(<MetricsCards analytics={mockAnalyticsData} />);
    
    // Subtask 2.5 & 2.6: Check for trend indicators and percentages
    expect(screen.getByText('+12%')).toBeInTheDocument();
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
    const { container } = render(<MetricsCards analytics={mockAnalyticsData} />);
    
    // Subtask 1.4: Check for 20px border radius
    const cards = container.querySelectorAll('[style*="border-radius: 20px"]');
    expect(cards.length).toBe(4);
    
    // Subtask 2.7: Check for PassportCard red (#E10514) in metric values
    const redElements = container.querySelectorAll('[style*="rgb(225, 5, 20)"]');
    expect(redElements.length).toBeGreaterThan(0);
  });

  it('should render all required Heroicons', () => {
    // Subtask 2.4: Verify all metric icons are present
    const { container } = render(<MetricsCards analytics={mockAnalyticsData} />);
    
    // Should have 4 icons (light-bulb, chart-bar, check-circle, clock)
    const icons = container.querySelectorAll('svg.w-12');
    expect(icons.length).toBe(4);
  });

  it('should apply hover effects on cards', () => {
    // Subtask 12.9: Verify hover effects exist
    const { container } = render(<MetricsCards analytics={mockAnalyticsData} />);
    
    const cards = container.querySelectorAll('.hover\\:shadow-2xl');
    expect(cards.length).toBe(4);
  });
});
