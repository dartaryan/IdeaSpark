// src/features/admin/components/analytics/AnalyticsDashboard.test.tsx
// Task 13: Comprehensive unit tests for AnalyticsDashboard
// RED PHASE: Writing failing test first

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import type { AnalyticsData } from '../../analytics/types';

// Mock the useAnalytics hook
vi.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(),
}));

import { useAnalytics } from '../../hooks/useAnalytics';

// Mock analytics data
const mockAnalyticsData: AnalyticsData = {
  totalIdeas: 25,
  pipelineBreakdown: [
    { status: 'submitted', count: 10, percentage: 40 },
    { status: 'approved', count: 8, percentage: 32 },
    { status: 'prd_development', count: 5, percentage: 20 },
    { status: 'prototype_complete', count: 2, percentage: 8 },
  ],
  completionRate: 8,
  timeMetrics: {
    avgTimeToApproval: 3,
    avgTimeToPRD: 5,
    avgTimeToPrototype: 14,
  },
  timestamp: new Date().toISOString(),
};

// Test wrapper with required providers
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
  
  // Default mock implementation - success state with data
  vi.mocked(useAnalytics).mockReturnValue({
    data: mockAnalyticsData,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    dataUpdatedAt: Date.now(),
  } as any);
});

describe('AnalyticsDashboard', () => {
  it('should render page header with title', () => {
    renderWithProviders(<AnalyticsDashboard />);
    
    // Subtask 1.5: Add page header with title "Innovation Analytics"
    expect(screen.getByText(/Innovation Analytics/i)).toBeInTheDocument();
  });

  it('should render breadcrumb navigation', () => {
    const { container } = renderWithProviders(<AnalyticsDashboard />);
    
    // Subtask 1.6: Include breadcrumb navigation
    const breadcrumbs = container.querySelector('.breadcrumbs');
    expect(breadcrumbs).toBeInTheDocument();
    expect(breadcrumbs?.textContent).toContain('Admin Dashboard');
    expect(breadcrumbs?.textContent).toContain('Analytics');
  });

  it('should render with responsive grid layout', () => {
    const { container } = renderWithProviders(<AnalyticsDashboard />);
    
    // Subtask 1.2: Implement responsive grid layout
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('should render data refresh timestamp', () => {
    renderWithProviders(<AnalyticsDashboard />);
    
    // Task 4: Add data refresh timestamp display
    expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
  });

  it('should render loading state initially', () => {
    // Override mock for loading state
    vi.mocked(useAnalytics).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      dataUpdatedAt: 0,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);
    
    // Task 10: Implement loading states
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const mockRefetch = vi.fn();
    
    // Override mock for error state
    vi.mocked(useAnalytics).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
      refetch: mockRefetch,
      dataUpdatedAt: 0,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);
    
    // Task 11: Implement error states
    expect(screen.getByText(/Failed to load analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Retry/i)).toBeInTheDocument();
  });
});
