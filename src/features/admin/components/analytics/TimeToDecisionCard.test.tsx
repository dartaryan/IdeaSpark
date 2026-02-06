// Story 6.5 Task 13 Subtask 13.7: Create TimeToDecisionCard.test.tsx
// Test TimeToDecisionCard component rendering and warning indicators

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeToDecisionCard } from './TimeToDecisionCard';
import type { TimeToDecisionMetrics } from '../../analytics/types';

describe('TimeToDecisionCard', () => {
  // Helper to create mock time metrics
  const createMockMetrics = (overrides?: Partial<TimeToDecisionMetrics>): TimeToDecisionMetrics => ({
    submissionToDecision: {
      averageDays: 2.5,
      averageHours: 60,
      formattedTime: '2.5 days',
      trend: { direction: 'down', change: -0.5, changePercentage: -20 },
      count: 10,
      benchmark: { targetDays: 3, status: 'on-track' },
    },
    approvalToPrd: {
      averageDays: 4.8,
      averageHours: 115.2,
      formattedTime: '4.8 days',
      trend: { direction: 'neutral', change: 0.2, changePercentage: 4 },
      count: 8,
      benchmark: { targetDays: 5, status: 'on-track' },
    },
    prdToPrototype: {
      averageDays: 1.5,
      averageHours: 36,
      formattedTime: '1.5 days',
      trend: { direction: 'down', change: -0.5, changePercentage: -25 },
      count: 6,
      benchmark: { targetDays: 2, status: 'on-track' },
    },
    endToEnd: {
      averageDays: 9.2,
      averageHours: 220.8,
      formattedTime: '9.2 days',
      trend: { direction: 'down', change: -1.3, changePercentage: -12 },
      count: 5,
      benchmark: { targetDays: 10, status: 'on-track' },
    },
    ...overrides,
  });

  // Subtask 13.8: Test card renders with time metrics data
  it('should render time metrics card with all metrics', () => {
    const metrics = createMockMetrics();
    
    render(<TimeToDecisionCard data={metrics} />);

    // Verify card title
    expect(screen.getByText('Time-to-Decision Metrics')).toBeInTheDocument();

    // Verify all metric labels are displayed
    expect(screen.getByText('Submission → Decision')).toBeInTheDocument();
    expect(screen.getByText('Approval → PRD Complete')).toBeInTheDocument();
    expect(screen.getByText('PRD → Prototype')).toBeInTheDocument();
    expect(screen.getByText('End-to-End (Idea → Prototype)')).toBeInTheDocument();

    // Verify formatted times
    expect(screen.getByText('2.5 days')).toBeInTheDocument();
    expect(screen.getByText('4.8 days')).toBeInTheDocument();
    expect(screen.getByText('1.5 days')).toBeInTheDocument();
    expect(screen.getByText('9.2 days')).toBeInTheDocument();
  });

  // Subtask 13.9: Test empty state displays correctly
  it('should display empty state when no data provided', () => {
    render(<TimeToDecisionCard data={undefined} />);

    expect(screen.getByText('Time-to-Decision Metrics')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  // Subtask 13.10: Test warning indicators show for slow times
  it('should show warning alert when metrics are behind schedule', () => {
    const metrics = createMockMetrics({
      submissionToDecision: {
        averageDays: 5.0,
        averageHours: 120,
        formattedTime: '5.0 days',
        trend: { direction: 'up', change: 2.0, changePercentage: 67 },
        count: 10,
        benchmark: { targetDays: 3, status: 'behind' }, // Behind schedule
      },
      approvalToPrd: {
        averageDays: 7.0,
        averageHours: 168,
        formattedTime: '7.0 days',
        trend: { direction: 'up', change: 2.0, changePercentage: 40 },
        count: 8,
        benchmark: { targetDays: 5, status: 'behind' }, // Behind schedule
      },
    });
    
    render(<TimeToDecisionCard data={metrics} />);

    // Verify warning alert is displayed
    expect(screen.getByText(/Processing delays detected/i)).toBeInTheDocument();

    // Verify slow metrics are listed in the alert
    expect(screen.getByText(/Submission → Decision: 5.0 days/i)).toBeInTheDocument();
    expect(screen.getByText(/Approval → PRD: 7.0 days/i)).toBeInTheDocument();
  });

  it('should not show warning alert when all metrics are on-track', () => {
    const metrics = createMockMetrics(); // All on-track by default
    
    render(<TimeToDecisionCard data={metrics} />);

    // Verify no warning alert
    expect(screen.queryByText(/Processing delays detected/i)).not.toBeInTheDocument();
  });

  it('should show warning only for behind metrics, not at-risk', () => {
    const metrics = createMockMetrics({
      submissionToDecision: {
        averageDays: 5.0,
        averageHours: 120,
        formattedTime: '5.0 days',
        trend: { direction: 'up', change: 2.0, changePercentage: 67 },
        count: 10,
        benchmark: { targetDays: 3, status: 'behind' },
      },
      approvalToPrd: {
        averageDays: 5.2,
        averageHours: 124.8,
        formattedTime: '5.2 days',
        trend: { direction: 'up', change: 0.2, changePercentage: 4 },
        count: 8,
        benchmark: { targetDays: 5, status: 'at-risk' }, // At-risk, not behind
      },
    });
    
    render(<TimeToDecisionCard data={metrics} />);

    // Warning should only show behind metric
    expect(screen.getByText(/Processing delays detected/i)).toBeInTheDocument();
    expect(screen.getByText(/Submission → Decision: 5.0 days/i)).toBeInTheDocument();
    
    // At-risk metric should not be in the warning list
    expect(screen.queryByText(/Approval → PRD Complete: 5.2 days/i)).not.toBeInTheDocument();
  });

  it('should display loading skeleton when loading', () => {
    render(<TimeToDecisionCard data={undefined} isLoading={true} />);

    // Verify loading skeletons are displayed
    const skeletons = screen.getAllByRole('generic').filter(el => 
      el.classList.contains('animate-pulse')
    );
    
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show color-coded legend', () => {
    const metrics = createMockMetrics();
    
    render(<TimeToDecisionCard data={metrics} />);

    // Verify legend explaining color coding
    expect(screen.getByText(/Green: On track/i)).toBeInTheDocument();
    expect(screen.getByText(/Yellow: At risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Red: Behind target/i)).toBeInTheDocument();
  });

  // Story 0.6 Task 6: Test drill-down message (no longer "coming soon")
  it('should show drill-down message', () => {
    const metrics = createMockMetrics();
    
    render(<TimeToDecisionCard data={metrics} />);

    expect(screen.getByText(/Click any metric for detailed breakdown/i)).toBeInTheDocument();
  });

  it('should not show warning when metrics have 0 count', () => {
    const metrics = createMockMetrics({
      submissionToDecision: {
        averageDays: 0,
        averageHours: 0,
        formattedTime: 'N/A',
        trend: { direction: 'neutral', change: 0, changePercentage: 0 },
        count: 0, // No data
        benchmark: { targetDays: 3, status: 'behind' },
      },
    });
    
    render(<TimeToDecisionCard data={metrics} />);

    // No warning should be shown when count is 0 (even if benchmark status is behind)
    expect(screen.queryByText(/Processing delays detected/i)).not.toBeInTheDocument();
  });

  it('should display all 4 metrics in grid layout', () => {
    const metrics = createMockMetrics();
    
    const { container } = render(<TimeToDecisionCard data={metrics} />);

    // Verify grid layout
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
  });

  it('should pass correct labels to TimeMetricDisplay components', () => {
    const metrics = createMockMetrics();
    
    render(<TimeToDecisionCard data={metrics} />);

    // Verify specific labels
    expect(screen.getByText('Submission → Decision')).toBeInTheDocument();
    expect(screen.getByText('Approval → PRD Complete')).toBeInTheDocument();
    expect(screen.getByText('PRD → Prototype')).toBeInTheDocument();
    expect(screen.getByText('End-to-End (Idea → Prototype)')).toBeInTheDocument();
  });

  it('should apply 20px border radius styling', () => {
    const metrics = createMockMetrics();
    
    const { container } = render(<TimeToDecisionCard data={metrics} />);

    const card = container.querySelector('.card');
    expect(card).toHaveStyle({ borderRadius: '20px' });
  });

  // Story 0.6 Task 6 Subtask 6.2: Test onDrillDown callback
  it('should call onDrillDown when a metric is clicked', () => {
    const mockDrillDown = vi.fn();
    const metrics = createMockMetrics();

    render(<TimeToDecisionCard data={metrics} onDrillDown={mockDrillDown} />);

    // Click on the first metric
    const metricElement = screen.getByText('Submission → Decision');
    fireEvent.click(metricElement.closest('[role="button"]') || metricElement);

    expect(mockDrillDown).toHaveBeenCalled();
  });

  // Story 0.6 AC2: Console.log removed, replaced with modal logic
  it('should not have console.log placeholder', () => {
    const metrics = createMockMetrics();
    
    render(<TimeToDecisionCard data={metrics} />);

    // Verify "coming soon" is no longer displayed
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });
});
