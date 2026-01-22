import type { PrdSectionStatus } from '../types';

interface SectionStatusBadgeProps {
  status: PrdSectionStatus;
}

const statusConfig: Record<PrdSectionStatus, { label: string; className: string }> = {
  empty: { label: 'Empty', className: 'badge-ghost' },
  in_progress: { label: 'In Progress', className: 'badge-warning' },
  complete: { label: 'Complete', className: 'badge-success' },
};

export function SectionStatusBadge({ status }: SectionStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.empty;
  
  return (
    <span className={`badge badge-sm ${config.className}`}>
      {config.label}
    </span>
  );
}
