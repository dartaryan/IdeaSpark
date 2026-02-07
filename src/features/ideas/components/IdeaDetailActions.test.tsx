// src/features/ideas/components/IdeaDetailActions.test.tsx
// Task 2, Task 3, Task 9 Tests - Story 4.8

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { IdeaDetailActions } from './IdeaDetailActions';
import { prdService } from '../../prd/services/prdService';
import { prototypeService } from '../../prototypes/services/prototypeService';
import type { Idea } from '../types';

// Mock services
vi.mock('../../prd/services/prdService', () => ({
  prdService: {
    getPrdByIdeaId: vi.fn(),
  },
}));

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

describe('IdeaDetailActions - Story 4.8', () => {
  const mockIdea: Idea = {
    id: 'idea-1',
    user_id: 'user-1',
    title: 'Test Idea',
    problem: 'Test problem',
    solution: 'Test solution',
    impact: 'Test impact',
    status: 'approved',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    enhanced_problem: null,
    enhanced_solution: null,
    enhanced_impact: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task 2: View Prototype button (AC 2)', () => {
    it('should show "View Prototype" button when prototype exists', async () => {
      // Arrange
      vi.mocked(prdService.getPrdByIdeaId).mockResolvedValue({
        data: {
          id: 'prd-1',
          idea_id: 'idea-1',
          user_id: 'user-1',
          content: {},
          status: 'complete',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          completed_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
        data: {
          id: 'proto-1',
          ideaId: 'idea-1',
          prdId: 'prd-1',
          userId: 'user-1',
          url: 'https://example.com/proto',
          code: '<div>Test</div>',
          status: 'ready',
          version: 2,
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
      render(<IdeaDetailActions idea={mockIdea} />, { wrapper: createWrapper() });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('view-prototype-button')).toBeInTheDocument();
      });

      const button = screen.getByTestId('view-prototype-button');
      expect(button).toHaveTextContent('View Prototype');
      expect(button).toHaveTextContent('v2'); // Version badge
    });

    it('should navigate to prototype viewer when "View Prototype" is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(prdService.getPrdByIdeaId).mockResolvedValue({
        data: null,
        error: null,
      });

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

      render(<IdeaDetailActions idea={mockIdea} />, { wrapper: createWrapper() });

      // Act
      await waitFor(() => {
        expect(screen.getByTestId('view-prototype-button')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('view-prototype-button'));

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/prototypes/proto-1');
    });
  });

  describe('Task 3: Generate Prototype button (AC 3)', () => {
    it('should show "Generate Prototype" button when PRD is complete but no prototype', async () => {
      // Arrange
      vi.mocked(prdService.getPrdByIdeaId).mockResolvedValue({
        data: {
          id: 'prd-1',
          idea_id: 'idea-1',
          user_id: 'user-1',
          content: {},
          status: 'complete',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          completed_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
        data: null, // No prototype
        error: null,
      });

      // Act
      render(<IdeaDetailActions idea={mockIdea} />, { wrapper: createWrapper() });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('generate-prototype-button')).toBeInTheDocument();
      });

      const button = screen.getByTestId('generate-prototype-button');
      expect(button).toHaveTextContent('Generate Prototype');
    });

    it('should NOT show "Generate Prototype" when prototype already exists', async () => {
      // Arrange
      vi.mocked(prdService.getPrdByIdeaId).mockResolvedValue({
        data: {
          id: 'prd-1',
          idea_id: 'idea-1',
          user_id: 'user-1',
          content: {},
          status: 'complete',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          completed_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

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
      render(<IdeaDetailActions idea={mockIdea} />, { wrapper: createWrapper() });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('view-prototype-button')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('generate-prototype-button')).not.toBeInTheDocument();
    });

    it('should navigate to PRD page when "Generate Prototype" is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(prdService.getPrdByIdeaId).mockResolvedValue({
        data: {
          id: 'prd-1',
          idea_id: 'idea-1',
          user_id: 'user-1',
          content: {},
          status: 'complete',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          completed_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
        data: null,
        error: null,
      });

      render(<IdeaDetailActions idea={mockIdea} />, { wrapper: createWrapper() });

      // Act
      await waitFor(() => {
        expect(screen.getByTestId('generate-prototype-button')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('generate-prototype-button'));

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/prd/view/prd-1');
    });
  });

  describe('Task 9: Button priority and visibility', () => {
    it('should show loading skeleton while fetching data', () => {
      // Arrange - don't resolve promises immediately
      vi.mocked(prdService.getPrdByIdeaId).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      vi.mocked(prototypeService.getByIdeaId).mockImplementation(
        () => new Promise(() => {})
      );

      // Act
      render(<IdeaDetailActions idea={mockIdea} />, { wrapper: createWrapper() });

      // Assert
      const skeletons = screen.getAllByText((content, element) => {
        return element?.className?.includes('skeleton') ?? false;
      });
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show "Build PRD" button when no PRD exists', async () => {
      // Arrange
      vi.mocked(prdService.getPrdByIdeaId).mockResolvedValue({
        data: null,
        error: null,
      });

      vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      render(<IdeaDetailActions idea={mockIdea} />, { wrapper: createWrapper() });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('build-prd-button')).toBeInTheDocument();
      });
    });

    it('should show "Continue Building PRD" when PRD is draft', async () => {
      // Arrange
      vi.mocked(prdService.getPrdByIdeaId).mockResolvedValue({
        data: {
          id: 'prd-1',
          idea_id: 'idea-1',
          user_id: 'user-1',
          content: {},
          status: 'draft',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          completed_at: null,
        },
        error: null,
      });

      vi.mocked(prototypeService.getByIdeaId).mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      render(<IdeaDetailActions idea={mockIdea} />, { wrapper: createWrapper() });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('continue-prd-button')).toBeInTheDocument();
      });
    });

    it('should prioritize prototype actions over PRD actions', async () => {
      // Arrange - both PRD and prototype exist
      vi.mocked(prdService.getPrdByIdeaId).mockResolvedValue({
        data: {
          id: 'prd-1',
          idea_id: 'idea-1',
          user_id: 'user-1',
          content: {},
          status: 'complete',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          completed_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

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
      render(<IdeaDetailActions idea={mockIdea} />, { wrapper: createWrapper() });

      // Assert - View Prototype should be primary action (btn-primary)
      await waitFor(() => {
        const viewProtoButton = screen.getByTestId('view-prototype-button');
        expect(viewProtoButton).toBeInTheDocument();
        expect(viewProtoButton).toHaveClass('btn-primary');
      });

      // View PRD should be secondary (btn-ghost)
      const viewPrdButton = screen.getByTestId('view-prd-button');
      expect(viewPrdButton).toHaveClass('btn-ghost');
    });
  });
});
