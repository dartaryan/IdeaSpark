// src/features/prototypes/components/MockResponsePreview.tsx

import { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';

export interface MockResponsePreviewProps {
  /** Mock response JSON string */
  responseBody: string;
  /** HTTP status code */
  statusCode: number;
  /** Simulated delay in milliseconds */
  delayMs: number;
  /** Whether the JSON is currently valid */
  hasError: boolean;
}

/** Get badge class based on HTTP status code range */
function getStatusBadgeClass(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return 'badge-success';
  if (statusCode >= 400 && statusCode < 500) return 'badge-warning';
  if (statusCode >= 500) return 'badge-error';
  return 'badge-info';
}

/** Format JSON for display, returning the original string if invalid */
function formatJson(jsonStr: string): string {
  if (!jsonStr.trim()) return '';
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch {
    return jsonStr;
  }
}

/**
 * Collapsible preview panel showing exactly what the prototype will receive
 * when the mock endpoint is called. Simulates the configured delay.
 */
export function MockResponsePreview({
  responseBody,
  statusCode,
  delayMs,
  hasError,
}: MockResponsePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Reset preview when inputs change so stale results aren't shown
  useEffect(() => {
    if (isOpen && showResult) {
      setShowResult(false);
      setIsLoading(false);
      setIsOpen(false);
    }
    // Only reset when the actual data changes, not when display state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseBody, statusCode, delayMs]);

  const handleTestMock = useCallback(() => {
    if (hasError) return;

    // Clear any previously running timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsOpen(true);
    setShowResult(false);

    if (delayMs > 0) {
      setIsLoading(true);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setIsLoading(false);
        setShowResult(true);
      }, Math.min(delayMs, 5000)); // Cap preview delay at 5s for UX
    } else {
      setShowResult(true);
    }
  }, [hasError, delayMs]);

  return (
    <div data-testid="mock-response-preview">
      <button
        type="button"
        className="btn btn-ghost btn-xs gap-1"
        onClick={handleTestMock}
        disabled={hasError || !responseBody.trim()}
        data-testid="test-mock-btn"
      >
        <Play className="w-3 h-3" />
        Test Mock
      </button>

      {isOpen && (
        <div
          className="mt-2 rounded-lg border border-base-content/20 bg-base-200 p-3"
          data-testid="mock-preview-panel"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm" data-testid="mock-preview-loading">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Simulating {delayMs}ms delay...</span>
            </div>
          ) : showResult ? (
            <div className="space-y-2">
              {/* Status & Delay row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`badge badge-sm ${getStatusBadgeClass(statusCode)}`}
                  data-testid="mock-preview-status-badge"
                >
                  {statusCode}
                </span>
                {delayMs > 0 && (
                  <span
                    className="badge badge-sm badge-ghost"
                    data-testid="mock-preview-delay-badge"
                  >
                    {delayMs}ms delay
                  </span>
                )}
              </div>

              {/* Response body */}
              <pre
                className="text-xs font-mono bg-base-300 p-3 rounded overflow-x-auto max-h-60 whitespace-pre-wrap"
                data-testid="mock-preview-body"
              >
                {formatJson(responseBody)}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
