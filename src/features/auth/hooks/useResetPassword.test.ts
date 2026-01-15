import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useResetPassword } from './useResetPassword';
import { authService } from '../services/authService';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the authService
vi.mock('../services/authService', () => ({
  authService: {
    updatePassword: vi.fn(),
  },
}));

describe('useResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useResetPassword());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state when updating password', async () => {
    vi.mocked(authService.updatePassword).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 100))
    );

    const { result } = renderHook(() => useResetPassword());

    act(() => {
      result.current.updatePassword('newpassword123');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should set success state and navigate on successful update', async () => {
    vi.mocked(authService.updatePassword).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.updatePassword('newpassword123');
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login?reset=success');
  });

  it('should set error state when update fails', async () => {
    vi.mocked(authService.updatePassword).mockResolvedValue({
      data: null,
      error: { message: 'Password is too weak', code: 'AUTH_PASSWORD_UPDATE_ERROR' },
    });

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.updatePassword('weak');
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe('Password is too weak');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle unexpected errors', async () => {
    vi.mocked(authService.updatePassword).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.updatePassword('newpassword123');
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe('An unexpected error occurred. Please try again.');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should clear error when clearError is called', async () => {
    vi.mocked(authService.updatePassword).mockResolvedValue({
      data: null,
      error: { message: 'Some error', code: 'AUTH_ERROR' },
    });

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.updatePassword('newpassword123');
    });

    expect(result.current.error).toBe('Some error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should call authService with the correct password', async () => {
    vi.mocked(authService.updatePassword).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.updatePassword('newpassword123');
    });

    expect(authService.updatePassword).toHaveBeenCalledWith('newpassword123');
  });
});
