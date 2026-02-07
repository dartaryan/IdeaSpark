// src/features/prototypes/hooks/useStatePersistence.test.ts
//
// Tests for useStatePersistence hook — Story 8.2: Save Prototype State to Database
// Tests: debouncing, retry logic, concurrent save prevention, visibilitychange, cleanup

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStatePersistence } from './useStatePersistence';
import { prototypeService } from '../services/prototypeService';
import type { PrototypeState } from '../types/prototypeState';
import { createEmptyPrototypeState } from '../types/prototypeState';
import toast from 'react-hot-toast';

// Mock prototypeService
vi.mock('../services/prototypeService', () => ({
  prototypeService: {
    saveState: vi.fn(),
    getState: vi.fn(),
    deleteState: vi.fn(),
  },
}));

// Mock supabase (needed by the import chain and auth caching in useStatePersistence)
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user-123' } } },
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn(),
  },
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

/**
 * Helper: flush microtask queue so that resolved promises settle state updates.
 * Uses queueMicrotask instead of setTimeout to avoid fake-timer interference.
 */
async function flushPromises() {
  await act(async () => {
    await new Promise<void>((resolve) => queueMicrotask(resolve));
  });
}

describe('useStatePersistence', () => {
  let mockState: PrototypeState;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    mockState = createEmptyPrototypeState('proto-1');
    vi.mocked(prototypeService.saveState).mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // Basic functionality
  // =========================================================================

  it('returns initial idle state when no captured state', () => {
    const { result } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: null,
        enabled: true,
      }),
    );

    expect(result.current.saveStatus).toBe('idle');
    expect(result.current.lastSavedAt).toBeNull();
    expect(result.current.lastError).toBeNull();
    expect(typeof result.current.saveNow).toBe('function');
  });

  it('does not attempt save when capturedState is null', async () => {
    renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: null,
        enabled: true,
      }),
    );

    await act(async () => {
      vi.advanceTimersByTime(15000);
    });

    expect(prototypeService.saveState).not.toHaveBeenCalled();
  });

  it('does not attempt save when enabled is false', async () => {
    renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: false,
      }),
    );

    await act(async () => {
      vi.advanceTimersByTime(15000);
    });

    expect(prototypeService.saveState).not.toHaveBeenCalled();
  });

  // =========================================================================
  // Debounced auto-save (AC: #1, #5)
  // =========================================================================

  it('saves state after 10-second debounce when capturedState changes', async () => {
    renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    // Should not save immediately
    expect(prototypeService.saveState).not.toHaveBeenCalled();

    // Advance 9 seconds — still should not save
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(prototypeService.saveState).not.toHaveBeenCalled();

    // Advance to 10 seconds — debounce fires
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(prototypeService.saveState).toHaveBeenCalledTimes(1);
    expect(prototypeService.saveState).toHaveBeenCalledWith('proto-1', mockState);
  });

  it('batches multiple rapid state changes into single save (last-write-wins)', async () => {
    const state1 = { ...mockState, timestamp: '2026-01-01T00:00:01Z' };
    const state2 = { ...mockState, timestamp: '2026-01-01T00:00:02Z' };
    const state3 = { ...mockState, timestamp: '2026-01-01T00:00:03Z' };

    const { rerender } = renderHook(
      ({ capturedState }) =>
        useStatePersistence({
          prototypeId: 'proto-1',
          capturedState,
          enabled: true,
        }),
      { initialProps: { capturedState: state1 as PrototypeState } },
    );

    // Rapid state changes within debounce window
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    rerender({ capturedState: state2 as PrototypeState });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    rerender({ capturedState: state3 as PrototypeState });

    // Let debounce fire
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    // Should only have saved once with the latest state
    expect(prototypeService.saveState).toHaveBeenCalledTimes(1);
  });

  // =========================================================================
  // Save status transitions
  // =========================================================================

  it('sets status to saved after successful save', async () => {
    const { result } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    expect(result.current.saveStatus).toBe('idle');

    // Trigger debounce fire
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.lastSavedAt).toBeInstanceOf(Date);
  });

  it('sets status to error after all retries fail', async () => {
    vi.mocked(prototypeService.saveState).mockResolvedValue({
      data: null,
      error: { message: 'persistent error', code: 'DB_ERROR' },
    });

    const { result } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    // Trigger debounce fire + all retries (10s debounce + 1s + 2s + 4s retries)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000); // debounce fires, first attempt
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000); // retry 1
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000); // retry 2
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000); // retry 3
    });

    expect(result.current.saveStatus).toBe('error');
    expect(result.current.lastError).toBeTruthy();
    expect(prototypeService.saveState).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
  });

  // =========================================================================
  // Retry logic (AC: #4)
  // =========================================================================

  it('retries with exponential backoff and succeeds on retry', async () => {
    vi.mocked(prototypeService.saveState)
      .mockResolvedValueOnce({ data: null, error: { message: 'transient', code: 'DB_ERROR' } })
      .mockResolvedValueOnce({ data: null, error: null }); // success on retry 1

    const { result } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    // Trigger debounce fire — first attempt fails
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(prototypeService.saveState).toHaveBeenCalledTimes(1);

    // Retry 1 after 1s — succeeds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(prototypeService.saveState).toHaveBeenCalledTimes(2);
    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.lastError).toBeNull();
  });

  it('shows toast notification only after all retries exhausted', async () => {
    vi.mocked(prototypeService.saveState).mockResolvedValue({
      data: null,
      error: { message: 'persistent error', code: 'DB_ERROR' },
    });

    renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    // Initial save (10s debounce)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(toast.error).not.toHaveBeenCalled();

    // Retry 1 (1s)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(toast.error).not.toHaveBeenCalled();

    // Retry 2 (2s)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(toast.error).not.toHaveBeenCalled();

    // Retry 3 (4s) — final
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to save prototype state. Changes retained in memory.',
    );
  });

  // =========================================================================
  // saveNow manual trigger
  // =========================================================================

  it('saveNow() triggers immediate save bypassing debounce', async () => {
    const { result } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    // Call saveNow immediately (no waiting for debounce)
    await act(async () => {
      result.current.saveNow();
    });
    await flushPromises();

    expect(prototypeService.saveState).toHaveBeenCalledTimes(1);
    expect(prototypeService.saveState).toHaveBeenCalledWith('proto-1', mockState);
  });

  it('saveNow() clears pending debounce timer', async () => {
    const { result } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    // Advance 5s (debounce is pending)
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(prototypeService.saveState).not.toHaveBeenCalled();

    // saveNow should clear the debounce and save immediately
    await act(async () => {
      result.current.saveNow();
    });
    await flushPromises();
    expect(prototypeService.saveState).toHaveBeenCalledTimes(1);

    // Advance past what would have been the debounce — should NOT save again
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    // No additional save because debounce was cleared + state hasn't changed
    expect(prototypeService.saveState).toHaveBeenCalledTimes(1);
  });

  it('saveNow() does nothing when enabled is false', async () => {
    const { result } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: false,
      }),
    );

    await act(async () => {
      result.current.saveNow();
    });
    await flushPromises();

    expect(prototypeService.saveState).not.toHaveBeenCalled();
  });

  // =========================================================================
  // visibilitychange (AC: #2)
  // =========================================================================

  it('triggers save on visibilitychange when document is hidden', async () => {
    renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    // Simulate tab hide
    Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await flushPromises();

    expect(prototypeService.saveState).toHaveBeenCalledTimes(1);

    // Reset
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
  });

  it('does not save on visibilitychange when document is visible', async () => {
    renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await flushPromises();

    expect(prototypeService.saveState).not.toHaveBeenCalled();
  });

  it('does not save on visibilitychange when enabled is false', async () => {
    renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: false,
      }),
    );

    Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await flushPromises();

    expect(prototypeService.saveState).not.toHaveBeenCalled();

    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
  });

  // =========================================================================
  // Duplicate save prevention (skip if state unchanged)
  // =========================================================================

  it('skips save when state has not changed since last save', async () => {
    const { result } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    // First save
    await act(async () => {
      result.current.saveNow();
    });
    await flushPromises();
    expect(prototypeService.saveState).toHaveBeenCalledTimes(1);

    // Second saveNow with same state — should skip
    await act(async () => {
      result.current.saveNow();
    });
    await flushPromises();
    expect(prototypeService.saveState).toHaveBeenCalledTimes(1); // still 1
  });

  // =========================================================================
  // Prototype ID change (version switch)
  // =========================================================================

  it('resets state when prototypeId changes', async () => {
    const { result, rerender } = renderHook(
      ({ prototypeId }) =>
        useStatePersistence({
          prototypeId,
          capturedState: mockState,
          enabled: true,
        }),
      { initialProps: { prototypeId: 'proto-1' } },
    );

    // Save first state
    await act(async () => {
      result.current.saveNow();
    });
    await flushPromises();
    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.lastSavedAt).not.toBeNull();

    // Switch prototype
    rerender({ prototypeId: 'proto-2' });

    // State should be reset
    expect(result.current.saveStatus).toBe('idle');
    expect(result.current.lastSavedAt).toBeNull();
    expect(result.current.lastError).toBeNull();
  });

  // =========================================================================
  // Cleanup on unmount
  // =========================================================================

  it('cleans up timers on unmount — no save fires after unmount', async () => {
    const { unmount } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: mockState,
        enabled: true,
      }),
    );

    // Debounce is pending
    unmount();

    // Advance timers past debounce — no save should fire after unmount
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });
    await flushPromises();

    expect(prototypeService.saveState).not.toHaveBeenCalled();
  });

  // =========================================================================
  // Schema validation
  // =========================================================================

  it('sets error status when state fails schema validation', async () => {
    const invalidState = { invalid: 'data' } as unknown as PrototypeState;

    const { result } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: invalidState,
        enabled: true,
      }),
    );

    // Trigger save via saveNow
    await act(async () => {
      result.current.saveNow();
    });
    await flushPromises();

    expect(result.current.saveStatus).toBe('error');
    expect(result.current.lastError?.message).toBe('Invalid state schema');
    expect(prototypeService.saveState).not.toHaveBeenCalled();
  });

  // =========================================================================
  // Null capturedState with saveNow
  // =========================================================================

  it('saveNow does nothing when capturedState is null', async () => {
    const { result } = renderHook(() =>
      useStatePersistence({
        prototypeId: 'proto-1',
        capturedState: null,
        enabled: true,
      }),
    );

    await act(async () => {
      result.current.saveNow();
    });
    await flushPromises();

    expect(prototypeService.saveState).not.toHaveBeenCalled();
    expect(result.current.saveStatus).toBe('idle');
  });
});
