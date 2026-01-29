// src/features/admin/components/analytics/PipelineBreakdownChart.tsx
// Story 6.3 Task 4: Create PipelineBreakdownChart component

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { PipelineStageData } from '../../analytics/types';

/**
 * Subtask 4.2: Props interface for PipelineBreakdownChart
 */
interface PipelineBreakdownChartProps {
  data: PipelineStageData[];
  isLoading?: boolean;
  onBarClick?: (status: string) => void;
}

/**
 * Subtask 4.1: PipelineBreakdownChart component
 * Displays ideas by pipeline stage as a bar chart
 * Subtask 4.10: Responsive chart that scales to container width
 */
export function PipelineBreakdownChart({ data, isLoading = false, onBarClick }: PipelineBreakdownChartProps) {
  // Subtask 4.11: Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div data-testid="chart-skeleton" className="skeleton w-full h-full rounded-box"></div>
      </div>
    );
  }

  // Subtask 4.12: Empty state
  if (!data || data.length === 0) {
    return (
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
        <p className="text-sm mt-1">Pipeline breakdown will appear when ideas are submitted</p>
      </div>
    );
  }

  // Task 9: Bottleneck Detection
  // Subtask 9.1 & 9.2: Calculate average and identify bottlenecks (>1.5x average)
  const totalIdeas = data.reduce((sum, stage) => sum + stage.count, 0);
  const averagePerStage = totalIdeas / data.length;
  const bottlenecks = data.filter(stage => stage.count > averagePerStage * 1.5);

  /**
   * Subtask 4.7: Handle bar click for drill-down
   */
  const handleBarClick = (entry: PipelineStageData) => {
    if (onBarClick) {
      onBarClick(entry.status);
    }
  };

  /**
   * Subtask 4.6: Custom tooltip showing count and percentage
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PipelineStageData;
      return (
        <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{data.label}</p>
          <p className="text-sm">
            <span className="font-medium">{data.count}</span> ideas ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Subtask 4.8: Chart title */}
      <h3 className="text-lg font-semibold mb-4">Ideas by Pipeline Stage</h3>

      {/* Task 9: Bottleneck Detection Alert */}
      {/* Subtask 9.4 & 9.5: Display bottleneck alert with warning */}
      {bottlenecks.length > 0 && (
        <div className="alert alert-warning mb-4" style={{ borderRadius: '12px' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <div className="font-semibold">
              ⚠️ Bottleneck detected: {bottlenecks[0].label} ({bottlenecks[0].count} ideas)
            </div>
            {/* Subtask 9.7: Add tooltip explanation */}
            <div className="text-xs opacity-80 mt-1">
              This stage has significantly more ideas than others
            </div>
          </div>
        </div>
      )}

      {/* Subtask 4.10: Responsive container with appropriate height */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          {/* Subtask 4.3: Grid and axes */}
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          
          {/* Subtask 4.4: X-axis with pipeline stage labels */}
          <XAxis
            dataKey="label"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          
          {/* Subtask 4.4: Y-axis with idea count */}
          <YAxis
            label={{ value: 'Number of Ideas', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          
          {/* Subtask 4.6: Tooltip with count and percentage */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          
          {/* Subtask 4.9: Legend showing status labels with colors */}
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          
          {/* Subtask 4.3 & 4.5: Bar chart with PassportCard colors */}
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            onClick={handleBarClick}
            cursor={onBarClick ? 'pointer' : 'default'}
          >
            {/* Subtask 4.5: Apply individual colors to each bar */}
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
