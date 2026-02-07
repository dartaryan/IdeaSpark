// src/features/prototypes/utils/editorHelpers.ts

import type { EditorConfig } from '../types';
import { DEFAULT_EDITOR_CONFIG, EDITOR_STORAGE_KEY } from '../types';

/**
 * Save editor preferences to localStorage.
 */
export function saveEditorPreferences(config: EditorConfig): void {
  try {
    localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save editor preferences:', e);
  }
}

/**
 * Load editor preferences from localStorage.
 */
export function loadEditorPreferences(): EditorConfig {
  try {
    const stored = localStorage.getItem(EDITOR_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing keys from older versions
      return { ...DEFAULT_EDITOR_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load editor preferences:', e);
  }
  return { ...DEFAULT_EDITOR_CONFIG };
}

/**
 * Save editor panel width to localStorage.
 */
export function saveEditorWidth(widthPercent: number): void {
  try {
    localStorage.setItem('ideaspark_editor_width', String(widthPercent));
  } catch {
    // Silently fail
  }
}

/**
 * Load editor panel width from localStorage.
 */
export function loadEditorWidth(): number {
  try {
    const stored = localStorage.getItem('ideaspark_editor_width');
    if (stored) {
      const value = Number(stored);
      if (value >= 20 && value <= 80) return value;
    }
  } catch {
    // Silently fail
  }
  return 50; // Default 50%
}

/**
 * Format code using Prettier (lazy loaded).
 */
export async function formatCode(code: string, language: string): Promise<string> {
  try {
    const prettier = await import('prettier');
    const pluginBabel = await import('prettier/plugins/babel');
    const pluginEstree = await import('prettier/plugins/estree');
    const pluginHtml = await import('prettier/plugins/html');
    const pluginCss = await import('prettier/plugins/postcss');
    const pluginTs = await import('prettier/plugins/typescript');

    const parserMap: Record<string, string> = {
      typescript: 'typescript',
      javascript: 'babel',
      css: 'css',
      html: 'html',
      json: 'json',
    };

    const parser = parserMap[language] || 'typescript';

    const formatted = await prettier.format(code, {
      parser,
      plugins: [pluginBabel, pluginEstree, pluginHtml, pluginCss, pluginTs],
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      tabWidth: 2,
      printWidth: 80,
    });

    return formatted;
  } catch (e) {
    console.error('Format failed:', e);
    throw new Error('Failed to format code');
  }
}
