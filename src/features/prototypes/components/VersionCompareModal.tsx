// src/features/prototypes/components/VersionCompareModal.tsx

import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { X, GitCompare, Columns2, AlignJustify } from 'lucide-react';
import type { Prototype, EditorFile } from '../types';
import { parsePrototypeCode } from '../types';

/** Detect if the current document theme is a dark variant */
function useIsDarkTheme(): boolean {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return true;
    const theme = document.documentElement.getAttribute('data-theme') || '';
    return !['light', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'garden', 'lofi', 'pastel', 'fantasy', 'wireframe', 'cmyk', 'autumn', 'acid', 'lemonade', 'winter', 'nord'].includes(theme);
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme') || '';
      setIsDark(!['light', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'garden', 'lofi', 'pastel', 'fantasy', 'wireframe', 'cmyk', 'autumn', 'acid', 'lemonade', 'winter', 'nord'].includes(theme));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

// Lazy-load react-diff-viewer-continued (only imported when modal opens)
const ReactDiffViewer = lazy(() => import('react-diff-viewer-continued'));

export interface VersionCompareModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** All versions (from useVersionHistory) */
  versions: Prototype[];
  /** Pre-selected version A ID */
  initialVersionA?: string;
  /** Pre-selected version B ID */
  initialVersionB?: string;
}

/** Status of a file in diff comparison */
type FileChangeStatus = 'modified' | 'added' | 'removed' | 'unchanged';

interface FileChange {
  path: string;
  status: FileChangeStatus;
}

/**
 * Compute file-level diff between two sets of parsed files.
 * Returns list of files that differ, with their change status.
 */
function computeFileChanges(
  filesA: Record<string, EditorFile>,
  filesB: Record<string, EditorFile>,
): FileChange[] {
  const allPaths = new Set([...Object.keys(filesA), ...Object.keys(filesB)]);
  const changes: FileChange[] = [];

  for (const path of allPaths) {
    const inA = path in filesA;
    const inB = path in filesB;

    if (inA && inB) {
      if (filesA[path].content !== filesB[path].content) {
        changes.push({ path, status: 'modified' });
      }
      // Skip unchanged files (don't add to list)
    } else if (inA && !inB) {
      changes.push({ path, status: 'removed' });
    } else {
      changes.push({ path, status: 'added' });
    }
  }

  return changes.sort((a, b) => a.path.localeCompare(b.path));
}

function FileChangeIndicator({ status }: { status: FileChangeStatus }) {
  switch (status) {
    case 'modified':
      return <span className="badge badge-warning badge-xs">M</span>;
    case 'added':
      return <span className="badge badge-success badge-xs">A</span>;
    case 'removed':
      return <span className="badge badge-error badge-xs">D</span>;
    default:
      return null;
  }
}

