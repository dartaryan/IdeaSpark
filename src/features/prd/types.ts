// Re-export database types for feature-level access
export type {
  PrdDocument,
  PrdMessage,
  PrdContent,
  PrdSection,
  PrdStatus,
  PrdSectionStatus,
  MessageRole,
  CreatePrdInput,
  UpdatePrdInput,
  CreateMessageInput,
} from '../../types/database';

// Feature-specific types
export interface PrdWithIdea extends PrdDocument {
  idea?: {
    id: string;
    title: string;
    problem: string;
    solution: string;
    impact: string;
  };
}

// Re-export section key type from constants for consistency
export type { PrdSectionKey } from './constants/prdSections';

// PRD section update type (for AI chat responses)
export interface PrdSectionUpdate {
  sectionKey: keyof PrdContent;
  content: string;
  status: 'in_progress' | 'complete';
}

// Validation types
export interface SectionValidationResult {
  key: keyof PrdContent;
  isValid: boolean;
  issues: string[];
}

export interface PrdCompletionValidation {
  isReady: boolean;
  completedCount: number;
  totalRequired: number;
  sectionResults: SectionValidationResult[];
  incompleteRequired: SectionValidationResult[];
}

// Completion flow types
export interface CompletePrdResult {
  prd: PrdDocument;
  ideaUpdated: boolean;
}
