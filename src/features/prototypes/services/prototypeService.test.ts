import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prototypeService } from './prototypeService';
import type { PrototypeRow } from '../types';

// Mock the supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Import the mocked module
import { supabase } from '../../../lib/supabase';

const mockPrototypeRow: PrototypeRow = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  prd_id: '123e4567-e89b-12d3-a456-426614174001',
  idea_id: '123e4567-e89b-12d3-a456-426614174002',
  user_id: 'user-123',
  url: 'https://example.com/prototype',
  code: 'const App = () => <div>Hello</div>',
  version: 1,
  refinement_prompt: null,
  status: 'ready',
  created_at: '2026-01-25T10:00:00Z',
  updated_at: '2026-01-25T10:00:00Z',
};

const mockUser = {
  data: {
    user: { id: 'user-123' },
  },
  error: null,
};

describe('prototypeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new prototype successfully', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as never);
      
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrototypeRow, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const input = {
        prdId: mockPrototypeRow.prd_id,
        ideaId: mockPrototypeRow.idea_id,
      };

      const result = await prototypeService.create(input);

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('prototypes');
      expect(mockFrom.insert).toHaveBeenCalledWith({
        prd_id: input.prdId,
        idea_id: input.ideaId,
        user_id: 'user-123',
        url: null,
        code: null,
        status: 'generating',
        version: 1,
      });
      expect(result.data).toBeDefined();
      expect(result.data?.prdId).toBe(mockPrototypeRow.prd_id);
      expect(result.error).toBeNull();
    });

    it('should create prototype with optional fields', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as never);
      
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrototypeRow, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const input = {
        prdId: mockPrototypeRow.prd_id,
        ideaId: mockPrototypeRow.idea_id,
        url: 'https://example.com',
        code: 'const x = 1;',
        status: 'ready' as const,
      };

      await prototypeService.create(input);

      expect(mockFrom.insert).toHaveBeenCalledWith({
        prd_id: input.prdId,
        idea_id: input.ideaId,
        user_id: 'user-123',
        url: input.url,
        code: input.code,
        status: input.status,
        version: 1,
      });
    });

    it('should return error when not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      } as never);

      const result = await prototypeService.create({
        prdId: mockPrototypeRow.prd_id,
        ideaId: mockPrototypeRow.idea_id,
      });

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('AUTH_ERROR');
    });

    it('should return error on database failure', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as never);
      
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.create({
        prdId: mockPrototypeRow.prd_id,
        ideaId: mockPrototypeRow.idea_id,
      });

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DB_ERROR');
    });
  });

  describe('getById', () => {
    it('should get prototype by ID successfully', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrototypeRow, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.getById(mockPrototypeRow.id);

      expect(supabase.from).toHaveBeenCalledWith('prototypes');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', mockPrototypeRow.id);
      expect(result.data?.id).toBe(mockPrototypeRow.id);
      expect(result.error).toBeNull();
    });

    it('should return NOT_FOUND error when prototype does not exist', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.getById('non-existent-id');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('NOT_FOUND');
    });

    it('should return error on database failure', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.getById(mockPrototypeRow.id);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DB_ERROR');
    });
  });

  describe('getByPrdId', () => {
    it('should get all prototypes for a PRD', async () => {
      const mockPrototypes = [
        mockPrototypeRow,
        { ...mockPrototypeRow, id: 'proto-2', version: 2 },
      ];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPrototypes, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.getByPrdId(mockPrototypeRow.prd_id);

      expect(supabase.from).toHaveBeenCalledWith('prototypes');
      expect(mockFrom.eq).toHaveBeenCalledWith('prd_id', mockPrototypeRow.prd_id);
      expect(mockFrom.order).toHaveBeenCalledWith('version', { ascending: false });
      expect(result.data).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should return empty array when no prototypes found', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.getByPrdId('non-existent-prd');

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should return error on database failure', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.getByPrdId(mockPrototypeRow.prd_id);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DB_ERROR');
    });
  });

  describe('getByUserId', () => {
    it('should get all prototypes for a user', async () => {
      const mockPrototypes = [mockPrototypeRow];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPrototypes, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.getByUserId(mockPrototypeRow.user_id);

      expect(supabase.from).toHaveBeenCalledWith('prototypes');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', mockPrototypeRow.user_id);
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toHaveLength(1);
      expect(result.error).toBeNull();
    });
  });

  describe('getLatestVersion', () => {
    it('should get latest version for a PRD', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrototypeRow, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.getLatestVersion(mockPrototypeRow.prd_id);

      expect(mockFrom.eq).toHaveBeenCalledWith('prd_id', mockPrototypeRow.prd_id);
      expect(mockFrom.order).toHaveBeenCalledWith('version', { ascending: false });
      expect(mockFrom.limit).toHaveBeenCalledWith(1);
      expect(result.data?.version).toBe(1);
      expect(result.error).toBeNull();
    });

    it('should return NOT_FOUND when no prototype exists', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.getLatestVersion('non-existent-prd');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('updateStatus', () => {
    it('should update prototype status successfully', async () => {
      const updatedPrototype = { ...mockPrototypeRow, status: 'failed' as const };

      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedPrototype, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.updateStatus(mockPrototypeRow.id, 'failed');

      expect(supabase.from).toHaveBeenCalledWith('prototypes');
      expect(mockFrom.update).toHaveBeenCalledWith({ status: 'failed' });
      expect(mockFrom.eq).toHaveBeenCalledWith('id', mockPrototypeRow.id);
      expect(result.data?.status).toBe('failed');
      expect(result.error).toBeNull();
    });
  });

  describe('update', () => {
    it('should update prototype with all fields', async () => {
      const updates = {
        url: 'https://new-url.com',
        code: 'const New = () => <div>New</div>',
        status: 'ready' as const,
      };
      const updatedPrototype = { ...mockPrototypeRow, ...updates };

      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedPrototype, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.update(mockPrototypeRow.id, updates);

      expect(mockFrom.update).toHaveBeenCalledWith(updates);
      expect(result.data?.url).toBe(updates.url);
      expect(result.error).toBeNull();
    });

    it('should update prototype with partial fields', async () => {
      const updates = { status: 'ready' as const };
      const updatedPrototype = { ...mockPrototypeRow, status: 'ready' as const };

      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedPrototype, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prototypeService.update(mockPrototypeRow.id, updates);

      expect(mockFrom.update).toHaveBeenCalledWith({ status: 'ready' });
      expect(result.data?.status).toBe('ready');
      expect(result.error).toBeNull();
    });
  });

  describe('createVersion', () => {
    it('should create new version with incremented number', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as never);

      const existingVersion = { version: 2 };
      const newVersionRow = { ...mockPrototypeRow, version: 3, refinement_prompt: 'Make it better' };

      // Mock getting existing version
      const mockSelectVersion = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: existingVersion, error: null }),
      };

      // Mock inserting new version
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newVersionRow, error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockSelectVersion as never)
        .mockReturnValueOnce(mockInsert as never);

      const input = {
        prdId: mockPrototypeRow.prd_id,
        ideaId: mockPrototypeRow.idea_id,
        refinementPrompt: 'Make it better',
      };

      const result = await prototypeService.createVersion(input);

      expect(mockInsert.insert).toHaveBeenCalledWith({
        prd_id: input.prdId,
        idea_id: input.ideaId,
        user_id: 'user-123',
        url: null,
        code: null,
        refinement_prompt: input.refinementPrompt,
        status: 'generating',
        version: 3,
      });
      expect(result.data?.version).toBe(3);
      expect(result.error).toBeNull();
    });

    it('should create version 1 when no existing versions', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as never);

      // Mock no existing versions
      const mockSelectVersion = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      };

      const newVersionRow = { ...mockPrototypeRow, version: 1 };
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newVersionRow, error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockSelectVersion as never)
        .mockReturnValueOnce(mockInsert as never);

      const input = {
        prdId: mockPrototypeRow.prd_id,
        ideaId: mockPrototypeRow.idea_id,
        refinementPrompt: 'First version',
      };

      const result = await prototypeService.createVersion(input);

      expect(result.data?.version).toBe(1);
      expect(result.error).toBeNull();
    });

    it('should return error when not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      } as never);

      const result = await prototypeService.createVersion({
        prdId: mockPrototypeRow.prd_id,
        ideaId: mockPrototypeRow.idea_id,
        refinementPrompt: 'Test',
      });

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('AUTH_ERROR');
    });
  });
});
