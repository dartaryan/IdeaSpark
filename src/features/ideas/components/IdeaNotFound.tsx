import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/routeConstants';

/**
 * Not found state for IdeaDetailPage (AC 9)
 * Displays when idea doesn't exist or user doesn't have permission
 */
export function IdeaNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-20 w-20 mb-6 text-base-content/30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      
      <h2 className="text-xl font-semibold text-base-content mb-2">
        Idea Not Found
      </h2>
      <p className="text-base-content/60 mb-6 max-w-md">
        The idea you're looking for doesn't exist or you don't have permission to view it.
      </p>
      
      <button
        className="btn btn-primary"
        onClick={() => navigate(ROUTES.IDEAS)}
        data-testid="go-to-ideas-button"
      >
        Go to My Ideas
      </button>
    </div>
  );
}
