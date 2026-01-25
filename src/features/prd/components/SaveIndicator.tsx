import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveIndicatorProps {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
  onManualSave?: () => void;
  onRetry?: () => void;
  showManualSave?: boolean;
}

export function SaveIndicator({
  saveStatus,
  lastSaved,
  error,
  onManualSave,
  onRetry,
  showManualSave = true,
}: SaveIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Status indicator */}
      {saveStatus === 'saving' && (
        <div className="flex items-center gap-1 text-base-content/60">
          <span className="loading loading-spinner loading-xs" role="status" />
          <span>Saving...</span>
        </div>
      )}

      {saveStatus === 'saved' && (
        <div className="flex items-center gap-1 text-success animate-fade-in">
          <CheckCircleIcon className="w-4 h-4" />
          <span>Saved</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-error">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>Save failed</span>
          </div>
          {onRetry && (
            <button onClick={onRetry} className="btn btn-xs btn-ghost text-error">
              Retry
            </button>
          )}
        </div>
      )}

      {saveStatus === 'idle' && lastSaved && (
        <span className="text-base-content/40 text-xs">
          Last saved{' '}
          {lastSaved.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      )}

      {/* Manual save button */}
      {showManualSave && onManualSave && saveStatus !== 'saving' && (
        <button onClick={onManualSave} className="btn btn-xs btn-ghost" title="Save now">
          Save
        </button>
      )}
    </div>
  );
}
