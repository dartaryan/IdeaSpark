// src/features/admin/components/analytics/DrillDownModal.tsx
// Story 0.6 Task 1: Create DrillDownModal component
// Displays drill-down data in a sortable, filterable modal table

import React, { useState, useMemo } from 'react';
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import type { PipelineStatus } from '../../analytics/types';

/**
 * Column definition for the drill-down table
 */
export interface DrillDownColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

/**
 * Subtask 1.2: DrillDownModal props interface
 */
interface DrillDownModalProps<T extends { currentStatus?: PipelineStatus | string }> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: T[];
  columns: DrillDownColumn<T>[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Story 0.6 Task 1: DrillDownModal component
 * Subtask 1.1-1.11: Sortable, filterable drill-down data table in a modal
 */
export function DrillDownModal<T extends { currentStatus?: PipelineStatus | string }>({
  isOpen,
  onClose,
  title,
  data,
  columns,
  isLoading,
  error,
  onRetry,
}: DrillDownModalProps<T>) {
  // Subtask 1.6: Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);

  // Subtask 1.7: Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Don't render if not open
  if (!isOpen) return null;

  // Subtask 1.7: Filter data by status
  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return data;
    return data.filter((item) => item.currentStatus === statusFilter);
  }, [data, statusFilter]);

  // Subtask 1.6: Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Subtask 1.6: Handle column header click for sorting
  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  // Get sort icon for column header
  const getSortIcon = (key: keyof T) => {
    if (sortConfig?.key !== key) {
      return <ChevronUpDownIcon className="w-4 h-4 inline-block ml-1 opacity-40" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 inline-block ml-1" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 inline-block ml-1" />
    );
  };

  // Extract unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    data.forEach((item) => {
      if (item.currentStatus) statuses.add(String(item.currentStatus));
    });
    return Array.from(statuses).sort();
  }, [data]);

  // Status label mapping
  const statusLabelMap: Record<string, string> = {
    submitted: 'Submitted',
    approved: 'Approved',
    prd_development: 'PRD Development',
    prototype_complete: 'Prototype Complete',
    rejected: 'Rejected',
  };

  return (
    // Subtask 1.3: DaisyUI modal with PassportCard theme
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drilldown-modal-title"
      onClick={onClose}
    >
      <div
        className="modal-box w-11/12 max-w-5xl"
        style={{ borderRadius: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtask 1.4: Modal header with title and close button */}
        <div className="flex items-center justify-between mb-4">
          <h2
            id="drilldown-modal-title"
            className="text-2xl font-bold"
            style={{ fontFamily: 'Montserrat, sans-serif', color: '#E10514' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" style={{ color: '#525355' }} />
          </button>
        </div>

        {/* Subtask 1.8: Loading skeleton */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <span
              className="loading loading-spinner loading-lg"
              style={{ color: '#E10514' }}
              aria-label="Loading drill-down data"
            ></span>
          </div>
        )}

        {/* Error state with retry */}
        {!isLoading && error && (
          <div className="text-center py-12">
            <div className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span style={{ fontFamily: 'Rubik, sans-serif' }}>{error}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn"
                style={{
                  backgroundColor: '#E10514',
                  color: 'white',
                  borderRadius: '20px',
                }}
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Subtask 1.9: Empty state */}
        {!isLoading && !error && data.length === 0 && (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#525355"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p
              className="text-lg font-semibold"
              style={{ fontFamily: 'Montserrat, sans-serif', color: '#525355' }}
            >
              No detailed data available
            </p>
            <p
              className="text-sm mt-2"
              style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
            >
              There is no drill-down data for this metric in the selected period.
            </p>
          </div>
        )}

        {/* Subtask 1.5 & 1.7: Sortable table with filter */}
        {!isLoading && !error && data.length > 0 && (
          <>
            {/* Subtask 1.7: Filter dropdown above table */}
            {uniqueStatuses.length > 1 && (
              <div className="flex items-center gap-3 mb-4">
                <label
                  htmlFor="status-filter"
                  className="text-sm font-medium"
                  style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
                >
                  Filter by Status:
                </label>
                <select
                  id="status-filter"
                  className="select select-bordered select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ fontFamily: 'Rubik, sans-serif' }}
                >
                  <option value="all">All ({data.length})</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabelMap[status] || status} (
                      {data.filter((item) => item.currentStatus === status).length})
                    </option>
                  ))}
                </select>

                {statusFilter !== 'all' && (
                  <span
                    className="text-sm"
                    style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
                  >
                    Showing {sortedData.length} of {data.length}
                  </span>
                )}
              </div>
            )}

            {/* Subtask 1.10: Scrollable table body with fixed header */}
            <div className="overflow-x-auto" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="table table-zebra table-pin-rows w-full">
                <thead>
                  <tr className="bg-base-200">
                    {columns.map((col) => (
                      <th
                        key={String(col.key)}
                        className={`text-left ${col.sortable !== false ? 'cursor-pointer select-none hover:bg-base-300 transition-colors' : ''}`}
                        style={{ fontFamily: 'Rubik, sans-serif', color: '#525355' }}
                        onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                      >
                        {col.label}
                        {col.sortable !== false && getSortIcon(col.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-base-200/50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td
                          key={String(col.key)}
                          style={{ fontFamily: 'Rubik, sans-serif' }}
                        >
                          {col.render
                            ? col.render(row[col.key], row)
                            : String(row[col.key] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Row count */}
            <div
              className="mt-3 text-sm text-right"
              style={{ fontFamily: 'Rubik, sans-serif', color: '#9CA3AF' }}
            >
              {sortedData.length} {sortedData.length === 1 ? 'item' : 'items'}
            </div>
          </>
        )}

        {/* Modal actions */}
        <div className="modal-action">
          <button
            onClick={onClose}
            className="btn"
            style={{
              backgroundColor: '#E10514',
              color: 'white',
              borderRadius: '20px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
