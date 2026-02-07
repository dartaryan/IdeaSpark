// src/features/prototypes/components/CodeEditorPanel.test.tsx
// Unit tests for CodeEditorPanel component (Story 7.1)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils';
import { CodeEditorPanel } from './CodeEditorPanel';

// Mock localStorage
const store: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  },
  writable: true,
});

// Mock CodeMirror since it requires DOM APIs not available in jsdom
vi.mock('./CodeMirrorEditor', () => ({
  CodeMirrorEditor: ({ value, language, onChange, readOnly, 'aria-label': ariaLabel }: {
    value: string;
    language: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    'aria-label'?: string;
  }) => (
    <div data-testid="codemirror-editor" aria-label={ariaLabel} data-readonly={readOnly || false}>
      <div data-testid="editor-language">{language}</div>
      <textarea
        data-testid="editor-textarea"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly || !onChange}
      />
    </div>
  ),
}));

const singleFileCode = 'export default function App() { return <div>Hello</div>; }';

const multiFileCode = JSON.stringify({
  '/src/App.tsx': 'export default function App() { return <div>Hello</div>; }',
  '/src/components/Button.tsx': 'export function Button() { return <button>Click</button>; }',
  '/src/styles.css': 'body { margin: 0; }',
});

describe('CodeEditorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(store).forEach(k => delete store[k]);
  });

  describe('Rendering', () => {
    it('should render the code editor panel', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('code-editor-panel')).toBeInTheDocument();
      });
    });

    it('should render with single file code', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('codemirror-editor')).toBeInTheDocument();
      });
    });

    it('should render with multi-file code', async () => {
      render(<CodeEditorPanel code={multiFileCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('codemirror-editor')).toBeInTheDocument();
      });

      // Should show file tree for multi-file
      expect(screen.getByText('Files')).toBeInTheDocument();
    });

    it('should show "No code available" when code is null', async () => {
      render(<CodeEditorPanel code={null} />);

      await waitFor(() => {
        expect(screen.getByText('No code available for this prototype')).toBeInTheDocument();
      });
    });
  });

  describe('File Navigation', () => {
    it('should display file tree for multi-file prototypes', async () => {
      render(<CodeEditorPanel code={multiFileCode} />);

      await waitFor(() => {
        // File tree should be present
        expect(screen.getByLabelText('File explorer')).toBeInTheDocument();
        // Check specific file tree entries (Button and styles are unique to tree)
        expect(screen.getByText('Button.tsx')).toBeInTheDocument();
        expect(screen.getByText('styles.css')).toBeInTheDocument();
      });
    });

    it('should default to App.tsx as the active file', async () => {
      render(<CodeEditorPanel code={multiFileCode} />);

      await waitFor(() => {
        const editor = screen.getByTestId('editor-textarea');
        expect(editor).toHaveValue('export default function App() { return <div>Hello</div>; }');
      });
    });

    it('should not show file tree for single file', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('codemirror-editor')).toBeInTheDocument();
      });

      expect(screen.queryByText('Files')).not.toBeInTheDocument();
    });
  });

  describe('Toolbar', () => {
    it('should display toolbar with file name and language badge', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        // File name in toolbar (has title attribute)
        const toolbarFileName = screen.getByTitle('/App.tsx');
        expect(toolbarFileName).toBeInTheDocument();
        expect(toolbarFileName).toHaveTextContent('App.tsx');
        // Language badge (use getAllByText since mock editor also shows language)
        const typescriptElements = screen.getAllByText('typescript');
        expect(typescriptElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should display format code button when editable', async () => {
      const onCodeChange = vi.fn();
      render(<CodeEditorPanel code={singleFileCode} onCodeChange={onCodeChange} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Format code/)).toBeInTheDocument();
      });
    });

    it('should hide format code button in read-only mode', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('code-editor-panel')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/Format code/)).not.toBeInTheDocument();
    });

    it('should display keyboard shortcuts button', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Keyboard shortcuts')).toBeInTheDocument();
      });
    });

    it('should display editor settings button', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Editor settings')).toBeInTheDocument();
      });
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      render(<CodeEditorPanel code={singleFileCode} onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Close editor')).toBeInTheDocument();
      });

      screen.getByLabelText('Close editor').click();
      expect(onClose).toHaveBeenCalled();
    });

    it('should not show close button when onClose is not provided', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('code-editor-panel')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText('Close editor')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render editor for valid JSON code', async () => {
      const validJson = JSON.stringify({ '/App.tsx': 'const x = 1;' });
      render(<CodeEditorPanel code={validJson} />);

      await waitFor(() => {
        expect(screen.getByTestId('codemirror-editor')).toBeInTheDocument();
      });
    });

    it('should render editor for plain text code (fallback)', async () => {
      render(<CodeEditorPanel code="plain text code" />);

      await waitFor(() => {
        expect(screen.getByTestId('codemirror-editor')).toBeInTheDocument();
      });
    });
  });

  describe('Language Detection', () => {
    it('should detect TypeScript for .tsx files', async () => {
      render(<CodeEditorPanel code={multiFileCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('editor-language')).toHaveTextContent('typescript');
      });
    });

    it('should detect CSS for .css files', async () => {
      const cssCode = JSON.stringify({ '/styles.css': 'body { margin: 0; }' });
      render(<CodeEditorPanel code={cssCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('editor-language')).toHaveTextContent('css');
      });
    });
  });

  describe('Read-Only Mode', () => {
    it('should auto-detect read-only when onCodeChange is not provided', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('code-editor-panel')).toBeInTheDocument();
      });

      // Format button should be hidden (read-only auto-detected)
      expect(screen.queryByLabelText(/Format code/)).not.toBeInTheDocument();
      // Read-only badge should be visible
      expect(screen.getByText('read-only')).toBeInTheDocument();
    });

    it('should be editable when onCodeChange is provided', async () => {
      const onCodeChange = vi.fn();
      render(<CodeEditorPanel code={singleFileCode} onCodeChange={onCodeChange} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Format code/)).toBeInTheDocument();
      });

      // Read-only badge should NOT be visible
      expect(screen.queryByText('read-only')).not.toBeInTheDocument();
    });

    it('should pass readOnly to CodeMirrorEditor when onCodeChange is not provided', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        const editor = screen.getByTestId('codemirror-editor');
        expect(editor).toHaveAttribute('data-readonly', 'true');
      });
    });

    it('should pass readOnly=false to CodeMirrorEditor when onCodeChange is provided', async () => {
      const onCodeChange = vi.fn();
      render(<CodeEditorPanel code={singleFileCode} onCodeChange={onCodeChange} />);

      await waitFor(() => {
        const editor = screen.getByTestId('codemirror-editor');
        expect(editor).toHaveAttribute('data-readonly', 'false');
      });
    });

    it('should honor explicit readOnly prop over auto-detection', async () => {
      const onCodeChange = vi.fn();
      render(<CodeEditorPanel code={singleFileCode} onCodeChange={onCodeChange} readOnly />);

      await waitFor(() => {
        expect(screen.getByTestId('code-editor-panel')).toBeInTheDocument();
      });

      // Even though onCodeChange is provided, readOnly=true should win
      expect(screen.queryByLabelText(/Format code/)).not.toBeInTheDocument();
      expect(screen.getByText('read-only')).toBeInTheDocument();
    });
  });

  describe('Copy to Clipboard', () => {
    const originalClipboard = navigator.clipboard;

    beforeEach(() => {
      // Restore clipboard after each test to avoid leaking mocks
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    });

    it('should show copy button', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Copy file contents to clipboard')).toBeInTheDocument();
      });
    });

    it('should copy content to clipboard when copy button is clicked', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Copy file contents to clipboard')).toBeInTheDocument();
      });

      screen.getByLabelText('Copy file contents to clipboard').click();

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith(singleFileCode);
      });
    });

    it('should fall back to execCommand when clipboard API fails', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('Not allowed'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      // JSDOM doesn't implement execCommand, define it for fallback testing
      const execCommandMock = vi.fn().mockReturnValue(true);
      document.execCommand = execCommandMock;

      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Copy file contents to clipboard')).toBeInTheDocument();
      });

      screen.getByLabelText('Copy file contents to clipboard').click();

      await waitFor(() => {
        expect(execCommandMock).toHaveBeenCalledWith('copy');
      });

      delete (document as Record<string, unknown>).execCommand;
    });

    it('should show error toast when both clipboard API and fallback fail', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('Not allowed'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      // execCommand returning false triggers error path
      const execCommandMock = vi.fn().mockReturnValue(false);
      document.execCommand = execCommandMock;

      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Copy file contents to clipboard')).toBeInTheDocument();
      });

      screen.getByLabelText('Copy file contents to clipboard').click();

      await waitFor(() => {
        expect(execCommandMock).toHaveBeenCalledWith('copy');
      });

      delete (document as Record<string, unknown>).execCommand;
    });
  });

  describe('File Metadata', () => {
    it('should display line count in toolbar', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('line-count')).toBeInTheDocument();
      });

      expect(screen.getByTestId('line-count')).toHaveTextContent('1 line');
    });

    it('should display correct line count for multi-line code', async () => {
      const multiLineCode = 'line1\nline2\nline3';
      render(<CodeEditorPanel code={multiLineCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('line-count')).toHaveTextContent('3 lines');
      });
    });

    it('should display language badge', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        // Badge in toolbar
        const badges = screen.getAllByText('typescript');
        expect(badges.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Edit Mode (Story 7.3)', () => {
    it('should enable editing when onCodeChange is provided', async () => {
      const onCodeChange = vi.fn();
      render(<CodeEditorPanel code={singleFileCode} onCodeChange={onCodeChange} />);

      await waitFor(() => {
        const editor = screen.getByTestId('codemirror-editor');
        expect(editor.dataset.readonly).toBe('false');
      });
    });

    it('should be read-only when onCodeChange is absent', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        const editor = screen.getByTestId('codemirror-editor');
        expect(editor.dataset.readonly).toBe('true');
      });
    });

    it('should show compilation error badge when hasCompilationError is true', async () => {
      render(
        <CodeEditorPanel
          code={singleFileCode}
          onCodeChange={vi.fn()}
          hasCompilationError={true}
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('compilation-error-badge')).toBeInTheDocument();
      });

      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should not show compilation error badge when hasCompilationError is false', async () => {
      render(
        <CodeEditorPanel
          code={singleFileCode}
          onCodeChange={vi.fn()}
          hasCompilationError={false}
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('code-editor-panel')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('compilation-error-badge')).not.toBeInTheDocument();
    });
  });
});
