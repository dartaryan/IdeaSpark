# Story 7.1: Code Editor Integration (Monaco or CodeMirror)

Status: complete

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want to **integrate a code editor into the prototype viewer**,
So that **users can edit prototype code with syntax highlighting and autocomplete**.

## Acceptance Criteria

**Given** the prototype viewer supports code editing
**When** I install Monaco Editor or CodeMirror
**Then** the package is added to dependencies

**Given** the editor is integrated
**When** I add it to the prototype viewer component
**Then** it renders alongside the Sandpack preview
**And** supports TypeScript/JSX syntax highlighting
**And** provides autocomplete and error detection

## Tasks / Subtasks

- [x] Task 1: Evaluate Monaco vs CodeMirror for integration (AC: Editor selection)
  - [x] Subtask 1.1: Research Monaco Editor (used by VS Code)
  - [x] Subtask 1.2: Check Monaco bundle size and Vite compatibility
  - [x] Subtask 1.3: Research CodeMirror 6 (lightweight alternative)
  - [x] Subtask 1.4: Check CodeMirror 6 TypeScript support and bundle size
  - [x] Subtask 1.5: Compare features: syntax highlighting, autocomplete, error detection
  - [x] Subtask 1.6: Verify Sandpack compatibility with both editors
  - [x] Subtask 1.7: Make decision based on: bundle size, feature completeness, Sandpack integration ease
  - [x] Subtask 1.8: Document decision in story completion notes

- [x] Task 2: Install chosen code editor package (AC: Dependencies added)
  - [x] Subtask 2.1: Install editor package via npm
    - CodeMirror: `npm install @codemirror/view @codemirror/state @codemirror/lang-javascript @codemirror/lang-html @codemirror/lang-css @codemirror/lang-json @codemirror/autocomplete @codemirror/lint @codemirror/commands @codemirror/search @codemirror/language @lezer/highlight prettier`
  - [x] Subtask 2.2: Install TypeScript types if needed
  - [x] Subtask 2.3: Verify installation: check package.json
  - [x] Subtask 2.4: Run `npm install` successfully
  - [x] Subtask 2.5: Verify no dependency conflicts
  - [x] Subtask 2.6: Check Vite build doesn't break after installation
  - [x] Subtask 2.7: Update package.json with correct versions

- [x] Task 3: Integrate editor with prototype code (adapted from Sandpack) (AC: Editor-code synchronization)
  - [x] Subtask 3.1: Create useEditorSync hook (replaces Sandpack hooks)
  - [x] Subtask 3.2: Connect editor to prototype `code` field via parsePrototypeCode
  - [x] Subtask 3.3: Sync editor content with active file
  - [x] Subtask 3.4: Update file content when editor changes (300ms debounce)
  - [x] Subtask 3.5: Handle file switching: update editor content when user selects different file
  - [x] Subtask 3.6: Preserve cursor position during file switches (CodeMirror handles via state)
  - [x] Subtask 3.7: Test useEditorSync hook with unit tests (12 tests)
  - [x] Subtask 3.8: Handle edge cases: null code, invalid JSON, empty files

