// src/features/admin/components/RealtimeIndicator.tsx
// Story 5.8 - Task 7: Add visual feedback for realtime updates

/**
 * RealtimeIndicator component displays connection status for live updates
 * Story 5.8 - Task 7: Add visual feedback (AC: User knows dashboard is live)
 * 
 * Subtasks implemented:
 * - 7.1: Add subtle "Live" indicator badge in dashboard header
 * - 7.2: Show green dot next to "Live" when connected
 * - 7.3: Show red dot if realtime connection fails
 * - 7.6: Use DaisyUI badge component for "Live" indicator
 * 
 * @param isConnected - Whether the realtime connection is active
 * @param error - Error message if connection failed
 */

interface RealtimeIndicatorProps {
  isConnected: boolean;
  error?: string | null;
}

export function RealtimeIndicator({ isConnected, error }: RealtimeIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Subtask 7.1 & 7.6: "Live" indicator badge with DaisyUI styling */}
      <div 
        className="badge badge-sm gap-2 rounded-[20px]"
        title={error || (isConnected ? 'Dashboard is live' : 'Connecting...')}
      >
        {/* Subtask 7.2 & 7.3: Connection status indicator */}
        <div 
          className={`w-2 h-2 rounded-full ${
            isConnected 
              ? 'bg-[#10B981] animate-pulse' // Subtask 7.2: Green dot when connected
              : error
              ? 'bg-[#EF4444]' // Subtask 7.3: Red dot if connection failed
              : 'bg-[#525355] animate-pulse' // Gray dot while connecting
          }`}
        />
        <span className="text-xs font-medium">
          {isConnected ? 'Live' : error ? 'Offline' : 'Connecting'}
        </span>
      </div>
      
      {/* Optional: Show error tooltip on hover */}
      {error && (
        <div className="tooltip tooltip-bottom" data-tip={error}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-4 h-4 text-error"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
            />
          </svg>
        </div>
      )}
    </div>
  );
}
