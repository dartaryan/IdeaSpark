import { useNavigate } from 'react-router-dom';
import { IdeaStatusBadge } from './IdeaStatusBadge';
import { usePrototypeByIdeaId } from '../../prototypes/hooks/usePrototypeByIdeaId';
import type { Idea } from '../types';

interface IdeaCardProps {
  idea: Idea;
}

/**
 * Formats a date string to a readable format
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Truncates text to specified length, preserving word boundaries
 */
function truncateTitle(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > maxLength * 0.6 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Card component for displaying an idea in the list (Task 4 - Story 4.8)
 * Shows title, status badge, submission date, and prototype status indicator
 * Entire card is clickable to navigate to detail view
 * Shows "View Prototype" quick action when prototype is ready
 */
export function IdeaCard({ idea }: IdeaCardProps) {
  const navigate = useNavigate();
  
  // Fetch prototype for this idea (Task 4)
  const { data: prototype } = usePrototypeByIdeaId(idea.id);

  const handleClick = () => {
    navigate(`/ideas/${idea.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleViewPrototype = (e: React.MouseEvent) => {
    // Prevent card click event from firing (AC 5, Task 4)
    e.stopPropagation();
    if (prototype) {
      navigate(`/prototypes/${prototype.id}`);
    }
  };

  // Use title if available, otherwise truncate problem statement
  const displayTitle = idea.title || truncateTitle(idea.problem);

  return (
    <div
      className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-base-200"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View idea: ${displayTitle}`}
      data-testid="idea-card"
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start gap-4">
          <h3
            className="card-title text-base font-semibold line-clamp-2 flex-1"
            data-testid="idea-card-title"
          >
            {displayTitle}
          </h3>
          <div className="flex flex-col gap-2 items-end">
            <IdeaStatusBadge status={idea.status} />
            {/* Show prototype badge if exists (AC 5, Task 4) */}
            {prototype && (
              <span className="badge badge-success gap-1" data-testid="prototype-badge">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3 w-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                Prototype Ready
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm text-base-content/60" data-testid="idea-card-date">
            Submitted on {formatDate(idea.created_at)}
          </p>
          {/* Quick action to view prototype (AC 5, Task 4) */}
          {prototype && (
            <button
              className="btn btn-sm btn-primary gap-1"
              onClick={handleViewPrototype}
              data-testid="view-prototype-quick-action"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                />
              </svg>
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
