// Story 6.5 Task 5: TimeMetricDisplay component for individual metric display
// Subtask 5.1-5.12: Display time metric with trend, benchmark, and visual indicators

import React from 'react';
import type { TimeMetric } from '../../analytics/types';

/**
 * Subtask 5.2: TimeMetricDisplay props interface
 */
interface TimeMetricDisplayProps {
  label: string; // Metric label (e.g., "Submission → Decision")
  metric: TimeMetric; // Time metric data
  onClick?: () => void; // Subtask 5.11: Optional click handler for drill-down
}

/**
 * Story 6.5 Task 5: TimeMetricDisplay component
 * Subtask 5.1: Display individual time metric with visual indicators
 */
export function TimeMetricDisplay({ label, metric, onClick }: TimeMetricDisplayProps) {
  // Subtask 5.5: Color coding for benchmark status
  const getBenchmarkColor = (): string => {
    switch (metric.benchmark.status) {
      case 'on-track':
        return 'bg-green-50 border-green-200 text-green-900'; // Green
      case 'at-risk':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'; // Yellow
      case 'behind':
        return 'bg-red-50 border-red-200 text-red-900'; // Red
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'; // Gray (N/A)
    }
  };

  // Subtask 5.6: Trend indicator with icon
  const getTrendIcon = (): string => {
    switch (metric.trend.direction) {
      case 'down':
        return '↓'; // Improvement (shorter time)
      case 'up':
        return '↑'; // Worsening (longer time)
      case 'neutral':
      default:
        return '→'; // No significant change
    }
  };

  // Subtask 5.6: Trend color (down=green for time, up=red, neutral=gray)
  const getTrendColor = (): string => {
    switch (metric.trend.direction) {
      case 'down':
        return 'text-green-600'; // Improvement
      case 'up':
        return 'text-red-600'; // Worsening
      case 'neutral':
      default:
        return 'text-gray-600'; // Neutral
    }
  };

  // Subtask 5.7: Format trend change display
  const formatTrendChange = (): string => {
    const change = metric.trend.change;
    if (change === 0) return '0 days';
    
    const sign = change > 0 ? '+' : '';
    const formattedChange = change.toFixed(1);
    // Only use singular "day" for exactly 1.0 or -1.0, but show as "days" for display consistency
    return `${sign}${formattedChange} days`;
  };

  // Subtask 5.8: Format benchmark comparison
  const formatBenchmarkComparison = (): string => {
    const diff = metric.averageDays - metric.benchmark.targetDays;
    if (diff < 0) {
      return `${Math.abs(diff).toFixed(1)} day${Math.abs(diff) === 1 ? '' : 's'} faster than target`;
    } else if (diff > 0) {
      return `${diff.toFixed(1)} day${diff === 1 ? '' : 's'} behind target`;
    }
    return 'On target';
  };

  // Subtask 5.10: Subtle background color based on benchmark status
  const containerClasses = `
    relative p-4 rounded-lg border-2 transition-all duration-200
    ${getBenchmarkColor()}
    ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}
  `;

  // Subtask 5.12: Tooltip with explanation
  const getTooltipText = (): string => {
    return `Average time for ${label} based on ${metric.count} ideas. Target: ${metric.benchmark.targetDays} days.`;
  };

  return (
    <div
      className={containerClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      title={getTooltipText()} // Subtask 5.12: Tooltip
      aria-label={`${label}: ${metric.formattedTime}, ${formatBenchmarkComparison()}`}
    >
      {/* Subtask 5.3: Display metric label */}
      <div className="text-sm font-medium mb-2">
        {label}
      </div>

      {/* Subtask 5.4: Display average time prominently */}
      <div className="text-3xl font-bold mb-2">
        {metric.formattedTime}
      </div>

      {/* Subtask 5.6 & 5.7: Trend indicator with change */}
      {metric.count > 0 && (
        <div className={`flex items-center gap-2 text-sm ${getTrendColor()} mb-1`}>
          <span className="text-lg font-semibold">{getTrendIcon()}</span>
          <span>{formatTrendChange()} vs last period</span>
        </div>
      )}

      {/* Subtask 5.8: Benchmark comparison */}
      {metric.count > 0 && (
        <div className="text-sm font-medium mb-1">
          {formatBenchmarkComparison()}
        </div>
      )}

      {/* Subtask 5.9: Show sample size */}
      <div className="text-xs text-gray-600 mt-2">
        Based on {metric.count} idea{metric.count === 1 ? '' : 's'}
      </div>

      {/* Empty state message */}
      {metric.count === 0 && (
        <div className="text-sm text-gray-500 mt-2">
          No data available for this period
        </div>
      )}
    </div>
  );
}
