// src/features/admin/services/adminService.getAllIdeas.test.ts
// Test suite for getAllIdeas function

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './adminService';
import { supabase } from '../../../lib/supabase';

// Mock Supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('adminService.getAllIdeas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all ideas with user data joined', async () => {
    const mockData = [
      {
        id: 'idea-1',
        title: 'Test Idea',
        problem: 'Test problem',
        solution: 'Test solution',
        impact: 'Test impact',
        status: 'submitted',
        created_at: '2026-01-20T10:00:00Z',
        updated_at: '2026-01-20T10:00:00Z',
        users: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockIlike = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({ data: mockData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      ilike: mockIlike,
      order: mockOrder,
      limit: mockLimit,
    } as any);

    const result = await adminService.getAllIdeas({
      statusFilter: 'all',
      sortBy: 'newest',
      searchQuery: '',
    });

    expect(supabase.from).toHaveBeenCalledWith('ideas');
    expect(mockSelect).toHaveBeenCalledWith('*, users!inner(id, email)');
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
  });

  it('filters ideas by status when statusFilter is not "all"', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockIlike = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      ilike: mockIlike,
      order: mockOrder,
      limit: mockLimit,
    } as any);

    await adminService.getAllIdeas({
      statusFilter: 'submitted',
      sortBy: 'newest',
      searchQuery: '',
    });

    expect(mockEq).toHaveBeenCalledWith('status', 'submitted');
  });

  it('does not filter by status when statusFilter is "all"', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockIlike = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      ilike: mockIlike,
      order: mockOrder,
      limit: mockLimit,
    } as any);

    await adminService.getAllIdeas({
      statusFilter: 'all',
      sortBy: 'newest',
      searchQuery: '',
    });

    // eq should not be called for status when filter is "all"
    expect(mockEq).not.toHaveBeenCalledWith('status', expect.anything());
  });

  it('applies search filter on title when searchQuery is provided', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockIlike = vi.fn().mockReturnThis();
    const mockOr = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      ilike: mockIlike,
      or: mockOr,
      order: mockOrder,
      limit: mockLimit,
    } as any);

    await adminService.getAllIdeas({
      statusFilter: 'all',
      sortBy: 'newest',
      searchQuery: 'innovation',
    });

    expect(mockOr).toHaveBeenCalledWith('title.ilike.%innovation%,problem.ilike.%innovation%');
  });

  it('sorts by created_at DESC when sortBy is "newest"', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockIlike = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      ilike: mockIlike,
      order: mockOrder,
      limit: mockLimit,
    } as any);

    await adminService.getAllIdeas({
      statusFilter: 'all',
      sortBy: 'newest',
      searchQuery: '',
    });

    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('sorts by created_at ASC when sortBy is "oldest"', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockIlike = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      ilike: mockIlike,
      order: mockOrder,
      limit: mockLimit,
    } as any);

    await adminService.getAllIdeas({
      statusFilter: 'all',
      sortBy: 'oldest',
      searchQuery: '',
    });

    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('sorts by status alphabetically when sortBy is "status"', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockIlike = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      ilike: mockIlike,
      order: mockOrder,
      limit: mockLimit,
    } as any);

    await adminService.getAllIdeas({
      statusFilter: 'all',
      sortBy: 'status',
      searchQuery: '',
    });

    expect(mockOrder).toHaveBeenCalledWith('status', { ascending: true });
  });

  it('limits results to 50 items', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockIlike = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      ilike: mockIlike,
      order: mockOrder,
      limit: mockLimit,
    } as any);

    await adminService.getAllIdeas({
      statusFilter: 'all',
      sortBy: 'newest',
      searchQuery: '',
    });

    expect(mockLimit).toHaveBeenCalledWith(50);
  });

  it('handles database errors gracefully', async () => {
    const mockError = { message: 'Database connection failed', code: 'DB_ERROR' };
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    } as any);

    const result = await adminService.getAllIdeas({
      statusFilter: 'all',
      sortBy: 'newest',
      searchQuery: '',
    });

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('Database connection failed');
  });
});
