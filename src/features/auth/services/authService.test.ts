import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';

// Mock the supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

// Import the mocked module
import { supabase } from '../../../lib/supabase';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:5173' },
      writable: true,
    });
  });

  describe('requestPasswordReset', () => {
    it('should call resetPasswordForEmail with correct params', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await authService.requestPasswordReset('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'http://localhost:5173/reset-password',
      });
      expect(result.error).toBeNull();
    });

    it('should return success even when email does not exist (security)', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: { message: 'User not found', status: 404 } as never,
      });

      const result = await authService.requestPasswordReset('nonexistent@example.com');

      // Should still return success to prevent email enumeration
      expect(result.error).toBeNull();
    });

    it('should return success even on unexpected errors (security)', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockRejectedValue(new Error('Network error'));

      const result = await authService.requestPasswordReset('test@example.com');

      // Should still return success to prevent revealing system state
      expect(result.error).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should call updateUser with correct params', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: {} },
        error: null,
      } as never);

      const result = await authService.updatePassword('newpassword123');

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
      expect(result.error).toBeNull();
    });

    it('should return error when password update fails', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: { message: 'Password is too weak' } as never,
      } as never);

      const result = await authService.updatePassword('weak');

      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe('AUTH_PASSWORD_UPDATE_ERROR');
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.auth.updateUser).mockRejectedValue(new Error('Network error'));

      const result = await authService.updatePassword('newpassword123');

      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe('AUTH_UNEXPECTED_ERROR');
    });
  });
});
