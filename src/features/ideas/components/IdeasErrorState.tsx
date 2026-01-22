interface IdeasErrorStateProps {
  /** The error that occurred */
  error: Error | null;
  /** Callback function to retry fetching ideas */
  onRetry: () => void;
}

/**
 * Error state component shown when fetching ideas fails
 * Includes user-friendly message and retry button
 */
export function IdeasErrorState({ error, onRetry }: IdeasErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-testid="ideas-error-state"
    >
      {/* Error Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 mb-4 text-error"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>

      <h3 className="text-lg font-semibold text-base-content mb-2">Failed to load ideas</h3>
      <p className="text-base-content/60 mb-6 max-w-md">
        {error?.message || 'Something went wrong while loading your ideas. Please try again.'}
      </p>

      <button className="btn btn-primary" onClick={onRetry} data-testid="error-retry-button">
        Try again
      </button>
    </div>
  );
}
