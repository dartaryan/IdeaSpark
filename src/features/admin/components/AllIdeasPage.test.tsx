// src/features/admin/components/AllIdeasPage.test.tsx
// Test suite for AllIdeasPage component

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AllIdeasPage } from './AllIdeasPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock the hooks
vi.mock('../hooks/useAllIdeas', () => ({
  useAllIdeas: vi.fn(),
}));

// Mock child components
vi.mock('./IdeaFilters', () => ({
  IdeaFilters: () => null,
}));

vi.mock('./IdeaListItem', () => ({
  IdeaListItem: () => null,
}));

const { useAllIdeas } = await import('../hooks/useAllIdeas');

// Test wrapper with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('AllIdeasPage', () => {
  it('renders page header with "All Ideas" title', () => {
    // Mock loading state
    vi.mocked(useAllIdeas).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AllIdeasPage />
      </TestWrapper>
    );

    expect(screen.getByText('All Ideas')).toBeInTheDocument();
  });

  it('renders count badge showing number of ideas', () => {
    // Mock with ideas data
    vi.mocked(useAllIdeas).mockReturnValue({
      data: [
        { id: '1', title: 'Idea 1' },
        { id: '2', title: 'Idea 2' },
      ],
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AllIdeasPage />
      </TestWrapper>
    );

    // Should show count badge
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows loading spinner while data is fetching', () => {
    vi.mocked(useAllIdeas).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AllIdeasPage />
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when data fetching fails', () => {
    vi.mocked(useAllIdeas).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch ideas'),
    } as any);

    render(
      <TestWrapper>
        <AllIdeasPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Failed to load ideas/i)).toBeInTheDocument();
  });

  it('has responsive grid layout structure', () => {
    vi.mocked(useAllIdeas).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(
      <TestWrapper>
        <AllIdeasPage />
      </TestWrapper>
    );

    // Check for grid layout classes
    const mainContainer = container.querySelector('.max-w-7xl');
    expect(mainContainer).toBeInTheDocument();
  });
});
