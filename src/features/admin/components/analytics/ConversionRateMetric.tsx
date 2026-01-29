// src/features/admin/components/analytics/ConversionRateMetric.tsx
// Story 6.4 Task 5: Individual conversion rate metric display component

import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import type { ConversionRate } from '../../analytics/types';
import { RATE_HEALTH_THRESHOLDS } from '../../../../lib/constants';

interface ConversionRateMetricProps {
  /** Display label for the conversion (e.g., "Submitted → Approved") */
  label: string;
  /** Conversion rate data including rate, trend, counts */
  data: ConversionRate;
  /** Optional click handler for drill-down functionality */
  onClick?: () => void;
}

/**
 * Story 6.4 Task 5: Display individual conversion rate metric
 * Subtask 5.1-5.11: Shows rate, trend, health indicator, and count ratio
 */
export function ConversionRateMetric({ label, data, onClick }: ConversionRateMetricProps) {
  const { rate, trend, count, totalCount } = data;

  // Subtask 5.5: Color coding for rate health
  const getHealthColor = (rate: number): { bg: string; text: string; border: string } => {
    if (rate >= RATE_HEALTH_THRESHOLDS.excellent) {
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    } else if (rate >= RATE_HEALTH_THRESHOLDS.good) {
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    } else if (rate > 0) {
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    } else {
      return { bg: 'bg-base-200', text: 'text-base-content', border: 'border-base-300' };
    }
  };

  // Subtask 5.6: Trend indicator with icon
  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up':
        return <ArrowUpIcon className="w-4 h-4 text-success" aria-label="Trending up" />;
      case 'down':
        return <ArrowDownIcon className="w-4 h-4 text-error" aria-label="Trending down" />;
      case 'neutral':
      default:
        return <ArrowRightIcon className="w-4 h-4 text-base-content/50" aria-label="No change" />;
    }
  };

  // Subtask 5.7: Format trend change display
  const getTrendChangeText = () => {
    if (trend.direction === 'neutral') {
      return '—';
    }
    const sign = trend.change > 0 ? '+' : '';
    return `${sign}${trend.change.toFixed(1)}%`;
  };

  const healthColors = getHealthColor(rate);

  // Subtask 5.11: Tooltip with explanation
  const tooltipText = `${label}: Measures how many ideas successfully progress from one stage to the next. Current rate: ${rate.toFixed(1)}% (${count} of ${totalCount} ideas).`;

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 transition-all
        ${healthColors.bg} ${healthColors.border}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}
      `}
      onClick={onClick}
      onKeyDown={(e) => {
        // Subtask 5.3 & 15.3: Keyboard navigation support
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${label} conversion rate: ${rate.toFixed(1)}%, trending ${trend.direction} by ${trend.change.toFixed(1)}%`}
      title={tooltipText}
    >
      {/* Subtask 5.3: Display metric label */}
      <div className="text-sm font-medium text-base-content/70 mb-2">
        {label}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        {/* Subtask 5.4: Display percentage prominently */}
        <div className={`text-3xl font-bold ${healthColors.text}`}>
          {totalCount === 0 ? 'N/A' : `${rate.toFixed(1)}%`}
        </div>

        {/* Subtask 5.6 & 5.7: Trend indicator and change */}
        {totalCount > 0 && (
          <div className="flex items-center gap-1 text-sm">
            {getTrendIcon()}
            <span
              className={
                trend.direction === 'up'
                  ? 'text-success'
                  : trend.direction === 'down'
                  ? 'text-error'
                  : 'text-base-content/50'
              }
            >
              {getTrendChangeText()}
            </span>
          </div>
        )}
      </div>

      {/* Subtask 5.8: Display count ratio below rate */}
      <div className="mt-2 text-xs text-base-content/60">
        {totalCount === 0 ? (
          'No data available'
        ) : (
          <>
            <span className="font-semibold">{count}</span> of{' '}
            <span className="font-semibold">{totalCount}</span> ideas
          </>
        )}
      </div>

      {/* Subtask 15.2: Color is not the only indicator - add text */}
      {totalCount > 0 && (
        <div className="mt-1 text-xs font-medium">
          {rate >= RATE_HEALTH_THRESHOLDS.excellent && (
            <span className="text-emerald-600">✓ Healthy</span>
          )}
          {rate >= RATE_HEALTH_THRESHOLDS.good &&
            rate < RATE_HEALTH_THRESHOLDS.excellent && (
              <span className="text-amber-600">⚠ Needs Attention</span>
            )}
          {rate < RATE_HEALTH_THRESHOLDS.good && rate > 0 && (
            <span className="text-red-600">⚠ Critical</span>
          )}
        </div>
      )}
    </div>
  );
}
