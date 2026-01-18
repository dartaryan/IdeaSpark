import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ideaService } from './ideaService';

// Mock the supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Import the mocked module
import { supabase } from '../../../lib/supabase';

const mockIdea = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: 'user-123',
  title: 'Test Idea',
  problem: 'Test problem description',
  solution: 'Test solution description',
  impact: 'Test impact description',
  enhanced_problem: null,
  enhanced_solution: null,
  enhanced_impact: null,
  status: 'submitted' as const,
  created_at: '2026-01-18T10:00:00Z',
  updated_at: '2026-01-18T10:00:00Z',
};

describe('ideaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getIdeas', () => {
    it('should return ideas on success', async () => {
      const mockData = [mockIdea];
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.getIdeas();

      expect(supabase.from).toHaveBeenCalledWith('ideas');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should return empty array when no ideas exist', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.getIdeas();

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should return error on database failure', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.getIdeas();

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DB_ERROR');
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await ideaService.getIdeas();

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('getIdeaById', () => {
    it('should return idea on success', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockIdea, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.getIdeaById(mockIdea.id);

      expect(supabase.from).toHaveBeenCalledWith('ideas');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', mockIdea.id);
      expect(result.data).toEqual(mockIdea);
      expect(result.error).toBeNull();
    });

    it('should return NOT_FOUND error when idea does not exist', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.getIdeaById('nonexistent-id');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('Idea not found');
    });

    it('should return DB_ERROR on other database errors', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'OTHER', message: 'Some error' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.getIdeaById(mockIdea.id);

      expect(result.error?.code).toBe('DB_ERROR');
    });
  });

  describe('createIdea', () => {
    const createInput = {
      title: 'New Idea',
      problem: 'Problem statement',
      solution: 'Solution description',
      impact: 'Impact assessment',
    };

    it('should create idea with correct user_id', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as never);

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockIdea, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.createIdea(createInput);

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(mockFrom.insert).toHaveBeenCalledWith({
        ...createInput,
        user_id: mockUser.id,
      });
      expect(result.data).toEqual(mockIdea);
      expect(result.error).toBeNull();
    });

    it('should return AUTH_REQUIRED when user is not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as never);

      const result = await ideaService.createIdea(createInput);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('AUTH_REQUIRED');
      expect(result.error?.message).toBe('Not authenticated');
    });

    it('should return DB_ERROR on database failure', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as never);

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.createIdea(createInput);

      expect(result.error?.code).toBe('DB_ERROR');
    });
  });

  describe('updateIdea', () => {
    const updateInput = {
      title: 'Updated Title',
    };

    it('should update idea successfully', async () => {
      const updatedIdea = { ...mockIdea, title: 'Updated Title' };
      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedIdea, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.updateIdea(mockIdea.id, updateInput);

      expect(mockFrom.update).toHaveBeenCalledWith(updateInput);
      expect(mockFrom.eq).toHaveBeenCalledWith('id', mockIdea.id);
      expect(result.data?.title).toBe('Updated Title');
      expect(result.error).toBeNull();
    });

    it('should return NOT_FOUND when idea does not exist', async () => {
      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.updateIdea('nonexistent-id', updateInput);

      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('Idea not found or not authorized');
    });
  });

  describe('deleteIdea', () => {
    it('should delete idea successfully', async () => {
      const mockFrom = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.deleteIdea(mockIdea.id);

      expect(supabase.from).toHaveBeenCalledWith('ideas');
      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('id', mockIdea.id);
      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should return DB_ERROR on database failure', async () => {
      const mockFrom = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.deleteIdea(mockIdea.id);

      expect(result.error?.code).toBe('DB_ERROR');
    });
  });

  describe('getAllIdeas (admin)', () => {
    it('should return all ideas for admin', async () => {
      const mockData = [mockIdea, { ...mockIdea, id: 'another-id', user_id: 'other-user' }];
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.getAllIdeas();

      expect(result.data).toEqual(mockData);
      expect(result.data?.length).toBe(2);
      expect(result.error).toBeNull();
    });
  });

  describe('getIdeasByStatus', () => {
    it('should return ideas filtered by status', async () => {
      const mockData = [mockIdea];
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.getIdeasByStatus('submitted');

      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'submitted');
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should return empty array when no ideas match status', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.getIdeasByStatus('approved');

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  describe('updateIdeaStatus (admin)', () => {
    it('should update idea status', async () => {
      const updatedIdea = { ...mockIdea, status: 'approved' as const };
      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedIdea, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await ideaService.updateIdeaStatus(mockIdea.id, 'approved');

      expect(mockFrom.update).toHaveBeenCalledWith({ status: 'approved' });
      expect(result.data?.status).toBe('approved');
      expect(result.error).toBeNull();
    });
  });
});
