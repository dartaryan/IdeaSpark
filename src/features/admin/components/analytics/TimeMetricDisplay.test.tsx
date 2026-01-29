// Story 6.5 Task 13 Subtask 13.11: Create TimeMetricDisplay.test.tsx
// Test TimeMetricDisplay component rendering and interactions

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeMetricDisplay } from './TimeMetricDisplay';
import type { TimeMetric } from '../../analytics/types';

describe('TimeMetricDisplay', () => {
  // Helper to create mock time metric
  const createMockMetric = (overrides?: Partial<TimeMetric>): TimeMetric => ({
    averageDays: 2.5,
    averageHours: 60,
    formattedTime: '2.5 days',
    trend: {
      direction: 'down',
      change: -0.5,
      changePercentage: -20,
    },
    count: 10,
    benchmark: {
      targetDays: 3,
      status: 'on-track',
    },
    ...overrides,
  });

  // Subtask 13.12: Test metric displays time, trend, and benchmark correctly
  it('should display time metric with all details', () => {
    const metric = createMockMetric();
    
    render(
      <TimeMetricDisplay 
        label="Submission → Decision" 
        metric={metric}
      />
    );

    // Verify label
    expect(screen.getByText('Submission → Decision')).toBeInTheDocument();
    
    // Verify formatted time
    expect(screen.getByText('2.5 days')).toBeInTheDocument();
    
    // Verify trend indicator (↓ for improvement)
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText(/vs last period/i)).toBeInTheDocument();
    
    // Verify benchmark comparison
    expect(screen.getByText(/faster than target/i)).toBeInTheDocument();
    
    // Verify sample size
    expect(screen.getByText(/Based on 10 ideas/i)).toBeInTheDocument();
  });

  // Subtask 13.13: Test color coding for different time ranges
  it('should apply correct color coding for on-track status', () => {
    const metric = createMockMetric({
      benchmark: { targetDays: 3, status: 'on-track' },
    });
    
    const { container } = render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
      />
    );

    const metricCard = container.firstChild;
    expect(metricCard).toHaveClass('bg-green-50');
  });

  it('should apply correct color coding for at-risk status', () => {
    const metric = createMockMetric({
      averageDays: 3.2,
      formattedTime: '3.2 days',
      benchmark: { targetDays: 3, status: 'at-risk' },
    });
    
    const { container } = render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
      />
    );

    const metricCard = container.firstChild;
    expect(metricCard).toHaveClass('bg-yellow-50');
  });

  it('should apply correct color coding for behind status', () => {
    const metric = createMockMetric({
      averageDays: 5.0,
      formattedTime: '5.0 days',
      benchmark: { targetDays: 3, status: 'behind' },
    });
    
    const { container } = render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
      />
    );

    const metricCard = container.firstChild;
    expect(metricCard).toHaveClass('bg-red-50');
  });

  it('should show improving trend with down arrow (green)', () => {
    const metric = createMockMetric({
      trend: {
        direction: 'down',
        change: -1.0,
        changePercentage: -33,
      },
    });
    
    render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
      />
    );

    // Verify down arrow for improvement
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText(/-1.0 days vs last period/i)).toBeInTheDocument();
  });

  it('should show worsening trend with up arrow (red)', () => {
    const metric = createMockMetric({
      trend: {
        direction: 'up',
        change: 1.5,
        changePercentage: 50,
      },
    });
    
    render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
      />
    );

    // Verify up arrow for worsening
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText(/\+1.5 days vs last period/i)).toBeInTheDocument();
  });

  it('should show neutral trend with right arrow (gray)', () => {
    const metric = createMockMetric({
      trend: {
        direction: 'neutral',
        change: 0.2,
        changePercentage: 8,
      },
    });
    
    render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
      />
    );

    // Verify right arrow for neutral
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('should display benchmark comparison correctly', () => {
    const metric = createMockMetric({
      averageDays: 2.5,
      benchmark: { targetDays: 3, status: 'on-track' },
    });
    
    render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
      />
    );

    // 3 - 2.5 = 0.5 days faster
    expect(screen.getByText(/0.5 days faster than target/i)).toBeInTheDocument();
  });

  it('should display behind target benchmark correctly', () => {
    const metric = createMockMetric({
      averageDays: 5.0,
      benchmark: { targetDays: 3, status: 'behind' },
    });
    
    render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
      />
    );

    // 5 - 3 = 2 days behind
    expect(screen.getByText(/2.0 days behind target/i)).toBeInTheDocument();
  });

  it('should handle zero count gracefully (no data)', () => {
    const metric = createMockMetric({
      averageDays: 0,
      formattedTime: 'N/A',
      count: 0,
      trend: {
        direction: 'neutral',
        change: 0,
        changePercentage: 0,
      },
    });
    
    render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
      />
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText(/No data available for this period/i)).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const metric = createMockMetric();
    const handleClick = vi.fn();
    
    render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
        onClick={handleClick}
      />
    );

    const metricCard = screen.getByText('Test Metric').closest('div');
    fireEvent.click(metricCard!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard Enter to trigger onClick', () => {
    const metric = createMockMetric();
    const handleClick = vi.fn();
    
    render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
        onClick={handleClick}
      />
    );

    const metricCard = screen.getByText('Test Metric').closest('div');
    fireEvent.keyDown(metricCard!, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard Space to trigger onClick', () => {
    const metric = createMockMetric();
    const handleClick = vi.fn();
    
    render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
        onClick={handleClick}
      />
    );

    const metricCard = screen.getByText('Test Metric').closest('div');
    fireEvent.keyDown(metricCard!, { key: ' ' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show tooltip on hover', () => {
    const metric = createMockMetric();
    
    const { container } = render(
      <TimeMetricDisplay 
        label="Submission → Decision" 
        metric={metric}
      />
    );

    const metricCard = container.firstChild as HTMLElement;
    expect(metricCard).toHaveAttribute('title');
    expect(metricCard.title).toContain('Average time for Submission → Decision');
    expect(metricCard.title).toContain('10 ideas');
    expect(metricCard.title).toContain('Target: 3 days');
  });

  it('should pluralize "ideas" correctly', () => {
    const metricSingle = createMockMetric({ count: 1 });
    const { rerender } = render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metricSingle}
      />
    );

    expect(screen.getByText(/Based on 1 idea/i)).toBeInTheDocument();

    const metricMultiple = createMockMetric({ count: 5 });
    rerender(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metricMultiple}
      />
    );

    expect(screen.getByText(/Based on 5 ideas/i)).toBeInTheDocument();
  });

  it('should not show trend when count is 0', () => {
    const metric = createMockMetric({
      count: 0,
      averageDays: 0,
      formattedTime: 'N/A',
    });
    
    render(
      <TimeMetricDisplay 
        label="Test Metric" 
        metric={metric}
      />
    );

    // Trend arrows should not be displayed when count is 0
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('→')).not.toBeInTheDocument();
  });
});
