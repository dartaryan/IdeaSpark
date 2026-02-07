// src/features/prototypes/components/CodeEditorPanel.tsx

import { Component, useCallback, useState, Suspense, lazy, useEffect, useRef } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEditorSync } from '../hooks/useEditorSync';
import { FileTree } from './FileTree';
import { EditorToolbar } from './EditorToolbar';
import type { CodeEditorPanelProps } from '../types';
import { detectLanguage } from '../types';

// Lazy load the CodeMirror editor for performance (only loads when panel is visible)
const CodeMirrorEditor = lazy(() =>
  import('./CodeMirrorEditor').then((m) => ({ default: m.CodeMirrorEditor })),
);

/** Loading skeleton while editor initializes */
function EditorSkeleton() {
  return (
    <div className="h-full flex items-center justify-center bg-base-200" role="status">
      <div className="text-center">
        <span className="loading loading-spinner loading-md" />
        <p className="mt-2 text-sm text-base-content/50">Loading editor...</p>
      </div>
    </div>
  );
}

/** Error boundary for the lazy-loaded CodeMirror editor */
class EditorErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CodeMirror editor error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-base-200 p-4">
          <div className="text-center">
            <p className="text-error font-medium mb-1">Editor failed to load</p>
            <p className="text-xs text-base-content/50">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * CodeEditorPanel - Main code editor component.
 * Renders a CodeMirror editor with file tree, toolbar, and settings.
 * Integrates with prototype `code` field for file management.
 */
