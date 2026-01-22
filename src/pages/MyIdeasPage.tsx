import { useNavigate } from 'react-router-dom';
import { useIdeas } from '../features/ideas/hooks/useIdeas';
import { IdeaList, IdeaListSkeleton } from '../features/ideas/components/IdeaList';
import { IdeasEmptyState } from '../features/ideas/components/IdeasEmptyState';
import { IdeasErrorState } from '../features/ideas/components/IdeasErrorState';
import { ROUTES } from '../routes/routeConstants';

/**
 * My Ideas page - lists user's submitted ideas
 * Displays ideas sorted by newest first with status badges
 */
export function MyIdeasPage() {
  const navigate = useNavigate();
  const { ideas, isLoading, error, refetch } = useIdeas();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Ideas</h1>
          <p className="text-base-content/60 mt-1">
            Track your ideas as they progress through the innovation pipeline.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(ROUTES.NEW_IDEA)}
          data-testid="submit-new-idea-button"
        >
          Submit New Idea
        </button>
      </div>

      {/* Content States */}
      {isLoading && <IdeaListSkeleton count={3} />}

      {error && !isLoading && <IdeasErrorState error={error} onRetry={refetch} />}

      {!isLoading && !error && ideas.length === 0 && <IdeasEmptyState />}

      {!isLoading && !error && ideas.length > 0 && <IdeaList ideas={ideas} />}
    </div>
  );
}
