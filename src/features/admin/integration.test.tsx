// src/features/admin/integration.test.tsx
// Task 8 Integration Test - Story 5.1

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { AdminDashboard } from './components/AdminDashboard';
import { adminService } from './services/adminService';

// Mock services
vi.mock('./services/adminService', () => ({
  adminService: {
    getMetrics: vi.fn(),
  },
}));

vi.mock('./hooks/useRecentSubmissions', () => ({
  useRecentSubmissions: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

describe('Admin Dashboard Integration - Task 8', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render complete admin dashboard with all components', async () => {
    const mockMetrics = {
      submitted: 10,
      approved: 5,
      prd_development: 3,
      prototype_complete: 2,
      rejected: 1,
    };

    vi.mocked(adminService.getMetrics).mockResolvedValue({
      data: mockMetrics,
      error: null,
    });

    render(<AdminDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Verify page header
    expect(screen.getByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();

    // Verify all 4 metric cards are present
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('PRD Development')).toBeInTheDocument();
    expect(screen.getByText('Prototype Complete')).toBeInTheDocument();

    // Verify metric counts are displayed
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Verify Recent Submissions section
    expect(screen.getByText('Recent Submissions')).toBeInTheDocument();
  });

  it('should display all components with PassportCard design system', async () => {
    vi.mocked(adminService.getMetrics).mockResolvedValue({
      data: {
        submitted: 0,
        approved: 0,
        prd_development: 0,
        prototype_complete: 0,
        rejected: 0,
      },
      error: null,
    });

    const { container } = render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Verify all cards have 20px border radius
    const cards = container.querySelectorAll('.card');
    expect(cards.length).toBeGreaterThan(0);
    
    cards.forEach((card) => {
      const style = card.getAttribute('style');
      expect(style).toContain('border-radius');
      expect(style).toContain('20px');
    });

    // Verify icons use neutral gray (#525355), not black
    const icons = container.querySelectorAll('svg[stroke]');
    icons.forEach((icon) => {
      const stroke = icon.getAttribute('stroke');
      expect(stroke).not.toBe('#000000');
      expect(stroke).not.toBe('black');
    });
  });
});
