// src/features/prototypes/components/ApiCallDetail.tsx
//
// Modal component that displays the full details of a single API call log entry.
// Shows request details, response details, timing, and error information. (Story 10.5)

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Copy, Check, Clock, AlertTriangle } from 'lucide-react';
import type { ApiCallLogEntry } from '../types/apiMonitor';

export interface ApiCallDetailProps {
  /** The API call log entry to display */
  entry: ApiCallLogEntry;
  /** Callback to close the detail view */
  onClose: () => void;
}

/** Format JSON string for display */
function formatJson(value: string | null | undefined): string {
  if (!value) return '(none)';
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}

/** Get status badge class */
function getStatusClass(status: number, isError: boolean): string {
  if (isError || status === 0) return 'text-error';
  if (status >= 200 && status < 300) return 'text-success';
  if (status >= 300 && status < 400) return 'text-warning';
  return 'text-error';
}

/** Copy button with temporary "Copied!" feedback */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  }, [text]);

  return (
    <button
      className="btn btn-ghost btn-xs gap-1"
      onClick={handleCopy}
      aria-label={label}
      data-testid={`copy-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-success" />
          <span className="text-xs">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span className="text-xs">Copy</span>
        </>
      )}
    </button>
  );
}

export function ApiCallDetail({ entry, onClose }: ApiCallDetailProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Open the modal on mount
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Called by dialog's native close event (ESC key, backdrop click, or programmatic close)
  const handleDialogClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Button click triggers dialog.close() which fires the close event above
  const handleCloseButton = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Handle backdrop click
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        dialogRef.current?.close();
      }
    },
    [],
  );

  const formattedRequestBody = formatJson(entry.requestBody);
  const formattedResponseBody = formatJson(entry.responseBody);
  const hasRequestHeaders = entry.requestHeaders && Object.keys(entry.requestHeaders).length > 0;
  const hasResponseHeaders = entry.responseHeaders && Object.keys(entry.responseHeaders).length > 0;

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClick={handleDialogClick}
      onClose={handleDialogClose}
      data-testid="api-call-detail-modal"
    >
      <div className="modal-box max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className={`badge ${entry.method === 'AI' ? 'badge-secondary' : 'badge-primary'}`}>
                {entry.method}
              </span>
              {entry.endpointName}
              {entry.isMock && <span className="badge badge-ghost badge-sm">Mock</span>}
              {entry.isAi && <span className="badge badge-secondary badge-sm">AI</span>}
            </h3>
            <p className="text-xs text-base-content/50 mt-1">
              {entry.url}
            </p>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={handleCloseButton}
            aria-label="Close detail view"
            data-testid="close-detail-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timing info */}
        <div className="flex items-center gap-4 mb-4 text-sm text-base-content/60">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {entry.durationMs}ms
          </span>
          <span>{new Date(entry.timestamp).toLocaleString()}</span>
          <span className={getStatusClass(entry.responseStatus, entry.isError)}>
            {entry.responseStatus || 'Error'} {entry.isError && <AlertTriangle className="w-3 h-3 inline" />}
          </span>
        </div>

        {/* Error message */}
        {entry.errorMessage && (
          <div className="alert alert-error mb-4" data-testid="error-message">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{entry.errorMessage}</span>
          </div>
        )}

        {/* Request section */}
        <div className="collapse collapse-arrow bg-base-200 mb-3" data-testid="request-section">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title font-medium text-sm">
            Request
          </div>
          <div className="collapse-content">
            {/* Headers */}
            {hasRequestHeaders && (
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-base-content/60 uppercase">Headers</span>
                </div>
                <pre className="bg-base-300 rounded-lg p-2 text-xs overflow-x-auto mt-1 max-h-32">
                  {JSON.stringify(entry.requestHeaders, null, 2)}
                </pre>
              </div>
            )}
            {/* Body */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-base-content/60 uppercase">
                  {entry.isAi ? 'Prompt' : 'Body'}
                </span>
                {entry.requestBody && (
                  <CopyButton text={entry.requestBody} label="request body" />
                )}
              </div>
              <pre className="bg-base-300 rounded-lg p-2 text-xs overflow-x-auto mt-1 max-h-48">
                {formattedRequestBody}
              </pre>
            </div>
          </div>
        </div>

        {/* Response section */}
        <div className="collapse collapse-arrow bg-base-200" data-testid="response-section">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title font-medium text-sm">
            <span>Response</span>
            <span className={`ml-2 badge badge-sm ${
              entry.isError ? 'badge-error' : 'badge-success'
            }`}>
              {entry.responseStatus || 'ERR'}
            </span>
          </div>
          <div className="collapse-content">
            {/* Response Headers */}
            {hasResponseHeaders && (
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-base-content/60 uppercase">Headers</span>
                </div>
                <pre className="bg-base-300 rounded-lg p-2 text-xs overflow-x-auto mt-1 max-h-32" data-testid="response-headers">
                  {JSON.stringify(entry.responseHeaders, null, 2)}
                </pre>
              </div>
            )}
            {/* Response Body */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-base-content/60 uppercase">
                  {entry.isAi ? 'AI Response' : 'Body'}
                </span>
                {entry.responseBody && (
                  <CopyButton text={entry.responseBody} label="response body" />
                )}
              </div>
              <pre className="bg-base-300 rounded-lg p-2 text-xs overflow-x-auto mt-1 max-h-64">
                {formattedResponseBody}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
