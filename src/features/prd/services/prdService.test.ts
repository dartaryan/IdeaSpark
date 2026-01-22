import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prdService } from './prdService';
import type { PrdContent } from '../../../types/database';

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

const mockPrdContent: PrdContent = {
  problemStatement: { content: 'Test problem', status: 'complete' },
  goalsAndMetrics: { content: '', status: 'empty' },
  userStories: { content: '', status: 'empty' },
  requirements: { content: '', status: 'empty' },
  technicalConsiderations: { content: '', status: 'empty' },
  risks: { content: '', status: 'empty' },
  timeline: { content: '', status: 'empty' },
};

const mockPrd = {
  id: 'prd-123',
  idea_id: 'idea-123',
  user_id: 'user-123',
  content: mockPrdContent,
  status: 'draft' as const,
  created_at: '2026-01-22T10:00:00Z',
  updated_at: '2026-01-22T10:00:00Z',
};

describe('prdService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPrdByIdeaId', () => {
    it('should return PRD when it exists', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrd, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.getPrdByIdeaId('idea-123');

      expect(supabase.from).toHaveBeenCalledWith('prd_documents');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('idea_id', 'idea-123');
      expect(result.data).toEqual(mockPrd);
      expect(result.error).toBeNull();
    });

    it('should return null when PRD does not exist (PGRST116)', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.getPrdByIdeaId('idea-123');

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should return error on database failure', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error', code: 'DB_ERROR' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.getPrdByIdeaId('idea-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DB_ERROR');
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await prdService.getPrdByIdeaId('idea-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('getPrdById', () => {
    it('should return PRD when it exists', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrd, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.getPrdById('prd-123');

      expect(supabase.from).toHaveBeenCalledWith('prd_documents');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'prd-123');
      expect(result.data).toEqual(mockPrd);
      expect(result.error).toBeNull();
    });

    it('should return null when PRD not found', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.getPrdById('prd-123');

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('createPrd', () => {
    it('should create PRD with correct user_id and idea_id', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as never);

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrd, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.createPrd('idea-123');

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(mockFrom.insert).toHaveBeenCalledWith({
        idea_id: 'idea-123',
        user_id: 'user-123',
        content: expect.objectContaining({
          problemStatement: { content: '', status: 'empty' },
          goalsAndMetrics: { content: '', status: 'empty' },
        }),
      });
      expect(result.data).toEqual(mockPrd);
      expect(result.error).toBeNull();
    });

    it('should return error when not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as never);

      const result = await prdService.createPrd('idea-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('AUTH_REQUIRED');
    });

    it('should handle duplicate PRD error (23505)', async () => {
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
          error: { code: '23505', message: 'Duplicate key' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.createPrd('idea-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DUPLICATE');
    });

    it('should initialize empty PRD content structure', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as never);

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrd, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      await prdService.createPrd('idea-123');

      expect(mockFrom.insert).toHaveBeenCalledWith({
        idea_id: 'idea-123',
        user_id: 'user-123',
        content: {
          problemStatement: { content: '', status: 'empty' },
          goalsAndMetrics: { content: '', status: 'empty' },
          userStories: { content: '', status: 'empty' },
          requirements: { content: '', status: 'empty' },
          technicalConsiderations: { content: '', status: 'empty' },
          risks: { content: '', status: 'empty' },
          timeline: { content: '', status: 'empty' },
        },
      });
    });
  });

  describe('updatePrd', () => {
    it('should update PRD content correctly', async () => {
      const updatedContent: PrdContent = {
        ...mockPrdContent,
        problemStatement: { content: 'Updated problem', status: 'complete' },
      };
      const updatedPrd = { ...mockPrd, content: updatedContent };

      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedPrd, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.updatePrd('prd-123', { content: updatedContent });

      expect(mockFrom.update).toHaveBeenCalledWith({ content: updatedContent });
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'prd-123');
      expect(result.data).toEqual(updatedPrd);
      expect(result.error).toBeNull();
    });

    it('should return error when PRD not found', async () => {
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

      const result = await prdService.updatePrd('prd-123', { status: 'complete' });

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('updatePrdSection', () => {
    it('should update single section correctly', async () => {
      // Mock getPrdById (select query)
      const mockSelectFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { content: mockPrdContent }, error: null }),
      };

      // Mock updatePrd (update query)
      const mockUpdateFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrd, error: null }),
      };

      // Return different mocks for select and update
      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        return (callCount === 1 ? mockSelectFrom : mockUpdateFrom) as never;
      });

      const result = await prdService.updatePrdSection(
        'prd-123',
        'problemStatement',
        { content: 'New problem', status: 'complete' }
      );

      expect(mockSelectFrom.select).toHaveBeenCalledWith('content');
      expect(mockSelectFrom.eq).toHaveBeenCalledWith('id', 'prd-123');
      expect(mockUpdateFrom.update).toHaveBeenCalledWith({
        content: expect.objectContaining({
          problemStatement: { content: 'New problem', status: 'complete' },
        }),
      });
      expect(result.error).toBeNull();
    });

    it('should merge section update with existing content', async () => {
      const existingContent: PrdContent = {
        problemStatement: { content: 'Old problem', status: 'complete' },
        goalsAndMetrics: { content: 'Goals content', status: 'complete' },
        userStories: { content: '', status: 'empty' },
        requirements: { content: '', status: 'empty' },
        technicalConsiderations: { content: '', status: 'empty' },
        risks: { content: '', status: 'empty' },
        timeline: { content: '', status: 'empty' },
      };

      const mockSelectFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { content: existingContent }, error: null }),
      };

      const mockUpdateFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrd, error: null }),
      };

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        return (callCount === 1 ? mockSelectFrom : mockUpdateFrom) as never;
      });

      await prdService.updatePrdSection(
        'prd-123',
        'userStories',
        { content: 'User story content', status: 'in_progress' }
      );

      expect(mockUpdateFrom.update).toHaveBeenCalledWith({
        content: {
          ...existingContent,
          userStories: { content: 'User story content', status: 'in_progress' },
        },
      });
    });
  });

  describe('updatePrdStatus', () => {
    it('should update PRD status correctly', async () => {
      const completedPrd = { ...mockPrd, status: 'complete' as const };

      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: completedPrd, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.updatePrdStatus('prd-123', 'complete');

      expect(mockFrom.update).toHaveBeenCalledWith({ status: 'complete' });
      expect(result.data?.status).toBe('complete');
      expect(result.error).toBeNull();
    });

    it('should transition from complete back to draft', async () => {
      const draftPrd = { ...mockPrd, status: 'draft' as const };

      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: draftPrd, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.updatePrdStatus('prd-123', 'draft');

      expect(mockFrom.update).toHaveBeenCalledWith({ status: 'draft' });
      expect(result.data?.status).toBe('draft');
      expect(result.error).toBeNull();
    });
  });

  describe('deletePrd', () => {
    it('should delete PRD successfully', async () => {
      const mockFrom = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.deletePrd('prd-123');

      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'prd-123');
      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should return error on delete failure', async () => {
      const mockFrom = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Delete failed' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.deletePrd('prd-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DB_ERROR');
    });
  });

  describe('getAllPrds (admin)', () => {
    it('should return all PRDs ordered by created_at', async () => {
      const mockPrds = [mockPrd, { ...mockPrd, id: 'prd-456' }];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPrds, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.getAllPrds();

      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toEqual(mockPrds);
      expect(result.error).toBeNull();
    });

    it('should return empty array when no PRDs exist', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.getAllPrds();

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  describe('getPrdsByStatus (admin)', () => {
    it('should filter PRDs by status', async () => {
      const completePrds = [{ ...mockPrd, status: 'complete' as const }];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: completePrds, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.getPrdsByStatus('complete');

      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'complete');
      expect(result.data).toEqual(completePrds);
      expect(result.error).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle invalid inputs gracefully', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid UUID', code: 'INVALID_INPUT' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdService.getPrdById('invalid-id');

      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
    });
  });
});
