import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useForgotPassword } from './useForgotPassword';
import { authService } from '../services/authService';

// Mock the authService
vi.mock('../services/authService', () => ({
  authService: {
    requestPasswordReset: vi.fn(),
  },
}));

describe('useForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useForgotPassword());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state when requesting reset', async () => {
    vi.mocked(authService.requestPasswordReset).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 100))
    );

    const { result } = renderHook(() => useForgotPassword());

    act(() => {
      result.current.requestReset('test@example.com');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should set success state after requesting reset', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.requestReset('test@example.com');
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should show success even when service returns error (security)', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValue({
      data: null,
      error: { message: 'User not found', code: 'NOT_FOUND' },
    });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.requestReset('nonexistent@example.com');
    });

    // Should still show success to prevent email enumeration
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should show success even on unexpected errors (security)', async () => {
    vi.mocked(authService.requestPasswordReset).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.requestReset('test@example.com');
    });

    // Should still show success to prevent revealing system state
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should reset state when reset is called', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.requestReset('test@example.com');
    });

    expect(result.current.isSuccess).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call authService with the correct email', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.requestReset('test@example.com');
    });

    expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
  });
});
