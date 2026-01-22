export function PrdBuilderSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-base-100 border-b border-base-200 px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-base-300 rounded" />
          <div className="h-6 bg-base-300 rounded w-64" />
        </div>
      </div>

      {/* Layout Skeleton */}
      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
        {/* Chat Panel Skeleton */}
        <div className="lg:w-1/2 h-1/2 lg:h-full border border-base-200 rounded-box bg-base-100 p-4">
          <div className="h-6 bg-base-300 rounded w-32 mb-4" />
          <div className="space-y-4">
            <div className="h-16 bg-base-300 rounded w-3/4" />
            <div className="h-16 bg-base-300 rounded w-2/3 ml-auto" />
          </div>
        </div>

        {/* Preview Panel Skeleton */}
        <div className="lg:w-1/2 h-1/2 lg:h-full border border-base-200 rounded-box bg-base-100 p-4">
          <div className="h-6 bg-base-300 rounded w-32 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="border border-base-200 rounded-box p-4">
                <div className="flex justify-between mb-2">
                  <div className="h-5 bg-base-300 rounded w-32" />
                  <div className="h-5 bg-base-300 rounded w-16" />
                </div>
                <div className="h-4 bg-base-300 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
