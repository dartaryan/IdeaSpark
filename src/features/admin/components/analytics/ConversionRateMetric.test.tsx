// src/features/admin/components/analytics/ConversionRateMetric.test.tsx
// Story 6.4 Task 12: Comprehensive tests for ConversionRateMetric component
// Subtask 12.10-12.12: Component rendering, color coding, interaction tests

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversionRateMetric } from './ConversionRateMetric';
import type { ConversionRate } from '../../analytics/types';

describe('ConversionRateMetric', () => {
  const createMockData = (rate: number, trendDirection: 'up' | 'down' | 'neutral', change: number): ConversionRate => ({
    rate,
    trend: {
      direction: trendDirection,
      change,
      changePercentage: change > 0 ? (change / rate) * 100 : 0,
    },
    count: Math.round(rate),
    totalCount: 100,
  });

  describe('rendering', () => {
    it('should display label, rate, and count ratio', () => {
      // Subtask 12.11: Test metric displays rate, trend, and count correctly
      const data = createMockData(75, 'up', 5);

      render(
        <ConversionRateMetric
          label="Submitted → Approved"
          data={data}
        />
      );

      expect(screen.getByText('Submitted → Approved')).toBeInTheDocument();
      expect(screen.getByText('75.0%')).toBeInTheDocument();
      // Text is split across multiple elements, so check parts individually
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText(/of/)).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText(/ideas/)).toBeInTheDocument();
    });

    it('should show N/A when totalCount is 0', () => {
      // Subtask 12.11: Test edge case display
      const data: ConversionRate = {
        rate: 0,
        trend: { direction: 'neutral', change: 0, changePercentage: 0 },
        count: 0,
        totalCount: 0,
      };

      render(
        <ConversionRateMetric
          label="Test Conversion"
          data={data}
        />
      );

      expect(screen.getByText('N/A')).toBeInTheDocument();
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should display trend indicator correctly', () => {
      // Subtask 12.11: Test trend display
      const dataUp = createMockData(75, 'up', 5);

      const { rerender } = render(
        <ConversionRateMetric
          label="Test"
          data={dataUp}
        />
      );

      expect(screen.getByText('+5.0%')).toBeInTheDocument();
      expect(screen.getByLabelText('Trending up')).toBeInTheDocument();

      // Test down trend
      const dataDown = createMockData(65, 'down', -5);
      rerender(
        <ConversionRateMetric
          label="Test"
          data={dataDown}
        />
      );

      expect(screen.getByText('-5.0%')).toBeInTheDocument();
      expect(screen.getByLabelText('Trending down')).toBeInTheDocument();

      // Test neutral trend
      const dataNeutral = createMockData(70, 'neutral', 1);
      rerender(
        <ConversionRateMetric
          label="Test"
          data={dataNeutral}
        />
      );

      expect(screen.getByText('—')).toBeInTheDocument();
      expect(screen.getByLabelText('No change')).toBeInTheDocument();
    });
  });

  describe('color coding', () => {
    it('should apply green styling for excellent rates (>70%)', () => {
      // Subtask 12.12: Test color coding for different rate ranges
      const data = createMockData(80, 'up', 5);

      render(
        <ConversionRateMetric
          label="Test"
          data={data}
        />
      );

      expect(screen.getByText('✓ Healthy')).toBeInTheDocument();
    });

    it('should apply yellow styling for warning rates (40-70%)', () => {
      // Subtask 12.12: Test warning color coding
      const data = createMockData(55, 'neutral', 0);

      render(
        <ConversionRateMetric
          label="Test"
          data={data}
        />
      );

      expect(screen.getByText('⚠ Needs Attention')).toBeInTheDocument();
    });

    it('should apply red styling for critical rates (<40%)', () => {
      // Subtask 12.12: Test critical color coding
      const data = createMockData(25, 'down', -10);

      render(
        <ConversionRateMetric
          label="Test"
          data={data}
        />
      );

      expect(screen.getByText('⚠ Critical')).toBeInTheDocument();
    });

    it('should not show health indicator when totalCount is 0', () => {
      const data: ConversionRate = {
        rate: 0,
        trend: { direction: 'neutral', change: 0, changePercentage: 0 },
        count: 0,
        totalCount: 0,
      };

      render(
        <ConversionRateMetric
          label="Test"
          data={data}
        />
      );

      expect(screen.queryByText(/Healthy|Needs Attention|Critical/)).not.toBeInTheDocument();
    });
  });

  describe('interactivity', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const data = createMockData(75, 'up', 5);

      render(
        <ConversionRateMetric
          label="Test"
          data={data}
          onClick={handleClick}
        />
      );

      const metric = screen.getByRole('button');
      await user.click(metric);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const data = createMockData(75, 'up', 5);

      render(
        <ConversionRateMetric
          label="Test"
          data={data}
          onClick={handleClick}
        />
      );

      const metric = screen.getByRole('button');
      metric.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Space key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const data = createMockData(75, 'up', 5);

      render(
        <ConversionRateMetric
          label="Test"
          data={data}
          onClick={handleClick}
        />
      );

      const metric = screen.getByRole('button');
      metric.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable when onClick is not provided', () => {
      const data = createMockData(75, 'up', 5);

      render(
        <ConversionRateMetric
          label="Test"
          data={data}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA label', () => {
      const data = createMockData(75, 'up', 5);

      render(
        <ConversionRateMetric
          label="Submitted → Approved"
          data={data}
          onClick={() => {}}
        />
      );

      const metric = screen.getByRole('button');
      expect(metric).toHaveAttribute('aria-label');
      expect(metric.getAttribute('aria-label')).toContain('Submitted → Approved');
      expect(metric.getAttribute('aria-label')).toContain('75.0%');
    });

    it('should be keyboard navigable when clickable', () => {
      const data = createMockData(75, 'up', 5);

      render(
        <ConversionRateMetric
          label="Test"
          data={data}
          onClick={() => {}}
        />
      );

      const metric = screen.getByRole('button');
      expect(metric).toHaveAttribute('tabIndex', '0');
    });

    it('should not be keyboard navigable when not clickable', () => {
      const data = createMockData(75, 'up', 5);

      render(
        <ConversionRateMetric
          label="Test"
          data={data}
        />
      );

      const container = screen.getByText('Test').parentElement;
      expect(container).not.toHaveAttribute('tabIndex');
    });
  });
});
