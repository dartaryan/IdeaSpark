// src/features/prototypes/pages/PublicPrototypeViewer.test.tsx

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PublicPrototypeViewer } from './PublicPrototypeViewer';
import { prototypeService } from '../services/prototypeService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/prototypeService');

const mockPublicPrototype = {
  id: 'proto-123',
  url: 'https://preview.example.com/proto-123',
  version: 2,
  status: 'ready' as const,
  created_at: '2024-01-15T10:00:00Z',
  share_id: 'share-uuid-123',
};

describe('PublicPrototypeViewer', () => {
  let queryClient: QueryClient;

  const renderComponent = (shareId = 'share-uuid-123') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/share/prototype/${shareId}`]}>
          <Routes>
            <Route path="/share/prototype/:shareId" element={<PublicPrototypeViewer />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should show loading state while fetching prototype', () => {
    vi.mocked(prototypeService.getPublicPrototype).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderComponent();

    expect(screen.getByText('Loading prototype...')).toBeInTheDocument();
  });

  it('should display public prototype when loaded', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: mockPublicPrototype,
      error: null,
    });

    renderComponent();

    // Wait for the loading state to complete and content to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading prototype...')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(prototypeService.getPublicPrototype).toHaveBeenCalledWith('share-uuid-123');
    });

    // Should show IdeaSpark branding
    expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);

    // Should show version badge
    expect(screen.getByText(/v2/i)).toBeInTheDocument();

    // Should show "View Only" badge
    expect(screen.getByText('View Only')).toBeInTheDocument();

    // Should show iframe with prototype
    const iframe = screen.getByTitle(/ideaspark prototype - version 2/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', mockPublicPrototype.url);
  });

  it('should show error page for invalid share ID', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: null,
      error: { message: 'Prototype not found or not public', code: 'NOT_FOUND' },
    });

    renderComponent('invalid-share-id');

    await waitFor(() => {
      expect(screen.getByText('Prototype Not Found')).toBeInTheDocument();
    });

    expect(screen.getByText(/this prototype link is invalid or has been removed/i)).toBeInTheDocument();

    // Should show link to IdeaSpark homepage
    const homeLink = screen.getByRole('link', { name: /go to ideaspark/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should display device size selector', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: mockPublicPrototype,
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    // Should show device size buttons
    expect(screen.getByRole('button', { name: /desktop/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tablet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mobile/i })).toBeInTheDocument();
  });

  it('should toggle device size when button clicked', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: mockPublicPrototype,
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    const mobileButton = screen.getByRole('button', { name: /mobile/i });
    fireEvent.click(mobileButton);

    // Mobile button should have active class
    expect(mobileButton).toHaveClass('btn-active');

    // Desktop button should not have active class
    const desktopButton = screen.getByRole('button', { name: /desktop/i });
    expect(desktopButton).not.toHaveClass('btn-active');
  });

  it('should show creation date', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: mockPublicPrototype,
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    // Should show formatted creation date (flexible format since locale can vary)
    const createdTexts = screen.getAllByText(/created/i);
    expect(createdTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/15\.1\.2024|1\/15\/2024/)).toBeInTheDocument();
  });

  it('should show branded footer', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: mockPublicPrototype,
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    // Should show "This prototype was created with IdeaSpark" message
    expect(screen.getByText(/this prototype was created with/i)).toBeInTheDocument();
  });

  it('should handle prototype without URL', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: { ...mockPublicPrototype, url: null },
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    // Should show "Preview not available" message
    expect(screen.getByText('Preview not available')).toBeInTheDocument();
  });

  it('should apply sandbox attribute to iframe for security', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: mockPublicPrototype,
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    const iframe = screen.getByTitle(/ideaspark prototype/i);
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
  });

  it('should link to IdeaSpark homepage from header', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: mockPublicPrototype,
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    const headerLink = screen.getAllByRole('link', { name: /ideaspark/i })[0];
    expect(headerLink).toHaveAttribute('href', '/');
  });
});
