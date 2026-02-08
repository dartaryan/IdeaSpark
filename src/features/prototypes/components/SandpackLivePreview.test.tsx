// src/features/prototypes/components/SandpackLivePreview.test.tsx
// Unit tests for SandpackLivePreview component (Story 7.3 + Story 10.3)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { SandpackLivePreview } from './SandpackLivePreview';
import type { EditorFile, ApiConfig } from '../types';

// Mock the generateApiClientFile function to track calls (Story 10.3)
const mockGenerateApiClientFile = vi.fn().mockReturnValue('// mocked apiClient.js');
vi.mock('../utils/apiClientInjector', () => ({
  generateApiClientFile: (...args: unknown[]) => mockGenerateApiClientFile(...args),
}));

// Mock useAuth hook (Story 10.3)
const mockSession = {
  access_token: 'test-access-token',
  user: { id: 'user-1' },
};
let mockAuthReturn: Record<string, unknown> = {
  session: mockSession,
  user: null,
  authUser: null,
  isLoading: false,
  isAuthenticated: false,
  sessionExpired: false,
  logout: vi.fn(),
  signOut: vi.fn(),
  setSessionExpired: vi.fn(),
  clearSessionExpired: vi.fn(),
};
vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: () => mockAuthReturn,
}));

// Mock Sandpack components since they require browser runtime
let mockSandpackError: { message: string } | null = null;

vi.mock('@codesandbox/sandpack-react', () => ({
  SandpackProvider: ({ children, files }: { children: React.ReactNode; files: Record<string, { code: string }> }) => (
    <div data-testid="sandpack-provider" data-files={JSON.stringify(files)}>
      {children}
    </div>
  ),
  SandpackPreview: ({ showOpenInCodeSandbox, showRefreshButton }: { showOpenInCodeSandbox: boolean; showRefreshButton: boolean }) => (
    <div
      data-testid="sandpack-preview"
      data-show-codesandbox={showOpenInCodeSandbox}
      data-show-refresh={showRefreshButton}
    >
      Sandpack Preview
    </div>
  ),
  useSandpack: () => ({
    sandpack: {
      error: mockSandpackError,
    },
    listen: vi.fn().mockReturnValue(vi.fn()), // Returns unsubscribe function
  }),
}));

// Mock import.meta.env
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

const singleFile: Record<string, EditorFile> = {
  '/App.tsx': {
    path: '/App.tsx',
    content: 'export default function App() { return <div>Hello</div>; }',
    language: 'typescript',
  },
};

const multipleFiles: Record<string, EditorFile> = {
  '/App.tsx': {
    path: '/App.tsx',
    content: 'export default function App() { return <div>Hello</div>; }',
    language: 'typescript',
  },
  '/index.css': {
    path: '/index.css',
    content: 'body { margin: 0; }',
    language: 'css',
  },
  '/components/Button.tsx': {
    path: '/components/Button.tsx',
    content: 'export function Button() { return <button>Click</button>; }',
    language: 'typescript',
  },
};

