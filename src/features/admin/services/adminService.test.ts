// src/features/admin/services/adminService.test.ts
// Task 4 Tests - Story 5.1

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './adminService';

// Mock the supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}));

// Import the mocked module
import { supabase } from '../../../lib/supabase';

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Subtask 4.2: getMetrics() - Query ideas table grouped by status', () => {
    it('should return metrics with counts for each status', async () => {
      // Mock data: array of ideas with different statuses
      const mockIdeas = [
        { id: '1', status: 'submitted' },
        { id: '2', status: 'submitted' },
        { id: '3', status: 'submitted' },
        { id: '4', status: 'approved' },
        { id: '5', status: 'approved' },
        { id: '6', status: 'prd_development' },
        { id: '7', status: 'prototype_complete' },
        { id: '8', status: 'rejected' },
      ];

      const mockFrom = {
        select: vi.fn().mockResolvedValue({ data: mockIdeas, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await adminService.getMetrics();

      expect(supabase.from).toHaveBeenCalledWith('ideas');
      expect(mockFrom.select).toHaveBeenCalledWith('status');
      expect(result.data).toEqual({
        submitted: 3,
        approved: 2,
        prd_development: 1,
        prototype_complete: 1,
        rejected: 1,
      });
      expect(result.error).toBeNull();
    });

    it('should return zero counts when no ideas exist', async () => {
      const mockFrom = {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await adminService.getMetrics();

      expect(result.data).toEqual({
        submitted: 0,
        approved: 0,
        prd_development: 0,
        prototype_complete: 0,
        rejected: 0,
      });
      expect(result.error).toBeNull();
    });

    it('should return zero counts when data is null', async () => {
      const mockFrom = {
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await adminService.getMetrics();

      expect(result.data).toEqual({
        submitted: 0,
        approved: 0,
        prd_development: 0,
        prototype_complete: 0,
        rejected: 0,
      });
      expect(result.error).toBeNull();
    });
  });

  describe('Subtask 4.4: Return counts for each status enum value', () => {
    it('should include all status enum values in result', async () => {
      const mockFrom = {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await adminService.getMetrics();

      expect(result.data).toHaveProperty('submitted');
      expect(result.data).toHaveProperty('approved');
      expect(result.data).toHaveProperty('prd_development');
      expect(result.data).toHaveProperty('prototype_complete');
      expect(result.data).toHaveProperty('rejected');
    });

    it('should correctly count mixed statuses', async () => {
      const mockIdeas = [
        { status: 'submitted' },
        { status: 'prd_development' },
        { status: 'submitted' },
        { status: 'prototype_complete' },
        { status: 'approved' },
        { status: 'approved' },
        { status: 'approved' },
      ];

      const mockFrom = {
        select: vi.fn().mockResolvedValue({ data: mockIdeas, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await adminService.getMetrics();

      expect(result.data?.submitted).toBe(2);
      expect(result.data?.approved).toBe(3);
      expect(result.data?.prd_development).toBe(1);
      expect(result.data?.prototype_complete).toBe(1);
      expect(result.data?.rejected).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should return error on database failure', async () => {
      const mockFrom = {
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed', code: 'DB_ERROR' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await adminService.getMetrics();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Database connection failed',
        code: 'DB_ERROR',
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      const mockFrom = {
        select: vi.fn().mockRejectedValue(new Error('Unexpected error')),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await adminService.getMetrics();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Failed to fetch metrics');
      expect(result.error?.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('Subtask 4.3: RLS policy enforcement (admin-only access)', () => {
    it('should query all ideas (RLS enforces admin access at database level)', async () => {
      const mockFrom = {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      await adminService.getMetrics();

      // Should query from 'ideas' table without user filtering
      // RLS policy at database level will enforce admin-only access
      expect(supabase.from).toHaveBeenCalledWith('ideas');
      expect(mockFrom.select).toHaveBeenCalledWith('status');
    });
  });

  describe('approveIdea() - Task 1: Approve idea for PRD development', () => {
    describe('Subtask 1.1-1.4: Update idea status to approved with timestamp', () => {
      it('should approve a submitted idea and update status_updated_at', async () => {
        const ideaId = 'idea-123';
        const mockApprovedIdea = {
          id: ideaId,
          user_id: 'user-456',
          title: 'Test Idea',
          problem: 'Test problem',
          solution: 'Test solution',
          impact: 'Test impact',
          status: 'approved',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-27T10:00:00Z',
          status_updated_at: '2026-01-27T10:00:00Z',
        };

        const mockUpdate = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockSelect = vi.fn().mockReturnThis();
        const mockSingle = vi.fn().mockResolvedValue({ data: mockApprovedIdea, error: null });

        const mockFrom = {
          update: mockUpdate,
          eq: mockEq,
          select: mockSelect,
          single: mockSingle,
        };

        vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

        const result = await adminService.approveIdea(ideaId);

        expect(supabase.from).toHaveBeenCalledWith('ideas');
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'approved',
            status_updated_at: expect.any(String),
          })
        );
        expect(mockEq).toHaveBeenCalledWith('id', ideaId);
        expect(mockEq).toHaveBeenCalledWith('status', 'submitted');
        expect(mockSelect).toHaveBeenCalled();
        expect(mockSingle).toHaveBeenCalled();
        expect(result.data).toEqual(mockApprovedIdea);
        expect(result.error).toBeNull();
      });

      it('should return updated idea with approved status', async () => {
        const ideaId = 'idea-789';
        const mockApprovedIdea = {
          id: ideaId,
          status: 'approved',
          status_updated_at: new Date().toISOString(),
        };

        const mockChain = {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockApprovedIdea, error: null }),
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as never);

        const result = await adminService.approveIdea(ideaId);

        expect(result.data?.status).toBe('approved');
        expect(result.data?.status_updated_at).toBeDefined();
        expect(result.error).toBeNull();
      });
    });

    describe('Subtask 1.5: Handle database errors gracefully', () => {
      it('should return error when database update fails', async () => {
        const ideaId = 'idea-error';
        const mockChain = {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed', code: 'DB_ERROR' },
          }),
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as never);

        const result = await adminService.approveIdea(ideaId);

        expect(result.data).toBeNull();
        expect(result.error).toEqual({
          message: 'Database connection failed',
          code: 'DB_ERROR',
        });
      });

      it('should handle unexpected errors gracefully', async () => {
        const ideaId = 'idea-unexpected';
        const mockChain = {
          update: vi.fn().mockRejectedValue(new Error('Unexpected error')),
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as never);

        const result = await adminService.approveIdea(ideaId);

        expect(result.data).toBeNull();
        expect(result.error?.message).toBe('Failed to approve idea');
        expect(result.error?.code).toBe('UNKNOWN_ERROR');
      });

      it('should handle case where idea is not in submitted status', async () => {
        const ideaId = 'idea-not-submitted';
        const mockChain = {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'No rows found', code: 'PGRST116' },
          }),
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as never);

        const result = await adminService.approveIdea(ideaId);

        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
      });
    });

    describe('Edge cases', () => {
      it('should only approve ideas with status=submitted', async () => {
        const ideaId = 'idea-check-status';
        const mockChain = {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: ideaId, status: 'approved' },
            error: null,
          }),
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as never);

        await adminService.approveIdea(ideaId);

        // Verify that eq was called with status='submitted' condition
        expect(mockChain.eq).toHaveBeenCalledWith('status', 'submitted');
      });

      it('should include current timestamp in status_updated_at', async () => {
        const ideaId = 'idea-timestamp';
        let capturedUpdate: any;
        
        const mockChain = {
          update: vi.fn().mockImplementation((data) => {
            capturedUpdate = data;
            return mockChain;
          }),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: ideaId, status: 'approved' },
            error: null,
          }),
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as never);

        const beforeTime = Date.now();
        await adminService.approveIdea(ideaId);
        const afterTime = Date.now();

        expect(capturedUpdate).toBeDefined();
        expect(capturedUpdate.status).toBe('approved');
        expect(capturedUpdate.status_updated_at).toBeDefined();
        
        // Convert ISO string to timestamp for comparison
        const timestamp = new Date(capturedUpdate.status_updated_at).getTime();
        expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(timestamp).toBeLessThanOrEqual(afterTime);
      });
    });
  });
});
