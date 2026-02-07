// src/features/prototypes/components/PublicSandpackPreview.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PublicSandpackPreview } from './PublicSandpackPreview';

// Mock Sandpack components — Sandpack uses iframes internally and can't run in JSDOM
// Capture configuration props for verification
vi.mock('@codesandbox/sandpack-react', () => ({
  SandpackProvider: ({
    children,
    files,
    template,
    customSetup,
    options,
  }: {
    children: React.ReactNode;
    files: Record<string, { code: string }>;
    template?: string;
    customSetup?: { dependencies?: Record<string, string> };
    options?: Record<string, unknown>;
  }) => (
    <div
      data-testid="sandpack-provider"
      data-files={JSON.stringify(Object.keys(files))}
      data-template={template}
      data-dependencies={JSON.stringify(customSetup?.dependencies || {})}
      data-options={JSON.stringify(options || {})}
    >
      {children}
    </div>
  ),
  SandpackPreview: () => <div data-testid="sandpack-preview">Preview</div>,
}));

describe('PublicSandpackPreview', () => {
  const multiFileCode = JSON.stringify({
    '/App.tsx': 'export default function App() { return <div>Hello</div>; }',
    '/index.tsx': 'import App from "./App"; ReactDOM.render(<App />, document.getElementById("root"));',
  });

  const singleFileCode = 'export default function App() { return <div>Single</div>; }';

  it('renders Sandpack with valid multi-file code', () => {
    render(<PublicSandpackPreview code={multiFileCode} />);

    expect(screen.getByTestId('public-sandpack-preview')).toBeInTheDocument();
    expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();
    expect(screen.getByTestId('sandpack-preview')).toBeInTheDocument();
  });

  it('renders Sandpack with single-file code (non-JSON)', () => {
    render(<PublicSandpackPreview code={singleFileCode} />);

    expect(screen.getByTestId('public-sandpack-preview')).toBeInTheDocument();
    expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();

    // Single-file code should be parsed into /App.tsx
    const provider = screen.getByTestId('sandpack-provider');
    const files = JSON.parse(provider.getAttribute('data-files') || '[]');
    expect(files).toContain('/App.tsx');
  });

  it('shows "No code available" for empty string code', () => {
    render(<PublicSandpackPreview code="" />);

    expect(screen.getByTestId('public-sandpack-no-files')).toBeInTheDocument();
    expect(screen.getByText('No code available for preview')).toBeInTheDocument();
    expect(screen.queryByTestId('sandpack-provider')).not.toBeInTheDocument();
  });

  it('renders data-testid="public-sandpack-preview" container', () => {
    render(<PublicSandpackPreview code={multiFileCode} />);

    expect(screen.getByTestId('public-sandpack-preview')).toBeInTheDocument();
  });

  it('applies PassportCard brand border', () => {
    render(<PublicSandpackPreview code={multiFileCode} />);

    const container = screen.getByTestId('public-sandpack-preview');
    expect(container.className).toContain('border-[#E10514]/20');
  });

  it('applies optional className prop', () => {
    render(<PublicSandpackPreview code={multiFileCode} className="custom-class" />);

    const container = screen.getByTestId('public-sandpack-preview');
    expect(container.className).toContain('custom-class');
  });

  it('does NOT inject state capture (no prototypeId prop exists)', () => {
    // PublicSandpackPreview should not have any state capture injection
    // This is verified by the component API — no prototypeId or stateCaptureEnabled props
    render(<PublicSandpackPreview code={multiFileCode} />);

    expect(screen.getByTestId('public-sandpack-preview')).toBeInTheDocument();
    // No state capture injector should be present
    expect(screen.queryByTestId('state-capture-injector')).not.toBeInTheDocument();
  });

  it('parses multi-file JSON code into correct Sandpack files', () => {
    render(<PublicSandpackPreview code={multiFileCode} />);

    const provider = screen.getByTestId('sandpack-provider');
    const files = JSON.parse(provider.getAttribute('data-files') || '[]');
    expect(files).toContain('/App.tsx');
    expect(files).toContain('/index.tsx');
    expect(files).toHaveLength(2);
  });

  it('configures SandpackProvider with correct template, dependencies, and options', () => {
    render(<PublicSandpackPreview code={multiFileCode} />);

    const provider = screen.getByTestId('sandpack-provider');

    // Verify template
    expect(provider.getAttribute('data-template')).toBe('react-ts');

    // Verify react-router-dom dependency (required for multi-page prototypes)
    const dependencies = JSON.parse(provider.getAttribute('data-dependencies') || '{}');
    expect(dependencies['react-router-dom']).toBe('^6.28.0');

    // Verify autorun and autoReload options
    const options = JSON.parse(provider.getAttribute('data-options') || '{}');
    expect(options.autorun).toBe(true);
    expect(options.autoReload).toBe(true);
  });
});
