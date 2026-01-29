// src/features/admin/components/analytics/MetricsCards.tsx
// Task 2: Create MetricsCards component for key statistics

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
import type { AnalyticsData } from '../../analytics/types';

interface MetricsCardsProps {
  analytics: AnalyticsData | undefined;
}

/**
 * Subtask 2.1: Create MetricsCards.tsx in features/admin/components/analytics/
 * Subtask 2.2: Design MetricCard component with icon, label, value, and trend indicator
 * 
 * MetricsCards component - displays key metric cards on the analytics dashboard
 */
export function MetricsCards({ analytics }: MetricsCardsProps) {
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

  // Subtask 2.3: Implement 4 placeholder metric cards
  const metrics = [
    {
      // Subtask 2.4: Use Heroicons for metric icons (light-bulb)
      icon: <LightBulbIcon className="w-12 h-12" style={{ color: '#E10514' }} />,
      label: 'Total Ideas',
      value: analytics.totalIdeas,
      trend: 'up' as const,
      // Subtask 2.6: Display trend percentage
      trendValue: '+12%',
      description: 'from last month',
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
        <MetricCard key={index} {...metric} />
      ))}
    </>
  );
}

/**
 * Subtask 2.2: MetricCard component with icon, label, value, and trend indicator
 * Individual metric card component
 */
function MetricCard({
  icon,
  label,
  value,
  trend,
  trendValue,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  description: string;
}) {
  // Subtask 2.5: Trend indicators: up arrow (green), down arrow (red), neutral dash (gray)
  const trendIcon = {
    up: <ArrowUpIcon className="w-4 h-4 text-green-600" />,
    down: <ArrowDownIcon className="w-4 h-4 text-red-600" />,
    neutral: <MinusIcon className="w-4 h-4" style={{ color: '#525355' }} />,
  }[trend];

  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: '#525355',
  }[trend];

  return (
    // Subtask 1.4: Use DaisyUI card components with PassportCard styling (20px border radius)
    // Subtask 2.9: Make cards clickable (future enhancement - disabled for now)
    <div 
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer" 
      style={{ borderRadius: '20px' }}
    >
      <div className="card-body p-6">
        {/* Icon */}
        <div className="mb-4">
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
        
        {/* Trend indicator - Subtask 2.6: Display trend percentage */}
        <div className="flex items-center gap-1">
          {trendIcon}
          <span 
            className={`text-sm font-medium ${typeof trendColor === 'string' && !trendColor.startsWith('#') ? trendColor : ''}`}
            style={{ 
              fontFamily: 'Rubik, sans-serif',
              color: typeof trendColor === 'string' && trendColor.startsWith('#') ? trendColor : undefined
            }}
          >
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
