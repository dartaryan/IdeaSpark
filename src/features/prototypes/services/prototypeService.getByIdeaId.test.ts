// src/features/prototypes/services/prototypeService.getByIdeaId.test.ts
// Task 8 Tests - Story 4.8

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prototypeService } from './prototypeService';
import { supabase } from '../../../lib/supabase';

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('prototypeService.getByIdeaId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the latest ready prototype for an idea', async () => {
    // Arrange
    const mockPrototype = {
      id: 'proto-1',
      idea_id: 'idea-1',
      prd_id: 'prd-1',
      user_id: 'user-1',
      url: 'https://example.com/proto',
      code: '<div>Test</div>',
      status: 'ready',
      version: 2,
      refinement_prompt: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      share_id: 'share-1',
      is_public: false,
      shared_at: null,
      view_count: 0,
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockPrototype, error: null });
    const mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockEq2 = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);

    // Act
    const result = await prototypeService.getByIdeaId('idea-1');

    // Assert
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.id).toBe('proto-1');
    expect(result.data?.ideaId).toBe('idea-1');
    expect(result.data?.version).toBe(2);
    expect(result.data?.status).toBe('ready');
    
    // Verify query construction
    expect(supabase.from).toHaveBeenCalledWith('prototypes');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq1).toHaveBeenCalledWith('idea_id', 'idea-1');
    expect(mockEq2).toHaveBeenCalledWith('status', 'ready');
    expect(mockOrder).toHaveBeenCalledWith('version', { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(1);
  });

  it('should return null when no prototype exists for the idea', async () => {
    // Arrange
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockEq2 = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);

    // Act
    const result = await prototypeService.getByIdeaId('idea-no-proto');

    // Assert
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });

  it('should return error when database query fails', async () => {
    // Arrange
    const mockError = { message: 'Database error', code: 'DB_ERROR' };
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
    const mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockEq2 = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);

    // Act
    const result = await prototypeService.getByIdeaId('idea-1');

    // Assert
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('DB_ERROR');
  });

  it('should only return ready prototypes, not generating or failed', async () => {
    // Arrange
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockEq2 = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);

    // Act
    await prototypeService.getByIdeaId('idea-1');

    // Assert - verify that status filter is 'ready'
    expect(mockEq2).toHaveBeenCalledWith('status', 'ready');
  });
});

describe('prototypeService.getAllByIdeaId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all prototypes for an idea ordered by version', async () => {
    // Arrange
    const mockPrototypes = [
      {
        id: 'proto-2',
        idea_id: 'idea-1',
        prd_id: 'prd-1',
        user_id: 'user-1',
        url: 'https://example.com/proto-v2',
        code: '<div>V2</div>',
        status: 'ready',
        version: 2,
        refinement_prompt: 'Make it better',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        share_id: 'share-2',
        is_public: false,
        shared_at: null,
        view_count: 0,
      },
      {
        id: 'proto-1',
        idea_id: 'idea-1',
        prd_id: 'prd-1',
        user_id: 'user-1',
        url: 'https://example.com/proto-v1',
        code: '<div>V1</div>',
        status: 'ready',
        version: 1,
        refinement_prompt: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        share_id: 'share-1',
        is_public: false,
        shared_at: null,
        view_count: 0,
      },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockPrototypes, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);
    mockSelect.mockReturnValue({
      eq: mockEq,
    } as any);
    mockEq.mockReturnValue({
      order: mockOrder,
    } as any);

    // Act
    const result = await prototypeService.getAllByIdeaId('idea-1');

    // Assert
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(2);
    expect(result.data![0].version).toBe(2);
    expect(result.data![1].version).toBe(1);
    
    // Verify query construction
    expect(supabase.from).toHaveBeenCalledWith('prototypes');
    expect(mockEq).toHaveBeenCalledWith('idea_id', 'idea-1');
    expect(mockOrder).toHaveBeenCalledWith('version', { ascending: false });
  });

  it('should return empty array when no prototypes exist', async () => {
    // Arrange
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);
    mockSelect.mockReturnValue({
      eq: mockEq,
    } as any);
    mockEq.mockReturnValue({
      order: mockOrder,
    } as any);

    // Act
    const result = await prototypeService.getAllByIdeaId('idea-no-protos');

    // Assert
    expect(result.error).toBeNull();
    expect(result.data).toEqual([]);
  });
});
