// src/features/prototypes/components/MockResponsePreview.test.tsx

import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockResponsePreview } from './MockResponsePreview';

describe('MockResponsePreview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the Test Mock button', () => {
    render(
      <MockResponsePreview
        responseBody='{"ok": true}'
        statusCode={200}
        delayMs={0}
        hasError={false}
      />,
    );

    expect(screen.getByTestId('test-mock-btn')).toBeInTheDocument();
    expect(screen.getByText('Test Mock')).toBeInTheDocument();
  });

  it('should disable the Test Mock button when there is a JSON error', () => {
    render(
      <MockResponsePreview
        responseBody='{ invalid }'
        statusCode={200}
        delayMs={0}
        hasError={true}
      />,
    );

    expect(screen.getByTestId('test-mock-btn')).toBeDisabled();
  });

  it('should disable the Test Mock button when response body is empty', () => {
    render(
      <MockResponsePreview
        responseBody=""
        statusCode={200}
        delayMs={0}
        hasError={false}
      />,
    );

    expect(screen.getByTestId('test-mock-btn')).toBeDisabled();
  });

  it('should show preview panel with response when clicked (no delay)', () => {
    render(
      <MockResponsePreview
        responseBody='{"ok": true}'
        statusCode={200}
        delayMs={0}
        hasError={false}
      />,
    );

    fireEvent.click(screen.getByTestId('test-mock-btn'));

    expect(screen.getByTestId('mock-preview-panel')).toBeInTheDocument();
    expect(screen.getByTestId('mock-preview-status-badge')).toHaveTextContent('200');
    expect(screen.getByTestId('mock-preview-body')).toBeInTheDocument();
  });

  it('should show green badge for 2xx status codes', () => {
    render(
      <MockResponsePreview
        responseBody='{"ok": true}'
        statusCode={201}
        delayMs={0}
        hasError={false}
      />,
    );

    fireEvent.click(screen.getByTestId('test-mock-btn'));

    const badge = screen.getByTestId('mock-preview-status-badge');
    expect(badge).toHaveTextContent('201');
    expect(badge.className).toContain('badge-success');
  });

  it('should show warning badge for 4xx status codes', () => {
    render(
      <MockResponsePreview
        responseBody='{"error": "Not Found"}'
        statusCode={404}
        delayMs={0}
        hasError={false}
      />,
    );

    fireEvent.click(screen.getByTestId('test-mock-btn'));

    const badge = screen.getByTestId('mock-preview-status-badge');
    expect(badge).toHaveTextContent('404');
    expect(badge.className).toContain('badge-warning');
  });

  it('should show error badge for 5xx status codes', () => {
    render(
      <MockResponsePreview
        responseBody='{"error": "Server Error"}'
        statusCode={500}
        delayMs={0}
        hasError={false}
      />,
    );

    fireEvent.click(screen.getByTestId('test-mock-btn'));

    const badge = screen.getByTestId('mock-preview-status-badge');
    expect(badge).toHaveTextContent('500');
    expect(badge.className).toContain('badge-error');
  });

  it('should show formatted JSON in the response body', () => {
    render(
      <MockResponsePreview
        responseBody='{"id":1,"name":"test"}'
        statusCode={200}
        delayMs={0}
        hasError={false}
      />,
    );

    fireEvent.click(screen.getByTestId('test-mock-btn'));

    const body = screen.getByTestId('mock-preview-body');
    // Should be formatted with indentation
    expect(body.textContent).toContain('"id": 1');
    expect(body.textContent).toContain('"name": "test"');
  });

  it('should show loading state when delay is configured', () => {
    render(
      <MockResponsePreview
        responseBody='{"ok": true}'
        statusCode={200}
        delayMs={1000}
        hasError={false}
      />,
    );

    fireEvent.click(screen.getByTestId('test-mock-btn'));

    // Should show loading initially
    expect(screen.getByTestId('mock-preview-loading')).toBeInTheDocument();
    expect(screen.getByText('Simulating 1000ms delay...')).toBeInTheDocument();

    // Response should not be visible yet
    expect(screen.queryByTestId('mock-preview-status-badge')).not.toBeInTheDocument();
  });

  it('should show response after delay completes', () => {
    render(
      <MockResponsePreview
        responseBody='{"ok": true}'
        statusCode={200}
        delayMs={1000}
        hasError={false}
      />,
    );

    fireEvent.click(screen.getByTestId('test-mock-btn'));

    // Loading shown initially
    expect(screen.getByTestId('mock-preview-loading')).toBeInTheDocument();

    // Advance timer past the delay
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Loading should be gone, response should be visible
    expect(screen.queryByTestId('mock-preview-loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-preview-status-badge')).toHaveTextContent('200');
    expect(screen.getByTestId('mock-preview-body')).toBeInTheDocument();
  });

  it('should show delay badge when delay is configured', () => {
    render(
      <MockResponsePreview
        responseBody='{"ok": true}'
        statusCode={200}
        delayMs={500}
        hasError={false}
      />,
    );

    fireEvent.click(screen.getByTestId('test-mock-btn'));

    // Advance past delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId('mock-preview-delay-badge')).toHaveTextContent('500ms delay');
  });

  it('should not show delay badge when delay is 0', () => {
    render(
      <MockResponsePreview
        responseBody='{"ok": true}'
        statusCode={200}
        delayMs={0}
        hasError={false}
      />,
    );

    fireEvent.click(screen.getByTestId('test-mock-btn'));

    expect(screen.queryByTestId('mock-preview-delay-badge')).not.toBeInTheDocument();
  });

  it('should clear previous timer when Test Mock is clicked again during delay', () => {
    render(
      <MockResponsePreview
        responseBody='{"ok": true}'
        statusCode={200}
        delayMs={2000}
        hasError={false}
      />,
    );

    // First click — starts a 2000ms timer
    fireEvent.click(screen.getByTestId('test-mock-btn'));
    expect(screen.getByTestId('mock-preview-loading')).toBeInTheDocument();

    // Advance 500ms, then click again — should reset timer
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(screen.getByTestId('test-mock-btn'));

    // Should still be loading (new timer started)
    expect(screen.getByTestId('mock-preview-loading')).toBeInTheDocument();

    // Advance past old timer (1500ms more) — should still be loading because new timer is 2000ms
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByTestId('mock-preview-loading')).toBeInTheDocument();

    // Advance remaining 500ms — new timer completes
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByTestId('mock-preview-loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-preview-status-badge')).toBeInTheDocument();
  });

  it('should close preview when response body changes', () => {
    const { rerender } = render(
      <MockResponsePreview
        responseBody='{"ok": true}'
        statusCode={200}
        delayMs={0}
        hasError={false}
      />,
    );

    // Open the preview
    fireEvent.click(screen.getByTestId('test-mock-btn'));
    expect(screen.getByTestId('mock-preview-panel')).toBeInTheDocument();

    // Change the response body — preview should close
    rerender(
      <MockResponsePreview
        responseBody='{"ok": false}'
        statusCode={200}
        delayMs={0}
        hasError={false}
      />,
    );

    expect(screen.queryByTestId('mock-preview-panel')).not.toBeInTheDocument();
  });
});
