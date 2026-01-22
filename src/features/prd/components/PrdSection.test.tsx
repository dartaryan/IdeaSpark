import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrdSection } from './PrdSection';

describe('PrdSection', () => {
  it('renders section title and status badge', () => {
    render(
      <PrdSection
        title="Problem Statement"
        content=""
        status="empty"
      />
    );

    expect(screen.getByText('Problem Statement')).toBeInTheDocument();
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('renders content when provided', () => {
    render(
      <PrdSection
        title="Problem Statement"
        content="This is the problem"
        status="complete"
      />
    );

    expect(screen.getByText('This is the problem')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('renders placeholder when content is empty', () => {
    render(
      <PrdSection
        title="Problem Statement"
        content=""
        status="empty"
      />
    );

    expect(screen.getByText(/This section will be filled/)).toBeInTheDocument();
  });

  it('applies highlight styles when isHighlighted is true', () => {
    const { container } = render(
      <PrdSection
        title="Problem Statement"
        content=""
        status="empty"
        isHighlighted={true}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-primary');
  });
});
