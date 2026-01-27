// src/features/admin/components/RecentSubmissions.test.tsx
// Task 6 Tests - Story 5.1

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { RecentSubmissions } from './RecentSubmissions';

// Mock useRecentSubmissions hook
const mockUseRecentSubmissions = vi.fn();
vi.mock('../hooks/useRecentSubmissions', () => ({
  useRecentSubmissions: () => mockUseRecentSubmissions(),
}));

describe('RecentSubmissions - Task 6', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Subtask 6.2: Fetch last 10 submitted ideas', () => {
    it('should display list of recent submissions', () => {
      const mockSubmissions = [
        {
          id: '1',
          title: 'First Idea Title That Is Very Long',
          submitter_name: 'John Doe',
          created_at: '2026-01-26T10:00:00Z',
        },
        {
          id: '2',
          title: 'Second Idea',
          submitter_name: 'Jane Smith',
          created_at: '2026-01-25T15:30:00Z',
        },
      ];

      mockUseRecentSubmissions.mockReturnValue({
        data: mockSubmissions,
        isLoading: false,
        error: null,
      });

      render(<RecentSubmissions />);

      // Should display both submissions
      expect(screen.getByText(/First Idea Title/)).toBeInTheDocument();
      expect(screen.getByText('Second Idea')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should limit title display to first 50 characters', () => {
      const longTitle = 'A'.repeat(60); // 60 characters
      const mockSubmissions = [
        {
          id: '1',
          title: longTitle,
          submitter_name: 'John Doe',
          created_at: '2026-01-26T10:00:00Z',
        },
      ];

      mockUseRecentSubmissions.mockReturnValue({
        data: mockSubmissions,
        isLoading: false,
        error: null,
      });

      render(<RecentSubmissions />);

      // Should truncate to 50 chars with ellipsis
      const displayedText = screen.getByText(/A{50}/);
      expect(displayedText.textContent?.length).toBeLessThanOrEqual(53); // 50 + "..."
    });
  });

  describe('Subtask 6.3: Display list with required info', () => {
    it('should display idea title, submitter name, and submission date', () => {
      const mockSubmissions = [
        {
          id: '1',
          title: 'Test Idea',
          submitter_name: 'John Doe',
          created_at: '2026-01-26T10:00:00Z',
        },
      ];

      mockUseRecentSubmissions.mockReturnValue({
        data: mockSubmissions,
        isLoading: false,
        error: null,
      });

      render(<RecentSubmissions />);

      expect(screen.getByText('Test Idea')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      // Date should be formatted and displayed
      expect(screen.getByText(/Jan/)).toBeInTheDocument();
    });
  });

  describe('Subtask 6.4: View link to idea detail', () => {
    it('should render View link for each submission', () => {
      const mockSubmissions = [
        {
          id: 'idea-123',
          title: 'Test Idea',
          submitter_name: 'John Doe',
          created_at: '2026-01-26T10:00:00Z',
        },
      ];

      mockUseRecentSubmissions.mockReturnValue({
        data: mockSubmissions,
        isLoading: false,
        error: null,
      });

      render(<RecentSubmissions />);

      const viewLink = screen.getByRole('link', { name: /view/i });
      expect(viewLink).toBeInTheDocument();
      expect(viewLink).toHaveAttribute('href', '/ideas/idea-123');
    });

    it('should render View link for all submissions', () => {
      const mockSubmissions = [
        {
          id: '1',
          title: 'Idea 1',
          submitter_name: 'User 1',
          created_at: '2026-01-26T10:00:00Z',
        },
        {
          id: '2',
          title: 'Idea 2',
          submitter_name: 'User 2',
          created_at: '2026-01-25T10:00:00Z',
        },
      ];

      mockUseRecentSubmissions.mockReturnValue({
        data: mockSubmissions,
        isLoading: false,
        error: null,
      });

      render(<RecentSubmissions />);

      const viewLinks = screen.getAllByRole('link', { name: /view/i });
      expect(viewLinks).toHaveLength(2);
    });
  });

  describe('Subtask 6.5: Empty state', () => {
    it('should show empty state when no submissions exist', () => {
      mockUseRecentSubmissions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<RecentSubmissions />);

      expect(screen.getByText(/no recent submissions/i)).toBeInTheDocument();
    });

    it('should show empty state when data is null', () => {
      mockUseRecentSubmissions.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<RecentSubmissions />);

      expect(screen.getByText(/no recent submissions/i)).toBeInTheDocument();
    });
  });

  describe('Loading and error states', () => {
    it('should show loading state while fetching', () => {
      mockUseRecentSubmissions.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<RecentSubmissions />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show error message when fetch fails', () => {
      mockUseRecentSubmissions.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch submissions'),
      });

      render(<RecentSubmissions />);

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  describe('PassportCard Design System compliance', () => {
    it('should use 20px border radius on card', () => {
      mockUseRecentSubmissions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { container } = render(<RecentSubmissions />);

      const card = container.querySelector('.card');
      const style = card?.getAttribute('style');
      expect(style).toContain('border-radius');
      expect(style).toContain('20px');
    });

    it('should use Rubik font for body text', () => {
      const mockSubmissions = [
        {
          id: '1',
          title: 'Test Idea',
          submitter_name: 'John Doe',
          created_at: '2026-01-26T10:00:00Z',
        },
      ];

      mockUseRecentSubmissions.mockReturnValue({
        data: mockSubmissions,
        isLoading: false,
        error: null,
      });

      const { container } = render(<RecentSubmissions />);

      // Check for Rubik font in submitter name or other text
      const textElements = container.querySelectorAll('[style*="Rubik"]');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });
});
