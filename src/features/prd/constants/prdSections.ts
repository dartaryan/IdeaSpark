// PRD Section definitions and validation rules
// This is the single source of truth for all PRD sections

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

export interface PrdSectionDefinition {
  key: PrdSectionKey;
  title: string;
  description: string;
  placeholder: string;
  required: boolean;
  minContentLength: number;
  guideQuestions: string[];
}

export const PRD_SECTIONS: PrdSectionDefinition[] = [
  {
    key: 'problemStatement',
    title: 'Problem Statement',
    description: 'A clear articulation of the problem you\'re solving',
    placeholder: 'What specific problem does your idea address? Who experiences this problem?',
    required: true,
    minContentLength: 100,
    guideQuestions: [
      'What specific problem are you trying to solve?',
      'Who experiences this problem most acutely?',
      'What is the current impact of this problem?',
      'Why is this problem worth solving now?',
    ],
  },
  {
    key: 'goalsAndMetrics',
    title: 'Goals & Metrics',
    description: 'Success criteria and key performance indicators',
    placeholder: 'How will you measure success? What specific metrics will improve?',
    required: true,
    minContentLength: 80,
    guideQuestions: [
      'What does success look like for this solution?',
      'What specific metrics will you use to measure success?',
      'What are your target improvements (e.g., 30% reduction in X)?',
      'How will you track and report on these metrics?',
    ],
  },
  {
    key: 'userStories',
    title: 'User Stories',
    description: 'Descriptions of who uses this and what they can do',
    placeholder: 'As a [user type], I want [capability], so that [benefit]...',
    required: true,
    minContentLength: 100,
    guideQuestions: [
      'Who are the primary users of this solution?',
      'What are the key actions they need to perform?',
      'What benefit does each action provide?',
      'Are there different user types with different needs?',
    ],
  },
  {
    key: 'requirements',
    title: 'Requirements',
    description: 'Functional and non-functional requirements',
    placeholder: 'What must the solution do? What constraints must it meet?',
    required: true,
    minContentLength: 100,
    guideQuestions: [
      'What are the must-have features?',
      'What are nice-to-have features?',
      'Are there performance requirements?',
      'Are there security or compliance requirements?',
    ],
  },
  {
    key: 'technicalConsiderations',
    title: 'Technical Considerations',
    description: 'Architecture, constraints, and technical dependencies',
    placeholder: 'What technical aspects need to be considered?',
    required: true,
    minContentLength: 50,
    guideQuestions: [
      'What existing systems does this need to integrate with?',
      'Are there technical constraints to consider?',
      'What data or APIs will be needed?',
      'Are there scalability considerations?',
    ],
  },
  {
    key: 'risks',
    title: 'Risks',
    description: 'Risk assessment and mitigation strategies',
    placeholder: 'What could go wrong? How would you mitigate these risks?',
    required: true,
    minContentLength: 50,
    guideQuestions: [
      'What are the biggest risks to this project?',
      'What technical risks exist?',
      'What could cause delays or failures?',
      'How would you mitigate each risk?',
    ],
  },
  {
    key: 'timeline',
    title: 'Timeline',
    description: 'Implementation timeline and milestones',
    placeholder: 'What is the expected timeline? What are the key milestones?',
    required: false,
    minContentLength: 30,
    guideQuestions: [
      'What is the expected timeline for implementation?',
      'What are the key milestones?',
      'Are there dependencies that affect timing?',
      'What would a phased rollout look like?',
    ],
  },
];

export const REQUIRED_SECTIONS = PRD_SECTIONS.filter(s => s.required);

export function getSectionByKey(key: PrdSectionKey): PrdSectionDefinition | undefined {
  return PRD_SECTIONS.find(s => s.key === key);
}
