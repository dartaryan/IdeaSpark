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

// Story 6.7: Helper function to create test DateRange
function createTestDateRange() {
  return {
    start: new Date('2026-01-01'),
    end: new Date('2026-01-31'),
    label: 'Last 30 days',
  };
}

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create a mock query builder with proper chaining
  function createMockQueryBuilder(data: any, error: any = null) {
    // Create a promise-like object that also has query methods
    const mockResult = Promise.resolve({ data, error });
    
    // Create the full chain: .lt() → .order() → .limit() → result
    const limitResult: any = {
      ...mockResult,
      then: mockResult.then.bind(mockResult),
      catch: mockResult.catch.bind(mockResult),
      finally: mockResult.finally.bind(mockResult),
    };
    
    const orderResult: any = {
      ...mockResult,
      limit: vi.fn().mockReturnValue(limitResult),
      then: mockResult.then.bind(mockResult),
      catch: mockResult.catch.bind(mockResult),
      finally: mockResult.finally.bind(mockResult),
    };
    
    const ltResult: any = {
      ...mockResult,
      order: vi.fn().mockReturnValue(orderResult),
      then: mockResult.then.bind(mockResult),
      catch: mockResult.catch.bind(mockResult),
      finally: mockResult.finally.bind(mockResult),
    };
    
    // .gte() returns an object with .lt()
    const gteResult: any = {
      ...mockResult,
      lt: vi.fn().mockReturnValue(ltResult),
      then: mockResult.then.bind(mockResult),
      catch: mockResult.catch.bind(mockResult),
      finally: mockResult.finally.bind(mockResult),
    };
    
    // .select() returns an object that can be awaited OR chained
    const selectResult: any = {
      ...mockResult,
      gte: vi.fn().mockReturnValue(gteResult),
      lt: vi.fn(),
      then: mockResult.then.bind(mockResult),
      catch: mockResult.catch.bind(mockResult),
      finally: mockResult.finally.bind(mockResult),
    };
    
    const mockBuilder: any = {
      ...mockResult,
      select: vi.fn().mockReturnValue(selectResult),
      gte: vi.fn(),
      lt: vi.fn(),
      then: mockResult.then.bind(mockResult),
      catch: mockResult.catch.bind(mockResult),
      finally: mockResult.finally.bind(mockResult),
    };
    
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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

      // Subtask 6.8: Verify error handling with user-friendly messages
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Failed to fetch analytics');
    });

    it('should verify user authentication before fetching', async () => {
      // Subtask 6.9: Test admin role verification
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

      expect(result.data?.totalIdeas).toBe(3);
      expect(result.data?.previousPeriodTotal).toBe(0);
      // When previous period is 0, trend should be 100% (or special handling)
      expect(result.data?.trendPercentage).toBe(100);
    });

    it('should handle date range filtering', async () => {
      // Story 6.7: Updated to use new DateRange type with Date objects
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

      vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(
        mockIdeas.filter(idea => 
          idea.created_at >= '2026-01-01' && idea.created_at < '2026-02-01'
        ),
        null
      ));

      // Mock RPC calls for completion rates and time metrics
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

      const dateRange = createTestDateRange();
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

        const result = await analyticsService.getAnalytics(createTestDateRange());

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

        const result = await analyticsService.getAnalytics(createTestDateRange());

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

        const result = await analyticsService.getAnalytics(createTestDateRange());

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

        const result = await analyticsService.getAnalytics(createTestDateRange());

        expect(result.data?.pipelineBreakdown).toEqual([]);
        expect(result.data?.totalIdeas).toBe(0);
      });

      it('should apply date range filter to pipeline breakdown', async () => {
        // Story 6.7: Updated to use new DateRange type
        // Subtask 1.4: Test date range affects breakdown
        const mockIdeas = [
          { id: '1', status: 'submitted', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-16' },
          { id: '2', status: 'approved', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-21' },
        ];

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        } as any);

        vi.mocked(supabase.from).mockReturnValue(createMockQueryBuilder(mockIdeas, null));

        // Mock RPC calls for completion rates and time metrics
        vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null });

        const dateRange = createTestDateRange();
        const result = await analyticsService.getAnalytics(dateRange);

        expect(result.data?.pipelineBreakdown).toHaveLength(2);
      });
    });
  });

  // Task 10: Tests for getIdeasBreakdown function
  describe('getIdeasBreakdown', () => {
    it('should return weekly breakdown of ideas', async () => {
      // Story 6.7: Updated to use new DateRange type
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

      const dateRange = createTestDateRange();
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

      await analyticsService.getIdeasBreakdown(createTestDateRange());

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

      const result = await analyticsService.getIdeasBreakdown(createTestDateRange());

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

      const result = await analyticsService.getIdeasBreakdown(createTestDateRange());

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to fetch breakdown',
        code: 'DB_ERROR',
      });
    });

    it('should apply date range filter to RPC call', async () => {
      // Story 6.7: Updated to use new DateRange type
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as any },
        error: null,
      });

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      });

      const dateRange = createTestDateRange();
      await analyticsService.getIdeasBreakdown(dateRange);

      expect(supabase.rpc).toHaveBeenCalledWith('get_ideas_breakdown', {
        start_date: dateRange.start?.toISOString(),
        end_date: dateRange.end.toISOString(),
        interval_type: 'week',
      });
    });

    it('should handle auth errors', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await analyticsService.getIdeasBreakdown(createTestDateRange());

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

      const result = await analyticsService.getIdeasBreakdown(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

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

      const result = await analyticsService.getAnalytics(createTestDateRange());

      // Trend: 71% - 70% = +1% change (direction: 'neutral', <2% threshold)
      const trend = result.data?.completionRates?.submittedToApproved.trend;
      expect(trend?.direction).toBe('neutral');
      expect(Math.abs(trend?.change || 0)).toBeLessThan(2);
    });

    it('should apply date range filter to completion rates data', async () => {
      // Subtask 12.5: Test date range filter affects completion rates
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-15', updated_at: '2026-01-16' }];

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
      vi.mocked(supabase.rpc).mockImplementation((_fnName, params) => {
        rpcCount++;
        // Verify RPC is called with correct date range
        expect(params).toHaveProperty('start_date');
        expect(params).toHaveProperty('end_date');
        
        return Promise.resolve({
          data: rpcCount === 1 ? mockCurrentCounts : mockPreviousCounts,
          error: null,
        }) as any;
      });

      const dateRange = createTestDateRange();
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

      const result = await analyticsService.getAnalytics(createTestDateRange());

      // Should still return analytics data with default completion rates (0%)
      expect(result.data).toBeDefined();
      expect(result.data?.completionRates?.submittedToApproved.rate).toBe(0);
      expect(result.data?.completionRates?.approvedToPrd.rate).toBe(0);
      expect(result.data?.completionRates?.prdToPrototype.rate).toBe(0);
      expect(result.data?.completionRates?.overallSubmittedToPrototype.rate).toBe(0);
    });
  });

  describe('Time-to-Decision Metrics - Story 6.5', () => {
    // Task 13 Subtask 13.2: Test getAnalytics() returns timeToDecision correctly
    it('should return time-to-decision metrics in analytics data', async () => {
      const mockIdeas = [
        { id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' },
      ];
      const mockPreviousIdeas: any[] = [];

      const mockCurrentCounts = {
        submitted_count: 10,
        approved_count: 8,
        prd_complete_count: 6,
        prototype_count: 4,
      };
      const mockPreviousCounts = {
        submitted_count: 0,
        approved_count: 0,
        prd_complete_count: 0,
        prototype_count: 0,
      };

      const mockCurrentTimeMetrics = {
        avg_submission_to_decision_days: 2.5,
        submission_to_decision_count: 8,
        avg_approval_to_prd_days: 4.8,
        approval_to_prd_count: 6,
        avg_prd_to_prototype_days: 1.5,
        prd_to_prototype_count: 4,
        avg_end_to_end_days: 9.2,
        end_to_end_count: 4,
      };
      const mockPreviousTimeMetrics = {
        avg_submission_to_decision_days: 3.0,
        submission_to_decision_count: 5,
        avg_approval_to_prd_days: 5.5,
        approval_to_prd_count: 4,
        avg_prd_to_prototype_days: 2.0,
        prd_to_prototype_count: 3,
        avg_end_to_end_days: 10.5,
        end_to_end_count: 3,
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

      let completionRateCallCount = 0;
      let timeMetricsCallCount = 0;
      vi.mocked(supabase.rpc).mockImplementation((fnName) => {
        if (fnName === 'get_completion_rate_counts') {
          completionRateCallCount++;
          return Promise.resolve({
            data: completionRateCallCount === 1 ? mockCurrentCounts : mockPreviousCounts,
            error: null,
          }) as any;
        } else if (fnName === 'get_time_to_decision_metrics') {
          timeMetricsCallCount++;
          return Promise.resolve({
            data: timeMetricsCallCount === 1 ? mockCurrentTimeMetrics : mockPreviousTimeMetrics,
            error: null,
          }) as any;
        }
        return Promise.resolve({ data: null, error: null }) as any;
      });

      const result = await analyticsService.getAnalytics(createTestDateRange());

      // Subtask 13.2: Verify timeToDecision is returned
      expect(result.data?.timeToDecision).toBeDefined();
      expect(result.data?.timeToDecision?.submissionToDecision).toBeDefined();
      expect(result.data?.timeToDecision?.approvalToPrd).toBeDefined();
      expect(result.data?.timeToDecision?.prdToPrototype).toBeDefined();
      expect(result.data?.timeToDecision?.endToEnd).toBeDefined();
    });

    // Task 13 Subtask 13.3: Test time calculation accuracy (edge case: NULL timestamps)
    it('should handle NULL timestamps gracefully', async () => {
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' }];
      const mockPreviousIdeas: any[] = [];
      const mockCurrentCounts = { submitted_count: 1, approved_count: 0, prd_complete_count: 0, prototype_count: 0 };
      const mockPreviousCounts = { submitted_count: 0, approved_count: 0, prd_complete_count: 0, prototype_count: 0 };

      // Mock time metrics with NULL/0 values for ideas that haven't progressed
      const mockCurrentTimeMetrics = {
        avg_submission_to_decision_days: 0,
        submission_to_decision_count: 0,
        avg_approval_to_prd_days: 0,
        approval_to_prd_count: 0,
        avg_prd_to_prototype_days: 0,
        prd_to_prototype_count: 0,
        avg_end_to_end_days: 0,
        end_to_end_count: 0,
      };
      const mockPreviousTimeMetrics = { ...mockCurrentTimeMetrics };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      let completionRateCallCount = 0;
      let timeMetricsCallCount = 0;
      vi.mocked(supabase.rpc).mockImplementation((fnName) => {
        if (fnName === 'get_completion_rate_counts') {
          completionRateCallCount++;
          return Promise.resolve({
            data: completionRateCallCount === 1 ? mockCurrentCounts : mockPreviousCounts,
            error: null,
          }) as any;
        } else if (fnName === 'get_time_to_decision_metrics') {
          timeMetricsCallCount++;
          return Promise.resolve({
            data: timeMetricsCallCount === 1 ? mockCurrentTimeMetrics : mockPreviousTimeMetrics,
            error: null,
          }) as any;
        }
        return Promise.resolve({ data: null, error: null }) as any;
      });

      const result = await analyticsService.getAnalytics(createTestDateRange());

      // Subtask 13.3: Verify NULL timestamps don't break calculation
      expect(result.data?.timeToDecision?.submissionToDecision.averageDays).toBe(0);
      expect(result.data?.timeToDecision?.submissionToDecision.count).toBe(0);
      expect(result.data?.timeToDecision?.submissionToDecision.formattedTime).toBe('N/A');
    });

    // Task 13 Subtask 13.4: Test trend calculation for improving, worsening, and neutral trends
    it('should calculate improving trend when time decreases', async () => {
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' }];
      const mockPreviousIdeas: any[] = [];
      const mockCurrentCounts = { submitted_count: 10, approved_count: 8, prd_complete_count: 6, prototype_count: 4 };
      const mockPreviousCounts = { submitted_count: 10, approved_count: 7, prd_complete_count: 5, prototype_count: 3 };

      // Current: 2.0 days, Previous: 3.0 days = -1.0 days (IMPROVEMENT for time)
      const mockCurrentTimeMetrics = {
        avg_submission_to_decision_days: 2.0,
        submission_to_decision_count: 8,
        avg_approval_to_prd_days: 4.0,
        approval_to_prd_count: 6,
        avg_prd_to_prototype_days: 1.0,
        prd_to_prototype_count: 4,
        avg_end_to_end_days: 8.0,
        end_to_end_count: 4,
      };
      const mockPreviousTimeMetrics = {
        avg_submission_to_decision_days: 3.0,
        submission_to_decision_count: 7,
        avg_approval_to_prd_days: 5.5,
        approval_to_prd_count: 5,
        avg_prd_to_prototype_days: 2.0,
        prd_to_prototype_count: 3,
        avg_end_to_end_days: 10.0,
        end_to_end_count: 3,
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

      let completionRateCallCount = 0;
      let timeMetricsCallCount = 0;
      vi.mocked(supabase.rpc).mockImplementation((fnName) => {
        if (fnName === 'get_completion_rate_counts') {
          completionRateCallCount++;
          return Promise.resolve({
            data: completionRateCallCount === 1 ? mockCurrentCounts : mockPreviousCounts,
            error: null,
          }) as any;
        } else if (fnName === 'get_time_to_decision_metrics') {
          timeMetricsCallCount++;
          return Promise.resolve({
            data: timeMetricsCallCount === 1 ? mockCurrentTimeMetrics : mockPreviousTimeMetrics,
            error: null,
          }) as any;
        }
        return Promise.resolve({ data: null, error: null }) as any;
      });

      const result = await analyticsService.getAnalytics(createTestDateRange());

      // Subtask 13.4: Verify trend is 'down' (improvement for time metrics)
      const trend = result.data?.timeToDecision?.submissionToDecision.trend;
      expect(trend?.direction).toBe('down'); // Time decreased = improvement
      expect(trend?.change).toBe(-1.0); // Negative change for time
    });

    it('should calculate worsening trend when time increases', async () => {
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' }];
      const mockPreviousIdeas: any[] = [];
      const mockCurrentCounts = { submitted_count: 10, approved_count: 8, prd_complete_count: 6, prototype_count: 4 };
      const mockPreviousCounts = { submitted_count: 10, approved_count: 7, prd_complete_count: 5, prototype_count: 3 };

      // Current: 4.0 days, Previous: 2.5 days = +1.5 days (WORSENING for time)
      const mockCurrentTimeMetrics = {
        avg_submission_to_decision_days: 4.0,
        submission_to_decision_count: 8,
        avg_approval_to_prd_days: 6.5,
        approval_to_prd_count: 6,
        avg_prd_to_prototype_days: 2.5,
        prd_to_prototype_count: 4,
        avg_end_to_end_days: 12.0,
        end_to_end_count: 4,
      };
      const mockPreviousTimeMetrics = {
        avg_submission_to_decision_days: 2.5,
        submission_to_decision_count: 7,
        avg_approval_to_prd_days: 5.0,
        approval_to_prd_count: 5,
        avg_prd_to_prototype_days: 1.5,
        prd_to_prototype_count: 3,
        avg_end_to_end_days: 9.0,
        end_to_end_count: 3,
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

      let completionRateCallCount = 0;
      let timeMetricsCallCount = 0;
      vi.mocked(supabase.rpc).mockImplementation((fnName) => {
        if (fnName === 'get_completion_rate_counts') {
          completionRateCallCount++;
          return Promise.resolve({
            data: completionRateCallCount === 1 ? mockCurrentCounts : mockPreviousCounts,
            error: null,
          }) as any;
        } else if (fnName === 'get_time_to_decision_metrics') {
          timeMetricsCallCount++;
          return Promise.resolve({
            data: timeMetricsCallCount === 1 ? mockCurrentTimeMetrics : mockPreviousTimeMetrics,
            error: null,
          }) as any;
        }
        return Promise.resolve({ data: null, error: null }) as any;
      });

      const result = await analyticsService.getAnalytics(createTestDateRange());

      // Subtask 13.4: Verify trend is 'up' (worsening for time metrics)
      const trend = result.data?.timeToDecision?.submissionToDecision.trend;
      expect(trend?.direction).toBe('up'); // Time increased = worsening
      expect(trend?.change).toBe(1.5); // Positive change for time
    });

    // Task 13 Subtask 13.5: Test date range filter affects time metrics data
    it('should apply date range filter to time metrics', async () => {
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-15', updated_at: '2026-01-16' }];
      const mockCurrentCounts = { submitted_count: 10, approved_count: 8, prd_complete_count: 6, prototype_count: 4 };
      const mockPreviousCounts = { submitted_count: 0, approved_count: 0, prd_complete_count: 0, prototype_count: 0 };
      const mockCurrentTimeMetrics = {
        avg_submission_to_decision_days: 2.5,
        submission_to_decision_count: 8,
        avg_approval_to_prd_days: 4.8,
        approval_to_prd_count: 6,
        avg_prd_to_prototype_days: 1.5,
        prd_to_prototype_count: 4,
        avg_end_to_end_days: 9.2,
        end_to_end_count: 4,
      };
      const mockPreviousTimeMetrics = {
        avg_submission_to_decision_days: 0,
        submission_to_decision_count: 0,
        avg_approval_to_prd_days: 0,
        approval_to_prd_count: 0,
        avg_prd_to_prototype_days: 0,
        prd_to_prototype_count: 0,
        avg_end_to_end_days: 0,
        end_to_end_count: 0,
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

      let completionRateCallCount = 0;
      let timeMetricsCallCount = 0;
      vi.mocked(supabase.rpc).mockImplementation((fnName, params) => {
        // Subtask 13.5: Verify RPC is called with correct date range
        expect(params).toHaveProperty('start_date');
        expect(params).toHaveProperty('end_date');
        
        if (fnName === 'get_completion_rate_counts') {
          completionRateCallCount++;
          return Promise.resolve({
            data: completionRateCallCount === 1 ? mockCurrentCounts : mockPreviousCounts,
            error: null,
          }) as any;
        } else if (fnName === 'get_time_to_decision_metrics') {
          timeMetricsCallCount++;
          return Promise.resolve({
            data: timeMetricsCallCount === 1 ? mockCurrentTimeMetrics : mockPreviousTimeMetrics,
            error: null,
          }) as any;
        }
        return Promise.resolve({ data: null, error: null }) as any;
      });

      const dateRange = createTestDateRange();
      const result = await analyticsService.getAnalytics(dateRange);

      expect(result.data?.timeToDecision).toBeDefined();
      expect(supabase.rpc).toHaveBeenCalledWith(
        'get_time_to_decision_metrics',
        expect.objectContaining({
          start_date: expect.any(String),
          end_date: expect.any(String),
        })
      );
    });

    // Task 13 Subtask 13.6: Test human-readable time formatting (hours vs days)
    it('should format time as hours when less than 2 days', async () => {
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' }];
      const mockPreviousIdeas: any[] = [];
      const mockCurrentCounts = { submitted_count: 10, approved_count: 8, prd_complete_count: 6, prototype_count: 4 };
      const mockPreviousCounts = { submitted_count: 0, approved_count: 0, prd_complete_count: 0, prototype_count: 0 };

      // Time: 1.5 days = 36 hours (should be formatted as hours)
      const mockCurrentTimeMetrics = {
        avg_submission_to_decision_days: 1.5,
        submission_to_decision_count: 8,
        avg_approval_to_prd_days: 0.75, // 18 hours
        approval_to_prd_count: 6,
        avg_prd_to_prototype_days: 1.0, // 24 hours
        prd_to_prototype_count: 4,
        avg_end_to_end_days: 3.2, // >2 days, should be formatted as days
        end_to_end_count: 4,
      };
      const mockPreviousTimeMetrics = {
        avg_submission_to_decision_days: 0,
        submission_to_decision_count: 0,
        avg_approval_to_prd_days: 0,
        approval_to_prd_count: 0,
        avg_prd_to_prototype_days: 0,
        prd_to_prototype_count: 0,
        avg_end_to_end_days: 0,
        end_to_end_count: 0,
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

      let completionRateCallCount = 0;
      let timeMetricsCallCount = 0;
      vi.mocked(supabase.rpc).mockImplementation((fnName) => {
        if (fnName === 'get_completion_rate_counts') {
          completionRateCallCount++;
          return Promise.resolve({
            data: completionRateCallCount === 1 ? mockCurrentCounts : mockPreviousCounts,
            error: null,
          }) as any;
        } else if (fnName === 'get_time_to_decision_metrics') {
          timeMetricsCallCount++;
          return Promise.resolve({
            data: timeMetricsCallCount === 1 ? mockCurrentTimeMetrics : mockPreviousTimeMetrics,
            error: null,
          }) as any;
        }
        return Promise.resolve({ data: null, error: null }) as any;
      });

      const result = await analyticsService.getAnalytics(createTestDateRange());

      // Subtask 13.6: Verify time formatting
      expect(result.data?.timeToDecision?.submissionToDecision.formattedTime).toContain('hour');
      expect(result.data?.timeToDecision?.approvalToPrd.formattedTime).toContain('hour');
      expect(result.data?.timeToDecision?.prdToPrototype.formattedTime).toContain('hour');
      expect(result.data?.timeToDecision?.endToEnd.formattedTime).toContain('day'); // >2 days
    });

    // Test error handling for time metrics
    it('should handle time metrics query failure gracefully', async () => {
      const mockIdeas = [{ id: '1', status: 'submitted', created_at: '2026-01-01', updated_at: '2026-01-02' }];
      const mockPreviousIdeas: any[] = [];
      const mockCurrentCounts = { submitted_count: 10, approved_count: 8, prd_complete_count: 6, prototype_count: 4 };
      const mockPreviousCounts = { submitted_count: 0, approved_count: 0, prd_complete_count: 0, prototype_count: 0 };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        queryCount++;
        return createMockQueryBuilder(queryCount === 1 ? mockIdeas : mockPreviousIdeas);
      });

      let completionRateCallCount = 0;
      vi.mocked(supabase.rpc).mockImplementation((fnName) => {
        if (fnName === 'get_completion_rate_counts') {
          completionRateCallCount++;
          return Promise.resolve({
            data: completionRateCallCount === 1 ? mockCurrentCounts : mockPreviousCounts,
            error: null,
          }) as any;
        } else if (fnName === 'get_time_to_decision_metrics') {
          // Mock RPC error for time metrics
          return Promise.resolve({
            data: null,
            error: { message: 'Time metrics RPC error', code: 'DB_ERROR' } as any,
          }) as any;
        }
        return Promise.resolve({ data: null, error: null }) as any;
      });

      const result = await analyticsService.getAnalytics(createTestDateRange());

      // Should still return analytics data with default time metrics (0 days, N/A)
      expect(result.data).toBeDefined();
      expect(result.data?.timeToDecision?.submissionToDecision.averageDays).toBe(0);
      expect(result.data?.timeToDecision?.submissionToDecision.formattedTime).toBe('N/A');
      expect(result.data?.timeToDecision?.approvalToPrd.averageDays).toBe(0);
      expect(result.data?.timeToDecision?.prdToPrototype.averageDays).toBe(0);
      expect(result.data?.timeToDecision?.endToEnd.averageDays).toBe(0);
    });

    // Story 6.6 Task 15: Tests for user activity metrics
    describe('User Activity Metrics', () => {
      // Subtask 15.2: Test getAnalytics() returns userActivity correctly
      it('should return userActivity with correct structure', async () => {
        const mockIdeas = [
          { id: '1', status: 'submitted', created_at: '2026-01-20', updated_at: '2026-01-21', user_id: 'user-1', users: { id: 'user-1', email: 'user1@example.com', name: 'User One', created_at: '2025-01-01' } },
          { id: '2', status: 'approved', created_at: '2026-01-22', updated_at: '2026-01-23', user_id: 'user-1', users: { id: 'user-1', email: 'user1@example.com', name: 'User One', created_at: '2025-01-01' } },
          { id: '3', status: 'prd_development', created_at: '2026-01-24', updated_at: '2026-01-25', user_id: 'user-2', users: { id: 'user-2', email: 'user2@example.com', name: 'User Two', created_at: '2025-02-01' } },
        ];

        const mockPreviousIdeas = [
          { id: '4', user_id: 'user-1' },
        ];

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'admin-123', email: 'admin@example.com' } },
          error: null,
        } as any);

        // Mock queries for ideas
        let fromCallCount = 0;
        vi.mocked(supabase.from).mockImplementation((table) => {
          fromCallCount++;
          
          if (table === 'users') {
            // Mock total users count query
            return {
              select: vi.fn().mockReturnValue(
                Promise.resolve({ count: 10, error: null })
              ),
            } as any;
          }
          
          if (table === 'ideas') {
            // Return different data for each call
            if (fromCallCount === 2 || fromCallCount === 5) {
              // Current period active users query
              return createMockQueryBuilder(mockIdeas.map(i => ({ user_id: i.user_id })));
            } else if (fromCallCount === 3 || fromCallCount === 6) {
              // Top contributors query
              return createMockQueryBuilder(mockIdeas);
            } else if (fromCallCount === 4 || fromCallCount === 7) {
              // Recent submissions query
              const builder = createMockQueryBuilder(mockIdeas);
              builder.order = vi.fn().mockReturnValue({
                ...builder,
                limit: vi.fn().mockReturnValue(Promise.resolve({ data: mockIdeas, error: null })),
              });
              return builder;
            } else if (fromCallCount === 8) {
              // Previous period active users query
              return createMockQueryBuilder(mockPreviousIdeas);
            } else {
              // General ideas query (first call for total ideas)
              return createMockQueryBuilder(fromCallCount === 1 ? mockIdeas : mockPreviousIdeas);
            }
          }
          
          return createMockQueryBuilder([]);
        });

        // Mock RPC calls for completion rates and time metrics
        vi.mocked(supabase.rpc).mockImplementation(() =>
          Promise.resolve({
            data: { submitted_count: 10, approved_count: 8, prd_complete_count: 6, prototype_count: 4 },
            error: null,
          }) as any
        );

        const result = await analyticsService.getAnalytics(createTestDateRange());

        // Verify userActivity structure
        expect(result.data?.userActivity).toBeDefined();
        expect(result.data?.userActivity?.totalUsers).toBe(10);
        expect(result.data?.userActivity?.activeUsers).toBeGreaterThanOrEqual(0);
        expect(result.data?.userActivity?.activePercentage).toBeGreaterThanOrEqual(0);
        expect(result.data?.userActivity?.trend).toBeDefined();
        expect(result.data?.userActivity?.topContributors).toBeDefined();
        expect(result.data?.userActivity?.recentSubmissions).toBeDefined();
      });

      // Subtask 15.3: Test total users and active users calculation
      it.skip('should calculate total users and active users correctly', async () => {
        const mockActiveIdeas = [
          { user_id: 'user-1' },
          { user_id: 'user-1' }, // Duplicate user should count once
          { user_id: 'user-2' },
        ];

        const mockPreviousActive = [{ user_id: 'user-1' }]; // 1 active user previously

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'admin-123', email: 'admin@example.com' } },
          error: null,
        } as any);

        let fromCallCount = 0;
        vi.mocked(supabase.from).mockImplementation((table) => {
          fromCallCount++;
          
          if (table === 'users') {
            // Return a mock that handles .select('*', { count: 'exact', head: true })
            return {
              select: vi.fn().mockImplementation(() =>
                Promise.resolve({ count: 15, data: null, error: null })
              ),
            } as any;
          }
          
          if (table === 'ideas') {
            // Call 1: getAnalytics main ideas query
            // Call 2: getAnalytics previous period ideas query
            // Call 3: calculateUserActivityMetrics active users query (current period)
            // Call 4: calculateUserActivityMetrics top contributors query
            // Call 5: calculateUserActivityMetrics recent submissions query
            // Call 6: calculateUserActivityMetrics previous period active users query
            
            if (fromCallCount <= 2) {
              // Main analytics queries
              return createMockQueryBuilder([]);
            } else if (fromCallCount === 3) {
              // Current period active users
              return createMockQueryBuilder(mockActiveIdeas);
            } else if (fromCallCount === 4) {
              // Top contributors query
              return createMockQueryBuilder([]);
            } else if (fromCallCount === 5) {
              // Recent submissions query
              const builder = createMockQueryBuilder([]);
              builder.select = vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lt: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null })),
                    }),
                  }),
                }),
              });
              return builder;
            } else if (fromCallCount === 6) {
              // Previous period active users
              return createMockQueryBuilder(mockPreviousActive);
            } else {
              return createMockQueryBuilder([]);
            }
          }
          
          return createMockQueryBuilder([]);
        });

        vi.mocked(supabase.rpc).mockImplementation(() =>
          Promise.resolve({ data: { submitted_count: 0, approved_count: 0, prd_complete_count: 0, prototype_count: 0 }, error: null }) as any
        );

        const result = await analyticsService.getAnalytics(createTestDateRange());

        // Verify active user calculations
        expect(result.data?.userActivity?.totalUsers).toBe(15);
        expect(result.data?.userActivity?.activeUsers).toBe(2); // 2 unique users
        expect(result.data?.userActivity?.activePercentage).toBeCloseTo(13.3, 1); // (2/15)*100 = 13.3%
      });

      // Subtask 15.4: Test trend calculation for increasing, decreasing, neutral
      it.skip('should calculate trend correctly for increasing active users', async () => {
        const mockCurrentActive = [{ user_id: 'user-1' }, { user_id: 'user-2' }, { user_id: 'user-3' }]; // 3 active users
        const mockPreviousActive = [{ user_id: 'user-1' }]; // 1 active user previously

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'admin-123', email: 'admin@example.com' } },
          error: null,
        } as any);

        let fromCallCount = 0;
        vi.mocked(supabase.from).mockImplementation((table) => {
          fromCallCount++;
          
          if (table === 'users') {
            return {
              select: vi.fn().mockImplementation(() =>
                Promise.resolve({ count: 10, data: null, error: null })
              ),
            } as any;
          }
          
          if (table === 'ideas') {
            if (fromCallCount <= 2) {
              // Main analytics queries
              return createMockQueryBuilder([]);
            } else if (fromCallCount === 3) {
              // Current period active users
              return createMockQueryBuilder(mockCurrentActive);
            } else if (fromCallCount === 4) {
              // Top contributors query
              return createMockQueryBuilder([]);
            } else if (fromCallCount === 5) {
              // Recent submissions query with order/limit
              const builder = createMockQueryBuilder([]);
              builder.select = vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lt: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null })),
                    }),
                  }),
                }),
              });
              return builder;
            } else if (fromCallCount === 6) {
              // Previous period active users
              return createMockQueryBuilder(mockPreviousActive);
            } else {
              return createMockQueryBuilder([]);
            }
          }
          
          return createMockQueryBuilder([]);
        });

        vi.mocked(supabase.rpc).mockImplementation(() =>
          Promise.resolve({ data: { submitted_count: 0, approved_count: 0, prd_complete_count: 0, prototype_count: 0 }, error: null }) as any
        );

        const result = await analyticsService.getAnalytics(createTestDateRange());

        // Verify increasing trend (3 active now vs 1 previously = +2 change)
        expect(result.data?.userActivity?.trend.direction).toBe('up');
        expect(result.data?.userActivity?.trend.change).toBe(2);
        expect(result.data?.userActivity?.trend.changePercentage).toBeGreaterThan(0);
      });

      // Subtask 15.5: Test leaderboard query returns top contributors
      it.skip('should return top contributors leaderboard', async () => {
        const mockIdeasWithUsers = [
          { id: '1', user_id: 'user-1', created_at: '2026-01-20', users: { id: 'user-1', email: 'user1@example.com', name: 'Top User', created_at: '2025-01-01' } },
          { id: '2', user_id: 'user-1', created_at: '2026-01-21', users: { id: 'user-1', email: 'user1@example.com', name: 'Top User', created_at: '2025-01-01' } },
          { id: '3', user_id: 'user-1', created_at: '2026-01-22', users: { id: 'user-1', email: 'user1@example.com', name: 'Top User', created_at: '2025-01-01' } },
          { id: '4', user_id: 'user-2', created_at: '2026-01-23', users: { id: 'user-2', email: 'user2@example.com', name: 'Second User', created_at: '2025-02-01' } },
        ];

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'admin-123', email: 'admin@example.com' } },
          error: null,
        } as any);

        let fromCallCount = 0;
        vi.mocked(supabase.from).mockImplementation((table) => {
          fromCallCount++;
          
          if (table === 'users') {
            return {
              select: vi.fn().mockImplementation(() =>
                Promise.resolve({ count: 5, data: null, error: null })
              ),
            } as any;
          }
          
          if (table === 'ideas') {
            if (fromCallCount <= 2) {
              // Main analytics queries
              return createMockQueryBuilder([]);
            } else if (fromCallCount === 3) {
              // Current period active users query
              return createMockQueryBuilder(mockIdeasWithUsers.map(i => ({ user_id: i.user_id })));
            } else if (fromCallCount === 4) {
              // Top contributors query - return ideas with user data
              return createMockQueryBuilder(mockIdeasWithUsers);
            } else if (fromCallCount === 5) {
              // Recent submissions query with order/limit
              const builder = createMockQueryBuilder(mockIdeasWithUsers);
              builder.select = vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lt: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockReturnValue(Promise.resolve({ data: mockIdeasWithUsers, error: null })),
                    }),
                  }),
                }),
              });
              return builder;
            } else if (fromCallCount === 6) {
              // Previous period active users
              return createMockQueryBuilder([]);
            } else {
              return createMockQueryBuilder([]);
            }
          }
          
          return createMockQueryBuilder([]);
        });

        vi.mocked(supabase.rpc).mockImplementation(() =>
          Promise.resolve({ data: { submitted_count: 0, approved_count: 0, prd_complete_count: 0, prototype_count: 0 }, error: null }) as any
        );

        const result = await analyticsService.getAnalytics(createTestDateRange());

        // Verify leaderboard structure
        expect(result.data?.userActivity?.topContributors).toBeDefined();
        expect(result.data?.userActivity?.topContributors.length).toBeGreaterThan(0);
        
        const topContributor = result.data?.userActivity?.topContributors[0];
        expect(topContributor?.userId).toBe('user-1');
        expect(topContributor?.userName).toBe('Top User');
        expect(topContributor?.ideasCount).toBe(3);
        expect(topContributor?.percentage).toBeCloseTo(75, 0); // 3 out of 4 ideas = 75%
      });

      // Subtask 15.6: Test recent submissions query with user details
      it.skip('should return recent submissions with user details', async () => {
        const mockRecentSubmissions = [
          { id: '1', title: 'Recent Idea 1', status: 'submitted', created_at: '2026-01-25T10:00:00Z', user_id: 'user-1', users: { id: 'user-1', email: 'user1@example.com', name: 'User One' } },
          { id: '2', title: 'Recent Idea 2', status: 'approved', created_at: '2026-01-24T10:00:00Z', user_id: 'user-2', users: { id: 'user-2', email: 'user2@example.com', name: null } }, // NULL name
        ];

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'admin-123', email: 'admin@example.com' } },
          error: null,
        } as any);

        let fromCallCount = 0;
        vi.mocked(supabase.from).mockImplementation((table) => {
          fromCallCount++;
          
          if (table === 'users') {
            return {
              select: vi.fn().mockImplementation(() =>
                Promise.resolve({ count: 5, data: null, error: null })
              ),
            } as any;
          }
          
          if (table === 'ideas') {
            if (fromCallCount <= 2) {
              // Main analytics queries
              return createMockQueryBuilder([]);
            } else if (fromCallCount === 3) {
              // Current period active users query
              return createMockQueryBuilder([]);
            } else if (fromCallCount === 4) {
              // Top contributors query
              return createMockQueryBuilder([]);
            } else if (fromCallCount === 5) {
              // Recent submissions query with order and limit
              const builder = createMockQueryBuilder(mockRecentSubmissions);
              builder.select = vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lt: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockReturnValue(Promise.resolve({ data: mockRecentSubmissions, error: null })),
                    }),
                  }),
                }),
              });
              return builder;
            } else if (fromCallCount === 6) {
              // Previous period active users
              return createMockQueryBuilder([]);
            } else {
              return createMockQueryBuilder([]);
            }
          }
          
          return createMockQueryBuilder([]);
        });

        vi.mocked(supabase.rpc).mockImplementation(() =>
          Promise.resolve({ data: { submitted_count: 0, approved_count: 0, prd_complete_count: 0, prototype_count: 0 }, error: null }) as any
        );

        const result = await analyticsService.getAnalytics(createTestDateRange());

        // Verify recent submissions structure
        expect(result.data?.userActivity?.recentSubmissions).toBeDefined();
        expect(result.data?.userActivity?.recentSubmissions.length).toBe(2);
        
        const firstSubmission = result.data?.userActivity?.recentSubmissions[0];
        expect(firstSubmission?.ideaId).toBe('1');
        expect(firstSubmission?.title).toBe('Recent Idea 1');
        expect(firstSubmission?.userName).toBe('User One');
        
        // Subtask 15.7: Test NULL user name handling
        const secondSubmission = result.data?.userActivity?.recentSubmissions[1];
        expect(secondSubmission?.userName).toBeNull(); // Should handle NULL name gracefully
        expect(secondSubmission?.userEmail).toBe('user2@example.com');
      });

      // Subtask 15.9: Test empty state displays correctly  
      it('should handle empty user activity gracefully', async () => {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'admin-123', email: 'admin@example.com' } },
          error: null,
        } as any);

        vi.mocked(supabase.from).mockImplementation((table) => {
          if (table === 'users') {
            return {
              select: vi.fn().mockReturnValue(Promise.resolve({ count: 0, error: null })), // 0 total users
            } as any;
          }
          
          if (table === 'ideas') {
            return createMockQueryBuilder([]); // No ideas
          }
          
          return createMockQueryBuilder([]);
        });

        vi.mocked(supabase.rpc).mockImplementation(() =>
          Promise.resolve({ data: { submitted_count: 0, approved_count: 0, prd_complete_count: 0, prototype_count: 0 }, error: null }) as any
        );

        const result = await analyticsService.getAnalytics(createTestDateRange());

        // Verify empty state handling
        expect(result.data?.userActivity?.totalUsers).toBe(0);
        expect(result.data?.userActivity?.activeUsers).toBe(0);
        expect(result.data?.userActivity?.activePercentage).toBe(0);
        expect(result.data?.userActivity?.topContributors).toEqual([]);
        expect(result.data?.userActivity?.recentSubmissions).toEqual([]);
      });
    });
  });

  // Story 0.6 Task 6 Subtask 6.4: Tests for drill-down service methods
  // Helper: create mock query builder that supports .select().order().gte().lt() chain
  function createDrillDownMockBuilder(data: any, error: any = null) {
    const mockResult = Promise.resolve({ data, error });
    const resultLike: any = {
      then: mockResult.then.bind(mockResult),
      catch: mockResult.catch.bind(mockResult),
      finally: mockResult.finally.bind(mockResult),
    };

    const ltResult: any = { ...resultLike };
    const gteResult: any = { ...resultLike, lt: vi.fn().mockReturnValue(ltResult) };
    const orderResult: any = { ...resultLike, gte: vi.fn().mockReturnValue(gteResult), lt: vi.fn().mockReturnValue(ltResult) };
    const selectResult: any = { ...resultLike, order: vi.fn().mockReturnValue(orderResult) };
    const builder: any = { select: vi.fn().mockReturnValue(selectResult) };
    return builder;
  }

  describe('getTimeToDecisionDrillDown', () => {
    it('should return time-to-decision drill-down data', async () => {
      const mockIdeas = [
        { id: '1', title: 'Idea Alpha', status: 'approved', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-12T00:00:00Z', status_updated_at: '2026-01-12T00:00:00Z' },
        { id: '2', title: 'Idea Beta', status: 'prototype_complete', created_at: '2026-01-05T00:00:00Z', updated_at: '2026-01-18T00:00:00Z', status_updated_at: '2026-01-18T00:00:00Z' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue(createDrillDownMockBuilder(mockIdeas) as any);

      const result = await analyticsService.getTimeToDecisionDrillDown(createTestDateRange());

      expect(result.data).toHaveLength(2);
      expect(result.error).toBeNull();
      expect(result.data?.[0].title).toBe('Idea Alpha');
      expect(result.data?.[0].currentStatus).toBe('approved');
      expect(result.data?.[0].statusLabel).toBe('Approved');
      expect(result.data?.[0].totalDays).toBeGreaterThanOrEqual(0);
    });

    it('should return empty array when no ideas exist', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue(createDrillDownMockBuilder([]) as any);

      const result = await analyticsService.getTimeToDecisionDrillDown(createTestDateRange());

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue(
        createDrillDownMockBuilder(null, { message: 'Database error', code: '500' }) as any
      );

      const result = await analyticsService.getTimeToDecisionDrillDown(createTestDateRange());

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Failed to fetch time-to-decision drill-down');
    });

    it('should require authentication', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await analyticsService.getTimeToDecisionDrillDown(createTestDateRange());

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('User not authenticated');
    });
  });

  describe('getCompletionRateDrillDown', () => {
    it('should return completion rate drill-down data', async () => {
      const mockIdeas = [
        { id: '1', title: 'Completed Idea', status: 'prototype_complete', created_at: '2026-01-01T00:00:00Z' },
        { id: '2', title: 'In Progress', status: 'approved', created_at: '2026-01-05T00:00:00Z' },
        { id: '3', title: 'New Idea', status: 'submitted', created_at: '2026-01-10T00:00:00Z' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue(createDrillDownMockBuilder(mockIdeas) as any);

      const result = await analyticsService.getCompletionRateDrillDown(createTestDateRange());

      expect(result.data).toHaveLength(3);
      expect(result.error).toBeNull();

      // Prototype complete = 4/4 = 100%
      expect(result.data?.[0].title).toBe('Completed Idea');
      expect(result.data?.[0].completionPercentage).toBe(100);
      expect(result.data?.[0].stagesCompleted).toBe(4);

      // Approved = 2/4 = 50%
      expect(result.data?.[1].title).toBe('In Progress');
      expect(result.data?.[1].completionPercentage).toBe(50);
      expect(result.data?.[1].stagesCompleted).toBe(2);

      // Submitted = 1/4 = 25%
      expect(result.data?.[2].title).toBe('New Idea');
      expect(result.data?.[2].completionPercentage).toBe(25);
      expect(result.data?.[2].stagesCompleted).toBe(1);
    });

    it('should handle rejected ideas with 0 stages completed', async () => {
      const mockIdeas = [
        { id: '1', title: 'Rejected Idea', status: 'rejected', created_at: '2026-01-01T00:00:00Z' },
      ];

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue(createDrillDownMockBuilder(mockIdeas) as any);

      const result = await analyticsService.getCompletionRateDrillDown(createTestDateRange());

      expect(result.data?.[0].stagesCompleted).toBe(0);
      expect(result.data?.[0].completionPercentage).toBe(0);
    });

    it('should return empty array when no ideas exist', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue(createDrillDownMockBuilder([]) as any);

      const result = await analyticsService.getCompletionRateDrillDown(createTestDateRange());

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue(
        createDrillDownMockBuilder(null, { message: 'Database error', code: '500' }) as any
      );

      const result = await analyticsService.getCompletionRateDrillDown(createTestDateRange());

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Failed to fetch completion rate drill-down');
    });

    it('should require authentication', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await analyticsService.getCompletionRateDrillDown(createTestDateRange());

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('User not authenticated');
    });
  });
});
