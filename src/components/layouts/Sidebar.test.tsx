import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/test-utils';
import { Sidebar } from './Sidebar';

// Mock useAuth hook
const mockUser = vi.fn();
vi.mock('../../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser(),
    isLoading: false,
    isAuthenticated: true,
  }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('for regular user', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({
        id: '123',
        email: 'user@example.com',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    it('should render user navigation items', () => {
      render(<Sidebar />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /my ideas/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /new idea/i })).toBeInTheDocument();
    });

    it('should not render admin navigation items for regular user', () => {
      render(<Sidebar />);

      expect(screen.queryByRole('link', { name: /admin dashboard/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /analytics/i })).not.toBeInTheDocument();
    });

    it('should display user role badge', () => {
      render(<Sidebar />);

      expect(screen.getByText('user')).toBeInTheDocument();
    });

    it('should have correct link paths', () => {
      render(<Sidebar />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
      expect(screen.getByRole('link', { name: /my ideas/i })).toHaveAttribute('href', '/ideas');
      expect(screen.getByRole('link', { name: /new idea/i })).toHaveAttribute('href', '/ideas/new');
    });
  });

  describe('for admin user', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({
        id: '456',
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    it('should render all navigation items including admin items', () => {
      render(<Sidebar />);

      // User items - use exact text match to avoid matching Admin Dashboard
      expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /my ideas/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /new idea/i })).toBeInTheDocument();

      // Admin items
      expect(screen.getByRole('link', { name: /admin dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument();
    });

    it('should display admin role badge', () => {
      render(<Sidebar />);

      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('should have correct admin link paths', () => {
      render(<Sidebar />);

      expect(screen.getByRole('link', { name: /admin dashboard/i })).toHaveAttribute('href', '/admin');
      expect(screen.getByRole('link', { name: /analytics/i })).toHaveAttribute('href', '/admin/analytics');
    });
  });

  describe('interactions', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({
        id: '123',
        email: 'user@example.com',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    it('should call onNavClick when a nav item is clicked', async () => {
      const user = userEvent.setup();
      const onNavClick = vi.fn();

      render(<Sidebar onNavClick={onNavClick} />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      await user.click(dashboardLink);

      expect(onNavClick).toHaveBeenCalledTimes(1);
    });

    it('should render mobile logo', () => {
      render(<Sidebar />);

      // The mobile logo contains "IdeaSpark" text
      expect(screen.getByText('Idea')).toBeInTheDocument();
      expect(screen.getByText('Spark')).toBeInTheDocument();
    });
  });

  describe('when user is null', () => {
    beforeEach(() => {
      mockUser.mockReturnValue(null);
    });

    it('should still render navigation items', () => {
      render(<Sidebar />);

      // Nav items should render, but filtering may not work without user
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should not display role badge when user is null', () => {
      render(<Sidebar />);

      expect(screen.queryByText('user')).not.toBeInTheDocument();
      expect(screen.queryByText('admin')).not.toBeInTheDocument();
    });
  });
});
