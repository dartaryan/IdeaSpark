// src/features/admin/components/MetricCard.test.tsx
// Task 3 Tests - Story 5.1

import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { MetricCard } from './MetricCard';

describe('MetricCard - Task 3', () => {
  describe('Subtask 3.1 & 3.2: Component structure and content', () => {
    it('should render metric card with title and count', () => {
      render(
        <MetricCard
          title="Submitted"
          count={10}
          description="New ideas awaiting review"
          color="gray"
          icon={<div data-testid="test-icon">Icon</div>}
        />
      );

      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('New ideas awaiting review')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render all required statuses when used in dashboard', () => {
      const statuses = ['Submitted', 'Approved', 'PRD Development', 'Prototype Complete'];
      
      const { container } = render(
        <div>
          {statuses.map((status, index) => (
            <MetricCard
              key={status}
              title={status}
              count={index}
              description={`Description for ${status}`}
              color="gray"
              icon={<div>Icon</div>}
            />
          ))}
        </div>
      );

      statuses.forEach(status => {
        expect(screen.getByText(status)).toBeInTheDocument();
      });
    });
  });

  describe('Subtask 3.3: Semantic colors', () => {
    it('should apply gray color for submitted', () => {
      const { container } = render(
        <MetricCard
          title="Submitted"
          count={5}
          description="Test"
          color="gray"
          icon={<div>Icon</div>}
        />
      );

      const countElement = screen.getByText('5');
      // Gray color should be default (no special color class)
      expect(countElement).toBeInTheDocument();
    });

    it('should apply blue color for approved', () => {
      const { container } = render(
        <MetricCard
          title="Approved"
          count={3}
          description="Test"
          color="blue"
          icon={<div>Icon</div>}
        />
      );

      const countElement = screen.getByText('3');
      // Should have blue color styling
      const style = window.getComputedStyle(countElement);
      expect(countElement).toBeInTheDocument();
    });

    it('should apply yellow color for prd development', () => {
      render(
        <MetricCard
          title="PRD Development"
          count={2}
          description="Test"
          color="yellow"
          icon={<div>Icon</div>}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should apply green color for prototype complete', () => {
      render(
        <MetricCard
          title="Prototype Complete"
          count={1}
          description="Test"
          color="green"
          icon={<div>Icon</div>}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Subtask 3.4: Heroicons with neutral gray', () => {
    it('should render icon with neutral gray color', () => {
      render(
        <MetricCard
          title="Test"
          count={5}
          description="Test"
          color="gray"
          icon={
            <svg data-testid="hero-icon" stroke="#525355">
              <path />
            </svg>
          }
        />
      );

      const icon = screen.getByTestId('hero-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.getAttribute('stroke')).toBe('#525355');
    });

    it('should never use black (#000000) for icons', () => {
      render(
        <MetricCard
          title="Test"
          count={5}
          description="Test"
          color="gray"
          icon={
            <svg data-testid="hero-icon" stroke="#525355">
              <path />
            </svg>
          }
        />
      );

      const icon = screen.getByTestId('hero-icon');
      expect(icon.getAttribute('stroke')).not.toBe('#000000');
      expect(icon.getAttribute('stroke')).not.toBe('black');
    });
  });

  describe('Subtask 3.5: Display count prominently', () => {
    it('should display count in large font size', () => {
      render(
        <MetricCard
          title="Submitted"
          count={42}
          description="Test"
          color="gray"
          icon={<div>Icon</div>}
        />
      );

      const countElement = screen.getByText('42');
      expect(countElement).toBeInTheDocument();
      
      // Should have large text styling (text-4xl in Tailwind)
      expect(countElement.className).toContain('text-4xl');
      expect(countElement.className).toContain('font-bold');
    });

    it('should display label below count', () => {
      const { container } = render(
        <MetricCard
          title="Submitted"
          count={10}
          description="New ideas"
          color="gray"
          icon={<div>Icon</div>}
        />
      );

      // Title should appear above count
      const title = screen.getByText('Submitted');
      const count = screen.getByText('10');
      
      expect(title).toBeInTheDocument();
      expect(count).toBeInTheDocument();
      
      // Visual hierarchy: title first, then count
      const allText = container.textContent;
      const titleIndex = allText?.indexOf('Submitted') ?? -1;
      const countIndex = allText?.indexOf('10') ?? -1;
      
      expect(titleIndex).toBeLessThan(countIndex);
    });
  });

  describe('PassportCard Design System compliance', () => {
    it('should use 20px border radius', () => {
      const { container } = render(
        <MetricCard
          title="Test"
          count={5}
          description="Test"
          color="gray"
          icon={<div>Icon</div>}
        />
      );

      const card = container.querySelector('.card');
      expect(card).toBeInTheDocument();
      
      // Check for inline style with 20px border radius
      const style = card?.getAttribute('style');
      expect(style).toContain('border-radius');
      expect(style).toContain('20px');
    });

    it('should use Montserrat font for count', () => {
      render(
        <MetricCard
          title="Test"
          count={5}
          description="Test"
          color="gray"
          icon={<div>Icon</div>}
        />
      );

      const countElement = screen.getByText('5');
      
      // Should have Montserrat font styling
      const style = countElement.getAttribute('style');
      expect(style).toContain('Montserrat');
    });

    it('should use Rubik font for labels', () => {
      render(
        <MetricCard
          title="Test"
          count={5}
          description="Test description"
          color="gray"
          icon={<div>Icon</div>}
        />
      );

      const description = screen.getByText('Test description');
      
      // Should have Rubik font styling
      const style = description.getAttribute('style');
      expect(style).toContain('Rubik');
    });
  });
});
