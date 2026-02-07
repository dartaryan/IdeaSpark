import { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePrototype, useVersionHistory } from '../features/prototypes/hooks/usePrototype';
import { PrototypeFrame } from '../features/prototypes/components/PrototypeFrame';
import { DeviceSelector, DEVICE_PRESETS, type DevicePreset } from '../features/prototypes/components/DeviceSelector';
import { PrototypeMetadata } from '../features/prototypes/components/PrototypeMetadata';
import { RefinementChat } from '../features/prototypes/components/RefinementChat';
import { VersionHistoryPanel } from '../features/prototypes/components/VersionHistoryPanel';
import { ShareButton } from '../features/prototypes/components/ShareButton';
import { CodeEditorPanel } from '../features/prototypes/components/CodeEditorPanel';
import { SaveVersionModal } from '../features/prototypes/components/SaveVersionModal';
import { VersionCompareModal } from '../features/prototypes/components/VersionCompareModal';
import { AlertCircle, Code2, EyeOff, Pencil, X, Check, AlertTriangle, Loader2, Save, ArrowLeft } from 'lucide-react';
import { loadEditorWidth, saveEditorWidth } from '../features/prototypes/utils/editorHelpers';
import { useCodePersistence } from '../features/prototypes/hooks/useCodePersistence';
import type { SaveStatus } from '../features/prototypes/hooks/useCodePersistence';
import { useSaveVersion } from '../features/prototypes/hooks/useSaveVersion';

// Lazy load SandpackLivePreview - only loads when edit mode is activated
const SandpackLivePreview = lazy(() =>
  import('../features/prototypes/components/SandpackLivePreview').then((m) => ({
    default: m.SandpackLivePreview,
  })),
);

/** Save status indicator component */
function SaveStatusBadge({ status, onRetry }: { status: SaveStatus; onRetry?: () => void }) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === 'saved') {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 3000);
      return () => clearTimeout(timer);
    }
    setShowSaved(false);
    return undefined;
  }, [status]);

  switch (status) {
    case 'saving':
      return (
        <span className="flex items-center gap-1 text-xs text-base-content/60" aria-live="polite">
          <Loader2 className="w-3 h-3 animate-spin" />
          Saving...
        </span>
      );
    case 'saved':
      if (!showSaved) return null;
      return (
        <span className="flex items-center gap-1 text-xs text-success" aria-live="polite">
          <Check className="w-3 h-3" />
          All changes saved
        </span>
      );
    case 'error':
      return (
        <span className="flex items-center gap-1 text-xs text-error" aria-live="polite">
          <AlertTriangle className="w-3 h-3" />
          Save failed
          {onRetry && (
            <button
              className="btn btn-ghost btn-xs ml-1"
              onClick={onRetry}
              aria-label="Retry save"
            >
              Retry
            </button>
          )}
        </span>
      );
    case 'idle':
      return (
        <span className="text-xs text-base-content/50" aria-live="polite">
          Editing
        </span>
      );
    default:
      return null;
  }
}

