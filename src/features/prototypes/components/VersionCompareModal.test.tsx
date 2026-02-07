// src/features/prototypes/components/VersionCompareModal.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VersionCompareModal } from './VersionCompareModal';
import type { Prototype } from '../types';

// Mock react-diff-viewer-continued
vi.mock('react-diff-viewer-continued', () => ({
  default: ({ oldValue, newValue, splitView, leftTitle, rightTitle }: {
    oldValue: string;
    newValue: string;
    splitView: boolean;
    leftTitle: string;
    rightTitle: string;
  }) => (
    <div data-testid="mock-diff-viewer">
      <span data-testid="diff-old-value">{oldValue}</span>
      <span data-testid="diff-new-value">{newValue}</span>
      <span data-testid="diff-split-view">{splitView ? 'split' : 'unified'}</span>
      <span data-testid="diff-left-title">{leftTitle}</span>
      <span data-testid="diff-right-title">{rightTitle}</span>
    </div>
  ),
}));

const multiFileCodeV1 = JSON.stringify({
  '/App.tsx': 'import React from "react";\nexport default function App() { return <div>Hello</div>; }',
  '/styles.css': 'body { margin: 0; }',
});

const multiFileCodeV2 = JSON.stringify({
  '/App.tsx': 'import React from "react";\nexport default function App() { return <div>Hello World</div>; }',
  '/styles.css': 'body { margin: 0; padding: 0; }',
  '/utils.ts': 'export const helper = () => "test";',
});

const multiFileCodeV3 = JSON.stringify({
  '/App.tsx': 'import React from "react";\nexport default function App() { return <div>Hello World v3</div>; }',
  '/styles.css': 'body { margin: 0; padding: 0; }',
  '/utils.ts': 'export const helper = () => "test";',
});

function createMockVersions(): Prototype[] {
  return [
    {
      id: 'proto-3',
      prdId: 'prd-123',
      ideaId: 'idea-456',
      userId: 'user-789',
      url: 'https://example.com/v3',
      code: multiFileCodeV3,
      version: 3,
      refinementPrompt: 'Updated heading',
      status: 'ready',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      shareId: 'share-3',
      isPublic: false,
      sharedAt: null,
      viewCount: 0,
    },
    {
      id: 'proto-2',
      prdId: 'prd-123',
      ideaId: 'idea-456',
      userId: 'user-789',
      url: 'https://example.com/v2',
      code: multiFileCodeV2,
      version: 2,
      refinementPrompt: 'Add utils',
      status: 'ready',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      shareId: 'share-2',
      isPublic: false,
      sharedAt: null,
      viewCount: 0,
    },
    {
      id: 'proto-1',
      prdId: 'prd-123',
      ideaId: 'idea-456',
      userId: 'user-789',
      url: 'https://example.com/v1',
      code: multiFileCodeV1,
      version: 1,
      refinementPrompt: null,
      status: 'ready',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      shareId: 'share-1',
      isPublic: false,
      sharedAt: null,
      viewCount: 0,
    },
  ];
}

