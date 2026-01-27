// src/features/admin/components/EmptyPipelineState.tsx
// Empty state when no ideas exist in system
// Story 5.3 - Task 8: Implement loading and empty states

import { InboxIcon } from '@heroicons/react/24/outline';

/**
 * Subtask 8.3: Create EmptyPipelineState component for no ideas in system
 */
export function EmptyPipelineState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <InboxIcon className="w-16 h-16 text-[#525355] opacity-60 mb-4" />
      <h3 className="text-lg font-montserrat text-neutral mb-2">No Ideas Yet</h3>
      <p className="text-neutral opacity-70 font-rubik text-center max-w-md">
        There are no ideas in the pipeline. Ideas will appear here once they are submitted.
      </p>
    </div>
  );
}
