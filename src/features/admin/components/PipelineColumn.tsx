// src/features/admin/components/PipelineColumn.tsx
// Column component for each status in kanban view
// Story 5.3 - Task 2: Create PipelineColumn component

import { IdeaKanbanCard } from './IdeaKanbanCard';
import type { IdeaWithSubmitter } from '../types';

interface PipelineColumnProps {
  ideas: IdeaWithSubmitter[];
  columnTitle: string;
  columnColor: 'gray' | 'blue' | 'yellow' | 'green';
}

/**
 * Subtask 2.1: Create PipelineColumn.tsx component
 * Subtask 2.2: Accept props: status, ideas[], columnTitle, columnColor
 * Subtask 2.3: Display column header with status name and count badge
 * Subtask 2.4: Implement vertical scrollable card container (max-height with scroll)
 * Subtask 2.5: Add empty state for columns with no ideas
 * Subtask 2.6: Apply semantic colors per status (gray, blue, yellow, green)
 */
export function PipelineColumn({ ideas, columnTitle, columnColor }: PipelineColumnProps) {
  // Subtask 2.6: Color mapping for column headers
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'gray':
        return 'bg-[#6B7280] text-white';
      case 'blue':
        return 'bg-[#3B82F6] text-white';
      case 'yellow':
        return 'bg-[#F59E0B] text-white';
      case 'green':
        return 'bg-[#10B981] text-white';
      default:
        return 'bg-[#525355] text-white';
    }
  };

  const headerColorClasses = getColorClasses(columnColor);

  return (
    <div className="flex flex-col h-full">
      {/* Subtask 2.3: Column header with title and count badge */}
      <div
        data-testid="column-header"
        className={`${headerColorClasses} p-4 font-montserrat font-semibold`}
        style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg">{columnTitle}</h2>
          <span className="badge badge-lg bg-white text-neutral font-rubik">
            {ideas.length}
          </span>
        </div>
      </div>

      {/* Subtask 2.4: Vertical scrollable card container */}
      <div
        data-testid="card-container"
        className="flex flex-col gap-3 p-4 bg-base-200 overflow-y-auto flex-1"
        style={{
          maxHeight: '70vh',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
        }}
      >
        {/* Subtask 2.5: Empty state when no ideas */}
        {ideas.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-neutral opacity-60 font-rubik text-center">
              No ideas in this stage
            </p>
          </div>
        ) : (
          // Render idea cards
          ideas.map((idea) => (
            <IdeaKanbanCard key={idea.id} idea={idea} />
          ))
        )}
      </div>
    </div>
  );
}
