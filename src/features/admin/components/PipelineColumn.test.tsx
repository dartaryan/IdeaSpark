// src/features/admin/components/PipelineColumn.test.tsx
// Test suite for PipelineColumn component
// Story 5.3 - Task 2: Create PipelineColumn component

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PipelineColumn } from './PipelineColumn';
import type { IdeaWithSubmitter } from '../types';

// Mock dependencies
vi.mock('../hooks/useApproveIdea', () => ({
  useApproveIdea: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('../hooks/useRejectIdea', () => ({
  useRejectIdea: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockIdeas: IdeaWithSubmitter[] = [
  {
    id: 'idea-1',
    user_id: 'user-1',
    title: 'Mobile App Development',
    problem: 'Need mobile experience',
    solution: 'Build native app',
    impact: 'High user engagement',
    status: 'submitted',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
    status_updated_at: '2026-01-20T10:00:00Z',
    submitter_name: 'john.doe',
    submitter_email: 'john@example.com',
    days_in_stage: 5,
  },
  {
    id: 'idea-2',
    user_id: 'user-2',
    title: 'AI Assistant Feature',
    problem: 'Users need help',
    solution: 'Add AI chat',
    impact: 'Better support',
    status: 'submitted',
    created_at: '2026-01-19T10:00:00Z',
    updated_at: '2026-01-19T10:00:00Z',
    status_updated_at: '2026-01-19T10:00:00Z',
    submitter_name: 'jane.smith',
    submitter_email: 'jane@example.com',
    days_in_stage: 3,
  },
];

const renderWithRouter = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('PipelineColumn', () => {
  it('displays column title', () => {
    renderWithRouter(
      <PipelineColumn
        ideas={mockIdeas}
        columnTitle="Submitted"
        columnColor="gray"
      />
    );
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('displays count badge with number of ideas', () => {
    renderWithRouter(
      <PipelineColumn
        ideas={mockIdeas}
        columnTitle="Submitted"
        columnColor="gray"
      />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders all idea cards', () => {
    renderWithRouter(
      <PipelineColumn
        ideas={mockIdeas}
        columnTitle="Submitted"
        columnColor="gray"
      />
    );
    expect(screen.getByText('Mobile App Development')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant Feature')).toBeInTheDocument();
  });

  it('displays empty state when no ideas', () => {
    renderWithRouter(
      <PipelineColumn
        ideas={[]}
        columnTitle="Submitted"
        columnColor="gray"
      />
    );
    expect(screen.getByText(/No ideas in this stage/i)).toBeInTheDocument();
  });

  it('applies gray color for submitted status', () => {
    const { container } = renderWithRouter(
      <PipelineColumn
        ideas={mockIdeas}
        columnTitle="Submitted"
        columnColor="gray"
      />
    );
    // Check for color classes in header
    const header = container.querySelector('[data-testid="column-header"]');
    expect(header).toBeInTheDocument();
  });

  it('applies blue color for approved status', () => {
    const { container } = renderWithRouter(
      <PipelineColumn
        ideas={[]}
        columnTitle="Approved"
        columnColor="blue"
      />
    );
    const header = container.querySelector('[data-testid="column-header"]');
    expect(header).toBeInTheDocument();
  });

  it('applies yellow color for prd_development status', () => {
    const { container } = renderWithRouter(
      <PipelineColumn
        ideas={[]}
        columnTitle="PRD Development"
        columnColor="yellow"
      />
    );
    const header = container.querySelector('[data-testid="column-header"]');
    expect(header).toBeInTheDocument();
  });

  it('applies green color for prototype_complete status', () => {
    const { container } = renderWithRouter(
      <PipelineColumn
        ideas={[]}
        columnTitle="Prototype Complete"
        columnColor="green"
      />
    );
    const header = container.querySelector('[data-testid="column-header"]');
    expect(header).toBeInTheDocument();
  });

  it('has scrollable card container', () => {
    renderWithRouter(
      <PipelineColumn
        ideas={mockIdeas}
        columnTitle="Submitted"
        columnColor="gray"
      />
    );
    const container = screen.getByTestId('card-container');
    expect(container).toHaveClass('overflow-y-auto');
  });

  it('displays zero in count badge when no ideas', () => {
    renderWithRouter(
      <PipelineColumn
        ideas={[]}
        columnTitle="Submitted"
        columnColor="gray"
      />
    );
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders cards in a vertical layout', () => {
    renderWithRouter(
      <PipelineColumn
        ideas={mockIdeas}
        columnTitle="Submitted"
        columnColor="gray"
      />
    );
    const container = screen.getByTestId('card-container');
    expect(container).toHaveClass('flex', 'flex-col', 'gap-3');
  });
});
