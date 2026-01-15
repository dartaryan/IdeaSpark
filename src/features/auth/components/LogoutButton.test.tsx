import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/test-utils';
import { LogoutButton } from './LogoutButton';

// Mock useAuth hook
const mockLogout = vi.fn();
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
    user: { id: '123', email: 'test@example.com', role: 'user' },
  }),
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
  });

  it('should render with default text', () => {
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('should render with custom children text', () => {
    render(<LogoutButton>Log Out</LogoutButton>);
    // Button has aria-label="Sign out" which takes precedence for accessible name
    // So we check the button exists and contains the custom text
    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Log Out');
  });

  it('should render with logout icon by default', () => {
    render(<LogoutButton />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should hide icon when showIcon is false', () => {
    render(<LogoutButton showIcon={false} />);
    const button = screen.getByRole('button');
    // Button should only have text, no SVG when not loading
    expect(button.querySelector('svg')).not.toBeInTheDocument();
  });

  it('should apply primary variant class', () => {
    render(<LogoutButton variant="primary" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
  });

  it('should apply ghost variant class by default', () => {
    render(<LogoutButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-ghost');
  });

  it('should apply outline variant class', () => {
    render(<LogoutButton variant="outline" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-outline');
  });

  it('should apply size classes', () => {
    const { rerender } = render(<LogoutButton size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('btn-sm');

    rerender(<LogoutButton size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('btn-lg');

    rerender(<LogoutButton size="xs" />);
    expect(screen.getByRole('button')).toHaveClass('btn-xs');
  });

  it('should apply custom className', () => {
    render(<LogoutButton className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should call logout when clicked', async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should show loading spinner during logout', async () => {
    const user = userEvent.setup();
    // Make logout take some time
    mockLogout.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<LogoutButton />);
    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button').querySelector('.loading')).toBeInTheDocument();
    });
  });

  it('should disable button during logout', async () => {
    const user = userEvent.setup();
    mockLogout.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<LogoutButton />);
    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('should have proper accessibility label', () => {
    render(<LogoutButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Sign out');
  });

  it('should handle logout errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLogout.mockRejectedValue(new Error('Network error'));

    render(<LogoutButton />);
    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
