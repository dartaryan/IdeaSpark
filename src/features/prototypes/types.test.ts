// src/features/prototypes/types.test.ts
// Unit tests for editor types and utility functions (Story 7.1)

import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  parsePrototypeCode,
  buildFileTree,
  DEFAULT_EDITOR_CONFIG,
} from './types';

describe('detectLanguage', () => {
  it('should detect TypeScript from .ts extension', () => {
    expect(detectLanguage('/src/App.ts')).toBe('typescript');
  });

  it('should detect TypeScript from .tsx extension', () => {
    expect(detectLanguage('/src/App.tsx')).toBe('typescript');
  });

  it('should detect JavaScript from .js extension', () => {
    expect(detectLanguage('/src/index.js')).toBe('javascript');
  });

  it('should detect JavaScript from .jsx extension', () => {
    expect(detectLanguage('/src/Component.jsx')).toBe('javascript');
  });

  it('should detect CSS from .css extension', () => {
    expect(detectLanguage('/src/styles.css')).toBe('css');
  });

  it('should detect HTML from .html extension', () => {
    expect(detectLanguage('/index.html')).toBe('html');
  });

  it('should detect JSON from .json extension', () => {
    expect(detectLanguage('/package.json')).toBe('json');
  });

  it('should detect Markdown from .md extension', () => {
    expect(detectLanguage('/README.md')).toBe('markdown');
  });

  it('should default to javascript for unknown extensions', () => {
    expect(detectLanguage('/src/file.xyz')).toBe('javascript');
  });

  it('should default to javascript for files without extensions', () => {
    expect(detectLanguage('/Dockerfile')).toBe('javascript');
  });
});

describe('parsePrototypeCode', () => {
  it('should return empty object for null code', () => {
    expect(parsePrototypeCode(null)).toEqual({});
  });

  it('should return empty object for empty string', () => {
    expect(parsePrototypeCode('')).toEqual({});
  });

  it('should parse JSON multi-file format', () => {
    const code = JSON.stringify({
      '/src/App.tsx': 'export default function App() { return <div>Hello</div>; }',
      '/src/styles.css': 'body { margin: 0; }',
    });

    const result = parsePrototypeCode(code);

    expect(Object.keys(result)).toHaveLength(2);
    expect(result['/src/App.tsx']).toEqual({
      path: '/src/App.tsx',
      content: 'export default function App() { return <div>Hello</div>; }',
      language: 'typescript',
    });
    expect(result['/src/styles.css']).toEqual({
      path: '/src/styles.css',
      content: 'body { margin: 0; }',
      language: 'css',
    });
  });

  it('should fallback to single file for plain text code', () => {
    const code = 'export default function App() { return <div>Hello</div>; }';

    const result = parsePrototypeCode(code);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result['/App.tsx']).toEqual({
      path: '/App.tsx',
      content: code,
      language: 'typescript',
    });
  });

  it('should handle JSON with non-string values gracefully', () => {
    const code = JSON.stringify({
      '/src/App.tsx': 'valid content',
      '/src/config': 42,
    });

    const result = parsePrototypeCode(code);

    // Only string values should be included
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['/src/App.tsx']).toBeDefined();
  });

  it('should handle JSON array as single file fallback', () => {
    const code = JSON.stringify([1, 2, 3]);

    const result = parsePrototypeCode(code);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result['/App.tsx']).toBeDefined();
  });

  it('should handle empty JSON object by falling back to single file', () => {
    const code = JSON.stringify({});

    // Empty object -> no string entries -> fallback to single file
    const result = parsePrototypeCode(code);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result['/App.tsx']).toBeDefined();
    expect(result['/App.tsx'].content).toBe('{}');
  });
});

describe('buildFileTree', () => {
  it('should return empty array for empty files', () => {
    expect(buildFileTree({})).toEqual([]);
  });

  it('should build flat file list for root-level files', () => {
    const files = {
      '/App.tsx': { path: '/App.tsx', content: '', language: 'typescript' },
      '/index.ts': { path: '/index.ts', content: '', language: 'typescript' },
    };

    const tree = buildFileTree(files);

    expect(tree).toHaveLength(2);
    expect(tree[0].name).toBe('App.tsx');
    expect(tree[0].type).toBe('file');
    expect(tree[1].name).toBe('index.ts');
    expect(tree[1].type).toBe('file');
  });

  it('should create directory nodes for nested files', () => {
    const files = {
      '/src/App.tsx': { path: '/src/App.tsx', content: '', language: 'typescript' },
      '/src/components/Button.tsx': { path: '/src/components/Button.tsx', content: '', language: 'typescript' },
    };

    const tree = buildFileTree(files);

    expect(tree).toHaveLength(1); // /src directory
    expect(tree[0].name).toBe('src');
    expect(tree[0].type).toBe('directory');
    expect(tree[0].children).toHaveLength(2); // App.tsx + components/
  });

  it('should sort files alphabetically', () => {
    const files = {
      '/zebra.ts': { path: '/zebra.ts', content: '', language: 'typescript' },
      '/alpha.ts': { path: '/alpha.ts', content: '', language: 'typescript' },
    };

    const tree = buildFileTree(files);

    expect(tree[0].name).toBe('alpha.ts');
    expect(tree[1].name).toBe('zebra.ts');
  });

  it('should handle deeply nested directories', () => {
    const files = {
      '/src/features/prototypes/components/CodeEditorPanel.tsx': {
        path: '/src/features/prototypes/components/CodeEditorPanel.tsx',
        content: '',
        language: 'typescript',
      },
    };

    const tree = buildFileTree(files);

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe('src');
    const features = tree[0].children![0];
    expect(features.name).toBe('features');
    const prototypes = features.children![0];
    expect(prototypes.name).toBe('prototypes');
    const components = prototypes.children![0];
    expect(components.name).toBe('components');
    const file = components.children![0];
    expect(file.name).toBe('CodeEditorPanel.tsx');
    expect(file.type).toBe('file');
  });
});

describe('DEFAULT_EDITOR_CONFIG', () => {
  it('should have sensible defaults', () => {
    expect(DEFAULT_EDITOR_CONFIG.fontSize).toBe(14);
    expect(DEFAULT_EDITOR_CONFIG.theme).toBe('dark');
    expect(DEFAULT_EDITOR_CONFIG.wordWrap).toBe(false);
    expect(DEFAULT_EDITOR_CONFIG.lineNumbers).toBe(true);
    expect(DEFAULT_EDITOR_CONFIG.tabSize).toBe(2);
  });
});
