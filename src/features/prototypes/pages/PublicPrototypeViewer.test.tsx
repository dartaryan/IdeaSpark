// src/features/prototypes/pages/PublicPrototypeViewer.test.tsx

import React from 'react';
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

// Mock Sandpack components — Sandpack uses iframes internally and can't run in JSDOM
vi.mock('@codesandbox/sandpack-react', () => ({
  SandpackProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sandpack-provider">{children}</div>
  ),
  SandpackPreview: () => <div data-testid="sandpack-preview">Preview</div>,
}));

const mockMultiFileCode = JSON.stringify({
  '/App.tsx': 'export default function App() { return <div>Hello</div>; }',
  '/index.tsx': 'import App from "./App";',
});

const mockPublicPrototype = {
  id: 'proto-123',
  url: 'https://preview.example.com/proto-123',
  code: mockMultiFileCode,
  version: 2,
  status: 'ready' as const,
  createdAt: '2024-01-15T10:00:00Z',
  shareId: 'share-uuid-123',
  hasPassword: false,
};

const mockUrlOnlyPrototype = {
  ...mockPublicPrototype,
  code: null,
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

  it('should display public prototype with Sandpack when code is available', async () => {
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

    // Should render Sandpack (not iframe) when code is available
    expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();
    expect(screen.getByTestId('sandpack-preview')).toBeInTheDocument();

    // Should NOT have an iframe
    expect(screen.queryByTitle(/ideaspark prototype/i)).not.toBeInTheDocument();
  });

  it('should render iframe fallback when only url is available (no code)', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: mockUrlOnlyPrototype,
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Loading prototype...')).not.toBeInTheDocument();
    });

    // Should show iframe with prototype URL
    const iframe = screen.getByTitle(/ideaspark prototype - version 2/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', mockUrlOnlyPrototype.url);

    // Should NOT render Sandpack
    expect(screen.queryByTestId('sandpack-provider')).not.toBeInTheDocument();
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

  it('should show "Preview not available" when both code and url are null', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: { ...mockPublicPrototype, url: null, code: null },
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    // Should show "Preview not available" message
    expect(screen.getByText('Preview not available')).toBeInTheDocument();
    expect(screen.queryByTestId('sandpack-provider')).not.toBeInTheDocument();
    expect(screen.queryByTitle(/ideaspark prototype/i)).not.toBeInTheDocument();
  });

  it('should treat empty string code as null and fall back to url', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: { ...mockPublicPrototype, code: '', url: 'https://preview.example.com/proto-123' },
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    // Empty code should fall back to iframe
    const iframe = screen.getByTitle(/ideaspark prototype/i);
    expect(iframe).toBeInTheDocument();
    expect(screen.queryByTestId('sandpack-provider')).not.toBeInTheDocument();
  });

  it('should show "Preview not available" when code is empty string and url is null', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: { ...mockPublicPrototype, code: '', url: null },
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    // Empty code + null url should show "Preview not available"
    expect(screen.getByText('Preview not available')).toBeInTheDocument();
    expect(screen.queryByTestId('sandpack-provider')).not.toBeInTheDocument();
    expect(screen.queryByTitle(/ideaspark prototype/i)).not.toBeInTheDocument();
  });

  it('should treat whitespace-only code as null and fall back to url', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: { ...mockPublicPrototype, code: '   ', url: 'https://preview.example.com/proto-123' },
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    // Whitespace-only code should fall back to iframe
    const iframe = screen.getByTitle(/ideaspark prototype/i);
    expect(iframe).toBeInTheDocument();
    expect(screen.queryByTestId('sandpack-provider')).not.toBeInTheDocument();
  });

  it('should render iframe without sandbox attribute when using url fallback', async () => {
    vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
      data: mockUrlOnlyPrototype,
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IdeaSpark').length).toBeGreaterThan(0);
    });

    const iframe = screen.getByTitle(/ideaspark prototype/i);
    expect(iframe).toBeInTheDocument();
    // sandbox attribute removed per Story 9.4 (Sandpack manages its own iframe security)
    expect(iframe).not.toHaveAttribute('sandbox');
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

  // =============================================
  // Story 9.4 - Sandpack Rendering Tests
  // =============================================

  describe('Sandpack Rendering', () => {
    it('should prefer Sandpack (code) over iframe (url) when both are available', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: { ...mockPublicPrototype, code: mockMultiFileCode, url: 'https://preview.example.com/proto-123' },
        error: null,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();
      });

      // Sandpack should render, NOT iframe
      expect(screen.queryByTitle(/ideaspark prototype/i)).not.toBeInTheDocument();
    });

    it('should render Sandpack with device size selector on desktop', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: mockPublicPrototype,
        error: null,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();
      });

      // Desktop button should be active by default
      const desktopButton = screen.getByRole('button', { name: /desktop/i });
      expect(desktopButton).toHaveClass('btn-active');
    });

    it('should render Sandpack with device size selector on mobile', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: mockPublicPrototype,
        error: null,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();
      });

      // Switch to mobile
      const mobileButton = screen.getByRole('button', { name: /mobile/i });
      fireEvent.click(mobileButton);

      // Sandpack should still be rendered
      expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();
      expect(mobileButton).toHaveClass('btn-active');
    });

    it('should render Sandpack with device size selector on tablet', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: mockPublicPrototype,
        error: null,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();
      });

      // Switch to tablet
      const tabletButton = screen.getByRole('button', { name: /tablet/i });
      fireEvent.click(tabletButton);

      // Sandpack should still be rendered
      expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();
      expect(tabletButton).toHaveClass('btn-active');
    });

    it('should render Sandpack after password verification for password-protected prototype', async () => {
      vi.mocked(prototypeService.getPublicPrototype).mockResolvedValue({
        data: { ...mockPasswordProtectedPrototype, code: mockMultiFileCode },
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

      // Should show Sandpack after verification
      await waitFor(() => {
        expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();
      });

      expect(screen.getByText('View Only')).toBeInTheDocument();
    });
  });
});
