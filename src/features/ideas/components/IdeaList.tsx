import { IdeaCard } from './IdeaCard';
import type { Idea } from '../types';

interface IdeaListProps {
  ideas: Idea[];
}

/**
 * Renders a list of idea cards
 * Uses CSS Grid for consistent spacing
 */
export function IdeaList({ ideas }: IdeaListProps) {
  return (
    <div className="grid gap-4" data-testid="idea-list">
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}

interface IdeaListSkeletonProps {
  /** Number of skeleton cards to display (default: 3) */
  count?: number;
}

/**
 * Skeleton loading state for the idea list
 * Displays animated placeholder cards matching the IdeaCard layout
 */
export function IdeaListSkeleton({ count = 3 }: IdeaListSkeletonProps) {
  return (
    <div className="grid gap-4" data-testid="idea-list-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 animate-pulse">
            <div className="flex justify-between items-start gap-4">
              <div className="h-5 bg-base-300 rounded w-3/4" />
              <div className="h-6 bg-base-300 rounded w-20" />
            </div>
            <div className="h-4 bg-base-300 rounded w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
