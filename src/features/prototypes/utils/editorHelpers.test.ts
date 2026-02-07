// src/features/prototypes/utils/editorHelpers.test.ts
// Unit tests for editor helper utilities (Story 7.1)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DEFAULT_EDITOR_CONFIG } from '../types';
import type { EditorConfig } from '../types';

// Create a fresh localStorage mock for each test
let store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { store = {}; }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// Dynamic import to ensure localStorage mock is in place before module loads
let saveEditorPreferences: (config: EditorConfig) => void;
let loadEditorPreferences: () => EditorConfig;
let saveEditorWidth: (widthPercent: number) => void;
let loadEditorWidth: () => number;

beforeEach(async () => {
  store = {};
  localStorageMock.getItem.mockImplementation((key: string) => store[key] ?? null);
  localStorageMock.setItem.mockImplementation((key: string, value: string) => { store[key] = value; });
  localStorageMock.clear.mockImplementation(() => { store = {}; });
  vi.clearAllMocks();

  // Re-import to get fresh module
  const mod = await import('./editorHelpers');
  saveEditorPreferences = mod.saveEditorPreferences;
  loadEditorPreferences = mod.loadEditorPreferences;
  saveEditorWidth = mod.saveEditorWidth;
  loadEditorWidth = mod.loadEditorWidth;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('saveEditorPreferences', () => {
  it('should save config to localStorage', () => {
    const config: EditorConfig = {
      fontSize: 16,
      theme: 'light',
      wordWrap: true,
      lineNumbers: false,
      tabSize: 4,
    };

    saveEditorPreferences(config);

    expect(store['ideaspark_editor_preferences']).toBe(JSON.stringify(config));
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });

    // Should not throw
    saveEditorPreferences(DEFAULT_EDITOR_CONFIG);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('loadEditorPreferences', () => {
  it('should return defaults when nothing stored', () => {
    const config = loadEditorPreferences();
    expect(config).toEqual(DEFAULT_EDITOR_CONFIG);
  });

  it('should load stored preferences', () => {
    const saved: EditorConfig = {
      fontSize: 18,
      theme: 'light',
      wordWrap: true,
      lineNumbers: true,
      tabSize: 4,
    };
    store['ideaspark_editor_preferences'] = JSON.stringify(saved);

    const config = loadEditorPreferences();
    expect(config).toEqual(saved);
  });

  it('should merge with defaults for partial stored data', () => {
    store['ideaspark_editor_preferences'] = JSON.stringify({ fontSize: 20 });

    const config = loadEditorPreferences();
    expect(config.fontSize).toBe(20);
    expect(config.theme).toBe('dark'); // From defaults
    expect(config.lineNumbers).toBe(true); // From defaults
  });

  it('should return defaults for corrupted localStorage data', () => {
    store['ideaspark_editor_preferences'] = 'not-json';

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const config = loadEditorPreferences();

    expect(config).toEqual(DEFAULT_EDITOR_CONFIG);
    consoleSpy.mockRestore();
  });
});

describe('saveEditorWidth / loadEditorWidth', () => {
  it('should save and load editor width', () => {
    saveEditorWidth(60);
    expect(loadEditorWidth()).toBe(60);
  });

  it('should return 50 as default width', () => {
    expect(loadEditorWidth()).toBe(50);
  });

  it('should clamp to valid range (20-80)', () => {
    saveEditorWidth(10); // below minimum
    expect(loadEditorWidth()).toBe(50); // returns default since 10 is out of range

    saveEditorWidth(90); // above maximum
    expect(loadEditorWidth()).toBe(50); // returns default since 90 is out of range

    saveEditorWidth(40); // valid
    expect(loadEditorWidth()).toBe(40);
  });
});