export function VersionCompareModal({
  isOpen,
  onClose,
  versions,
  initialVersionA,
  initialVersionB,
}: VersionCompareModalProps) {
  // Determine default selections: current (latest) vs previous
  const defaultVersionA = initialVersionA || versions[1]?.id || '';
  const defaultVersionB = initialVersionB || versions[0]?.id || '';

  const [versionAId, setVersionAId] = useState(defaultVersionA);
  const [versionBId, setVersionBId] = useState(defaultVersionB);
  const [splitView, setSplitView] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const isDarkTheme = useIsDarkTheme();

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset selections and focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setVersionAId(initialVersionA || versions[1]?.id || '');
      setVersionBId(initialVersionB || versions[0]?.id || '');
      setSelectedFile(null);
      // Focus the modal container for keyboard accessibility
      const timer = setTimeout(() => modalRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, initialVersionA, initialVersionB, versions]);

  // Find selected versions
  const versionA = useMemo(
    () => versions.find((v) => v.id === versionAId),
    [versions, versionAId],
  );
  const versionB = useMemo(
    () => versions.find((v) => v.id === versionBId),
    [versions, versionBId],
  );

  // Parse code into file maps (memoized per version ID)
  const filesA = useMemo(
    () => (versionA ? parsePrototypeCode(versionA.code) : {}),
    [versionA],
  );
  const filesB = useMemo(
    () => (versionB ? parsePrototypeCode(versionB.code) : {}),
    [versionB],
  );

  // Compute file changes
  const fileChanges = useMemo(
    () => computeFileChanges(filesA, filesB),
    [filesA, filesB],
  );

  // Auto-select first changed file when file changes update (also handles version switching)
  useEffect(() => {
    if (fileChanges.length > 0) {
      setSelectedFile(fileChanges[0].path);
    } else {
      setSelectedFile(null);
    }
  }, [fileChanges]);

  // Keyboard: Escape to close (document-level for reliable capture)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Determine if comparison is valid
  const isSameVersion = versionAId === versionBId;
  const hasNoVersionA = !versionA;
  const hasNoVersionB = !versionB;
  const hasNoCode = !versionA?.code && !versionB?.code;

  // Get diff content for selected file
  const oldValue = selectedFile ? (filesA[selectedFile]?.content || '') : '';
  const newValue = selectedFile ? (filesB[selectedFile]?.content || '') : '';

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="modal modal-open"
      role="dialog"
      aria-labelledby="compare-modal-title"
      aria-describedby="compare-modal-desc"
      tabIndex={-1}
      data-testid="version-compare-modal"
    >
      <div className="modal-box max-w-6xl w-full h-[90vh] max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
          <div>
            <h3
              id="compare-modal-title"
              className="font-bold text-lg flex items-center gap-2"
            >
              <GitCompare className="w-5 h-5 text-primary" />
              Compare Versions
            </h3>
            <p id="compare-modal-desc" className="text-xs text-base-content/50 mt-0.5">
              View file-by-file code differences between two versions
            </p>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
            aria-label="Close compare modal"
            data-testid="close-compare-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-base-200/50 border-b border-base-300">
          {/* Version A selector */}
          <div className="form-control">
            <label className="label py-0">
              <span className="label-text text-xs">Version A (old)</span>
            </label>
            <select
              className="select select-sm select-bordered w-48"
              value={versionAId}
              onChange={(e) => setVersionAId(e.target.value)}
              aria-label="Select version A"
              data-testid="version-a-select"
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.version} — {v.refinementPrompt ? v.refinementPrompt.slice(0, 30) : 'Initial'}
                  {v.refinementPrompt && v.refinementPrompt.length > 30 ? '...' : ''}
                </option>
              ))}
            </select>
          </div>

          <span className="text-base-content/40 font-bold self-end mb-1">vs</span>

          {/* Version B selector */}
          <div className="form-control">
            <label className="label py-0">
              <span className="label-text text-xs">Version B (new)</span>
            </label>
            <select
              className="select select-sm select-bordered w-48"
              value={versionBId}
              onChange={(e) => setVersionBId(e.target.value)}
              aria-label="Select version B"
              data-testid="version-b-select"
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.version} — {v.refinementPrompt ? v.refinementPrompt.slice(0, 30) : 'Initial'}
                  {v.refinementPrompt && v.refinementPrompt.length > 30 ? '...' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Split/Unified toggle */}
          <div className="flex items-center gap-1 ml-auto self-end">
            <button
              className={`btn btn-xs ${splitView ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSplitView(true)}
              aria-label="Split view"
              title="Side-by-side view"
              data-testid="split-view-btn"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              className={`btn btn-xs ${!splitView ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSplitView(false)}
              aria-label="Unified view"
              title="Inline view"
              data-testid="unified-view-btn"
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unified</span>
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Validation messages */}
          {isSameVersion && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-base-content/60 text-sm" data-testid="same-version-message">
                Select two different versions to compare.
              </p>
            </div>
          )}

          {!isSameVersion && (hasNoVersionA || hasNoVersionB) && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-base-content/60 text-sm">
                Version data not available.
              </p>
            </div>
          )}

          {!isSameVersion && !hasNoVersionA && !hasNoVersionB && hasNoCode && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-base-content/60 text-sm" data-testid="no-code-message">
                No code available for the selected versions.
              </p>
            </div>
          )}

          {!isSameVersion && !hasNoVersionA && !hasNoVersionB && !hasNoCode && fileChanges.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-base-content/60 text-sm" data-testid="no-diff-message">
                No differences between these versions.
              </p>
            </div>
          )}

          {!isSameVersion && !hasNoVersionA && !hasNoVersionB && !hasNoCode && fileChanges.length > 0 && (
            <>
              {/* File selector sidebar */}
              <div
                className="w-48 shrink-0 border-r border-base-300 overflow-y-auto bg-base-100"
                role="tablist"
                aria-label="Changed files"
                data-testid="file-selector"
              >
                <div className="px-3 py-2 text-xs font-semibold text-base-content/60 uppercase">
                  Changed Files ({fileChanges.length})
                </div>
                {fileChanges.map((fc) => (
                  <button
                    key={fc.path}
                    role="tab"
                    aria-selected={selectedFile === fc.path}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-base-200 transition-colors ${
                      selectedFile === fc.path ? 'bg-primary/10 border-l-2 border-primary' : ''
                    }`}
                    onClick={() => setSelectedFile(fc.path)}
                    title={fc.path}
                    data-testid={`file-tab-${fc.path}`}
                  >
                    <FileChangeIndicator status={fc.status} />
                    <span className="truncate">{fc.path.split('/').pop()}</span>
                  </button>
                ))}
              </div>

              {/* Diff content */}
              <div
                className="flex-1 overflow-auto"
                role="region"
                aria-label="Code differences"
                data-testid="diff-content"
              >
                {selectedFile && (
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <span className="loading loading-spinner loading-md" />
                          <p className="mt-2 text-sm text-base-content/50">
                            Loading diff viewer...
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <ReactDiffViewer
                      oldValue={oldValue}
                      newValue={newValue}
                      splitView={splitView}
                      useDarkTheme={isDarkTheme}
                      leftTitle={`v${versionA?.version ?? '?'} — ${selectedFile}`}
                      rightTitle={`v${versionB?.version ?? '?'} — ${selectedFile}`}
                      showDiffOnly={false}
                    />
                  </Suspense>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-base-300 flex justify-end">
          <button
            className="btn btn-sm btn-ghost"
            onClick={onClose}
            data-testid="close-compare-footer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
