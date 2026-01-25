import { ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { PrdCompletionValidation } from '../types';
import type { PrdSectionKey } from '../constants/prdSections';
import { getSectionByKey } from '../constants/prdSections';

interface CompletionValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: PrdCompletionValidation;
  onFocusSection: (key: PrdSectionKey) => void;
}

export function CompletionValidationModal({
  isOpen,
  onClose,
  validation,
  onFocusSection,
}: CompletionValidationModalProps) {
  if (!isOpen) return null;

  const handleFocusSection = (key: PrdSectionKey) => {
    onFocusSection(key);
    onClose();
  };

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-warning/20">
            <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h3 className="font-bold text-lg">PRD Not Ready</h3>
            <p className="text-sm text-base-content/60">
              {validation.completedCount} of {validation.totalRequired} required sections complete
            </p>
          </div>
        </div>

        {/* Incomplete Sections List */}
        <div className="space-y-3">
          <p className="text-sm text-base-content/70">
            Please complete the following sections before marking your PRD as complete:
          </p>
          
          <div className="space-y-2">
            {validation.incompleteRequired.map(result => {
              const definition = getSectionByKey(result.key);
              return (
                <div
                  key={result.key}
                  className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{definition?.title || result.key}</p>
                    <p className="text-xs text-base-content/60">
                      {result.issues[0]}
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-ghost gap-1"
                    onClick={() => handleFocusSection(result.key)}
                  >
                    Focus
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Continue Editing
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
