// src/features/prototypes/components/SaveVersionModal.test.tsx
// Unit tests for SaveVersionModal component (Story 7.4)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import { SaveVersionModal } from './SaveVersionModal';

describe('SaveVersionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
    currentVersion: 3,
    nextVersion: 4,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<SaveVersionModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Save as New Version')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<SaveVersionModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display current and next version numbers', () => {
      render(<SaveVersionModal {...defaultProps} />);

      expect(screen.getByText('Current: v3')).toBeInTheDocument();
      expect(screen.getByText('New: v4')).toBeInTheDocument();
    });

    it('should render version note textarea', () => {
      render(<SaveVersionModal {...defaultProps} />);

      expect(screen.getByTestId('version-note-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Version notes (optional)')).toBeInTheDocument();
    });

    it('should render Cancel and Save Version buttons', () => {
      render(<SaveVersionModal {...defaultProps} />);

      expect(screen.getByTestId('cancel-save-version')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-save-version')).toBeInTheDocument();
    });

    it('should show character count starting at 0/500', () => {
      render(<SaveVersionModal {...defaultProps} />);

      expect(screen.getByText('0/500')).toBeInTheDocument();
    });
  });

  describe('Note Input', () => {
    it('should update note text when typing', () => {
      render(<SaveVersionModal {...defaultProps} />);

      const textarea = screen.getByTestId('version-note-input');
      fireEvent.change(textarea, { target: { value: 'Added navigation' } });

      expect(textarea).toHaveValue('Added navigation');
    });

    it('should update character count as user types', () => {
      render(<SaveVersionModal {...defaultProps} />);

      const textarea = screen.getByTestId('version-note-input');
      fireEvent.change(textarea, { target: { value: 'Hello' } });

      expect(screen.getByText('5/500')).toBeInTheDocument();
    });

    it('should enforce max 500 character limit', () => {
      render(<SaveVersionModal {...defaultProps} />);

      const textarea = screen.getByTestId('version-note-input');
      const longText = 'a'.repeat(600);
      fireEvent.change(textarea, { target: { value: longText } });

      expect((textarea as HTMLTextAreaElement).value).toHaveLength(500);
      expect(screen.getByText('500/500')).toBeInTheDocument();
    });
  });

  describe('Save Callback', () => {
    it('should call onSave with note when Save Version is clicked', () => {
      render(<SaveVersionModal {...defaultProps} />);

      const textarea = screen.getByTestId('version-note-input');
      fireEvent.change(textarea, { target: { value: 'My version note' } });

      fireEvent.click(screen.getByTestId('confirm-save-version'));

      expect(defaultProps.onSave).toHaveBeenCalledWith('My version note');
    });

    it('should call onSave with undefined when no note is provided', () => {
      render(<SaveVersionModal {...defaultProps} />);

      fireEvent.click(screen.getByTestId('confirm-save-version'));

      expect(defaultProps.onSave).toHaveBeenCalledWith(undefined);
    });

    it('should call onSave with undefined for whitespace-only note', () => {
      render(<SaveVersionModal {...defaultProps} />);

      const textarea = screen.getByTestId('version-note-input');
      fireEvent.change(textarea, { target: { value: '   ' } });

      fireEvent.click(screen.getByTestId('confirm-save-version'));

      expect(defaultProps.onSave).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Saving State', () => {
    it('should disable Save button when isSaving is true', () => {
      render(<SaveVersionModal {...defaultProps} isSaving={true} />);

      expect(screen.getByTestId('confirm-save-version')).toBeDisabled();
    });

    it('should disable Cancel button when isSaving is true', () => {
      render(<SaveVersionModal {...defaultProps} isSaving={true} />);

      expect(screen.getByTestId('cancel-save-version')).toBeDisabled();
    });

    it('should disable textarea when isSaving is true', () => {
      render(<SaveVersionModal {...defaultProps} isSaving={true} />);

      expect(screen.getByTestId('version-note-input')).toBeDisabled();
    });

    it('should show loading spinner when isSaving is true', () => {
      render(<SaveVersionModal {...defaultProps} isSaving={true} />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show Save Version text when not saving', () => {
      render(<SaveVersionModal {...defaultProps} isSaving={false} />);

      expect(screen.getByText('Save Version')).toBeInTheDocument();
    });

    it('should set aria-busy when saving', () => {
      render(<SaveVersionModal {...defaultProps} isSaving={true} />);

      expect(screen.getByTestId('confirm-save-version')).toHaveAttribute('aria-busy', 'true');
    });

    it('should not call onSave when button clicked while saving', () => {
      render(<SaveVersionModal {...defaultProps} isSaving={true} />);

      fireEvent.click(screen.getByTestId('confirm-save-version'));

      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when Cancel is clicked', () => {
      render(<SaveVersionModal {...defaultProps} />);

      fireEvent.click(screen.getByTestId('cancel-save-version'));

      expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });

    it('should call onClose when backdrop is clicked', () => {
      render(<SaveVersionModal {...defaultProps} />);

      // The backdrop is the modal-backdrop div
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) fireEvent.click(backdrop);

      expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });

    it('should not call onClose when backdrop clicked while saving', () => {
      render(<SaveVersionModal {...defaultProps} isSaving={true} />);

      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) fireEvent.click(backdrop);

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should call onClose on Escape key press', () => {
      render(<SaveVersionModal {...defaultProps} />);

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });

    it('should not close on Escape while saving', () => {
      render(<SaveVersionModal {...defaultProps} isSaving={true} />);

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-labelledby pointing to title', () => {
      render(<SaveVersionModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'save-version-title');
    });

    it('should have aria-describedby pointing to description', () => {
      render(<SaveVersionModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'save-version-desc');
    });
  });
});
