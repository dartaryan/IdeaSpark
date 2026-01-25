import { CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { PRD_SECTIONS } from '../constants/prdSections';
import type { PrdContent } from '../types';

interface ConfirmCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  prdContent: PrdContent;
  ideaTitle: string;
  isLoading?: boolean;
}

export function ConfirmCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  prdContent,
  ideaTitle,
  isLoading = false,
}: ConfirmCompletionModalProps) {
  if (!isOpen) return null;

  const completedSections = PRD_SECTIONS.filter(
    (def) => prdContent[def.key]?.status === 'complete'
  );

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-success/20">
            <CheckCircleIcon className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Complete Your PRD</h3>
            <p className="text-sm text-base-content/60">
              Ready to finalize "{ideaTitle}"
            </p>
          </div>
        </div>

        {/* PRD Summary */}
        <div className="border border-base-300 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <DocumentTextIcon className="w-5 h-5 text-primary" />
            <span className="font-medium">PRD Summary</span>
            <span className="badge badge-success badge-sm">
              {completedSections.length}/{PRD_SECTIONS.length} sections
            </span>
          </div>

          <div className="space-y-2">
            {PRD_SECTIONS.map((def) => {
              const section = prdContent[def.key];
              const hasContent =
                section?.content && section.content.trim().length > 0;

              return (
                <div key={def.key} className="text-sm">
                  <span className="font-medium text-base-content/80">
                    {def.title}:
                  </span>{' '}
                  {hasContent ? (
                    <span className="text-base-content/60 line-clamp-1">
                      {section!.content.slice(0, 100)}
                      {section!.content.length > 100 ? '...' : ''}
                    </span>
                  ) : (
                    <span className="text-base-content/40 italic">Empty</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning about finalization */}
        <div className="alert alert-info mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="text-sm">
            Once marked complete, you can generate a prototype from this PRD.
            The chat history will be preserved for reference.
          </span>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary gap-2"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Completing...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Mark as Complete
              </>
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} disabled={isLoading}>
          close
        </button>
      </form>
    </dialog>
  );
}
