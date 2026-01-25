// src/features/prototypes/types.ts

export type PrototypeStatus = 'generating' | 'ready' | 'failed';

export interface Prototype {
  id: string;
  prdId: string;
  ideaId: string;
  userId: string;
  url: string | null;
  code: string | null;
  version: number;
  refinementPrompt: string | null;
  status: PrototypeStatus;
  createdAt: string;
  updatedAt: string;
}

// Database row format (snake_case)
export interface PrototypeRow {
  id: string;
  prd_id: string;
  idea_id: string;
  user_id: string;
  url: string | null;
  code: string | null;
  version: number;
  refinement_prompt: string | null;
  status: PrototypeStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePrototypeInput {
  prdId: string;
  ideaId: string;
  url?: string;
  code?: string;
  status?: PrototypeStatus;
}

export interface CreateVersionInput {
  prdId: string;
  ideaId: string;
  refinementPrompt: string;
  url?: string;
  code?: string;
}

export interface UpdatePrototypeInput {
  url?: string;
  code?: string;
  status?: PrototypeStatus;
}

// Helper to convert DB row to app format
export function mapPrototypeRow(row: PrototypeRow): Prototype {
  return {
    id: row.id,
    prdId: row.prd_id,
    ideaId: row.idea_id,
    userId: row.user_id,
    url: row.url,
    code: row.code,
    version: row.version,
    refinementPrompt: row.refinement_prompt,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
