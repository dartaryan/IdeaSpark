// src/features/prototypes/components/EditorSettings.test.tsx
// Unit tests for EditorSettings component (Story 7.1)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import { EditorSettings } from './EditorSettings';
import { DEFAULT_EDITOR_CONFIG } from '../types';

describe('EditorSettings', () => {
  const onChange = vi.fn();
  const onReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render settings button', () => {
    render(
      <EditorSettings config={DEFAULT_EDITOR_CONFIG} onChange={onChange} onReset={onReset} />,
    );

    expect(screen.getByLabelText('Editor settings')).toBeInTheDocument();
  });

  it('should open settings panel on click', () => {
    render(
      <EditorSettings config={DEFAULT_EDITOR_CONFIG} onChange={onChange} onReset={onReset} />,
    );

    fireEvent.click(screen.getByLabelText('Editor settings'));

    expect(screen.getByText('Editor Settings')).toBeInTheDocument();
    expect(screen.getByText('Dark Theme')).toBeInTheDocument();
    expect(screen.getByText('Word Wrap')).toBeInTheDocument();
    expect(screen.getByText('Line Numbers')).toBeInTheDocument();
  });

  it('should call onChange when font size slider changes', () => {
    render(
      <EditorSettings config={DEFAULT_EDITOR_CONFIG} onChange={onChange} onReset={onReset} />,
    );

    fireEvent.click(screen.getByLabelText('Editor settings'));

    const slider = screen.getByLabelText(/Font size/);
    fireEvent.change(slider, { target: { value: '18' } });

    expect(onChange).toHaveBeenCalledWith({ fontSize: 18 });
  });

  it('should call onChange when dark theme is toggled', () => {
    render(
      <EditorSettings config={DEFAULT_EDITOR_CONFIG} onChange={onChange} onReset={onReset} />,
    );

    fireEvent.click(screen.getByLabelText('Editor settings'));

    const toggle = screen.getByLabelText('Dark theme');
    fireEvent.click(toggle);

    expect(onChange).toHaveBeenCalledWith({ theme: 'light' });
  });

  it('should call onChange when word wrap is toggled', () => {
    render(
      <EditorSettings config={DEFAULT_EDITOR_CONFIG} onChange={onChange} onReset={onReset} />,
    );

    fireEvent.click(screen.getByLabelText('Editor settings'));

    const toggle = screen.getByLabelText('Word wrap');
    fireEvent.click(toggle);

    expect(onChange).toHaveBeenCalledWith({ wordWrap: true });
  });

  it('should call onChange when line numbers is toggled', () => {
    render(
      <EditorSettings config={DEFAULT_EDITOR_CONFIG} onChange={onChange} onReset={onReset} />,
    );

    fireEvent.click(screen.getByLabelText('Editor settings'));

    const toggle = screen.getByLabelText('Line numbers');
    fireEvent.click(toggle);

    expect(onChange).toHaveBeenCalledWith({ lineNumbers: false });
  });

  it('should call onChange when tab size button is clicked', () => {
    render(
      <EditorSettings config={DEFAULT_EDITOR_CONFIG} onChange={onChange} onReset={onReset} />,
    );

    fireEvent.click(screen.getByLabelText('Editor settings'));

    fireEvent.click(screen.getByText('4 spaces'));

    expect(onChange).toHaveBeenCalledWith({ tabSize: 4 });
  });

  it('should call onReset when reset button is clicked', () => {
    render(
      <EditorSettings config={DEFAULT_EDITOR_CONFIG} onChange={onChange} onReset={onReset} />,
    );

    fireEvent.click(screen.getByLabelText('Editor settings'));

    fireEvent.click(screen.getByLabelText('Reset to defaults'));

    expect(onReset).toHaveBeenCalled();
  });

  it('should close settings panel when clicking backdrop', () => {
    render(
      <EditorSettings config={DEFAULT_EDITOR_CONFIG} onChange={onChange} onReset={onReset} />,
    );

    fireEvent.click(screen.getByLabelText('Editor settings'));
    expect(screen.getByText('Editor Settings')).toBeInTheDocument();

    // Click the backdrop (fixed overlay)
    const backdrop = document.querySelector('.fixed.inset-0.z-40');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(screen.queryByText('Editor Settings')).not.toBeInTheDocument();
  });
});
