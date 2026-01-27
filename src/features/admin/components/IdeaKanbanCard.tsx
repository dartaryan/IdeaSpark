// src/features/admin/components/IdeaKanbanCard.tsx
// Individual idea card for kanban view
// Story 5.3 - Task 3: Create IdeaKanbanCard component

import { useNavigate } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import type { IdeaWithSubmitter } from '../types';

interface IdeaKanbanCardProps {
  idea: IdeaWithSubmitter;
}

/**
 * Subtask 3.1: Create IdeaKanbanCard.tsx component
 * Subtask 3.2: Display idea title (truncated to 60 chars with ellipsis)
 * Subtask 3.3: Display submitter name with avatar placeholder or initials
 * Subtask 3.4: Calculate and display "days in stage"
 * Subtask 3.5: Add status badge with semantic color
 * Subtask 3.6: Add click handler to navigate to idea detail page
 * Subtask 3.7: Add hover effect with elevation shadow
 * Subtask 3.8: Display truncated problem statement (first 80 chars)
 */
export function IdeaKanbanCard({ idea }: IdeaKanbanCardProps) {
  const navigate = useNavigate();

  // Subtask 3.2: Truncate title to 60 characters
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const displayTitle = truncateText(idea.title, 60);
  const displayProblem = truncateText(idea.problem, 80);

  // Subtask 3.5: Status badge colors (semantic)
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'submitted':
        return { text: 'submitted', colorClass: 'badge-neutral' };
      case 'approved':
        return { text: 'approved', colorClass: 'badge-info' };
      case 'prd_development':
        return { text: 'PRD Development', colorClass: 'badge-warning' };
      case 'prototype_complete':
        return { text: 'Prototype Complete', colorClass: 'badge-success' };
      default:
        return { text: status, colorClass: 'badge-ghost' };
    }
  };

  const statusDisplay = getStatusDisplay(idea.status);

  // Subtask 3.6: Click handler for navigation
  const handleClick = () => {
    navigate(`/admin/ideas/${idea.id}`);
  };

  // Subtask 3.6: Keyboard handler (Enter key)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${displayTitle}`}
      // Subtask 3.7: Hover effect with elevation shadow
      // DaisyUI card with 20px border radius and hover elevation
      className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer text-left w-full"
      style={{ borderRadius: '20px' }}
    >
      <div className="card-body p-4">
        {/* Subtask 3.2: Idea title */}
        <h3 className="card-title text-base font-montserrat text-neutral mb-2">
          {displayTitle}
        </h3>

        {/* Subtask 3.3: Submitter info with avatar */}
        <div className="flex items-center gap-2 mb-2">
          <UserCircleIcon className="w-5 h-5 text-[#525355]" />
          <span className="text-sm text-neutral font-rubik">{idea.submitter_name}</span>
        </div>

        {/* Subtask 3.8: Truncated problem statement */}
        <p className="text-sm text-neutral opacity-70 mb-3 font-rubik">
          {displayProblem}
        </p>

        {/* Bottom row: Status badge and days in stage */}
        <div className="flex items-center justify-between">
          {/* Subtask 3.5: Status badge */}
          <span className={`badge ${statusDisplay.colorClass} badge-sm`}>
            {statusDisplay.text}
          </span>

          {/* Subtask 3.4: Days in stage */}
          <span className="text-xs text-neutral opacity-60 font-rubik">
            {idea.days_in_stage} {idea.days_in_stage === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>
    </button>
  );
}
