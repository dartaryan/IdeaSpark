// src/features/prototypes/components/RefinementHistoryItem.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { RefinementHistoryItem } from './RefinementHistoryItem';
import type { Prototype } from '../types';
import { describe, it, expect, vi } from 'vitest';

describe('RefinementHistoryItem', () => {
  const mockPrototype: Prototype = {
    id: 'proto-123',
    prdId: 'prd-456',
    ideaId: 'idea-789',
    userId: 'user-001',
    url: 'https://example.com',
    code: '<div>Test</div>',
    version: 2,
    refinementPrompt: 'Make the header larger',
    status: 'ready',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  };

  it('should render version number', () => {
    const onClick = vi.fn();
    render(<RefinementHistoryItem prototype={mockPrototype} isActive={false} onClick={onClick} />);

    expect(screen.getByText('v2')).toBeInTheDocument();
  });

  it('should render refinement prompt', () => {
    const onClick = vi.fn();
    render(<RefinementHistoryItem prototype={mockPrototype} isActive={false} onClick={onClick} />);

    expect(screen.getByText('"Make the header larger"')).toBeInTheDocument();
  });

  it('should render "Initial prototype" for null refinement prompt', () => {
    const onClick = vi.fn();
    const initialPrototype = { ...mockPrototype, version: 1, refinementPrompt: null };

    render(<RefinementHistoryItem prototype={initialPrototype} isActive={false} onClick={onClick} />);

    expect(screen.getByText('Initial prototype')).toBeInTheDocument();
  });

  it('should render formatted creation date', () => {
    const onClick = vi.fn();
    render(<RefinementHistoryItem prototype={mockPrototype} isActive={false} onClick={onClick} />);

    // Check that some date text is rendered (exact format may vary by locale)
    const dateElement = screen.getByText(/2024/i);
    expect(dateElement).toBeInTheDocument();
  });

  it('should show "Current" badge when active', () => {
    const onClick = vi.fn();
    render(<RefinementHistoryItem prototype={mockPrototype} isActive={true} onClick={onClick} />);

    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('should not show "Current" badge when not active', () => {
    const onClick = vi.fn();
    render(<RefinementHistoryItem prototype={mockPrototype} isActive={false} onClick={onClick} />);

    expect(screen.queryByText('Current')).not.toBeInTheDocument();
  });

  it('should apply active styling when active', () => {
    const onClick = vi.fn();
    const { container } = render(
      <RefinementHistoryItem prototype={mockPrototype} isActive={true} onClick={onClick} />
    );

    const card = container.querySelector('.border-primary');
    expect(card).toBeInTheDocument();
  });

  it('should apply inactive styling when not active', () => {
    const onClick = vi.fn();
    const { container } = render(
      <RefinementHistoryItem prototype={mockPrototype} isActive={false} onClick={onClick} />
    );

    const card = container.querySelector('.border-base-300');
    expect(card).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<RefinementHistoryItem prototype={mockPrototype} isActive={false} onClick={onClick} />);

    const card = screen.getByText('v2').closest('.card');
    fireEvent.click(card!);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should have cursor-pointer class for clickability', () => {
    const onClick = vi.fn();
    const { container } = render(
      <RefinementHistoryItem prototype={mockPrototype} isActive={false} onClick={onClick} />
    );

    const card = container.querySelector('.cursor-pointer');
    expect(card).toBeInTheDocument();
  });

  it('should render multiple refinements with different versions', () => {
    const onClick = vi.fn();
    const prototype1 = { ...mockPrototype, id: 'proto-1', version: 1, refinementPrompt: null };
    const prototype2 = { ...mockPrototype, id: 'proto-2', version: 2, refinementPrompt: 'First change' };
    const prototype3 = { ...mockPrototype, id: 'proto-3', version: 3, refinementPrompt: 'Second change' };

    const { rerender } = render(
      <div>
        <RefinementHistoryItem prototype={prototype1} isActive={false} onClick={onClick} />
        <RefinementHistoryItem prototype={prototype2} isActive={false} onClick={onClick} />
        <RefinementHistoryItem prototype={prototype3} isActive={true} onClick={onClick} />
      </div>
    );

    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
    expect(screen.getByText('v3')).toBeInTheDocument();
    expect(screen.getByText('Initial prototype')).toBeInTheDocument();
    expect(screen.getByText('"First change"')).toBeInTheDocument();
    expect(screen.getByText('"Second change"')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });
});
