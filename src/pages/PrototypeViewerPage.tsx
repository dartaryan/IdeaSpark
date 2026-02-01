import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrototype, useVersionHistory } from '../features/prototypes/hooks/usePrototype';
import { PrototypeFrame } from '../features/prototypes/components/PrototypeFrame';
import { DeviceSelector, DEVICE_PRESETS, type DevicePreset } from '../features/prototypes/components/DeviceSelector';
import { PrototypeMetadata } from '../features/prototypes/components/PrototypeMetadata';
import { RefinementChat } from '../features/prototypes/components/RefinementChat';
import { VersionHistoryPanel } from '../features/prototypes/components/VersionHistoryPanel';
import { ShareButton } from '../features/prototypes/components/ShareButton';
import { AlertCircle } from 'lucide-react';

export function PrototypeViewerPage() {
  const { prototypeId } = useParams<{ prototypeId: string }>();
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICE_PRESETS[0]); // Default to desktop
  const [activePrototypeId, setActivePrototypeId] = useState<string | null>(null);

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
  return (
    <div className="min-h-screen bg-base-200">
      {/* Metadata Header (AC 5) */}
      <PrototypeMetadata
        prototypeId={displayPrototype.id}
        version={displayPrototype.version}
        createdAt={displayPrototype.createdAt}
        ideaId={displayPrototype.ideaId}
        ideaTitle="My Idea" // TODO: Fetch from idea
        prdId={displayPrototype.prdId}
      />

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prototype Preview - 2 columns on desktop */}
          <div className="lg:col-span-2">
            {/* Viewer Controls (AC 2) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold">Preview</h2>
              <div className="flex items-center gap-2 flex-wrap">
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
  );
}
