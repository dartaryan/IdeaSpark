import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PrdBuilderPage } from './PrdBuilderPage';
import { ideaService } from '../features/ideas/services/ideaService';
import { prdService } from '../features/prd/services/prdService';
import type { Idea } from '../features/ideas/types';
import type { PrdDocument } from '../features/prd/types';

// Mock services
vi.mock('../features/ideas/services/ideaService', () => ({
  ideaService: {
    getIdeaById: vi.fn(),
  },
}));

vi.mock('../features/prd/services/prdService', () => ({
  prdService: {
    getPrdByIdeaId: vi.fn(),
    createPrd: vi.fn(),
  },
}));

const mockIdeaService = vi.mocked(ideaService);
const mockPrdService = vi.mocked(prdService);

describe('PrdBuilderPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/prd/idea-123']}>
        <Routes>
          <Route path="/prd/:id" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  const mockIdea: Idea = {
    id: 'idea-123',
    user_id: 'user-1',
    title: 'Test Idea',
    problem: 'Problem statement',
    solution: 'Proposed solution',
    impact: 'Expected impact',
    enhanced_problem: null,
    enhanced_solution: null,
    enhanced_impact: null,
    status: 'approved',
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-01-20T12:00:00Z',
  };

  const mockPrd: PrdDocument = {
    id: 'prd-123',
    idea_id: 'idea-123',
    user_id: 'user-1',
    status: 'draft',
    content: {
      problemStatement: { content: '', status: 'empty' },
      goalsAndMetrics: { content: '', status: 'empty' },
      userStories: { content: '', status: 'empty' },
      requirements: { content: '', status: 'empty' },
      technicalConsiderations: { content: '', status: 'empty' },
      risks: { content: '', status: 'empty' },
      timeline: { content: '', status: 'empty' },
    },
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-01-20T12:00:00Z',
  };

  it('displays loading skeleton while fetching data', () => {
    mockIdeaService.getIdeaById.mockReturnValue(new Promise(() => {}));

    render(<PrdBuilderPage />, { wrapper });

    expect(screen.getByRole('generic', { hidden: true })).toHaveClass('animate-pulse');
  });

  it('displays PRD builder layout when data is loaded', async () => {
    mockIdeaService.getIdeaById.mockResolvedValue({
      data: mockIdea,
      error: null,
    });
    mockPrdService.getPrdByIdeaId.mockResolvedValue({
      data: mockPrd,
      error: null,
    });

    render(<PrdBuilderPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/PRD:/)).toBeInTheDocument();
    });

    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('PRD Preview')).toBeInTheDocument();
  });

  it('displays all 7 PRD sections', async () => {
    mockIdeaService.getIdeaById.mockResolvedValue({
      data: mockIdea,
      error: null,
    });
    mockPrdService.getPrdByIdeaId.mockResolvedValue({
      data: mockPrd,
      error: null,
    });

    render(<PrdBuilderPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Problem Statement')).toBeInTheDocument();
    });

    expect(screen.getByText('Goals & Metrics')).toBeInTheDocument();
    expect(screen.getByText('User Stories')).toBeInTheDocument();
    expect(screen.getByText('Requirements')).toBeInTheDocument();
    expect(screen.getByText('Technical Considerations')).toBeInTheDocument();
    expect(screen.getByText('Risks')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('displays idea not found error when idea does not exist', async () => {
    mockIdeaService.getIdeaById.mockResolvedValue({
      data: null,
      error: null,
    });

    render(<PrdBuilderPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Idea Not Found')).toBeInTheDocument();
    });
  });

  it('displays not approved error when idea is not approved', async () => {
    const unapprovedIdea = { ...mockIdea, status: 'pending' as const };
    mockIdeaService.getIdeaById.mockResolvedValue({
      data: unapprovedIdea,
      error: null,
    });

    render(<PrdBuilderPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Idea Not Approved Yet')).toBeInTheDocument();
    });
  });

  it('displays generic error when fetch fails', async () => {
    mockIdeaService.getIdeaById.mockResolvedValue({
      data: null,
      error: { message: 'Database error', code: 'DB_ERROR' },
    });

    render(<PrdBuilderPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    });
  });

  it('auto-creates PRD when idea is approved and no PRD exists', async () => {
    mockIdeaService.getIdeaById.mockResolvedValue({
      data: mockIdea,
      error: null,
    });
    mockPrdService.getPrdByIdeaId.mockResolvedValue({
      data: null,
      error: null,
    });
    mockPrdService.createPrd.mockResolvedValue({
      data: mockPrd,
      error: null,
    });

    render(<PrdBuilderPage />, { wrapper });

    await waitFor(() => {
      expect(mockPrdService.createPrd).toHaveBeenCalledWith('idea-123');
    });
  });

  it('displays chat placeholder with welcome message', async () => {
    mockIdeaService.getIdeaById.mockResolvedValue({
      data: mockIdea,
      error: null,
    });
    mockPrdService.getPrdByIdeaId.mockResolvedValue({
      data: mockPrd,
      error: null,
    });

    render(<PrdBuilderPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Welcome!/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Chat functionality coming in the next update/)).toBeInTheDocument();
  });

  it('displays idea summary in header', async () => {
    mockIdeaService.getIdeaById.mockResolvedValue({
      data: mockIdea,
      error: null,
    });
    mockPrdService.getPrdByIdeaId.mockResolvedValue({
      data: mockPrd,
      error: null,
    });

    render(<PrdBuilderPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/PRD: Test Idea/)).toBeInTheDocument();
    });
  });
});
