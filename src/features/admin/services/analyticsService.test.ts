// src/features/admin/services/analyticsService.test.ts
// Task 13: Comprehensive unit tests for analyticsService
// Subtask 13.14: Create analyticsService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from './analyticsService';
import { supabase } from '../../../lib/supabase';

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAnalytics', () => {
    it('should return correct data structure', async () => {
      // Subtask 13.15: Test getAnalytics() returns correct data structure
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
        { id: '2', status: 'approved', created_at: '2026-01-03', updated_at: '2026-01-04' },
        { id: '3', status: 'prd_development', created_at: '2026-01-05', updated_at: '2026-01-06' },
        { id: '4', status: 'prototype_complete', created_at: '2026-01-07', updated_at: '2026-01-08' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockIdeas,
          error: null,
        }),
      } as any);

      const result = await analyticsService.getAnalytics();

      // Subtask 6.2: Verify ServiceResponse<AnalyticsData> structure
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.totalIdeas).toBe(4);
      expect(result.data?.pipelineBreakdown).toHaveLength(4);
      expect(result.data?.completionRate).toBeDefined();
      expect(result.data?.timeMetrics).toBeDefined();
      expect(result.data?.timestamp).toBeDefined();
    });

    it('should calculate total ideas count correctly', async () => {
      // Subtask 6.3: Test total ideas calculation
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
        { id: '2', status: 'approved', created_at: '2026-01-03', updated_at: '2026-01-04' },
        { id: '3', status: 'prd_development', created_at: '2026-01-05', updated_at: '2026-01-06' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockIdeas,
          error: null,
        }),
      } as any);

      const result = await analyticsService.getAnalytics();

      expect(result.data?.totalIdeas).toBe(3);
    });

    it('should calculate pipeline breakdown correctly', async () => {
      // Subtask 6.4: Test pipeline breakdown calculation
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
        { id: '2', status: 'submitted', created_at: '2026-01-02', updated_at: '2026-01-03' },
        { id: '3', status: 'approved', created_at: '2026-01-03', updated_at: '2026-01-04' },
        { id: '4', status: 'prototype_complete', created_at: '2026-01-04', updated_at: '2026-01-05' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockIdeas,
          error: null,
        }),
      } as any);

      const result = await analyticsService.getAnalytics();

      expect(result.data?.pipelineBreakdown).toHaveLength(3);
      
      const submittedBreakdown = result.data?.pipelineBreakdown.find(b => b.status === 'submitted');
      expect(submittedBreakdown?.count).toBe(2);
      expect(submittedBreakdown?.percentage).toBe(50);
    });

    it('should calculate completion rate correctly', async () => {
      // Subtask 6.5: Test completion rate calculation
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
        { id: '2', status: 'submitted', created_at: '2026-01-02', updated_at: '2026-01-03' },
        { id: '3', status: 'approved', created_at: '2026-01-03', updated_at: '2026-01-04' },
        { id: '4', status: 'prototype_complete', created_at: '2026-01-04', updated_at: '2026-01-05' },
        { id: '5', status: 'prototype_complete', created_at: '2026-01-05', updated_at: '2026-01-06' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockIdeas,
          error: null,
        }),
      } as any);

      const result = await analyticsService.getAnalytics();

      // 2 out of 5 = 40%
      expect(result.data?.completionRate).toBe(40);
    });

    it('should handle database errors', async () => {
      // Subtask 13.16: Test service handles database errors
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error', code: '500' },
        }),
      } as any);

      const result = await analyticsService.getAnalytics();

      // Subtask 6.8: Verify error handling with user-friendly messages
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Failed to fetch analytics data');
    });

    it('should verify user authentication before fetching', async () => {
      // Subtask 6.9: Test admin role verification
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await analyticsService.getAnalytics();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('User not authenticated');
    });

    it('should return time metrics', async () => {
      // Subtask 6.6: Verify time metrics are included
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockIdeas,
          error: null,
        }),
      } as any);

      const result = await analyticsService.getAnalytics();

      expect(result.data?.timeMetrics).toBeDefined();
      expect(result.data?.timeMetrics.avgTimeToApproval).toBeDefined();
      expect(result.data?.timeMetrics.avgTimeToPRD).toBeDefined();
      expect(result.data?.timeMetrics.avgTimeToPrototype).toBeDefined();
    });
  });
});
