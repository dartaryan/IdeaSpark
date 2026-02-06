// src/features/admin/components/analytics/SubmissionChart.tsx
// Story 0.5 Task 1: Implement SubmissionChart with Recharts

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { IdeaBreakdown } from '../../analytics/types';

/**
 * Code Review Fix: Proper typing for Recharts tooltip
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: IdeaBreakdown;
  }>;
}

/**
 * Subtask 1.2: Props interface for SubmissionChart
 */
interface SubmissionChartProps {
  data: IdeaBreakdown[];
  isLoading?: boolean;
}

/**
 * Subtask 1.1: SubmissionChart component
 * Displays idea submissions over time as an area chart
 */
export function SubmissionChart({ data, isLoading = false }: SubmissionChartProps) {
  // Subtask 1.7: Loading skeleton (match PipelineBreakdownChart pattern)
  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px', minHeight: '400px' }}>
        <div className="card-body p-6">
          <h2
            className="card-title text-xl mb-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Idea Submissions Over Time
          </h2>
          <div className="w-full h-[350px] flex items-center justify-center">
            <div data-testid="chart-skeleton" className="skeleton w-full h-full rounded-box"></div>
          </div>
        </div>
      </div>
    );
  }

  // Subtask 1.8: Empty state with "No data available" message
  if (!data || data.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px', minHeight: '400px' }}>
        <div className="card-body p-6">
          <h2
            className="card-title text-xl mb-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Idea Submissions Over Time
          </h2>
          <div className="w-full h-[350px] flex flex-col items-center justify-center text-base-content/60">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm mt-1">Submission trends will appear when ideas are submitted</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Subtask 1.5: Custom tooltip (match PipelineBreakdownChart pattern)
   * Code Review Fix: Added proper typing for type safety
   */
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload as IdeaBreakdown;
      return (
        <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{entry.period}</p>
          <p className="text-sm">
            <span className="font-medium">{entry.count}</span> submissions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    // Subtask 1.9: Card wrapper with 20px border radius and Montserrat/Rubik fonts
    <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px', minHeight: '400px' }}>
      <div className="card-body p-6">
        <h2
          className="card-title text-xl mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Idea Submissions Over Time
        </h2>
        <p
          className="text-sm mb-6"
          style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
        >
          Track the volume of idea submissions across different time periods
        </p>

        {/* Subtask 1.4: ResponsiveContainer wrapper (width 100%, height 350px) */}
        {/* Code Review Fix: Added accessibility attributes */}
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            role="img"
            aria-label="Area chart showing idea submissions over time by period"
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            {/* Subtask 1.5: CartesianGrid, XAxis, YAxis, Tooltip */}
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Subtask 1.3 & 1.6: Area with PassportCard primary color #E10514 */}
            <Area
              type="monotone"
              dataKey="count"
              stroke="#E10514"
              fill="#E10514"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
