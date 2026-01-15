import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test/test-utils';
import { NotAuthorizedPage } from './NotAuthorizedPage';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
      <a href={to} className={className}>{children}</a>
    ),
  };
});

describe('NotAuthorizedPage', () => {
  it('should render access denied heading', () => {
    render(<NotAuthorizedPage />);
    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument();
  });

  it('should display explanatory message', () => {
    render(<NotAuthorizedPage />);
    expect(screen.getByText(/you don't have permission to access this page/i)).toBeInTheDocument();
  });

  it('should display admin privileges warning', () => {
    render(<NotAuthorizedPage />);
    expect(screen.getByText(/this area requires administrator privileges/i)).toBeInTheDocument();
  });

  it('should have a link to dashboard', () => {
    render(<NotAuthorizedPage />);
    const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('should render with DaisyUI card styling', () => {
    render(<NotAuthorizedPage />);
    // Check that the page has the expected structure with card
    const heading = screen.getByRole('heading', { name: /access denied/i });
    expect(heading).toHaveClass('card-title');
  });

  it('should display warning alert', () => {
    render(<NotAuthorizedPage />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('alert-warning');
  });
});
