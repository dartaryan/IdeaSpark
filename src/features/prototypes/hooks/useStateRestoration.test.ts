import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStateRestoration } from './useStateRestoration';
import type { PrototypeState } from '../types/prototypeState';
import { createEmptyPrototypeState } from '../types/prototypeState';

function createMockSavedState(prototypeId = 'proto-123'): PrototypeState {
  const base = createEmptyPrototypeState(prototypeId);
  return {
    ...base,
    route: { pathname: '/dashboard', search: '?tab=settings', hash: '#section-1', state: null },
    forms: { username: { value: 'john', type: 'text' } },
    localStorage: { theme: 'dark' },
    components: { toggle1: { type: 'toggle', state: true } },
  };
}

function createMockIframe(): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.title = 'Sandpack Preview';
  Object.defineProperty(iframe, 'contentWindow', {
    value: { postMessage: vi.fn() },
    writable: true,
  });
  document.body.appendChild(iframe);
  return iframe;
}

function removeMockIframes(): void {
  document.querySelectorAll('iframe[title="Sandpack Preview"]').forEach((el) => el.remove());
}

function sendAck(success = true, error?: string) {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: { type: 'RESTORE_STATE_ACK', success, error, source: 'sandpack-state-capture' },
    }),
  );
}

describe('useStateRestoration', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    removeMockIframes();
  });

  afterEach(() => {
    removeMockIframes();
    vi.useRealTimers();
  });

  // ---------- Guards ----------

  it('starts with idle status and exposes restoreNow', () => {
    const { result } = renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: null, enabled: false, iframeReady: false }),
    );
    expect(result.current.restorationStatus).toBe('idle');
    expect(result.current.restorationError).toBeNull();
    expect(typeof result.current.restoreNow).toBe('function');
  });

  it('does not restore when savedState is null', () => {
    const iframe = createMockIframe();
    renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: null, enabled: true, iframeReady: true }),
    );
    expect(iframe.contentWindow!.postMessage).not.toHaveBeenCalled();
  });

  it('does not restore when enabled is false', () => {
    const iframe = createMockIframe();
    renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: createMockSavedState(), enabled: false, iframeReady: true }),
    );
    expect(iframe.contentWindow!.postMessage).not.toHaveBeenCalled();
  });

  it('does not restore when iframeReady is false', () => {
    const iframe = createMockIframe();
    renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: createMockSavedState(), enabled: true, iframeReady: false }),
    );
    expect(iframe.contentWindow!.postMessage).not.toHaveBeenCalled();
  });

  // ---------- Successful flow ----------

  it('sends RESTORE_STATE and transitions to restoring', async () => {
    const iframe = createMockIframe();
    const savedState = createMockSavedState();
    const { result } = renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState, enabled: true, iframeReady: true }),
    );

    await waitFor(() => expect(result.current.restorationStatus).toBe('restoring'));
    expect(iframe.contentWindow!.postMessage).toHaveBeenCalledWith(
      { type: 'RESTORE_STATE', payload: savedState, source: 'ideaspark-parent' },
      '*',
    );

    act(() => sendAck(true)); // clean up
  });

  it('transitions to restored after successful ack', async () => {
    createMockIframe();
    const { result } = renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: createMockSavedState(), enabled: true, iframeReady: true }),
    );
    await waitFor(() => expect(result.current.restorationStatus).toBe('restoring'));

    act(() => sendAck(true));

    await waitFor(() => {
      expect(result.current.restorationStatus).toBe('restored');
      expect(result.current.restorationError).toBeNull();
    });
  });

  // ---------- Error flows ----------

  it('transitions to error when ack reports failure', async () => {
    createMockIframe();
    const { result } = renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: createMockSavedState(), enabled: true, iframeReady: true }),
    );
    await waitFor(() => expect(result.current.restorationStatus).toBe('restoring'));

    act(() => sendAck(false, 'Route restoration failed'));

    await waitFor(() => {
      expect(result.current.restorationStatus).toBe('error');
      expect(result.current.restorationError?.message).toBe('Route restoration failed');
    });
  });

  it('sets error when iframe is not found', async () => {
    // No iframe in the DOM
    const { result } = renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: createMockSavedState(), enabled: true, iframeReady: true }),
    );
    await waitFor(() => {
      expect(result.current.restorationStatus).toBe('error');
      expect(result.current.restorationError?.message).toBe('Sandpack iframe not found');
    });
  });

  it('does not restore twice (hasRestoredRef guard)', async () => {
    const iframe = createMockIframe();
    renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: createMockSavedState(), enabled: true, iframeReady: true }),
    );
    await waitFor(() => expect(iframe.contentWindow!.postMessage).toHaveBeenCalledTimes(1));
    act(() => sendAck(true));
  });

  it('ignores ack from unknown source', async () => {
    createMockIframe();
    const { result } = renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: createMockSavedState(), enabled: true, iframeReady: true }),
    );
    await waitFor(() => expect(result.current.restorationStatus).toBe('restoring'));

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'RESTORE_STATE_ACK', success: true, source: 'wrong-source' },
        }),
      );
    });
    expect(result.current.restorationStatus).toBe('restoring'); // still restoring

    act(() => sendAck(true)); // clean up
  });

  it('ignores ack from untrusted origin (review fix M1)', async () => {
    createMockIframe();
    const { result } = renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: createMockSavedState(), enabled: true, iframeReady: true }),
    );
    await waitFor(() => expect(result.current.restorationStatus).toBe('restoring'));

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://evil-site.com',
          data: { type: 'RESTORE_STATE_ACK', success: true, source: 'sandpack-state-capture' },
        }),
      );
    });
    expect(result.current.restorationStatus).toBe('restoring'); // still restoring — rejected

    act(() => sendAck(true)); // clean up with valid ack
  });

  // ---------- Dynamic prop changes ----------

  it('triggers restore when iframeReady toggles to true', async () => {
    const iframe = createMockIframe();
    const savedState = createMockSavedState();
    const { result, rerender } = renderHook(
      (props) => useStateRestoration(props),
      { initialProps: { prototypeId: 'p1', savedState, enabled: true, iframeReady: false } },
    );
    expect(result.current.restorationStatus).toBe('idle');

    rerender({ prototypeId: 'p1', savedState, enabled: true, iframeReady: true });
    await waitFor(() => {
      expect(result.current.restorationStatus).toBe('restoring');
      expect(iframe.contentWindow!.postMessage).toHaveBeenCalledTimes(1);
    });

    act(() => sendAck(true));
  });

  it('resets on prototypeId change', async () => {
    createMockIframe();
    const savedState = createMockSavedState();
    const { result, rerender } = renderHook(
      (props) => useStateRestoration(props),
      { initialProps: { prototypeId: 'p1', savedState, enabled: true, iframeReady: true } },
    );
    await waitFor(() => expect(result.current.restorationStatus).toBe('restoring'));
    act(() => sendAck(true));
    await waitFor(() => expect(result.current.restorationStatus).toBe('restored'));

    rerender({ prototypeId: 'p2', savedState, enabled: true, iframeReady: true });
    await waitFor(() => expect(['idle', 'restoring']).toContain(result.current.restorationStatus));

    act(() => sendAck(true)); // clean up
  });

  // ---------- Timeout (fake timers) — kept last to avoid contamination ----------

  it('times out after 5 seconds without ack', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    createMockIframe();
    const { result } = renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: createMockSavedState(), enabled: true, iframeReady: true }),
    );

    await waitFor(() => expect(result.current.restorationStatus).toBe('restoring'));

    act(() => vi.advanceTimersByTime(5001));

    await waitFor(() => {
      expect(result.current.restorationStatus).toBe('error');
      expect(result.current.restorationError?.message).toBe('Restoration timeout');
    });
  });

  it('clears timeout after successful ack (no double error)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    createMockIframe();
    const { result } = renderHook(() =>
      useStateRestoration({ prototypeId: 'p1', savedState: createMockSavedState(), enabled: true, iframeReady: true }),
    );
    await waitFor(() => expect(result.current.restorationStatus).toBe('restoring'));

    act(() => sendAck(true));
    await waitFor(() => expect(result.current.restorationStatus).toBe('restored'));

    act(() => vi.advanceTimersByTime(5001));
    expect(result.current.restorationStatus).toBe('restored');
    expect(result.current.restorationError).toBeNull();
  });
});
