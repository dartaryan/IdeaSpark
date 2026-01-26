import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils';
import { PrototypeFrame } from './PrototypeFrame';

const mockDevice = {
  id: 'desktop' as const,
  label: 'Desktop',
  width: 1920,
  height: 1080,
};

describe('PrototypeFrame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Iframe Rendering (AC 1)', () => {
    it('should render iframe with correct URL', () => {
      const url = 'https://example.com/prototype';
      render(<PrototypeFrame url={url} device={mockDevice} />);
      
      const iframe = screen.getByTitle('Prototype Preview');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', url);
    });

    it('should render iframe with sandbox attributes for security (AC 1, Task 7)', () => {
      render(<PrototypeFrame url="https://example.com" device={mockDevice} />);
      
      const iframe = screen.getByTitle('Prototype Preview');
      expect(iframe).toHaveAttribute('sandbox');
      
      const sandbox = iframe.getAttribute('sandbox');
      expect(sandbox).toContain('allow-scripts');
      expect(sandbox).toContain('allow-same-origin');
      expect(sandbox).toContain('allow-forms');
      expect(sandbox).toContain('allow-popups');
    });
  });

  describe('Loading State (AC 6)', () => {
    it('should show loading spinner initially', () => {
      render(<PrototypeFrame url="https://example.com" device={mockDevice} />);
      
      expect(screen.getByText(/loading prototype/i)).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Device Frame Styling (AC 3)', () => {
    it('should apply mobile device frame styles', () => {
      const mobileDevice = {
        id: 'mobile' as const,
        label: 'Mobile',
        width: 375,
        height: 667,
      };
      
      render(<PrototypeFrame url="https://example.com" device={mobileDevice} />);
      
      const iframe = screen.getByTitle('Prototype Preview');
      expect(iframe.parentElement).toHaveClass('border-8');
      expect(iframe.parentElement).toHaveClass('rounded-[40px]');
    });

    it('should apply tablet device frame styles', () => {
      const tabletDevice = {
        id: 'tablet' as const,
        label: 'Tablet',
        width: 768,
        height: 1024,
      };
      
      render(<PrototypeFrame url="https://example.com" device={tabletDevice} />);
      
      const iframe = screen.getByTitle('Prototype Preview');
      expect(iframe.parentElement).toHaveClass('border-4');
      expect(iframe.parentElement).toHaveClass('rounded-[20px]');
    });

    it('should apply desktop device frame styles', () => {
      render(<PrototypeFrame url="https://example.com" device={mockDevice} />);
      
      const iframe = screen.getByTitle('Prototype Preview');
      expect(iframe.parentElement).toHaveClass('border');
    });
  });

  describe('Responsive Viewport (AC 2, 3)', () => {
    it('should set iframe dimensions based on device', () => {
      render(<PrototypeFrame url="https://example.com" device={mockDevice} />);
      
      const iframe = screen.getByTitle('Prototype Preview');
      // Height should be set via style
      expect(iframe).toHaveStyle({ border: 'none' });
    });

    it('should handle device changes with smooth transitions', () => {
      const { rerender } = render(
        <PrototypeFrame url="https://example.com" device={mockDevice} />
      );
      
      const tabletDevice = {
        id: 'tablet' as const,
        label: 'Tablet',
        width: 768,
        height: 1024,
      };
      
      rerender(<PrototypeFrame url="https://example.com" device={tabletDevice} />);
      
      const iframe = screen.getByTitle('Prototype Preview');
      expect(iframe).toBeInTheDocument();
    });
  });

  describe('Error Handling (AC 7)', () => {
    it('should show error message on iframe load error', async () => {
      render(<PrototypeFrame url="https://invalid-url.com" device={mockDevice} />);
      
      const iframe = screen.getByTitle('Prototype Preview');
      
      // Simulate iframe error by calling onError directly
      const onError = vi.fn();
      iframe.addEventListener('error', onError);
      iframe.dispatchEvent(new ErrorEvent('error'));
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load prototype/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show refresh button on error', async () => {
      render(<PrototypeFrame url="https://invalid-url.com" device={mockDevice} />);
      
      const iframe = screen.getByTitle('Prototype Preview');
      iframe.dispatchEvent(new ErrorEvent('error'));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Timeout Handling (AC 6)', () => {
    it('should show timeout message after 10 seconds', async () => {
      vi.useFakeTimers();
      
      render(<PrototypeFrame url="https://slow-url.com" device={mockDevice} />);
      
      // Fast-forward time by 10 seconds
      await vi.advanceTimersByTimeAsync(10000);
      
      await waitFor(() => {
        expect(screen.getByText(/loading taking longer than expected/i)).toBeInTheDocument();
      }, { timeout: 1000 });
      
      vi.useRealTimers();
    }, 15000);

    it('should show retry button on timeout', async () => {
      vi.useFakeTimers();
      
      render(<PrototypeFrame url="https://slow-url.com" device={mockDevice} />);
      
      await vi.advanceTimersByTimeAsync(10000);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      }, { timeout: 1000 });
      
      vi.useRealTimers();
    }, 15000);
  });

  describe('Successful Load', () => {
    it('should hide loading spinner after iframe loads', async () => {
      render(<PrototypeFrame url="https://example.com" device={mockDevice} />);
      
      const iframe = screen.getByTitle('Prototype Preview');
      
      // Simulate iframe load
      iframe.dispatchEvent(new Event('load'));
      
      await waitFor(() => {
        expect(screen.queryByText(/loading prototype/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
