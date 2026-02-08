// src/features/prototypes/components/MockResponseEditor.test.tsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track EditorView instances and the linter callback for behavioral tests
let latestEditorInstance: { destroy: ReturnType<typeof vi.fn>; dispatch: ReturnType<typeof vi.fn>; state: { doc: { toString: () => string } } } | null = null;
let latestUpdateListenerCallback: ((update: { docChanged: boolean; state: { doc: { toString: () => string } } }) => void) | null = null;
let latestLinterCallback: ((view: { state: { doc: { toString: () => string } } }) => unknown[]) | null = null;

// Mock all CodeMirror modules before importing the component.
// EditorView.theme() is called at module-load time for the theme constant,
// so the mock must include it as a static method.
vi.mock('@codemirror/view', () => {
  // Must use function() for `new EditorView()` to work
  function EditorViewMock() {
    const instance = {
      destroy: vi.fn(),
      state: { doc: { toString: () => '' } },
      dispatch: vi.fn(),
    };
    latestEditorInstance = instance;
    return instance;
  }
  // Static methods called at module scope
  EditorViewMock.theme = vi.fn(() => []);
  EditorViewMock.updateListener = {
    of: vi.fn((cb: (update: { docChanged: boolean; state: { doc: { toString: () => string } } }) => void) => {
      latestUpdateListenerCallback = cb;
      return [];
    }),
  };
  EditorViewMock.editable = { of: vi.fn(() => []) };
  EditorViewMock.lineWrapping = [];

  return {
    EditorView: EditorViewMock,
    lineNumbers: vi.fn(() => []),
    highlightActiveLine: vi.fn(() => []),
    drawSelection: vi.fn(() => []),
    keymap: { of: vi.fn(() => []) },
  };
});

vi.mock('@codemirror/state', () => ({
  EditorState: {
    create: vi.fn(() => ({})),
    readOnly: { of: vi.fn(() => []) },
    tabSize: { of: vi.fn(() => []) },
  },
}));

vi.mock('@codemirror/commands', () => ({
  defaultKeymap: [],
  history: vi.fn(() => []),
  historyKeymap: [],
  indentWithTab: {},
}));

vi.mock('@codemirror/autocomplete', () => ({
  closeBrackets: vi.fn(() => []),
  closeBracketsKeymap: [],
}));

vi.mock('@codemirror/language', () => ({
  syntaxHighlighting: vi.fn(() => []),
  bracketMatching: vi.fn(() => []),
  defaultHighlightStyle: {},
  HighlightStyle: { define: vi.fn(() => ({})) },
}));

vi.mock('@codemirror/lang-json', () => ({
  json: vi.fn(() => []),
}));

vi.mock('@codemirror/lint', () => ({
  linter: vi.fn((cb: (view: { state: { doc: { toString: () => string } } }) => unknown[]) => {
    latestLinterCallback = cb;
    return [];
  }),
  lintKeymap: [],
}));

vi.mock('@lezer/highlight', () => ({
  tags: {
    string: 'string',
    number: 'number',
    bool: 'bool',
    null: 'null',
    propertyName: 'propertyName',
    punctuation: 'punctuation',
    bracket: 'bracket',
  },
}));

// Import AFTER mocks are set up
import { MockResponseEditor } from './MockResponseEditor';

