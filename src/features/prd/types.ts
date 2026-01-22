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

// PRD section keys for iteration
export const PRD_SECTION_KEYS = [
  'problemStatement',
  'goalsAndMetrics',
  'userStories',
  'requirements',
  'technicalConsiderations',
  'risks',
  'timeline',
] as const;

export type PrdSectionKey = typeof PRD_SECTION_KEYS[number];

// PRD section display names
export const PRD_SECTION_LABELS: Record<PrdSectionKey, string> = {
  problemStatement: 'Problem Statement',
  goalsAndMetrics: 'Goals & Metrics',
  userStories: 'User Stories',
  requirements: 'Requirements',
  technicalConsiderations: 'Technical Considerations',
  risks: 'Risks',
  timeline: 'Timeline',
};

// PRD section update type (for AI chat responses)
export interface PrdSectionUpdate {
  sectionKey: keyof PrdContent;
  content: string;
  status: 'in_progress' | 'complete';
}
