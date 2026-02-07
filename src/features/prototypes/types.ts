// src/features/prototypes/types.ts

export type PrototypeStatus = 'generating' | 'ready' | 'failed';

export interface Prototype {
  id: string;
  prdId: string;
  ideaId: string;
  userId: string;
  url: string | null;
  code: string | null;
  version: number;
  refinementPrompt: string | null;
  status: PrototypeStatus;
  createdAt: string;
  updatedAt: string;
  // Sharing fields
  shareId: string;
  isPublic: boolean;
  sharedAt: string | null;
  viewCount: number;
  // Epic 9 sharing enhancements
  passwordHash: string | null;
  expiresAt: string | null;
  shareRevoked: boolean;
}

// Database row format (snake_case)
export interface PrototypeRow {
  id: string;
  prd_id: string;
  idea_id: string;
  user_id: string;
  url: string | null;
  code: string | null;
  version: number;
  refinement_prompt: string | null;
  status: PrototypeStatus;
  created_at: string;
  updated_at: string;
  // Sharing fields
  share_id: string;
  is_public: boolean;
  shared_at: string | null;
  view_count: number;
  // Epic 9 sharing enhancements
  password_hash: string | null;
  expires_at: string | null;
  share_revoked: boolean;
}

export interface CreatePrototypeInput {
  prdId: string;
  ideaId: string;
  url?: string;
  code?: string;
  status?: PrototypeStatus;
}

export interface CreateVersionInput {
  prdId: string;
  ideaId: string;
  refinementPrompt: string;
  url?: string;
  code?: string;
}

export interface UpdatePrototypeInput {
  url?: string;
  code?: string;
  status?: PrototypeStatus;
}

// Public prototype type (subset of fields exposed publicly)
export interface PublicPrototype {
  id: string;
  url: string | null;
  version: number;
  status: PrototypeStatus;
  createdAt: string;
  shareId: string;
  /** Whether the prototype is password-protected (derived from password_hash !== null) */
  hasPassword: boolean;
}

// =============================================
// Code Editor Types (Story 7.1)
// =============================================

/** Represents a single file in the code editor */
export interface EditorFile {
  path: string;       // e.g., "/src/App.tsx"
  content: string;    // File content
  language: string;   // e.g., "typescript", "javascript", "css"
}

/** Represents a node in the file tree */
export interface FileTreeNode {
  name: string;              // File or directory name
  path: string;              // Full path
  type: 'file' | 'directory';
  children?: FileTreeNode[]; // For directories
  isOpen?: boolean;          // Expand/collapse state
}

/** User-configurable editor settings */
export interface EditorConfig {
  fontSize: number;          // 10-20px
  theme: 'light' | 'dark';  // Editor theme
  wordWrap: boolean;         // Enable word wrap
  lineNumbers: boolean;      // Show line numbers
  tabSize: number;           // Tab size (2 or 4)
}

/** Current state of the code editor */
export interface EditorState {
  activeFile: string;                    // Currently open file path
  files: Record<string, EditorFile>;     // All files by path
  config: EditorConfig;                  // User preferences
  isLoading: boolean;                    // Editor initialization state
  error: Error | null;                   // Editor error state
}

/** Props for the CodeEditorPanel component */
export interface CodeEditorPanelProps {
  code: string | null;       // Raw prototype code (JSON string or single file)
  onCodeChange?: (path: string, content: string) => void;
  onClose?: () => void;
  initialFile?: string;      // Optional initial file to open
  readOnly?: boolean;        // When true, editor is view-only (auto-detected when onCodeChange is absent)
  hasCompilationError?: boolean; // Show compilation error indicator from Sandpack
  /** Callback to trigger Save Version flow (only shown in edit mode) */
  onSaveVersion?: () => void;
  /** Whether a version save is in progress */
  isSavingVersion?: boolean;
}

/** Props for the FileTree component */
export interface FileTreeProps {
  files: Record<string, EditorFile>;
  activeFile: string;
  onFileSelect: (path: string) => void;
}

/** Props for the EditorSettings component */
export interface EditorSettingsProps {
  config: EditorConfig;
  onChange: (config: Partial<EditorConfig>) => void;
  onReset: () => void;
}

/** Default editor configuration */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  fontSize: 14,
  theme: 'dark',
  wordWrap: false,
  lineNumbers: true,
  tabSize: 2,
};

/** localStorage key for editor preferences */
export const EDITOR_STORAGE_KEY = 'ideaspark_editor_preferences';

/**
 * Detect language from file path extension
 */
export function detectLanguage(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'css': 'css',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
  };

  return languageMap[extension || ''] || 'javascript';
}

/**
 * Parse prototype code string into editor files.
 * Handles both JSON object format (multi-file) and plain string (single file).
 */
export function parsePrototypeCode(code: string | null): Record<string, EditorFile> {
  if (!code) return {};

  // Try parsing as JSON (multi-file format: { "/path": "content", ... })
  try {
    const parsed = JSON.parse(code);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const files: Record<string, EditorFile> = {};
      for (const [path, content] of Object.entries(parsed)) {
        if (typeof content === 'string') {
          files[path] = {
            path,
            content,
            language: detectLanguage(path),
          };
        }
      }
      if (Object.keys(files).length > 0) {
        return files;
      }
    }
  } catch {
    // Not JSON, treat as single file
  }

  // Fallback: single file
  return {
    '/App.tsx': {
      path: '/App.tsx',
      content: code,
      language: 'typescript',
    },
  };
}

/**
 * Build a file tree structure from flat file paths.
 */
export function buildFileTree(files: Record<string, EditorFile>): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const dirMap = new Map<string, FileTreeNode>();

  const sortedPaths = Object.keys(files).sort();

  for (const filePath of sortedPaths) {
    const parts = filePath.split('/').filter(Boolean);
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;

      if (i === parts.length - 1) {
        // File node
        const fileNode: FileTreeNode = {
          name: part,
          path: filePath,
          type: 'file',
        };

        if (parentPath && dirMap.has(parentPath)) {
          dirMap.get(parentPath)!.children!.push(fileNode);
        } else {
          root.push(fileNode);
        }
      } else {
        // Directory node
        if (!dirMap.has(currentPath)) {
          const dirNode: FileTreeNode = {
            name: part,
            path: currentPath,
            type: 'directory',
            children: [],
            isOpen: true,
          };
          dirMap.set(currentPath, dirNode);

          if (parentPath && dirMap.has(parentPath)) {
            dirMap.get(parentPath)!.children!.push(dirNode);
          } else {
            root.push(dirNode);
          }
        }
      }
    }
  }

  return root;
}

/**
 * Serialize editor files back to JSON string format for database storage.
 * Inverse of parsePrototypeCode: files → JSON string.
 */
export function serializeFiles(files: Record<string, EditorFile>): string {
  const serialized: Record<string, string> = {};
  for (const [path, file] of Object.entries(files)) {
    serialized[path] = file.content;
  }
  return JSON.stringify(serialized);
}

// Helper to convert DB row to app format
export function mapPrototypeRow(row: PrototypeRow): Prototype {
  return {
    id: row.id,
    prdId: row.prd_id,
    ideaId: row.idea_id,
    userId: row.user_id,
    url: row.url,
    code: row.code,
    version: row.version,
    refinementPrompt: row.refinement_prompt,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shareId: row.share_id,
    isPublic: row.is_public,
    sharedAt: row.shared_at,
    viewCount: row.view_count,
    passwordHash: row.password_hash ?? null,
    expiresAt: row.expires_at ?? null,
    shareRevoked: row.share_revoked ?? false,
  };
}
