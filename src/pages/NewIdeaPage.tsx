/**
 * New Idea page - idea submission wizard
 * Placeholder for Epic 2: Idea Submission with AI Enhancement
 */
export function NewIdeaPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold">Submit New Idea</h1>
          <p className="text-base-content/70">
            Share your innovative idea with us. Our AI-powered wizard will help you refine and enhance it.
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

          {/* Wizard preview placeholder */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Idea Wizard Steps</h2>
            <ul className="steps steps-vertical lg:steps-horizontal w-full">
              <li className="step step-primary">Problem Definition</li>
              <li className="step">Solution Description</li>
              <li className="step">Impact Assessment</li>
              <li className="step">Review & AI Enhancement</li>
            </ul>
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p className="text-lg">Idea submission coming soon</p>
            <p className="text-sm">The AI-powered idea wizard is under development.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
