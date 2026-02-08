// src/features/prototypes/components/ApiMonitorPanel.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiMonitorPanel } from './ApiMonitorPanel';
import type { ApiCallLogEntry } from '../types/apiMonitor';

const makeLogEntry = (overrides: Partial<ApiCallLogEntry> = {}): ApiCallLogEntry => ({
  id: 'call-1',
  timestamp: '2026-02-08T10:30:00.000Z',
  endpointName: 'getUsers',
  method: 'GET',
  url: 'https://api.example.com/users',
  requestHeaders: {},
  requestBody: null,
  responseStatus: 200,
  responseStatusText: 'OK',
  responseHeaders: {},
  responseBody: '{"users":[]}',
  durationMs: 245,
  isError: false,
  isAi: false,
  isMock: false,
  errorMessage: null,
  ...overrides,
});

describe('ApiMonitorPanel', () => {
  it('should render empty state when no logs', () => {
    render(
      <ApiMonitorPanel logs={[]} totalCount={0} errorCount={0} clearLogs={vi.fn()} />,
    );

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/No API calls recorded yet/)).toBeInTheDocument();
  });

  it('should render log entries', () => {
    const logs = [
      makeLogEntry({ id: 'call-1', endpointName: 'getUsers' }),
      makeLogEntry({ id: 'call-2', endpointName: 'createUser', method: 'POST', responseStatus: 201 }),
    ];

    render(
      <ApiMonitorPanel logs={logs} totalCount={2} errorCount={0} clearLogs={vi.fn()} />,
    );

    expect(screen.getByTestId('log-list')).toBeInTheDocument();
    expect(screen.getByTestId('log-entry-call-1')).toBeInTheDocument();
    expect(screen.getByTestId('log-entry-call-2')).toBeInTheDocument();
    expect(screen.getByText('getUsers')).toBeInTheDocument();
    expect(screen.getByText('createUser')).toBeInTheDocument();
  });

  it('should show total count badge', () => {
    render(
      <ApiMonitorPanel
        logs={[makeLogEntry()]}
        totalCount={5}
        errorCount={0}
        clearLogs={vi.fn()}
      />,
    );

    expect(screen.getByTestId('total-count-badge')).toHaveTextContent('5 calls');
  });

  it('should show error count badge when errors exist', () => {
    render(
      <ApiMonitorPanel
        logs={[makeLogEntry({ isError: true })]}
        totalCount={3}
        errorCount={2}
        clearLogs={vi.fn()}
      />,
    );

    expect(screen.getByTestId('error-count-badge')).toHaveTextContent('2 errors');
  });

  it('should not show error count badge when no errors', () => {
    render(
      <ApiMonitorPanel
        logs={[makeLogEntry()]}
        totalCount={1}
        errorCount={0}
        clearLogs={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('error-count-badge')).not.toBeInTheDocument();
  });

  it('should highlight error entries with error background', () => {
    const logs = [
      makeLogEntry({ id: 'call-1', isError: true, responseStatus: 500 }),
    ];

    render(
      <ApiMonitorPanel logs={logs} totalCount={1} errorCount={1} clearLogs={vi.fn()} />,
    );

    const entry = screen.getByTestId('log-entry-call-1');
    expect(entry.className).toContain('bg-error/10');
  });

  it('should filter by success when success filter clicked', () => {
    const logs = [
      makeLogEntry({ id: 'call-1', isError: false }),
      makeLogEntry({ id: 'call-2', isError: true }),
    ];

    render(
      <ApiMonitorPanel logs={logs} totalCount={2} errorCount={1} clearLogs={vi.fn()} />,
    );

    fireEvent.click(screen.getByTestId('filter-success'));

    expect(screen.getByTestId('log-entry-call-1')).toBeInTheDocument();
    expect(screen.queryByTestId('log-entry-call-2')).not.toBeInTheDocument();
  });

  it('should filter by error when error filter clicked', () => {
    const logs = [
      makeLogEntry({ id: 'call-1', isError: false }),
      makeLogEntry({ id: 'call-2', isError: true }),
    ];

    render(
      <ApiMonitorPanel logs={logs} totalCount={2} errorCount={1} clearLogs={vi.fn()} />,
    );

    fireEvent.click(screen.getByTestId('filter-error'));

    expect(screen.queryByTestId('log-entry-call-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('log-entry-call-2')).toBeInTheDocument();
  });

  it('should show all entries when all filter clicked', () => {
    const logs = [
      makeLogEntry({ id: 'call-1', isError: false }),
      makeLogEntry({ id: 'call-2', isError: true }),
    ];

    render(
      <ApiMonitorPanel logs={logs} totalCount={2} errorCount={1} clearLogs={vi.fn()} />,
    );

    // First filter to errors only
    fireEvent.click(screen.getByTestId('filter-error'));
    expect(screen.queryByTestId('log-entry-call-1')).not.toBeInTheDocument();

    // Then click All
    fireEvent.click(screen.getByTestId('filter-all'));
    expect(screen.getByTestId('log-entry-call-1')).toBeInTheDocument();
    expect(screen.getByTestId('log-entry-call-2')).toBeInTheDocument();
  });

  it('should call clearLogs when clear button clicked', () => {
    const clearLogs = vi.fn();

    render(
      <ApiMonitorPanel
        logs={[makeLogEntry()]}
        totalCount={1}
        errorCount={0}
        clearLogs={clearLogs}
      />,
    );

    fireEvent.click(screen.getByTestId('clear-logs-btn'));
    expect(clearLogs).toHaveBeenCalledTimes(1);
  });

  it('should show mock indicator for mock calls', () => {
    const logs = [makeLogEntry({ id: 'call-1', isMock: true })];

    render(
      <ApiMonitorPanel logs={logs} totalCount={1} errorCount={0} clearLogs={vi.fn()} />,
    );

    expect(screen.getByText('(mock)')).toBeInTheDocument();
  });

  it('should display duration in ms', () => {
    const logs = [makeLogEntry({ id: 'call-1', durationMs: 345 })];

    render(
      <ApiMonitorPanel logs={logs} totalCount={1} errorCount={0} clearLogs={vi.fn()} />,
    );

    expect(screen.getByText('345ms')).toBeInTheDocument();
  });
});
