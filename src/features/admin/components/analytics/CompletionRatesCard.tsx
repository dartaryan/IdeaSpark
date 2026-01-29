// src/features/admin/components/analytics/CompletionRatesCard.tsx
// Story 6.4 Task 4: Completion rates card with 2x2 grid of conversion metrics

import type { CompletionRates } from '../../analytics/types';
import { ConversionRateMetric } from './ConversionRateMetric';
import { RATE_HEALTH_THRESHOLDS } from '../../../../lib/constants';

interface CompletionRatesCardProps {
  /** Completion rates data with all conversion metrics */
  data: CompletionRates;
  /** Loading state */
  isLoading?: boolean;
  /** Click handler for drill-down functionality */
  onMetricClick?: (conversionType: string) => void;
}

/**
 * Story 6.4 Task 4: Display completion rates card with conversion metrics
 * Subtask 4.1-4.11: Shows 4 conversion rates in responsive grid with visual indicators
 */
export function CompletionRatesCard({ data, isLoading, onMetricClick }: CompletionRatesCardProps) {
  if (isLoading) {
    // Subtask 4.10: Loading skeleton
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
        <div className="card-body">
          <h2 className="card-title text-lg font-bold">Completion Rates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-base-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Subtask 4.11: Handle empty state
  if (!data) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
        <div className="card-body">
          <h2 className="card-title text-lg font-bold">Completion Rates</h2>
          <div className="flex items-center justify-center h-40 text-base-content/60">
            No data available
          </div>
        </div>
      </div>
    );
  }

  // Task 6: Detect low conversion rates (bottlenecks)
  // Subtask 6.1-6.2: Identify rates below critical threshold
  const getLowRates = () => {
    const lowRates: Array<{ label: string; rate: number; severity: 'critical' | 'warning' }> = [];

    const rates = [
      { label: 'Submitted → Approved', rate: data.submittedToApproved.rate },
      { label: 'Approved → PRD', rate: data.approvedToPrd.rate },
      { label: 'PRD → Prototype', rate: data.prdToPrototype.rate },
      { label: 'Overall', rate: data.overallSubmittedToPrototype.rate },
    ];

    rates.forEach(({ label, rate }) => {
      if (rate > 0 && rate < 25) {
        lowRates.push({ label, rate, severity: 'critical' });
      } else if (rate >= 25 && rate < 40) {
        lowRates.push({ label, rate, severity: 'warning' });
      }
    });

    return lowRates;
  };

  const lowRates = getLowRates();

  return (
    <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
      <div className="card-body">
        {/* Subtask 4.3: Display card title */}
        <h2 className="card-title text-lg font-bold">Completion Rates</h2>

        {/* Task 6 Subtask 6.5: Display alert message if any rate is critical */}
        {lowRates.length > 0 && (
          <div
            className={`alert ${
              lowRates.some((r) => r.severity === 'critical') ? 'alert-error' : 'alert-warning'
            } mt-2`}
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
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
              <div className="font-bold">
                ⚠️ Low conversion detected
                {/* Subtask 6.6: Tooltip explanation */}
              </div>
              <div className="text-sm">
                {lowRates.map((r, i) => (
                  <span key={i}>
                    {r.label} ({r.rate.toFixed(1)}%)
                    {i < lowRates.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Subtask 4.4: Grid layout for 4 conversion rate metrics */}
        {/* 2x2 on desktop, 1 column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Subtask 4.5-4.7: Display each conversion rate metric */}
          <ConversionRateMetric
            label="Submitted → Approved"
            data={data.submittedToApproved}
            onClick={
              onMetricClick ? () => onMetricClick('submittedToApproved') : undefined
            }
          />

          <ConversionRateMetric
            label="Approved → PRD Complete"
            data={data.approvedToPrd}
            onClick={onMetricClick ? () => onMetricClick('approvedToPrd') : undefined}
          />

          <ConversionRateMetric
            label="PRD → Prototype"
            data={data.prdToPrototype}
            onClick={onMetricClick ? () => onMetricClick('prdToPrototype') : undefined}
          />

          <ConversionRateMetric
            label="Overall (Submitted → Prototype)"
            data={data.overallSubmittedToPrototype}
            onClick={onMetricClick ? () => onMetricClick('overall') : undefined}
          />
        </div>

        {/* Subtask 4.8: DaisyUI card with PassportCard styling applied */}
        {/* (handled by card classes above) */}
      </div>
    </div>
  );
}
