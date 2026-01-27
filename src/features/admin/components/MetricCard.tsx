// src/features/admin/components/MetricCard.tsx
// Task 3: Reusable metric card component for admin dashboard

import type { ReactNode } from 'react';

type MetricColor = 'gray' | 'blue' | 'yellow' | 'green';

interface MetricCardProps {
  /** Card title/label displayed above count */
  title: string;
  /** Numeric value to display prominently */
  count: number;
  /** Description text shown below count */
  description: string;
  /** Semantic color for the count (gray/blue/yellow/green) */
  color: MetricColor;
  /** Heroicon element with neutral gray (#525355) stroke */
  icon: ReactNode;
}

const colorStyles: Record<MetricColor, string> = {
  gray: '', // Default color (no special styling)
  blue: '#0284c7', // Sky blue for approved
  yellow: '#eab308', // Yellow for PRD development
  green: '#22c55e', // Green for prototype complete
};

/**
 * Reusable metric card component for admin dashboard
 * 
 * Features:
 * - Displays count prominently with semantic color
 * - Shows Heroicon with neutral gray (#525355)
 * - 20px border radius (PassportCard DSM)
 * - Montserrat font for count, Rubik for labels
 * - Responsive card layout
 */
export function MetricCard({ title, count, description, color, icon }: MetricCardProps) {
  const countColor = colorStyles[color];

  return (
    <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            {/* Title - Subtask 3.5 (label) */}
            <p
              className="text-base-content/60 text-sm font-medium"
              style={{ fontFamily: 'Rubik, sans-serif' }}
            >
              {title}
            </p>
            
            {/* Count - Subtask 3.5 (prominent display) with Subtask 3.3 (semantic color) */}
            <p
              className="text-4xl font-bold mt-2"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                ...(countColor && { color: countColor }),
              }}
            >
              {count}
            </p>
          </div>
          
          {/* Icon - Subtask 3.4 (Heroicons with neutral gray) */}
          <div className="flex-shrink-0">
            {icon}
          </div>
        </div>
        
        {/* Description */}
        <p
          className="text-xs text-base-content/50 mt-2"
          style={{ fontFamily: 'Rubik, sans-serif' }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
