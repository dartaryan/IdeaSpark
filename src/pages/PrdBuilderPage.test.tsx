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

// Mock usePrdBuilder hook
vi.mock('../features/prd/hooks/usePrdBuilder', () => ({
  usePrdBuilder: vi.fn(() => ({
    prdContent: {},
    highlightedSections: new Set(),
    saveStatus: 'idle' as const,
    lastSaved: null,
    saveError: null,
    isLoading: false,
    handleSectionUpdates: vi.fn(),
    setPrdContent: vi.fn(),
    triggerSave: vi.fn(),
    clearSaveError: vi.fn(),
    completionValidation: {
      isReady: false,
      completedCount: 0,
      totalRequired: 6,
      sectionResults: [],
      incompleteRequired: [],
    },
    canMarkComplete: false,
    focusedSection: null,
    focusOnSection: vi.fn(),
    clearFocusedSection: vi.fn(),
  })),
  prdBuilderQueryKeys: {
    prd: (id: string) => ['prd', id] as const,
  },
}));

// Mock ChatInterface services
vi.mock('../features/prd/services/prdChatService', () => ({
  prdChatService: {
    getWelcomeMessage: vi.fn().mockResolvedValue({
      data: { aiMessage: 'Welcome to PRD development!' },
      error: null,
    }),
    sendMessage: vi.fn(),
    formatMessageHistory: vi.fn(),
  },
}));

vi.mock('../features/prd/services/prdMessageService', () => ({
  prdMessageService: {
    getMessagesByPrdId: vi.fn().mockResolvedValue({
      data: [],
      error: null,
    }),
    addMessage: vi.fn().mockResolvedValue({
      data: {
        id: '1',
        prd_id: 'prd-123',
        role: 'assistant',
        content: 'Welcome to PRD development!',
        created_at: new Date().toISOString(),
      },
      error: null,
    }),
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

    // Check that skeleton is rendered (has animate-pulse class)
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
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

    // ChatInterface is now functional, check for input field instead
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
    });
    
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

    // ChatInterface now shows welcome message from usePrdChat hook
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Welcome message should appear from the chat service
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    }, { timeout: 10000 });
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
