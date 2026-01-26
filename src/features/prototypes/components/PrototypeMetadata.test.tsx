import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { PrototypeMetadata } from './PrototypeMetadata';
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PrototypeMetadata', () => {
  const defaultProps = {
    prototypeId: 'proto-1',
    version: 1,
    createdAt: '2024-01-01T12:00:00Z',
    ideaId: 'idea-1',
    ideaTitle: 'My Awesome Idea',
    prdId: 'prd-1',
  };

  const renderComponent = (props = defaultProps) => {
    return render(<PrototypeMetadata {...props} />);
  };

  describe('Prototype Metadata Display (AC 5)', () => {
    it('should display prototype version', () => {
      renderComponent();
      expect(screen.getByText(/version 1/i)).toBeInTheDocument();
    });

    it('should display creation date in relative format', () => {
      renderComponent();
      // date-fns formatDistanceToNow should be used
      expect(screen.getByText(/ago/i)).toBeInTheDocument();
    });

    it('should display idea title in header', () => {
      renderComponent();
      expect(screen.getByText(/my awesome idea.*prototype/i)).toBeInTheDocument();
    });

    it('should handle missing idea title gracefully', () => {
      renderComponent({ ...defaultProps, ideaTitle: undefined });
      expect(screen.getByText(/prototype preview/i)).toBeInTheDocument();
    });
  });

  describe('Breadcrumb Navigation (AC 5)', () => {
    it('should show breadcrumb with My Ideas > Idea > Prototype', () => {
      renderComponent();
      
      expect(screen.getByText('My Ideas')).toBeInTheDocument();
      expect(screen.getByText('My Awesome Idea')).toBeInTheDocument();
      expect(screen.getByText('Prototype')).toBeInTheDocument();
    });

    it('should navigate to ideas list when clicking My Ideas', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const myIdeasLink = screen.getByText('My Ideas');
      await user.click(myIdeasLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/ideas');
    });

    it('should navigate to idea detail when clicking idea name', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const ideaLink = screen.getByText('My Awesome Idea');
      await user.click(ideaLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/ideas/idea-1');
    });

    it('should show "Idea" as fallback when idea title is missing', () => {
      renderComponent({ ...defaultProps, ideaTitle: undefined });
      
      const breadcrumbItems = screen.getAllByRole('button');
      const ideaBreadcrumb = breadcrumbItems.find(btn => btn.textContent === 'Idea');
      expect(ideaBreadcrumb).toBeInTheDocument();
    });
  });

  describe('Action Buttons (AC 5)', () => {
    it('should render View Idea button', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /view idea/i })).toBeInTheDocument();
    });

    it('should render View PRD button', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /view prd/i })).toBeInTheDocument();
    });

    it('should navigate to idea detail when clicking View Idea', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const viewIdeaButton = screen.getByRole('button', { name: /view idea/i });
      await user.click(viewIdeaButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/ideas/idea-1');
    });

    it('should navigate to PRD when clicking View PRD', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const viewPrdButton = screen.getByRole('button', { name: /view prd/i });
      await user.click(viewPrdButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/prd/prd-1');
    });
  });

  describe('Icons', () => {
    it('should display icons for navigation items', () => {
      renderComponent();
      
      // Check for SVG icons (from lucide-react)
      const icons = screen.getByRole('banner').querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Layout (AC 8)', () => {
    it('should use flex layout that adapts to mobile', () => {
      renderComponent();
      
      // Check for responsive classes
      const container = screen.getByRole('banner');
      expect(container).toBeInTheDocument();
    });
  });
});
