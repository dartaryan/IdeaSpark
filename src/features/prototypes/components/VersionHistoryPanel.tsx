// src/features/prototypes/components/VersionHistoryPanel.tsx

import { useState } from 'react';
import { RefinementHistoryItem } from './RefinementHistoryItem';
import { useVersionHistory } from '../hooks/usePrototype';
import { useRestoreVersion } from '../hooks/useRestoreVersion';

interface VersionHistoryPanelProps {
  prdId: string;
  activeVersionId: string | null;
  onVersionSelect: (prototypeId: string) => void;
}

export function VersionHistoryPanel({ 
  prdId, 
  activeVersionId, 
  onVersionSelect 
}: VersionHistoryPanelProps) {
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const { data: versions, isLoading } = useVersionHistory(prdId);
  const restoreMutation = useRestoreVersion();

  const handleRestore = async (prototypeId: string) => {
    try {
      const result = await restoreMutation.mutateAsync({ 
        prototypeId, 
        prdId 
      });
      
      // Select the newly created version
      onVersionSelect(result.id);
      
      // Close confirmation modal
      setRestoreConfirmId(null);
    } catch (error) {
      // Error is handled by mutation error state
      console.error('Restoration failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        </div>
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-lg">Version History</h3>
          <p className="text-sm text-base-content/70">
            No versions available yet.
          </p>
        </div>
      </div>
    );
  }

  const versionToRestore = versions.find(v => v.id === restoreConfirmId);

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-lg">Version History</h3>
          <p className="text-sm text-base-content/70 mb-2">
            {versions.length} {versions.length === 1 ? 'version' : 'versions'}
          </p>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {versions.map((prototype) => (
              <div key={prototype.id} className="relative">
                <RefinementHistoryItem
                  prototype={prototype}
                  isActive={prototype.id === activeVersionId}
                  onClick={() => onVersionSelect(prototype.id)}
                />
                
                {/* Restore button - only show for non-active versions */}
                {prototype.id !== activeVersionId && (
                  <button
                    className="btn btn-sm btn-ghost absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRestoreConfirmId(prototype.id);
                    }}
                    disabled={restoreMutation.isPending}
                  >
                    Restore
                  </button>
                )}
              </div>
            ))}
          </div>

          {restoreMutation.isError && (
            <div className="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Failed to restore version. Please try again.</span>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => restoreMutation.reset()}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {restoreConfirmId && versionToRestore && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Restore Version {versionToRestore.version}?</h3>
            <p className="py-4">
              This will create a new version (v{(versions[0]?.version || 0) + 1}) copying the code from version {versionToRestore.version}.
            </p>
            <p className="text-sm text-base-content/70">
              Your current version will be preserved in history. This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setRestoreConfirmId(null)}
                disabled={restoreMutation.isPending}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleRestore(restoreConfirmId)}
                disabled={restoreMutation.isPending}
              >
                {restoreMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Restoring...
                  </>
                ) : (
                  'Restore Version'
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setRestoreConfirmId(null)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
}
