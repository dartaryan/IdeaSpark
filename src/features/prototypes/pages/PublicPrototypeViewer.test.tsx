// src/features/prototypes/pages/PublicPrototypeViewer.test.tsx

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PublicPrototypeViewer } from './PublicPrototypeViewer';
import { prototypeService } from '../services/prototypeService';
import { supabase } from '../../../lib/supabase';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/prototypeService');

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const mockPublicPrototype = {
  id: 'proto-123',
  url: 'https://preview.example.com/proto-123',
  version: 2,
  status: 'ready' as const,
  createdAt: '2024-01-15T10:00:00Z',
  shareId: 'share-uuid-123',
  hasPassword: false,
};

const mockPasswordProtectedPrototype = {
  ...mockPublicPrototype,
  hasPassword: true,
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
    sessionStorage.clear();
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
    vi.mocked(prototypeService.checkShareLinkStatus).mockResolvedValue({
      data: 'not_found',
      error: null,
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

  // =============================================
  // Story 9.2 - Password Protection Tests
  // =============================================

  describe('Password Protection', () => {
    it('should show password prompt for password-protected prototype', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: mockPasswordProtectedPrototype,
        error: null,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('This prototype is password protected')).toBeInTheDocument();
      });

      expect(screen.getByTestId('verify-password-input')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /unlock/i })).toBeInTheDocument();
    });

    it('should show prototype viewer for non-password-protected prototype', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: mockPublicPrototype,
        error: null,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('This prototype is password protected')).not.toBeInTheDocument();
        expect(screen.getByText('View Only')).toBeInTheDocument();
      });
    });

    it('should show prototype after successful password verification', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: mockPasswordProtectedPrototype,
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { verified: true },
        error: null,
      });

      renderComponent();

      // Wait for password prompt
      await waitFor(() => {
        expect(screen.getByText('This prototype is password protected')).toBeInTheDocument();
      });

      // Enter password
      const passwordInput = screen.getByTestId('verify-password-input');
      fireEvent.change(passwordInput, { target: { value: 'correct-password' } });

      // Click unlock
      const unlockButton = screen.getByRole('button', { name: /unlock/i });
      fireEvent.click(unlockButton);

      // Should show prototype viewer
      await waitFor(() => {
        expect(screen.getByText('View Only')).toBeInTheDocument();
      });
    });

    it('should bypass password prompt when already verified in sessionStorage', async () => {
      // Pre-set sessionStorage verification
      sessionStorage.setItem('verified_prototype_share-uuid-123', 'true');

      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: mockPasswordProtectedPrototype,
        error: null,
      });

      renderComponent();

      // Should NOT show password prompt, should show prototype directly
      await waitFor(() => {
        expect(screen.queryByText('This prototype is password protected')).not.toBeInTheDocument();
        expect(screen.getByText('View Only')).toBeInTheDocument();
      });
    });

    it('should show error for incorrect password without blocking retry', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: mockPasswordProtectedPrototype,
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { verified: false },
        error: null,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('This prototype is password protected')).toBeInTheDocument();
      });

      // Enter wrong password
      const passwordInput = screen.getByTestId('verify-password-input');
      fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });

      const unlockButton = screen.getByRole('button', { name: /unlock/i });
      fireEvent.click(unlockButton);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText('Incorrect password')).toBeInTheDocument();
      });

      // Should still be on password page, not prototype viewer
      expect(screen.queryByText('View Only')).not.toBeInTheDocument();
    });
  });

  // =============================================
  // Story 9.3 - Link Expiration Tests
  // =============================================

  describe('Expired Link Handling', () => {
    it('should show expired link page when checkShareLinkStatus returns "expired"', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: null,
        error: { message: 'Prototype not found or not public', code: 'NOT_FOUND' },
      });
      vi.mocked(prototypeService.checkShareLinkStatus).mockResolvedValue({
        data: 'expired',
        error: null,
      });

      renderComponent('expired-share-id');

      await waitFor(() => {
        expect(screen.getByTestId('expired-link-page')).toBeInTheDocument();
      });

      expect(screen.getByText('Link Expired')).toBeInTheDocument();
      expect(screen.getByText(/this shared prototype link has expired/i)).toBeInTheDocument();
      expect(screen.getByText(/contact the person who shared this link/i)).toBeInTheDocument();

      // Should show link to IdeaSpark homepage
      const homeLink = screen.getByRole('link', { name: /go to ideaspark/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should show revoked link page when checkShareLinkStatus returns "revoked"', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: null,
        error: { message: 'Prototype not found or not public', code: 'NOT_FOUND' },
      });
      vi.mocked(prototypeService.checkShareLinkStatus).mockResolvedValue({
        data: 'revoked',
        error: null,
      });

      renderComponent('revoked-share-id');

      await waitFor(() => {
        expect(screen.getByTestId('revoked-link-page')).toBeInTheDocument();
      });

      expect(screen.getByText('Access Revoked')).toBeInTheDocument();
      expect(screen.getByText(/access to this shared prototype has been revoked/i)).toBeInTheDocument();
    });

    it('should show not found page when checkShareLinkStatus returns "not_found"', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: null,
        error: { message: 'Prototype not found or not public', code: 'NOT_FOUND' },
      });
      vi.mocked(prototypeService.checkShareLinkStatus).mockResolvedValue({
        data: 'not_found',
        error: null,
      });

      renderComponent('nonexistent-share-id');

      await waitFor(() => {
        expect(screen.getByText('Prototype Not Found')).toBeInTheDocument();
      });
    });

    it('should show not found page when checkShareLinkStatus returns "not_public"', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: null,
        error: { message: 'Prototype not found or not public', code: 'NOT_FOUND' },
      });
      vi.mocked(prototypeService.checkShareLinkStatus).mockResolvedValue({
        data: 'not_public',
        error: null,
      });

      renderComponent('private-share-id');

      await waitFor(() => {
        expect(screen.getByText('Prototype Not Found')).toBeInTheDocument();
      });
    });

    it('should fall back to not found page when checkShareLinkStatus fails', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: null,
        error: { message: 'Prototype not found or not public', code: 'NOT_FOUND' },
      });
      vi.mocked(prototypeService.checkShareLinkStatus).mockResolvedValue({
        data: null,
        error: { message: 'RPC failed', code: 'DB_ERROR' },
      });

      renderComponent('error-share-id');

      await waitFor(() => {
        expect(screen.getByText('Prototype Not Found')).toBeInTheDocument();
      });
    });

    it('should call checkShareLinkStatus when getPublicPrototype fails', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: null,
        error: { message: 'Prototype not found or not public', code: 'NOT_FOUND' },
      });
      vi.mocked(prototypeService.checkShareLinkStatus).mockResolvedValue({
        data: 'not_found',
        error: null,
      });

      renderComponent('some-share-id');

      await waitFor(() => {
        expect(prototypeService.checkShareLinkStatus).toHaveBeenCalledWith('some-share-id');
      });
    });
  });
});
