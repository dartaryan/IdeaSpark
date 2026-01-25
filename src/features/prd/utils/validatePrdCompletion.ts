// PRD completion validation utilities

import { PRD_SECTIONS, REQUIRED_SECTIONS } from '../constants/prdSections';
import type { PrdContent, PrdSection, PrdSectionStatus } from '../../../types/database';
import type { SectionValidationResult, PrdCompletionValidation } from '../types';

/**
 * Get the display status for a section
 * Returns 'empty' if section is undefined or has no content
 */
export function getSectionStatus(section: PrdSection | undefined): PrdSectionStatus {
  if (!section || !section.content || section.content.trim().length === 0) {
    return 'empty';
  }
  return section.status || 'in_progress';
}

/**
 * Validate a single PRD section against its definition
 */
export function validateSection(
  key: keyof PrdContent,
  section: PrdSection | undefined
): SectionValidationResult {
  const definition = PRD_SECTIONS.find(s => s.key === key);
  if (!definition) {
    return { key, isValid: false, issues: ['Unknown section'] };
  }

  const issues: string[] = [];

  // Check if section exists and has content
  if (!section || !section.content || section.content.trim().length === 0) {
    issues.push(`${definition.title} is empty`);
    return { key, isValid: false, issues };
  }

  // Check minimum content length
  if (section.content.trim().length < definition.minContentLength) {
    issues.push(
      `${definition.title} needs more detail (minimum ${definition.minContentLength} characters, currently ${section.content.trim().length})`
    );
  }

  // Check if marked as complete
  if (section.status !== 'complete') {
    issues.push(`${definition.title} is still in progress`);
  }

  return {
    key,
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Validate all required sections of a PRD
 */
export function validateAllSections(prdContent: PrdContent): PrdCompletionValidation {
  const sectionResults = REQUIRED_SECTIONS.map(def => 
    validateSection(def.key, prdContent[def.key])
  );

  const incompleteRequired = sectionResults.filter(r => !r.isValid);
  const completedCount = sectionResults.filter(r => r.isValid).length;

  return {
    isReady: incompleteRequired.length === 0,
    completedCount,
    totalRequired: REQUIRED_SECTIONS.length,
    sectionResults,
    incompleteRequired,
  };
}

/**
 * Check if a PRD is ready to be marked as complete
 */
export function isReadyToComplete(prdContent: PrdContent): boolean {
  return validateAllSections(prdContent).isReady;
}
