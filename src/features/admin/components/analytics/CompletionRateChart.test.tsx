// src/features/admin/components/analytics/CompletionRateChart.test.tsx
// Story 0.5 Task 4.2: Tests for CompletionRateChart component

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompletionRateChart } from './CompletionRateChart';
import type { PipelineStageData } from '../../analytics/types';

describe('CompletionRateChart', () => {
  const mockData: PipelineStageData[] = [
    { status: 'submitted', label: 'Submitted', count: 10, percentage: 40, color: '#94A3B8' },
    { status: 'approved', label: 'Approved', count: 8, percentage: 32, color: '#0EA5E9' },
    { status: 'prd_development', label: 'PRD Development', count: 5, percentage: 20, color: '#F59E0B' },
    { status: 'prototype_complete', label: 'Prototype Complete', count: 2, percentage: 8, color: '#10B981' },
  ];

  it('should render chart with data', () => {
    const { container } = render(<CompletionRateChart data={mockData} />);

    // Title should be visible
    expect(screen.getByText('Completion Rate Breakdown')).toBeInTheDocument();

    // Recharts ResponsiveContainer should render
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should render chart title and description', () => {
    render(<CompletionRateChart data={mockData} />);
    expect(screen.getByText('Completion Rate Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Visualize the percentage of ideas reaching each pipeline stage')).toBeInTheDocument();
  });

  it('should display loading skeleton when isLoading is true', () => {
    render(<CompletionRateChart data={[]} isLoading={true} />);

    const skeleton = screen.getByTestId('chart-skeleton');
    expect(skeleton).toBeInTheDocument();
    // Title should still be visible during loading
    expect(screen.getByText('Completion Rate Breakdown')).toBeInTheDocument();
  });

  it('should display empty state when data is empty array', () => {
    render(<CompletionRateChart data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('Completion breakdown will appear when ideas are submitted')).toBeInTheDocument();
  });

  it('should display empty state when data is undefined', () => {
    render(<CompletionRateChart data={undefined as any} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should have card wrapper with proper styling', () => {
    const { container } = render(<CompletionRateChart data={mockData} />);

    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle({ borderRadius: '20px' });
  });
});
