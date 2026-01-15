import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/test-utils';
import { ResetPasswordForm } from './ResetPasswordForm';

// Mock the useResetPassword hook
const mockUpdatePassword = vi.fn();
const mockClearError = vi.fn();

vi.mock('../hooks/useResetPassword', () => ({
  useResetPassword: () => ({
    isLoading: false,
    isSuccess: false,
    error: null,
    updatePassword: mockUpdatePassword,
    clearError: mockClearError,
  }),
}));

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdatePassword.mockResolvedValue(undefined);
  });

  // Helper to get password inputs by their specific IDs
  const getPasswordInput = () => screen.getByPlaceholderText('Enter new password');
  const getConfirmInput = () => screen.getByPlaceholderText('Confirm new password');

  it('should render the form with password inputs', () => {
    render(<ResetPasswordForm />);

    expect(getPasswordInput()).toBeInTheDocument();
    expect(getConfirmInput()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('should render instructional text', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByText(/enter your new password below/i)).toBeInTheDocument();
  });

  it('should show password hint', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument();
  });

  it('should show validation error for empty password', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const passwordInput = getPasswordInput();
    await user.type(passwordInput, 'short');

    const confirmInput = getConfirmInput();
    await user.type(confirmInput, 'short');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for mismatched passwords', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const passwordInput = getPasswordInput();
    await user.type(passwordInput, 'newpassword123');

    const confirmInput = getConfirmInput();
    await user.type(confirmInput, 'differentpassword');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for empty confirm password', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const passwordInput = getPasswordInput();
    await user.type(passwordInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  it('should call updatePassword with password on valid submission', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const passwordInput = getPasswordInput();
    await user.type(passwordInput, 'newpassword123');

    const confirmInput = getConfirmInput();
    await user.type(confirmInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('newpassword123');
    });
  });

  it('should call clearError on submission', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const passwordInput = getPasswordInput();
    await user.type(passwordInput, 'newpassword123');

    const confirmInput = getConfirmInput();
    await user.type(confirmInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  it('should toggle password visibility for new password field', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const passwordInput = getPasswordInput();
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button', { name: /show password/i });
    await user.click(toggleButtons[0]);

    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getAllByRole('button', { name: /hide password/i })[0]);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should toggle password visibility for confirm password field', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const confirmInput = getConfirmInput();
    expect(confirmInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button', { name: /show password/i });
    await user.click(toggleButtons[1]);

    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  it('should have new-password autocomplete attributes', () => {
    render(<ResetPasswordForm />);

    const passwordInput = getPasswordInput();
    const confirmInput = getConfirmInput();

    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
    expect(confirmInput).toHaveAttribute('autocomplete', 'new-password');
  });

  it('should have accessible form elements', () => {
    render(<ResetPasswordForm />);

    const passwordInput = getPasswordInput();
    const confirmInput = getConfirmInput();

    expect(passwordInput).toHaveAttribute('id', 'password');
    expect(confirmInput).toHaveAttribute('id', 'confirmPassword');
  });
});