describe('MockResponseEditor', () => {
  const onChange = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    latestEditorInstance = null;
    latestUpdateListenerCallback = null;
    latestLinterCallback = null;
  });

  it('should render the editor container', () => {
    render(
      <MockResponseEditor
        value=""
        onChange={onChange}
        onError={onError}
      />,
    );

    expect(screen.getByTestId('mock-response-editor')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(
      <MockResponseEditor
        value='{"key": "value"}'
        onChange={onChange}
        onError={onError}
      />,
    );

    const editor = screen.getByTestId('mock-response-editor');
    expect(editor).toHaveAttribute('role', 'textbox');
    expect(editor).toHaveAttribute('aria-label', 'Mock response JSON editor');
    expect(editor).toHaveAttribute('aria-multiline', 'true');
  });

  it('should render without crashing when disabled', () => {
    render(
      <MockResponseEditor
        value='{"key": "value"}'
        onChange={onChange}
        onError={onError}
        disabled
      />,
    );

    expect(screen.getByTestId('mock-response-editor')).toBeInTheDocument();
  });

  it('should render with empty value', () => {
    render(
      <MockResponseEditor
        value=""
        onChange={onChange}
        onError={onError}
      />,
    );

    expect(screen.getByTestId('mock-response-editor')).toBeInTheDocument();
  });

  it('should render with JSON value', () => {
    const jsonValue = JSON.stringify({ id: 1, name: 'test' }, null, 2);
    render(
      <MockResponseEditor
        value={jsonValue}
        onChange={onChange}
        onError={onError}
      />,
    );

    expect(screen.getByTestId('mock-response-editor')).toBeInTheDocument();
  });

  it('should call onChange when document changes via the update listener', () => {
    render(
      <MockResponseEditor
        value=""
        onChange={onChange}
        onError={onError}
      />,
    );

    // Simulate a document change via the captured update listener
    expect(latestUpdateListenerCallback).toBeDefined();
    latestUpdateListenerCallback!({
      docChanged: true,
      state: { doc: { toString: () => '{"new": "value"}' } },
    });

    expect(onChange).toHaveBeenCalledWith('{"new": "value"}');
  });

  it('should not call onChange when document has not changed', () => {
    render(
      <MockResponseEditor
        value=""
        onChange={onChange}
        onError={onError}
      />,
    );

    expect(latestUpdateListenerCallback).toBeDefined();
    latestUpdateListenerCallback!({
      docChanged: false,
      state: { doc: { toString: () => '' } },
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should call onError with null for valid JSON via the linter', () => {
    render(
      <MockResponseEditor
        value='{"valid": true}'
        onChange={onChange}
        onError={onError}
      />,
    );

    expect(latestLinterCallback).toBeDefined();
    const diagnostics = latestLinterCallback!({
      state: { doc: { toString: () => '{"valid": true}' } },
    });

    expect(onError).toHaveBeenCalledWith(null);
    expect(diagnostics).toEqual([]);
  });

  it('should call onError with error message for invalid JSON via the linter', () => {
    render(
      <MockResponseEditor
        value='{ invalid }'
        onChange={onChange}
        onError={onError}
      />,
    );

    expect(latestLinterCallback).toBeDefined();
    const diagnostics = latestLinterCallback!({
      state: { doc: { toString: () => '{ invalid }' } },
    });

    expect(onError).toHaveBeenCalledWith(expect.stringContaining(''));
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      severity: 'error',
    });
  });

  it('should call onError with null for empty content via the linter', () => {
    render(
      <MockResponseEditor
        value=""
        onChange={onChange}
        onError={onError}
      />,
    );

    expect(latestLinterCallback).toBeDefined();
    const diagnostics = latestLinterCallback!({
      state: { doc: { toString: () => '  ' } },
    });

    expect(onError).toHaveBeenCalledWith(null);
    expect(diagnostics).toEqual([]);
  });

  it('should dispatch content sync when value prop changes externally', () => {
    const { rerender } = render(
      <MockResponseEditor
        value=""
        onChange={onChange}
        onError={onError}
      />,
    );

    // Update the mock instance to return the current doc
    if (latestEditorInstance) {
      latestEditorInstance.state = { doc: { toString: () => '' } };
    }

    // Re-render with a new value (simulating format/template action)
    rerender(
      <MockResponseEditor
        value='{"formatted": true}'
        onChange={onChange}
        onError={onError}
      />,
    );

    // The sync useEffect should dispatch a change to update editor content
    expect(latestEditorInstance?.dispatch).toHaveBeenCalledWith({
      changes: { from: 0, to: 0, insert: '{"formatted": true}' },
    });
  });

  it('should destroy the editor view on unmount', () => {
    const { unmount } = render(
      <MockResponseEditor
        value=""
        onChange={onChange}
        onError={onError}
      />,
    );

    const destroyFn = latestEditorInstance?.destroy;
    expect(destroyFn).toBeDefined();

    unmount();

    expect(destroyFn).toHaveBeenCalled();
  });
});