describe('VersionCompareModal', () => {
  const mockOnClose = vi.fn();
  let versions: Prototype[];

  beforeEach(() => {
    vi.clearAllMocks();
    versions = createMockVersions();
  });

  it('does not render when isOpen is false', () => {
    render(
      <VersionCompareModal
        isOpen={false}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    expect(screen.queryByTestId('version-compare-modal')).not.toBeInTheDocument();
  });

  it('renders modal with title when isOpen is true', () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    expect(screen.getByTestId('version-compare-modal')).toBeInTheDocument();
    expect(screen.getByText('Compare Versions')).toBeInTheDocument();
  });

  it('renders version selector dropdowns', () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    expect(screen.getByTestId('version-a-select')).toBeInTheDocument();
    expect(screen.getByTestId('version-b-select')).toBeInTheDocument();
  });

  it('defaults to previous version (A) vs latest version (B)', () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    const selectA = screen.getByTestId('version-a-select') as HTMLSelectElement;
    const selectB = screen.getByTestId('version-b-select') as HTMLSelectElement;

    // versions[1] = proto-2 (v2) as Version A, versions[0] = proto-3 (v3) as Version B
    expect(selectA.value).toBe('proto-2');
    expect(selectB.value).toBe('proto-3');
  });

  it('uses initialVersionA and initialVersionB when provided', () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
        initialVersionA="proto-1"
        initialVersionB="proto-3"
      />,
    );

    const selectA = screen.getByTestId('version-a-select') as HTMLSelectElement;
    const selectB = screen.getByTestId('version-b-select') as HTMLSelectElement;

    expect(selectA.value).toBe('proto-1');
    expect(selectB.value).toBe('proto-3');
  });

  it('renders split/unified toggle buttons', () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    expect(screen.getByTestId('split-view-btn')).toBeInTheDocument();
    expect(screen.getByTestId('unified-view-btn')).toBeInTheDocument();
  });

  it('shows changed files in file selector', () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    // Between v2 and v3, only /App.tsx should have changes
    const fileSelector = screen.getByTestId('file-selector');
    expect(fileSelector).toBeInTheDocument();
    expect(within(fileSelector).getByText('App.tsx')).toBeInTheDocument();
  });

  it('displays diff viewer for selected file', async () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-diff-viewer')).toBeInTheDocument();
    });
  });

  it('shows diff content area', () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    expect(screen.getByTestId('diff-content')).toBeInTheDocument();
  });

  it('toggles between split and unified view', async () => {
    const user = userEvent.setup();

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    // Wait for diff viewer to render
    await waitFor(() => {
      expect(screen.getByTestId('diff-split-view')).toBeInTheDocument();
    });

    // Default is split view
    expect(screen.getByTestId('diff-split-view').textContent).toBe('split');

    // Click unified view button
    await user.click(screen.getByTestId('unified-view-btn'));

    expect(screen.getByTestId('diff-split-view').textContent).toBe('unified');

    // Click split view button
    await user.click(screen.getByTestId('split-view-btn'));

    expect(screen.getByTestId('diff-split-view').textContent).toBe('split');
  });

  it('changes version selection when dropdown changes', async () => {
    const user = userEvent.setup();

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    const selectA = screen.getByTestId('version-a-select');
    await user.selectOptions(selectA, 'proto-1');

    expect((selectA as HTMLSelectElement).value).toBe('proto-1');
  });

  it('shows "No differences" message when same versions have identical code', async () => {
    const user = userEvent.setup();

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    // Select same version for A (already proto-2 by default), change B to proto-2
    const selectA = screen.getByTestId('version-a-select');
    const selectB = screen.getByTestId('version-b-select');
    await user.selectOptions(selectA, 'proto-1');
    await user.selectOptions(selectB, 'proto-1');

    expect(screen.getByTestId('same-version-message')).toBeInTheDocument();
    expect(screen.getByText('Select two different versions to compare.')).toBeInTheDocument();
  });

  it('handles versions with null code', () => {
    const versionsWithNullCode = [
      { ...versions[0], code: null },
      { ...versions[1], code: null },
    ];

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versionsWithNullCode}
      />,
    );

    expect(screen.getByTestId('no-code-message')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    await user.click(screen.getByTestId('close-compare-modal'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal when footer close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    await user.click(screen.getByTestId('close-compare-footer'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal on Escape key', async () => {
    const user = userEvent.setup();

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows file change indicators (added, modified, removed)', async () => {
    const user = userEvent.setup();

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
        initialVersionA="proto-1"
        initialVersionB="proto-2"
      />,
    );

    // Between v1 and v2:
    // /App.tsx - modified (content changed)
    // /styles.css - modified (content changed)
    // /utils.ts - added (new file in v2)
    const fileSelector = screen.getByTestId('file-selector');
    expect(within(fileSelector).getByText('App.tsx')).toBeInTheDocument();
    expect(within(fileSelector).getByText('styles.css')).toBeInTheDocument();
    expect(within(fileSelector).getByText('utils.ts')).toBeInTheDocument();
  });

  it('switches between files in diff view when clicking file tabs', async () => {
    const user = userEvent.setup();

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
        initialVersionA="proto-1"
        initialVersionB="proto-2"
      />,
    );

    // Wait for diff viewer to render with initial file
    await waitFor(() => {
      expect(screen.getByTestId('mock-diff-viewer')).toBeInTheDocument();
    });

    // Click on utils.ts tab
    const fileSelector = screen.getByTestId('file-selector');
    await user.click(within(fileSelector).getByText('utils.ts'));

    // The diff viewer should now show utils.ts content
    await waitFor(() => {
      const diffViewer = screen.getByTestId('mock-diff-viewer');
      // Old value should be empty (file doesn't exist in v1)
      expect(within(diffViewer).getByTestId('diff-old-value').textContent).toBe('');
      // New value should have utils.ts content
      expect(within(diffViewer).getByTestId('diff-new-value').textContent).toBe(
        'export const helper = () => "test";',
      );
    });
  });

  it('shows "No differences" for versions with identical code', async () => {
    const user = userEvent.setup();
    // v2 and v3 have the same styles.css and utils.ts, only App.tsx differs
    // Create two versions with identical code
    const identicalVersions: Prototype[] = [
      {
        ...versions[0],
        id: 'v-b',
        code: multiFileCodeV2,
        version: 2,
      },
      {
        ...versions[1],
        id: 'v-a',
        code: multiFileCodeV2,
        version: 1,
      },
    ];

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={identicalVersions}
      />,
    );

    expect(screen.getByTestId('no-diff-message')).toBeInTheDocument();
  });

  it('handles single-file prototypes (non-JSON code)', () => {
    const singleFileVersions: Prototype[] = [
      {
        ...versions[0],
        id: 'v-b',
        code: 'function App() { return <div>New</div>; }',
        version: 2,
      },
      {
        ...versions[1],
        id: 'v-a',
        code: 'function App() { return <div>Old</div>; }',
        version: 1,
      },
    ];

    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={singleFileVersions}
      />,
    );

    // Should render diff for /App.tsx (auto-wrapped single file)
    const fileSelector = screen.getByTestId('file-selector');
    expect(within(fileSelector).getByText('App.tsx')).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-labelledby', 'compare-modal-title');

    expect(screen.getByLabelText('Select version A')).toBeInTheDocument();
    expect(screen.getByLabelText('Select version B')).toBeInTheDocument();
    expect(screen.getByLabelText('Close compare modal')).toBeInTheDocument();
    expect(screen.getByLabelText('Changed files')).toBeInTheDocument();
    expect(screen.getByLabelText('Code differences')).toBeInTheDocument();
  });

  it('shows correct version labels in diff viewer titles', async () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
      />,
    );

    // Wait for diff viewer to render
    await waitFor(() => {
      expect(screen.getByTestId('mock-diff-viewer')).toBeInTheDocument();
    });

    // Default: v2 (A) vs v3 (B), first changed file auto-selected
    const leftTitle = screen.getByTestId('diff-left-title').textContent;
    const rightTitle = screen.getByTestId('diff-right-title').textContent;

    expect(leftTitle).toContain('v2');
    expect(rightTitle).toContain('v3');
  });

  it('renders changed files count in file selector header', () => {
    render(
      <VersionCompareModal
        isOpen={true}
        onClose={mockOnClose}
        versions={versions}
        initialVersionA="proto-1"
        initialVersionB="proto-2"
      />,
    );

    // v1 -> v2: App.tsx modified, styles.css modified, utils.ts added = 3 changes
    expect(screen.getByText(/Changed Files \(3\)/)).toBeInTheDocument();
  });
});
