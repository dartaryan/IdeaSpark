/**
 * Admin Dashboard page - overview of all ideas and pipeline
 * Placeholder for Epic 5: Admin Pipeline & Triage Workflow
 */
export function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-base-content/70">
            Manage and triage all submitted ideas. Review, approve, or provide feedback on innovation proposals.
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
            <span>Coming in Epic 5: Admin Pipeline & Triage Workflow</span>
          </div>

          {/* Pipeline preview placeholder */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Idea Pipeline Stages</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat bg-base-200 rounded-xl">
                <div className="stat-title">Submitted</div>
                <div className="stat-value text-primary">--</div>
                <div className="stat-desc">New ideas</div>
              </div>
              <div className="stat bg-base-200 rounded-xl">
                <div className="stat-title">In Review</div>
                <div className="stat-value text-warning">--</div>
                <div className="stat-desc">Being evaluated</div>
              </div>
              <div className="stat bg-base-200 rounded-xl">
                <div className="stat-title">Approved</div>
                <div className="stat-value text-success">--</div>
                <div className="stat-desc">Moving forward</div>
              </div>
              <div className="stat bg-base-200 rounded-xl">
                <div className="stat-title">Completed</div>
                <div className="stat-value text-info">--</div>
                <div className="stat-desc">Prototyped</div>
              </div>
            </div>
          </div>

          {/* Coming soon message */}
          <div className="flex flex-col items-center justify-center py-8 text-base-content/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            <p className="text-lg">Admin features coming soon</p>
            <p className="text-sm">The idea triage and pipeline management is under development.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
