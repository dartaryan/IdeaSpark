// src/features/admin/components/analytics/SubmissionChart.test.tsx
// Story 0.5 Task 4.1: Tests for SubmissionChart component

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionChart } from './SubmissionChart';
import type { IdeaBreakdown } from '../../analytics/types';

describe('SubmissionChart', () => {
  const mockData: IdeaBreakdown[] = [
    { period: 'Week of Jan 1', count: 5 },
    { period: 'Week of Jan 8', count: 12 },
    { period: 'Week of Jan 15', count: 8 },
    { period: 'Week of Jan 22', count: 15 },
  ];

  it('should render chart with data', () => {
    const { container } = render(<SubmissionChart data={mockData} />);

    // Title should be visible
    expect(screen.getByText('Idea Submissions Over Time')).toBeInTheDocument();

    // Recharts ResponsiveContainer should render
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should render chart title and description', () => {
    render(<SubmissionChart data={mockData} />);
    expect(screen.getByText('Idea Submissions Over Time')).toBeInTheDocument();
    expect(screen.getByText('Track the volume of idea submissions across different time periods')).toBeInTheDocument();
  });

  it('should display loading skeleton when isLoading is true', () => {
    render(<SubmissionChart data={[]} isLoading={true} />);

    const skeleton = screen.getByTestId('chart-skeleton');
    expect(skeleton).toBeInTheDocument();
    // Title should still be visible during loading
    expect(screen.getByText('Idea Submissions Over Time')).toBeInTheDocument();
  });

  it('should display empty state when data is empty array', () => {
    render(<SubmissionChart data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('Submission trends will appear when ideas are submitted')).toBeInTheDocument();
  });

  it('should display empty state when data is undefined', () => {
    render(<SubmissionChart data={undefined as any} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should have card wrapper with proper styling', () => {
    const { container } = render(<SubmissionChart data={mockData} />);

    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle({ borderRadius: '20px' });
  });
});
