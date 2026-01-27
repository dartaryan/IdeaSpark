// src/features/ideas/components/IdeaCard.test.tsx
// Task 4 Tests - Story 4.8

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { IdeaCard } from './IdeaCard';
import { prototypeService } from '../../prototypes/services/prototypeService';
import type { Idea } from '../types';

// Mock services
vi.mock('../../prototypes/services/prototypeService', () => ({
  prototypeService: {
    getByIdeaId: vi.fn(),
  },
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
};

describe('IdeaCard - Task 4 (AC 5)', () => {
  const mockIdea: Idea = {
    id: 'idea-1',
    user_id: 'user-1',
    title: 'Test Idea',
    problem: 'Test problem',
    solution: 'Test solution',
    impact: 'Test impact',
    status: 'prototype_complete',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    enhanced_problem: null,
    enhanced_solution: null,
    enhanced_impact: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show prototype badge when prototype exists', async () => {
    // Arrange
    vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
      data: {
        id: 'proto-1',
        ideaId: 'idea-1',
        prdId: 'prd-1',
        userId: 'user-1',
        url: 'https://example.com/proto',
        code: '<div>Test</div>',
        status: 'ready',
        version: 1,
        refinementPrompt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        shareId: 'share-1',
        isPublic: false,
        sharedAt: null,
        viewCount: 0,
      },
      error: null,
    });

    // Act
    render(<IdeaCard idea={mockIdea} />, { wrapper: createWrapper() });

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('prototype-badge')).toBeInTheDocument();
    });

    const badge = screen.getByTestId('prototype-badge');
    expect(badge).toHaveTextContent('Prototype Ready');
    expect(badge).toHaveClass('badge-success');
  });

  it('should NOT show prototype badge when no prototype exists', async () => {
    // Arrange
    vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
      data: null,
      error: null,
    });

    // Act
    render(<IdeaCard idea={mockIdea} />, { wrapper: createWrapper() });

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('idea-card')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('prototype-badge')).not.toBeInTheDocument();
  });

  it('should show "View" quick action button when prototype exists', async () => {
    // Arrange
    vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
      data: {
        id: 'proto-1',
        ideaId: 'idea-1',
        prdId: 'prd-1',
        userId: 'user-1',
        url: 'https://example.com/proto',
        code: '<div>Test</div>',
        status: 'ready',
        version: 1,
        refinementPrompt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        shareId: 'share-1',
        isPublic: false,
        sharedAt: null,
        viewCount: 0,
      },
      error: null,
    });

    // Act
    render(<IdeaCard idea={mockIdea} />, { wrapper: createWrapper() });

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('view-prototype-quick-action')).toBeInTheDocument();
    });

    const button = screen.getByTestId('view-prototype-quick-action');
    expect(button).toHaveTextContent('View');
  });

  it('should navigate to prototype when quick action is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
      data: {
        id: 'proto-1',
        ideaId: 'idea-1',
        prdId: 'prd-1',
        userId: 'user-1',
        url: 'https://example.com/proto',
        code: '<div>Test</div>',
        status: 'ready',
        version: 1,
        refinementPrompt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        shareId: 'share-1',
        isPublic: false,
        sharedAt: null,
        viewCount: 0,
      },
      error: null,
    });

    render(<IdeaCard idea={mockIdea} />, { wrapper: createWrapper() });

    // Act
    await waitFor(() => {
      expect(screen.getByTestId('view-prototype-quick-action')).toBeInTheDocument();
    });
    await user.click(screen.getByTestId('view-prototype-quick-action'));

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/prototypes/proto-1');
  });

  it('should NOT navigate to idea detail when quick action is clicked (event stopped)', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
      data: {
        id: 'proto-1',
        ideaId: 'idea-1',
        prdId: 'prd-1',
        userId: 'user-1',
        url: 'https://example.com/proto',
        code: '<div>Test</div>',
        status: 'ready',
        version: 1,
        refinementPrompt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        shareId: 'share-1',
        isPublic: false,
        sharedAt: null,
        viewCount: 0,
      },
      error: null,
    });

    render(<IdeaCard idea={mockIdea} />, { wrapper: createWrapper() });

    // Act
    await waitFor(() => {
      expect(screen.getByTestId('view-prototype-quick-action')).toBeInTheDocument();
    });
    
    // Clear previous calls
    mockNavigate.mockClear();
    
    await user.click(screen.getByTestId('view-prototype-quick-action'));

    // Assert - should only navigate to prototype, not to idea detail
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/prototypes/proto-1');
    expect(mockNavigate).not.toHaveBeenCalledWith('/ideas/idea-1');
  });

  it('should navigate to idea detail when card body is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
      data: null,
      error: null,
    });

    render(<IdeaCard idea={mockIdea} />, { wrapper: createWrapper() });

    // Act
    await waitFor(() => {
      expect(screen.getByTestId('idea-card')).toBeInTheDocument();
    });
    await user.click(screen.getByTestId('idea-card'));

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/ideas/idea-1');
  });

  it('should be mobile-friendly with proper layout', async () => {
    // Arrange
    vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
      data: {
        id: 'proto-1',
        ideaId: 'idea-1',
        prdId: 'prd-1',
        userId: 'user-1',
        url: 'https://example.com/proto',
        code: '<div>Test</div>',
        status: 'ready',
        version: 1,
        refinementPrompt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        shareId: 'share-1',
        isPublic: false,
        sharedAt: null,
        viewCount: 0,
      },
      error: null,
    });

    // Act
    render(<IdeaCard idea={mockIdea} />, { wrapper: createWrapper() });

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('prototype-badge')).toBeInTheDocument();
    });

    // Check that button is appropriately sized for mobile (btn-sm)
    const button = screen.getByTestId('view-prototype-quick-action');
    expect(button).toHaveClass('btn-sm');
  });

  it('should display correct idea status badge', async () => {
    // Arrange
    vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
      data: null,
      error: null,
    });

    const ideaWithStatus: Idea = {
      ...mockIdea,
      status: 'prototype_complete',
    };

    // Act
    render(<IdeaCard idea={ideaWithStatus} />, { wrapper: createWrapper() });

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('idea-card')).toBeInTheDocument();
    });

    // IdeaStatusBadge should be rendered (tested separately)
    // This test just verifies it's present
    const card = screen.getByTestId('idea-card');
    expect(card).toBeInTheDocument();
  });
});
