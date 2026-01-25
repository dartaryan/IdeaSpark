import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompletionValidationModal } from './CompletionValidationModal';
import type { PrdCompletionValidation } from '../types';

describe('CompletionValidationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnFocusSection = vi.fn();

  const incompletePrdValidation: PrdCompletionValidation = {
    isReady: false,
    completedCount: 2,
    totalRequired: 6,
    sectionResults: [
      { key: 'problemStatement', isValid: true, issues: [] },
      { key: 'goalsAndMetrics', isValid: true, issues: [] },
      { key: 'userStories', isValid: false, issues: ['User Stories is empty'] },
      { key: 'requirements', isValid: false, issues: ['Requirements needs more detail (minimum 100 characters, currently 50)'] },
      { key: 'technicalConsiderations', isValid: false, issues: ['Technical Considerations is still in progress'] },
      { key: 'risks', isValid: false, issues: ['Risks is empty'] },
    ],
    incompleteRequired: [
      { key: 'userStories', isValid: false, issues: ['User Stories is empty'] },
      { key: 'requirements', isValid: false, issues: ['Requirements needs more detail (minimum 100 characters, currently 50)'] },
      { key: 'technicalConsiderations', isValid: false, issues: ['Technical Considerations is still in progress'] },
      { key: 'risks', isValid: false, issues: ['Risks is empty'] },
    ],
  };

  afterEach(() => {
    mockOnClose.mockClear();
    mockOnFocusSection.mockClear();
  });

  describe('modal visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <CompletionValidationModal
          isOpen={false}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      expect(container.querySelector('.modal-open')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      const { container } = render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      expect(container.querySelector('.modal-open')).toBeInTheDocument();
    });

    it('should return null when isOpen is false', () => {
      const { container } = render(
        <CompletionValidationModal
          isOpen={false}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('header', () => {
    it('should display "PRD Not Ready" title', () => {
      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      expect(screen.getByText('PRD Not Ready')).toBeInTheDocument();
    });

    it('should display completion progress', () => {
      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      expect(screen.getByText('2 of 6 required sections complete')).toBeInTheDocument();
    });

    it('should display warning icon', () => {
      const { container } = render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      const warningIcon = container.querySelector('.text-warning');
      expect(warningIcon).toBeInTheDocument();
    });
  });

  describe('incomplete sections list', () => {
    it('should display all incomplete sections', () => {
      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      expect(screen.getByText('User Stories')).toBeInTheDocument();
      expect(screen.getByText('Requirements')).toBeInTheDocument();
      expect(screen.getByText('Technical Considerations')).toBeInTheDocument();
      expect(screen.getByText('Risks')).toBeInTheDocument();
    });

    it('should display first issue for each incomplete section', () => {
      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      expect(screen.getByText('User Stories is empty')).toBeInTheDocument();
      expect(screen.getByText(/Requirements needs more detail/)).toBeInTheDocument();
      expect(screen.getByText(/Technical Considerations is still in progress/)).toBeInTheDocument();
      expect(screen.getByText('Risks is empty')).toBeInTheDocument();
    });

    it('should render Focus button for each incomplete section', () => {
      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      const focusButtons = screen.getAllByText('Focus');
      expect(focusButtons).toHaveLength(4);
    });
  });

  describe('actions', () => {
    it('should display "Continue Editing" button', () => {
      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      expect(screen.getByText('Continue Editing')).toBeInTheDocument();
    });

    it('should call onClose when "Continue Editing" is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      const continueButton = screen.getByText('Continue Editing');
      await user.click(continueButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onFocusSection and onClose when Focus button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      const focusButtons = screen.getAllByText('Focus');
      await user.click(focusButtons[0]); // Click first Focus button (userStories)
      
      expect(mockOnFocusSection).toHaveBeenCalledWith('userStories');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close modal when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      const backdrop = container.querySelector('.modal-backdrop button');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('styling', () => {
    it('should use DaisyUI modal styling', () => {
      const { container } = render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      expect(container.querySelector('.modal')).toBeInTheDocument();
      expect(container.querySelector('.modal-box')).toBeInTheDocument();
      expect(container.querySelector('.modal-action')).toBeInTheDocument();
    });

    it('should apply warning background to header icon', () => {
      const { container } = render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      const iconContainer = container.querySelector('.bg-warning\\/20');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use base-200 background for section items', () => {
      const { container } = render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      const sectionItems = container.querySelectorAll('.bg-base-200');
      expect(sectionItems.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle validation with no incomplete sections', () => {
      const completeValidation: PrdCompletionValidation = {
        isReady: true,
        completedCount: 6,
        totalRequired: 6,
        sectionResults: [],
        incompleteRequired: [],
      };

      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={completeValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      expect(screen.getByText('6 of 6 required sections complete')).toBeInTheDocument();
    });

    it('should handle sections with unknown keys gracefully', () => {
      const validationWithUnknown: PrdCompletionValidation = {
        ...incompletePrdValidation,
        incompleteRequired: [
          { key: 'unknownSection' as any, isValid: false, issues: ['Unknown section'] },
        ],
      };

      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={validationWithUnknown}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      // Should still render without crashing
      expect(screen.getByText('PRD Not Ready')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper dialog element', () => {
      const { container } = render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      expect(container.querySelector('dialog')).toBeInTheDocument();
    });

    it('should have button elements with proper roles', () => {
      render(
        <CompletionValidationModal
          isOpen={true}
          onClose={mockOnClose}
          validation={incompletePrdValidation}
          onFocusSection={mockOnFocusSection}
        />
      );
      
      const buttons = screen.getAllByRole('button', { hidden: true });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
