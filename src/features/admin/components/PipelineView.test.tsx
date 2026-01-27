// src/features/admin/components/PipelineView.test.tsx
// Test suite for PipelineView component
// Story 5.3 - Task 1: Create PipelineView component with kanban board layout

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PipelineView } from './PipelineView';
import { adminService } from '../services/adminService';
import type { ReactNode } from 'react';

// Mock adminService
vi.mock('../services/adminService', () => ({
  adminService: {
    getIdeasByPipeline: vi.fn(),
  },
}));

// Mock Supabase for real-time
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('PipelineView', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );

  it('displays page header with "Pipeline View" title', async () => {
    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: {
        submitted: [],
        approved: [],
        prd_development: [],
        prototype_complete: [],
      },
      error: null,
    });

    render(<PipelineView />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Pipeline View')).toBeInTheDocument();
    });
  });

  it('displays loading skeleton while data fetches', () => {
    vi.mocked(adminService.getIdeasByPipeline).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<PipelineView />, { wrapper });

    expect(screen.getByTestId('pipeline-skeleton')).toBeInTheDocument();
  });

  it('displays all four columns after loading', async () => {
    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: {
        submitted: [],
        approved: [],
        prd_development: [],
        prototype_complete: [],
      },
      error: null,
    });

    render(<PipelineView />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('PRD Development')).toBeInTheDocument();
      expect(screen.getByText('Prototype Complete')).toBeInTheDocument();
    });
  });

  it('displays ideas in correct columns', async () => {
    const mockData = {
      submitted: [
        {
          id: 'idea-1',
          user_id: 'user-1',
          title: 'Submitted Idea',
          problem: 'Test problem',
          solution: 'Test solution',
          impact: 'Test impact',
          status: 'submitted' as const,
          created_at: '2026-01-20T10:00:00Z',
          updated_at: '2026-01-20T10:00:00Z',
          status_updated_at: '2026-01-20T10:00:00Z',
          submitter_name: 'john',
          submitter_email: 'john@example.com',
          days_in_stage: 5,
        },
      ],
      approved: [
        {
          id: 'idea-2',
          user_id: 'user-2',
          title: 'Approved Idea',
          problem: 'Test problem 2',
          solution: 'Test solution 2',
          impact: 'Test impact 2',
          status: 'approved' as const,
          created_at: '2026-01-19T10:00:00Z',
          updated_at: '2026-01-19T10:00:00Z',
          status_updated_at: '2026-01-19T10:00:00Z',
          submitter_name: 'jane',
          submitter_email: 'jane@example.com',
          days_in_stage: 3,
        },
      ],
      prd_development: [],
      prototype_complete: [],
    };

    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: mockData,
      error: null,
    });

    render(<PipelineView />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Submitted Idea')).toBeInTheDocument();
      expect(screen.getByText('Approved Idea')).toBeInTheDocument();
    });
  });

  it('displays error message when query fails', async () => {
    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: null,
      error: { message: 'Database error', code: 'DB_ERROR' },
    });

    render(<PipelineView />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load pipeline/i)).toBeInTheDocument();
    });
  });

  it('has horizontal scrollable layout', async () => {
    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: {
        submitted: [],
        approved: [],
        prd_development: [],
        prototype_complete: [],
      },
      error: null,
    });

    render(<PipelineView />, { wrapper });

    await waitFor(() => {
      const container = screen.getByTestId('pipeline-container');
      expect(container).toHaveClass('overflow-x-auto');
    });
  });

  it('displays real-time indicator', async () => {
    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: {
        submitted: [],
        approved: [],
        prd_development: [],
        prototype_complete: [],
      },
      error: null,
    });

    render(<PipelineView />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('realtime-indicator')).toBeInTheDocument();
    });
  });

  it('applies responsive grid layout classes', async () => {
    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: {
        submitted: [],
        approved: [],
        prd_development: [],
        prototype_complete: [],
      },
      error: null,
    });

    render(<PipelineView />, { wrapper });

    await waitFor(() => {
      const grid = screen.getByTestId('pipeline-grid');
      expect(grid).toHaveClass('grid');
    });
  });
});
