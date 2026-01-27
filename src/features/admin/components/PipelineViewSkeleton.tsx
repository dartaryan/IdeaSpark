// src/features/admin/components/PipelineViewSkeleton.tsx
// Loading skeleton for PipelineView
// Story 5.3 - Task 8: Implement loading and empty states

/**
 * Subtask 8.1: Create PipelineViewSkeleton component for loading state
 * Subtask 8.2: Show skeleton loaders for 4 columns while data fetches
 */
export function PipelineViewSkeleton() {
  return (
    <div data-testid="pipeline-skeleton" className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Skeleton for 4 columns */}
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="flex flex-col">
            {/* Column header skeleton */}
            <div
              className="bg-neutral h-16 mb-2"
              style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
            />
            {/* Card skeletons */}
            <div className="bg-base-200 p-4 space-y-3" style={{ minHeight: '400px' }}>
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="bg-base-100 h-32"
                  style={{ borderRadius: '20px' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
