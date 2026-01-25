import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenerationProgress } from './GenerationProgress';

describe('GenerationProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when status is not generating', () => {
    const { container } = render(
      <GenerationProgress status="ready" startTime={Date.now()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render progress indicator when generating', () => {
    render(<GenerationProgress status="generating" startTime={Date.now()} />);
    expect(screen.getByText(/Analyzing PRD/)).toBeInTheDocument();
  });

  it('should show elapsed time', () => {
    const startTime = Date.now();
    render(<GenerationProgress status="generating" startTime={startTime} />);
    
    // Initially should show 0s
    expect(screen.getByText(/0s elapsed/)).toBeInTheDocument();
  });

  it('should progress through stages', () => {
    const startTime = Date.now();
    render(<GenerationProgress status="generating" startTime={startTime} />);

    // Initially should be in "Analyzing PRD" stage
    expect(screen.getByText(/Analyzing PRD/)).toBeInTheDocument();

    // Advance time to move to next stage (3 seconds)
    vi.advanceTimersByTime(3500);

    // Should now be in "Generating code" stage
    expect(screen.getByText(/Generating code/)).toBeInTheDocument();

    // Advance time to move to final stage (23 seconds total)
    vi.advanceTimersByTime(20000);

    // Should now be in "Building preview" stage
    expect(screen.getByText(/Building preview/)).toBeInTheDocument();
  });

  it('should show progress bar', () => {
    render(<GenerationProgress status="generating" startTime={Date.now()} />);
    
    // Progress bar should exist
    const progressBar = document.querySelector('.bg-primary');
    expect(progressBar).toBeInTheDocument();
  });

  it('should show all stage indicators', () => {
    render(<GenerationProgress status="generating" startTime={Date.now()} />);
    
    expect(screen.getByText('Analyzing PRD')).toBeInTheDocument();
    expect(screen.getByText('Generating code')).toBeInTheDocument();
    expect(screen.getByText('Building preview')).toBeInTheDocument();
  });

  it('should highlight current stage', () => {
    const startTime = Date.now();
    const { container } = render(
      <GenerationProgress status="generating" startTime={startTime} />
    );

    // First stage should be highlighted
    const stageIndicators = container.querySelectorAll('.w-2.h-2.rounded-full');
    expect(stageIndicators[0]).toHaveClass('animate-pulse');
  });

  it('should cap progress at 100%', () => {
    const startTime = Date.now() - 40000; // 40 seconds ago
    render(<GenerationProgress status="generating" startTime={startTime} />);

    vi.advanceTimersByTime(1000);

    // Progress should not exceed 100%
    const progressBar = document.querySelector('.bg-primary') as HTMLElement;
    expect(progressBar).toBeInTheDocument();
    if (progressBar) {
      const width = progressBar.style.width;
      expect(width).toBe('100%');
    }
  });

  it('should stay on last stage after 30 seconds', () => {
    const startTime = Date.now() - 35000; // 35 seconds ago
    render(<GenerationProgress status="generating" startTime={startTime} />);

    vi.advanceTimersByTime(1000);

    // Should be on last stage
    expect(screen.getByText(/Building preview/)).toBeInTheDocument();
  });
});
