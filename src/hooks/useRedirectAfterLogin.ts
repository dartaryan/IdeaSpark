import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, REDIRECT_AFTER_LOGIN_KEY } from '../routes/routeConstants';

/**
 * Hook for managing deep linking / redirect after login
 * Stores and retrieves the intended destination URL through the login flow
 */
export function useRedirectAfterLogin() {
  const navigate = useNavigate();

  /**
   * Get the stored redirect URL
   * @returns The stored URL or null if none exists
   */
  const getStoredRedirect = useCallback((): string | null => {
    return sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
  }, []);

  /**
   * Store a redirect URL to navigate to after login
   * @param path - The URL path to store
   */
  const setRedirect = useCallback((path: string) => {
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, path);
  }, []);

  /**
   * Clear the stored redirect URL
   */
  const clearRedirect = useCallback(() => {
    sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
  }, []);

  /**
   * Check if there's a stored redirect URL
   * @returns true if a redirect URL is stored
   */
  const hasStoredRedirect = useCallback((): boolean => {
    return sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY) !== null;
  }, []);

  /**
   * Navigate to the stored redirect URL or a default path
   * Clears the stored URL after navigation
   * @param defaultPath - The path to navigate to if no stored URL (defaults to dashboard)
   */
  const redirectToStoredOrDefault = useCallback(
    (defaultPath: string = ROUTES.DASHBOARD) => {
      const storedPath = getStoredRedirect();
      clearRedirect();
      navigate(storedPath || defaultPath, { replace: true });
    },
    [navigate, getStoredRedirect, clearRedirect]
  );

  return {
    getStoredRedirect,
    setRedirect,
    clearRedirect,
    hasStoredRedirect,
    redirectToStoredOrDefault,
  };
}
