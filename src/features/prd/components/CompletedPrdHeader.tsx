import { CheckBadgeIcon, EyeIcon } from '@heroicons/react/24/solid';
import { GeneratePrototypeButton } from './GeneratePrototypeButton';

interface CompletedPrdHeaderProps {
  prdId: string;
  ideaId: string;
  ideaTitle: string;
  completedAt: string;
  hasPrototype?: boolean;
  onViewPrd?: () => void;
}

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}

export function CompletedPrdHeader({
  prdId,
  ideaId,
  ideaTitle,
  completedAt,
  hasPrototype = false,
  onViewPrd,
}: CompletedPrdHeaderProps) {
  return (
    <div className="bg-success/10 border-b border-success/30 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-success/20">
            <CheckBadgeIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              PRD Complete
              <span className="badge badge-success">Finalized</span>
            </h2>
            <p className="text-sm text-base-content/60">
              {ideaTitle} • Completed {formatDistanceToNow(new Date(completedAt))}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onViewPrd && (
            <button className="btn btn-outline btn-sm gap-1" onClick={onViewPrd}>
              <EyeIcon className="w-4 h-4" />
              View PRD
            </button>
          )}
          {!hasPrototype && (
            <GeneratePrototypeButton prdId={prdId} ideaId={ideaId} />
          )}
        </div>
      </div>
    </div>
  );
}
