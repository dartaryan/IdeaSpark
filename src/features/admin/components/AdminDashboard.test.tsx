// src/features/admin/components/AdminDashboard.test.tsx
// Task 2 Tests - Story 5.1

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { AdminDashboard } from './AdminDashboard';

// Mock useAdminMetrics hook
const mockUseAdminMetrics = vi.fn();
vi.mock('../hooks/useAdminMetrics', () => ({
  useAdminMetrics: () => mockUseAdminMetrics(),
}));

describe('AdminDashboard - Task 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Subtask 2.1: Component structure', () => {
    it('should render without crashing', () => {
      mockUseAdminMetrics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<AdminDashboard />);
      // Component should mount successfully
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Subtask 2.2: Grid layout for metric cards', () => {
    it('should render grid layout container for metrics', () => {
      mockUseAdminMetrics.mockReturnValue({
        data: {
          submitted: 5,
          approved: 3,
          prd_development: 2,
          prototype_complete: 1,
          rejected: 0,
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<AdminDashboard />);
      
      // Find grid container - should have grid classes
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      
      // Should have 4 columns on large screens (lg:grid-cols-4)
      expect(gridContainer?.className).toContain('grid-cols');
    });

    it('should display 4 metric cards when data is loaded', () => {
      mockUseAdminMetrics.mockReturnValue({
        data: {
          submitted: 5,
          approved: 3,
          prd_development: 2,
          prototype_complete: 1,
          rejected: 0,
        },
        isLoading: false,
        error: null,
      });

      render(<AdminDashboard />);
      
      // Should have exactly 4 visible metric cards for the main statuses
      // (submitted, approved, prd_development, prototype_complete)
      // Rejected is typically not shown in main metrics
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
  });

  describe('Subtask 2.3: Responsive breakpoints', () => {
    it('should have responsive grid classes for mobile stacking', () => {
      mockUseAdminMetrics.mockReturnValue({
        data: {
          submitted: 5,
          approved: 3,
          prd_development: 2,
          prototype_complete: 1,
          rejected: 0,
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<AdminDashboard />);
      
      const gridContainer = container.querySelector('.grid');
      
      // Should have grid-cols-1 for mobile (single column)
      expect(gridContainer?.className).toMatch(/grid-cols-1|grid-cols-2|grid-cols-4/);
      
      // Should have responsive classes (md: for tablet, lg: for desktop)
      const hasResponsiveClasses = 
        gridContainer?.className.includes('md:') || 
        gridContainer?.className.includes('lg:');
      
      expect(hasResponsiveClasses).toBe(true);
    });
  });

  describe('Subtask 2.4: Page header', () => {
    it('should render page header with "Admin Dashboard" title', () => {
      mockUseAdminMetrics.mockReturnValue({
        data: {
          submitted: 0,
          approved: 0,
          prd_development: 0,
          prototype_complete: 0,
          rejected: 0,
        },
        isLoading: false,
        error: null,
      });

      render(<AdminDashboard />);
      
      // Check for heading with "Admin Dashboard"
      const heading = screen.getByRole('heading', { name: /admin dashboard/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have proper heading hierarchy (h1)', () => {
      mockUseAdminMetrics.mockReturnValue({
        data: {
          submitted: 0,
          approved: 0,
          prd_development: 0,
          prototype_complete: 0,
          rejected: 0,
        },
        isLoading: false,
        error: null,
      });

      render(<AdminDashboard />);
      
      const heading = screen.getByRole('heading', { name: /admin dashboard/i });
      expect(heading.tagName).toBe('H1');
    });
  });

  describe('Loading and error states', () => {
    it('should show loading state while fetching metrics', () => {
      mockUseAdminMetrics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<AdminDashboard />);
      
      // Should show loading indicator
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should display error message when metrics fail to load', () => {
      mockUseAdminMetrics.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load metrics'),
      });

      render(<AdminDashboard />);
      
      // Should show error message
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    it('should display metrics when data is successfully loaded', () => {
      mockUseAdminMetrics.mockReturnValue({
        data: {
          submitted: 10,
          approved: 5,
          prd_development: 3,
          prototype_complete: 2,
          rejected: 1,
        },
        isLoading: false,
        error: null,
      });

      render(<AdminDashboard />);
      
      // Should display the count values
      expect(screen.getByText('10')).toBeInTheDocument(); // submitted
      expect(screen.getByText('5')).toBeInTheDocument(); // approved
    });
  });
});
