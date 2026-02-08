// src/features/prototypes/components/ApiMonitorPanel.tsx
//
// API call monitoring panel that displays a chronological list of API calls
// made by the prototype in the Sandpack iframe. (Story 10.5)

import { useState, useCallback } from 'react';
import { Trash2, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ApiCallLogEntry, ApiMonitorFilter } from '../types/apiMonitor';
import { ApiCallDetail } from './ApiCallDetail';

export interface ApiMonitorPanelProps {
  /** Array of API call log entries */
  logs: ApiCallLogEntry[];
  /** Total number of calls */
  totalCount: number;
  /** Number of error calls */
  errorCount: number;
  /** Callback to clear all logs */
  clearLogs: () => void;
}

/** Format a timestamp to HH:MM:SS */
function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour12: false });
  } catch {
    return '--:--:--';
  }
}

/** Get status badge color class based on HTTP status code */
function getStatusColor(status: number, isError: boolean): string {
  if (isError || status === 0) return 'badge-error';
  if (status >= 200 && status < 300) return 'badge-success';
  if (status >= 300 && status < 400) return 'badge-warning';
  return 'badge-error';
}

/** Get method badge color class */
function getMethodColor(method: string): string {
  switch (method) {
    case 'GET': return 'badge-info';
    case 'POST': return 'badge-primary';
    case 'PUT': case 'PATCH': return 'badge-warning';
    case 'DELETE': return 'badge-error';
    case 'AI': return 'badge-secondary';
    default: return 'badge-ghost';
  }
}

export function ApiMonitorPanel({ logs, totalCount, errorCount, clearLogs }: ApiMonitorPanelProps) {
  const [filter, setFilter] = useState<ApiMonitorFilter>('all');
  const [selectedEntry, setSelectedEntry] = useState<ApiCallLogEntry | null>(null);

  const filteredLogs = logs.filter((entry) => {
    if (filter === 'success') return !entry.isError;
    if (filter === 'error') return entry.isError;
    return true;
  });

  const handleEntryClick = useCallback((entry: ApiCallLogEntry) => {
    setSelectedEntry(entry);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  return (
    <div className="card bg-base-100 shadow-lg" data-testid="api-monitor-panel">
      {/* Header */}
      <div className="card-body p-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">API Monitor</h3>
            {/* Live count badge */}
            <span className="badge badge-sm badge-outline" data-testid="total-count-badge">
              {totalCount} call{totalCount !== 1 ? 's' : ''}
            </span>
            {errorCount > 0 && (
              <span className="badge badge-sm badge-error" data-testid="error-count-badge">
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Filter buttons */}
            <div className="join" data-testid="filter-buttons">
              <button
                className={`join-item btn btn-xs ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter('all')}
                aria-label="Show all calls"
                data-testid="filter-all"
              >
                All
              </button>
              <button
                className={`join-item btn btn-xs ${filter === 'success' ? 'btn-success' : 'btn-ghost'}`}
                onClick={() => setFilter('success')}
                aria-label="Show successful calls"
                data-testid="filter-success"
              >
                <CheckCircle2 className="w-3 h-3" />
              </button>
              <button
                className={`join-item btn btn-xs ${filter === 'error' ? 'btn-error' : 'btn-ghost'}`}
                onClick={() => setFilter('error')}
                aria-label="Show error calls"
                data-testid="filter-error"
              >
                <AlertTriangle className="w-3 h-3" />
              </button>
            </div>
            <button
              className="btn btn-xs btn-ghost"
              onClick={clearLogs}
              aria-label="Clear all logs"
              data-testid="clear-logs-btn"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Log list */}
        {filteredLogs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 text-base-content/50"
            data-testid="empty-state"
          >
            <Activity className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">
              {totalCount === 0
                ? 'No API calls recorded yet. Interact with the prototype to see API activity.'
                : 'No calls match the current filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-64 mt-2" data-testid="log-list">
            <div className="space-y-1">
              {filteredLogs.map((entry) => (
                <button
                  key={entry.id}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 hover:bg-base-200 transition-colors cursor-pointer ${
                    entry.isError ? 'bg-error/10' : ''
                  }`}
                  onClick={() => handleEntryClick(entry)}
                  data-testid={`log-entry-${entry.id}`}
                  aria-label={`View details for ${entry.endpointName}`}
                >
                  {/* Timestamp */}
                  <span className="text-base-content/40 whitespace-nowrap shrink-0">
                    {formatTime(entry.timestamp)}
                  </span>
                  {/* Method badge */}
                  <span className={`badge badge-xs ${getMethodColor(entry.method)} shrink-0`}>
                    {entry.method}
                  </span>
                  {/* Endpoint name */}
                  <span className="truncate flex-1 text-base-content/80">
                    {entry.endpointName}
                    {entry.isMock && (
                      <span className="text-base-content/30 ml-1">(mock)</span>
                    )}
                  </span>
                  {/* Status badge */}
                  <span className={`badge badge-xs ${getStatusColor(entry.responseStatus, entry.isError)} shrink-0`}>
                    {entry.responseStatus || 'ERR'}
                  </span>
                  {/* Duration */}
                  <span className="text-base-content/40 whitespace-nowrap shrink-0">
                    {entry.durationMs}ms
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedEntry && (
        <ApiCallDetail entry={selectedEntry} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
