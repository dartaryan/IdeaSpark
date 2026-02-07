import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrototype, useVersionHistory } from '../features/prototypes/hooks/usePrototype';
import { PrototypeFrame } from '../features/prototypes/components/PrototypeFrame';
import { DeviceSelector, DEVICE_PRESETS, type DevicePreset } from '../features/prototypes/components/DeviceSelector';
import { PrototypeMetadata } from '../features/prototypes/components/PrototypeMetadata';
import { RefinementChat } from '../features/prototypes/components/RefinementChat';
import { VersionHistoryPanel } from '../features/prototypes/components/VersionHistoryPanel';
import { ShareButton } from '../features/prototypes/components/ShareButton';
import { CodeEditorPanel } from '../features/prototypes/components/CodeEditorPanel';
import { AlertCircle, Code2, EyeOff } from 'lucide-react';
import { loadEditorWidth, saveEditorWidth } from '../features/prototypes/utils/editorHelpers';

export function PrototypeViewerPage() {
  const { prototypeId } = useParams<{ prototypeId: string }>();
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICE_PRESETS[0]); // Default to desktop
  const [activePrototypeId, setActivePrototypeId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorWidthPercent, setEditorWidthPercent] = useState(() => loadEditorWidth());
  const [mobileView, setMobileView] = useState<'preview' | 'code'>('preview');

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

  // Determine which prototype to display (active selection or current)
  const currentPrototype = activePrototypeId
    ? versionHistory?.find((p) => p.id === activePrototypeId)
    : prototype;

  // Use current prototype if active not found
  const displayPrototype = currentPrototype || prototype;

  // Handler for refinement completion
  const handleRefinementComplete = (newPrototypeId: string) => {
    setActivePrototypeId(newPrototypeId);
    // The query will auto-invalidate and refetch
  };

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
            {showEditor && (
              <>
                {/* Desktop: side-by-side editor */}
                <div
                  className="hidden md:flex flex-col rounded-lg overflow-hidden shadow-lg border border-primary/20"
                  style={{ width: `${editorWidthPercent}%`, minHeight: '600px' }}
                >
                  <CodeEditorPanel
                    code={displayPrototype.code}
                    onClose={() => setShowEditor(false)}
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
                      onClose={() => { setShowEditor(false); setMobileView('preview'); }}
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
                    <h2 className="text-lg font-semibold">Preview</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* View Code / Hide Code toggle */}
                      {hasCode && (
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
                      <DeviceSelector
                        selectedDevice={selectedDevice}
                        onDeviceChange={setSelectedDevice}
                      />
                      <ShareButton
                        prototypeId={displayPrototype.id}
                        prdId={displayPrototype.prdId}
                      />
                    </div>
                  </div>

                  {/* Prototype Frame (AC 1, 3, 4) */}
                  <PrototypeFrame
                    url={displayPrototype.url!}
                    device={selectedDevice}
                    className="mb-6"
                  />

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
                      onVersionSelect={(versionId) => setActivePrototypeId(versionId)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
