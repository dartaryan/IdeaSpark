import type { PrdSectionStatus } from '../types';

interface PrdSectionProps {
  title: string;
  content: string;
  status: PrdSectionStatus;
  isHighlighted?: boolean;
}

const statusConfig: Record<PrdSectionStatus, { badge: string; badgeClass: string }> = {
  empty: { badge: 'Empty', badgeClass: 'badge-ghost' },
  in_progress: { badge: 'In Progress', badgeClass: 'badge-warning' },
  complete: { badge: 'Complete', badgeClass: 'badge-success' },
};

export function PrdSection({ title, content, status, isHighlighted }: PrdSectionProps) {
  const { badge, badgeClass } = statusConfig[status];

  return (
    <div
      className={`card bg-base-100 border transition-all duration-300 ${
        isHighlighted
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-base-200'
      }`}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-base">{title}</h3>
          <span className={`badge badge-sm ${badgeClass}`}>{badge}</span>
        </div>

        {/* Content */}
        {content ? (
          <div className="prose prose-sm max-w-none text-base-content/80">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        ) : (
          <p className="text-base-content/40 text-sm italic">
            This section will be filled as you chat with the AI assistant.
          </p>
        )}
      </div>
    </div>
  );
}