export function PrototypeViewerPage() {
  const { prototypeId } = useParams<{ prototypeId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICE_PRESETS[0]); // Default to desktop
  const [activePrototypeId, setActivePrototypeId] = useState<string | null>(
    () => searchParams.get('version') || null,
  );
  const [showEditor, setShowEditor] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editorWidthPercent, setEditorWidthPercent] = useState(() => loadEditorWidth());
  const [mobileView, setMobileView] = useState<'preview' | 'code'>('preview');
  const [hasCompilationError, setHasCompilationError] = useState(false);
  const [showSaveVersionModal, setShowSaveVersionModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareVersionIds, setCompareVersionIds] = useState<[string, string] | null>(null);
  // Ref (not state) to avoid unnecessary re-renders during save flow.
  // Works because: handleSaveVersion sets ref → flushSave() triggers re-render
  // (via setSaveStatus) → useCodePersistence picks up new ref value at next render.
  // No auto-save can fire between ref set and flushSave because flushSave
  // synchronously clears the debounce timer before awaiting the save.
  const autoSavePausedRef = useRef(false);

  // Handle editor width resize via drag
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = editorWidthPercent;
    let latestWidth = startWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = Math.min(80, Math.max(20, startWidth - deltaPercent));
      latestWidth = newWidth;
      setEditorWidthPercent(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      saveEditorWidth(latestWidth);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [editorWidthPercent]);

  const { data: prototype, isLoading, error } = usePrototype(prototypeId!);
  
  // Get version history if we have a prototype with prdId
  const { data: versionHistory } = useVersionHistory(prototype?.prdId || '');

  // Determine which prototype to display (before early returns for hooks compliance)
  const currentPrototype = activePrototypeId
    ? versionHistory?.find((p) => p.id === activePrototypeId)
    : prototype;
  const displayPrototype = currentPrototype || prototype;

  // Code persistence for edit mode (AC: #3, #4, #5)
  const {
    files: editedFiles,
    updateFile: updateEditedFile,
    saveStatus,
    hasUnsavedChanges,
    flushSave,
  } = useCodePersistence({
    prototypeId: displayPrototype?.id ?? '',
    initialCode: displayPrototype?.code ?? null,
    pauseAutoSave: autoSavePausedRef.current,
  });

  // Save version hook (Story 7.4)
  const {
    saveVersion,
    status: saveVersionStatus,
    isSaving: isSavingVersion,
  } = useSaveVersion({
    prototypeId: displayPrototype?.id ?? '',
    currentFiles: editedFiles,
    prdId: displayPrototype?.prdId ?? '',
    ideaId: displayPrototype?.ideaId ?? '',
  });

  // Handle Save Version flow (AC: #1, #3, #4)
  const handleSaveVersion = useCallback(
    async (note?: string) => {
      autoSavePausedRef.current = true; // Pause auto-save
      await flushSave(); // Flush any pending auto-save first

      const newVersionId = await saveVersion(note);
      if (newVersionId) {
        setShowSaveVersionModal(false);
        toast.success(`Version ${(displayPrototype?.version ?? 0) + 1} saved successfully`);
        autoSavePausedRef.current = false; // Resume before navigation
        navigate(`/prototypes/${newVersionId}`);
      } else {
        autoSavePausedRef.current = false; // Resume on failure
      }
    },
    [saveVersion, flushSave, navigate, displayPrototype?.version],
  );

  // Determine if viewing the latest version (Story 7.5, Task 4)
  const latestVersionId = versionHistory?.[0]?.id;
  const isViewingLatest = !activePrototypeId || activePrototypeId === latestVersionId;

  // Handle version switching with unsaved changes warning (Story 7.5, Subtask 4.1)
  const handleVersionSelect = useCallback((versionId: string) => {
    if (editMode && hasUnsavedChanges) {
      const proceed = window.confirm(
        'You have unsaved changes. Switching versions will discard them. Continue?',
      );
      if (!proceed) return;
      setEditMode(false);
    }
    setActivePrototypeId(versionId);
    // Update URL search param for bookmarkability (Subtask 4.5)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (versionId === latestVersionId) {
        next.delete('version');
      } else {
        next.set('version', versionId);
      }
      return next;
    });
  }, [editMode, hasUnsavedChanges, latestVersionId, setSearchParams]);

  // Return to latest version quick action (Subtask 4.3)
  const handleReturnToLatest = useCallback(() => {
    if (latestVersionId) {
      handleVersionSelect(latestVersionId);
    }
  }, [latestVersionId, handleVersionSelect]);

  // Handle entering edit mode
  const handleEnterEditMode = useCallback(() => {
    setEditMode(true);
    setShowEditor(true);
  }, []);

  // Handle exiting edit mode (AC: #4)
  const handleExitEditMode = useCallback(async () => {
    await flushSave();
    setEditMode(false);
  }, [flushSave]);

  // Handle compare versions (Story 7.5)
  const handleCompare = useCallback((versionIdA: string, versionIdB: string) => {
    setCompareVersionIds([versionIdA, versionIdB]);
    setShowCompareModal(true);
  }, []);

  const handleCloseCompare = useCallback(() => {
    setShowCompareModal(false);
    setCompareVersionIds(null);
  }, []);

  // Handle code changes from editor in edit mode
  const handleCodeChange = useCallback(
    (path: string, content: string) => {
      updateEditedFile(path, content);
    },
    [updateEditedFile],
  );

  // Handle Sandpack compilation errors (AC: #2)
  const handleSandpackError = useCallback((error: Error | null) => {
    setHasCompilationError(error !== null);
  }, []);

  // Keyboard shortcut: Ctrl+Shift+S to open Save Version modal (Story 7.4, Subtask 9.4)
  useEffect(() => {
    if (!editMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        if (!isSavingVersion) {
          setShowSaveVersionModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, isSavingVersion]);

  // Warn about unsaved changes on navigation (AC: #4)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Loading State (AC 6)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg" role="status"></span>
          <p className="mt-4 text-lg text-base-content/70">Loading prototype...</p>
        </div>
      </div>
    );
  }

  // Error State (AC 7)
  if (error || !prototype) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="card-title justify-center text-2xl mb-2">
              Prototype Not Found
            </h2>
            <p className="text-base-content/70 mb-6">
              {error?.message || 'The prototype you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}
            </p>
            <div className="card-actions justify-center">
              <button 
                onClick={() => navigate('/ideas')} 
                className="btn btn-primary"
              >
                Back to My Ideas
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-ghost"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if prototype is still generating
  if (prototype.status === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <span className="loading loading-spinner loading-lg mx-auto mb-4"></span>
            <h2 className="card-title justify-center text-2xl mb-2">
              Prototype Generating
            </h2>
            <p className="text-base-content/70 mb-6">
              Your prototype is still being generated. Please wait...
            </p>
            <div className="card-actions justify-center">
              <button 
                onClick={() => navigate(`/prd/view/${prototype.prdId}`)} 
                className="btn btn-primary"
              >
                Back to PRD
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if generation failed
  if (prototype.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="card-title justify-center text-2xl mb-2">
              Generation Failed
            </h2>
            <p className="text-base-content/70 mb-6">
              The prototype generation failed. Please try generating again.
            </p>
            <div className="card-actions justify-center">
              <button 
                onClick={() => navigate(`/prd/view/${prototype.prdId}`)} 
                className="btn btn-primary"
              >
                Back to PRD
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if URL exists (AC 7)
  if (!prototype.url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h2 className="card-title justify-center text-2xl mb-2">
              Prototype URL Missing
            </h2>
            <p className="text-base-content/70 mb-6">
              The prototype was generated but the URL is missing. Please regenerate.
            </p>
            <div className="card-actions justify-center">
              <button 
                onClick={() => navigate(`/prd/view/${prototype.prdId}`)} 
                className="btn btn-primary"
              >
                Back to PRD
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handler for refinement completion
  const handleRefinementComplete = (newPrototypeId: string) => {
    setActivePrototypeId(newPrototypeId);
  };

  // After early returns, displayPrototype is guaranteed non-null
  if (!displayPrototype) return null;

  // Success State (AC 1, 5)
  const hasCode = !!displayPrototype.code;

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Metadata Header (AC 5) */}
      <PrototypeMetadata
        prototypeId={displayPrototype.id}
        version={displayPrototype.version}
        createdAt={displayPrototype.createdAt}
        ideaId={displayPrototype.ideaId}
        ideaTitle="My Idea" // Note: Fetching idea title deferred — requires additional query not in current scope
        prdId={displayPrototype.prdId}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile: Code/Preview tab switcher (visible <768px when editor open) */}
        {showEditor && (
          <div className="flex md:hidden border-b border-base-300 bg-base-100">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mobileView === 'preview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-base-content/60'
              }`}
              onClick={() => setMobileView('preview')}
            >
              Preview
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mobileView === 'code'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-base-content/60'
              }`}
              onClick={() => setMobileView('code')}
            >
              Code
            </button>
          </div>
        )}

        <div className="container mx-auto max-w-full px-4 py-6 flex-1">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* LEFT SIDE: Code Editor (when visible) */}
            {(showEditor || editMode) && (
              <>
                {/* Desktop: side-by-side editor */}
                <div
                  className="hidden md:flex flex-col rounded-lg overflow-hidden shadow-lg border border-primary/20"
                  style={{ width: `${editorWidthPercent}%`, minHeight: '600px' }}
                >
                  <CodeEditorPanel
                    code={displayPrototype.code}
                    onCodeChange={editMode ? handleCodeChange : undefined}
                    onClose={editMode ? handleExitEditMode : () => setShowEditor(false)}
                    hasCompilationError={editMode ? hasCompilationError : false}
                    onSaveVersion={editMode ? () => setShowSaveVersionModal(true) : undefined}
                    isSavingVersion={isSavingVersion}
                  />
                </div>

                {/* Desktop: Resize handle */}
                <div
                  className="hidden md:flex w-1.5 cursor-col-resize items-center justify-center hover:bg-primary/20 rounded transition-colors group shrink-0"
                  onMouseDown={handleResizeStart}
                  onDoubleClick={() => { setEditorWidthPercent(50); saveEditorWidth(50); }}
                  title="Drag to resize. Double-click to reset."
                  role="separator"
                  aria-label="Resize editor panel"
                >
                  <div className="w-0.5 h-8 bg-base-content/20 group-hover:bg-primary/50 rounded-full transition-colors" />
                </div>

                {/* Mobile: Full-screen code editor */}
                {mobileView === 'code' && (
                  <div className="md:hidden flex-1 min-h-[400px] rounded-lg overflow-hidden shadow-lg border border-primary/20">
                    <CodeEditorPanel
                      code={displayPrototype.code}
                      onCodeChange={editMode ? handleCodeChange : undefined}
                      onClose={editMode
                        ? handleExitEditMode
                        : () => { setShowEditor(false); setMobileView('preview'); }
                      }
                      hasCompilationError={editMode ? hasCompilationError : false}
                      onSaveVersion={editMode ? () => setShowSaveVersionModal(true) : undefined}
                      isSavingVersion={isSavingVersion}
                    />
                  </div>
                )}
              </>
            )}

            {/* RIGHT SIDE: Preview + Controls */}
            <div
              className={`flex-1 min-w-0 ${showEditor && mobileView === 'code' ? 'hidden md:block' : ''}`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Prototype Preview - 2 columns on desktop */}
                <div className="lg:col-span-2">
                  {/* Viewer Controls (AC 2) */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold">
                        {editMode ? 'Live Edit' : 'Preview'}
                      </h2>
                      {/* Version badge (Story 7.4) */}
                      <span
                        className="badge badge-outline badge-sm"
                        data-testid="version-badge"
                      >
                        v{displayPrototype.version}
                      </span>
                      {/* "Viewing older version" indicator (Story 7.5, Subtask 4.2) */}
                      {!isViewingLatest && (
                        <span
                          className="badge badge-warning badge-sm gap-1"
                          data-testid="viewing-old-version-badge"
                        >
                          Viewing v{displayPrototype.version}
                        </span>
                      )}
                      {/* Return to Latest button (Story 7.5, Subtask 4.3) */}
                      {!isViewingLatest && (
                        <button
                          className="btn btn-xs btn-ghost gap-1"
                          onClick={handleReturnToLatest}
                          aria-label="Return to latest version"
                          data-testid="return-to-latest-btn"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Latest
                        </button>
                      )}
                      {/* Save status indicator (visible in edit mode) */}
                      {editMode && <SaveStatusBadge status={saveStatus} onRetry={() => flushSave()} />}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Exit Edit Mode button */}
                      {editMode && (
                        <button
                          className="btn btn-sm btn-outline btn-warning gap-2"
                          onClick={handleExitEditMode}
                          aria-label="Exit edit mode and return to deployed preview"
                          data-testid="exit-edit-mode-btn"
                        >
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">Exit Edit Mode</span>
                        </button>
                      )}
                      {/* Save Version button (visible in edit mode) */}
                      {editMode && (
                        <button
                          className="btn btn-sm btn-primary gap-2"
                          onClick={() => setShowSaveVersionModal(true)}
                          disabled={isSavingVersion}
                          aria-label="Save prototype as new version"
                          data-testid="save-version-btn"
                        >
                          {isSavingVersion ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Save Version</span>
                        </button>
                      )}
                      {/* Edit Code button (enters edit mode with Sandpack live preview) */}
                      {/* Disabled when viewing non-latest version (Story 7.5, Subtask 4.4) */}
                      {hasCode && !editMode && (
                        <button
                          className="btn btn-sm btn-outline btn-accent gap-2"
                          onClick={handleEnterEditMode}
                          disabled={!isViewingLatest}
                          title={!isViewingLatest ? 'Switch to latest version to edit' : undefined}
                          aria-label="Edit prototype code with live preview"
                          data-testid="edit-code-btn"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit Code</span>
                        </button>
                      )}
                      {/* View Code / Hide Code toggle (read-only mode, hidden in edit mode) */}
                      {hasCode && !editMode && (
                        <button
                          className={`btn btn-sm gap-2 ${showEditor ? 'btn-primary' : 'btn-outline btn-primary'}`}
                          onClick={() => setShowEditor((p) => !p)}
                          aria-label={showEditor ? 'Hide code editor' : 'View code'}
                        >
                          {showEditor ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              <span className="hidden sm:inline">Hide Code</span>
                            </>
                          ) : (
                            <>
                              <Code2 className="w-4 h-4" />
                              <span className="hidden sm:inline">View Code</span>
                            </>
                          )}
                        </button>
                      )}
                      {!editMode && (
                        <DeviceSelector
                          selectedDevice={selectedDevice}
                          onDeviceChange={setSelectedDevice}
                        />
                      )}
                      <ShareButton
                        prototypeId={displayPrototype.id}
                        prdId={displayPrototype.prdId}
                      />
                    </div>
                  </div>

                  {/* Preview Area: Sandpack (edit mode) or PrototypeFrame (view mode) */}
                  {editMode ? (
                    <div className="mb-6">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center bg-base-200 rounded-lg min-h-[400px]">
                            <div className="text-center">
                              <span className="loading loading-spinner loading-lg" />
                              <p className="mt-2 text-sm text-base-content/50">
                                Loading live preview...
                              </p>
                            </div>
                          </div>
                        }
                      >
                        <SandpackLivePreview
                          files={editedFiles}
                          className="min-h-[500px]"
                          onError={handleSandpackError}
                        />
                      </Suspense>
                    </div>
                  ) : (
                    <PrototypeFrame
                      url={displayPrototype.url!}
                      device={selectedDevice}
                      className="mb-6"
                    />
                  )}

                  {/* Info Card */}
                  <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                      <h3 className="card-title text-lg">About This Prototype</h3>
                      <p className="text-base-content/70">
                        This prototype was automatically generated from your PRD using Open-Lovable. 
                        It features PassportCard branding with the signature #E10514 red color.
                      </p>
                      <div className="divider"></div>
                      <div className="flex flex-wrap gap-2">
                        <div className="badge badge-primary">Version {displayPrototype.version}</div>
                        <div className="badge badge-outline">React + TypeScript</div>
                        <div className="badge badge-outline">DaisyUI + Tailwind</div>
                        <div className="badge badge-outline">PassportCard Theme</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refinement Chat & History - 1 column on desktop */}
                <div className="space-y-6">
                  {/* Refinement Chat */}
                  <RefinementChat
                    prototypeId={prototype.id}
                    onRefinementComplete={handleRefinementComplete}
                  />

                  {/* Version History */}
                  {prototype.prdId && (
                    <VersionHistoryPanel
                      prdId={prototype.prdId}
                      activeVersionId={activePrototypeId || prototype.id}
                      onVersionSelect={handleVersionSelect}
                      onCompare={handleCompare}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Version Modal (Story 7.4) */}
      <SaveVersionModal
        isOpen={showSaveVersionModal}
        onClose={() => setShowSaveVersionModal(false)}
        onSave={handleSaveVersion}
        isSaving={isSavingVersion}
        currentVersion={displayPrototype.version}
        nextVersion={displayPrototype.version + 1}
      />

      {/* Version Compare Modal (Story 7.5) */}
      {versionHistory && (
        <VersionCompareModal
          isOpen={showCompareModal}
          onClose={handleCloseCompare}
          versions={versionHistory}
          initialVersionA={compareVersionIds?.[0]}
          initialVersionB={compareVersionIds?.[1]}
        />
      )}
    </div>
  );
}
