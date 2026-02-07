// src/features/prototypes/hooks/useEditorSync.test.tsx
// Unit tests for useEditorSync hook (Story 7.1)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorSync } from './useEditorSync';

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('useEditorSync', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty files when code is null', () => {
    const { result } = renderHook(() =>
      useEditorSync({ code: null }),
    );

    expect(result.current.files).toEqual({});
    expect(result.current.activeFile).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('should parse single file code', () => {
    const code = 'const x = 1;';
    const { result } = renderHook(() =>
      useEditorSync({ code }),
    );

    expect(Object.keys(result.current.files)).toHaveLength(1);
    expect(result.current.files['/App.tsx']).toBeDefined();
    expect(result.current.activeFile).toBe('/App.tsx');
  });

  it('should parse multi-file JSON code', () => {
    const code = JSON.stringify({
      '/src/App.tsx': 'app content',
      '/src/styles.css': 'css content',
    });

    const { result } = renderHook(() =>
      useEditorSync({ code }),
    );

    expect(Object.keys(result.current.files)).toHaveLength(2);
    expect(result.current.activeFile).toBe('/src/App.tsx'); // Prefers App.tsx
  });

  it('should prefer App.tsx as initial active file', () => {
    const code = JSON.stringify({
      '/src/index.ts': 'index',
      '/src/App.tsx': 'app',
      '/src/utils.ts': 'utils',
    });

    const { result } = renderHook(() =>
      useEditorSync({ code }),
    );

    expect(result.current.activeFile).toBe('/src/App.tsx');
  });

  it('should use initialFile when provided', () => {
    const code = JSON.stringify({
      '/src/App.tsx': 'app',
      '/src/Button.tsx': 'button',
    });

    const { result } = renderHook(() =>
      useEditorSync({ code, initialFile: '/src/Button.tsx' }),
    );

    expect(result.current.activeFile).toBe('/src/Button.tsx');
  });

  it('should update file content', () => {
    const code = JSON.stringify({ '/App.tsx': 'old content' });
    const { result } = renderHook(() =>
      useEditorSync({ code }),
    );

    act(() => {
      result.current.updateFileContent('/App.tsx', 'new content');
    });

    expect(result.current.files['/App.tsx'].content).toBe('new content');
  });

  it('should switch active file', () => {
    const code = JSON.stringify({
      '/App.tsx': 'app',
      '/Button.tsx': 'button',
    });

    const { result } = renderHook(() =>
      useEditorSync({ code }),
    );

    act(() => {
      result.current.setActiveFile('/Button.tsx');
    });

    expect(result.current.activeFile).toBe('/Button.tsx');
  });

  it('should call onCodeChange with debounce', async () => {
    vi.useFakeTimers();
    const onCodeChange = vi.fn();
    const code = JSON.stringify({ '/App.tsx': 'original' });

    const { result } = renderHook(() =>
      useEditorSync({ code, onCodeChange }),
    );

    act(() => {
      result.current.updateFileContent('/App.tsx', 'updated');
    });

    // Should not be called immediately
    expect(onCodeChange).not.toHaveBeenCalled();

    // Advance timer past debounce
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(onCodeChange).toHaveBeenCalledWith('/App.tsx', 'updated');

    vi.useRealTimers();
  });

  it('should update config and persist to localStorage', () => {
    const { result } = renderHook(() =>
      useEditorSync({ code: null }),
    );

    act(() => {
      result.current.updateConfig({ fontSize: 18 });
    });

    expect(result.current.config.fontSize).toBe(18);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ideaspark_editor_preferences',
      expect.stringContaining('"fontSize":18'),
    );
  });

  it('should reset config to defaults', () => {
    const { result } = renderHook(() =>
      useEditorSync({ code: null }),
    );

    act(() => {
      result.current.updateConfig({ fontSize: 20, theme: 'light' });
    });

    expect(result.current.config.fontSize).toBe(20);

    act(() => {
      result.current.resetConfig();
    });

    expect(result.current.config.fontSize).toBe(14);
    expect(result.current.config.theme).toBe('dark');
  });

  it('should set isLoading to false after initialization', () => {
    const { result } = renderHook(() =>
      useEditorSync({ code: 'const x = 1;' }),
    );

    expect(result.current.isLoading).toBe(false);
  });

  it('should have no error on valid code', () => {
    const { result } = renderHook(() =>
      useEditorSync({ code: 'const x = 1;' }),
    );

    expect(result.current.error).toBeNull();
  });
});
