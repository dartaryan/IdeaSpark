// src/features/admin/components/analytics/MetricsCards.tsx
// Task 2: Create MetricsCards component for key statistics

import { cloneElement } from 'react';
import { 
  LightBulbIcon, 
  ChartBarIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon 
} from '@heroicons/react/24/solid';
import { formatDateRange } from '../../../../lib/utils'; // Story 6.7 Task 8
import type { AnalyticsData } from '../../analytics/types';
import type { DateRange } from '../../types'; // Story 6.7 Task 8

interface MetricsCardsProps {
  analytics: AnalyticsData | undefined;
  onTotalIdeasClick?: () => void; // Task 7: Make Total Ideas card clickable
  dateRange: DateRange; // Story 6.7 Task 8 Subtask 8.1: Add dateRange prop
}

/**
 * Subtask 2.1: Create MetricsCards.tsx in features/admin/components/analytics/
 * Subtask 2.2: Design MetricCard component with icon, label, value, and trend indicator
 * Task 7: Add click interaction for Total Ideas metric card
 * Story 6.7 Task 8: Add date range display to metric cards
 * 
 * MetricsCards component - displays key metric cards on the analytics dashboard
 */
export function MetricsCards({ analytics, onTotalIdeasClick, dateRange }: MetricsCardsProps) {
  // Subtask 2.8: Loading skeleton state for metric cards
  if (!analytics) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card bg-base-100 shadow-xl animate-pulse" style={{ borderRadius: '20px' }}>
            <div className="card-body p-6">
              <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  // Subtask 3.3 & 3.4: Calculate trend from analytics data
  const getTrend = (percentage: number): 'up' | 'down' | 'neutral' => {
    if (percentage > 0) return 'up';
    if (percentage < 0) return 'down';
    return 'neutral';
  };

  const formatTrendValue = (percentage: number): string => {
    if (percentage === 0) return '0%';
    return percentage > 0 ? `+${percentage}%` : `${percentage}%`;
  };

  // Metric cards configuration (Total Ideas uses computed trend; others are static)
  const metrics = [
    {
      // Subtask 2.4: Use Heroicons for metric icons (light-bulb)
      icon: <LightBulbIcon className="w-12 h-12" style={{ color: '#E10514' }} />,
      label: 'Total Ideas',
      value: analytics.totalIdeas,
      // Subtask 3.2 & 3.3: Display real trend from analytics
      trend: getTrend(analytics.trendPercentage),
      // Subtask 3.4: Format trend with proper sign and color
      trendValue: formatTrendValue(analytics.trendPercentage),
      // Subtask 3.5: Show trend context
      description: 'from last 30 days',
    },
    {
      // Subtask 2.4: chart-bar icon
      icon: <ChartBarIcon className="w-12 h-12" style={{ color: '#E10514' }} />,
      label: 'Pipeline Stages',
      value: analytics.pipelineBreakdown.length,
      trend: 'neutral' as const,
      trendValue: '0%',
      description: 'active stages',
    },
    {
      // Subtask 2.4: check-circle icon
      icon: <CheckCircleIcon className="w-12 h-12" style={{ color: '#E10514' }} />,
      label: 'Completion Rate',
      // Subtask 2.7: Apply PassportCard red (#E10514) for primary metric values
      value: `${analytics.completionRate}%`,
      trend: 'up' as const,
      trendValue: '+5%',
      description: 'from last month',
    },
    {
      // Subtask 2.4: clock icon
      icon: <ClockIcon className="w-12 h-12" style={{ color: '#E10514' }} />,
      label: 'Avg Time',
      value: `${analytics.timeMetrics.avgTimeToPrototype}d`,
      trend: 'down' as const,
      trendValue: '-2d',
      description: 'to prototype',
    },
  ];

  return (
    <>
      {metrics.map((metric, index) => (
        <MetricCard 
          key={index} 
          {...metric} 
          onClick={index === 0 ? onTotalIdeasClick : undefined}
          isClickable={index === 0 && !!onTotalIdeasClick}
          dateRange={dateRange} // Story 6.7 Task 8: Pass dateRange to each card
        />
      ))}
    </>
  );
}

