// src/features/admin/services/adminService.getIdeasByPipeline.test.ts
// Test suite for getIdeasByPipeline function
// Story 5.3 - Task 4: Extend adminService to fetch ideas grouped by status

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './adminService';
import { supabase } from '../../../lib/supabase';

// Mock Supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('adminService.getIdeasByPipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all ideas and groups them by status', async () => {
    const mockData = [
      {
        id: 'idea-1',
        user_id: 'user-1',
        title: 'Submitted Idea',
        problem: 'Test problem',
        solution: 'Test solution',
        impact: 'Test impact',
        status: 'submitted',
        created_at: '2026-01-20T10:00:00Z',
        updated_at: '2026-01-20T10:00:00Z',
        status_updated_at: '2026-01-20T10:00:00Z',
        users: {
          id: 'user-1',
          email: 'john@example.com',
        },
      },
      {
        id: 'idea-2',
        user_id: 'user-2',
        title: 'Approved Idea',
        problem: 'Test problem 2',
        solution: 'Test solution 2',
        impact: 'Test impact 2',
        status: 'approved',
        created_at: '2026-01-19T10:00:00Z',
        updated_at: '2026-01-19T10:00:00Z',
        status_updated_at: '2026-01-19T10:00:00Z',
        users: {
          id: 'user-2',
          email: 'jane@example.com',
        },
      },
      {
        id: 'idea-3',
        user_id: 'user-1',
        title: 'PRD Development Idea',
        problem: 'Test problem 3',
        solution: 'Test solution 3',
        impact: 'Test impact 3',
        status: 'prd_development',
        created_at: '2026-01-18T10:00:00Z',
        updated_at: '2026-01-18T10:00:00Z',
        status_updated_at: '2026-01-18T10:00:00Z',
        users: {
          id: 'user-1',
          email: 'john@example.com',
        },
      },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockNeq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      neq: mockNeq,
      order: mockOrder,
    } as any);

    const result = await adminService.getIdeasByPipeline();

    // Verify database query
    expect(supabase.from).toHaveBeenCalledWith('ideas');
    expect(mockSelect).toHaveBeenCalledWith('*, users!inner(id, email)');
    expect(mockNeq).toHaveBeenCalledWith('status', 'rejected');
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });

    // Verify result structure
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
    
    // Verify ideas are grouped correctly
    expect(result.data?.submitted).toHaveLength(1);
    expect(result.data?.approved).toHaveLength(1);
    expect(result.data?.prd_development).toHaveLength(1);
    expect(result.data?.prototype_complete).toHaveLength(0);
  });

  it('excludes rejected ideas from pipeline', async () => {
    const mockData = [
      {
        id: 'idea-1',
        user_id: 'user-1',
        title: 'Submitted Idea',
        problem: 'Test problem',
        solution: 'Test solution',
        impact: 'Test impact',
        status: 'submitted',
        created_at: '2026-01-20T10:00:00Z',
        updated_at: '2026-01-20T10:00:00Z',
        status_updated_at: '2026-01-20T10:00:00Z',
        users: {
          id: 'user-1',
          email: 'john@example.com',
        },
      },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockNeq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      neq: mockNeq,
      order: mockOrder,
    } as any);

    await adminService.getIdeasByPipeline();

    // Verify rejected status is excluded
    expect(mockNeq).toHaveBeenCalledWith('status', 'rejected');
  });

  it('calculates days_in_stage using status_updated_at', async () => {
    const now = new Date();
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const mockData = [
      {
        id: 'idea-1',
        user_id: 'user-1',
        title: 'Test Idea',
        problem: 'Test problem',
        solution: 'Test solution',
        impact: 'Test impact',
        status: 'submitted',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-20T10:00:00Z',
        status_updated_at: fiveDaysAgo.toISOString(),
        users: {
          id: 'user-1',
          email: 'john@example.com',
        },
      },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockNeq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      neq: mockNeq,
      order: mockOrder,
    } as any);

    const result = await adminService.getIdeasByPipeline();

    // Verify days_in_stage is calculated
    expect(result.data?.submitted[0].days_in_stage).toBe(5);
  });

  it('falls back to created_at when status_updated_at is null', async () => {
    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const mockData = [
      {
        id: 'idea-1',
        user_id: 'user-1',
        title: 'Test Idea',
        problem: 'Test problem',
        solution: 'Test solution',
        impact: 'Test impact',
        status: 'submitted',
        created_at: threeDaysAgo.toISOString(),
        updated_at: '2026-01-20T10:00:00Z',
        status_updated_at: null,
        users: {
          id: 'user-1',
          email: 'john@example.com',
        },
      },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockNeq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      neq: mockNeq,
      order: mockOrder,
    } as any);

    const result = await adminService.getIdeasByPipeline();

    // Verify days_in_stage uses created_at as fallback
    expect(result.data?.submitted[0].days_in_stage).toBe(3);
  });

  it('sorts ideas within each group by created_at DESC', async () => {
    const mockData = [
      {
        id: 'idea-1',
        user_id: 'user-1',
        title: 'Newer Idea',
        problem: 'Test problem',
        solution: 'Test solution',
        impact: 'Test impact',
        status: 'submitted',
        created_at: '2026-01-20T10:00:00Z',
        updated_at: '2026-01-20T10:00:00Z',
        status_updated_at: '2026-01-20T10:00:00Z',
        users: {
          id: 'user-1',
          email: 'john@example.com',
        },
      },
      {
        id: 'idea-2',
        user_id: 'user-2',
        title: 'Older Idea',
        problem: 'Test problem 2',
        solution: 'Test solution 2',
        impact: 'Test impact 2',
        status: 'submitted',
        created_at: '2026-01-19T10:00:00Z',
        updated_at: '2026-01-19T10:00:00Z',
        status_updated_at: '2026-01-19T10:00:00Z',
        users: {
          id: 'user-2',
          email: 'jane@example.com',
        },
      },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockNeq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      neq: mockNeq,
      order: mockOrder,
    } as any);

    const result = await adminService.getIdeasByPipeline();

    // Verify sorting order
    expect(result.data?.submitted[0].title).toBe('Newer Idea');
    expect(result.data?.submitted[1].title).toBe('Older Idea');
  });

  it('returns empty arrays for statuses with no ideas', async () => {
    const mockData: any[] = [];

    const mockSelect = vi.fn().mockReturnThis();
    const mockNeq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      neq: mockNeq,
      order: mockOrder,
    } as any);

    const result = await adminService.getIdeasByPipeline();

    // Verify all status groups are empty arrays
    expect(result.data?.submitted).toEqual([]);
    expect(result.data?.approved).toEqual([]);
    expect(result.data?.prd_development).toEqual([]);
    expect(result.data?.prototype_complete).toEqual([]);
  });

  it('handles database errors gracefully', async () => {
    const mockError = { message: 'Database connection failed', code: 'DB_ERROR' };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    } as any);

    const result = await adminService.getIdeasByPipeline();

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('Database connection failed');
  });

  it('transforms user data to include submitter_name and submitter_email', async () => {
    const mockData = [
      {
        id: 'idea-1',
        user_id: 'user-1',
        title: 'Test Idea',
        problem: 'Test problem',
        solution: 'Test solution',
        impact: 'Test impact',
        status: 'submitted',
        created_at: '2026-01-20T10:00:00Z',
        updated_at: '2026-01-20T10:00:00Z',
        status_updated_at: '2026-01-20T10:00:00Z',
        users: {
          id: 'user-1',
          email: 'john.doe@example.com',
        },
      },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockNeq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      neq: mockNeq,
      order: mockOrder,
    } as any);

    const result = await adminService.getIdeasByPipeline();

    // Verify submitter data transformation
    expect(result.data?.submitted[0].submitter_name).toBe('john.doe');
    expect(result.data?.submitted[0].submitter_email).toBe('john.doe@example.com');
  });
});
