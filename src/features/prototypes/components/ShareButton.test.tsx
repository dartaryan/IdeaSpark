// src/features/prototypes/components/ShareButton.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShareButton } from './ShareButton';
import { prototypeService } from '../services/prototypeService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/prototypeService');

// Mock qrcode.react
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value, size }: { value: string; size: number }) => (
    <svg data-testid="qr-code" data-value={value} width={size} height={size} />
  ),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('ShareButton', () => {
  let queryClient: QueryClient;

  const renderComponent = (prototypeId = 'proto-123', prdId = 'prd-123') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ShareButton prototypeId={prototypeId} prdId={prdId} />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    vi.mocked(prototypeService.getShareUrl).mockResolvedValue({
      data: null,
      error: null,
    });
    vi.mocked(prototypeService.getShareStats).mockResolvedValue({
      data: null,
      error: null,
    });
    vi.mocked(prototypeService.getPasswordStatus).mockResolvedValue({
      data: false,
      error: null,
    });
  });

  it('should render share button with "Share Publicly" label', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /share publicly/i })).toBeInTheDocument();
  });

  it('should generate share link when button clicked', async () => {
    const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';

    vi.mocked(prototypeService.generateShareLink).mockResolvedValue({
      data: shareUrl,
      error: null,
    });

    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

    renderComponent();

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(prototypeService.generateShareLink).toHaveBeenCalledWith('proto-123');
    });

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText('Share Prototype')).toBeInTheDocument();
    });

    // URL should be displayed
    expect(screen.getByDisplayValue(shareUrl)).toBeInTheDocument();
  });

  it('should show existing share URL if already shared', async () => {
    const existingShareUrl = 'https://ideaspark.example.com/share/prototype/existing-share-id';

    vi.mocked(prototypeService.getShareUrl).mockResolvedValue({
      data: existingShareUrl,
      error: null,
    });

    // Pre-seed the query cache so existingShareUrl is available immediately
    queryClient.setQueryData(['shareUrl', 'proto-123'], existingShareUrl);

    renderComponent();

    // Wait for share status check (React Query still calls the queryFn)
    await waitFor(() => {
      expect(prototypeService.getShareUrl).toHaveBeenCalledWith('proto-123');
    });

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    // Modal should appear with existing URL
    await waitFor(() => {
      expect(screen.getByDisplayValue(existingShareUrl)).toBeInTheDocument();
    });

    // Should not call generateShareLink since existing URL was already cached
    expect(prototypeService.generateShareLink).not.toHaveBeenCalled();
  });

  it('should copy URL to clipboard when copy button clicked', async () => {
    const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';

    vi.mocked(prototypeService.generateShareLink).mockResolvedValue({
      data: shareUrl,
      error: null,
    });

    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

    renderComponent();

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    // Wait for modal and URL to be displayed
    await waitFor(() => {
      expect(screen.getByText('Share Prototype')).toBeInTheDocument();
      expect(screen.getByDisplayValue(shareUrl)).toBeInTheDocument();
    });

    // The clipboard copy happens automatically on share
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(shareUrl);
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('should show loading state during share link generation', async () => {
    vi.mocked(prototypeService.generateShareLink).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: 'url', error: null }), 1000))
    );

    renderComponent();

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });

    expect(shareButton).toBeDisabled();
  });

  it('should show error message with retry when share link generation fails', async () => {
    vi.mocked(prototypeService.generateShareLink).mockResolvedValue({
      data: null,
      error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
    });

    renderComponent();

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(prototypeService.generateShareLink).toHaveBeenCalled();
    });

    // Error message and retry button should be shown
    await waitFor(() => {
      expect(screen.getByText(/failed to generate share link/i)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('should close modal when close button clicked', async () => {
    const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';

    vi.mocked(prototypeService.generateShareLink).mockResolvedValue({
      data: shareUrl,
      error: null,
    });

    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

    renderComponent();

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    // Wait for modal and all its content to be displayed
    await waitFor(() => {
      expect(screen.getByText('Share Prototype')).toBeInTheDocument();
      expect(screen.getByDisplayValue(shareUrl)).toBeInTheDocument();
    });

    // Find close button by text since it's in the modal action
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Share Prototype')).not.toBeInTheDocument();
    });
  });

  it('should show helper text about public access', async () => {
    const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';

    vi.mocked(prototypeService.generateShareLink).mockResolvedValue({
      data: shareUrl,
      error: null,
    });

    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

    renderComponent();

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/anyone with this link can view your prototype/i)).toBeInTheDocument();
    });
  });

  it('should display QR code when share URL is available', async () => {
    const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';

    vi.mocked(prototypeService.generateShareLink).mockResolvedValue({
      data: shareUrl,
      error: null,
    });

    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

    renderComponent();

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Share Prototype')).toBeInTheDocument();
    });

    // QR code should be rendered
    const qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveAttribute('data-value', shareUrl);
    expect(screen.getByText(/scan to open on mobile/i)).toBeInTheDocument();
  });

  it('should display view count when prototype is already shared', async () => {
    const existingShareUrl = 'https://ideaspark.example.com/share/prototype/existing-share-id';

    vi.mocked(prototypeService.getShareUrl).mockResolvedValue({
      data: existingShareUrl,
      error: null,
    });

    vi.mocked(prototypeService.getShareStats).mockResolvedValue({
      data: { viewCount: 42, sharedAt: '2026-01-15T10:00:00Z', isPublic: true, expiresAt: null },
      error: null,
    });

    renderComponent();

    // Wait for share status check
    await waitFor(() => {
      expect(prototypeService.getShareUrl).toHaveBeenCalledWith('proto-123');
    });

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    // View count should be displayed
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Views')).toBeInTheDocument();
    });
  });

  it('should display shared date when prototype is already shared', async () => {
    const existingShareUrl = 'https://ideaspark.example.com/share/prototype/existing-share-id';

    vi.mocked(prototypeService.getShareUrl).mockResolvedValue({
      data: existingShareUrl,
      error: null,
    });

    vi.mocked(prototypeService.getShareStats).mockResolvedValue({
      data: { viewCount: 5, sharedAt: '2026-01-15T10:00:00Z', isPublic: true, expiresAt: null },
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(prototypeService.getShareUrl).toHaveBeenCalledWith('proto-123');
    });

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    // Shared date should be displayed
    await waitFor(() => {
      expect(screen.getByText('Shared')).toBeInTheDocument();
    });
  });

  it('should show "Open in New Tab" link when share URL is available', async () => {
    const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';

    vi.mocked(prototypeService.generateShareLink).mockResolvedValue({
      data: shareUrl,
      error: null,
    });

    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

    renderComponent();

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Share Prototype')).toBeInTheDocument();
    });

    // "Open in New Tab" link should exist
    const openLink = screen.getByText('Open in New Tab');
    expect(openLink).toBeInTheDocument();
    expect(openLink.closest('a')).toHaveAttribute('href', shareUrl);
    expect(openLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(openLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should not display stats section when prototype is not shared', async () => {
    vi.mocked(prototypeService.getShareStats).mockResolvedValue({
      data: { viewCount: 0, sharedAt: null, isPublic: false, expiresAt: null },
      error: null,
    });

    const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';

    vi.mocked(prototypeService.generateShareLink).mockResolvedValue({
      data: shareUrl,
      error: null,
    });

    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

    renderComponent();

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Share Prototype')).toBeInTheDocument();
    });

    // Stats should not be visible when isPublic is false
    expect(screen.queryByText('Views')).not.toBeInTheDocument();
  });

  it('should retry share link generation when Retry button is clicked', async () => {
    // First call fails
    vi.mocked(prototypeService.generateShareLink)
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'Network error', code: 'UNKNOWN_ERROR' },
      })
      // Second call succeeds
      .mockResolvedValueOnce({
        data: 'https://ideaspark.example.com/share/prototype/retried-uuid',
        error: null,
      });

    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

    renderComponent();

    const shareButton = screen.getByRole('button', { name: /share publicly/i });
    fireEvent.click(shareButton);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed to generate share link/i)).toBeInTheDocument();
    });

    expect(prototypeService.generateShareLink).toHaveBeenCalledTimes(1);

    // Click Retry
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    // Should call generateShareLink again
    await waitFor(() => {
      expect(prototypeService.generateShareLink).toHaveBeenCalledTimes(2);
    });

    // Should now show the share URL from the successful retry
    await waitFor(() => {
      expect(screen.getByDisplayValue('https://ideaspark.example.com/share/prototype/retried-uuid')).toBeInTheDocument();
    });
  });

  // =============================================
  // Story 9.2 - Password Protection Tests
  // =============================================

  describe('Password Protection', () => {
    const setupSharedPrototype = (overrides?: { expiresAt?: string | null }) => {
      const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';
      vi.mocked(prototypeService.getShareUrl).mockResolvedValue({
        data: shareUrl,
        error: null,
      });
      vi.mocked(prototypeService.getShareStats).mockResolvedValue({
        data: { viewCount: 5, sharedAt: '2026-01-15T10:00:00Z', isPublic: true, expiresAt: overrides?.expiresAt ?? null },
        error: null,
      });
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);
      queryClient.setQueryData(['shareUrl', 'proto-123'], shareUrl);
      return shareUrl;
    };

    /** Helper to open the share modal with shared URL loaded */
    const openShareModal = async () => {
      renderComponent();

      // Wait for share URL query to resolve
      await waitFor(() => {
        expect(prototypeService.getShareUrl).toHaveBeenCalledWith('proto-123');
      });

      const shareButton = screen.getByRole('button', { name: /share publicly/i });
      fireEvent.click(shareButton);

      // Wait for share content including password protection section
      await waitFor(() => {
        expect(screen.getByText('Password Protection')).toBeInTheDocument();
      });
    };

    it('should show password protection toggle in share modal', async () => {
      setupSharedPrototype();
      await openShareModal();

      // Toggle should be present
      const toggle = screen.getByTestId('password-toggle');
      expect(toggle).toBeInTheDocument();
    });

    it('should show password input when toggle is enabled', async () => {
      setupSharedPrototype();
      await openShareModal();

      // Enable the toggle
      const toggle = screen.getByTestId('password-toggle');
      fireEvent.click(toggle);

      // Password input should appear
      await waitFor(() => {
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
      });

      // Update Password button should appear
      expect(screen.getByText('Update Password')).toBeInTheDocument();
    });

    it('should hide password input when toggle is disabled', async () => {
      setupSharedPrototype();
      await openShareModal();

      // Password input should not be visible by default
      expect(screen.queryByTestId('password-input')).not.toBeInTheDocument();
    });

    it('should show password strength indicator', async () => {
      setupSharedPrototype();
      await openShareModal();

      // Enable toggle
      const toggle = screen.getByTestId('password-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
      });

      // Type a password
      const passwordInput = screen.getByTestId('password-input');
      fireEvent.change(passwordInput, { target: { value: 'abcDEF123456' } });

      // Should show strength indicator
      await waitFor(() => {
        expect(screen.getByTestId('password-strength')).toBeInTheDocument();
        expect(screen.getByText('Strong')).toBeInTheDocument();
      });
    });

    it('should disable Update Password button when password is invalid', async () => {
      setupSharedPrototype();
      await openShareModal();

      const toggle = screen.getByTestId('password-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
      });

      // Type short password
      const passwordInput = screen.getByTestId('password-input');
      fireEvent.change(passwordInput, { target: { value: 'short' } });

      // Update button should be disabled
      const updateButton = screen.getByText('Update Password');
      expect(updateButton).toBeDisabled();
    });

    it('should enable Update Password button when password is valid', async () => {
      setupSharedPrototype();
      await openShareModal();

      const toggle = screen.getByTestId('password-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
      });

      // Type valid password
      const passwordInput = screen.getByTestId('password-input');
      fireEvent.change(passwordInput, { target: { value: 'ValidPassword123' } });

      // Update button should be enabled
      const updateButton = screen.getByText('Update Password');
      expect(updateButton).not.toBeDisabled();
    });

    it('should show "Password Protected" badge when password is set', async () => {
      setupSharedPrototype();
      vi.mocked(prototypeService.getPasswordStatus).mockResolvedValue({
        data: true,
        error: null,
      });
      queryClient.setQueryData(['passwordStatus', 'proto-123'], true);

      renderComponent();

      // Wait for queries to resolve
      await waitFor(() => {
        expect(prototypeService.getShareUrl).toHaveBeenCalledWith('proto-123');
      });

      const shareButton = screen.getByRole('button', { name: /share publicly/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByTestId('password-protected-badge')).toBeInTheDocument();
        expect(screen.getByText('Password Protected')).toBeInTheDocument();
      });
    });

    it('should toggle show/hide password with eye icon', async () => {
      setupSharedPrototype();
      await openShareModal();

      const toggle = screen.getByTestId('password-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
      });

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click show password button
      const showPasswordBtn = screen.getByLabelText('Show password');
      fireEvent.click(showPasswordBtn);

      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click hide password button
      const hidePasswordBtn = screen.getByLabelText('Hide password');
      fireEvent.click(hidePasswordBtn);

      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should show validation error for short password', async () => {
      setupSharedPrototype();
      await openShareModal();

      const toggle = screen.getByTestId('password-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
      });

      const passwordInput = screen.getByTestId('password-input');
      fireEvent.change(passwordInput, { target: { value: 'short' } });

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
    });
  });

  // =============================================
  // Story 9.3 - Link Expiration Tests
  // =============================================

  describe('Link Expiration', () => {
    const setupSharedPrototypeForExpiration = (overrides?: { expiresAt?: string | null }) => {
      const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';
      vi.mocked(prototypeService.getShareUrl).mockResolvedValue({
        data: shareUrl,
        error: null,
      });
      vi.mocked(prototypeService.getShareStats).mockResolvedValue({
        data: {
          viewCount: 5,
          sharedAt: '2026-01-15T10:00:00Z',
          isPublic: true,
          expiresAt: overrides?.expiresAt ?? null,
        },
        error: null,
      });
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);
      queryClient.setQueryData(['shareUrl', 'proto-123'], shareUrl);
      return shareUrl;
    };

    const openShareModalForExpiration = async () => {
      renderComponent();

      await waitFor(() => {
        expect(prototypeService.getShareUrl).toHaveBeenCalledWith('proto-123');
      });

      const shareButton = screen.getByRole('button', { name: /share publicly/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('Link Expiration')).toBeInTheDocument();
      });
    };

    it('should show expiration select dropdown in share modal', async () => {
      setupSharedPrototypeForExpiration();
      await openShareModalForExpiration();

      const select = screen.getByTestId('expiration-select');
      expect(select).toBeInTheDocument();
    });

    it('should show all expiration options in dropdown', async () => {
      setupSharedPrototypeForExpiration();
      await openShareModalForExpiration();

      expect(screen.getByText('Never expires')).toBeInTheDocument();
      expect(screen.getByText('24 hours')).toBeInTheDocument();
      expect(screen.getByText('7 days')).toBeInTheDocument();
      expect(screen.getByText('30 days')).toBeInTheDocument();
    });

    it('should show Update Expiration button', async () => {
      setupSharedPrototypeForExpiration();
      await openShareModalForExpiration();

      const updateBtn = screen.getByTestId('update-expiration-btn');
      expect(updateBtn).toBeInTheDocument();
      expect(updateBtn).toHaveTextContent('Update Expiration');
    });

    it('should allow selecting a different expiration duration', async () => {
      setupSharedPrototypeForExpiration();
      await openShareModalForExpiration();

      const select = screen.getByTestId('expiration-select');
      fireEvent.change(select, { target: { value: '7d' } });

      expect(select).toHaveValue('7d');
    });

    it('should call setShareExpiration when Update Expiration is clicked', async () => {
      setupSharedPrototypeForExpiration();
      vi.mocked(prototypeService.setShareExpiration).mockResolvedValue({
        data: undefined,
        error: null,
      });

      await openShareModalForExpiration();

      const select = screen.getByTestId('expiration-select');
      fireEvent.change(select, { target: { value: '7d' } });

      const updateBtn = screen.getByTestId('update-expiration-btn');
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(prototypeService.setShareExpiration).toHaveBeenCalledWith(
          'proto-123',
          expect.any(String) // ISO date string
        );
      });
    });

    it('should show "Never" in expiration stat when no expiration set', async () => {
      setupSharedPrototypeForExpiration({ expiresAt: null });
      await openShareModalForExpiration();

      const expirationStat = screen.getByTestId('expiration-stat');
      expect(expirationStat).toHaveTextContent('Never');
    });

    it('should show remaining time in expiration stat when expiration is set', async () => {
      // Set expiration to 7 days from now
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      setupSharedPrototypeForExpiration({ expiresAt: futureDate });
      await openShareModalForExpiration();

      const expirationStat = screen.getByTestId('expiration-stat');
      expect(expirationStat.textContent).toMatch(/in \d+ day/);
    });

    it('should show expired badge when link has expired', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      setupSharedPrototypeForExpiration({ expiresAt: pastDate });
      await openShareModalForExpiration();

      const expiredBadge = screen.getByTestId('expired-badge');
      expect(expiredBadge).toBeInTheDocument();
      expect(expiredBadge).toHaveTextContent('Expired');
    });

    it('should show expiration info when expiration is set', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      setupSharedPrototypeForExpiration({ expiresAt: futureDate });
      await openShareModalForExpiration();

      const expirationInfo = screen.getByTestId('expiration-info');
      expect(expirationInfo).toBeInTheDocument();
      expect(expirationInfo.textContent).toMatch(/Expires:/);
    });
  });
});
