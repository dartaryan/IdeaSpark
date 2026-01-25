import { CheckCircleIcon, PencilSquareIcon, DocumentIcon } from '@heroicons/react/24/outline';
import type { PrdSectionStatus } from '../../../types/database';

interface SectionStatusBadgeProps {
  status: PrdSectionStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<PrdSectionStatus, {
  label: string;
  className: string;
  icon: typeof CheckCircleIcon;
}> = {
  empty: {
    label: 'Not Started',
    className: 'badge-ghost text-base-content/50',
    icon: DocumentIcon,
  },
  in_progress: {
    label: 'In Progress',
    className: 'badge-warning',
    icon: PencilSquareIcon,
  },
  complete: {
    label: 'Complete',
    className: 'badge-success',
    icon: CheckCircleIcon,
  },
};

export function SectionStatusBadge({ status, size = 'sm' }: SectionStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'badge-sm' : '';

  return (
    <span className={`badge gap-1 ${config.className} ${sizeClass}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </span>
  );
}
