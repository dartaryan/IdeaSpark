import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { IdeaDetailActions } from './IdeaDetailActions';
import type { Idea } from '../types';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('IdeaDetailActions', () => {
  const baseIdea: Idea = {
    id: 'idea-123',
    user_id: 'user-1',
    title: 'Test Idea',
    problem: 'Problem',
    solution: 'Solution',
    impact: 'Impact',
    enhanced_problem: null,
    enhanced_solution: null,
    enhanced_impact: null,
    status: 'submitted',
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-01-20T12:00:00Z',
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Build PRD button visibility (AC 6)', () => {
    it('shows Build PRD button when status is approved', () => {
      const approvedIdea: Idea = { ...baseIdea, status: 'approved' };
      renderWithRouter(<IdeaDetailActions idea={approvedIdea} />);
      
      expect(screen.getByTestId('build-prd-button')).toBeInTheDocument();
      expect(screen.getByText('Build PRD')).toBeInTheDocument();
    });

    it('does not show Build PRD button when status is submitted', () => {
      const submittedIdea: Idea = { ...baseIdea, status: 'submitted' };
      renderWithRouter(<IdeaDetailActions idea={submittedIdea} />);
      
      expect(screen.queryByTestId('build-prd-button')).not.toBeInTheDocument();
    });

    it('does not show Build PRD button when status is rejected', () => {
      const rejectedIdea: Idea = { ...baseIdea, status: 'rejected' };
      renderWithRouter(<IdeaDetailActions idea={rejectedIdea} />);
      
      expect(screen.queryByTestId('build-prd-button')).not.toBeInTheDocument();
    });

    it('does not show Build PRD button when status is prd_development', () => {
      const prdDevIdea: Idea = { ...baseIdea, status: 'prd_development' };
      renderWithRouter(<IdeaDetailActions idea={prdDevIdea} />);
      
      expect(screen.queryByTestId('build-prd-button')).not.toBeInTheDocument();
    });

    it('does not show Build PRD button when status is prototype_complete', () => {
      const prototypeIdea: Idea = { ...baseIdea, status: 'prototype_complete' };
      renderWithRouter(<IdeaDetailActions idea={prototypeIdea} />);
      
      expect(screen.queryByTestId('build-prd-button')).not.toBeInTheDocument();
    });
  });

  describe('Build PRD navigation (AC 7)', () => {
    it('navigates to PRD builder when Build PRD is clicked', async () => {
      const user = userEvent.setup();
      const approvedIdea: Idea = { ...baseIdea, id: 'idea-456', status: 'approved' };
      renderWithRouter(<IdeaDetailActions idea={approvedIdea} />);
      
      const buildButton = screen.getByTestId('build-prd-button');
      await user.click(buildButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/prd/idea-456');
    });

    it('uses correct idea ID in PRD route', async () => {
      const user = userEvent.setup();
      const approvedIdea: Idea = { ...baseIdea, id: 'different-id', status: 'approved' };
      renderWithRouter(<IdeaDetailActions idea={approvedIdea} />);
      
      const buildButton = screen.getByTestId('build-prd-button');
      await user.click(buildButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/prd/different-id');
    });
  });

  describe('Back to My Ideas button (AC 10)', () => {
    it('always shows Back to My Ideas button', () => {
      renderWithRouter(<IdeaDetailActions idea={baseIdea} />);
      
      expect(screen.getByTestId('back-to-ideas-button')).toBeInTheDocument();
      expect(screen.getByText('Back to My Ideas')).toBeInTheDocument();
    });

    it('shows Back button even when Build PRD is visible', () => {
      const approvedIdea: Idea = { ...baseIdea, status: 'approved' };
      renderWithRouter(<IdeaDetailActions idea={approvedIdea} />);
      
      expect(screen.getByTestId('build-prd-button')).toBeInTheDocument();
      expect(screen.getByTestId('back-to-ideas-button')).toBeInTheDocument();
    });

    it('navigates to ideas list when Back button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<IdeaDetailActions idea={baseIdea} />);
      
      const backButton = screen.getByTestId('back-to-ideas-button');
      await user.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/ideas');
    });
  });

  describe('button styling', () => {
    it('Build PRD button has primary styling', () => {
      const approvedIdea: Idea = { ...baseIdea, status: 'approved' };
      renderWithRouter(<IdeaDetailActions idea={approvedIdea} />);
      
      const buildButton = screen.getByTestId('build-prd-button');
      expect(buildButton).toHaveClass('btn-primary');
      expect(buildButton).toHaveClass('btn-lg');
    });

    it('Back button has ghost styling', () => {
      renderWithRouter(<IdeaDetailActions idea={baseIdea} />);
      
      const backButton = screen.getByTestId('back-to-ideas-button');
      expect(backButton).toHaveClass('btn-ghost');
    });
  });
});
