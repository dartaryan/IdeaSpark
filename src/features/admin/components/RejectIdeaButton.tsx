// src/features/admin/components/RejectIdeaButton.tsx
// Story 5.5 - Task 4: Reject button with feedback modal

import { useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { RejectIdeaModal } from './RejectIdeaModal';
import type { IdeaWithSubmitter } from '../types';

interface RejectIdeaButtonProps {
  idea: IdeaWithSubmitter;
  /** Button variant - 'button' shows text, 'icon' shows only icon */
  variant?: 'button' | 'icon';
  /** Size - matches DaisyUI button sizes */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS class names */
  className?: string;
}

/**
 * RejectIdeaButton - Button that opens rejection feedback modal
 * 
 * Story 5.5 - Task 4:
 * Subtask 4.1: Create RejectIdeaButton.tsx in features/admin/components/
 * Subtask 4.2: Display "Reject" button with danger color styling (#EF4444)
 * 
 * Usage:
 * - In detail page: <RejectIdeaButton idea={idea} variant="button" />
 * - In list items: <RejectIdeaButton idea={idea} variant="icon" size="sm" />
 * - In kanban cards: <RejectIdeaButton idea={idea} variant="icon" size="xs" />
 */
export function RejectIdeaButton({ 
  idea, 
  variant = 'button', 
  size = 'md',
  className = '' 
}: RejectIdeaButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show for submitted ideas
  if (idea.status !== 'submitted') {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling (for list items/cards)
    setIsModalOpen(true);
  };

  // Size classes for icon buttons
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          className={`btn btn-circle btn-ghost ${sizeClasses[size]} ${className}`}
          onClick={handleClick}
          aria-label="Reject idea with feedback"
          title="Reject idea"
        >
          {/* Task 12: Subtask 12.3 - Use Heroicons x-circle for reject icon (neutral gray #525355) */}
          <XCircleIcon 
            className={size === 'xs' ? 'w-4 h-4' : 'w-5 h-5'} 
            style={{ color: '#525355' }} 
          />
        </button>
        
        <RejectIdeaModal
          idea={idea}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  // Full button variant
  return (
    <>
      {/* Subtask 4.2: Danger red color for reject button (#EF4444) */}
      <button
        type="button"
        className={`btn ${sizeClasses[size]} rounded-[20px] bg-[#EF4444] hover:bg-[#DC2626] border-none text-white ${className}`}
        onClick={handleClick}
        aria-label="Reject idea with feedback"
      >
        <XCircleIcon className="w-5 h-5" />
        Reject
      </button>
      
      <RejectIdeaModal
        idea={idea}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
