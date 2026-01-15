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
