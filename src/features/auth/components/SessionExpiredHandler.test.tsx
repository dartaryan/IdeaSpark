import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '../../../test/test-utils';
import { SessionExpiredHandler } from './SessionExpiredHandler';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock React Query's useQueryClient
const mockClear = vi.fn();
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      clear: mockClear,
    }),
  };
});

// Mock useAuth hook - will be overridden per test
const mockClearSessionExpired = vi.fn();
let mockSessionExpired = false;

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    sessionExpired: mockSessionExpired,
    clearSessionExpired: mockClearSessionExpired,
  }),
}));

describe('SessionExpiredHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionExpired = false;
  });

  it('should render nothing (null)', () => {
    const { container } = render(<SessionExpiredHandler />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should not redirect when session is not expired', () => {
    mockSessionExpired = false;
    render(<SessionExpiredHandler />);

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockClearSessionExpired).not.toHaveBeenCalled();
  });

  it('should redirect to login with expired query param when session expires', async () => {
    mockSessionExpired = true;
    render(<SessionExpiredHandler />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?expired=true', { replace: true });
    });
  });

  it('should clear query client cache on session expiry', async () => {
    mockSessionExpired = true;
    render(<SessionExpiredHandler />);

    await waitFor(() => {
      expect(mockClear).toHaveBeenCalledTimes(1);
    });
  });

  it('should call clearSessionExpired after redirect', async () => {
    mockSessionExpired = true;
    render(<SessionExpiredHandler />);

    await waitFor(() => {
      expect(mockClearSessionExpired).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle session expiry in correct order: clear cache, clear flag, navigate', async () => {
    mockSessionExpired = true;
    const callOrder: string[] = [];

    mockClear.mockImplementation(() => {
      callOrder.push('clearCache');
    });
    mockClearSessionExpired.mockImplementation(() => {
      callOrder.push('clearSessionExpired');
    });
    mockNavigate.mockImplementation(() => {
      callOrder.push('navigate');
    });

    render(<SessionExpiredHandler />);

    await waitFor(() => {
      expect(callOrder).toEqual(['clearCache', 'clearSessionExpired', 'navigate']);
    });
  });
});
