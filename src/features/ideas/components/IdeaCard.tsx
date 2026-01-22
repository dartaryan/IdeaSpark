import { useNavigate } from 'react-router-dom';
import { IdeaStatusBadge } from './IdeaStatusBadge';
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
 * Card component for displaying an idea in the list
 * Shows title, status badge, and submission date
 * Entire card is clickable to navigate to detail view
 */
export function IdeaCard({ idea }: IdeaCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/ideas/${idea.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
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
          <IdeaStatusBadge status={idea.status} />
        </div>
        <p className="text-sm text-base-content/60 mt-2" data-testid="idea-card-date">
          Submitted on {formatDate(idea.created_at)}
        </p>
      </div>
    </div>
  );
}