const makeApiConfig = (overrides: Partial<ApiConfig> = {}): ApiConfig => ({
  id: 'cfg-1',
  prototypeId: 'proto-1',
  name: 'getUsers',
  url: 'https://api.example.com/users',
  method: 'GET',
  headers: {},
  isMock: false,
  mockResponse: null,
  mockStatusCode: 200,
  mockDelayMs: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('SandpackLivePreview', () => {
  beforeEach(() => {
    mockSandpackError = null;
    mockGenerateApiClientFile.mockClear();
    mockAuthReturn = {
      session: mockSession,
      user: null,
      authUser: null,
      isLoading: false,
      isAuthenticated: false,
      sessionExpired: false,
      logout: vi.fn(),
      signOut: vi.fn(),
      setSessionExpired: vi.fn(),
      clearSessionExpired: vi.fn(),
    };
  });

  describe('Rendering', () => {
    it('renders Sandpack provider and preview with files', () => {
      render(<SandpackLivePreview files={singleFile} />);

      expect(screen.getByTestId('sandpack-live-preview')).toBeInTheDocument();
      expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();
      expect(screen.getByTestId('sandpack-preview')).toBeInTheDocument();
    });

    it('renders "no files" message when files are empty', () => {
      render(<SandpackLivePreview files={{}} />);

      expect(screen.getByTestId('sandpack-no-files')).toBeInTheDocument();
      expect(screen.getByText('No code available for preview')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<SandpackLivePreview files={singleFile} className="my-custom-class" />);

      const container = screen.getByTestId('sandpack-live-preview');
      expect(container.className).toContain('my-custom-class');
    });

    it('applies PassportCard border styling', () => {
      render(<SandpackLivePreview files={singleFile} />);

      const container = screen.getByTestId('sandpack-live-preview');
      expect(container.className).toContain('border-[#E10514]/20');
    });

    it('hides Open in CodeSandbox button', () => {
      render(<SandpackLivePreview files={singleFile} />);

      const preview = screen.getByTestId('sandpack-preview');
      expect(preview.dataset.showCodesandbox).toBe('false');
    });

    it('shows refresh button', () => {
      render(<SandpackLivePreview files={singleFile} />);

      const preview = screen.getByTestId('sandpack-preview');
      expect(preview.dataset.showRefresh).toBe('true');
    });
  });

  describe('File Conversion', () => {
    it('converts single EditorFile to Sandpack format', () => {
      render(<SandpackLivePreview files={singleFile} />);

      const provider = screen.getByTestId('sandpack-provider');
      const filesData = JSON.parse(provider.dataset.files || '{}');

      expect(filesData['/App.tsx']).toEqual({
        code: 'export default function App() { return <div>Hello</div>; }',
      });
    });

    it('converts multiple EditorFiles to Sandpack format', () => {
      render(<SandpackLivePreview files={multipleFiles} />);

      const provider = screen.getByTestId('sandpack-provider');
      const filesData = JSON.parse(provider.dataset.files || '{}');

      expect(Object.keys(filesData)).toHaveLength(3);
      expect(filesData['/App.tsx'].code).toContain('function App');
      expect(filesData['/index.css'].code).toBe('body { margin: 0; }');
      expect(filesData['/components/Button.tsx'].code).toContain('function Button');
    });
  });

  describe('Error Handling', () => {
    it('renders error listener when onError is provided', () => {
      const onError = vi.fn();
      render(<SandpackLivePreview files={singleFile} onError={onError} />);

      // Component should render without errors
      expect(screen.getByTestId('sandpack-live-preview')).toBeInTheDocument();
    });

    it('does not render error listener when onError is not provided', () => {
      render(<SandpackLivePreview files={singleFile} />);

      // Component should render without errors
      expect(screen.getByTestId('sandpack-live-preview')).toBeInTheDocument();
    });

    it('calls onError with error when Sandpack has compilation error', () => {
      mockSandpackError = { message: 'Syntax error in App.tsx' };
      const onError = vi.fn();

      render(<SandpackLivePreview files={singleFile} onError={onError} />);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Syntax error in App.tsx' }),
      );
    });

    it('does not call onError on initial render when there is no error', () => {
      mockSandpackError = null;
      const onError = vi.fn();

      render(<SandpackLivePreview files={singleFile} onError={onError} />);

      // prevErrorRef starts as null and currentError is also null,
      // so onError should NOT fire on initial render with no error
      expect(screen.getByTestId('sandpack-live-preview')).toBeInTheDocument();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  // =======================================================================
  // Story 10.3: Proxy config tests
  // =======================================================================

  describe('Proxy Config (Story 10.3)', () => {
    it('passes proxyConfig to generateApiClientFile when auth session exists and apiConfigs contain non-mock endpoints', () => {
      const apiConfigs = [makeApiConfig({ isMock: false })];

      render(
        <SandpackLivePreview
          files={singleFile}
          apiConfigs={apiConfigs}
          prototypeId="proto-1"
        />,
      );

      expect(mockGenerateApiClientFile).toHaveBeenCalledWith(
        apiConfigs,
        expect.objectContaining({
          supabaseUrl: 'https://test.supabase.co',
          supabaseAnonKey: 'test-anon-key',
          prototypeId: 'proto-1',
          accessToken: 'test-access-token',
        }),
      );
    });

    it('does not pass proxyConfig when no auth session exists', () => {
      mockAuthReturn = { ...mockAuthReturn, session: null };

      const apiConfigs = [makeApiConfig({ isMock: false })];

      render(
        <SandpackLivePreview
          files={singleFile}
          apiConfigs={apiConfigs}
          prototypeId="proto-1"
        />,
      );

      // Should be called with undefined proxyConfig
      expect(mockGenerateApiClientFile).toHaveBeenCalledWith(apiConfigs, undefined);
    });

    it('does not pass proxyConfig when all endpoints are mock', () => {
      const apiConfigs = [makeApiConfig({ isMock: true })];

      render(
        <SandpackLivePreview
          files={singleFile}
          apiConfigs={apiConfigs}
          prototypeId="proto-1"
        />,
      );

      // Should be called with undefined proxyConfig (all mock)
      expect(mockGenerateApiClientFile).toHaveBeenCalledWith(apiConfigs, undefined);
    });

    it('does not pass proxyConfig when prototypeId is not provided', () => {
      const apiConfigs = [makeApiConfig({ isMock: false })];

      render(
        <SandpackLivePreview
          files={singleFile}
          apiConfigs={apiConfigs}
        />,
      );

      // Should be called with undefined proxyConfig (no prototypeId)
      expect(mockGenerateApiClientFile).toHaveBeenCalledWith(apiConfigs, undefined);
    });

    it('does not call generateApiClientFile when no apiConfigs are provided', () => {
      render(<SandpackLivePreview files={singleFile} prototypeId="proto-1" />);

      expect(mockGenerateApiClientFile).not.toHaveBeenCalled();
    });

    it('passes proxyConfig with mixed mock and non-mock endpoints', () => {
      const apiConfigs = [
        makeApiConfig({ name: 'mockEndpoint', isMock: true }),
        makeApiConfig({ name: 'realEndpoint', isMock: false }),
      ];

      render(
        <SandpackLivePreview
          files={singleFile}
          apiConfigs={apiConfigs}
          prototypeId="proto-1"
        />,
      );

      // Has non-mock endpoints, so proxyConfig should be passed
      expect(mockGenerateApiClientFile).toHaveBeenCalledWith(
        apiConfigs,
        expect.objectContaining({
          prototypeId: 'proto-1',
          accessToken: 'test-access-token',
        }),
      );
    });
  });
});
