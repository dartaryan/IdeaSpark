import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/routeConstants';
import type { Idea } from '../types';

interface IdeaDetailActionsProps {
  idea: Idea;
}

/**
 * Action buttons for idea detail page
 * - "Build PRD" button when status is approved (AC 6, 7)
 * - "Back to My Ideas" button (AC 10)
 */
export function IdeaDetailActions({ idea }: IdeaDetailActionsProps) {
  const navigate = useNavigate();
  const canBuildPrd = idea.status === 'approved';

  const handleBuildPrd = () => {
    // Navigate to PRD builder with idea ID (AC 7)
    navigate(ROUTES.PRD_BUILDER.replace(':id', idea.id));
  };

  const handleBackToList = () => {
    // Navigate back to My Ideas list (AC 10)
    navigate(ROUTES.IDEAS);
  };

  return (
    <div className="flex flex-col gap-3">
      {canBuildPrd && (
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleBuildPrd}
          data-testid="build-prd-button"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Build PRD
        </button>
      )}
      
      <button
        className="btn btn-ghost"
        onClick={handleBackToList}
        data-testid="back-to-ideas-button"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        Back to My Ideas
      </button>
    </div>
  );
}
