// src/features/prototypes/components/SandpackLivePreview.tsx

import { useMemo, useEffect, useRef } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
} from '@codesandbox/sandpack-react';
import type { EditorFile } from '../types';

export interface SandpackLivePreviewProps {
  /** Files from the editor in EditorFile format */
  files: Record<string, EditorFile>;
  /** Optional CSS class for the container */
  className?: string;
  /** Callback when compilation error state changes (null = no error) */
  onError?: (error: Error | null) => void;
}

/**
 * Convert EditorFile format to Sandpack file format.
 * Sandpack expects: { "/path": { code: "..." } }
 */
function editorFilesToSandpackFiles(
  files: Record<string, EditorFile>,
): Record<string, { code: string }> {
  const sandpackFiles: Record<string, { code: string }> = {};
  for (const [path, file] of Object.entries(files)) {
    sandpackFiles[path] = { code: file.content };
  }
  return sandpackFiles;
}

/**
 * SandpackLivePreview - Live in-browser preview using Sandpack runtime.
 *
 * Uses our own CodeMirror editor for editing; Sandpack is ONLY the preview runtime.
 * Architecture: CodeMirror → useEditorSync → SandpackProvider (files prop) → SandpackPreview (hot reload)
 */
export function SandpackLivePreview({
  files,
  className = '',
  onError,
}: SandpackLivePreviewProps) {
  // Convert editor files to Sandpack format
  const sandpackFiles = useMemo(() => editorFilesToSandpackFiles(files), [files]);

  const hasFiles = Object.keys(files).length > 0;

  if (!hasFiles) {
    return (
      <div
        className={`flex items-center justify-center bg-base-200 rounded-lg min-h-[400px] ${className}`}
        data-testid="sandpack-no-files"
      >
        <p className="text-base-content/50 text-sm italic">
          No code available for preview
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg overflow-hidden border border-[#E10514]/20 ${className}`}
      data-testid="sandpack-live-preview"
    >
      <SandpackProvider
        template="react-ts"
        files={sandpackFiles}
        customSetup={{
          dependencies: {
            'react-router-dom': '^6.28.0',
          },
        }}
        options={{
          autorun: true,
          autoReload: true,
          recompileMode: 'delayed',
          recompileDelay: 300,
        }}
      >
        <SandpackPreview
          showOpenInCodeSandbox={false}
          showRefreshButton={true}
          style={{ height: '100%', minHeight: '400px' }}
        />
        {/* Error listener bridge */}
        {onError && <SandpackErrorListener onError={onError} />}
      </SandpackProvider>
    </div>
  );
}

/**
 * Internal component to listen for Sandpack errors and relay them
 * via the onError callback. Uses useSandpack hook (must be inside SandpackProvider).
 */
function SandpackErrorListener({
  onError,
}: {
  onError: (error: Error | null) => void;
}) {
  const { sandpack } = useSandpack();
  const prevErrorRef = useRef<string | null>(null);

  useEffect(() => {
    const currentError = sandpack.error?.message || null;

    // Only fire callback when error state actually changes
    if (currentError !== prevErrorRef.current) {
      prevErrorRef.current = currentError;
      if (currentError) {
        onError(new Error(currentError));
      } else {
        onError(null);
      }
    }
  }, [sandpack.error, onError]);

  return null;
}
