// src/features/prototypes/components/VersionHistoryPanel.tsx

import { useState, useCallback } from 'react';
import { GitCompare } from 'lucide-react';
import { RefinementHistoryItem } from './RefinementHistoryItem';
import { useVersionHistory } from '../hooks/usePrototype';
import { useRestoreVersion } from '../hooks/useRestoreVersion';

interface VersionHistoryPanelProps {
  prdId: string;
  activeVersionId: string | null;
  onVersionSelect: (prototypeId: string) => void;
  /** Called when user wants to compare two versions */
  onCompare?: (versionIdA: string, versionIdB: string) => void;
}

export function VersionHistoryPanel({ 
  prdId, 
  activeVersionId, 
  onVersionSelect,
  onCompare,
}: VersionHistoryPanelProps) {
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
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

  const handleCompareToggle = useCallback((versionId: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(versionId)) {
        // Deselect
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length >= 2) {
        // Replace oldest selection
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  }, []);

  const handleCompareSelected = useCallback(() => {
    if (compareSelection.length === 2 && onCompare) {
      // Sort by version number so older is A, newer is B
      const versionA = versions?.find((v) => v.id === compareSelection[0]);
      const versionB = versions?.find((v) => v.id === compareSelection[1]);
      if (versionA && versionB) {
        const [older, newer] = versionA.version < versionB.version
          ? [versionA, versionB]
          : [versionB, versionA];
        onCompare(older.id, newer.id);
      }
      setCompareSelection([]);
    }
  }, [compareSelection, onCompare, versions]);

  const handleCompareWithCurrent = useCallback((versionId: string) => {
    if (activeVersionId && onCompare) {
      // Compare the clicked version (old) with the current active version (new)
      onCompare(versionId, activeVersionId);
    }
  }, [activeVersionId, onCompare]);

  const handleClearSelection = useCallback(() => {
    setCompareSelection([]);
  }, []);

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
  const canCompare = versions.length >= 2;
  const hasCompareSelection = compareSelection.length === 2;

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-lg">Version History</h3>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-base-content/70">
              {versions.length} {versions.length === 1 ? 'version' : 'versions'}
            </p>
            {/* Compare selection controls */}
            {canCompare && onCompare && (
              <div className="flex items-center gap-1">
                {compareSelection.length > 0 && (
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={handleClearSelection}
                    aria-label="Clear compare selection"
                    data-testid="clear-compare-selection"
                  >
                    Clear
                  </button>
                )}
                <button
                  className="btn btn-xs btn-primary gap-1"
                  onClick={handleCompareSelected}
                  disabled={!hasCompareSelection}
                  aria-label="Compare selected versions"
                  data-testid="compare-selected-btn"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Compare ({compareSelection.length}/2)
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {versions.map((prototype, index) => {
              const isSelected = compareSelection.includes(prototype.id);
              // Versions are ordered DESC (newest first), so next in array is the previous version
              const previousVersion = index < versions.length - 1 ? versions[index + 1] : null;
              return (
                <div key={prototype.id} className="relative">
                  {/* Compare checkbox overlay */}
                  {canCompare && onCompare && (
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                      <input
                        type="checkbox"
                        className={`checkbox checkbox-xs ${isSelected ? 'checkbox-secondary' : ''}`}
                        checked={isSelected}
                        onChange={() => handleCompareToggle(prototype.id)}
                        aria-label={`Select v${prototype.version} for comparison`}
                        data-testid={`compare-checkbox-${prototype.id}`}
                      />
                    </div>
                  )}
                  <div className={isSelected ? 'ring-2 ring-secondary ring-offset-1 rounded-2xl' : ''}>
                    <RefinementHistoryItem
                      prototype={prototype}
                      isActive={prototype.id === activeVersionId}
                      onClick={() => onVersionSelect(prototype.id)}
                      previousVersion={previousVersion}
                    />
                  </div>
                  
                  {/* Action buttons - only show for non-active versions */}
                  {prototype.id !== activeVersionId && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {/* Compare with current quick action */}
                      {onCompare && (
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompareWithCurrent(prototype.id);
                          }}
                          title={`Compare v${prototype.version} with current`}
                          aria-label={`Compare version ${prototype.version} with current`}
                          data-testid={`compare-with-current-${prototype.id}`}
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRestoreConfirmId(prototype.id);
                        }}
                        disabled={restoreMutation.isPending}
                      >
                        Restore
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