/**
 * Subtask 2.2: MetricCard component with icon, label, value, and trend indicator
 * Task 7: Add click interaction and keyboard accessibility
 * Story 6.7 Task 8: Add date range display to cards
 * Individual metric card component
 */
function MetricCard({
  icon,
  label,
  value,
  trend,
  trendValue,
  description,
  onClick,
  isClickable = false,
  dateRange, // Story 6.7 Task 8 Subtask 8.1: Accept dateRange prop
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  description: string;
  onClick?: () => void;
  isClickable?: boolean;
  dateRange: DateRange; // Story 6.7 Task 8
}) {
  // Subtask 2.5: Trend indicators: up arrow (green), down arrow (red), neutral dash (gray)
  // Task 13: Add aria-hidden to decorative icons
  const trendIcon = {
    up: <ArrowUpIcon className="w-4 h-4 text-green-600" aria-hidden="true" />,
    down: <ArrowDownIcon className="w-4 h-4 text-red-600" aria-hidden="true" />,
    neutral: <MinusIcon className="w-4 h-4" style={{ color: '#525355' }} aria-hidden="true" />,
  }[trend];

  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: '#525355',
  }[trend];

  // Task 7: Handle keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    // Subtask 1.4: Use DaisyUI card components with PassportCard styling (20px border radius)
    // Task 7: Make Total Ideas card clickable with keyboard support
    // Task 13: Add focus indicator for keyboard navigation
    <div 
      className={`card bg-base-100 shadow-xl transition-all ${
        isClickable ? 'hover:shadow-2xl hover:scale-105 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:outline-none' : ''
      }`}
      style={{ 
        borderRadius: '20px',
        ...(isClickable ? { '--tw-ring-color': '#E10514' } as any : {})
      }}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={isClickable ? `${label}: ${value}. Click to see detailed breakdown` : undefined}
    >
      <div className="card-body p-6">
        {/* Icon - Task 13: Mark as decorative for screen readers */}
        <div className="mb-4" aria-hidden="true">
          {icon}
        </div>
        
        {/* Label */}
        <h3 
          className="text-sm font-medium mb-2" 
          style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
        >
          {label}
        </h3>
        
        {/* Value - Subtask 2.7: PassportCard red for primary values */}
        <p 
          className="text-3xl font-bold mb-2" 
          style={{ fontFamily: 'Montserrat, sans-serif', color: '#E10514' }}
        >
          {value}
        </p>
        
        {/* Story 6.7 Task 8 Subtask 8.2-8.3: Date range subtitle */}
        <p 
          className="text-xs mb-2" 
          style={{ fontFamily: 'Rubik, sans-serif', color: '#9CA3AF' }}
          title="Data filtered by selected date range"
        >
          For period: {formatDateRange(dateRange)}
        </p>
        
        {/* Trend indicator - Subtask 2.6: Display trend percentage */}
        {/* Task 13: Add screen reader text for trend direction */}
        <div className="flex items-center gap-1">
          {trendIcon}
          <span 
            className={`text-sm font-medium ${typeof trendColor === 'string' && !trendColor.startsWith('#') ? trendColor : ''}`}
            style={{ 
              fontFamily: 'Rubik, sans-serif',
              color: typeof trendColor === 'string' && trendColor.startsWith('#') ? trendColor : undefined
            }}
          >
            {/* Screen reader text for trend direction */}
            <span className="sr-only">
              {trend === 'up' ? 'Increase of ' : trend === 'down' ? 'Decrease of ' : 'No change, '}
            </span>
            {trendValue}
          </span>
          <span 
            className="text-sm ml-1" 
            style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
          >
            {description}
          </span>
        </div>
      </div>
    </div>
  );
}
