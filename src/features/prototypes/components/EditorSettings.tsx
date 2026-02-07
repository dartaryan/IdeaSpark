// src/features/prototypes/components/EditorSettings.tsx

import { Settings, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { EditorSettingsProps } from '../types';

/** Editor settings panel for user preferences */
export function EditorSettings({ config, onChange, onReset }: EditorSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="btn btn-ghost btn-sm btn-square"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Editor settings"
        title="Editor settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Settings panel */}
          <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-base-100 border border-base-300 rounded-lg shadow-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Editor Settings</h4>
              <button
                className="btn btn-ghost btn-xs gap-1"
                onClick={onReset}
                aria-label="Reset to defaults"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Font Size */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">Font Size: {config.fontSize}px</span>
              </label>
              <input
                type="range"
                min={10}
                max={20}
                value={config.fontSize}
                onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                className="range range-xs range-primary"
                aria-label={`Font size: ${config.fontSize}px`}
              />
            </div>

            {/* Tab Size */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">Tab Size</span>
              </label>
              <div className="flex gap-2">
                {[2, 4].map((size) => (
                  <button
                    key={size}
                    className={`btn btn-xs ${config.tabSize === size ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => onChange({ tabSize: size })}
                  >
                    {size} spaces
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="form-control">
              <label className="label py-1 cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="toggle toggle-sm toggle-primary"
                  checked={config.theme === 'dark'}
                  onChange={(e) =>
                    onChange({ theme: e.target.checked ? 'dark' : 'light' })
                  }
                  aria-label="Dark theme"
                />
                <span className="label-text text-xs">Dark Theme</span>
              </label>
            </div>

            {/* Word Wrap */}
            <div className="form-control">
              <label className="label py-1 cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="toggle toggle-sm toggle-primary"
                  checked={config.wordWrap}
                  onChange={(e) => onChange({ wordWrap: e.target.checked })}
                  aria-label="Word wrap"
                />
                <span className="label-text text-xs">Word Wrap</span>
              </label>
            </div>

            {/* Line Numbers */}
            <div className="form-control">
              <label className="label py-1 cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="toggle toggle-sm toggle-primary"
                  checked={config.lineNumbers}
                  onChange={(e) => onChange({ lineNumbers: e.target.checked })}
                  aria-label="Line numbers"
                />
                <span className="label-text text-xs">Line Numbers</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