- [x] Task 4: Create CodeEditorPanel component (AC: Editor UI component)
  - [x] Subtask 4.1: Create CodeEditorPanel.tsx in features/prototypes/components/
  - [x] Subtask 4.2: Accept props: code, onCodeChange, onClose, initialFile
  - [x] Subtask 4.3: Render code editor with full height
  - [x] Subtask 4.4: Display file tabs for switching between files (when tree hidden)
  - [x] Subtask 4.5: Highlight active file tab
  - [x] Subtask 4.6: Add "View Code" / "Hide Code" toggle button (in PrototypeViewerPage)
  - [x] Subtask 4.7: Apply PassportCard styling (#E10514 border)
  - [x] Subtask 4.8: File tree sidebar with expand/collapse
  - [x] Subtask 4.9: Make panel resizable (drag handle in PrototypeViewerPage)
  - [x] Subtask 4.10: Add loading skeleton while editor initializes

- [x] Task 5: Configure syntax highlighting for TypeScript/JSX (AC: Syntax highlighting)
  - [x] Subtask 5.1: Configure language detection based on file extension (.ts, .tsx, .js, .jsx, .css, .html, .json)
  - [x] Subtask 5.2: Set up TypeScript/JSX language mode via @codemirror/lang-javascript
  - [x] Subtask 5.3: Configure PassportCard syntax theme (dark + light variants)
  - [x] Subtask 5.4: Language extensions for all file types: TS/TSX, JS/JSX, CSS, HTML, JSON
  - [x] Subtask 5.5: JSX support enabled via javascript({ jsx: true, typescript: true })
  - [x] Subtask 5.6: PassportCard red (#E10514) for keywords, readable contrast colors

- [x] Task 6: Implement autocomplete functionality (AC: Autocomplete support)
  - [x] Subtask 6.1: Enable autocompletion() extension in CodeMirror
  - [x] Subtask 6.2: Configure closeBrackets for bracket auto-pairing
  - [x] Subtask 6.3: Keyword and variable completion via CodeMirror language extensions
  - [x] Subtask 6.4: Completion keymaps integrated (completionKeymap)
  - [x] Subtask 6.5: Bracket matching enabled via bracketMatching()
  - [x] Subtask 6.6: N/A - DaisyUI class autocomplete deferred (beyond MVP scope)
  - [x] Subtask 6.7: Non-blocking autocomplete that doesn't interfere with typing

- [x] Task 7: Add error detection and inline linting (AC: Error detection)
  - [x] Subtask 7.1: Lint extension infrastructure enabled (@codemirror/lint)
  - [x] Subtask 7.2: Lint keymaps integrated (lintKeymap)
  - [x] Subtask 7.3: Syntax error detection via CodeMirror parser
  - [x] Subtask 7.4: N/A - Full TypeScript diagnostic checking requires TS language server (beyond MVP)
  - [x] Subtask 7.5: Basic syntax validation via language mode parsers
  - [x] Subtask 7.6: N/A - Sandpack console sync deferred (no Sandpack in current architecture)
  - [x] Subtask 7.7: Non-blocking validation - errors don't block editing
  - [x] Subtask 7.8: Fold gutter enabled for code folding indicators

- [x] Task 8: Integrate CodeEditorPanel into PrototypeViewer (AC: Editor display)
  - [x] Subtask 8.1: Import CodeEditorPanel into PrototypeViewerPage.tsx
  - [x] Subtask 8.2: Create split layout: Code editor (left) | iframe preview (right)
  - [x] Subtask 8.3: Use responsive flexbox for layout
  - [x] Subtask 8.4: Default width: 50% editor, 50% preview (configurable)
  - [x] Subtask 8.5: Add drag resize handle between editor and preview
  - [x] Subtask 8.6: Persist editor width preference in localStorage
  - [x] Subtask 8.7: Add "View Code" / "Hide Code" toggle button
  - [x] Subtask 8.8: When editor hidden, preview takes full width
  - [x] Subtask 8.9: Mobile responsive layout with Code/Preview tab switcher
  - [x] Subtask 8.10: PrototypeFrame preview remains fully functional

- [x] Task 9: Add file tree/navigation for multi-file prototypes (AC: File navigation)
  - [x] Subtask 9.1: Create FileTree component displaying all prototype files
  - [x] Subtask 9.2: List files in tree structure with buildFileTree utility
  - [x] Subtask 9.3: Group files by directory with nested tree nodes
  - [x] Subtask 9.4: Highlight currently active file with primary color
  - [x] Subtask 9.5: Click file to open in editor via onFileSelect callback
  - [x] Subtask 9.6: Display file icons by type (lucide-react: FileCode, FileType, FileText)
  - [x] Subtask 9.7: Add expand/collapse for directories (ChevronRight/Down)
  - [x] Subtask 9.8: Position file tree as collapsible sidebar beside editor
  - [x] Subtask 9.9: Make file tree collapsible with PanelLeftClose button
  - [x] Subtask 9.10: Keyboard navigation (Enter, Space, ArrowLeft, ArrowRight)

- [x] Task 10: Implement code formatting (AC: Code beautification)
  - [x] Subtask 10.1: Prettier installed as dependency
  - [x] Subtask 10.2: Configure Prettier with React/TypeScript defaults (singleQuote, semi, trailingComma)
  - [x] Subtask 10.3: Add "Format Code" (Wand2) button to EditorToolbar
  - [x] Subtask 10.4: Lazy-load Prettier plugins on format action
  - [x] Subtask 10.5: Update editor content with formatted code via handleFormatCode
  - [x] Subtask 10.6: Loading spinner shown during formatting
  - [x] Subtask 10.7: Add keyboard shortcut: Ctrl+Shift+F (Cmd+Shift+F on Mac)
  - [x] Subtask 10.8: Handle formatting errors gracefully (try/catch with console.error)
  - [x] Subtask 10.9: Auto-detect parser based on language (typescript, babel, css, html, json)
  - [x] Subtask 10.10: Prettier plugins code-split into separate chunks

- [x] Task 11: Add TypeScript types for editor state (AC: Type safety)
  - [x] Subtask 11.1: Create EditorState, EditorFile, EditorConfig, FileTreeNode types
  - [x] Subtask 11.2: Define EditorFile: { path, content, language }
  - [x] Subtask 11.3: Define EditorConfig: { fontSize, theme, wordWrap, lineNumbers, tabSize }
  - [x] Subtask 11.4: Define FileTreeNode: { name, path, type, children, isOpen }
  - [x] Subtask 11.5: Export all types + utility functions (detectLanguage, parsePrototypeCode, buildFileTree)
  - [x] Subtask 11.6: Types used in CodeEditorPanel, FileTree, EditorSettings, EditorToolbar
  - [x] Subtask 11.7: Types used in PrototypeViewerPage integration
  - [x] Subtask 11.8: TypeScript strict mode compilation passes (tsc --noEmit)

- [x] Task 12: Create custom editor theme matching PassportCard (AC: Brand consistency)
  - [x] Subtask 12.1: Define passportCardDarkTheme and passportCardLightTheme
  - [x] Subtask 12.2: #E10514 red for keywords, cursor, selection highlight, search matches
  - [x] Subtask 12.3: Dark background (#1E1E1E), gutter (#1E1E1E), active line (#2A2A2A)
  - [x] Subtask 12.4: Font: "Fira Code", "Cascadia Code", "JetBrains Mono", "Consolas"
  - [x] Subtask 12.5: Font size: 14px default (adjustable 10-20px via settings)
  - [x] Subtask 12.6: Custom HighlightStyle with branded colors applied via syntaxHighlighting
  - [x] Subtask 12.7: High-contrast colors chosen for readability
  - [x] Subtask 12.8: Light/Dark theme toggle in EditorSettings panel

- [x] Task 13: Implement editor performance optimizations (AC: Performance)
  - [x] Subtask 13.1: Debounce onChange events (300ms delay) in useEditorSync
  - [x] Subtask 13.2: useCallback for event handlers in FileTree and CodeEditorPanel
  - [x] Subtask 13.3: Lazy load CodeMirrorEditor via React.lazy + Suspense
  - [x] Subtask 13.4: EditorView.destroy() on component unmount (cleanup in useEffect)
  - [x] Subtask 13.5: CodeMirror natively handles large files efficiently
  - [x] Subtask 13.6: Debounce timer cleanup on unmount (clearTimeout in useEditorSync)
  - [x] Subtask 13.7: Editor chunk code-split (553KB/190KB gzip separate chunk)
  - [x] Subtask 13.8: Prettier plugins lazy-loaded only on format action

- [x] Task 14: Add keyboard shortcuts for common actions (AC: Keyboard navigation)
  - [x] Subtask 14.1: N/A - Ctrl+S save deferred (requires version save API)
  - [x] Subtask 14.2: Ctrl+F: Find in file (via searchKeymap)
  - [x] Subtask 14.3: Ctrl+Shift+F: Format code (global keydown handler)
  - [x] Subtask 14.4: Ctrl+/: Toggle line comment (via defaultKeymap)
  - [x] Subtask 14.5: Tab/Shift+Tab: Indent/outdent (indentWithTab)
  - [x] Subtask 14.6: Ctrl+Z / Ctrl+Shift+Z: Undo/Redo (via historyKeymap)
  - [x] Subtask 14.7: Escape: Close autocomplete (via completionKeymap)
  - [x] Subtask 14.8: Keyboard shortcuts help tooltip in EditorToolbar
  - [x] Subtask 14.9: Cross-platform key detection (metaKey for Mac, ctrlKey for Windows)
  - [x] Subtask 14.10: Ctrl+H: Find & Replace (via searchKeymap)

- [x] Task 15: Create comprehensive unit tests for code editor (AC: Quality assurance)
  - [x] Subtask 15.1: Create CodeEditorPanel.test.tsx (17 tests)
  - [x] Subtask 15.2: Test editor renders with file content
  - [x] Subtask 15.3: Test file switching updates editor content
  - [x] Subtask 15.4: Test onChange debouncing (useEditorSync.test.tsx)
  - [x] Subtask 15.5: Test useEditorSync hook (12 tests)
  - [x] Subtask 15.6: Test language detection (types.test.ts, 10 tests)
  - [x] Subtask 15.7: Test parsePrototypeCode (types.test.ts, 6 tests)
  - [x] Subtask 15.8: Test buildFileTree (types.test.ts, 5 tests)
  - [x] Subtask 15.9: Test FileTree navigation (FileTree.test.tsx, 11 tests)
  - [x] Subtask 15.10: Test keyboard navigation (Enter, Space, ArrowLeft, ArrowRight)
  - [x] Subtask 15.11: Test EditorSettings (EditorSettings.test.tsx, 9 tests)
  - [x] Subtask 15.12: Test editorHelpers (editorHelpers.test.ts, 9 tests)
  - [x] Subtask 15.13: Test loading and error states
  - [x] Subtask 15.14: 81 tests passing across 6 test files

- [x] Task 16: Implement responsive layout for mobile (AC: Mobile support)
  - [x] Subtask 16.1: On mobile (<768px), full-screen editor replaces preview
  - [x] Subtask 16.2: Mobile tab switcher: "Preview" / "Code" tabs
  - [x] Subtask 16.3: Default to "Preview" tab on mobile
  - [x] Subtask 16.4: Editor font size configurable via EditorSettings (10-20px)
  - [x] Subtask 16.5: File tree collapsible via toggle button
  - [x] Subtask 16.6: Hidden md:flex / md:hidden for responsive layout
  - [x] Subtask 16.7: Desktop side-by-side, mobile stacked layout
  - [x] Subtask 16.8: Code/Preview tabs only visible on mobile when editor is open

- [x] Task 17: Add accessibility features (AC: WCAG 2.1 AA compliance)
  - [x] Subtask 17.1: ARIA labels on editor: "Code editor, {language} file: {path}"
  - [x] Subtask 17.2: File tree keyboard navigable (Enter, Space, ArrowLeft, ArrowRight)
  - [x] Subtask 17.3: Focus indicators via DaisyUI focus styles and tabIndex
  - [x] Subtask 17.4: aria-selected on active file, aria-expanded on directories
  - [x] Subtask 17.5: High-contrast PassportCard theme colors
  - [x] Subtask 17.6: ARIA tree role structure (role="tree", role="treeitem", role="group")
  - [x] Subtask 17.7: aria-label on file explorer nav, resize separator
  - [x] Subtask 17.8: File icons use both icon shape AND text labels for identification

- [x] Task 18: Add error handling and edge cases (AC: Robust error handling)
  - [x] Subtask 18.1: Error state in CodeEditorPanel with error message display
  - [x] Subtask 18.2: Suspense fallback with loading skeleton for lazy-loaded editor
  - [x] Subtask 18.3: parsePrototypeCode handles invalid JSON, null, empty strings
  - [x] Subtask 18.4: CodeMirror handles large files natively (virtual rendering)
  - [x] Subtask 18.5: detectLanguage defaults to 'javascript' for unknown extensions
  - [x] Subtask 18.6: "No code available" state when prototype.code is null
  - [x] Subtask 18.7: localStorage save/load wrapped in try/catch
  - [x] Subtask 18.8: Console error logging in editorHelpers and useEditorSync

- [x] Task 19: Add user preferences for editor settings (AC: Customization)
  - [x] Subtask 19.1: EditorSettings dropdown panel with all options
  - [x] Subtask 19.2: Font size slider (10px - 20px) with live preview
  - [x] Subtask 19.3: Theme toggle: Light / Dark
  - [x] Subtask 19.4: Word wrap toggle
  - [x] Subtask 19.5: Line numbers toggle
  - [x] Subtask 19.6: Tab size selector (2 or 4 spaces)
  - [x] Subtask 19.7: Save preferences to localStorage via saveEditorPreferences
  - [x] Subtask 19.8: Load preferences on mount via loadEditorPreferences
  - [x] Subtask 19.9: "Reset to Defaults" button in EditorSettings
  - [x] Subtask 19.10: Tested via editorHelpers.test.ts and EditorSettings.test.tsx

- [x] Task 20: Create integration tests (adapted from Sandpack) (AC: End-to-end testing)
  - [x] Subtask 20.1: Test CodeEditorPanel renders with single and multi-file code
  - [x] Subtask 20.2: Test file tree displays and navigates in multi-file mode
  - [x] Subtask 20.3: Test active file defaults to App.tsx
  - [x] Subtask 20.4: Test language detection for CSS, TypeScript files
  - [x] Subtask 20.5: Test error states: null code shows "No code available"
  - [x] Subtask 20.6: Test toolbar renders format, shortcuts, settings buttons
  - [x] Subtask 20.7: Test close button calls onClose callback
  - [x] Subtask 20.8: 81 total tests across types, utils, hooks, and components

## Dev Notes

### Architecture Alignment

**Feature Location:**
- CodeEditorPanel: `src/features/prototypes/components/CodeEditorPanel.tsx`
- FileTree: `src/features/prototypes/components/FileTree.tsx`
- EditorSettings: `src/features/prototypes/components/EditorSettings.tsx`
- PrototypeViewer: `src/features/prototypes/components/PrototypeViewer.tsx` (update existing)
- Types: `src/features/prototypes/types.ts` (update existing)
- Tests: Co-located with components (CodeEditorPanel.test.tsx, etc.)

**Integration Points:**
- Sandpack: `@codesandbox/sandpack-react` (already installed from Story 4.1)
- Code Editor: Monaco Editor OR CodeMirror 6 (to be decided in Task 1)
- Formatting: Prettier (to be installed)

**State Management:**
- React local state for editor content (useState)
- localStorage for editor preferences (font size, theme, width)
- Sandpack hook: `useSandpack()` for file system access
- No Zustand or React Query needed for this story

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/prototypes/components/`
- Naming: PascalCase for components (`CodeEditorPanel`, `FileTree`)
- Props interface naming: `{ComponentName}Props`
- Hooks naming: `use{Feature}` (e.g., `useEditorSync`, `useFileTree`)

**Integration Pattern:**
```typescript
import { useSandpack, useSandpackFiles } from '@codesandbox/sandpack-react';

function CodeEditorPanel({ prototypeId }: CodeEditorPanelProps) {
  const { sandpack } = useSandpack();
  const { files, updateFile } = sandpack;
  
  const handleEditorChange = useCallback(debounce((value: string) => {
    updateFile(activeFile, value);
  }, 300), [activeFile, updateFile]);
  
  return (
    <div className="code-editor-panel">
      <Editor
        value={files[activeFile]?.code || ''}
        onChange={handleEditorChange}
        language="typescript"
      />
    </div>
  );
}
```

**Error Handling:**
- Wrap editor in `<ErrorBoundary>` component
- Show loading skeleton while editor initializes
- Display error message if editor fails to load
- Handle Sandpack sync failures gracefully with retry
- Log errors to console for debugging

**Performance Requirements:**
- Editor initialization: <2 seconds
- File switching: <500ms
- onChange debounce: 300ms (balance responsiveness vs performance)
- Memory: Dispose editor instance on unmount to prevent leaks
- Large files (>1000 lines): Use virtualized rendering if available

**Testing Standards:**
- Unit tests for CodeEditorPanel component
- Unit tests for FileTree navigation
- Unit tests for editor-Sandpack synchronization
- Integration tests for PrototypeViewer with editor
- Test all loading, error, and success states
- Test keyboard shortcuts and accessibility
- Achieve >90% test coverage

### Monaco vs CodeMirror Decision Matrix

**Monaco Editor:**
- ✅ Pros:
  - Used by VS Code (battle-tested, feature-rich)
  - Excellent TypeScript/JSX support out of the box
  - Built-in autocomplete (IntelliSense)
  - Advanced features: diff editor, minimap, command palette
  - Strong community and documentation
- ❌ Cons:
  - Large bundle size (~2-3 MB minified)
  - More complex setup with Vite
  - May require Web Workers configuration
  - Heavier for users (slower initial load)

**CodeMirror 6:**
- ✅ Pros:
  - Lightweight (~300 KB minified)
  - Modern, modular architecture
  - Fast performance
  - Easier Vite integration
  - Good TypeScript support via language packages
- ❌ Cons:
  - Less feature-rich than Monaco
  - Autocomplete requires more configuration
  - Smaller ecosystem compared to Monaco
  - May need custom extensions for advanced features

**Recommendation:**
Given this is an MVP and bundle size matters for prototype viewer performance, **CodeMirror 6** is recommended unless Monaco's advanced features (diff editor, advanced IntelliSense) are deemed critical. CodeMirror provides 90% of Monaco's functionality at 10% of the bundle size.

**Final Decision:** To be made in Task 1 based on Sandpack integration compatibility testing.

### Sandpack Integration Strategy

**Sandpack Hooks to Use:**
```typescript
import { useSandpack, SandpackFile } from '@codesandbox/sandpack-react';

const { sandpack } = useSandpack();
const { files, updateFile, activeFile, setActiveFile } = sandpack;
```

**Key Integration Points:**
1. **File Synchronization:**
   - Editor displays content of `files[activeFile]`
   - Editor onChange → `updateFile(activeFile, newContent)` (debounced)
   - User switches file → Update editor content from `files[newFile]`

2. **File System Access:**
   - Sandpack provides file tree via `Object.keys(files)`
   - Create FileTree component from `files` object
   - Handle file paths: `/src/App.tsx`, `/src/components/Button.tsx`

3. **Hot Reload:**
   - Sandpack automatically reloads preview when `updateFile()` called
   - No additional hot reload logic needed
   - Debounce prevents excessive reloads during typing

4. **Error Handling:**
   - Sandpack console displays compilation errors
   - Editor can show inline errors via TypeScript diagnostics
   - Sync errors between editor and Sandpack console

**Example Integration:**
```typescript
function CodeEditorPanel() {
  const { sandpack } = useSandpack();
  const { files, updateFile, activeFile, setActiveFile } = sandpack;
  
  const [editorContent, setEditorContent] = useState('');
  
  // Sync editor content when active file changes
  useEffect(() => {
    const file = files[activeFile];
    if (file) {
      setEditorContent(file.code);
    }
  }, [activeFile, files]);
  
  // Debounced update to Sandpack
  const handleEditorChange = useCallback(
    debounce((value: string) => {
      updateFile(activeFile, value);
    }, 300),
    [activeFile, updateFile]
  );
  
  return (
    <Editor
      value={editorContent}
      onChange={(value) => {
        setEditorContent(value);
        handleEditorChange(value);
      }}
    />
  );
}
```

### Previous Story Learnings

**From Story 4.1 (Sandpack Integration Setup):**
- Sandpack installed and working: `@codesandbox/sandpack-react`
- PrototypeViewer component exists and renders Sandpack
- Multi-file prototypes supported (3-5 components typical)
- Sandpack configuration: React template with TypeScript
- Hot reload and preview working

**From Story 4.4 (Prototype Viewer with Sandpack):**
- PrototypeViewer location: `src/features/prototypes/components/PrototypeViewer.tsx`
- Layout: Full-width Sandpack preview currently
- PassportCard theme applied to generated prototypes
- Forms, navigation, and interactivity all functional
- Sandpack hooks used: `useSandpack()`, `SandpackPreview`, `SandpackCodeEditor`

**From Story 4.5 (Prototype Refinement Chat Interface):**
- Chat interface exists alongside prototype viewer
- Refinement chat can update prototype code
- Pattern established for code updates and regeneration
- User can request changes via natural language

**Key Patterns to Follow:**
- Feature-based structure: `features/prototypes/`
- DaisyUI components: card, tabs, drawer, collapse
- PassportCard styling: #E10514 primary red, 20px border radius
- Loading skeletons for async operations
- Error boundaries for graceful failure handling
- Comprehensive unit tests (>90% coverage)

### Project Structure Notes

**Files to Modify:**
```
src/features/prototypes/
├── components/
│   └── PrototypeViewer.tsx (UPDATE: integrate CodeEditorPanel)
└── types.ts (UPDATE: add editor types)
```

**New Files to Create:**
```
src/features/prototypes/components/
├── CodeEditorPanel.tsx
├── CodeEditorPanel.test.tsx
├── FileTree.tsx
├── FileTree.test.tsx
├── EditorSettings.tsx
├── EditorSettings.test.tsx
└── EditorToolbar.tsx
```

**Package Dependencies to Add:**
```json
// Option A: Monaco Editor
"dependencies": {
  "@monaco-editor/react": "^4.6.0",
  "monaco-editor": "^0.45.0",
  "prettier": "^3.2.5"
}

// Option B: CodeMirror 6
"dependencies": {
  "@codemirror/view": "^6.23.0",
  "@codemirror/lang-javascript": "^6.2.1",
  "@codemirror/lang-html": "^6.4.7",
  "@codemirror/lang-css": "^6.2.1",
  "@codemirror/autocomplete": "^6.12.0",
  "@codemirror/lint": "^6.5.0",
  "@codemirror/state": "^6.4.0",
  "prettier": "^3.2.5"
}
```

**No Database Migrations Required:** This story is purely frontend.

### Developer Context

**🎯 Story Goal:**
This story integrates a professional code editor (Monaco or CodeMirror) into the prototype viewer, enabling users to view and eventually edit generated prototype code. This is the foundation for Epic 7's live editing capabilities. The editor must provide a VS Code-like experience with syntax highlighting, autocomplete, and error detection while maintaining tight integration with Sandpack's preview functionality.

**Key Deliverables:**
1. **Editor Selection & Installation** - Choose Monaco or CodeMirror based on bundle size and features
2. **CodeEditorPanel Component** - Render editor with file content and syntax highlighting
3. **Sandpack Integration** - Bidirectional sync between editor and Sandpack file system
4. **File Navigation** - File tree to switch between multiple prototype files
5. **Syntax Highlighting** - Support TypeScript, TSX, JavaScript, CSS, HTML
6. **Autocomplete & Linting** - IntelliSense-like features for React/TypeScript
7. **Split Layout** - Resizable editor (left) and preview (right) panels
8. **Keyboard Shortcuts** - Common editor shortcuts (Ctrl+S, Ctrl+F, etc.)

**⚠️ Critical Requirements:**
- **Performance**: Editor initialization <2s, file switching <500ms
- **Bundle Size**: Keep total bundle size increase <500 KB (prefer CodeMirror)
- **Sandpack Sync**: Debounced updates (300ms) to prevent excessive re-renders
- **Responsive**: Stack vertically on mobile, split horizontally on desktop
- **Accessibility**: Keyboard navigation, screen reader support, WCAG 2.1 AA

**🔗 Dependencies:**
- Story 4.1 (Sandpack Integration Setup) - COMPLETED ✅
- Story 4.4 (Prototype Viewer with Sandpack) - COMPLETED ✅
- Sandpack package: `@codesandbox/sandpack-react` - INSTALLED ✅
- PrototypeViewer component - EXISTS ✅

**📦 Bundle Size Considerations:**
- Current bundle size: ~400 KB (Vite + React + Sandpack)
- Monaco Editor: +2-3 MB (significant impact)
- CodeMirror 6: +300 KB (reasonable impact)
- Prettier: +200 KB (necessary for formatting)
- **Target**: Keep total increase under 1 MB (prefer CodeMirror)

**🎨 UI/UX Considerations:**
- **Layout Options:**
  1. Split view (50/50): Editor left, preview right (default)
  2. Drawer: Editor slides in from left, overlay on mobile
  3. Tabs: "Code" tab and "Preview" tab (mobile only)
- **File Navigation:**
  - File tree above editor (collapsible)
  - Or file tabs for quick switching
  - Group by directory (src/, components/, etc.)
- **Editor Appearance:**
  - Dark theme preferred (matches dev tools aesthetic)
  - Syntax highlighting with PassportCard accent colors
  - Line numbers visible by default
  - Minimap (Monaco only, optional)
- **Resizing:**
  - Draggable divider between editor and preview
  - Persist width preference in localStorage
  - Double-click divider to reset to 50/50

**🧪 Testing Strategy:**
- Unit tests: CodeEditorPanel rendering, file switching, onChange debouncing
- Unit tests: FileTree navigation and keyboard controls
- Integration tests: Editor + Sandpack synchronization
- Integration tests: PrototypeViewer with editor integrated
- Visual tests: Syntax highlighting for different file types
- Performance tests: Editor initialization time, file switching speed
- Accessibility tests: Screen reader, keyboard navigation
- Edge case tests: Large files, corrupted content, missing extensions

**🚀 Implementation Order:**
1. Research and decide: Monaco vs CodeMirror (Task 1)
2. Install chosen editor package (Task 2)
3. Create basic CodeEditorPanel component (Task 4)
4. Configure syntax highlighting (Task 5)
5. Integrate with Sandpack (Task 3)
6. Add file tree navigation (Task 9)
7. Implement autocomplete and error detection (Tasks 6-7)
8. Integrate into PrototypeViewer with split layout (Task 8)
9. Add formatting and keyboard shortcuts (Tasks 10, 14)
10. Create custom theme (Task 12)
11. Optimize performance (Task 13)
12. Add user preferences (Task 19)
13. Implement responsive layout (Task 16)
14. Add accessibility features (Task 17)
15. Comprehensive testing (Tasks 15, 20)

**💡 Edge Cases to Handle:**
- **Editor fails to initialize**: Show error message with retry button
- **File content corrupted**: Display error, allow user to reset file
- **Very large files (>10,000 lines)**: Warn user, potentially limit syntax highlighting
- **Missing file extension**: Default to JavaScript syntax
- **Sandpack compilation error**: Show in editor and console, don't crash editor
- **Multiple rapid file switches**: Debounce to prevent thrashing
- **Browser back button**: Preserve editor state (localStorage)
- **Tab/window close**: Save unsaved changes warning (optional)
- **Mobile keyboard**: Adjust layout when virtual keyboard appears

**🔍 Verification Checklist:**
- [ ] Editor chosen and package installed successfully
- [ ] CodeEditorPanel renders with file content
- [ ] Syntax highlighting works for TypeScript, JSX, CSS, HTML
- [ ] Autocomplete triggers for React hooks and components
- [ ] Error detection shows syntax errors inline
- [ ] File tree displays all prototype files
- [ ] Click file in tree → Editor updates content
- [ ] Edit code in editor → Sandpack preview updates (debounced)
- [ ] Resizable split layout works (drag divider)
- [ ] Editor preferences persist across sessions
- [ ] Keyboard shortcuts work (Ctrl+S, Ctrl+F, etc.)
- [ ] Format code button works (Prettier)
- [ ] Responsive: Stacks on mobile, splits on desktop
- [ ] Loading states during editor initialization
- [ ] Error states if editor fails to load
- [ ] Performance: Editor loads <2s, file switch <500ms
- [ ] Accessibility: Keyboard navigation, screen reader compatible
- [ ] Tests: >90% coverage achieved

### Library and Framework Requirements

**Core Dependencies (Already Installed):**
- React 19.x - Component framework
- TypeScript 5.x - Type safety
- Vite 6.x - Build tool and dev server
- @codesandbox/sandpack-react - Sandpack integration
- DaisyUI 5.x - UI components (tabs, drawer, card)
- Tailwind CSS 4.x - Styling

**Editor Package (To Be Installed - Choose One):**

**Option A: Monaco Editor**
```bash
npm install @monaco-editor/react monaco-editor
npm install --save-dev @types/monaco-editor
```
- Package: `@monaco-editor/react` (React wrapper)
- Size: ~2-3 MB minified
- Usage:
  ```typescript
  import Editor from '@monaco-editor/react';
  
  <Editor
    height="100vh"
    defaultLanguage="typescript"
    theme="vs-dark"
    value={code}
    onChange={handleChange}
    options={{
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
    }}
  />
  ```

**Option B: CodeMirror 6 (Recommended)**
```bash
npm install @codemirror/view @codemirror/state @codemirror/lang-javascript @codemirror/lang-html @codemirror/lang-css @codemirror/autocomplete @codemirror/lint
```
- Package: `@codemirror/*` (modular)
- Size: ~300 KB minified
- Usage:
  ```typescript
  import { EditorView, basicSetup } from '@codemirror/view';
  import { javascript } from '@codemirror/lang-javascript';
  
  const view = new EditorView({
    doc: code,
    extensions: [
      basicSetup,
      javascript({ jsx: true, typescript: true }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
    ],
    parent: element,
  });
  ```

**Code Formatting:**
```bash
npm install prettier
```
- Package: `prettier`
- Size: ~200 KB minified
- Used for: Format code button functionality

**Utility Libraries (Already Installed):**
- lodash.debounce or React useCallback with setTimeout for debouncing
- No additional utility libraries needed

**Testing Dependencies (Already Installed):**
- Vitest - Test runner
- @testing-library/react - Component testing
- @testing-library/user-event - User interaction testing

### File Structure Requirements

**Follow Architecture Patterns:**
- Feature-based organization: `features/prototypes/components/`
- Co-located tests: `CodeEditorPanel.test.tsx` next to component
- Type definitions: `features/prototypes/types.ts`
- Utilities: `features/prototypes/utils/` (if needed for editor helpers)

**Naming Conventions:**
- Components: PascalCase (`CodeEditorPanel`, `FileTree`)
- Functions: camelCase (`syncEditorWithSandpack`, `formatCode`)
- Types: PascalCase (`EditorState`, `EditorFile`, `FileTreeNode`)
- Props interfaces: `{ComponentName}Props` (`CodeEditorPanelProps`)
- Hooks: `use{Feature}` (`useEditorSync`, `useFileNavigation`)

**Example Component Structure:**
```typescript
// CodeEditorPanel.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useSandpack } from '@codesandbox/sandpack-react';
import Editor from '@monaco-editor/react'; // or CodeMirror
import { debounce } from 'lodash';

interface CodeEditorPanelProps {
  prototypeId: string;
  onClose?: () => void;
}

export function CodeEditorPanel({ prototypeId, onClose }: CodeEditorPanelProps) {
  // Component implementation
}
```

### Security Considerations

**Code Execution Sandboxing:**
- All code runs in Sandpack's iframe sandbox (already secure)
- User edits don't execute outside sandbox
- No direct DOM manipulation outside sandbox
- XSS protection via Sandpack's built-in security

**User Input Handling:**
- Editor content is user-generated code (no direct XSS risk in editor)
- Sandpack handles script injection via iframe sandbox
- No server-side code execution (everything client-side)
- Prototype code never sent to backend except for saving versions (Story 7.4)

**Local Storage:**
- Editor preferences stored in localStorage (font size, theme, width)
- No sensitive data stored
- Clear localStorage on logout (optional)

**Bundle Integrity:**
- Editor package loaded from npm (verified sources)
- Prettier loaded from npm (verified sources)
- No CDN dependencies for editor (all bundled with Vite)

### Performance Optimization

**Editor Initialization:**
- Lazy load editor component (only render when "View Code" clicked)
- Use React.lazy and Suspense for code splitting
- Show loading skeleton during initialization
- Target: <2 seconds from click to editor ready

**Editor Rendering:**
- Debounce onChange events (300ms)
- Use React.memo for FileTree items
- Virtualize file tree for large projects (>50 files)
- Dispose editor instance on unmount to free memory

**Sandpack Synchronization:**
- Debounce updateFile calls to prevent excessive Sandpack reloads
- Batch multiple file changes if possible
- Use requestIdleCallback for non-critical updates (future optimization)

**Bundle Size Optimization:**
- Prefer CodeMirror 6 over Monaco (10x smaller bundle)
- Tree-shake editor packages (import only needed modules)
- Lazy load Prettier (only when format button clicked)
- Code split editor from main bundle

**Memory Management:**
- Dispose editor instance on component unmount
- Clear event listeners when switching files
- Monitor memory usage with Chrome DevTools
- Verify no memory leaks during file switching

**Example Performance Optimization:**
```typescript
// Lazy load editor
const CodeEditorPanel = React.lazy(() => import('./CodeEditorPanel'));

function PrototypeViewer() {
  const [showEditor, setShowEditor] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowEditor(true)}>View Code</button>
      {showEditor && (
        <Suspense fallback={<EditorSkeleton />}>
          <CodeEditorPanel />
        </Suspense>
      )}
    </div>
  );
}

// Debounced Sandpack update
const handleEditorChange = useCallback(
  debounce((value: string) => {
    updateFile(activeFile, value);
  }, 300),
  [activeFile, updateFile]
);

// Cleanup on unmount
useEffect(() => {
  return () => {
    editorInstance?.dispose();
  };
}, [editorInstance]);
```

### TypeScript Types and Interfaces

**Editor State Types:**
```typescript
// src/features/prototypes/types.ts

export interface EditorFile {
  path: string;              // e.g., "/src/App.tsx"
  content: string;           // File content
  language: string;          // e.g., "typescript", "javascript", "css"
}

export interface FileTreeNode {
  name: string;              // File or directory name
  path: string;              // Full path
  type: 'file' | 'directory';
  children?: FileTreeNode[]; // For directories
  isOpen?: boolean;          // Expand/collapse state
}

export interface EditorConfig {
  fontSize: number;          // 10-20px
  theme: 'light' | 'dark';   // Editor theme
  wordWrap: boolean;         // Enable word wrap
  lineNumbers: boolean;      // Show line numbers
  minimap: boolean;          // Show minimap (Monaco only)
  tabSize: number;           // Tab size (2 or 4)
}

export interface EditorState {
  activeFile: string;        // Currently open file path
  files: Record<string, EditorFile>; // All files by path
  config: EditorConfig;      // User preferences
  isLoading: boolean;        // Editor initialization state
  error: Error | null;       // Editor error state
}

export interface CodeEditorPanelProps {
  prototypeId: string;
  onClose?: () => void;
  initialFile?: string;      // Optional initial file to open
}

export interface FileTreeProps {
  files: Record<string, EditorFile>;
  activeFile: string;
  onFileSelect: (path: string) => void;
  onToggleDirectory?: (path: string) => void;
}

export interface EditorSettingsProps {
  config: EditorConfig;
  onChange: (config: Partial<EditorConfig>) => void;
  onReset: () => void;
}
```

### Accessibility Considerations

**WCAG 2.1 AA Compliance:**
- **Keyboard Navigation:**
  - Tab: Focus editor, file tree, buttons
  - Arrow keys: Navigate file tree
  - Enter: Open file from file tree
  - Escape: Close editor settings, autocomplete popup
  - Ctrl+F: Find in file
  - Ctrl+Tab: Switch files
- **Screen Reader Support:**
  - ARIA label: "Code editor, TypeScript file: App.tsx"
  - Announce file switches: "Opened Button.tsx"
  - Announce errors: "Syntax error on line 15"
  - File tree: aria-label for each file/directory
- **Visual Indicators:**
  - Focus visible on all interactive elements (2px outline)
  - High contrast mode support
  - Color coding doesn't rely solely on color (use icons + text)
- **Text Alternatives:**
  - Icon buttons have aria-label (e.g., "Format code")
  - Error messages readable by screen readers

**Specific Implementations:**
```typescript
// Editor ARIA labels
<div
  role="textbox"
  aria-label={`Code editor, ${language} file: ${activeFile}`}
  aria-multiline="true"
>
  <Editor />
</div>

// File tree navigation
<ul role="tree" aria-label="File explorer">
  <li role="treeitem" aria-label="App.tsx" aria-selected={isActive}>
    <button onClick={() => selectFile('App.tsx')}>
      App.tsx
    </button>
  </li>
</ul>

// Format button
<button aria-label="Format code (Ctrl+Shift+F)" onClick={formatCode}>
  <FormatIcon />
</button>
```

**Testing Accessibility:**
- Use axe DevTools to verify no violations
- Test with NVDA (Windows) or VoiceOver (Mac)
- Verify keyboard-only navigation works
- Test with Windows High Contrast Mode
- Check color contrast with WebAIM Contrast Checker

### Browser Compatibility

**Supported Browsers (per Architecture):**
- Chrome (latest 2 versions) ✅
- Firefox (latest 2 versions) ✅
- Safari (latest 2 versions) ✅
- Edge (latest 2 versions) ✅

**Editor Feature Support:**
- Monaco: Requires Web Workers (supported in all modern browsers)
- CodeMirror 6: Pure JavaScript, no special requirements
- Both editors: Use ES6+ features (supported in target browsers)

**Responsive Breakpoints:**
- Mobile: <768px (stack editor above preview, or use tabs)
- Tablet: 768px - 1023px (split layout, smaller font size)
- Desktop: 1024px+ (split layout, full features)

**Touch Support:**
- Test on iOS Safari, Android Chrome
- Ensure scrolling works smoothly
- Test text selection on touch devices
- Virtual keyboard handling (adjust layout when keyboard appears)

### Debouncing Strategy

**Editor onChange Debouncing:**
```typescript
import { useCallback } from 'react';
import { debounce } from 'lodash';

function CodeEditorPanel() {
  const { updateFile } = useSandpack();
  
  // Debounce Sandpack updates to prevent excessive re-renders
  const debouncedUpdate = useCallback(
    debounce((file: string, content: string) => {
      updateFile(file, content);
    }, 300), // 300ms delay
    [updateFile]
  );
  
  const handleEditorChange = (value: string) => {
    // Update local state immediately (feels responsive)
    setEditorContent(value);
    // Update Sandpack after 300ms of inactivity
    debouncedUpdate(activeFile, value);
  };
  
  return <Editor value={editorContent} onChange={handleEditorChange} />;
}
```

**Why 300ms?**
- Fast enough: User sees preview update within 1/3 second
- Not too fast: Prevents excessive Sandpack recompilations
- Industry standard: VS Code uses similar debounce timing
- Battery friendly: Reduces CPU usage on mobile devices

### File Language Detection

**Language Mapping by Extension:**
```typescript
function detectLanguage(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript', // TypeScript + JSX
    'js': 'javascript',
    'jsx': 'javascript', // JavaScript + JSX
    'css': 'css',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
  };
  
  return languageMap[extension || ''] || 'javascript'; // Default to JavaScript
}
```

**Usage in Editor:**
```typescript
const language = detectLanguage(activeFile);

// Monaco
<Editor language={language} value={content} />

// CodeMirror
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';

const extensions = [
  language === 'javascript' ? javascript({ jsx: true, typescript: true }) :
  language === 'css' ? css() :
  language === 'html' ? html() :
  javascript() // Fallback
];
```

### Custom Theme Configuration

**PassportCard Editor Theme:**
```typescript
// For Monaco
const passportCardTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '#E10514' },        // PassportCard red
    { token: 'string', foreground: '#50C878' },         // Green
    { token: 'number', foreground: '#6495ED' },         // Blue
    { token: 'comment', foreground: '#888888' },        // Gray
    { token: 'type', foreground: '#FFD700' },           // Gold
  ],
  colors: {
    'editor.background': '#1E1E1E',                      // Dark background
    'editor.foreground': '#D4D4D4',                      // Light text
    'editor.lineHighlightBackground': '#2A2A2A',         // Current line
    'editorCursor.foreground': '#E10514',                // PassportCard cursor
    'editor.selectionBackground': '#E1051430',           // Selection (red with alpha)
  },
};

// Register theme
monaco.editor.defineTheme('passportcard', passportCardTheme);

// Use theme
<Editor theme="passportcard" />
```

**For CodeMirror:**
```typescript
import { EditorView } from '@codemirror/view';

const passportCardTheme = EditorView.theme({
  '&': {
    backgroundColor: '#1E1E1E',
    color: '#D4D4D4',
  },
  '.cm-content': {
    caretColor: '#E10514', // PassportCard cursor
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#E10514',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#E1051430', // Selection with alpha
  },
  '.cm-activeLine': {
    backgroundColor: '#2A2A2A', // Current line highlight
  },
  '.cm-gutters': {
    backgroundColor: '#1E1E1E',
    color: '#888888',
  },
}, { dark: true });
```

### Keyboard Shortcuts Reference

**Essential Shortcuts to Implement:**
| Shortcut | Action | Windows/Linux | Mac |
|----------|--------|---------------|-----|
| Save | Save file version | Ctrl+S | Cmd+S |
| Find | Find in file | Ctrl+F | Cmd+F |
| Format | Format code | Ctrl+Shift+F | Cmd+Shift+F |
| Comment | Toggle line comment | Ctrl+/ | Cmd+/ |
| Next File | Switch to next file | Ctrl+Tab | Cmd+Tab |
| Prev File | Switch to previous file | Ctrl+Shift+Tab | Cmd+Shift+Tab |
| Close Editor | Close editor panel | Escape | Escape |
| Undo | Undo last change | Ctrl+Z | Cmd+Z |
| Redo | Redo last change | Ctrl+Y or Ctrl+Shift+Z | Cmd+Shift+Z |

**Implementation Example:**
```typescript
function CodeEditorPanel() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (modKey && e.key === 's') {
        e.preventDefault();
        handleSaveVersion();
      } else if (modKey && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        handleFormatCode();
      } else if (modKey && e.key === '/') {
        e.preventDefault();
        handleToggleComment();
      }
      // Add more shortcuts...
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

### localStorage Persistence Strategy

**Editor Preferences to Persist:**
```typescript
interface EditorPreferences {
  fontSize: number;
  theme: 'light' | 'dark';
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  editorWidth: number; // Percentage of screen width
}

const STORAGE_KEY = 'ideaspark_editor_preferences';

function saveEditorPreferences(prefs: EditorPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function loadEditorPreferences(): EditorPreferences {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse editor preferences', e);
    }
  }
  return getDefaultPreferences();
}

function getDefaultPreferences(): EditorPreferences {
  return {
    fontSize: 14,
    theme: 'dark',
    wordWrap: false,
    lineNumbers: true,
    minimap: false,
    editorWidth: 50, // 50% of screen
  };
}
```

**Usage in Component:**
```typescript
function CodeEditorPanel() {
  const [config, setConfig] = useState<EditorConfig>(() => loadEditorPreferences());
  
  useEffect(() => {
    saveEditorPreferences(config);
  }, [config]);
  
  return <Editor fontSize={config.fontSize} theme={config.theme} />;
}
```

### Responsive Layout Implementation

**Desktop Layout (≥1024px):**
```tsx
<div className="flex h-screen">
  {/* File tree */}
  <div className="w-64 border-r">
    <FileTree />
  </div>
  
  {/* Editor */}
  <div className="flex-1 flex">
    <div className="w-1/2 border-r">
      <CodeEditorPanel />
    </div>
    
    {/* Preview */}
    <div className="w-1/2">
      <SandpackPreview />
    </div>
  </div>
</div>
```

**Tablet Layout (768px - 1023px):**
```tsx
<div className="flex flex-col h-screen">
  {/* Collapsible file tree */}
  <div className="drawer drawer-start">
    <FileTree />
  </div>
  
  {/* Split editor/preview */}
  <div className="flex flex-1">
    <div className="w-1/2">
      <CodeEditorPanel fontSize={12} />
    </div>
    <div className="w-1/2">
      <SandpackPreview />
    </div>
  </div>
</div>
```

**Mobile Layout (<768px):**
```tsx
<div className="h-screen">
  {/* Tabs for Code/Preview */}
  <div className="tabs tabs-boxed">
    <a className={`tab ${view === 'preview' ? 'tab-active' : ''}`} onClick={() => setView('preview')}>
      Preview
    </a>
    <a className={`tab ${view === 'code' ? 'tab-active' : ''}`} onClick={() => setView('code')}>
      Code
    </a>
  </div>
  
  {/* Content */}
  <div className="flex-1">
    {view === 'preview' ? (
      <SandpackPreview />
    ) : (
      <>
        <FileTree />
        <CodeEditorPanel fontSize={12} />
      </>
    )}
  </div>
</div>
```

### References

**Source Documents:**
- [PRD: FR55 - View Generated Code with Syntax Highlighting](file:///_bmad-output/planning-artifacts/prd.md#full-featured-prototype-system)
- [PRD: FR56 - Edit Code in Real-Time](file:///_bmad-output/planning-artifacts/prd.md#full-featured-prototype-system)
- [Epic 7: Prototype Code Editor & Live Editing](file:///_bmad-output/planning-artifacts/epics.md#epic-7-prototype-code-editor--live-editing)
- [Story 7.1: Code Editor Integration](file:///_bmad-output/planning-artifacts/epics.md#story-71-code-editor-integration-monaco-or-codemirror)
- [Architecture: Prototype Feature Structure](file:///_bmad-output/planning-artifacts/architecture.md#project-structure--boundaries)
- [Architecture: Frontend Patterns](file:///_bmad-output/planning-artifacts/architecture.md#frontend-architecture)

**Related Stories:**
- [Story 4.1: Sandpack Integration Setup](_bmad-output/implementation-artifacts/4-1-sandpack-integration-setup.md)
- [Story 4.4: Prototype Viewer with Sandpack](_bmad-output/implementation-artifacts/4-4-prototype-viewer-with-sandpack.md)
- [Story 4.5: Prototype Refinement Chat Interface](_bmad-output/implementation-artifacts/4-5-prototype-refinement-chat-interface.md)

**Technical Documentation:**
- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)
- [@monaco-editor/react Documentation](https://github.com/suren-atoyan/monaco-react)
- [CodeMirror 6 Documentation](https://codemirror.net/docs/)
- [Sandpack Documentation](https://sandpack.codesandbox.io/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [DaisyUI Tabs Component](https://daisyui.com/components/tab/)
- [DaisyUI Drawer Component](https://daisyui.com/components/drawer/)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (via Cursor)

### Debug Log References

### Completion Notes List

- **Task 1 Decision:** Selected **CodeMirror 6** over Monaco Editor. Rationale: 10x smaller bundle (~300KB vs 2-3MB), native Vite 7.x compatibility (no Web Workers config), faster initialization (<1s vs 2-3s), sufficient feature set for prototype editing (syntax highlighting, autocomplete, linting via modular packages). Monaco's IntelliSense advantage doesn't justify the 500-700% bundle size increase for an MVP prototype editor.
- **Architecture Note:** Sandpack (`@codesandbox/sandpack-react`) is NOT installed despite story assumptions. Adapted Sandpack integration tasks (Task 3) to work with the prototype's `code: string` field directly using local file state management (`useEditorSync` hook). Existing iframe preview via `PrototypeFrame` retained alongside the code editor.
- **Task 2 Complete:** Installed 13 CodeMirror 6 packages + Prettier. 23 packages added, 0 vulnerabilities, TypeScript compilation clean, Vite build passes.
- **Tasks 3-20 Complete:** Full implementation of code editor integration:
  - **Components Created:** CodeEditorPanel, CodeMirrorEditor, FileTree, EditorSettings, EditorToolbar
  - **Hooks Created:** useEditorSync (replaces Sandpack hooks for local file management)
  - **Utilities Created:** editorHelpers.ts (localStorage persistence, Prettier formatting)
  - **Types Added:** EditorFile, EditorConfig, EditorState, FileTreeNode, CodeEditorPanelProps, FileTreeProps, EditorSettingsProps + utility functions (detectLanguage, parsePrototypeCode, buildFileTree)
  - **Custom Theme:** PassportCard dark/light themes with #E10514 red accents for keywords, cursor, selections
  - **Code Splitting:** CodeMirror editor lazy-loaded (553KB/190KB gzip separate chunk), Prettier plugins lazy-loaded on format action
  - **Integration:** PrototypeViewerPage updated with split layout (editor left, preview right), resize handle, "View Code"/"Hide Code" toggle
  - **Responsive:** Mobile tab switcher (Code/Preview), desktop side-by-side with drag resize
  - **Accessibility:** ARIA tree roles, keyboard navigation, labeled elements, high contrast
  - **Testing:** 81 tests across 6 test files, all passing. Zero regressions in existing test suite.
  - **Build Verification:** TypeScript compilation clean (tsc --noEmit), Vite build succeeds

### File List

**Files Modified:**
- `src/features/prototypes/types.ts` - Added editor types, interfaces, utility functions
- `src/features/prototypes/components/index.ts` - Added exports for new components
- `src/pages/PrototypeViewerPage.tsx` - Added code editor split layout integration
- `package.json` - Added CodeMirror 6 + Prettier dependencies

**Files Created:**
- `src/features/prototypes/components/CodeEditorPanel.tsx` - Main code editor panel component
- `src/features/prototypes/components/CodeEditorPanel.test.tsx` - 17 tests
- `src/features/prototypes/components/CodeMirrorEditor.tsx` - CodeMirror 6 React wrapper with PassportCard themes
- `src/features/prototypes/components/FileTree.tsx` - File tree navigation component
- `src/features/prototypes/components/FileTree.test.tsx` - 11 tests
- `src/features/prototypes/components/EditorSettings.tsx` - Editor preferences dropdown
- `src/features/prototypes/components/EditorSettings.test.tsx` - 9 tests
- `src/features/prototypes/components/EditorToolbar.tsx` - Editor toolbar with format, shortcuts, settings
- `src/features/prototypes/hooks/useEditorSync.ts` - Editor state management hook
- `src/features/prototypes/hooks/useEditorSync.test.tsx` - 12 tests
- `src/features/prototypes/utils/editorHelpers.ts` - localStorage persistence + Prettier formatting
- `src/features/prototypes/utils/editorHelpers.test.ts` - 9 tests
- `src/features/prototypes/types.test.ts` - 23 tests for type utilities
