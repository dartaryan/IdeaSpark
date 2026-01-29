// Application constants

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'IdeaSpark'

export const IDEA_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export const USER_ROLES = {
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
} as const

export const PRD_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const

/**
 * Story 6.4: Completion Rate Benchmarks
 * Industry standard benchmarks for conversion rates
 * Used to determine health indicators (green/yellow/red)
 */
export const COMPLETION_RATE_BENCHMARKS = {
  submittedToApproved: {
    excellent: 70,  // >70% is excellent
    good: 50,       // 50-70% is good
    warning: 30,    // 30-50% needs attention
    critical: 30,   // <30% is critical
  },
  approvedToPrd: {
    excellent: 80,  // >80% is excellent
    good: 60,       // 60-80% is good
    warning: 40,    // 40-60% needs attention
    critical: 40,   // <40% is critical
  },
  prdToPrototype: {
    excellent: 75,  // >75% is excellent
    good: 50,       // 50-75% is good
    warning: 30,    // 30-50% needs attention
    critical: 30,   // <30% is critical
  },
  overall: {
    excellent: 50,  // >50% is excellent
    good: 30,       // 30-50% is good
    warning: 15,    // 15-30% needs attention
    critical: 15,   // <15% is critical
  },
} as const

/**
 * Story 6.4: Rate Health Thresholds
 * General thresholds for health indicators across all conversion rates
 */
export const RATE_HEALTH_THRESHOLDS = {
  excellent: 70,  // Green indicator
  good: 40,       // Yellow indicator
  critical: 40,   // Red indicator (below this)
} as const