export function CodeEditorPanel({
  code,
  onCodeChange,
  onClose,
  initialFile,
  readOnly: readOnlyProp,
  hasCompilationError = false,
}: CodeEditorPanelProps) {
  const {
    files,
    activeFile,
    setActiveFile,
    updateFileContent,
    config,
    updateConfig,
    resetConfig,
    isLoading,
    error,
  } = useEditorSync({ code, onCodeChange, initialFile });

  // Auto-detect read-only mode when onCodeChange is not provided
  const isReadOnly = readOnlyProp ?? !onCodeChange;

  const [showFileTree, setShowFileTree] = useState(true);
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFileData = files[activeFile];
  const language = activeFileData ? detectLanguage(activeFile) : 'typescript';
  const currentContent = activeFileData?.content || '';
  const lineCount = currentContent ? currentContent.split('\n').length : 0;

  // Handle editor content changes
  const handleEditorChange = useCallback(
    (value: string) => {
      updateFileContent(activeFile, value);
    },
    [activeFile, updateFileContent],
  );

  // Handle format code result
  const handleFormatCode = useCallback(
    (formatted: string) => {
      updateFileContent(activeFile, formatted);
    },
    [activeFile, updateFileContent],
  );

  // Copy to clipboard handler
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopyState('success');
    } catch {
      // Fallback for older browsers or non-HTTPS contexts
      let textarea: HTMLTextAreaElement | null = null;
      try {
        textarea = document.createElement('textarea');
        textarea.value = currentContent;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        if (!ok) throw new Error('execCommand copy returned false');
        setCopyState('success');
      } catch {
        setCopyState('error');
        toast.error('Failed to copy to clipboard');
      } finally {
        if (textarea && document.body.contains(textarea)) {
          document.body.removeChild(textarea);
        }
      }
    }

    // Reset copy state after 2 seconds
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyState('idle'), 2000);
  }, [currentContent]);

  // Cleanup copy timer
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Global keyboard shortcut: Ctrl+Shift+F for format (disabled in read-only)
  useEffect(() => {
    if (isReadOnly) return;

    let isMounted = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+Shift+F: Format code
      if (modKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        // Trigger format via toolbar button (async)
        import('../utils/editorHelpers').then(({ formatCode }) => {
          formatCode(currentContent, language).then((formatted) => {
            if (isMounted) handleFormatCode(formatted);
          }).catch(() => {});
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReadOnly, currentContent, language, handleFormatCode]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-base-100 border-l border-primary/30">
        <EditorSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col bg-base-100 border-l border-primary/30">
        <div className="flex items-center justify-between px-3 py-2 bg-base-200 border-b border-base-300">
          <span className="text-sm font-medium text-error">Editor Error</span>
          {onClose && (
            <button className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Close editor">
              &times;
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-error mb-2">Failed to load editor</p>
            <p className="text-sm text-base-content/60">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // No files state
  if (Object.keys(files).length === 0) {
    return (
      <div className="h-full flex flex-col bg-base-100 border-l border-primary/30">
        <div className="flex items-center justify-between px-3 py-2 bg-base-200 border-b border-base-300">
          <span className="text-sm font-medium">Code Editor</span>
          {onClose && (
            <button className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Close editor">
              &times;
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-base-content/50 text-sm italic">No code available for this prototype</p>
        </div>
      </div>
    );
  }

  const fileCount = Object.keys(files).length;

  return (
    <div className="h-full flex flex-col bg-base-100 border-l border-primary/30" data-testid="code-editor-panel">
      {/* Toolbar */}
      <EditorToolbar
        activeFile={activeFile}
        language={language}
        config={config}
        onConfigChange={updateConfig}
        onConfigReset={resetConfig}
        onFormatCode={handleFormatCode}
        currentCode={currentContent}
        onClose={onClose}
        readOnly={isReadOnly}
        lineCount={lineCount}
        onCopy={handleCopy}
        copyState={copyState}
        hasCompilationError={hasCompilationError}
      />

      {/* Body: file tree + editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* File tree sidebar (collapsible) */}
        {fileCount > 1 && (
          <>
            {showFileTree && (
              <div className="w-48 shrink-0 border-r border-base-300 overflow-y-auto bg-base-200/50">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-base-300">
                  <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                    Files
                  </span>
                  <button
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => setShowFileTree(false)}
                    aria-label="Collapse file tree"
                    title="Collapse file tree"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                </div>
                <FileTree
                  files={files}
                  activeFile={activeFile}
                  onFileSelect={setActiveFile}
                />
              </div>
            )}

            {!showFileTree && (
              <button
                className="shrink-0 w-8 flex items-center justify-center border-r border-base-300 bg-base-200/50 hover:bg-base-300/50 transition-colors"
                onClick={() => setShowFileTree(true)}
                aria-label="Expand file tree"
                title="Expand file tree"
              >
                <PanelLeft className="w-4 h-4 text-base-content/50" />
              </button>
            )}
          </>
        )}

        {/* Editor area */}
        <div className="flex-1 overflow-hidden">
          {/* File tabs for multi-file (when tree is hidden) */}
          {fileCount > 1 && !showFileTree && (
            <div className="flex overflow-x-auto border-b border-base-300 bg-base-200/30" role="tablist">
              {Object.keys(files).map((path) => {
                const name = path.split('/').pop() || path;
                const isActive = path === activeFile;
                return (
                  <button
                    key={path}
                    role="tab"
                    aria-selected={isActive}
                    className={`
                      px-3 py-1.5 text-xs whitespace-nowrap border-r border-base-300 shrink-0
                      transition-colors
                      ${isActive
                        ? 'bg-base-100 text-primary font-medium border-b-2 border-b-primary'
                        : 'bg-base-200/50 text-base-content/60 hover:bg-base-200'}
                    `}
                    onClick={() => setActiveFile(path)}
                    title={path}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {/* CodeMirror Editor */}
          <EditorErrorBoundary>
            <Suspense fallback={<EditorSkeleton />}>
              <CodeMirrorEditor
                value={currentContent}
                language={language}
                config={config}
                onChange={isReadOnly ? undefined : handleEditorChange}
                readOnly={isReadOnly}
                aria-label={`Code editor, ${language} file: ${activeFile}`}
              />
            </Suspense>
          </EditorErrorBoundary>
        </div>
      </div>
    </div>
  );
}
