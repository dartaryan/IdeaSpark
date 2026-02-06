// src/features/admin/components/analytics/CompletionRateChart.tsx
// Story 0.5 Task 2: Implement CompletionRateChart with Recharts

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PipelineStageData } from '../../analytics/types';

/**
 * Code Review Fix: Proper typing for Recharts tooltip
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PipelineStageData;
  }>;
}

/**
 * Subtask 2.2: Props interface for CompletionRateChart
 */
interface CompletionRateChartProps {
  data: PipelineStageData[];
  isLoading?: boolean;
}

/**
 * Subtask 2.1: CompletionRateChart component
 * Displays completion rate breakdowns by pipeline stage as a pie chart
 */
export function CompletionRateChart({ data, isLoading = false }: CompletionRateChartProps) {
  // Subtask 2.7: Loading skeleton (match PipelineBreakdownChart pattern)
  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px', minHeight: '400px' }}>
        <div className="card-body p-6">
          <h2
            className="card-title text-xl mb-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Completion Rate Breakdown
          </h2>
          <div className="w-full h-[350px] flex items-center justify-center">
            <div data-testid="chart-skeleton" className="skeleton w-full h-full rounded-box"></div>
          </div>
        </div>
      </div>
    );
  }

  // Subtask 2.8: Empty state with "No data available" message
  if (!data || data.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px', minHeight: '400px' }}>
        <div className="card-body p-6">
          <h2
            className="card-title text-xl mb-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Completion Rate Breakdown
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
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm mt-1">Completion breakdown will appear when ideas are submitted</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Subtask 2.5: Custom tooltip showing stage label, count, and percentage
   * Code Review Fix: Added proper typing for type safety
   */
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload as PipelineStageData;
      return (
        <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{entry.label}</p>
          <p className="text-sm">
            <span className="font-medium">{entry.count}</span> ideas ({entry.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    // Subtask 2.9: Card wrapper with 20px border radius and Montserrat/Rubik fonts
    <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px', minHeight: '400px' }}>
      <div className="card-body p-6">
        <h2
          className="card-title text-xl mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Completion Rate Breakdown
        </h2>
        <p
          className="text-sm mb-6"
          style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
        >
          Visualize the percentage of ideas reaching each pipeline stage
        </p>

        {/* Subtask 2.4: ResponsiveContainer wrapper (width 100%, height 350px) */}
        {/* Code Review Fix: Added accessibility attributes */}
        <ResponsiveContainer width="100%" height={350}>
          <PieChart
            role="img"
            aria-label="Pie chart showing completion rate breakdown by pipeline stage"
          >
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              label={({ label, percentage }) => `${label}: ${percentage}%`}
              labelLine={true}
            >
              {/* Subtask 2.3: Use existing color field from pipeline data */}
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {/* Subtask 2.5: Tooltip */}
            <Tooltip content={<CustomTooltip />} />
            {/* Subtask 2.6: Legend with stage color indicators */}
            <Legend
              iconType="circle"
              wrapperStyle={{ paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
