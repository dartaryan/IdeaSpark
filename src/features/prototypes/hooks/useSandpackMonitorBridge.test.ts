// src/features/prototypes/hooks/useSandpackMonitorBridge.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSandpackMonitorBridge } from './useSandpackMonitorBridge';
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

function postMonitorMessage(entry: ApiCallLogEntry, origin = '') {
  const event = new MessageEvent('message', {
    data: {
      type: 'API_CALL_LOG',
      payload: entry,
      source: 'sandpack-api-monitor',
    },
    origin,
  });
  window.dispatchEvent(event);
}

describe('useSandpackMonitorBridge', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with empty logs', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());
    expect(result.current.logs).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.errorCount).toBe(0);
  });

  it('should add valid API_CALL_LOG messages to logs', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());
    const entry = makeLogEntry();

    act(() => {
      postMonitorMessage(entry);
    });

    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0]).toEqual(entry);
    expect(result.current.totalCount).toBe(1);
  });

  it('should reject messages with wrong type', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'WRONG_TYPE',
          payload: makeLogEntry(),
          source: 'sandpack-api-monitor',
        },
      }));
    });

    expect(result.current.logs).toHaveLength(0);
  });

  it('should reject messages with wrong source', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'API_CALL_LOG',
          payload: makeLogEntry(),
          source: 'wrong-source',
        },
      }));
    });

    expect(result.current.logs).toHaveLength(0);
  });

  it('should reject messages from untrusted origins', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());

    act(() => {
      postMonitorMessage(makeLogEntry(), 'https://evil.example.com');
    });

    expect(result.current.logs).toHaveLength(0);
  });

  it('should accept messages from sandpack origins', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());

    act(() => {
      postMonitorMessage(makeLogEntry(), 'https://sandpack-bundler.example.com');
    });

    expect(result.current.logs).toHaveLength(1);
  });

  it('should accept messages from localhost origins', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());

    act(() => {
      postMonitorMessage(makeLogEntry(), 'http://localhost:3000');
    });

    expect(result.current.logs).toHaveLength(1);
  });

  it('should enforce max entries (FIFO)', () => {
    const { result } = renderHook(() =>
      useSandpackMonitorBridge({ maxEntries: 3 }),
    );

    act(() => {
      postMonitorMessage(makeLogEntry({ id: 'call-1' }));
      postMonitorMessage(makeLogEntry({ id: 'call-2' }));
      postMonitorMessage(makeLogEntry({ id: 'call-3' }));
      postMonitorMessage(makeLogEntry({ id: 'call-4' }));
    });

    expect(result.current.logs).toHaveLength(3);
    expect(result.current.logs[0].id).toBe('call-2'); // First entry evicted
    expect(result.current.logs[2].id).toBe('call-4');
  });

  it('should count errors correctly', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());

    act(() => {
      postMonitorMessage(makeLogEntry({ id: 'call-1', isError: false }));
      postMonitorMessage(makeLogEntry({ id: 'call-2', isError: true }));
      postMonitorMessage(makeLogEntry({ id: 'call-3', isError: false }));
      postMonitorMessage(makeLogEntry({ id: 'call-4', isError: true }));
    });

    expect(result.current.totalCount).toBe(4);
    expect(result.current.errorCount).toBe(2);
  });

  it('should clear logs when clearLogs is called', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());

    act(() => {
      postMonitorMessage(makeLogEntry({ id: 'call-1' }));
      postMonitorMessage(makeLogEntry({ id: 'call-2' }));
    });

    expect(result.current.logs).toHaveLength(2);

    act(() => {
      result.current.clearLogs();
    });

    expect(result.current.logs).toHaveLength(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.errorCount).toBe(0);
  });

  it('should not listen when disabled', () => {
    const { result } = renderHook(() =>
      useSandpackMonitorBridge({ enabled: false }),
    );

    act(() => {
      postMonitorMessage(makeLogEntry());
    });

    expect(result.current.logs).toHaveLength(0);
  });

  it('should start listening when re-enabled', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useSandpackMonitorBridge({ enabled }),
      { initialProps: { enabled: false } },
    );

    act(() => {
      postMonitorMessage(makeLogEntry({ id: 'call-disabled' }));
    });
    expect(result.current.logs).toHaveLength(0);

    rerender({ enabled: true });

    act(() => {
      postMonitorMessage(makeLogEntry({ id: 'call-enabled' }));
    });
    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0].id).toBe('call-enabled');
  });

  it('should clean up listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useSandpackMonitorBridge());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should reject non-object messages', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());

    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: 'string-message' }));
      window.dispatchEvent(new MessageEvent('message', { data: null }));
      window.dispatchEvent(new MessageEvent('message', { data: 42 }));
    });

    expect(result.current.logs).toHaveLength(0);
  });

  it('should reject entries with missing required fields', () => {
    const { result } = renderHook(() => useSandpackMonitorBridge());

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'API_CALL_LOG',
          payload: { notAnEntry: true },
          source: 'sandpack-api-monitor',
        },
      }));
    });

    expect(result.current.logs).toHaveLength(0);
  });
});
