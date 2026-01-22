/**
 * Loading skeleton for IdeaDetailPage (AC 8)
 * Matches the layout of IdeaDetailContent + IdeaStatusInfo
 */
export function IdeaDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-base-300 rounded w-3/4 mb-6" />
      
      {/* Status card skeleton */}
      <div className="card bg-base-100 border border-base-200 mb-6">
        <div className="card-body p-4">
          <div className="flex justify-between mb-4">
            <div className="h-5 bg-base-300 rounded w-16" />
            <div className="h-6 bg-base-300 rounded w-24" />
          </div>
          <div className="h-4 bg-base-300 rounded w-full mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-base-300 rounded w-1/2" />
            <div className="h-4 bg-base-300 rounded w-1/3" />
          </div>
        </div>
      </div>

      {/* Content sections skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-6 bg-base-300 rounded w-40 mb-3" />
            <div className="bg-base-200 rounded-box p-4">
              <div className="space-y-2">
                <div className="h-4 bg-base-300 rounded w-full" />
                <div className="h-4 bg-base-300 rounded w-5/6" />
                <div className="h-4 bg-base-300 rounded w-4/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
