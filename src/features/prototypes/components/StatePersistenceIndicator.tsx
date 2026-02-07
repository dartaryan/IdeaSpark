// src/features/prototypes/components/StatePersistenceIndicator.tsx
//
// Displays the current state persistence status: Saving, Saved, or Save failed.
// Shows last saved timestamp and auto-hides "Saved" after 3 seconds.
// Story 8.2: Save Prototype State to Database (AC: #1)

import { useState, useEffect } from 'react';
import { Cloud, CloudOff, Check, Loader2 } from 'lucide-react';
import type { StatePersistenceStatus } from '../hooks/useStatePersistence';

export interface StatePersistenceIndicatorProps {
  /** Current save status from useStatePersistence hook */
  status: StatePersistenceStatus;
  /** Timestamp of last successful save */
  lastSavedAt: Date | null;
}

/** Auto-hide delay for "Saved" status in milliseconds */
const SAVED_DISPLAY_DURATION_MS = 3000;

/**
 * Visual indicator for prototype state persistence status.
 * Shows cloud icon + "Saving..." / "Saved" / "Save failed" with
 * appropriate DaisyUI styling and PassportCard theme colors.
 */
export function StatePersistenceIndicator({
  status,
  lastSavedAt,
}: StatePersistenceIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  // Auto-hide "Saved" indicator after 3 seconds (Subtask 4.5)
  useEffect(() => {
    if (status === 'saved') {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), SAVED_DISPLAY_DURATION_MS);
      return () => clearTimeout(timer);
    }
    setShowSaved(false);
    return undefined;
  }, [status]);

  /**
   * Format the last saved timestamp for display.
   * Shows relative time like "just now" or HH:MM format.
   */
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Saving state: spinner + "Saving..."
  if (status === 'saving') {
    return (
      <span
        className="flex items-center gap-1 text-xs text-info"
        aria-live="polite"
        data-testid="state-persistence-indicator"
      >
        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
        Saving...
      </span>
    );
  }

  // Saved state: checkmark + "Saved" (auto-hides after 3s)
  if (status === 'saved' && showSaved) {
    return (
      <div
        className="tooltip tooltip-bottom"
        data-tip={lastSavedAt ? `Last saved: ${formatTimestamp(lastSavedAt)}` : undefined}
      >
        <span
          className="flex items-center gap-1 text-xs text-success"
          aria-live="polite"
          data-testid="state-persistence-indicator"
        >
          <Check className="w-3 h-3" aria-hidden="true" />
          State saved
        </span>
      </div>
    );
  }

  // Error state: warning + "Save failed"
  if (status === 'error') {
    return (
      <span
        className="flex items-center gap-1 text-xs text-error"
        aria-live="polite"
        data-testid="state-persistence-indicator"
      >
        <CloudOff className="w-3 h-3" aria-hidden="true" />
        State save failed
      </span>
    );
  }

  // Idle state: cloud icon (subtle, not attention-grabbing)
  if (status === 'idle') {
    return (
      <span
        className="flex items-center gap-1 text-xs text-base-content/40"
        aria-live="polite"
        data-testid="state-persistence-indicator"
      >
        <Cloud className="w-3 h-3" aria-hidden="true" />
        {lastSavedAt ? `Saved ${formatTimestamp(lastSavedAt)}` : 'State sync idle'}
      </span>
    );
  }

  return null;
}
