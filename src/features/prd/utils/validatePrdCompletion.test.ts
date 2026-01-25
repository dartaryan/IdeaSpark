import { describe, it, expect } from 'vitest';
import type { PrdContent, PrdSection } from '../../../types/database';
import {
  validateSection,
  validateAllSections,
  isReadyToComplete,
  getSectionStatus,
} from './validatePrdCompletion';

describe('validatePrdCompletion', () => {
  describe('getSectionStatus', () => {
    it('should return "empty" for undefined section', () => {
      expect(getSectionStatus(undefined)).toBe('empty');
    });

    it('should return "empty" for section with empty content', () => {
      const section: PrdSection = { content: '', status: 'empty' };
      expect(getSectionStatus(section)).toBe('empty');
    });

    it('should return "empty" for section with whitespace-only content', () => {
      const section: PrdSection = { content: '   \n  ', status: 'in_progress' };
      expect(getSectionStatus(section)).toBe('empty');
    });

    it('should return section status for section with content', () => {
      const section: PrdSection = { content: 'Some content', status: 'in_progress' };
      expect(getSectionStatus(section)).toBe('in_progress');
    });

    it('should return "in_progress" when status is undefined but content exists', () => {
      const section = { content: 'Some content', status: undefined } as any;
      expect(getSectionStatus(section)).toBe('in_progress');
    });
  });

  describe('validateSection', () => {
    it('should return invalid for undefined section', () => {
      const result = validateSection('problemStatement', undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.key).toBe('problemStatement');
      expect(result.issues).toContain('Problem Statement is empty');
    });

    it('should return invalid for section with empty content', () => {
      const section: PrdSection = { content: '', status: 'empty' };
      const result = validateSection('problemStatement', section);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Problem Statement is empty');
    });

    it('should return invalid for section with content below minimum length', () => {
      const section: PrdSection = {
        content: 'Short content',
        status: 'complete',
      };
      const result = validateSection('problemStatement', section);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('needs more detail'))).toBe(true);
    });

    it('should return invalid for section not marked as complete', () => {
      const section: PrdSection = {
        content: 'This is a long enough content that exceeds the minimum length requirement for the problem statement section. It provides detailed information about the problem being solved and the context around it.',
        status: 'in_progress',
      };
      const result = validateSection('problemStatement', section);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('still in progress'))).toBe(true);
    });

    it('should return valid for section meeting all criteria', () => {
      const section: PrdSection = {
        content: 'This is a comprehensive problem statement that clearly articulates the problem we are trying to solve. It includes sufficient detail about the impact and context.',
        status: 'complete',
      };
      const result = validateSection('problemStatement', section);
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should validate different sections with their specific minimum lengths', () => {
      // Timeline has lower minimum (30 chars)
      const shortSection: PrdSection = {
        content: 'Q1 2024 - Initial release',
        status: 'complete',
      };
      const timelineResult = validateSection('timeline', shortSection);
      expect(timelineResult.isValid).toBe(false); // Still too short

      const validTimeline: PrdSection = {
        content: 'Q1 2024 - Initial release with core features',
        status: 'complete',
      };
      const validTimelineResult = validateSection('timeline', validTimeline);
      expect(validTimelineResult.isValid).toBe(true);
    });

    it('should return invalid for unknown section key', () => {
      const section: PrdSection = { content: 'Content', status: 'complete' };
      const result = validateSection('unknownKey' as any, section);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Unknown section');
    });

    it('should trim content before checking length', () => {
      const section: PrdSection = {
        content: '   This content has whitespace padding but should still be validated correctly once trimmed. Additional text here.   ',
        status: 'complete',
      };
      const result = validateSection('problemStatement', section);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateAllSections', () => {
    it('should validate empty PRD content', () => {
      const prdContent: PrdContent = {};
      const result = validateAllSections(prdContent);
      
      expect(result.isReady).toBe(false);
      expect(result.completedCount).toBe(0);
      expect(result.totalRequired).toBe(6); // 6 required sections
      expect(result.incompleteRequired).toHaveLength(6);
    });

    it('should validate partially complete PRD', () => {
      const prdContent: PrdContent = {
        problemStatement: {
          content: 'This is a comprehensive problem statement with enough detail to meet the minimum requirements for validation purposes.',
          status: 'complete',
        },
        goalsAndMetrics: {
          content: 'Our primary goal is to reduce onboarding time by 50%. Key metrics include time-to-first-action and completion rate.',
          status: 'complete',
        },
      };
      const result = validateAllSections(prdContent);
      
      expect(result.isReady).toBe(false);
      expect(result.completedCount).toBe(2);
      expect(result.totalRequired).toBe(6);
      expect(result.incompleteRequired).toHaveLength(4);
    });

    it('should validate fully complete PRD (without optional sections)', () => {
      const prdContent: PrdContent = {
        problemStatement: {
          content: 'This is a comprehensive problem statement with enough detail to meet the minimum requirements for validation.',
          status: 'complete',
        },
        goalsAndMetrics: {
          content: 'Our primary goal is to reduce onboarding time by 50%. Key metrics include time-to-first-action and completion rate of the process.',
          status: 'complete',
        },
        userStories: {
          content: 'As a new user, I want to quickly understand the value proposition so that I can decide whether to continue. As an admin, I want to see user progress.',
          status: 'complete',
        },
        requirements: {
          content: 'The system must support SSO authentication, provide mobile-responsive design, handle 1000 concurrent users, and maintain 99.9% uptime SLA.',
          status: 'complete',
        },
        technicalConsiderations: {
          content: 'We will use React for frontend, Node.js backend, PostgreSQL database with Prisma ORM.',
          status: 'complete',
        },
        risks: {
          content: 'Main risks include third-party API dependencies, data migration complexity, and user adoption challenges. Mitigation strategies include fallback mechanisms.',
          status: 'complete',
        },
      };
      const result = validateAllSections(prdContent);
      
      expect(result.isReady).toBe(true);
      expect(result.completedCount).toBe(6);
      expect(result.totalRequired).toBe(6);
      expect(result.incompleteRequired).toHaveLength(0);
    });

    it('should not require optional sections for completion', () => {
      const prdContent: PrdContent = {
        problemStatement: {
          content: 'This is a comprehensive problem statement with enough detail to meet the minimum requirements for validation.',
          status: 'complete',
        },
        goalsAndMetrics: {
          content: 'Our primary goal is to reduce onboarding time by 50%. Key metrics include time-to-first-action and completion rate of the process.',
          status: 'complete',
        },
        userStories: {
          content: 'As a new user, I want to quickly understand the value proposition so that I can decide whether to continue. As an admin, I want to see user progress.',
          status: 'complete',
        },
        requirements: {
          content: 'The system must support SSO authentication, provide mobile-responsive design, handle 1000 concurrent users, and maintain 99.9% uptime SLA.',
          status: 'complete',
        },
        technicalConsiderations: {
          content: 'We will use React for frontend, Node.js backend, PostgreSQL database with Prisma ORM.',
          status: 'complete',
        },
        risks: {
          content: 'Main risks include third-party API dependencies, data migration complexity, and user adoption challenges. Mitigation strategies include fallback mechanisms.',
          status: 'complete',
        },
        // timeline is optional - not included
      };
      const result = validateAllSections(prdContent);
      
      expect(result.isReady).toBe(true);
    });

    it('should include all section results in response', () => {
      const prdContent: PrdContent = {
        problemStatement: {
          content: 'Complete problem statement with sufficient detail.',
          status: 'complete',
        },
      };
      const result = validateAllSections(prdContent);
      
      expect(result.sectionResults).toHaveLength(6);
      expect(result.sectionResults[0].key).toBe('problemStatement');
    });

    it('should identify specific issues for each incomplete section', () => {
      const prdContent: PrdContent = {
        problemStatement: {
          content: 'Too short',
          status: 'complete',
        },
        goalsAndMetrics: {
          content: 'Complete goals and metrics section with enough detail to pass validation.',
          status: 'in_progress', // Not marked complete
        },
      };
      const result = validateAllSections(prdContent);
      
      const problemIssue = result.incompleteRequired.find(r => r.key === 'problemStatement');
      expect(problemIssue?.issues.some(i => i.includes('needs more detail'))).toBe(true);
      
      const goalsIssue = result.incompleteRequired.find(r => r.key === 'goalsAndMetrics');
      expect(goalsIssue?.issues.some(i => i.includes('still in progress'))).toBe(true);
    });
  });

  describe('isReadyToComplete', () => {
    it('should return false for empty PRD', () => {
      const prdContent: PrdContent = {};
      expect(isReadyToComplete(prdContent)).toBe(false);
    });

    it('should return false for partially complete PRD', () => {
      const prdContent: PrdContent = {
        problemStatement: {
          content: 'Complete problem statement with sufficient detail.',
          status: 'complete',
        },
      };
      expect(isReadyToComplete(prdContent)).toBe(false);
    });

    it('should return true for fully complete PRD', () => {
      const prdContent: PrdContent = {
        problemStatement: {
          content: 'This is a comprehensive problem statement with enough detail to meet the minimum requirements for validation.',
          status: 'complete',
        },
        goalsAndMetrics: {
          content: 'Our primary goal is to reduce onboarding time by 50%. Key metrics include time-to-first-action and completion rate of the process.',
          status: 'complete',
        },
        userStories: {
          content: 'As a new user, I want to quickly understand the value proposition so that I can decide whether to continue. As an admin, I want to see user progress.',
          status: 'complete',
        },
        requirements: {
          content: 'The system must support SSO authentication, provide mobile-responsive design, handle 1000 concurrent users, and maintain 99.9% uptime SLA.',
          status: 'complete',
        },
        technicalConsiderations: {
          content: 'We will use React for frontend, Node.js backend, PostgreSQL database with Prisma ORM.',
          status: 'complete',
        },
        risks: {
          content: 'Main risks include third-party API dependencies, data migration complexity, and user adoption challenges. Mitigation strategies include fallback mechanisms.',
          status: 'complete',
        },
      };
      expect(isReadyToComplete(prdContent)).toBe(true);
    });
  });
});
