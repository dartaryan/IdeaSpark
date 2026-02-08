// src/features/prototypes/components/ApiCallDetail.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiCallDetail } from './ApiCallDetail';
import type { ApiCallLogEntry } from '../types/apiMonitor';

const makeLogEntry = (overrides: Partial<ApiCallLogEntry> = {}): ApiCallLogEntry => ({
  id: 'call-1',
  timestamp: '2026-02-08T10:30:00.000Z',
  endpointName: 'getUsers',
  method: 'GET',
  url: 'https://api.example.com/users',
  requestHeaders: { 'Content-Type': 'application/json' },
  requestBody: '{"query":"test"}',
  responseStatus: 200,
  responseStatusText: 'OK',
  responseHeaders: {},
  responseBody: '{"users":[{"id":1,"name":"John"}]}',
  durationMs: 245,
  isError: false,
  isAi: false,
  isMock: false,
  errorMessage: null,
  ...overrides,
});

// Mock HTMLDialogElement methods (jsdom doesn't support them)
// close() must dispatch a 'close' event to match real browser behavior
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.dispatchEvent(new Event('close', { bubbles: false }));
  });
});

describe('ApiCallDetail', () => {
  it('should render endpoint name and method', () => {
    render(<ApiCallDetail entry={makeLogEntry()} onClose={vi.fn()} />);

    expect(screen.getByText('getUsers')).toBeInTheDocument();
    expect(screen.getByText('GET')).toBeInTheDocument();
  });

  it('should display request URL', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({ url: 'https://api.example.com/users' })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('https://api.example.com/users')).toBeInTheDocument();
  });

  it('should display duration', () => {
    render(<ApiCallDetail entry={makeLogEntry({ durationMs: 345 })} onClose={vi.fn()} />);

    expect(screen.getByText('345ms')).toBeInTheDocument();
  });

  it('should show error message for error entries', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({
          isError: true,
          errorMessage: 'Network timeout',
          responseStatus: 0,
        })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Network timeout')).toBeInTheDocument();
  });

  it('should show mock badge for mock calls', () => {
    render(
      <ApiCallDetail entry={makeLogEntry({ isMock: true })} onClose={vi.fn()} />,
    );

    expect(screen.getByText('Mock')).toBeInTheDocument();
  });

  it('should show AI badge for AI calls', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({ isAi: true, method: 'AI' })}
        onClose={vi.fn()}
      />,
    );

    // Both method badge and AI indicator badge should be present
    const aiBadges = screen.getAllByText('AI');
    expect(aiBadges.length).toBeGreaterThanOrEqual(2); // method badge + AI indicator
  });

  it('should display request and response sections', () => {
    render(<ApiCallDetail entry={makeLogEntry()} onClose={vi.fn()} />);

    expect(screen.getByTestId('request-section')).toBeInTheDocument();
    expect(screen.getByTestId('response-section')).toBeInTheDocument();
  });

  it('should render request body content', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({ requestBody: '{"query":"test"}' })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/"query": "test"/)).toBeInTheDocument();
  });

  it('should render response body content', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({ responseBody: '{"users":[]}' })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/"users"/)).toBeInTheDocument();
  });

  it('should display copy buttons for request and response', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({
          requestBody: '{"data":"test"}',
          responseBody: '{"result":"ok"}',
        })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId('copy-request-body')).toBeInTheDocument();
    expect(screen.getByTestId('copy-response-body')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<ApiCallDetail entry={makeLogEntry()} onClose={onClose} />);

    fireEvent.click(screen.getByTestId('close-detail-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should show Prompt label for AI requests', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({ isAi: true, requestBody: 'Generate a description' })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Prompt')).toBeInTheDocument();
  });

  it('should show AI Response label for AI responses', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({ isAi: true, responseBody: '{"text":"Generated text"}' })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('AI Response')).toBeInTheDocument();
  });

  it('should show request headers when present', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({
          requestHeaders: { 'Content-Type': 'application/json' },
        })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Headers')).toBeInTheDocument();
  });

  it('should show response headers when present', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({
          responseHeaders: { 'content-type': 'application/json', 'x-request-id': 'abc-123' },
        })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId('response-headers')).toBeInTheDocument();
    expect(screen.getByText(/"x-request-id": "abc-123"/)).toBeInTheDocument();
  });

  it('should not show response headers section when empty', () => {
    render(
      <ApiCallDetail
        entry={makeLogEntry({ responseHeaders: {} })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('response-headers')).not.toBeInTheDocument();
  });

  it('should call onClose when dialog close event fires (ESC key)', () => {
    const onClose = vi.fn();
    render(<ApiCallDetail entry={makeLogEntry()} onClose={onClose} />);

    const dialog = screen.getByTestId('api-call-detail-modal');
    // Simulate the native close event that browsers fire on ESC
    dialog.dispatchEvent(new Event('close', { bubbles: false }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
