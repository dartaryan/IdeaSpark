import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/routeConstants';

/**
 * Empty state component shown when user has no ideas
 * Includes encouraging message and CTA to submit first idea
 */
export function IdeasEmptyState() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-testid="ideas-empty-state"
    >
      {/* Lightbulb Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-24 w-24 mb-6 text-base-content/30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>

      <h3 className="text-xl font-semibold text-base-content mb-2">No ideas yet</h3>
      <p className="text-base-content/60 mb-6 max-w-md">
        You haven't submitted any ideas yet. Share your innovation to start your journey through the
        pipeline!
      </p>

      <button
        className="btn btn-primary"
        onClick={() => navigate(ROUTES.NEW_IDEA)}
        data-testid="empty-state-cta"
      >
        Submit your first idea
      </button>
    </div>
  );
}
