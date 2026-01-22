import type { IdeaStatus } from '../types';

interface IdeaStatusBadgeProps {
  status: IdeaStatus;
}

/**
 * Status badge configuration with color mapping
 * Colors aligned with AC 3:
 * - submitted = gray (neutral)
 * - approved = blue (info)
 * - prd_development = yellow (warning)
 * - prototype_complete = green (success)
 * - rejected = red (error)
 */
const statusConfig: Record<IdeaStatus, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'badge-neutral' },
  approved: { label: 'Approved', className: 'badge-info' },
  prd_development: { label: 'PRD Development', className: 'badge-warning' },
  prototype_complete: { label: 'Prototype Complete', className: 'badge-success' },
  rejected: { label: 'Rejected', className: 'badge-error' },
};

/**
 * Displays a color-coded status badge for an idea
 * Uses DaisyUI badge classes for consistent styling
 */
export function IdeaStatusBadge({ status }: IdeaStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'badge-ghost' };

  return (
    <span className={`badge ${config.className}`} data-testid="idea-status-badge">
      {config.label}
    </span>
  );
}
