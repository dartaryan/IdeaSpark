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
  // Sharing fields
  shareId: string;
  isPublic: boolean;
  sharedAt: string | null;
  viewCount: number;
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
  // Sharing fields
  share_id: string;
  is_public: boolean;
  shared_at: string | null;
  view_count: number;
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

// Public prototype type (subset of fields exposed publicly)
export interface PublicPrototype {
  id: string;
  url: string | null;
  version: number;
  status: PrototypeStatus;
  createdAt: string;
  shareId: string;
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
    shareId: row.share_id,
    isPublic: row.is_public,
    sharedAt: row.shared_at,
    viewCount: row.view_count,
  };
}
