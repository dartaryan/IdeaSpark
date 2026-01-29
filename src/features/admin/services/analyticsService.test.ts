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
    rpc: vi.fn(), // Task 10: Add RPC mock for getIdeasBreakdown tests
  },
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create a mock query builder with proper chaining
  function createMockQueryBuilder(data: any, error: any = null) {
    // Create a promise-like object that also has query methods
    const mockResult = Promise.resolve({ data, error });
    
    const mockBuilder: any = {
      ...mockResult,
      select: vi.fn(),
      gte: vi.fn(),
      lt: vi.fn(),
      then: mockResult.then.bind(mockResult),
      catch: mockResult.catch.bind(mockResult),
      finally: mockResult.finally.bind(mockResult),
    };
    
    // .select() returns an object that can be awaited OR chained
    const selectResult: any = {
      ...mockResult,
      gte: vi.fn(),
      lt: vi.fn(),
      then: mockResult.then.bind(mockResult),
      catch: mockResult.catch.bind(mockResult),
      finally: mockResult.finally.bind(mockResult),
    };
    
    // .gte() returns an object with .lt()
    const gteResult: any = {
      ...mockResult,
      lt: vi.fn().mockReturnValue(mockResult),
      then: mockResult.then.bind(mockResult),
      catch: mockResult.catch.bind(mockResult),
      finally: mockResult.finally.bind(mockResult),
    };
    
    selectResult.gte.mockReturnValue(gteResult);
    mockBuilder.select.mockReturnValue(selectResult);
    
    return mockBuilder;
  }

  describe('getAnalytics', () => {
    it('should return correct data structure', async () => {
      // Subtask 13.15: Test getAnalytics() returns correct data structure
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
        { id: '2', status: 'approved', created_at: '2026-01-03', updated_at: '2026-01-04' },
        { id: '3', status: 'prd_development', created_at: '2026-01-05', updated_at: '2026-01-06' },
        { id: '4', status: 'prototype_complete', created_at: '2026-01-07', updated_at: '2026-01-08' },
      ];

      const mockPreviousIdeas = [
        { id: '5', created_at: '2025-12-01' },
        { id: '6', created_at: '2025-12-15' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      // Mock two separate queries: current period and previous period
      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      const result = await analyticsService.getAnalytics();

      // Subtask 6.2: Verify ServiceResponse<AnalyticsData> structure
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.totalIdeas).toBe(4);
      expect(result.data?.previousPeriodTotal).toBe(2);
      expect(result.data?.trendPercentage).toBeDefined();
      expect(result.data?.pipelineBreakdown).toHaveLength(4);
      expect(result.data?.completionRate).toBeDefined();
      expect(result.data?.timeMetrics).toBeDefined();
      expect(result.data?.timestamp).toBeDefined();
      expect(result.data?.lastUpdated).toBeDefined();
    });

    it('should calculate total ideas count correctly', async () => {
      // Subtask 6.3: Test total ideas calculation
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
        { id: '2', status: 'approved', created_at: '2026-01-03', updated_at: '2026-01-04' },
        { id: '3', status: 'prd_development', created_at: '2026-01-05', updated_at: '2026-01-06' },
      ];

      const mockPreviousIdeas = [{ id: '4' }];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

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

      const mockPreviousIdeas = [{ id: '5' }];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

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

      const mockPreviousIdeas = [{ id: '6' }];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

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

      const mockPreviousIdeas: any[] = [];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      const result = await analyticsService.getAnalytics();

      expect(result.data?.timeMetrics).toBeDefined();
      expect(result.data?.timeMetrics.avgTimeToApproval).toBeDefined();
      expect(result.data?.timeMetrics.avgTimeToPRD).toBeDefined();
      expect(result.data?.timeMetrics.avgTimeToPrototype).toBeDefined();
    });

    // Story 6.2 Task 10: Tests for trend calculation
    it('should calculate positive trend correctly', async () => {
      // Subtask 10.3: Test positive trend calculation
      const now = new Date('2026-01-29');
      const thirtyDaysAgo = new Date('2025-12-30');
      const sixtyDaysAgo = new Date('2025-11-30');

      // Current period (last 30 days): 5 ideas
      const mockCurrentIdeas = [
        { id: '1', status: 'submitted', created_at: thirtyDaysAgo.toISOString(), updated_at: now.toISOString() },
        { id: '2', status: 'submitted', created_at: new Date('2026-01-05').toISOString(), updated_at: now.toISOString() },
        { id: '3', status: 'submitted', created_at: new Date('2026-01-10').toISOString(), updated_at: now.toISOString() },
        { id: '4', status: 'submitted', created_at: new Date('2026-01-15').toISOString(), updated_at: now.toISOString() },
        { id: '5', status: 'submitted', created_at: new Date('2026-01-20').toISOString(), updated_at: now.toISOString() },
      ];

      // Previous period (30-60 days ago): 2 ideas
      const mockPreviousIdeas = [
        { id: '6', created_at: sixtyDaysAgo.toISOString() },
        { id: '7', created_at: new Date('2025-12-15').toISOString() },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockCurrentIdeas : mockPreviousIdeas);
      });

      const result = await analyticsService.getAnalytics();

      // Trend: ((5 - 2) / 2) * 100 = 150%
      expect(result.data?.totalIdeas).toBe(5);
      expect(result.data?.previousPeriodTotal).toBe(2);
      expect(result.data?.trendPercentage).toBe(150);
    });

    it('should calculate negative trend correctly', async () => {
      // Subtask 10.3: Test negative trend calculation
      const now = new Date('2026-01-29');
      const thirtyDaysAgo = new Date('2025-12-30');
      const sixtyDaysAgo = new Date('2025-11-30');

      // Current period (last 30 days): 2 ideas
      const mockCurrentIdeas = [
        { id: '1', status: 'submitted', created_at: thirtyDaysAgo.toISOString(), updated_at: now.toISOString() },
        { id: '2', status: 'submitted', created_at: new Date('2026-01-15').toISOString(), updated_at: now.toISOString() },
      ];

      // Previous period (30-60 days ago): 5 ideas
      const mockPreviousIdeas = [
        { id: '3', created_at: sixtyDaysAgo.toISOString() },
        { id: '4', created_at: new Date('2025-12-05').toISOString() },
        { id: '5', created_at: new Date('2025-12-10').toISOString() },
        { id: '6', created_at: new Date('2025-12-15').toISOString() },
        { id: '7', created_at: new Date('2025-12-20').toISOString() },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockCurrentIdeas : mockPreviousIdeas);
      });

      const result = await analyticsService.getAnalytics();

      // Trend: ((2 - 5) / 5) * 100 = -60%
      expect(result.data?.totalIdeas).toBe(2);
      expect(result.data?.previousPeriodTotal).toBe(5);
      expect(result.data?.trendPercentage).toBe(-60);
    });

    it('should handle zero previous period count edge case', async () => {
      // Subtask 10.5 & 1.9: Test edge case when previous period has zero ideas
      const now = new Date('2026-01-29');
      const thirtyDaysAgo = new Date('2025-12-30');

      // Current period (last 30 days): 3 ideas
      const mockCurrentIdeas = [
        { id: '1', status: 'submitted', created_at: thirtyDaysAgo.toISOString(), updated_at: now.toISOString() },
        { id: '2', status: 'submitted', created_at: new Date('2026-01-10').toISOString(), updated_at: now.toISOString() },
        { id: '3', status: 'submitted', created_at: new Date('2026-01-20').toISOString(), updated_at: now.toISOString() },
      ];

      // Previous period: 0 ideas
      const mockPreviousIdeas: any[] = [];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockCurrentIdeas : mockPreviousIdeas);
      });

      const result = await analyticsService.getAnalytics();

      expect(result.data?.totalIdeas).toBe(3);
      expect(result.data?.previousPeriodTotal).toBe(0);
      // When previous period is 0, trend should be 100% (or special handling)
      expect(result.data?.trendPercentage).toBe(100);
    });

    it('should handle date range filtering', async () => {
      // Subtask 1.3 & 10.4: Test date range filter affects totalIdeas
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-02' },
        { id: '2', status: 'submitted', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-16' },
        { id: '3', status: 'submitted', created_at: '2026-01-25T00:00:00Z', updated_at: '2026-01-26' },
        { id: '4', status: 'submitted', created_at: '2025-12-25T00:00:00Z', updated_at: '2025-12-26' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({
              data: mockIdeas.filter(idea => 
                idea.created_at >= '2026-01-01' && idea.created_at < '2026-02-01'
              ),
              error: null,
            }),
          }),
        }),
      } as any);

      const dateRange = { startDate: '2026-01-01', endDate: '2026-02-01' };
      const result = await analyticsService.getAnalytics(dateRange);

      // Should only count ideas in January 2026 (3 ideas)
      expect(result.data?.totalIdeas).toBe(3);
    });

    // Story 6.3 Task 1: Enhanced pipeline breakdown tests
    describe('enhanced pipeline breakdown', () => {
      it('should include display labels for each status', async () => {
        // Subtask 1.6: Test status label mapping
        const mockIdeas = [
          { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
          { id: '2', status: 'prd_development', created_at: '2026-01-03', updated_at: '2026-01-04' },
        ];

        const mockPreviousIdeas = [{ id: '3' }];

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        } as any);

        let queryCount = 0;
        vi.mocked(supabase.from).mockImplementation(() => {
          queryCount++;
          return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
        });

        const result = await analyticsService.getAnalytics();

        const submittedBreakdown = result.data?.pipelineBreakdown.find(b => b.status === 'submitted');
        expect(submittedBreakdown?.label).toBe('Submitted');

        const prdBreakdown = result.data?.pipelineBreakdown.find(b => b.status === 'prd_development');
        expect(prdBreakdown?.label).toBe('PRD Development');
      });

      it('should assign PassportCard theme colors to each status', async () => {
        // Subtask 1.7: Test color assignment
        const mockIdeas = [
          { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
          { id: '2', status: 'approved', created_at: '2026-01-02', updated_at: '2026-01-03' },
          { id: '3', status: 'prd_development', created_at: '2026-01-03', updated_at: '2026-01-04' },
          { id: '4', status: 'prototype_complete', created_at: '2026-01-04', updated_at: '2026-01-05' },
          { id: '5', status: 'rejected', created_at: '2026-01-05', updated_at: '2026-01-06' },
        ];

        const mockPreviousIdeas = [{ id: '6' }];

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        } as any);

        let queryCount = 0;
        vi.mocked(supabase.from).mockImplementation(() => {
          queryCount++;
          return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
        });

        const result = await analyticsService.getAnalytics();

        // Verify colors are assigned (hex codes)
        result.data?.pipelineBreakdown.forEach(breakdown => {
          expect(breakdown.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });

        // Verify specific colors per Dev Notes specification
        const submitted = result.data?.pipelineBreakdown.find(b => b.status === 'submitted');
        expect(submitted?.color).toBe('#94A3B8'); // Neutral gray

        const approved = result.data?.pipelineBreakdown.find(b => b.status === 'approved');
        expect(approved?.color).toBe('#0EA5E9'); // Sky blue

        const prdDev = result.data?.pipelineBreakdown.find(b => b.status === 'prd_development');
        expect(prdDev?.color).toBe('#F59E0B'); // Amber yellow

        const prototypeComplete = result.data?.pipelineBreakdown.find(b => b.status === 'prototype_complete');
        expect(prototypeComplete?.color).toBe('#10B981'); // Green

        const rejected = result.data?.pipelineBreakdown.find(b => b.status === 'rejected');
        expect(rejected?.color).toBe('#EF4444'); // Red
      });

      it('should sort breakdown by pipeline order', async () => {
        // Subtask 1.9: Test sorting order
        const mockIdeas = [
          { id: '1', status: 'rejected', created_at: '2026-01-01', updated_at: '2026-01-02' },
          { id: '2', status: 'submitted', created_at: '2026-01-02', updated_at: '2026-01-03' },
          { id: '3', status: 'prototype_complete', created_at: '2026-01-03', updated_at: '2026-01-04' },
          { id: '4', status: 'approved', created_at: '2026-01-04', updated_at: '2026-01-05' },
          { id: '5', status: 'prd_development', created_at: '2026-01-05', updated_at: '2026-01-06' },
        ];

        const mockPreviousIdeas = [{ id: '6' }];

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        } as any);

        let queryCount = 0;
        vi.mocked(supabase.from).mockImplementation(() => {
          queryCount++;
          return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
        });

        const result = await analyticsService.getAnalytics();

        // Expected order: submitted, approved, prd_development, prototype_complete, rejected
        expect(result.data?.pipelineBreakdown[0].status).toBe('submitted');
        expect(result.data?.pipelineBreakdown[1].status).toBe('approved');
        expect(result.data?.pipelineBreakdown[2].status).toBe('prd_development');
        expect(result.data?.pipelineBreakdown[3].status).toBe('prototype_complete');
        expect(result.data?.pipelineBreakdown[4].status).toBe('rejected');
      });

      it('should return empty array when no ideas exist', async () => {
        // Subtask 1.8: Test empty array handling
        const mockIdeas: any[] = [];
        const mockPreviousIdeas: any[] = [];

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        } as any);

        let queryCount = 0;
        vi.mocked(supabase.from).mockImplementation(() => {
          queryCount++;
          return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
        });

        const result = await analyticsService.getAnalytics();

        expect(result.data?.pipelineBreakdown).toEqual([]);
        expect(result.data?.totalIdeas).toBe(0);
      });

      it('should apply date range filter to pipeline breakdown', async () => {
        // Subtask 1.4: Test date range affects breakdown
        const mockIdeas = [
          { id: '1', status: 'submitted', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-16' },
          { id: '2', status: 'approved', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-21' },
        ];

        const mockPreviousIdeas = [{ id: '3' }];

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        } as any);

        vi.mocked(supabase.from).mockReturnValue({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lt: vi.fn().mockResolvedValue({
                data: mockIdeas,
                error: null,
              }),
            }),
          }),
        } as any);

        const dateRange = { startDate: '2026-01-01', endDate: '2026-02-01' };
        const result = await analyticsService.getAnalytics(dateRange);

        expect(result.data?.pipelineBreakdown).toHaveLength(2);
      });
    });
  });

  // Task 10: Tests for getIdeasBreakdown function
  describe('getIdeasBreakdown', () => {
    it('should return weekly breakdown of ideas', async () => {
      // Mock RPC call for breakdown
      const mockBreakdownData = [
        { period: 'Jan 01, 2026', count: 5, period_start: '2026-01-01T00:00:00Z' },
        { period: 'Jan 08, 2026', count: 8, period_start: '2026-01-08T00:00:00Z' },
        { period: 'Jan 15, 2026', count: 3, period_start: '2026-01-15T00:00:00Z' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as any },
        error: null,
      });

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockBreakdownData,
        error: null,
      });

      const dateRange = { startDate: '2026-01-01', endDate: '2026-02-01' };
      const result = await analyticsService.getIdeasBreakdown(dateRange);

      expect(result.data).toHaveLength(3);
      expect(result.data?.[0]).toEqual({ period: 'Jan 01, 2026', count: 5 });
      expect(result.data?.[1]).toEqual({ period: 'Jan 08, 2026', count: 8 });
      expect(result.data?.[2]).toEqual({ period: 'Jan 15, 2026', count: 3 });
      expect(result.error).toBeNull();
    });

    it('should use default date range when none provided', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as any },
        error: null,
      });

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      });

      await analyticsService.getIdeasBreakdown();

      // Verify RPC was called with date parameters
      expect(supabase.rpc).toHaveBeenCalledWith('get_ideas_breakdown', {
        start_date: expect.any(String),
        end_date: expect.any(String),
        interval_type: 'week',
      });
    });

    it('should return empty array when no ideas exist', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as any },
        error: null,
      });

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await analyticsService.getIdeasBreakdown();

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as any },
        error: null,
      });

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'DB_ERROR' } as any,
      });

      const result = await analyticsService.getIdeasBreakdown();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to fetch breakdown data',
        code: 'DB_ERROR',
      });
    });

    it('should apply date range filter to RPC call', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as any },
        error: null,
      });

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      });

      const dateRange = {
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-01-31T23:59:59.999Z',
      };

      await analyticsService.getIdeasBreakdown(dateRange);

      expect(supabase.rpc).toHaveBeenCalledWith('get_ideas_breakdown', {
        start_date: '2026-01-01T00:00:00.000Z',
        end_date: '2026-01-31T23:59:59.999Z',
        interval_type: 'week',
      });
    });

    it('should handle auth errors', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await analyticsService.getIdeasBreakdown();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'User not authenticated',
        code: 'AUTH_ERROR',
      });
    });

    it('should format breakdown data correctly', async () => {
      const mockBreakdownData = [
        { period: 'Dec 25, 2025', count: 10, period_start: '2025-12-25T00:00:00Z' },
        { period: 'Jan 01, 2026', count: 15, period_start: '2026-01-01T00:00:00Z' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as any },
        error: null,
      });

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockBreakdownData,
        error: null,
      });

      const result = await analyticsService.getIdeasBreakdown();

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].period).toBe('Dec 25, 2025');
      expect(result.data?.[0].count).toBe(10);
      expect(result.data?.[1].period).toBe('Jan 01, 2026');
      expect(result.data?.[1].count).toBe(15);
    });
  });

  // Story 6.4 Task 12: Comprehensive tests for completion rates
  describe('completion rates', () => {
    it('should return completion rates in analytics data', async () => {
      // Subtask 12.2: Test getAnalytics() returns completionRates correctly
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
        { id: '2', status: 'approved', created_at: '2026-01-03', updated_at: '2026-01-04' },
      ];

      const mockPreviousIdeas = [{ id: '3', created_at: '2025-12-01' }];

      const mockCurrentCounts = {
        submitted_count: 10,
        approved_count: 7,
        prd_complete_count: 5,
        prototype_count: 3,
      };

      const mockPreviousCounts = {
        submitted_count: 8,
        approved_count: 5,
        prd_complete_count: 3,
        prototype_count: 2,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      let rpcCount = 0;
      vi.mocked(supabase.rpc).mockImplementation(() => {
        rpcCount++;
        return Promise.resolve({
          data: rpcCount === 1 ? mockCurrentCounts : mockPreviousCounts,
          error: null,
        }) as any;
      });

      const result = await analyticsService.getAnalytics();

      expect(result.data?.completionRates).toBeDefined();
      expect(result.data?.completionRates?.submittedToApproved).toBeDefined();
      expect(result.data?.completionRates?.approvedToPrd).toBeDefined();
      expect(result.data?.completionRates?.prdToPrototype).toBeDefined();
      expect(result.data?.completionRates?.overallSubmittedToPrototype).toBeDefined();
    });

    it('should calculate conversion rates accurately', async () => {
      // Subtask 12.3: Test rate calculation accuracy
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
      ];

      const mockPreviousIdeas = [{ id: '2', created_at: '2025-12-01' }];

      const mockCurrentCounts = {
        submitted_count: 100,
        approved_count: 75,  // 75% approval rate
        prd_complete_count: 50,  // 66.7% of approved
        prototype_count: 25,  // 50% of PRD complete, 25% overall
      };

      const mockPreviousCounts = {
        submitted_count: 80,
        approved_count: 60,
        prd_complete_count: 40,
        prototype_count: 20,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      let rpcCount = 0;
      vi.mocked(supabase.rpc).mockImplementation(() => {
        rpcCount++;
        return Promise.resolve({
          data: rpcCount === 1 ? mockCurrentCounts : mockPreviousCounts,
          error: null,
        }) as any;
      });

      const result = await analyticsService.getAnalytics();

      // Submitted → Approved: 75/100 = 75%
      expect(result.data?.completionRates?.submittedToApproved.rate).toBe(75);
      expect(result.data?.completionRates?.submittedToApproved.count).toBe(75);
      expect(result.data?.completionRates?.submittedToApproved.totalCount).toBe(100);

      // Approved → PRD: 50/75 = 66.7%
      expect(result.data?.completionRates?.approvedToPrd.rate).toBe(66.7);
      expect(result.data?.completionRates?.approvedToPrd.count).toBe(50);
      expect(result.data?.completionRates?.approvedToPrd.totalCount).toBe(75);

      // PRD → Prototype: 25/50 = 50%
      expect(result.data?.completionRates?.prdToPrototype.rate).toBe(50);

      // Overall: 25/100 = 25%
      expect(result.data?.completionRates?.overallSubmittedToPrototype.rate).toBe(25);
    });

    it('should handle division by zero edge case', async () => {
      // Subtask 12.3: Test edge case when denominator = 0
      const mockIdeas: any[] = [];
      const mockPreviousIdeas: any[] = [];

      const mockCurrentCounts = {
        submitted_count: 0,
        approved_count: 0,
        prd_complete_count: 0,
        prototype_count: 0,
      };

      const mockPreviousCounts = {
        submitted_count: 0,
        approved_count: 0,
        prd_complete_count: 0,
        prototype_count: 0,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      let rpcCount = 0;
      vi.mocked(supabase.rpc).mockImplementation(() => {
        rpcCount++;
        return Promise.resolve({
          data: rpcCount === 1 ? mockCurrentCounts : mockPreviousCounts,
          error: null,
        }) as any;
      });

      const result = await analyticsService.getAnalytics();

      // All rates should be 0% when no ideas exist (not NaN or error)
      expect(result.data?.completionRates?.submittedToApproved.rate).toBe(0);
      expect(result.data?.completionRates?.approvedToPrd.rate).toBe(0);
      expect(result.data?.completionRates?.prdToPrototype.rate).toBe(0);
      expect(result.data?.completionRates?.overallSubmittedToPrototype.rate).toBe(0);
    });

    it('should calculate positive trend correctly', async () => {
      // Subtask 12.4: Test trend calculation for positive trends
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' }];
      const mockPreviousIdeas = [{ id: '2', created_at: '2025-12-01' }];

      const mockCurrentCounts = {
        submitted_count: 100,
        approved_count: 80,  // 80% approval rate
        prd_complete_count: 60,
        prototype_count: 40,
      };

      const mockPreviousCounts = {
        submitted_count: 100,
        approved_count: 70,  // 70% approval rate (previous)
        prd_complete_count: 50,
        prototype_count: 30,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      let rpcCount = 0;
      vi.mocked(supabase.rpc).mockImplementation(() => {
        rpcCount++;
        return Promise.resolve({
          data: rpcCount === 1 ? mockCurrentCounts : mockPreviousCounts,
          error: null,
        }) as any;
      });

      const result = await analyticsService.getAnalytics();

      // Trend: 80% - 70% = +10% change (direction: 'up')
      const trend = result.data?.completionRates?.submittedToApproved.trend;
      expect(trend?.direction).toBe('up');
      expect(trend?.change).toBe(10);
      expect(trend?.changePercentage).toBeGreaterThan(0);
    });

    it('should calculate negative trend correctly', async () => {
      // Subtask 12.4: Test trend calculation for negative trends
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' }];
      const mockPreviousIdeas = [{ id: '2', created_at: '2025-12-01' }];

      const mockCurrentCounts = {
        submitted_count: 100,
        approved_count: 60,  // 60% approval rate
        prd_complete_count: 40,
        prototype_count: 20,
      };

      const mockPreviousCounts = {
        submitted_count: 100,
        approved_count: 75,  // 75% approval rate (previous)
        prd_complete_count: 55,
        prototype_count: 35,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      let rpcCount = 0;
      vi.mocked(supabase.rpc).mockImplementation(() => {
        rpcCount++;
        return Promise.resolve({
          data: rpcCount === 1 ? mockCurrentCounts : mockPreviousCounts,
          error: null,
        }) as any;
      });

      const result = await analyticsService.getAnalytics();

      // Trend: 60% - 75% = -15% change (direction: 'down')
      const trend = result.data?.completionRates?.submittedToApproved.trend;
      expect(trend?.direction).toBe('down');
      expect(trend?.change).toBe(-15);
      expect(trend?.changePercentage).toBeLessThan(0);
    });

    it('should calculate neutral trend correctly', async () => {
      // Subtask 12.4: Test trend calculation for neutral trends
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' }];
      const mockPreviousIdeas = [{ id: '2', created_at: '2025-12-01' }];

      const mockCurrentCounts = {
        submitted_count: 100,
        approved_count: 71,  // 71% approval rate
        prd_complete_count: 50,
        prototype_count: 25,
      };

      const mockPreviousCounts = {
        submitted_count: 100,
        approved_count: 70,  // 70% approval rate (previous) - only 1% change
        prd_complete_count: 50,
        prototype_count: 25,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      let rpcCount = 0;
      vi.mocked(supabase.rpc).mockImplementation(() => {
        rpcCount++;
        return Promise.resolve({
          data: rpcCount === 1 ? mockCurrentCounts : mockPreviousCounts,
          error: null,
        }) as any;
      });

      const result = await analyticsService.getAnalytics();

      // Trend: 71% - 70% = +1% change (direction: 'neutral', <2% threshold)
      const trend = result.data?.completionRates?.submittedToApproved.trend;
      expect(trend?.direction).toBe('neutral');
      expect(Math.abs(trend?.change || 0)).toBeLessThan(2);
    });

    it('should apply date range filter to completion rates data', async () => {
      // Subtask 12.5: Test date range filter affects completion rates
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-15', updated_at: '2026-01-16' }];
      const mockPreviousIdeas: any[] = [];

      const mockCurrentCounts = {
        submitted_count: 50,
        approved_count: 40,
        prd_complete_count: 30,
        prototype_count: 20,
      };

      const mockPreviousCounts = {
        submitted_count: 0,
        approved_count: 0,
        prd_complete_count: 0,
        prototype_count: 0,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({
              data: mockIdeas,
              error: null,
            }),
          }),
        }),
      } as any);

      let rpcCount = 0;
      vi.mocked(supabase.rpc).mockImplementation((fnName, params) => {
        rpcCount++;
        // Verify RPC is called with correct date range
        expect(params).toHaveProperty('start_date');
        expect(params).toHaveProperty('end_date');
        
        return Promise.resolve({
          data: rpcCount === 1 ? mockCurrentCounts : mockPreviousCounts,
          error: null,
        }) as any;
      });

      const dateRange = { startDate: '2026-01-01', endDate: '2026-02-01' };
      const result = await analyticsService.getAnalytics(dateRange);

      expect(result.data?.completionRates).toBeDefined();
      expect(supabase.rpc).toHaveBeenCalled();
    });

    it('should handle completion rates query failure gracefully', async () => {
      // Subtask 12.3 & 1.13: Test error handling
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' }];
      const mockPreviousIdeas: any[] = [];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      // Mock RPC to return error
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'RPC function error', code: 'DB_ERROR' } as any,
      });

      const result = await analyticsService.getAnalytics();

      // Should still return analytics data with default completion rates (0%)
      expect(result.data).toBeDefined();
      expect(result.data?.completionRates?.submittedToApproved.rate).toBe(0);
      expect(result.data?.completionRates?.approvedToPrd.rate).toBe(0);
      expect(result.data?.completionRates?.prdToPrototype.rate).toBe(0);
      expect(result.data?.completionRates?.overallSubmittedToPrototype.rate).toBe(0);
    });
  });
});
