// src/features/prototypes/components/SandpackLivePreview.tsx

import { useMemo, useEffect, useRef } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
} from '@codesandbox/sandpack-react';
import type { EditorFile } from '../types';
import { generateGuardedStateCaptureScript } from '../scripts/stateCaptureInjector';

// Note: State capture is injected ONLY via SandpackStateCaptureInjector (postMessage eval)
// after the iframe reports 'done'. Adding capture as a Sandpack file was considered but
// Sandpack doesn't auto-execute files that aren't imported by the prototype entry point.

export interface SandpackLivePreviewProps {
  /** Files from the editor in EditorFile format */
  files: Record<string, EditorFile>;
  /** Optional CSS class for the container */
  className?: string;
  /** Callback when compilation error state changes (null = no error) */
  onError?: (error: Error | null) => void;
  /** Prototype ID for state capture tagging (enables state capture when provided) */
  prototypeId?: string;
  /** Whether state capture is enabled (default: true when prototypeId is set) */
  stateCaptureEnabled?: boolean;
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
  prototypeId,
  stateCaptureEnabled = true,
}: SandpackLivePreviewProps) {
  // Determine whether to inject the state capture script (via SandpackStateCaptureInjector)
  const shouldInjectCapture = !!(prototypeId && stateCaptureEnabled);
  // Convert editor files to Sandpack format
  const sandpackFiles = useMemo(() => {
    return editorFilesToSandpackFiles(files);
  }, [files]);

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
        {/* State capture injection via Sandpack client */}
        {shouldInjectCapture && prototypeId && (
          <SandpackStateCaptureInjector prototypeId={prototypeId} />
        )}
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

/**
 * Internal component that injects the state capture script into the Sandpack iframe
 * after the prototype loads. Uses the Sandpack listen API to detect when the
 * iframe is ready, then dispatches the capture script via eval in the iframe client.
 */
function SandpackStateCaptureInjector({
  prototypeId,
}: {
  prototypeId: string;
}) {
  const { listen } = useSandpack();
  const injectedRef = useRef(false);

  useEffect(() => {
    injectedRef.current = false;

    const unsubscribe = listen((message) => {
      // The 'done' event fires when the Sandpack bundler finishes
      if (message.type === 'done' && !injectedRef.current) {
        injectedRef.current = true;
        try {
          const script = generateGuardedStateCaptureScript(prototypeId);
          // Dispatch the script to the iframe via Sandpack's internal eval
          // The iframe will execute this script in its global context
          const iframes = document.querySelectorAll<HTMLIFrameElement>(
            'iframe[title="Sandpack Preview"]',
          );
          if (iframes.length > 0) {
            const iframe = iframes[iframes.length - 1];
            // '*' targetOrigin is required because Sandpack iframes are hosted
            // on varying CDN/bundler origins that aren't known at build time.
            // The iframe-side script validates message structure before acting.
            iframe.contentWindow?.postMessage(
              {
                type: 'evaluate',
                command: script,
              },
              '*',
            );
          }
        } catch (err) {
          console.debug('[SandpackStateCaptureInjector] Injection failed:', err);
        }
      }
    });

    return () => {
      unsubscribe();
      injectedRef.current = false;
    };
  }, [prototypeId, listen]);

  return null;
}
