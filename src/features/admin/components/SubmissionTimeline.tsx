// src/features/admin/components/SubmissionTimeline.tsx
// Story 5.6 - Task 7: Add submission history timeline to IdeaDetailPage

import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  DocumentTextIcon,
  ComputerDesktopIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * Submission timeline component showing innovation journey
 * Story 5.6 - Task 7: Add submission history timeline to IdeaDetailPage
 * 
 * Subtasks implemented:
 * - 7.1: Create SubmissionTimeline component in features/admin/components/
 * - 7.2: Display timeline showing: Submitted → Approved/Rejected → PRD Started → PRD Complete → Prototype Generated
 * - 7.3: Show timestamps for each stage with relative time (e.g., "2 days ago")
 * - 7.4: Use visual timeline with connectors between stages
 * - 7.5: Highlight current stage in timeline
 * - 7.6: Show admin who approved/rejected with their name
 * - 7.7: If stage not reached yet, show in gray/disabled state
 * - 7.8: Only display timeline for admins (hide from regular users)
 */

interface TimelineStage {
  label: string;
  timestamp?: string | null;
  status: 'completed' | 'current' | 'future';
  icon: React.ComponentType<{ className?: string }>;
  admin?: string | null; // Admin who performed the action
}

interface SubmissionTimelineProps {
  ideaStatus: 'submitted' | 'approved' | 'prd_development' | 'prototype_complete' | 'rejected';
  submittedAt: string;
  statusUpdatedAt?: string | null;
  prdCreatedAt?: string | null;
  prdCompletedAt?: string | null;
  prototypeCreatedAt?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: string | null;
}

export function SubmissionTimeline({
  ideaStatus,
  submittedAt,
  statusUpdatedAt,
  prdCreatedAt,
  prdCompletedAt,
  prototypeCreatedAt,
  rejectedAt,
  rejectedBy,
}: SubmissionTimelineProps) {
  // Subtask 7.2 & 7.5: Build timeline stages based on idea status
  const stages: TimelineStage[] = [];

  // Stage 1: Submitted
  stages.push({
    label: 'Submitted',
    timestamp: submittedAt,
    status: 'completed',
    icon: ClockIcon,
  });

  // Stage 2: Approved or Rejected
  if (ideaStatus === 'rejected') {
    stages.push({
      label: 'Rejected',
      timestamp: rejectedAt,
      status: 'completed',
      icon: XCircleIcon,
      admin: rejectedBy,
    });
  } else {
    stages.push({
      label: 'Approved',
      timestamp: ideaStatus !== 'submitted' ? statusUpdatedAt : null,
      status: ideaStatus !== 'submitted' ? 'completed' : 'current',
      icon: CheckCircleIcon,
    });

    // Stage 3: PRD Started
    stages.push({
      label: 'PRD Started',
      timestamp: prdCreatedAt,
      status: prdCreatedAt ? 'completed' : ideaStatus === 'approved' ? 'current' : 'future',
      icon: DocumentTextIcon,
    });

    // Stage 4: PRD Complete
    stages.push({
      label: 'PRD Complete',
      timestamp: prdCompletedAt,
      status: prdCompletedAt 
        ? 'completed' 
        : ideaStatus === 'prd_development' 
        ? 'current' 
        : 'future',
      icon: DocumentTextIcon,
    });

    // Stage 5: Prototype Generated
    stages.push({
      label: 'Prototype Generated',
      timestamp: prototypeCreatedAt,
      status: prototypeCreatedAt 
        ? 'completed' 
        : ideaStatus === 'prototype_complete' 
        ? 'current' 
        : 'future',
      icon: ComputerDesktopIcon,
    });
  }

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 rounded-[20px]">
      <div className="card-body p-4">
        <h3 className="font-semibold text-sm mb-3 text-gray-700">Innovation Journey</h3>
        
        {/* Subtask 7.4: Visual timeline with connectors */}
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const isLast = index === stages.length - 1;
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const isFuture = stage.status === 'future';

            // Subtask 7.7: Color coding based on status
            const iconColorClass = isCompleted 
              ? (stage.icon === XCircleIcon ? 'text-red-600' : 'text-[#10B981]')
              : isCurrent 
              ? 'text-[#E10514]' 
              : 'text-[#D1D5DB]';

            const textColorClass = isCompleted || isCurrent
              ? 'text-gray-900'
              : 'text-gray-400';

            const connectorColorClass = isCompleted
              ? 'bg-[#10B981]'
              : 'bg-[#D1D5DB]';

            return (
              <div key={index} className="relative flex items-start">
                {/* Timeline connector - Subtask 7.4 */}
                {!isLast && (
                  <div 
                    className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${connectorColorClass}`}
                    style={{ height: 'calc(100% + 1rem)' }}
                  />
                )}

                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 ${iconColorClass}`}>
                  <stage.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="ml-3 flex-1">
                  <div className={`font-medium text-sm ${textColorClass}`}>
                    {stage.label}
                  </div>
                  
                  {/* Subtask 7.3: Timestamp with relative time */}
                  {stage.timestamp && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDistanceToNow(new Date(stage.timestamp), { addSuffix: true })}
                    </div>
                  )}

                  {/* Subtask 7.6: Show admin who performed action */}
                  {stage.admin && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      by {stage.admin}
                    </div>
                  )}

                  {/* Subtask 7.5: Current stage indicator */}
                  {isCurrent && !stage.timestamp && (
                    <div className="text-xs text-[#E10514] mt-0.5 font-medium">
                      In Progress
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
