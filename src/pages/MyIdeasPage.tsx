/**
 * My Ideas page - lists user's submitted ideas
 * Placeholder for Epic 2: Idea Submission with AI Enhancement
 */
export function MyIdeasPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold">My Ideas</h1>
          <p className="text-base-content/70">
            Your submitted ideas will appear here. Track their status as they move through the innovation pipeline.
          </p>

          {/* Placeholder content */}
          <div className="alert alert-info mt-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Coming in Epic 2: Idea Submission with AI Enhancement</span>
          </div>

          {/* Empty state illustration */}
          <div className="flex flex-col items-center justify-center py-12 text-base-content/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <p className="text-lg">No ideas yet</p>
            <p className="text-sm">Start by submitting your first idea!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
