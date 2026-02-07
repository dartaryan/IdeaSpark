// src/features/prototypes/hooks/useSandpackStateBridge.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSandpackStateBridge } from './useSandpackStateBridge';
import type { PrototypeState, StateCaptureMessage } from '../types/prototypeState';
import { PROTOTYPE_STATE_VERSION } from '../types/prototypeState';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidState(overrides: Partial<PrototypeState> = {}): PrototypeState {
  return {
    version: PROTOTYPE_STATE_VERSION,
    timestamp: '2026-02-07T12:00:00.000Z',
    prototypeId: 'proto-abc-123',
    route: {
      pathname: '/dashboard',
      search: '?tab=overview',
      hash: '',
      state: null,
    },
    forms: {},
    components: {},
    localStorage: {},
    metadata: {
      captureDurationMs: 5,
      serializedSizeBytes: 256,
      capturedAt: '2026-02-07T12:00:00.000Z',
      captureMethod: 'auto',
    },
    ...overrides,
  };
}

function makeValidMessage(
  stateOverrides: Partial<PrototypeState> = {},
): StateCaptureMessage {
  return {
    type: 'PROTOTYPE_STATE_UPDATE',
    payload: makeValidState(stateOverrides),
    source: 'sandpack-state-capture',
  };
}

function postStateCaptureMessage(
  message: unknown,
  origin = 'http://localhost:3000',
) {
  const event = new MessageEvent('message', {
    data: message,
    origin,
  });
  window.dispatchEvent(event);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useSandpackStateBridge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- Initial state ----

  it('starts with null capturedState', () => {
    const { result } = renderHook(() => useSandpackStateBridge());
    expect(result.current.capturedState).toBeNull();
  });

  it('starts listening when enabled (default)', () => {
    const { result } = renderHook(() => useSandpackStateBridge());
    expect(result.current.isListening).toBe(true);
  });

  it('starts with no errors', () => {
    const { result } = renderHook(() => useSandpackStateBridge());
    expect(result.current.lastError).toBeNull();
  });

  it('starts with null lastUpdateTime', () => {
    const { result } = renderHook(() => useSandpackStateBridge());
    expect(result.current.lastUpdateTime).toBeNull();
  });

  // ---- enabled / disabled ----

  it('does not listen when enabled=false', () => {
    const { result } = renderHook(() =>
      useSandpackStateBridge({ enabled: false }),
    );
    expect(result.current.isListening).toBe(false);
  });

  it('ignores messages when disabled', () => {
    const { result } = renderHook(() =>
      useSandpackStateBridge({ enabled: false }),
    );

    act(() => {
      postStateCaptureMessage(makeValidMessage());
      vi.advanceTimersByTime(600);
    });

    expect(result.current.capturedState).toBeNull();
  });

  it('starts listening when re-enabled', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useSandpackStateBridge({ enabled }),
      { initialProps: { enabled: false } },
    );

    expect(result.current.isListening).toBe(false);

    rerender({ enabled: true });
    expect(result.current.isListening).toBe(true);
  });

  // ---- Valid message processing ----

  it('captures state from a valid message after debounce', () => {
    const { result } = renderHook(() => useSandpackStateBridge());

    act(() => {
      postStateCaptureMessage(makeValidMessage({ prototypeId: 'p-1' }));
      vi.advanceTimersByTime(600);
    });

    expect(result.current.capturedState).not.toBeNull();
    expect(result.current.capturedState?.prototypeId).toBe('p-1');
  });

  it('updates lastUpdateTime on valid state update', () => {
    const { result } = renderHook(() => useSandpackStateBridge());

    act(() => {
      postStateCaptureMessage(makeValidMessage());
      vi.advanceTimersByTime(600);
    });

    expect(result.current.lastUpdateTime).not.toBeNull();
    expect(typeof result.current.lastUpdateTime).toBe('number');
  });

  it('invokes onStateUpdate callback with captured state', () => {
    const onStateUpdate = vi.fn();
    renderHook(() =>
      useSandpackStateBridge({ onStateUpdate }),
    );

    act(() => {
      postStateCaptureMessage(makeValidMessage({ prototypeId: 'cb-test' }));
      vi.advanceTimersByTime(600);
    });

    expect(onStateUpdate).toHaveBeenCalledTimes(1);
    expect(onStateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ prototypeId: 'cb-test' }),
    );
  });

  it('clears previous error on successful update', () => {
    const { result } = renderHook(() => useSandpackStateBridge());

    // First send an invalid message to set an error
    act(() => {
      postStateCaptureMessage({
        type: 'PROTOTYPE_STATE_UPDATE',
        source: 'sandpack-state-capture',
        payload: { bad: true },
      });
    });

    expect(result.current.lastError).not.toBeNull();

    // Then send a valid message
    act(() => {
      postStateCaptureMessage(makeValidMessage());
      vi.advanceTimersByTime(600);
    });

    expect(result.current.lastError).toBeNull();
  });

  // ---- Debouncing ----

  it('debounces rapid state updates (only last one is used)', () => {
    const onStateUpdate = vi.fn();
    renderHook(() =>
      useSandpackStateBridge({ onStateUpdate }),
    );

    act(() => {
      // Send 3 messages in quick succession
      postStateCaptureMessage(makeValidMessage({ prototypeId: 'first' }));
      vi.advanceTimersByTime(100);
      postStateCaptureMessage(makeValidMessage({ prototypeId: 'second' }));
      vi.advanceTimersByTime(100);
      postStateCaptureMessage(makeValidMessage({ prototypeId: 'third' }));
      vi.advanceTimersByTime(600);
    });

    // Only the last update should have been processed
    expect(onStateUpdate).toHaveBeenCalledTimes(1);
    expect(onStateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ prototypeId: 'third' }),
    );
  });

  it('does not process state before debounce interval', () => {
    const { result } = renderHook(() => useSandpackStateBridge());

    act(() => {
      postStateCaptureMessage(makeValidMessage());
      vi.advanceTimersByTime(200); // Less than 500ms debounce
    });

    expect(result.current.capturedState).toBeNull();
  });

  // ---- Message validation ----

  it('ignores non-object messages', () => {
    const { result } = renderHook(() => useSandpackStateBridge());

    act(() => {
      postStateCaptureMessage('just a string');
      postStateCaptureMessage(42);
      postStateCaptureMessage(null);
      vi.advanceTimersByTime(600);
    });

    expect(result.current.capturedState).toBeNull();
  });

  it('ignores messages with wrong type', () => {
    const { result } = renderHook(() => useSandpackStateBridge());

    act(() => {
      postStateCaptureMessage({
        type: 'WRONG_TYPE',
        source: 'sandpack-state-capture',
        payload: makeValidState(),
      });
      vi.advanceTimersByTime(600);
    });

    expect(result.current.capturedState).toBeNull();
  });

  it('ignores messages with wrong source', () => {
    const { result } = renderHook(() => useSandpackStateBridge());

    act(() => {
      postStateCaptureMessage({
        type: 'PROTOTYPE_STATE_UPDATE',
        source: 'wrong-source',
        payload: makeValidState(),
      });
      vi.advanceTimersByTime(600);
    });

    expect(result.current.capturedState).toBeNull();
  });

  it('rejects messages from untrusted origins', () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useSandpackStateBridge({ onError }),
    );

    act(() => {
      postStateCaptureMessage(makeValidMessage(), 'https://evil-site.com');
      vi.advanceTimersByTime(600);
    });

    expect(result.current.capturedState).toBeNull();
    expect(result.current.lastError).not.toBeNull();
    expect(result.current.lastError?.message).toContain('untrusted origin');
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('accepts messages from sandpack origins', () => {
    const { result } = renderHook(() => useSandpackStateBridge());

    act(() => {
      postStateCaptureMessage(makeValidMessage(), 'https://bundler.sandpack.codesandbox.io');
      vi.advanceTimersByTime(600);
    });

    expect(result.current.capturedState).not.toBeNull();
  });

  it('accepts messages from codesandbox origins', () => {
    const { result } = renderHook(() => useSandpackStateBridge());

    act(() => {
      postStateCaptureMessage(makeValidMessage(), 'https://preview-abc.codesandbox.io');
      vi.advanceTimersByTime(600);
    });

    expect(result.current.capturedState).not.toBeNull();
  });

  it('rejects messages with invalid state payload (schema validation)', () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useSandpackStateBridge({ onError }),
    );

    act(() => {
      postStateCaptureMessage({
        type: 'PROTOTYPE_STATE_UPDATE',
        source: 'sandpack-state-capture',
        payload: { invalid: 'schema' },
      });
      vi.advanceTimersByTime(600);
    });

    expect(result.current.capturedState).toBeNull();
    expect(result.current.lastError).not.toBeNull();
    expect(result.current.lastError?.message).toContain('schema validation');
    expect(onError).toHaveBeenCalled();
  });

  // ---- Cleanup ----

  it('cleans up message listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useSandpackStateBridge());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
    removeEventListenerSpy.mockRestore();
  });

  it('clears debounce timer on unmount', () => {
    const { result, unmount } = renderHook(() => useSandpackStateBridge());

    act(() => {
      postStateCaptureMessage(makeValidMessage());
      // Don't advance timers — debounce is pending
    });

    unmount();

    // After unmount, advancing timers should not cause an update
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // The state at unmount should still be null (debounce was cleared)
    expect(result.current.capturedState).toBeNull();
  });

  // ---- Edge cases ----

  it('handles multiple valid updates and keeps the latest', () => {
    const { result } = renderHook(() => useSandpackStateBridge());

    // First update
    act(() => {
      postStateCaptureMessage(makeValidMessage({ prototypeId: 'first' }));
      vi.advanceTimersByTime(600);
    });
    expect(result.current.capturedState?.prototypeId).toBe('first');

    // Second update
    act(() => {
      postStateCaptureMessage(makeValidMessage({ prototypeId: 'second' }));
      vi.advanceTimersByTime(600);
    });
    expect(result.current.capturedState?.prototypeId).toBe('second');
  });

  it('preserves captured state when disabled after updates', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useSandpackStateBridge({ enabled }),
      { initialProps: { enabled: true } },
    );

    act(() => {
      postStateCaptureMessage(makeValidMessage({ prototypeId: 'test' }));
      vi.advanceTimersByTime(600);
    });

    expect(result.current.capturedState?.prototypeId).toBe('test');

    rerender({ enabled: false });

    // State persists even after disabling
    expect(result.current.capturedState?.prototypeId).toBe('test');
    expect(result.current.isListening).toBe(false);
  });
});
