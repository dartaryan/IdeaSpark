import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparisonSection } from './ComparisonSection';

describe('ComparisonSection', () => {
  const defaultProps = {
    label: 'Problem Statement',
    original: 'This is the original problem text',
    enhanced: 'This is the enhanced problem text with AI improvements',
    selectedVersion: 'original' as const,
    onSelectVersion: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders the section label', () => {
      render(<ComparisonSection {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /Problem Statement/i })).toBeInTheDocument();
    });

    it('renders original text', () => {
      render(<ComparisonSection {...defaultProps} />);

      expect(screen.getByText(defaultProps.original)).toBeInTheDocument();
    });

    it('renders enhanced text', () => {
      render(<ComparisonSection {...defaultProps} />);

      expect(screen.getByText(defaultProps.enhanced)).toBeInTheDocument();
    });

    it('renders Original label', () => {
      render(<ComparisonSection {...defaultProps} />);

      expect(screen.getByText('Original')).toBeInTheDocument();
    });

    it('renders AI Enhanced label', () => {
      render(<ComparisonSection {...defaultProps} />);

      expect(screen.getByText(/AI Enhanced/i)).toBeInTheDocument();
    });

    it('renders radio buttons for selection', () => {
      render(<ComparisonSection {...defaultProps} />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(2);
    });
  });

  describe('Selection State', () => {
    it('shows original as selected when selectedVersion is original', () => {
      render(<ComparisonSection {...defaultProps} selectedVersion="original" />);

      const originalCard = screen.getByTestId('original-card');
      expect(originalCard).toHaveClass('ring-primary');
    });

    it('shows enhanced as selected when selectedVersion is enhanced', () => {
      render(<ComparisonSection {...defaultProps} selectedVersion="enhanced" />);

      const enhancedCard = screen.getByTestId('enhanced-card');
      expect(enhancedCard).toHaveClass('ring-success');
    });

    it('original radio is checked when selectedVersion is original', () => {
      render(<ComparisonSection {...defaultProps} selectedVersion="original" />);

      const originalRadio = screen.getByTestId('original-radio');
      expect(originalRadio).toBeChecked();
    });

    it('enhanced radio is checked when selectedVersion is enhanced', () => {
      render(<ComparisonSection {...defaultProps} selectedVersion="enhanced" />);

      const enhancedRadio = screen.getByTestId('enhanced-radio');
      expect(enhancedRadio).toBeChecked();
    });
  });

  describe('Selection Interactions', () => {
    it('calls onSelectVersion with "original" when original card is clicked', async () => {
      const user = userEvent.setup();
      const onSelectVersion = vi.fn();
      render(
        <ComparisonSection {...defaultProps} selectedVersion="enhanced" onSelectVersion={onSelectVersion} />
      );

      const originalCard = screen.getByTestId('original-card');
      await user.click(originalCard);

      expect(onSelectVersion).toHaveBeenCalledWith('original');
    });

    it('calls onSelectVersion with "enhanced" when enhanced card is clicked', async () => {
      const user = userEvent.setup();
      const onSelectVersion = vi.fn();
      render(
        <ComparisonSection {...defaultProps} selectedVersion="original" onSelectVersion={onSelectVersion} />
      );

      const enhancedCard = screen.getByTestId('enhanced-card');
      await user.click(enhancedCard);

      expect(onSelectVersion).toHaveBeenCalledWith('enhanced');
    });

    it('calls onSelectVersion when original radio is clicked', async () => {
      const user = userEvent.setup();
      const onSelectVersion = vi.fn();
      render(
        <ComparisonSection {...defaultProps} selectedVersion="enhanced" onSelectVersion={onSelectVersion} />
      );

      const originalRadio = screen.getByTestId('original-radio');
      await user.click(originalRadio);

      expect(onSelectVersion).toHaveBeenCalledWith('original');
    });

    it('calls onSelectVersion when enhanced radio is clicked', async () => {
      const user = userEvent.setup();
      const onSelectVersion = vi.fn();
      render(
        <ComparisonSection {...defaultProps} selectedVersion="original" onSelectVersion={onSelectVersion} />
      );

      const enhancedRadio = screen.getByTestId('enhanced-radio');
      await user.click(enhancedRadio);

      expect(onSelectVersion).toHaveBeenCalledWith('enhanced');
    });
  });

  describe('Styling', () => {
    it('original card has primary tint when selected', () => {
      render(<ComparisonSection {...defaultProps} selectedVersion="original" />);

      const originalCard = screen.getByTestId('original-card');
      expect(originalCard).toHaveClass('bg-primary/10');
    });

    it('enhanced card has success tint when selected', () => {
      render(<ComparisonSection {...defaultProps} selectedVersion="enhanced" />);

      const enhancedCard = screen.getByTestId('enhanced-card');
      expect(enhancedCard).toHaveClass('bg-success/10');
    });

    it('unselected cards have base-200 background', () => {
      render(<ComparisonSection {...defaultProps} selectedVersion="original" />);

      const enhancedCard = screen.getByTestId('enhanced-card');
      expect(enhancedCard).toHaveClass('bg-base-200');
    });
  });
});
