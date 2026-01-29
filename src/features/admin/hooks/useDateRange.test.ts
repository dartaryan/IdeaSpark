/**
 * Story 6.7 Task 14: Unit tests for useDateRange hook
 * Subtask 14.14-14.18: Test hook initialization, state updates, and localStorage persistence
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDateRange } from './useDateRange';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useDateRange', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
    
    // Clear URL params by mocking window.location
    delete (window as any).location;
    (window as any).location = {
      search: '',
      pathname: '/admin/analytics',
    };
    
    // Mock window.history.pushState
    window.history.pushState = vi.fn();
  });

  it('should initialize with default preset (last30days)', () => {
    const { result } = renderHook(() => useDateRange());

    expect(result.current.selectedPreset).toBe('last30days');
    expect(result.current.currentRange.label).toBe('Last 30 days');
    expect(result.current.currentRange.start).toBeInstanceOf(Date);
    expect(result.current.currentRange.end).toBeInstanceOf(Date);
  });

  it('should initialize with custom default preset', () => {
    const { result } = renderHook(() => useDateRange('last7days'));

    expect(result.current.selectedPreset).toBe('last7days');
    expect(result.current.currentRange.label).toBe('Last 7 days');
  });

  it('should update state when setPreset is called', () => {
    const { result } = renderHook(() => useDateRange());

    act(() => {
      result.current.setPreset('last90days');
    });

    expect(result.current.selectedPreset).toBe('last90days');
    expect(result.current.currentRange.label).toBe('Last 90 days');
  });

  it('should update state when setCustomRange is called', () => {
    const { result } = renderHook(() => useDateRange());

    const customRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-28'),
      label: 'Custom',
    };

    act(() => {
      result.current.setCustomRange(customRange);
    });

    expect(result.current.selectedPreset).toBe('custom');
    expect(result.current.currentRange.label).toBe('Custom');
    expect(result.current.currentRange.start).toEqual(customRange.start);
    expect(result.current.currentRange.end).toEqual(customRange.end);
  });

  it('should persist preset to localStorage when setPreset is called', () => {
    const { result } = renderHook(() => useDateRange());

    act(() => {
      result.current.setPreset('last90days');
    });

    const stored = localStorage.getItem('ideaspark-analytics-date-range-preset');
    expect(stored).toBeTruthy();
    
    const parsed = JSON.parse(stored!);
    expect(parsed.preset).toBe('last90days');
    expect(parsed.lastUpdated).toBeTruthy();
  });

  it('should load persisted preset from localStorage on mount', () => {
    // Pre-populate localStorage
    const storedData = {
      preset: 'last7days',
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('ideaspark-analytics-date-range-preset', JSON.stringify(storedData));

    const { result } = renderHook(() => useDateRange());

    expect(result.current.selectedPreset).toBe('last7days');
    expect(result.current.currentRange.label).toBe('Last 7 days');
  });

  it('should fallback to default if localStorage is corrupted', () => {
    // Store invalid JSON
    localStorage.setItem('ideaspark-analytics-date-range-preset', 'invalid-json');

    const { result } = renderHook(() => useDateRange());

    // Should fallback to default (last30days)
    expect(result.current.selectedPreset).toBe('last30days');
    expect(result.current.currentRange.label).toBe('Last 30 days');
  });

  it('should fallback to default if localStorage preset is invalid', () => {
    // Store invalid preset
    const storedData = {
      preset: 'invalid_preset',
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('ideaspark-analytics-date-range-preset', JSON.stringify(storedData));

    const { result } = renderHook(() => useDateRange());

    // Should fallback to default (last30days)
    expect(result.current.selectedPreset).toBe('last30days');
  });

  it('should handle alltime preset correctly', () => {
    const { result } = renderHook(() => useDateRange());

    act(() => {
      result.current.setPreset('alltime');
    });

    expect(result.current.selectedPreset).toBe('alltime');
    expect(result.current.currentRange.label).toBe('All time');
    expect(result.current.currentRange.start).toBeNull();
  });

  it('should provide all required hook return values', () => {
    const { result } = renderHook(() => useDateRange());

    expect(result.current).toHaveProperty('currentRange');
    expect(result.current).toHaveProperty('selectedPreset');
    expect(result.current).toHaveProperty('setPreset');
    expect(result.current).toHaveProperty('setCustomRange');
    
    expect(typeof result.current.setPreset).toBe('function');
    expect(typeof result.current.setCustomRange).toBe('function');
  });
});
