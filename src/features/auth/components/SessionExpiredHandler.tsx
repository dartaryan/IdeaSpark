import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

/**
 * Component that handles session expiry detection and redirect
 * This is a side-effect only component that renders nothing
 * Place in authenticated routes to handle automatic session expiry
 */
export function SessionExpiredHandler() {
  const { sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sessionExpired) {
      // Clear any cached data
      queryClient.clear();
      
      // Clear the session expired flag
      clearSessionExpired();
      
      // Redirect to login with expired query parameter
      navigate('/login?expired=true', { replace: true });
    }
  }, [sessionExpired, clearSessionExpired, navigate, queryClient]);

  // This component renders nothing - it's purely for side effects
  return null;
}
