// src/features/admin/components/analytics/SubmissionChart.tsx
// Task 3: Create placeholder chart components
// Subtask 3.1: Create SubmissionChart.tsx placeholder

import { ChartBarIcon } from '@heroicons/react/24/outline';

/**
 * SubmissionChart component - placeholder for idea submissions chart
 * 
 * Features:
 * - Subtask 3.3: Display "Chart Coming Soon" message
 * - Subtask 3.4: Use DaisyUI card with proper dimensions (min-height: 400px)
 * - Subtask 3.5: Add chart title and description in card header
 * - Subtask 3.6: Apply PassportCard styling to chart containers
 * - Subtask 3.7: Ensure chart containers are responsive and maintain aspect ratio
 * - Subtask 3.8: Add empty state illustration or icon
 */
export function SubmissionChart() {
  return (
    // Subtask 3.4 & 3.6: DaisyUI card with PassportCard styling (20px border radius)
    <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px', minHeight: '400px' }}>
      <div className="card-body p-6">
        {/* Subtask 3.5: Chart title and description in card header */}
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

        {/* Subtask 3.3 & 3.8: Empty state with illustration */}
        <div className="flex flex-col items-center justify-center flex-1">
          <ChartBarIcon className="w-24 h-24 mb-4" style={{ color: '#525355', opacity: 0.3 }} />
          <p 
            className="text-lg font-medium" 
            style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
          >
            Chart Coming Soon
          </p>
          <p 
            className="text-sm mt-2 text-center max-w-md" 
            style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
          >
            This chart will display idea submission trends once implemented in a future story.
          </p>
        </div>
      </div>
    </div>
  );
}
