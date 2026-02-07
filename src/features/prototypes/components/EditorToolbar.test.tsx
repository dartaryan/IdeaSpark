// src/features/prototypes/components/EditorToolbar.test.tsx
// Unit tests for EditorToolbar component (Story 7.2)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import { EditorToolbar } from './EditorToolbar';
import type { EditorConfig } from '../types';
import { DEFAULT_EDITOR_CONFIG } from '../types';

// Mock formatCode
vi.mock('../utils/editorHelpers', () => ({
  formatCode: vi.fn().mockResolvedValue('formatted code'),
}));

describe('EditorToolbar', () => {
  const defaultProps = {
    activeFile: '/src/App.tsx',
    language: 'typescript',
    config: DEFAULT_EDITOR_CONFIG,
    onConfigChange: vi.fn(),
    onConfigReset: vi.fn(),
    onFormatCode: vi.fn(),
    currentCode: 'const x = 1;',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render file name and language badge', () => {
      render(<EditorToolbar {...defaultProps} />);

      expect(screen.getByText('App.tsx')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });

    it('should show full file path in title tooltip', () => {
      render(<EditorToolbar {...defaultProps} />);

      const fileName = screen.getByTitle('/src/App.tsx');
      expect(fileName).toBeInTheDocument();
    });

    it('should render format button in editable mode', () => {
      render(<EditorToolbar {...defaultProps} />);

      expect(screen.getByLabelText(/Format code/)).toBeInTheDocument();
    });

    it('should render keyboard shortcuts button', () => {
      render(<EditorToolbar {...defaultProps} />);

      expect(screen.getByLabelText('Keyboard shortcuts')).toBeInTheDocument();
    });

    it('should render editor settings button', () => {
      render(<EditorToolbar {...defaultProps} />);

      expect(screen.getByLabelText('Editor settings')).toBeInTheDocument();
    });
  });

  describe('Read-Only Mode', () => {
    it('should hide format button in read-only mode', () => {
      render(<EditorToolbar {...defaultProps} readOnly />);

      expect(screen.queryByLabelText(/Format code/)).not.toBeInTheDocument();
    });

    it('should show read-only badge in read-only mode', () => {
      render(<EditorToolbar {...defaultProps} readOnly />);

      expect(screen.getByText('read-only')).toBeInTheDocument();
    });

    it('should not show read-only badge in editable mode', () => {
      render(<EditorToolbar {...defaultProps} readOnly={false} />);

      expect(screen.queryByText('read-only')).not.toBeInTheDocument();
    });

    it('should filter keyboard shortcuts in read-only mode', () => {
      render(<EditorToolbar {...defaultProps} readOnly />);

      fireEvent.click(screen.getByLabelText('Keyboard shortcuts'));

      // Should show search shortcuts
      expect(screen.getByText('Find in file')).toBeInTheDocument();
      expect(screen.getByText('Find & Replace')).toBeInTheDocument();

      // Should NOT show editing shortcuts
      expect(screen.queryByText('Undo')).not.toBeInTheDocument();
      expect(screen.queryByText('Redo')).not.toBeInTheDocument();
      expect(screen.queryByText('Format code')).not.toBeInTheDocument();
      expect(screen.queryByText('Indent')).not.toBeInTheDocument();
    });

    it('should show all shortcuts in editable mode', () => {
      render(<EditorToolbar {...defaultProps} readOnly={false} />);

      fireEvent.click(screen.getByLabelText('Keyboard shortcuts'));

      expect(screen.getByText('Find in file')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('Format code')).toBeInTheDocument();
      expect(screen.getByText('Indent')).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('should show copy button when onCopy is provided', () => {
      const onCopy = vi.fn();
      render(<EditorToolbar {...defaultProps} onCopy={onCopy} />);

      expect(screen.getByLabelText('Copy file contents to clipboard')).toBeInTheDocument();
    });

    it('should not show copy button when onCopy is not provided', () => {
      render(<EditorToolbar {...defaultProps} />);

      expect(screen.queryByLabelText('Copy file contents to clipboard')).not.toBeInTheDocument();
    });

    it('should call onCopy when copy button is clicked', () => {
      const onCopy = vi.fn();
      render(<EditorToolbar {...defaultProps} onCopy={onCopy} />);

      fireEvent.click(screen.getByLabelText('Copy file contents to clipboard'));
      expect(onCopy).toHaveBeenCalledOnce();
    });

    it('should show check icon when copy state is success', () => {
      const onCopy = vi.fn();
      render(<EditorToolbar {...defaultProps} onCopy={onCopy} copyState="success" />);

      const copyButton = screen.getByLabelText('Copy file contents to clipboard');
      expect(copyButton).toBeInTheDocument();
      // Verify Check icon is rendered (success class applied)
      const successIcon = copyButton.querySelector('.text-success');
      expect(successIcon).toBeInTheDocument();
    });

    it('should show error icon when copy state is error', () => {
      const onCopy = vi.fn();
      render(<EditorToolbar {...defaultProps} onCopy={onCopy} copyState="error" />);

      const copyButton = screen.getByLabelText('Copy file contents to clipboard');
      expect(copyButton).toBeInTheDocument();
      // Verify AlertCircle icon is rendered (error class applied)
      const errorIcon = copyButton.querySelector('.text-error');
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe('Line Count Display', () => {
    it('should display line count when provided', () => {
      render(<EditorToolbar {...defaultProps} lineCount={42} />);

      expect(screen.getByTestId('line-count')).toHaveTextContent('42 lines');
    });

    it('should show "1 line" for single line files', () => {
      render(<EditorToolbar {...defaultProps} lineCount={1} />);

      expect(screen.getByTestId('line-count')).toHaveTextContent('1 line');
    });

    it('should not display line count when not provided', () => {
      render(<EditorToolbar {...defaultProps} />);

      expect(screen.queryByTestId('line-count')).not.toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should render close button when onClose is provided', () => {
      render(<EditorToolbar {...defaultProps} onClose={vi.fn()} />);

      expect(screen.getByLabelText('Close editor')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<EditorToolbar {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByLabelText('Close editor'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('should not render close button when onClose is not provided', () => {
      render(<EditorToolbar {...defaultProps} />);

      expect(screen.queryByLabelText('Close editor')).not.toBeInTheDocument();
    });
  });

  describe('Format Code', () => {
    it('should call onFormatCode when format button is clicked', async () => {
      render(<EditorToolbar {...defaultProps} />);

      fireEvent.click(screen.getByLabelText(/Format code/));

      await waitFor(() => {
        expect(defaultProps.onFormatCode).toHaveBeenCalledWith('formatted code');
      });
    });
  });
});
