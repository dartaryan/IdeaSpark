import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRedirectAfterLogin } from './useRedirectAfterLogin';
import { REDIRECT_AFTER_LOGIN_KEY } from '../routes/routeConstants';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useRedirectAfterLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('getStoredRedirect', () => {
    it('should return null when no redirect is stored', () => {
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      expect(result.current.getStoredRedirect()).toBeNull();
    });

    it('should return stored redirect URL', () => {
      sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, '/dashboard/settings');
      
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      expect(result.current.getStoredRedirect()).toBe('/dashboard/settings');
    });
  });

  describe('setRedirect', () => {
    it('should store redirect URL in sessionStorage', () => {
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      act(() => {
        result.current.setRedirect('/ideas/123');
      });
      
      expect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)).toBe('/ideas/123');
    });
  });

  describe('clearRedirect', () => {
    it('should remove redirect URL from sessionStorage', () => {
      sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, '/admin');
      
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      act(() => {
        result.current.clearRedirect();
      });
      
      expect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)).toBeNull();
    });
  });

  describe('redirectToStoredOrDefault', () => {
    it('should navigate to stored redirect URL', () => {
      sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, '/ideas/456');
      
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      act(() => {
        result.current.redirectToStoredOrDefault();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/ideas/456', { replace: true });
    });

    it('should clear stored redirect after navigating', () => {
      sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, '/ideas/456');
      
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      act(() => {
        result.current.redirectToStoredOrDefault();
      });
      
      expect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)).toBeNull();
    });

    it('should navigate to default path when no redirect is stored', () => {
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      act(() => {
        result.current.redirectToStoredOrDefault();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('should navigate to custom default path when provided', () => {
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      act(() => {
        result.current.redirectToStoredOrDefault('/custom-home');
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/custom-home', { replace: true });
    });

    it('should prefer stored redirect over custom default', () => {
      sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, '/admin/users');
      
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      act(() => {
        result.current.redirectToStoredOrDefault('/custom-home');
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users', { replace: true });
    });
  });

  describe('hasStoredRedirect', () => {
    it('should return false when no redirect is stored', () => {
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      expect(result.current.hasStoredRedirect()).toBe(false);
    });

    it('should return true when redirect is stored', () => {
      sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, '/some-path');
      
      const { result } = renderHook(() => useRedirectAfterLogin());
      
      expect(result.current.hasStoredRedirect()).toBe(true);
    });
  });
});
