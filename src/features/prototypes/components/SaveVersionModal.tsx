// src/features/prototypes/components/SaveVersionModal.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, FileText } from 'lucide-react';

export interface SaveVersionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Save callback - receives optional version note */
  onSave: (note?: string) => void;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Current version number */
  currentVersion: number;
  /** Next version number (currentVersion + 1) */
  nextVersion: number;
}

const MAX_NOTE_LENGTH = 500;

export function SaveVersionModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  currentVersion,
  nextVersion,
}: SaveVersionModalProps) {
  const [note, setNote] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset note and focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setNote('');
      // Focus textarea on next tick (after modal renders)
      const timer = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  const handleSave = useCallback(() => {
    if (isSaving) return;
    onSave(note.trim() || undefined);
  }, [isSaving, note, onSave]);

  const handleClose = useCallback(() => {
    if (isSaving) return;
    onClose();
  }, [isSaving, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    },
    [isSaving, onClose],
  );

  if (!isOpen) return null;

  return (
    <div
      className="modal modal-open"
      role="dialog"
      aria-labelledby="save-version-title"
      aria-describedby="save-version-desc"
      onKeyDown={handleKeyDown}
    >
      <div className="modal-box">
        <h3
          id="save-version-title"
          className="font-bold text-lg flex items-center gap-2"
        >
          <Save className="w-5 h-5 text-primary" />
          Save as New Version
        </h3>

        <p id="save-version-desc" className="py-2 text-sm text-base-content/70">
          Create a snapshot of your current code as a new version.
        </p>

        {/* Version info */}
        <div className="flex items-center gap-4 my-3">
          <div className="badge badge-outline badge-sm">Current: v{currentVersion}</div>
          <span className="text-base-content/40">→</span>
          <div className="badge badge-primary badge-sm">New: v{nextVersion}</div>
        </div>

        {/* Version note textarea */}
        <div className="form-control mt-4">
          <label className="label" htmlFor="version-note">
            <span className="label-text flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Version Notes (optional)
            </span>
            <span className="label-text-alt text-base-content/50">
              {note.length}/{MAX_NOTE_LENGTH}
            </span>
          </label>
          <textarea
            ref={textareaRef}
            id="version-note"
            className="textarea textarea-bordered h-24 resize-none"
            placeholder="Describe what changed in this version..."
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
            maxLength={MAX_NOTE_LENGTH}
            disabled={isSaving}
            aria-label="Version notes (optional)"
            data-testid="version-note-input"
          />
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={handleClose}
            disabled={isSaving}
            data-testid="cancel-save-version"
          >
            Cancel
          </button>
          <button
            className="btn btn-primary gap-2"
            onClick={handleSave}
            disabled={isSaving}
            aria-busy={isSaving}
            data-testid="confirm-save-version"
          >
            {isSaving ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Version
              </>
            )}
          </button>
        </div>
      </div>
      {/* Backdrop - clicking closes modal (unless saving) */}
      <div className="modal-backdrop" onClick={handleClose} />
    </div>
  );
}
