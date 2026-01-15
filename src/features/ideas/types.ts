// Ideas feature types
export interface Idea {
  id: string
  user_id: string
  title: string
  problem_statement: string
  proposed_solution: string
  expected_impact: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  ai_enhanced_content: string | null
  created_at: string
  updated_at: string
}
