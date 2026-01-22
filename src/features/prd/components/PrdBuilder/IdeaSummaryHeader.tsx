import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../routes/routeConstants';
import type { Idea } from '../../../ideas/types';

interface IdeaSummaryHeaderProps {
  idea: Idea;
}

export function IdeaSummaryHeader({ idea }: IdeaSummaryHeaderProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate display title from problem statement
  const displayTitle = idea.title ||
    idea.problem.substring(0, 60) + (idea.problem.length > 60 ? '...' : '');

  const handleBackClick = () => {
    navigate(ROUTES.IDEA_DETAIL.replace(':id', idea.id));
  };

  return (
    <div className="bg-base-100 border-b border-base-200 px-4 py-3">
      {/* Back button and title row */}
      <div className="flex items-center gap-3 mb-2">
        <button
          className="btn btn-ghost btn-sm btn-square"
          onClick={handleBackClick}
          aria-label="Back to idea"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">
            PRD: {displayTitle}
          </h1>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide Details' : 'Show Idea'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Expandable idea details */}
      {isExpanded && (
        <div className="mt-3 p-3 bg-base-200 rounded-box space-y-3 text-sm">
          <div>
            <span className="font-medium text-base-content/70">Problem:</span>
            <p className="text-base-content mt-1">{idea.problem}</p>
          </div>
          <div>
            <span className="font-medium text-base-content/70">Solution:</span>
            <p className="text-base-content mt-1">{idea.solution}</p>
          </div>
          <div>
            <span className="font-medium text-base-content/70">Impact:</span>
            <p className="text-base-content mt-1">{idea.impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}
