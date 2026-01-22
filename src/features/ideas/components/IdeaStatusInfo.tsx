import { IdeaStatusBadge } from './IdeaStatusBadge';
import type { Idea, IdeaStatus } from '../types';

interface IdeaStatusInfoProps {
  idea: Idea;
}

/**
 * Status next step messages mapping per AC 5
 */
const statusNextSteps: Record<IdeaStatus, string> = {
  submitted: 'Your idea is waiting for review by the innovation team.',
  approved: 'Congratulations! Your idea is approved. Start building your PRD.',
  prd_development: 'Your PRD is being developed.',
  prototype_complete: 'Your prototype is complete.',
  rejected: 'This idea was not approved. Check any feedback for details.',
};

/**
 * Format date according to AC 4 requirements
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Displays idea status information with badge, next steps, and timestamps
 * Implements AC 3, 4, 5
 */
export function IdeaStatusInfo({ idea }: IdeaStatusInfoProps) {
  const nextStepMessage = statusNextSteps[idea.status];

  return (
    <div className="card bg-base-100 border border-base-200">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Status</h3>
          <IdeaStatusBadge status={idea.status} />
        </div>
        
        <p className="text-base-content/70 text-sm mb-4">
          {nextStepMessage}
        </p>
        
        <div className="divider my-2"></div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/60">Submitted</span>
            <span>{formatDate(idea.created_at)}</span>
          </div>
          {idea.updated_at !== idea.created_at && (
            <div className="flex justify-between">
              <span className="text-base-content/60">Last Updated</span>
              <span>{formatDate(idea.updated_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
