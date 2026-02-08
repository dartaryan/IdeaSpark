// src/features/prototypes/components/MockResponseEditor.tsx

import { useRef, useEffect } from 'react';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  lineNumbers,
  highlightActiveLine,
  drawSelection,
  keymap,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import {
  syntaxHighlighting,
  bracketMatching,
  defaultHighlightStyle,
  HighlightStyle,
} from '@codemirror/language';
import { json } from '@codemirror/lang-json';
import { linter, lintKeymap, type Diagnostic } from '@codemirror/lint';
import { tags } from '@lezer/highlight';

// =============================================
// Dark theme matching PassportCard style
// =============================================
const mockEditorDarkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#1E1E1E',
      color: '#D4D4D4',
      minHeight: '200px',
      maxHeight: '400px',
      overflow: 'auto',
      fontSize: '13px',
    },
    '.cm-content': {
      caretColor: '#E10514',
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "Consolas", monospace',
      padding: '8px 0',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#E10514',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#E1051430',
    },
    '.cm-activeLine': {
      backgroundColor: '#2A2A2A',
    },
    '.cm-gutters': {
      backgroundColor: '#1E1E1E',
      color: '#858585',
      borderRight: '1px solid #333',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 8px 0 4px',
    },
    '.cm-diagnostic-error': {
      borderLeft: '3px solid #E10514',
    },
    '.cm-lintRange-error': {
      backgroundImage: 'none',
      textDecoration: 'wavy underline #E10514',
      textUnderlineOffset: '3px',
    },
    '.cm-tooltip': {
      backgroundColor: '#252526',
      border: '1px solid #454545',
    },
    '.cm-panels': {
      backgroundColor: '#252526',
      color: '#D4D4D4',
    },
  },
  { dark: true },
);

// JSON syntax highlighting
const mockEditorHighlight = HighlightStyle.define([
  { tag: tags.string, color: '#50C878' },
  { tag: tags.number, color: '#6495ED' },
  { tag: tags.bool, color: '#6495ED' },
  { tag: tags.null, color: '#6495ED' },
  { tag: tags.propertyName, color: '#9CDCFE' },
  { tag: tags.punctuation, color: '#D4D4D4' },
  { tag: tags.bracket, color: '#FFD700' },
]);

// =============================================
// JSON Linter
// =============================================
function createJsonLinter(onError: (error: string | null) => void) {
  return linter((view) => {
    const diagnostics: Diagnostic[] = [];
    const doc = view.state.doc.toString();

    if (doc.trim()) {
      try {
        JSON.parse(doc);
        onError(null);
      } catch (e) {
        const message = e instanceof SyntaxError ? e.message : 'Invalid JSON';
        onError(message);
        diagnostics.push({
          from: 0,
          to: doc.length,
          severity: 'error',
          message,
        });
      }
    } else {
      onError(null);
    }

    return diagnostics;
  });
}

// =============================================
// Component
// =============================================
export interface MockResponseEditorProps {
  /** Current JSON string value */
  value: string;
  /** Called when editor content changes */
  onChange: (value: string) => void;
  /** Called when JSON validation error state changes */
  onError: (error: string | null) => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
}

/**
 * JSON editor powered by CodeMirror with syntax highlighting,
 * real-time JSON validation/linting, bracket matching, and auto-closing brackets.
 *
 * This is a controlled component: the parent manages `value` and receives
 * updates via `onChange`. Format and template actions are handled by the parent
 * through the `value` prop.
 */
export function MockResponseEditor({
  value,
  onChange,
  onError,
  disabled = false,
}: MockResponseEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onErrorRef = useRef(onError);

  // Keep callback refs current
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!containerRef.current) return;

    const jsonLinter = createJsonLinter((error) => {
      onErrorRef.current(error);
    });

    const extensions = [
      // Visual
      drawSelection(),
      highlightActiveLine(),
      lineNumbers(),
      bracketMatching(),

      // Theme & highlighting
      mockEditorDarkTheme,
      syntaxHighlighting(mockEditorHighlight),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

      // JSON language + linting
      json(),
      jsonLinter,

      // Editing
      history(),
      closeBrackets(),
      keymap.of([indentWithTab]),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...lintKeymap,
      ]),

      // Change listener
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
    ];

    if (disabled) {
      extensions.push(
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
      );
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // `value` is intentionally excluded: we don't want to destroy/recreate the editor on every
    // keystroke. External value changes are synced via the separate useEffect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  // Sync content when value prop changes externally (format, template)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="border border-base-content/20 rounded-b-lg overflow-hidden"
      role="textbox"
      aria-label="Mock response JSON editor"
      aria-multiline="true"
      data-testid="mock-response-editor"
    />
  );
}
