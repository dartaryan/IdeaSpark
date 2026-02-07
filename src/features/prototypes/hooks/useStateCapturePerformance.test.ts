// src/features/prototypes/hooks/useStateCapturePerformance.test.ts

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStateCapturePerformance } from './useStateCapturePerformance';
import type { PrototypeState } from '../types/prototypeState';
import {
  PROTOTYPE_STATE_VERSION,
  MAX_CAPTURE_DURATION_MS,
  MAX_STATE_SIZE_BYTES,
} from '../types/prototypeState';

function makeState(
  captureDurationMs: number = 5,
  serializedSizeBytes: number = 256,
): PrototypeState {
  return {
    version: PROTOTYPE_STATE_VERSION,
    timestamp: new Date().toISOString(),
    prototypeId: 'proto-perf-1',
    route: { pathname: '/', search: '', hash: '', state: null },
    forms: {},
    components: {},
    localStorage: {},
    metadata: {
      captureDurationMs,
      serializedSizeBytes,
      capturedAt: new Date().toISOString(),
      captureMethod: 'auto',
    },
  };
}

describe('useStateCapturePerformance', () => {
  it('records a capture entry', () => {
    const { result } = renderHook(() => useStateCapturePerformance());

    let entry;
    act(() => {
      entry = result.current.recordCapture(makeState(10, 500));
    });

    expect(entry).toBeDefined();
    expect(entry!.captureDurationMs).toBe(10);
    expect(entry!.serializedSizeBytes).toBe(500);
    expect(entry!.warnings).toEqual([]);
  });

  it('flags slow captures with a warning', () => {
    const { result } = renderHook(() => useStateCapturePerformance());

    let entry;
    act(() => {
      entry = result.current.recordCapture(makeState(MAX_CAPTURE_DURATION_MS + 10, 256));
    });

    expect(entry!.warnings.length).toBeGreaterThan(0);
    expect(entry!.warnings[0]).toContain('Capture took');
  });

  it('flags oversized state with a warning', () => {
    const { result } = renderHook(() => useStateCapturePerformance());

    let entry;
    act(() => {
      entry = result.current.recordCapture(makeState(5, MAX_STATE_SIZE_BYTES + 1));
    });

    expect(entry!.warnings.length).toBeGreaterThan(0);
    expect(entry!.warnings[0]).toContain('exceeds');
  });

  it('returns recent entries', () => {
    const { result } = renderHook(() => useStateCapturePerformance());

    act(() => {
      result.current.recordCapture(makeState(5, 100));
      result.current.recordCapture(makeState(8, 200));
      result.current.recordCapture(makeState(3, 300));
    });

    const recent = result.current.getRecentEntries(2);
    expect(recent).toHaveLength(2);
    expect(recent[0].serializedSizeBytes).toBe(200);
    expect(recent[1].serializedSizeBytes).toBe(300);
  });

  it('returns all entries when count exceeds history', () => {
    const { result } = renderHook(() => useStateCapturePerformance());

    act(() => {
      result.current.recordCapture(makeState(5, 100));
    });

    const recent = result.current.getRecentEntries(10);
    expect(recent).toHaveLength(1);
  });

  it('calculates average capture duration', () => {
    const { result } = renderHook(() => useStateCapturePerformance());

    act(() => {
      result.current.recordCapture(makeState(10, 100));
      result.current.recordCapture(makeState(20, 200));
      result.current.recordCapture(makeState(30, 300));
    });

    expect(result.current.getAverageCaptureDuration()).toBe(20);
  });

  it('returns 0 average with no entries', () => {
    const { result } = renderHook(() => useStateCapturePerformance());
    expect(result.current.getAverageCaptureDuration()).toBe(0);
  });

  it('maintains rolling history with max size', () => {
    const { result } = renderHook(() => useStateCapturePerformance());

    act(() => {
      // Add 55 entries (max is 50)
      for (let i = 0; i < 55; i++) {
        result.current.recordCapture(makeState(i, i * 10));
      }
    });

    const entries = result.current.getRecentEntries(100);
    expect(entries.length).toBeLessThanOrEqual(50);
  });
});
