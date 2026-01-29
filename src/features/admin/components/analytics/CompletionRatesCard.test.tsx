// src/features/admin/components/analytics/CompletionRatesCard.test.tsx
// Story 6.4 Task 12: Comprehensive tests for CompletionRatesCard component
// Subtask 12.6-12.9: Card rendering, empty state, warning indicators tests

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompletionRatesCard } from './CompletionRatesCard';
import type { CompletionRates, ConversionRate } from '../../analytics/types';

describe('CompletionRatesCard', () => {
  const createMockConversionRate = (rate: number, change: number = 0): ConversionRate => ({
    rate,
    trend: {
      direction: change > 2 ? 'up' : change < -2 ? 'down' : 'neutral',
      change,
      changePercentage: change,
    },
    count: Math.round(rate),
    totalCount: 100,
  });

  const createMockData = (rates: {
    submittedToApproved?: number;
    approvedToPrd?: number;
    prdToPrototype?: number;
    overall?: number;
  } = {}): CompletionRates => ({
    submittedToApproved: createMockConversionRate(rates.submittedToApproved ?? 75, 5),
    approvedToPrd: createMockConversionRate(rates.approvedToPrd ?? 60, 3),
    prdToPrototype: createMockConversionRate(rates.prdToPrototype ?? 50, -2),
    overallSubmittedToPrototype: createMockConversionRate(rates.overall ?? 25, 1),
  });

  describe('rendering', () => {
    it('should render card with completion rates data', () => {
      // Subtask 12.7: Test card renders with completion rates data
      const data = createMockData();

      render(<CompletionRatesCard data={data} />);

      expect(screen.getByText('Completion Rates')).toBeInTheDocument();
      expect(screen.getByText('Submitted → Approved')).toBeInTheDocument();
      expect(screen.getByText('Approved → PRD Complete')).toBeInTheDocument();
      expect(screen.getByText('PRD → Prototype')).toBeInTheDocument();
      expect(screen.getByText('Overall (Submitted → Prototype)')).toBeInTheDocument();
    });

    it('should display all 4 conversion rates', () => {
      const data = createMockData({
        submittedToApproved: 80,
        approvedToPrd: 65,
        prdToPrototype: 55,
        overall: 30,
      });

      render(<CompletionRatesCard data={data} />);

      // Check that all rates are displayed
      expect(screen.getByText('80.0%')).toBeInTheDocument();
      expect(screen.getByText('65.0%')).toBeInTheDocument();
      expect(screen.getByText('55.0%')).toBeInTheDocument();
      expect(screen.getByText('30.0%')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading skeleton when isLoading is true', () => {
      // Subtask 12.7: Test loading state displays correctly
      const data = createMockData();

      render(<CompletionRatesCard data={data} isLoading={true} />);

      expect(screen.getByText('Completion Rates')).toBeInTheDocument();
      
      // Loading skeleton should be present (animate-pulse class)
      const skeletons = screen.getAllByRole('generic').filter(
        el => el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('empty state', () => {
    it('should display empty state message when data is null', () => {
      // Subtask 12.8: Test empty state displays correctly
      render(<CompletionRatesCard data={null as any} />);

      expect(screen.getByText('Completion Rates')).toBeInTheDocument();
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should display empty state message when data is undefined', () => {
      render(<CompletionRatesCard data={undefined as any} />);

      expect(screen.getByText('Completion Rates')).toBeInTheDocument();
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('low rate warnings', () => {
    it('should show critical alert when any rate is below 25%', () => {
      // Subtask 12.9: Test warning indicators show for low rates
      const data = createMockData({
        submittedToApproved: 20, // Critical
        approvedToPrd: 60,
        prdToPrototype: 50,
        overall: 15, // Critical
      });

      render(<CompletionRatesCard data={data} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Low conversion detected/)).toBeInTheDocument();
      expect(screen.getByText(/Submitted → Approved.*20\.0%/)).toBeInTheDocument();
    });

    it('should show warning alert when rate is between 25-40%', () => {
      const data = createMockData({
        submittedToApproved: 35, // Warning
        approvedToPrd: 60,
        prdToPrototype: 50,
        overall: 30, // Warning
      });

      render(<CompletionRatesCard data={data} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Low conversion detected/)).toBeInTheDocument();
    });

    it('should not show alert when all rates are healthy', () => {
      const data = createMockData({
        submittedToApproved: 75,
        approvedToPrd: 65,
        prdToPrototype: 55,
        overall: 45,
      });

      render(<CompletionRatesCard data={data} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByText(/Low conversion detected/)).not.toBeInTheDocument();
    });

    it('should identify multiple low rates in alert message', () => {
      const data = createMockData({
        submittedToApproved: 20, // Critical
        approvedToPrd: 30, // Warning
        prdToPrototype: 25, // Warning
        overall: 15, // Critical
      });

      render(<CompletionRatesCard data={data} />);

      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Submitted → Approved');
      expect(alert.textContent).toContain('Approved → PRD');
      expect(alert.textContent).toContain('PRD → Prototype');
      expect(alert.textContent).toContain('Overall');
    });
  });

  describe('interactivity', () => {
    it('should call onMetricClick with correct conversion type', async () => {
      const user = userEvent.setup();
      const handleMetricClick = vi.fn();
      const data = createMockData();

      render(<CompletionRatesCard data={data} onMetricClick={handleMetricClick} />);

      // Click on Submitted → Approved metric
      const metrics = screen.getAllByRole('button');
      await user.click(metrics[0]); // First metric

      expect(handleMetricClick).toHaveBeenCalledWith('submittedToApproved');
    });

    it('should pass different conversion types to onMetricClick', async () => {
      const user = userEvent.setup();
      const handleMetricClick = vi.fn();
      const data = createMockData();

      render(<CompletionRatesCard data={data} onMetricClick={handleMetricClick} />);

      const metrics = screen.getAllByRole('button');
      
      await user.click(metrics[0]); // Submitted → Approved
      expect(handleMetricClick).toHaveBeenCalledWith('submittedToApproved');

      await user.click(metrics[1]); // Approved → PRD
      expect(handleMetricClick).toHaveBeenCalledWith('approvedToPrd');

      await user.click(metrics[2]); // PRD → Prototype
      expect(handleMetricClick).toHaveBeenCalledWith('prdToPrototype');

      await user.click(metrics[3]); // Overall
      expect(handleMetricClick).toHaveBeenCalledWith('overall');
    });

    it('should not make metrics clickable when onMetricClick is not provided', () => {
      const data = createMockData();

      render(<CompletionRatesCard data={data} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('responsive layout', () => {
    it('should render grid layout for metrics', () => {
      const data = createMockData();

      const { container } = render(<CompletionRatesCard data={data} />);

      // Check grid classes are applied (grid-cols-1 md:grid-cols-2)
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid?.className).toContain('grid-cols-1');
      expect(grid?.className).toContain('md:grid-cols-2');
    });
  });

  describe('PassportCard styling', () => {
    it('should apply 20px border radius', () => {
      const data = createMockData();

      const { container } = render(<CompletionRatesCard data={data} />);

      const card = container.querySelector('.card');
      expect(card).toHaveStyle({ borderRadius: '20px' });
    });

    it('should use DaisyUI card components', () => {
      const data = createMockData();

      const { container } = render(<CompletionRatesCard data={data} />);

      expect(container.querySelector('.card')).toBeInTheDocument();
      expect(container.querySelector('.card-body')).toBeInTheDocument();
      expect(container.querySelector('.card-title')).toBeInTheDocument();
    });
  });
});
