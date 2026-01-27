// src/features/admin/components/PipelineView.tsx
// Main pipeline kanban page
// Story 5.3 - Task 1: Create PipelineView component with kanban board layout

import { usePipelineIdeas } from '../hooks/usePipelineIdeas';
import { PipelineColumn } from './PipelineColumn';
import { PipelineViewSkeleton } from './PipelineViewSkeleton';
import { EmptyPipelineState } from './EmptyPipelineState';

/**
 * Subtask 1.1: Create PipelineView.tsx in features/admin/components/
 * Subtask 1.2: Implement page header with "Pipeline View" title and real-time indicator
 * Subtask 1.3: Create horizontal scrollable layout for kanban columns
 * Subtask 1.4: Implement responsive grid: 4 columns desktop, 2 columns tablet, 1 column mobile
 */
export function PipelineView() {
  const { data: pipelineIdeas, isLoading, isError, error } = usePipelineIdeas();

  // Subtask 8.2: Loading state with skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-montserrat font-bold text-neutral">Pipeline View</h1>
        </div>
        <PipelineViewSkeleton />
      </div>
    );
  }

  // Subtask 8.5: Error state with retry button
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-montserrat font-bold text-neutral">Pipeline View</h1>
        </div>
        <div className="bg-error/10 border border-error rounded-lg p-6 text-center">
          <p className="text-error font-rubik mb-4">
            Failed to load pipeline: {error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-error btn-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Subtask 1.2: Page header with title and real-time indicator */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-montserrat font-bold text-neutral">Pipeline View</h1>
        
        {/* Subtask 6.5: Real-time indicator (green dot) */}
        <div data-testid="realtime-indicator" className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-rubik text-neutral opacity-70">Live</span>
        </div>
      </div>

      {/* Subtask 1.3: Horizontal scrollable layout */}
      {pipelineIdeas && (
        <div data-testid="pipeline-container" className="overflow-x-auto">
          {/* Subtask 1.4: Responsive grid layout */}
          <div
            data-testid="pipeline-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[1024px]"
          >
            {/* Column 1: Submitted (Gray) */}
            <PipelineColumn
              ideas={pipelineIdeas?.submitted || []}
              columnTitle="Submitted"
              columnColor="gray"
            />

            {/* Column 2: Approved (Blue) */}
            <PipelineColumn
              ideas={pipelineIdeas?.approved || []}
              columnTitle="Approved"
              columnColor="blue"
            />

            {/* Column 3: PRD Development (Yellow) */}
            <PipelineColumn
              ideas={pipelineIdeas?.prd_development || []}
              columnTitle="PRD Development"
              columnColor="yellow"
            />

            {/* Column 4: Prototype Complete (Green) */}
            <PipelineColumn
              ideas={pipelineIdeas?.prototype_complete || []}
              columnTitle="Prototype Complete"
              columnColor="green"
            />
          </div>
        </div>
      )}
    </div>
  );
}
