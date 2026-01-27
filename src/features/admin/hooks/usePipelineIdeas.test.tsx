// src/features/admin/hooks/usePipelineIdeas.test.ts
// Test suite for usePipelineIdeas hook
// Story 5.3 - Task 5: Create usePipelineIdeas hook with React Query

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePipelineIdeas } from './usePipelineIdeas';
import { adminService } from '../services/adminService';
import React, { type ReactNode } from 'react';

// Mock adminService
vi.mock('../services/adminService', () => ({
  adminService: {
    getIdeasByPipeline: vi.fn(),
  },
}));

// Mock Supabase client for real-time
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('usePipelineIdeas', () => {
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

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('fetches pipeline ideas on mount', async () => {
    const mockPipelineData = {
      submitted: [],
      approved: [],
      prd_development: [],
      prototype_complete: [],
    };

    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: mockPipelineData,
      error: null,
    });

    const { result } = renderHook(() => usePipelineIdeas(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminService.getIdeasByPipeline).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockPipelineData);
  });

  it('shows loading state initially', () => {
    vi.mocked(adminService.getIdeasByPipeline).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => usePipelineIdeas(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('handles error state when service fails', async () => {
    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: null,
      error: { message: 'Database error', code: 'DB_ERROR' },
    });

    const { result } = renderHook(() => usePipelineIdeas(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('uses correct query key for React Query', () => {
    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: {
        submitted: [],
        approved: [],
        prd_development: [],
        prototype_complete: [],
      },
      error: null,
    });

    renderHook(() => usePipelineIdeas(), { wrapper });

    // Verify query is registered with correct key
    const queries = queryClient.getQueryCache().getAll();
    expect(queries.some(q => JSON.stringify(q.queryKey) === JSON.stringify(['admin', 'pipeline']))).toBe(true);
  });

  it('returns empty arrays when no data is available', async () => {
    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: {
        submitted: [],
        approved: [],
        prd_development: [],
        prototype_complete: [],
      },
      error: null,
    });

    const { result } = renderHook(() => usePipelineIdeas(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.submitted).toEqual([]);
    expect(result.current.data?.approved).toEqual([]);
    expect(result.current.data?.prd_development).toEqual([]);
    expect(result.current.data?.prototype_complete).toEqual([]);
  });

  it('provides grouped ideas by status', async () => {
    const mockIdea1 = {
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
    };

    const mockIdea2 = {
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
    };

    vi.mocked(adminService.getIdeasByPipeline).mockResolvedValue({
      data: {
        submitted: [mockIdea1],
        approved: [mockIdea2],
        prd_development: [],
        prototype_complete: [],
      },
      error: null,
    });

    const { result } = renderHook(() => usePipelineIdeas(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.submitted).toHaveLength(1);
    expect(result.current.data?.submitted[0].title).toBe('Submitted Idea');
    expect(result.current.data?.approved).toHaveLength(1);
    expect(result.current.data?.approved[0].title).toBe('Approved Idea');
  });
});
