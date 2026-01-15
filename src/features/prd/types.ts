// PRD feature types
export interface PRD {
  id: string
  idea_id: string
  content: Record<string, unknown>
  status: 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

export interface PRDMessage {
  id: string
  prd_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
