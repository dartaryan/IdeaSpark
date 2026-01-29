// Story 6.5 Task 4: TimeToDecisionCard component
// Subtask 4.1-4.11: Display time-to-decision metrics card

import React, { useState } from 'react';
import type { TimeToDecisionMetrics } from '../../analytics/types';
import { TimeMetricDisplay } from './TimeMetricDisplay';

/**
 * Subtask 4.2: TimeToDecisionCard props interface
 */
interface TimeToDecisionCardProps {
  data: TimeToDecisionMetrics | undefined; // Time metrics data
  isLoading?: boolean; // Loading state
}

/**
 * Story 6.5 Task 4 & Task 6: TimeToDecisionCard component with delay detection
 * Subtask 4.1: Create TimeToDecisionCard.tsx
 */
export function TimeToDecisionCard({ data, isLoading }: TimeToDecisionCardProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  // Task 6 Subtask 6.2-6.3: Identify metrics that are behind schedule
  const getSlowMetrics = () => {
    if (!data) return [];
    
    const metrics = [
      { key: 'submissionToDecision', label: 'Submission → Decision', ...data.submissionToDecision },
      { key: 'approvalToPrd', label: 'Approval → PRD', ...data.approvalToPrd },
      { key: 'prdToPrototype', label: 'PRD → Prototype', ...data.prdToPrototype },
      { key: 'endToEnd', label: 'End-to-End', ...data.endToEnd },
    ];

    return metrics.filter(m => m.benchmark.status === 'behind' && m.count > 0);
  };

  const slowMetrics = getSlowMetrics();
  const hasDelays = slowMetrics.length > 0;

  // Subtask 4.10: Loading skeleton
  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
        <div className="card-body">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Subtask 4.11: Empty state
  if (!data) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
        <div className="card-body">
          <h2 className="card-title text-lg font-semibold mb-4">Time-to-Decision Metrics</h2>
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        </div>
      </div>
    );
  }

  // Subtask 4.5: Handle metric click for drill-down (placeholder for Task 10)
  const handleMetricClick = (metricKey: string) => {
    // Subtask 10.1: Make each TimeMetricDisplay clickable
    // TODO: Implement drill-down modal (Task 10)
    console.log('Metric clicked:', metricKey);
    setExpandedMetric(expandedMetric === metricKey ? null : metricKey);
  };

  return (
    <div 
      className="card bg-base-100 shadow-xl" 
      style={{ borderRadius: '20px' }} // Subtask 4.8: 20px border radius
    >
      <div className="card-body">
        {/* Subtask 4.3: Display card title */}
        <h2 className="card-title text-lg font-semibold mb-4">
          Time-to-Decision Metrics
        </h2>

        {/* Task 6 Subtask 6.6: Display alert message if any metric is behind */}
        {hasDelays && (
          <div 
            className="alert alert-warning mb-4" 
            role="alert"
            aria-live="polite"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-semibold">⚠️ Processing delays detected:</span>
              <ul className="list-disc list-inside mt-1">
                {slowMetrics.map((metric) => (
                  <li key={metric.key}>
                    {metric.label}: {metric.formattedTime} 
                    (target: {metric.benchmark.targetDays} days)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Subtask 4.4: Create grid layout for 4 time metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subtask 4.5: Display each metric with label, time, trend, benchmark */}
          
          {/* Submission to Decision */}
          <TimeMetricDisplay
            label="Submission → Decision"
            metric={data.submissionToDecision}
            onClick={() => handleMetricClick('submissionToDecision')}
          />

          {/* Approval to PRD */}
          <TimeMetricDisplay
            label="Approval → PRD Complete"
            metric={data.approvalToPrd}
            onClick={() => handleMetricClick('approvalToPrd')}
          />

          {/* PRD to Prototype */}
          <TimeMetricDisplay
            label="PRD → Prototype"
            metric={data.prdToPrototype}
            onClick={() => handleMetricClick('prdToPrototype')}
          />

          {/* End-to-End */}
          <TimeMetricDisplay
            label="End-to-End (Idea → Prototype)"
            metric={data.endToEnd}
            onClick={() => handleMetricClick('endToEnd')}
          />
        </div>

        {/* Helpful note about benchmark targets */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Green: On track | Yellow: At risk | Red: Behind target</p>
          <p className="mt-1">Click any metric for detailed breakdown (coming soon)</p>
        </div>
      </div>
    </div>
  );
}
