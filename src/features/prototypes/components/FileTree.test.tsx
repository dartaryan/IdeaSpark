// src/features/prototypes/components/FileTree.test.tsx
// Unit tests for FileTree component (Story 7.1)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import { FileTree } from './FileTree';
import type { EditorFile } from '../types';

const mockFiles: Record<string, EditorFile> = {
  '/src/App.tsx': { path: '/src/App.tsx', content: 'app code', language: 'typescript' },
  '/src/components/Button.tsx': { path: '/src/components/Button.tsx', content: 'button code', language: 'typescript' },
  '/src/styles.css': { path: '/src/styles.css', content: 'styles', language: 'css' },
  '/index.html': { path: '/index.html', content: '<html></html>', language: 'html' },
};

describe('FileTree', () => {
  const onFileSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render file tree with all files', () => {
    render(
      <FileTree files={mockFiles} activeFile="/src/App.tsx" onFileSelect={onFileSelect} />,
    );

    expect(screen.getByText('App.tsx')).toBeInTheDocument();
    expect(screen.getByText('Button.tsx')).toBeInTheDocument();
    expect(screen.getByText('styles.css')).toBeInTheDocument();
    expect(screen.getByText('index.html')).toBeInTheDocument();
  });

  it('should display directory structure', () => {
    render(
      <FileTree files={mockFiles} activeFile="/src/App.tsx" onFileSelect={onFileSelect} />,
    );

    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('components')).toBeInTheDocument();
  });

  it('should call onFileSelect when a file is clicked', () => {
    render(
      <FileTree files={mockFiles} activeFile="/src/App.tsx" onFileSelect={onFileSelect} />,
    );

    fireEvent.click(screen.getByText('Button.tsx'));
    expect(onFileSelect).toHaveBeenCalledWith('/src/components/Button.tsx');
  });

  it('should highlight the active file', () => {
    render(
      <FileTree files={mockFiles} activeFile="/src/App.tsx" onFileSelect={onFileSelect} />,
    );

    const activeButton = screen.getByText('App.tsx').closest('button');
    expect(activeButton?.className).toContain('text-primary');
  });

  it('should toggle directory expand/collapse on click', () => {
    render(
      <FileTree files={mockFiles} activeFile="/src/App.tsx" onFileSelect={onFileSelect} />,
    );

    // components directory should be open by default
    expect(screen.getByText('Button.tsx')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(screen.getByText('components'));

    // Button.tsx should be hidden after collapse
    expect(screen.queryByText('Button.tsx')).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(screen.getByText('components'));
    expect(screen.getByText('Button.tsx')).toBeInTheDocument();
  });

  it('should show "No files available" for empty files', () => {
    render(<FileTree files={{}} activeFile="" onFileSelect={onFileSelect} />);

    expect(screen.getByText('No files available')).toBeInTheDocument();
  });

  it('should have proper ARIA roles', () => {
    render(
      <FileTree files={mockFiles} activeFile="/src/App.tsx" onFileSelect={onFileSelect} />,
    );

    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getByLabelText('File explorer')).toBeInTheDocument();
  });

  it('should handle keyboard navigation with Enter key', () => {
    render(
      <FileTree files={mockFiles} activeFile="/src/App.tsx" onFileSelect={onFileSelect} />,
    );

    const fileButton = screen.getByText('styles.css').closest('button')!;
    fireEvent.keyDown(fileButton, { key: 'Enter' });
    expect(onFileSelect).toHaveBeenCalledWith('/src/styles.css');
  });

  it('should handle keyboard navigation with Space key', () => {
    render(
      <FileTree files={mockFiles} activeFile="/src/App.tsx" onFileSelect={onFileSelect} />,
    );

    const fileButton = screen.getByText('styles.css').closest('button')!;
    fireEvent.keyDown(fileButton, { key: ' ' });
    expect(onFileSelect).toHaveBeenCalledWith('/src/styles.css');
  });

  it('should handle ArrowRight to expand directory', () => {
    render(
      <FileTree files={mockFiles} activeFile="/src/App.tsx" onFileSelect={onFileSelect} />,
    );

    // First collapse
    const dirButton = screen.getByText('components').closest('button')!;
    fireEvent.click(dirButton);
    expect(screen.queryByText('Button.tsx')).not.toBeInTheDocument();

    // Then expand with ArrowRight
    fireEvent.keyDown(dirButton, { key: 'ArrowRight' });
    expect(screen.getByText('Button.tsx')).toBeInTheDocument();
  });

  it('should handle ArrowLeft to collapse directory', () => {
    render(
      <FileTree files={mockFiles} activeFile="/src/App.tsx" onFileSelect={onFileSelect} />,
    );

    const dirButton = screen.getByText('components').closest('button')!;
    
    // Directory is open by default
    expect(screen.getByText('Button.tsx')).toBeInTheDocument();

    // Collapse with ArrowLeft
    fireEvent.keyDown(dirButton, { key: 'ArrowLeft' });
    expect(screen.queryByText('Button.tsx')).not.toBeInTheDocument();
  });
});
