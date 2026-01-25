import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoSave } from './useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should initialize with idle status and no lastSaved date', () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useAutoSave({
          data: { test: 'value' },
          saveFunction: mockSave,
        })
      );

      expect(result.current.saveStatus).toBe('idle');
      expect(result.current.lastSaved).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should provide triggerSave and clearError functions', () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useAutoSave({
          data: { test: 'value' },
          saveFunction: mockSave,
        })
      );

      expect(typeof result.current.triggerSave).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('AC1: Auto-save within 1 second of change', () => {
    it('should debounce save to 1000ms by default', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            saveFunction: mockSave,
          }),
        { initialProps: { data: { test: 'initial' } } }
      );

      // Change data
      rerender({ data: { test: 'updated' } });

      // Should not save immediately
      expect(mockSave).not.toHaveBeenCalled();

      // Fast-forward 500ms - still shouldn't save
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(mockSave).not.toHaveBeenCalled();

      // Fast-forward another 500ms (1000ms total) - now should save
      await act(async () => {
        vi.advanceTimersByTime(500);
        await vi.runAllTimersAsync();
      });

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith({ test: 'updated' });
    });

    it('should use custom debounce delay when provided', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            saveFunction: mockSave,
            debounceMs: 500,
          }),
        { initialProps: { data: { test: 'initial' } } }
      );

      rerender({ data: { test: 'updated' } });

      await act(async () => {
        vi.advanceTimersByTime(500);
        await vi.runAllTimersAsync();
      });

      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('AC2: Show saved indicator for 2-3 seconds', () => {
    it('should transition through saving -> saved -> idle states', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            saveFunction: mockSave,
            savedDisplayMs: 3000,
          }),
        { initialProps: { data: { test: 'initial' } } }
      );

      // Initial state
      expect(result.current.saveStatus).toBe('idle');

      // Trigger save
      rerender({ data: { test: 'updated' } });
      
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await Promise.resolve(); // Let the promise resolve
      });

      // Should be saved
      expect(result.current.saveStatus).toBe('saved');
      expect(result.current.lastSaved).toBeInstanceOf(Date);

      // Fast-forward 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Should return to idle
      expect(result.current.saveStatus).toBe('idle');
    });
  });

  describe('AC5: Error handling with manual save capability', () => {
    it('should set error status when save fails', async () => {
      const mockSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            saveFunction: mockSave,
          }),
        { initialProps: { data: { test: 'initial' } } }
      );

      rerender({ data: { test: 'updated' } });
      
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await vi.runAllTimersAsync();
      });

      expect(result.current.saveStatus).toBe('error');
      expect(result.current.error).toBe('Save failed');
    });

    it('should clear error when clearError is called', async () => {
      const mockSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            saveFunction: mockSave,
          }),
        { initialProps: { data: { test: 'initial' } } }
      );

      rerender({ data: { test: 'updated' } });
      
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await vi.runAllTimersAsync();
      });

      expect(result.current.error).toBe('Save failed');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.saveStatus).toBe('idle');
    });
  });

  describe('AC6: Manual save capability', () => {
    it('should trigger immediate save when triggerSave is called', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useAutoSave({
          data: { test: 'value' },
          saveFunction: mockSave,
        })
      );

      // Call manual save
      await act(async () => {
        await result.current.triggerSave();
      });

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith({ test: 'value' });
      expect(result.current.saveStatus).toBe('saved');
    });

    it('should cancel pending debounced save when manual save is triggered', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            saveFunction: mockSave,
          }),
        { initialProps: { data: { test: 'initial' } } }
      );

      // Change data (starts debounce)
      rerender({ data: { test: 'updated' } });

      // Trigger manual save before debounce completes
      await act(async () => {
        await result.current.triggerSave();
      });

      expect(mockSave).toHaveBeenCalledTimes(1);

      // Fast-forward past debounce time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should still only be called once
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('AC7: Debouncing prevents excessive saves', () => {
    it('should reset debounce timer on multiple rapid changes', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            saveFunction: mockSave,
          }),
        { initialProps: { data: { count: 0 } } }
      );

      // Simulate rapid changes
      for (let i = 1; i <= 5; i++) {
        rerender({ data: { count: i } });
        act(() => {
          vi.advanceTimersByTime(500); // Less than debounce time
        });
      }

      // Save should not have been called yet
      expect(mockSave).not.toHaveBeenCalled();

      // Now wait for full debounce period after last change
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await vi.runAllTimersAsync();
      });

      // Should only save once with final value
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith({ count: 5 });
    });
  });

  describe('Concurrent Save Prevention', () => {
    it('should queue pending save if already saving', async () => {
      let resolveSave: () => void;
      const mockSave = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveSave = resolve;
          })
      );

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            saveFunction: mockSave,
          }),
        { initialProps: { data: { test: 'initial' } } }
      );

      // Trigger first save
      rerender({ data: { test: 'update1' } });
      
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.saveStatus).toBe('saving');

      // Trigger second save while first is in progress
      rerender({ data: { test: 'update2' } });
      
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // First save should still be in progress
      expect(mockSave).toHaveBeenCalledTimes(1);

      // Complete first save
      await act(async () => {
        resolveSave!();
        await Promise.resolve();
      });

      // Second save should now execute
      expect(mockSave).toHaveBeenCalledTimes(2);
      expect(mockSave).toHaveBeenNthCalledWith(1, { test: 'update1' });
      expect(mockSave).toHaveBeenNthCalledWith(2, { test: 'update2' });
    });
  });

  describe('Enabled/Disabled Control', () => {
    it('should not auto-save when enabled is false', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ data, enabled }) =>
          useAutoSave({
            data,
            saveFunction: mockSave,
            enabled,
          }),
        { initialProps: { data: { test: 'initial' }, enabled: false } }
      );

      rerender({ data: { test: 'updated' }, enabled: false });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should allow manual save even when auto-save is disabled', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useAutoSave({
          data: { test: 'value' },
          saveFunction: mockSave,
          enabled: false,
        })
      );

      await act(async () => {
        await result.current.triggerSave();
      });

      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup', () => {
    it('should clear timeouts on unmount', () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const { unmount, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            saveFunction: mockSave,
          }),
        { initialProps: { data: { test: 'initial' } } }
      );

      // Trigger save
      rerender({ data: { test: 'updated' } });

      // Unmount before save completes
      unmount();

      // Advance timers
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Save should not have been called after unmount
      expect(mockSave).not.toHaveBeenCalled();
    });
  });
});
