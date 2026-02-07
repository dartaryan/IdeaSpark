// src/features/prototypes/components/StatePersistenceIndicator.test.tsx
//
// Tests for StatePersistenceIndicator component — Story 8.2 (AC: #1)
// Tests: rendering for each status, timestamp display, auto-hide behavior

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '../../../test/test-utils';
import { StatePersistenceIndicator } from './StatePersistenceIndicator';
import type { StatePersistenceStatus } from '../hooks/useStatePersistence';

describe('StatePersistenceIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // Saving status
  // =========================================================================

  it('renders "Saving..." with spinner when status is saving', () => {
    render(
      <StatePersistenceIndicator status="saving" lastSavedAt={null} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    expect(indicator).toHaveTextContent('Saving...');
    // Check for spinner (animate-spin class on Loader2 icon)
    const spinner = indicator.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('applies info color when saving', () => {
    render(
      <StatePersistenceIndicator status="saving" lastSavedAt={null} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    expect(indicator.className).toContain('text-info');
  });

  // =========================================================================
  // Saved status
  // =========================================================================

  it('renders "State saved" with checkmark when status is saved', () => {
    render(
      <StatePersistenceIndicator status="saved" lastSavedAt={new Date()} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    expect(indicator).toHaveTextContent('State saved');
  });

  it('applies success color when saved', () => {
    render(
      <StatePersistenceIndicator status="saved" lastSavedAt={new Date()} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    expect(indicator.className).toContain('text-success');
  });

  it('auto-hides "Saved" indicator after 3 seconds', () => {
    render(
      <StatePersistenceIndicator status="saved" lastSavedAt={new Date()} />,
    );

    // Initially visible
    expect(screen.getByTestId('state-persistence-indicator')).toHaveTextContent('State saved');

    // Advance past auto-hide timeout (3 seconds)
    act(() => {
      vi.advanceTimersByTime(3100);
    });

    // Should no longer show "State saved"
    expect(screen.queryByText('State saved')).not.toBeInTheDocument();
  });

  it('shows tooltip with last saved timestamp', () => {
    const savedAt = new Date('2026-02-07T14:30:00Z');

    render(
      <StatePersistenceIndicator status="saved" lastSavedAt={savedAt} />,
    );

    // DaisyUI tooltip uses data-tip attribute
    const tooltipWrapper = screen.getByTestId('state-persistence-indicator').closest('[data-tip]');
    expect(tooltipWrapper).toBeTruthy();
    expect(tooltipWrapper?.getAttribute('data-tip')).toContain('Last saved');
  });

  // =========================================================================
  // Error status
  // =========================================================================

  it('renders "State save failed" with warning when status is error', () => {
    render(
      <StatePersistenceIndicator status="error" lastSavedAt={null} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    expect(indicator).toHaveTextContent('State save failed');
  });

  it('applies error color when save fails', () => {
    render(
      <StatePersistenceIndicator status="error" lastSavedAt={null} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    expect(indicator.className).toContain('text-error');
  });

  // =========================================================================
  // Idle status
  // =========================================================================

  it('renders idle state with cloud icon when status is idle', () => {
    render(
      <StatePersistenceIndicator status="idle" lastSavedAt={null} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    expect(indicator).toHaveTextContent('State sync idle');
  });

  it('shows last saved time in idle state if previously saved', () => {
    const savedAt = new Date();
    savedAt.setSeconds(savedAt.getSeconds() - 5); // 5 seconds ago

    render(
      <StatePersistenceIndicator status="idle" lastSavedAt={savedAt} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    // Should show relative time like "Saved 5s ago" or "Saved just now"
    expect(indicator.textContent).toMatch(/Saved/);
  });

  it('applies subdued color in idle state', () => {
    render(
      <StatePersistenceIndicator status="idle" lastSavedAt={null} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    expect(indicator.className).toContain('text-base-content/40');
  });

  // =========================================================================
  // Accessibility
  // =========================================================================

  it('has aria-live="polite" for screen readers', () => {
    render(
      <StatePersistenceIndicator status="saving" lastSavedAt={null} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-hidden on decorative icons', () => {
    render(
      <StatePersistenceIndicator status="saving" lastSavedAt={null} />,
    );

    const indicator = screen.getByTestId('state-persistence-indicator');
    const svg = indicator.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  // =========================================================================
  // Status transitions
  // =========================================================================

  it('transitions from saving to saved correctly', () => {
    const { rerender } = render(
      <StatePersistenceIndicator status="saving" lastSavedAt={null} />,
    );

    expect(screen.getByTestId('state-persistence-indicator')).toHaveTextContent('Saving...');

    rerender(
      <StatePersistenceIndicator status="saved" lastSavedAt={new Date()} />,
    );

    expect(screen.getByTestId('state-persistence-indicator')).toHaveTextContent('State saved');
  });

  it('transitions from saving to error correctly', () => {
    const { rerender } = render(
      <StatePersistenceIndicator status="saving" lastSavedAt={null} />,
    );

    expect(screen.getByTestId('state-persistence-indicator')).toHaveTextContent('Saving...');

    rerender(
      <StatePersistenceIndicator status="error" lastSavedAt={null} />,
    );

    expect(screen.getByTestId('state-persistence-indicator')).toHaveTextContent('State save failed');
  });
});
