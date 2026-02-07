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
  CodeMirrorEditor: ({ value, language, onChange, 'aria-label': ariaLabel }: {
    value: string;
    language: string;
    onChange?: (value: string) => void;
    'aria-label'?: string;
  }) => (
    <div data-testid="codemirror-editor" aria-label={ariaLabel}>
      <div data-testid="editor-language">{language}</div>
      <textarea
        data-testid="editor-textarea"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={!onChange}
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

    it('should display format code button', async () => {
      render(<CodeEditorPanel code={singleFileCode} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Format code/)).toBeInTheDocument();
      });
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
});
