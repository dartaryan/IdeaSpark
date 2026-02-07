// src/features/prototypes/pages/PasswordProtectedViewer.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PasswordProtectedViewer } from './PasswordProtectedViewer';
import { supabase } from '../../../lib/supabase';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('PasswordProtectedViewer', () => {
  let queryClient: QueryClient;
  const mockOnVerified = vi.fn();

  const renderComponent = (shareId = 'share-uuid-123') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <PasswordProtectedViewer shareId={shareId} onVerified={mockOnVerified} />
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
    sessionStorage.clear();
  });

  it('should display lock icon and friendly message', () => {
    renderComponent();

    expect(screen.getByText('This prototype is password protected')).toBeInTheDocument();
    expect(screen.getByText('Enter the password to view this prototype.')).toBeInTheDocument();
  });

  it('should display password input form', () => {
    renderComponent();

    expect(screen.getByTestId('verify-password-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unlock/i })).toBeInTheDocument();
  });

  it('should display "Forgot password?" helper text', () => {
    renderComponent();

    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/contact the person who shared this link/i)).toBeInTheDocument();
  });

  it('should disable Unlock button when password is empty', () => {
    renderComponent();

    const unlockButton = screen.getByRole('button', { name: /unlock/i });
    expect(unlockButton).toBeDisabled();
  });

  it('should enable Unlock button when password is entered', () => {
    renderComponent();

    const passwordInput = screen.getByTestId('verify-password-input');
    fireEvent.change(passwordInput, { target: { value: 'somepassword' } });

    const unlockButton = screen.getByRole('button', { name: /unlock/i });
    expect(unlockButton).not.toBeDisabled();
  });

  it('should call onVerified on successful password verification', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { verified: true },
      error: null,
    });

    renderComponent();

    const passwordInput = screen.getByTestId('verify-password-input');
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });

    const unlockButton = screen.getByRole('button', { name: /unlock/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(mockOnVerified).toHaveBeenCalled();
    });

    // Should store verification in sessionStorage
    expect(sessionStorage.getItem('verified_prototype_share-uuid-123')).toBe('true');
  });

  it('should show error message on incorrect password', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { verified: false },
      error: null,
    });

    renderComponent();

    const passwordInput = screen.getByTestId('verify-password-input');
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    const unlockButton = screen.getByRole('button', { name: /unlock/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
      expect(screen.getByText('Incorrect password')).toBeInTheDocument();
    });

    // onVerified should NOT be called
    expect(mockOnVerified).not.toHaveBeenCalled();
  });

  it('should allow retry after incorrect password', async () => {
    // First attempt: wrong password
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { verified: false },
      error: null,
    });

    renderComponent();

    const passwordInput = screen.getByTestId('verify-password-input');
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    const unlockButton = screen.getByRole('button', { name: /unlock/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(screen.getByText('Incorrect password')).toBeInTheDocument();
    });

    // Second attempt: correct password
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { verified: true },
      error: null,
    });

    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(mockOnVerified).toHaveBeenCalled();
    });
  });

  it('should show error on server error', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'Server error', name: 'FunctionsHttpError' },
    });

    renderComponent();

    const passwordInput = screen.getByTestId('verify-password-input');
    fireEvent.change(passwordInput, { target: { value: 'somepassword' } });

    const unlockButton = screen.getByRole('button', { name: /unlock/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });
  });

  it('should toggle show/hide password', () => {
    renderComponent();

    const passwordInput = screen.getByTestId('verify-password-input');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click show password
    const showBtn = screen.getByLabelText('Show password');
    fireEvent.click(showBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click hide password
    const hideBtn = screen.getByLabelText('Hide password');
    fireEvent.click(hideBtn);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should show loading state while verifying', async () => {
    vi.mocked(supabase.functions.invoke).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { verified: true }, error: null }), 2000))
    );

    renderComponent();

    const passwordInput = screen.getByTestId('verify-password-input');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const unlockButton = screen.getByRole('button', { name: /unlock/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(screen.getByText('Verifying...')).toBeInTheDocument();
    });
  });

  it('should show branding footer', () => {
    renderComponent();

    expect(screen.getByText(/powered by/i)).toBeInTheDocument();
    expect(screen.getByText('IdeaSpark')).toBeInTheDocument();
  });

  it('should clear error message when user types new password', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { verified: false },
      error: null,
    });

    renderComponent();

    const passwordInput = screen.getByTestId('verify-password-input');
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    const unlockButton = screen.getByRole('button', { name: /unlock/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(screen.getByText('Incorrect password')).toBeInTheDocument();
    });

    // Type new password - error should clear
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

    await waitFor(() => {
      expect(screen.queryByText('Incorrect password')).not.toBeInTheDocument();
    });
  });
});
