// Admin feature types
export interface AdminDashboardStats {
  totalIdeas: number
  pendingReview: number
  approved: number
  rejected: number
}

export interface PipelineStage {
  stage: string
  count: number
}
