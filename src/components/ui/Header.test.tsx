import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/test-utils';
import { Header } from './Header';

// Mock UserMenu component to simplify testing
vi.mock('../../features/auth/components/UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu">UserMenu</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the IdeaSpark logo', () => {
    render(<Header />);

    expect(screen.getByText('Idea')).toBeInTheDocument();
    expect(screen.getByText('Spark')).toBeInTheDocument();
  });

  it('should render the logo as a link to dashboard', () => {
    render(<Header />);

    const logoLink = screen.getByRole('link', { name: /ideaspark/i });
    expect(logoLink).toHaveAttribute('href', '/dashboard');
  });

  it('should render the user menu', () => {
    render(<Header />);

    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('should render the hamburger menu button', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('should call onMenuClick when hamburger button is clicked', async () => {
    const user = userEvent.setup();
    const onMenuClick = vi.fn();

    render(<Header onMenuClick={onMenuClick} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    await user.click(menuButton);

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('should not crash when onMenuClick is not provided', async () => {
    const user = userEvent.setup();

    render(<Header />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    
    // Should not throw when clicked without callback
    await expect(user.click(menuButton)).resolves.not.toThrow();
  });

  it('should apply additional className when provided', () => {
    render(<Header className="custom-class" />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-class');
  });

  it('should have sticky positioning', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
  });

  it('should have proper z-index for overlay', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('z-30');
  });

  it('should render lightbulb icon in logo', () => {
    render(<Header />);

    // The SVG icon should be present
    const logoLink = screen.getByRole('link', { name: /ideaspark/i });
    const svg = logoLink.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
