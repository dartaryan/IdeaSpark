// src/features/prototypes/components/CodeMirrorEditor.tsx
// Low-level CodeMirror 6 React wrapper

import { useRef, useEffect, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, rectangularSelection, crosshairCursor, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { syntaxHighlighting, indentOnInput, bracketMatching, foldGutter, foldKeymap, defaultHighlightStyle, HighlightStyle } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { lintKeymap } from '@codemirror/lint';
import { tags } from '@lezer/highlight';
import type { EditorConfig } from '../types';

// =============================================
// PassportCard Dark Theme
// =============================================
const passportCardDarkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#1E1E1E',
      color: '#D4D4D4',
      height: '100%',
    },
    '.cm-content': {
      caretColor: '#E10514',
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "Consolas", monospace',
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
    '.cm-activeLineGutter': {
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
    '.cm-foldGutter .cm-gutterElement': {
      padding: '0 4px',
    },
    '.cm-tooltip': {
      backgroundColor: '#252526',
      border: '1px solid #454545',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li': {
        padding: '2px 8px',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: '#04395E',
        color: '#D4D4D4',
      },
    },
    '.cm-panels': {
      backgroundColor: '#252526',
      color: '#D4D4D4',
    },
    '.cm-panels.cm-panels-top': {
      borderBottom: '1px solid #454545',
    },
    '.cm-searchMatch': {
      backgroundColor: '#515C6A',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#E10514',
      color: '#fff',
    },
  },
  { dark: true },
);

// PassportCard light theme
const passportCardLightTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#FFFFFF',
      color: '#1E1E1E',
      height: '100%',
    },
    '.cm-content': {
      caretColor: '#E10514',
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "Consolas", monospace',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#E10514',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#E1051420',
    },
    '.cm-activeLine': {
      backgroundColor: '#F5F5F5',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#F5F5F5',
    },
    '.cm-gutters': {
      backgroundColor: '#FAFAFA',
      color: '#999',
      borderRight: '1px solid #E5E5E5',
    },
    '.cm-tooltip': {
      backgroundColor: '#F8F8F8',
      border: '1px solid #DDD',
    },
    '.cm-searchMatch': {
      backgroundColor: '#FFE4B5',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#E10514',
      color: '#fff',
    },
  },
  { dark: false },
);

// PassportCard syntax highlighting
const passportCardHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#E10514' },           // PassportCard red for keywords
  { tag: tags.string, color: '#50C878' },             // Green for strings
  { tag: tags.number, color: '#6495ED' },             // Blue for numbers
  { tag: tags.bool, color: '#6495ED' },
  { tag: tags.null, color: '#6495ED' },
  { tag: tags.comment, color: '#6A9955', fontStyle: 'italic' },
  { tag: tags.typeName, color: '#4EC9B0' },           // Teal for types
  { tag: tags.className, color: '#4EC9B0' },
  { tag: tags.function(tags.variableName), color: '#DCDCAA' }, // Yellow for functions
  { tag: tags.definition(tags.variableName), color: '#9CDCFE' },
  { tag: tags.variableName, color: '#9CDCFE' },
  { tag: tags.propertyName, color: '#9CDCFE' },
  { tag: tags.operator, color: '#D4D4D4' },
  { tag: tags.punctuation, color: '#D4D4D4' },
  { tag: tags.bracket, color: '#FFD700' },
  { tag: tags.tagName, color: '#569CD6' },            // Blue for HTML/JSX tags
  { tag: tags.attributeName, color: '#9CDCFE' },
  { tag: tags.attributeValue, color: '#CE9178' },
  { tag: tags.regexp, color: '#D16969' },
  { tag: tags.meta, color: '#569CD6' },
]);

// =============================================
// Language extension resolver
// =============================================
function getLanguageExtension(language: string) {
  switch (language) {
    case 'typescript':
      return javascript({ jsx: true, typescript: true });
    case 'javascript':
      return javascript({ jsx: true });
    case 'css':
      return css();
    case 'html':
      return html();
    case 'json':
      return json();
    default:
      return javascript({ jsx: true, typescript: true });
  }
}

// =============================================
// Component Props
// =============================================
interface CodeMirrorEditorProps {
  value: string;
  language: string;
  config: EditorConfig;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * CodeMirror 6 editor React wrapper.
 * Handles initialization, theme, language, and config updates.
 */
export function CodeMirrorEditor({
  value,
  language,
  config,
  onChange,
  readOnly = false,
  className = '',
  'aria-label': ariaLabel,
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref up to date without re-creating editor
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const themeExtension = config.theme === 'dark' ? passportCardDarkTheme : passportCardLightTheme;

    // Base extensions shared between read-only and editable modes
    const baseExtensions = [
      // Visual / navigation
      drawSelection(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightSelectionMatches(),
      bracketMatching(),

      // Gutter
      ...(config.lineNumbers ? [lineNumbers()] : []),
      foldGutter(),

      // Word wrap
      ...(config.wordWrap ? [EditorView.lineWrapping] : []),

      // Theme
      themeExtension,
      syntaxHighlighting(passportCardHighlight),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

      // Language
      getLanguageExtension(language),

      // Font size via custom theme
      EditorView.theme({
        '.cm-content': { fontSize: `${config.fontSize}px` },
        '.cm-gutters': { fontSize: `${config.fontSize}px` },
      }),

      // Tab size
      EditorState.tabSize.of(config.tabSize),
    ];

    // Extensions only for editable mode
    const editableExtensions = [
      history(),
      rectangularSelection(),
      crosshairCursor(),
      indentOnInput(),
      closeBrackets(),
      autocompletion(),

      // Key bindings (editable)
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab,
      ]),

      // Change listener
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current?.(update.state.doc.toString());
        }
      }),
    ];

    // Extensions only for read-only mode
    const readOnlyExtensions = [
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      rectangularSelection(),

      // Read-only visual style: muted cursor, subtle gutter
      EditorView.theme({
        '.cm-cursor': { display: 'none' },
        '.cm-content': { cursor: 'default' },
      }),

      // Keep search and fold keymaps in read-only mode
      keymap.of([
        ...defaultKeymap,
        ...searchKeymap,
        ...foldKeymap,
      ]),
    ];

    const extensions = [
      ...baseExtensions,
      ...(readOnly ? readOnlyExtensions : editableExtensions),
    ];

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
    // Recreate editor when language, config, or readOnly changes.
    // Note: readOnly is a dependency because CM6 extensions cannot be dynamically
    // added/removed. Toggling readOnly destroys and rebuilds the editor, which
    // means scroll position, selections, and fold state are lost. This is an
    // accepted CM6 trade-off; the alternative (reconfiguring compartments) adds
    // significant complexity for a rare user action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, config.theme, config.fontSize, config.lineNumbers, config.wordWrap, config.tabSize, readOnly]);

  // Update content when value changes externally (file switch)
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
      className={`h-full overflow-auto ${className}`}
      role="textbox"
      aria-label={ariaLabel || `Code editor, ${language} file`}
      aria-multiline="true"
      aria-readonly={readOnly || undefined}
    />
  );
}
