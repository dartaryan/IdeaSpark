// src/features/prototypes/components/PublicSandpackPreview.tsx

import { useMemo } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
} from '@codesandbox/sandpack-react';
import { parsePrototypeCode } from '../types';

export interface PublicSandpackPreviewProps {
  /** Raw prototype code string (JSON multi-file or single-file) */
  code: string;
  /** Optional CSS class for the container */
  className?: string;
}

/**
 * PublicSandpackPreview - Simplified Sandpack preview for public prototype viewers.
 *
 * Unlike the internal SandpackLivePreview, this component:
 * - Takes raw `code` string (not EditorFile records) and parses internally
 * - Does NOT inject state capture scripts (public viewers don't persist state)
 * - Does NOT have error callbacks (no editor integration)
 * - Does NOT require prototypeId
 *
 * Same Sandpack config (template, dependencies) as the internal viewer for consistency.
 */
export function PublicSandpackPreview({
  code,
  className = '',
}: PublicSandpackPreviewProps) {
  // Parse code string into EditorFile records, then convert to Sandpack format
  const sandpackFiles = useMemo(() => {
    const editorFiles = parsePrototypeCode(code);
    const files: Record<string, { code: string }> = {};
    for (const [path, file] of Object.entries(editorFiles)) {
      files[path] = { code: file.content };
    }
    return files;
  }, [code]);

  const hasFiles = Object.keys(sandpackFiles).length > 0;

  if (!hasFiles) {
    return (
      <div
        className={`flex items-center justify-center bg-base-200 rounded-lg min-h-[400px] ${className}`}
        data-testid="public-sandpack-no-files"
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
      data-testid="public-sandpack-preview"
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
        }}
      >
        <SandpackPreview
          showOpenInCodeSandbox={false}
          showRefreshButton={true}
          style={{ height: '100%', minHeight: '400px' }}
        />
      </SandpackProvider>
    </div>
  );
}
