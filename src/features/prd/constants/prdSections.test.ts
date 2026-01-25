import { describe, it, expect } from 'vitest';
import {
  PRD_SECTION_KEYS,
  PRD_SECTIONS,
  REQUIRED_SECTIONS,
  getSectionByKey,
  type PrdSectionKey,
} from './prdSections';

describe('prdSections', () => {
  describe('PRD_SECTION_KEYS', () => {
    it('should contain exactly 7 section keys', () => {
      expect(PRD_SECTION_KEYS).toHaveLength(7);
    });

    it('should include all required section keys', () => {
      expect(PRD_SECTION_KEYS).toContain('problemStatement');
      expect(PRD_SECTION_KEYS).toContain('goalsAndMetrics');
      expect(PRD_SECTION_KEYS).toContain('userStories');
      expect(PRD_SECTION_KEYS).toContain('requirements');
      expect(PRD_SECTION_KEYS).toContain('technicalConsiderations');
      expect(PRD_SECTION_KEYS).toContain('risks');
      expect(PRD_SECTION_KEYS).toContain('timeline');
    });

    it('should be in the correct order for guided flow', () => {
      expect(PRD_SECTION_KEYS[0]).toBe('problemStatement');
      expect(PRD_SECTION_KEYS[1]).toBe('goalsAndMetrics');
      expect(PRD_SECTION_KEYS[2]).toBe('userStories');
      expect(PRD_SECTION_KEYS[3]).toBe('requirements');
      expect(PRD_SECTION_KEYS[4]).toBe('technicalConsiderations');
      expect(PRD_SECTION_KEYS[5]).toBe('risks');
      expect(PRD_SECTION_KEYS[6]).toBe('timeline');
    });
  });

  describe('PRD_SECTIONS', () => {
    it('should have definitions for all section keys', () => {
      expect(PRD_SECTIONS).toHaveLength(7);
      
      PRD_SECTION_KEYS.forEach(key => {
        const section = PRD_SECTIONS.find(s => s.key === key);
        expect(section).toBeDefined();
      });
    });

    it('should have all required fields for each section', () => {
      PRD_SECTIONS.forEach(section => {
        expect(section.key).toBeDefined();
        expect(section.title).toBeDefined();
        expect(section.description).toBeDefined();
        expect(section.placeholder).toBeDefined();
        expect(typeof section.required).toBe('boolean');
        expect(typeof section.minContentLength).toBe('number');
        expect(Array.isArray(section.guideQuestions)).toBe(true);
        expect(section.guideQuestions.length).toBeGreaterThan(0);
      });
    });

    it('should mark 6 sections as required', () => {
      const requiredCount = PRD_SECTIONS.filter(s => s.required).length;
      expect(requiredCount).toBe(6);
    });

    it('should mark timeline as optional', () => {
      const timeline = PRD_SECTIONS.find(s => s.key === 'timeline');
      expect(timeline?.required).toBe(false);
    });

    it('should have reasonable minContentLength values', () => {
      PRD_SECTIONS.forEach(section => {
        expect(section.minContentLength).toBeGreaterThan(0);
        expect(section.minContentLength).toBeLessThanOrEqual(200);
      });
    });

    it('should have at least 3 guide questions per section', () => {
      PRD_SECTIONS.forEach(section => {
        expect(section.guideQuestions.length).toBeGreaterThanOrEqual(3);
      });
    });

    describe('problemStatement section', () => {
      it('should have correct configuration', () => {
        const section = PRD_SECTIONS.find(s => s.key === 'problemStatement');
        expect(section?.title).toBe('Problem Statement');
        expect(section?.required).toBe(true);
        expect(section?.minContentLength).toBe(100);
      });
    });

    describe('goalsAndMetrics section', () => {
      it('should have correct configuration', () => {
        const section = PRD_SECTIONS.find(s => s.key === 'goalsAndMetrics');
        expect(section?.title).toBe('Goals & Metrics');
        expect(section?.required).toBe(true);
        expect(section?.minContentLength).toBe(80);
      });
    });

    describe('userStories section', () => {
      it('should have correct configuration', () => {
        const section = PRD_SECTIONS.find(s => s.key === 'userStories');
        expect(section?.title).toBe('User Stories');
        expect(section?.required).toBe(true);
        expect(section?.minContentLength).toBe(100);
      });
    });

    describe('requirements section', () => {
      it('should have correct configuration', () => {
        const section = PRD_SECTIONS.find(s => s.key === 'requirements');
        expect(section?.title).toBe('Requirements');
        expect(section?.required).toBe(true);
        expect(section?.minContentLength).toBe(100);
      });
    });

    describe('technicalConsiderations section', () => {
      it('should have correct configuration', () => {
        const section = PRD_SECTIONS.find(s => s.key === 'technicalConsiderations');
        expect(section?.title).toBe('Technical Considerations');
        expect(section?.required).toBe(true);
        expect(section?.minContentLength).toBe(50);
      });
    });

    describe('risks section', () => {
      it('should have correct configuration', () => {
        const section = PRD_SECTIONS.find(s => s.key === 'risks');
        expect(section?.title).toBe('Risks');
        expect(section?.required).toBe(true);
        expect(section?.minContentLength).toBe(50);
      });
    });

    describe('timeline section', () => {
      it('should have correct configuration', () => {
        const section = PRD_SECTIONS.find(s => s.key === 'timeline');
        expect(section?.title).toBe('Timeline');
        expect(section?.required).toBe(false);
        expect(section?.minContentLength).toBe(30);
      });
    });
  });

  describe('REQUIRED_SECTIONS', () => {
    it('should contain only required sections', () => {
      expect(REQUIRED_SECTIONS.length).toBe(6);
      REQUIRED_SECTIONS.forEach(section => {
        expect(section.required).toBe(true);
      });
    });

    it('should not include timeline', () => {
      const hasTimeline = REQUIRED_SECTIONS.some(s => s.key === 'timeline');
      expect(hasTimeline).toBe(false);
    });

    it('should include all other sections', () => {
      expect(REQUIRED_SECTIONS.some(s => s.key === 'problemStatement')).toBe(true);
      expect(REQUIRED_SECTIONS.some(s => s.key === 'goalsAndMetrics')).toBe(true);
      expect(REQUIRED_SECTIONS.some(s => s.key === 'userStories')).toBe(true);
      expect(REQUIRED_SECTIONS.some(s => s.key === 'requirements')).toBe(true);
      expect(REQUIRED_SECTIONS.some(s => s.key === 'technicalConsiderations')).toBe(true);
      expect(REQUIRED_SECTIONS.some(s => s.key === 'risks')).toBe(true);
    });
  });

  describe('getSectionByKey', () => {
    it('should return section definition for valid key', () => {
      const section = getSectionByKey('problemStatement');
      expect(section).toBeDefined();
      expect(section?.key).toBe('problemStatement');
      expect(section?.title).toBe('Problem Statement');
    });

    it('should return section for all valid keys', () => {
      PRD_SECTION_KEYS.forEach(key => {
        const section = getSectionByKey(key);
        expect(section).toBeDefined();
        expect(section?.key).toBe(key);
      });
    });

    it('should return undefined for invalid key', () => {
      const section = getSectionByKey('invalidKey' as PrdSectionKey);
      expect(section).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const section = getSectionByKey('' as PrdSectionKey);
      expect(section).toBeUndefined();
    });
  });
});
