// src/features/prototypes/components/EditorToolbar.tsx

import { useState, useCallback } from 'react';
import { Wand2, X, Keyboard } from 'lucide-react';
import { EditorSettings } from './EditorSettings';
import type { EditorConfig } from '../types';
import { formatCode } from '../utils/editorHelpers';

interface EditorToolbarProps {
  activeFile: string;
  language: string;
  config: EditorConfig;
  onConfigChange: (config: Partial<EditorConfig>) => void;
  onConfigReset: () => void;
  onFormatCode: (formatted: string) => void;
  currentCode: string;
  onClose?: () => void;
}

/** Keyboard shortcuts help tooltip content (platform-aware) */
const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
const mod = isMac ? '⌘' : 'Ctrl';

const SHORTCUTS = [
  { keys: `${mod}+F`, action: 'Find in file' },
  { keys: `${mod}+H`, action: 'Find & Replace' },
  { keys: `${mod}+Z`, action: 'Undo' },
  { keys: `${mod}+Shift+Z`, action: 'Redo' },
  { keys: `${mod}+/`, action: 'Toggle comment' },
  { keys: `${mod}+Shift+F`, action: 'Format code' },
  { keys: 'Tab', action: 'Indent' },
  { keys: 'Shift+Tab', action: 'Outdent' },
];

export function EditorToolbar({
  activeFile,
  language,
  config,
  onConfigChange,
  onConfigReset,
  onFormatCode,
  currentCode,
  onClose,
}: EditorToolbarProps) {
  const [isFormatting, setIsFormatting] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const fileName = activeFile.split('/').pop() || activeFile;

  const handleFormat = useCallback(async () => {
    setIsFormatting(true);
    try {
      const formatted = await formatCode(currentCode, language);
      onFormatCode(formatted);
    } catch {
      // Error handled in formatCode
    } finally {
      setIsFormatting(false);
    }
  }, [currentCode, language, onFormatCode]);

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-base-200 border-b border-base-300 shrink-0">
      {/* Left: file info */}
      <div className="flex items-center gap-2 text-sm text-base-content/70 min-w-0">
        <span className="truncate font-medium" title={activeFile}>
          {fileName}
        </span>
        <span className="badge badge-xs badge-ghost">{language}</span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Format button */}
        <button
          className="btn btn-ghost btn-sm btn-square"
          onClick={handleFormat}
          disabled={isFormatting}
          aria-label="Format code (Ctrl+Shift+F)"
          title="Format code (Ctrl+Shift+F)"
        >
          {isFormatting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
        </button>

        {/* Keyboard shortcuts */}
        <div className="relative">
          <button
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => setShowShortcuts((p) => !p)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {showShortcuts && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowShortcuts(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-base-100 border border-base-300 rounded-lg shadow-xl p-3">
                <h4 className="font-semibold text-xs mb-2">Keyboard Shortcuts</h4>
                <div className="space-y-1">
                  {SHORTCUTS.map((s) => (
                    <div key={s.keys} className="flex justify-between text-xs">
                      <kbd className="kbd kbd-xs">{s.keys}</kbd>
                      <span className="text-base-content/60">{s.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <EditorSettings
          config={config}
          onChange={onConfigChange}
          onReset={onConfigReset}
        />

        {/* Close */}
        {onClose && (
          <button
            className="btn btn-ghost btn-sm btn-square"
            onClick={onClose}
            aria-label="Close editor"
            title="Close editor"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
