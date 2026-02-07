// src/features/prototypes/hooks/useCodePersistence.test.tsx
// Unit tests for useCodePersistence hook (Story 7.3)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCodePersistence } from './useCodePersistence';
import { prototypeService } from '../services/prototypeService';
import type { Prototype } from '../types';

// Mock prototypeService
vi.mock('../services/prototypeService', () => ({
  prototypeService: {
    update: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockPrototype: Partial<Prototype> = {
  id: 'proto-1',
  code: JSON.stringify({
    '/App.tsx': 'export default function App() { return <div>Hello</div>; }',
    '/index.css': 'body { margin: 0; }',
  }),
};

const mockUpdateSuccess = () =>
  vi.mocked(prototypeService.update).mockResolvedValue({
    data: mockPrototype as Prototype,
    error: null,
  });

const mockUpdateError = () =>
  vi.mocked(prototypeService.update).mockResolvedValue({
    data: null,
    error: { message: 'Network error', code: 'UNKNOWN_ERROR' },
  });

describe('useCodePersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockUpdateSuccess();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('parses initialCode into files on mount', () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      expect(Object.keys(result.current.files)).toHaveLength(2);
      expect(result.current.files['/App.tsx']).toBeDefined();
      expect(result.current.files['/App.tsx'].content).toContain('function App');
      expect(result.current.files['/index.css']).toBeDefined();
    });

    it('handles null initialCode', () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: null,
        }),
      );

      expect(Object.keys(result.current.files)).toHaveLength(0);
    });

    it('handles single-file code string', () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: 'export default function App() { return <div>Hello</div>; }',
        }),
      );

      expect(Object.keys(result.current.files)).toHaveLength(1);
      expect(result.current.files['/App.tsx']).toBeDefined();
    });

    it('starts with idle save status', () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      expect(result.current.saveStatus).toBe('idle');
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('File Updates', () => {
    it('updates file content in state', () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'const Updated = () => <div>Updated</div>;');
      });

      expect(result.current.files['/App.tsx'].content).toBe(
        'const Updated = () => <div>Updated</div>;',
      );
    });

    it('marks hasUnsavedChanges after update', () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'updated content');
      });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('resets saveStatus to idle on new update', () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'updated content');
      });

      expect(result.current.saveStatus).toBe('idle');
    });
  });

  describe('Debounced Save', () => {
    it('does not save immediately on file update', () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'updated content');
      });

      expect(prototypeService.update).not.toHaveBeenCalled();
    });

    it('saves after 2-second debounce', async () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'updated content');
      });

      // Advance past debounce timer
      await act(async () => {
        vi.advanceTimersByTime(2100);
      });

      expect(prototypeService.update).toHaveBeenCalledTimes(1);
      expect(prototypeService.update).toHaveBeenCalledWith('proto-1', {
        code: expect.stringContaining('updated content'),
      });
    });

    it('resets debounce on rapid updates', async () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      // Multiple rapid edits
      act(() => {
        result.current.updateFile('/App.tsx', 'first edit');
      });

      act(() => {
        vi.advanceTimersByTime(1000); // 1 second - not enough
      });

      act(() => {
        result.current.updateFile('/App.tsx', 'second edit');
      });

      act(() => {
        vi.advanceTimersByTime(1000); // Another 1 second
      });

      // Should not have saved yet (debounce reset)
      expect(prototypeService.update).not.toHaveBeenCalled();

      // Advance past final debounce
      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      // Should save only once with the latest content
      expect(prototypeService.update).toHaveBeenCalledTimes(1);
      expect(prototypeService.update).toHaveBeenCalledWith('proto-1', {
        code: expect.stringContaining('second edit'),
      });
    });

    it('updates saveStatus to saving then saved on success', async () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'updated content');
      });

      await act(async () => {
        vi.advanceTimersByTime(2100);
      });

      expect(result.current.saveStatus).toBe('saved');
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('updates saveStatus to error on save failure', async () => {
      mockUpdateError();

      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'updated content');
      });

      await act(async () => {
        vi.advanceTimersByTime(2100);
      });

      expect(result.current.saveStatus).toBe('error');
    });
  });

  describe('Flush Save', () => {
    it('flushes pending save immediately', async () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'updated for flush');
      });

      // Flush before debounce fires
      await act(async () => {
        await result.current.flushSave();
      });

      expect(prototypeService.update).toHaveBeenCalledTimes(1);
      expect(prototypeService.update).toHaveBeenCalledWith('proto-1', {
        code: expect.stringContaining('updated for flush'),
      });
    });

    it('does nothing when no unsaved changes', async () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
        }),
      );

      await act(async () => {
        await result.current.flushSave();
      });

      expect(prototypeService.update).not.toHaveBeenCalled();
    });
  });

  describe('Pause Auto-Save (Story 7.4)', () => {
    it('should not trigger debounced save when pauseAutoSave is true', async () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
          pauseAutoSave: true,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'edited during pause');
      });

      // Advance well past debounce timer
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Should NOT have auto-saved
      expect(prototypeService.update).not.toHaveBeenCalled();
    });

    it('should still update local file state when paused', () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
          pauseAutoSave: true,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'local update while paused');
      });

      expect(result.current.files['/App.tsx'].content).toBe('local update while paused');
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should still mark hasUnsavedChanges when paused', () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
          pauseAutoSave: true,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'change');
      });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should resume auto-save when pauseAutoSave switches to false', async () => {
      const { result, rerender } = renderHook(
        ({ pause }) =>
          useCodePersistence({
            prototypeId: 'proto-1',
            initialCode: mockPrototype.code!,
            pauseAutoSave: pause,
          }),
        { initialProps: { pause: true } },
      );

      // Edit while paused
      act(() => {
        result.current.updateFile('/App.tsx', 'paused edit');
      });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(prototypeService.update).not.toHaveBeenCalled();

      // Resume auto-save
      rerender({ pause: false });

      // New edit should trigger auto-save
      act(() => {
        result.current.updateFile('/App.tsx', 'resumed edit');
      });

      await act(async () => {
        vi.advanceTimersByTime(2100);
      });

      expect(prototypeService.update).toHaveBeenCalledTimes(1);
      expect(prototypeService.update).toHaveBeenCalledWith('proto-1', {
        code: expect.stringContaining('resumed edit'),
      });
    });

    it('should allow manual flushSave even when paused', async () => {
      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: mockPrototype.code!,
          pauseAutoSave: true,
        }),
      );

      act(() => {
        result.current.updateFile('/App.tsx', 'manual flush');
      });

      await act(async () => {
        await result.current.flushSave();
      });

      expect(prototypeService.update).toHaveBeenCalledTimes(1);
      expect(prototypeService.update).toHaveBeenCalledWith('proto-1', {
        code: expect.stringContaining('manual flush'),
      });
    });
  });

  describe('Serialization Roundtrip', () => {
    it('preserves file content through parse → edit → serialize cycle', async () => {
      const originalCode = JSON.stringify({
        '/App.tsx': 'function App() { return <div>Original</div>; }',
        '/styles.css': '.app { color: red; }',
      });

      const { result } = renderHook(() =>
        useCodePersistence({
          prototypeId: 'proto-1',
          initialCode: originalCode,
        }),
      );

      // Verify parsed correctly
      expect(result.current.files['/App.tsx'].content).toBe(
        'function App() { return <div>Original</div>; }',
      );

      // Edit a file
      act(() => {
        result.current.updateFile('/App.tsx', 'function App() { return <div>Edited</div>; }');
      });

      // Flush save to capture serialized output
      await act(async () => {
        await result.current.flushSave();
      });

      // Verify serialized correctly (prototypeService.update receives serialized JSON)
      const savedCode = vi.mocked(prototypeService.update).mock.calls[0][1].code;
      expect(savedCode).toBeDefined();
      const parsed = JSON.parse(savedCode!);
      expect(parsed['/App.tsx']).toBe('function App() { return <div>Edited</div>; }');
      expect(parsed['/styles.css']).toBe('.app { color: red; }');
    });
  });
});
