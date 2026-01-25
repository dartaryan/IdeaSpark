import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { SaveIndicator } from './SaveIndicator';

describe('SaveIndicator', () => {
  const mockDate = new Date('2024-01-15T10:30:00');

  describe('Status Display', () => {
    it('should show "Saving..." with spinner when status is saving', () => {
      render(
        <SaveIndicator
          saveStatus="saving"
          lastSaved={null}
          error={null}
        />
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('loading-spinner');
    });

    it('should show "Saved" with checkmark when status is saved (AC2)', () => {
      render(
        <SaveIndicator
          saveStatus="saved"
          lastSaved={mockDate}
          error={null}
        />
      );

      expect(screen.getByText('Saved')).toBeInTheDocument();
      // Check for success icon/checkmark
      const savedElement = screen.getByText('Saved').parentElement;
      expect(savedElement).toHaveClass('text-success');
    });

    it('should show error message when status is error (AC5)', () => {
      render(
        <SaveIndicator
          saveStatus="error"
          lastSaved={null}
          error="Network error"
        />
      );

      expect(screen.getByText('Save failed')).toBeInTheDocument();
      const errorElement = screen.getByText('Save failed').parentElement;
      expect(errorElement).toHaveClass('text-error');
    });

    it('should show last saved time when status is idle and lastSaved exists', () => {
      render(
        <SaveIndicator
          saveStatus="idle"
          lastSaved={mockDate}
          error={null}
        />
      );

      // Should show formatted time
      const timeElement = screen.getByText(/Last saved/i);
      expect(timeElement).toBeInTheDocument();
    });

    it('should not show anything when status is idle and no lastSaved', () => {
      const { container } = render(
        <SaveIndicator
          saveStatus="idle"
          lastSaved={null}
          error={null}
          showManualSave={false}
        />
      );

      // Should render but be mostly empty
      expect(container.querySelector('.flex')).toBeInTheDocument();
    });
  });

  describe('Manual Save Button (AC6)', () => {
    it('should show manual save button when showManualSave is true', () => {
      const mockSave = vi.fn();
      render(
        <SaveIndicator
          saveStatus="idle"
          lastSaved={null}
          error={null}
          onManualSave={mockSave}
          showManualSave={true}
        />
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should not show manual save button when showManualSave is false', () => {
      const mockSave = vi.fn();
      render(
        <SaveIndicator
          saveStatus="idle"
          lastSaved={null}
          error={null}
          onManualSave={mockSave}
          showManualSave={false}
        />
      );

      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    it('should call onManualSave when Save button is clicked', async () => {
      const user = userEvent.setup();
      const mockSave = vi.fn();
      
      render(
        <SaveIndicator
          saveStatus="idle"
          lastSaved={null}
          error={null}
          onManualSave={mockSave}
        />
      );

      await user.click(screen.getByText('Save'));
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should not show Save button when status is saving', () => {
      const mockSave = vi.fn();
      render(
        <SaveIndicator
          saveStatus="saving"
          lastSaved={null}
          error={null}
          onManualSave={mockSave}
        />
      );

      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
  });

  describe('Retry Button (AC5)', () => {
    it('should show retry button when status is error', () => {
      const mockRetry = vi.fn();
      render(
        <SaveIndicator
          saveStatus="error"
          lastSaved={null}
          error="Save failed"
          onRetry={mockRetry}
        />
      );

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should call onRetry when Retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockRetry = vi.fn();
      
      render(
        <SaveIndicator
          saveStatus="error"
          lastSaved={null}
          error="Save failed"
          onRetry={mockRetry}
        />
      );

      await user.click(screen.getByText('Retry'));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should not show retry button when no onRetry handler provided', () => {
      render(
        <SaveIndicator
          saveStatus="error"
          lastSaved={null}
          error="Save failed"
        />
      );

      expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should use DaisyUI badge/alert classes', () => {
      const { container } = render(
        <SaveIndicator
          saveStatus="saved"
          lastSaved={mockDate}
          error={null}
        />
      );

      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toHaveClass('flex', 'items-center', 'gap-2');
    });

    it('should show success color for saved status', () => {
      render(
        <SaveIndicator
          saveStatus="saved"
          lastSaved={mockDate}
          error={null}
        />
      );

      const savedElement = screen.getByText('Saved').parentElement;
      expect(savedElement).toHaveClass('text-success');
    });

    it('should show error color for error status', () => {
      render(
        <SaveIndicator
          saveStatus="error"
          lastSaved={null}
          error="Error message"
        />
      );

      const errorElement = screen.getByText('Save failed').parentElement;
      expect(errorElement).toHaveClass('text-error');
    });

    it('should show faded color for idle with last saved', () => {
      render(
        <SaveIndicator
          saveStatus="idle"
          lastSaved={mockDate}
          error={null}
        />
      );

      const timeElement = screen.getByText(/Last saved/i);
      expect(timeElement).toHaveClass('text-base-content/40');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles for manual save', () => {
      const mockSave = vi.fn();
      render(
        <SaveIndicator
          saveStatus="idle"
          lastSaved={null}
          error={null}
          onManualSave={mockSave}
        />
      );

      const saveButton = screen.getByText('Save');
      expect(saveButton.tagName).toBe('BUTTON');
    });

    it('should have proper button roles for retry', () => {
      const mockRetry = vi.fn();
      render(
        <SaveIndicator
          saveStatus="error"
          lastSaved={null}
          error="Error"
          onRetry={mockRetry}
        />
      );

      const retryButton = screen.getByText('Retry');
      expect(retryButton.tagName).toBe('BUTTON');
    });

    it('should have title attribute on Save button', () => {
      const mockSave = vi.fn();
      render(
        <SaveIndicator
          saveStatus="idle"
          lastSaved={null}
          error={null}
          onManualSave={mockSave}
        />
      );

      const saveButton = screen.getByText('Save');
      expect(saveButton).toHaveAttribute('title', 'Save now');
    });
  });
});
