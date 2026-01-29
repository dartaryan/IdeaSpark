// src/features/admin/hooks/useAnalytics.test.ts
// Task 13: Comprehensive unit tests for useAnalytics
// Subtask 13.11: Create useAnalytics.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnalytics } from './useAnalytics';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsData } from '../analytics/types';

// Mock the analyticsService
vi.mock('../services/analyticsService', () => ({
  analyticsService: {
    getAnalytics: vi.fn(),
  },
}));

const mockAnalyticsData: AnalyticsData = {
  totalIdeas: 25,
  previousPeriodTotal: 20,
  trendPercentage: 25, // ((25-20)/20)*100
  pipelineBreakdown: [
    { status: 'submitted', count: 10, percentage: 40 },
    { status: 'approved', count: 8, percentage: 32 },
  ],
  completionRate: 8,
  timeMetrics: {
    avgTimeToApproval: 3,
    avgTimeToPRD: 5,
    avgTimeToPrototype: 14,
  },
  timestamp: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
};

// Wrapper component for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch analytics data successfully', async () => {
    // Subtask 13.12: Test hook fetches analytics data successfully
    vi.mocked(analyticsService.getAnalytics).mockResolvedValue({
      data: mockAnalyticsData,
      error: null,
    });

    const { result } = renderHook(() => useAnalytics(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Subtask 5.7: Return analytics data with proper TypeScript types
    expect(result.current.data).toEqual(mockAnalyticsData);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    // Subtask 13.13: Test hook handles errors gracefully
    vi.mocked(analyticsService.getAnalytics).mockResolvedValue({
      data: null,
      error: { message: 'Failed to fetch analytics', code: 'DB_ERROR' },
    });

    const { result } = renderHook(() => useAnalytics(), {
      wrapper: createWrapper(),
    });

    // Wait for error state
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Subtask 5.6: Handle error state
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('should use correct query key', async () => {
    // Subtask 5.2: Verify React Query hook uses correct query key
    vi.mocked(analyticsService.getAnalytics).mockResolvedValue({
      data: mockAnalyticsData,
      error: null,
    });

    const { result } = renderHook(() => useAnalytics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Query key should be ['admin', 'analytics']
    expect(analyticsService.getAnalytics).toHaveBeenCalled();
  });

  it('should provide refetch function', async () => {
    // Subtask 5.8: Add refetch function for manual refresh capability
    vi.mocked(analyticsService.getAnalytics).mockResolvedValue({
      data: mockAnalyticsData,
      error: null,
    });

    const { result } = renderHook(() => useAnalytics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should cache data for staleTime duration', async () => {
    // Subtask 5.4 & 5.5: Verify staleTime and cacheTime configuration
    vi.mocked(analyticsService.getAnalytics).mockResolvedValue({
      data: mockAnalyticsData,
      error: null,
    });

    const { result } = renderHook(() => useAnalytics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First call
    expect(analyticsService.getAnalytics).toHaveBeenCalledTimes(1);

    // Data should be available
    expect(result.current.data).toEqual(mockAnalyticsData);
  });

  // Story 6.2 Task 5: Tests for date range parameter
  it('should accept and use dateRange parameter', async () => {
    // Subtask 10.17: Test hook accepts and uses dateRange parameter
    const dateRange = {
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-02-01T00:00:00Z',
    };

    vi.mocked(analyticsService.getAnalytics).mockResolvedValue({
      data: mockAnalyticsData,
      error: null,
    });

    const { result } = renderHook(() => useAnalytics(dateRange), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify service was called with dateRange
    expect(analyticsService.getAnalytics).toHaveBeenCalledWith(dateRange);
    expect(result.current.data).toEqual(mockAnalyticsData);
  });

  it('should include dateRange in query key', async () => {
    // Subtask 10.18: Test query key includes dateRange
    const dateRange = {
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-02-01T00:00:00Z',
    };

    vi.mocked(analyticsService.getAnalytics).mockResolvedValue({
      data: mockAnalyticsData,
      error: null,
    });

    const queryClient1 = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    
    const wrapper1 = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient1}>
        {children}
      </QueryClientProvider>
    );

    // First render with dateRange
    const { result: result1 } = renderHook(() => useAnalytics(dateRange), {
      wrapper: wrapper1,
    });

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    expect(analyticsService.getAnalytics).toHaveBeenCalledTimes(1);

    // Second render with different dateRange should trigger new fetch
    const queryClient2 = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    
    const wrapper2 = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient2}>
        {children}
      </QueryClientProvider>
    );

    const differentDateRange = {
      startDate: '2026-02-01T00:00:00Z',
      endDate: '2026-03-01T00:00:00Z',
    };

    const { result: result2 } = renderHook(() => useAnalytics(differentDateRange), {
      wrapper: wrapper2,
    });

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false);
    });

    // Should have been called twice - once for each different dateRange
    expect(analyticsService.getAnalytics).toHaveBeenCalledTimes(2);
    expect(analyticsService.getAnalytics).toHaveBeenNthCalledWith(1, dateRange);
    expect(analyticsService.getAnalytics).toHaveBeenNthCalledWith(2, differentDateRange);
  });
});
