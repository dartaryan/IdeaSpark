// src/features/prototypes/hooks/useEditorSync.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import type { EditorFile, EditorConfig } from '../types';
import { parsePrototypeCode, DEFAULT_EDITOR_CONFIG } from '../types';
import { loadEditorPreferences, saveEditorPreferences } from '../utils/editorHelpers';

interface UseEditorSyncOptions {
  code: string | null;
  onCodeChange?: (path: string, content: string) => void;
  initialFile?: string;
}

interface UseEditorSyncReturn {
  files: Record<string, EditorFile>;
  activeFile: string;
  setActiveFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  config: EditorConfig;
  updateConfig: (partial: Partial<EditorConfig>) => void;
  resetConfig: () => void;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to manage editor state, file synchronization, and preferences.
 * Replaces Sandpack hooks with local file management from prototype `code` field.
 */
export function useEditorSync({
  code,
  onCodeChange,
  initialFile,
}: UseEditorSyncOptions): UseEditorSyncReturn {
  const [files, setFiles] = useState<Record<string, EditorFile>>({});
  const [activeFile, setActiveFile] = useState<string>('');
  const [config, setConfig] = useState<EditorConfig>(() => loadEditorPreferences());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parse code into files on mount or code change
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      const parsed = parsePrototypeCode(code);
      setFiles(parsed);

      // Set active file
      const filePaths = Object.keys(parsed);
      if (filePaths.length > 0) {
        if (initialFile && parsed[initialFile]) {
          setActiveFile(initialFile);
        } else {
          // Prefer App.tsx > index.tsx > first file
          const preferred = filePaths.find(
            (p) => p.endsWith('/App.tsx') || p.endsWith('/App.jsx'),
          ) || filePaths.find(
            (p) => p.endsWith('/index.tsx') || p.endsWith('/index.jsx'),
          ) || filePaths[0];
          setActiveFile(preferred);
        }
      }

      setIsLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to parse prototype code'));
      setIsLoading(false);
    }
  }, [code, initialFile]);

  // Debounced file content update
  const updateFileContent = useCallback(
    (path: string, content: string) => {
      setFiles((prev) => ({
        ...prev,
        [path]: {
          ...prev[path],
          content,
        },
      }));

      // Debounce external callback (300ms)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onCodeChange?.(path, content);
      }, 300);
    },
    [onCodeChange],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Config management
  const updateConfig = useCallback((partial: Partial<EditorConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...partial };
      saveEditorPreferences(updated);
      return updated;
    });
  }, []);

  const resetConfig = useCallback(() => {
    const defaults = { ...DEFAULT_EDITOR_CONFIG };
    setConfig(defaults);
    saveEditorPreferences(defaults);
  }, []);

  return {
    files,
    activeFile,
    setActiveFile,
    updateFileContent,
    config,
    updateConfig,
    resetConfig,
    isLoading,
    error,
  };
}
