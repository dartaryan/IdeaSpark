/**
 * Story 6.7 Task 10: Unit tests for DateRangeInfo component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DateRangeInfo } from './DateRangeInfo';
import type { DateRange } from '../../types';

describe('DateRangeInfo', () => {
  it('should display formatted date range', () => {
    const dateRange: DateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31'),
      label: 'Last 30 days',
    };

    render(<DateRangeInfo dateRange={dateRange} totalIdeas={45} />);

    expect(screen.getByText(/Jan 1, 2026 - Jan 31, 2026/)).toBeInTheDocument();
  });

  it('should display total days in range', () => {
    const dateRange: DateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31'),
      label: 'Last 30 days',
    };

    render(<DateRangeInfo dateRange={dateRange} totalIdeas={45} />);

    expect(screen.getByText(/31 days selected/)).toBeInTheDocument();
  });

  it('should display data point count', () => {
    const dateRange: DateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31'),
      label: 'Last 30 days',
    };

    render(<DateRangeInfo dateRange={dateRange} totalIdeas={45} />);

    expect(screen.getByText(/Based on 45 ideas/)).toBeInTheDocument();
  });

  it('should handle "All time" range with null start', () => {
    const dateRange: DateRange = {
      start: null,
      end: new Date('2026-01-31'),
      label: 'All time',
    };

    render(<DateRangeInfo dateRange={dateRange} totalIdeas={100} />);

    expect(screen.getByText(/All time - Jan 31, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Based on 100 ideas/)).toBeInTheDocument();
  });

  it('should handle zero ideas', () => {
    const dateRange: DateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31'),
      label: 'Last 30 days',
    };

    render(<DateRangeInfo dateRange={dateRange} totalIdeas={0} />);

    expect(screen.getByText(/Based on 0 ideas/)).toBeInTheDocument();
  });

  it('should use DaisyUI alert component with info styling', () => {
    const dateRange: DateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31'),
      label: 'Last 30 days',
    };

    const { container } = render(<DateRangeInfo dateRange={dateRange} totalIdeas={45} />);

    const alert = container.querySelector('.alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('alert-info');
  });

  it('should display info icon', () => {
    const dateRange: DateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31'),
      label: 'Last 30 days',
    };

    const { container } = render(<DateRangeInfo dateRange={dateRange} totalIdeas={45} />);

    // Check for SVG icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should calculate single day range correctly', () => {
    const dateRange: DateRange = {
      start: new Date('2026-01-29'),
      end: new Date('2026-01-29'),
      label: 'Today',
    };

    render(<DateRangeInfo dateRange={dateRange} totalIdeas={5} />);

    expect(screen.getByText(/1 day selected/)).toBeInTheDocument();
  });
});
