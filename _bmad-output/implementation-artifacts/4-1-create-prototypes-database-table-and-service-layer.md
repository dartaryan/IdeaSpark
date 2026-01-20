# Story 4.1: Create Prototypes Database Table and Service Layer

Status: ready-for-dev

## Story

As a **developer**,
I want **the prototypes table created with proper schema and service layer**,
So that **prototype data and refinement history can be stored**.

## Acceptance Criteria

1. **Given** the Supabase project is set up **When** I run the database migration **Then** the `prototypes` table is created with columns: id (uuid), prd_id (uuid FK), idea_id (uuid FK), user_id (uuid FK), url (text), code (text), version (integer), refinement_prompt (text nullable), status (enum: generating/ready/failed), created_at (timestamptz), updated_at (timestamptz)

2. **Given** the prototypes table exists **Then** RLS policies are configured so users can only read/write their own prototypes

3. **Given** the prototypes table exists **Then** admins can read all prototypes (admin RLS policy)

4. **Given** a user creates multiple prototype versions **Then** multiple versions can exist per PRD (for refinement history), each with incremented version number

5. **Given** the database schema is created **Then** the prototypeService is created with CRUD operations following the architecture patterns (ServiceResponse<T> wrapper)

6. **Given** the prototypeService exists **Then** it includes methods: create, getById, getByPrdId, getByUserId, getVersionHistory, updateStatus, createVersion

7. **Given** the prototypeService methods are called **Then** they use React Query patterns with proper query keys following the established naming conventions

8. **Given** the prototypes table exists **Then** foreign key constraints reference prd_documents(id), ideas(id), and auth.users(id) with appropriate cascade behaviors

## Tasks / Subtasks

- [ ] Task 1: Create database migration for prototypes table (AC: 1, 4, 8)
  - [ ] Create `supabase/migrations/XXXXXX_create_prototypes.sql`
  - [ ] Define prototypes table with all columns and proper types
  - [ ] Add foreign key constraints to prd_documents, ideas, and auth.users
  - [ ] Create index on user_id for query performance
  - [ ] Create index on prd_id for version history queries
  - [ ] Create composite index on (prd_id, version) for ordering

- [ ] Task 2: Create RLS policies for prototypes table (AC: 2, 3)
  - [ ] Enable RLS on prototypes table
  - [ ] Create policy: users can SELECT own prototypes
  - [ ] Create policy: users can INSERT own prototypes
  - [ ] Create policy: users can UPDATE own prototypes (status changes)
  - [ ] Create policy: admins can SELECT all prototypes
  - [ ] Verify policies work with existing auth setup

- [ ] Task 3: Create TypeScript types for prototypes (AC: 5)
  - [ ] Add Prototype interface to `src/features/prototypes/types.ts`
  - [ ] Add PrototypeStatus type (enum: 'generating' | 'ready' | 'failed')
  - [ ] Add CreatePrototypeInput interface
  - [ ] Add UpdatePrototypeInput interface
  - [ ] Export types via barrel export in index.ts

- [ ] Task 4: Create prototypeService with CRUD operations (AC: 5, 6)
  - [ ] Create `src/features/prototypes/services/prototypeService.ts`
  - [ ] Implement create() method
  - [ ] Implement getById() method
  - [ ] Implement getByPrdId() method (returns all versions)
  - [ ] Implement getByUserId() method (returns user's prototypes)
  - [ ] Implement getVersionHistory() method (ordered by version desc)
  - [ ] Implement updateStatus() method
  - [ ] Implement createVersion() method (auto-increments version)
  - [ ] Use ServiceResponse<T> wrapper pattern from architecture

- [ ] Task 5: Create React Query hooks for prototypes (AC: 7)
  - [ ] Create `src/features/prototypes/hooks/usePrototype.ts`
  - [ ] Create `src/features/prototypes/hooks/usePrototypes.ts`
  - [ ] Create `src/features/prototypes/hooks/useCreatePrototype.ts`
  - [ ] Define query keys following convention: ['prototypes', 'detail', id]
  - [ ] Implement proper cache invalidation on mutations

- [ ] Task 6: Create Zod validation schemas (AC: 5)
  - [ ] Create `src/features/prototypes/schemas/prototypeSchemas.ts`
  - [ ] Define createPrototypeSchema
  - [ ] Define updatePrototypeSchema
  - [ ] Export schemas via barrel export

- [ ] Task 7: Set up feature folder structure (AC: 5)
  - [ ] Create `src/features/prototypes/` directory structure
  - [ ] Create components/, hooks/, services/, schemas/ subdirectories
  - [ ] Create index.ts barrel export
  - [ ] Create types.ts with all type definitions

- [ ] Task 8: Run migration and verify
  - [ ] Apply migration: `supabase db push` or via dashboard
  - [ ] Verify table created with correct schema
  - [ ] Verify RLS policies are active
  - [ ] Test CRUD operations via service layer

## Dev Notes

### Architecture Patterns (MANDATORY)

**Feature Folder Structure:**
```
src/features/prototypes/
├── components/           (Future stories - viewer, frame, etc.)
├── hooks/
│   ├── usePrototype.ts      (THIS STORY)
│   ├── usePrototypes.ts     (THIS STORY)
│   └── useCreatePrototype.ts (THIS STORY)
├── services/
│   └── prototypeService.ts  (THIS STORY)
├── schemas/
│   └── prototypeSchemas.ts  (THIS STORY)
├── types.ts                 (THIS STORY)
└── index.ts                 (THIS STORY)
```

**Database Migration Location:**
```
supabase/migrations/
└── XXXXXX_create_prototypes.sql  (THIS STORY)
```

### Database Schema Design

```sql
-- supabase/migrations/XXXXXX_create_prototypes.sql

-- Create status enum type
CREATE TYPE prototype_status AS ENUM ('generating', 'ready', 'failed');

-- Create prototypes table
CREATE TABLE prototypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prd_id UUID NOT NULL REFERENCES prd_documents(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT,                          -- URL to view the prototype (from Open-Lovable)
  code TEXT,                         -- Generated React code
  version INTEGER NOT NULL DEFAULT 1,
  refinement_prompt TEXT,            -- User's refinement request (null for initial)
  status prototype_status NOT NULL DEFAULT 'generating',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for query performance
CREATE INDEX idx_prototypes_user_id ON prototypes(user_id);
CREATE INDEX idx_prototypes_prd_id ON prototypes(prd_id);
CREATE INDEX idx_prototypes_idea_id ON prototypes(idea_id);
CREATE UNIQUE INDEX idx_prototypes_prd_version ON prototypes(prd_id, version);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prototypes_updated_at
  BEFORE UPDATE ON prototypes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE prototypes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own prototypes
CREATE POLICY "Users can view own prototypes"
  ON prototypes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own prototypes
CREATE POLICY "Users can create own prototypes"
  ON prototypes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prototypes
CREATE POLICY "Users can update own prototypes"
  ON prototypes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all prototypes
CREATE POLICY "Admins can view all prototypes"
  ON prototypes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON prototypes TO authenticated;
GRANT USAGE ON TYPE prototype_status TO authenticated;
```

### TypeScript Types

```typescript
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
```

### prototypeService Implementation

```typescript
// src/features/prototypes/services/prototypeService.ts

import { supabase } from '../../../lib/supabase';
import type { ServiceResponse } from '../../../services/types';
import { 
  Prototype, 
  PrototypeRow, 
  CreatePrototypeInput, 
  CreateVersionInput,
  UpdatePrototypeInput,
  PrototypeStatus,
  mapPrototypeRow 
} from '../types';

export const prototypeService = {
  /**
   * Create a new prototype (version 1)
   */
  async create(input: CreatePrototypeInput): Promise<ServiceResponse<Prototype>> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };
      }

      const { data, error } = await supabase
        .from('prototypes')
        .insert({
          prd_id: input.prdId,
          idea_id: input.ideaId,
          user_id: user.user.id,
          url: input.url || null,
          code: input.code || null,
          status: input.status || 'generating',
          version: 1,
        })
        .select()
        .single();

      if (error) {
        console.error('Create prototype error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Create prototype error:', error);
      return { data: null, error: { message: 'Failed to create prototype', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Get prototype by ID
   */
  async getById(id: string): Promise<ServiceResponse<Prototype>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: { message: 'Prototype not found', code: 'NOT_FOUND' } };
        }
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Get prototype error:', error);
      return { data: null, error: { message: 'Failed to get prototype', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Get all prototypes for a PRD (all versions)
   */
  async getByPrdId(prdId: string): Promise<ServiceResponse<Prototype[]>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('prd_id', prdId)
        .order('version', { ascending: false });

      if (error) {
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { 
        data: (data as PrototypeRow[]).map(mapPrototypeRow), 
        error: null 
      };
    } catch (error) {
      console.error('Get prototypes by PRD error:', error);
      return { data: null, error: { message: 'Failed to get prototypes', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Get all prototypes for a user
   */
  async getByUserId(userId: string): Promise<ServiceResponse<Prototype[]>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { 
        data: (data as PrototypeRow[]).map(mapPrototypeRow), 
        error: null 
      };
    } catch (error) {
      console.error('Get user prototypes error:', error);
      return { data: null, error: { message: 'Failed to get prototypes', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Get version history for a PRD (ordered by version descending)
   */
  async getVersionHistory(prdId: string): Promise<ServiceResponse<Prototype[]>> {
    return this.getByPrdId(prdId); // Same query, different semantic meaning
  },

  /**
   * Get latest version for a PRD
   */
  async getLatestVersion(prdId: string): Promise<ServiceResponse<Prototype>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('prd_id', prdId)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: { message: 'No prototype found for this PRD', code: 'NOT_FOUND' } };
        }
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Get latest version error:', error);
      return { data: null, error: { message: 'Failed to get prototype', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Update prototype status
   */
  async updateStatus(id: string, status: PrototypeStatus): Promise<ServiceResponse<Prototype>> {
    try {
      const { data, error } = await supabase
        .from('prototypes')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Update status error:', error);
      return { data: null, error: { message: 'Failed to update prototype', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Update prototype (URL, code, status)
   */
  async update(id: string, input: UpdatePrototypeInput): Promise<ServiceResponse<Prototype>> {
    try {
      const updates: Record<string, unknown> = {};
      if (input.url !== undefined) updates.url = input.url;
      if (input.code !== undefined) updates.code = input.code;
      if (input.status !== undefined) updates.status = input.status;

      const { data, error } = await supabase
        .from('prototypes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Update prototype error:', error);
      return { data: null, error: { message: 'Failed to update prototype', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Create a new version (for refinements)
   * Auto-increments version number based on existing versions
   */
  async createVersion(input: CreateVersionInput): Promise<ServiceResponse<Prototype>> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };
      }

      // Get current max version
      const { data: existing, error: versionError } = await supabase
        .from('prototypes')
        .select('version')
        .eq('prd_id', input.prdId)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (versionError && versionError.code !== 'PGRST116') {
        return { data: null, error: { message: versionError.message, code: 'DB_ERROR' } };
      }

      const nextVersion = existing ? existing.version + 1 : 1;

      const { data, error } = await supabase
        .from('prototypes')
        .insert({
          prd_id: input.prdId,
          idea_id: input.ideaId,
          user_id: user.user.id,
          url: input.url || null,
          code: input.code || null,
          refinement_prompt: input.refinementPrompt,
          status: 'generating',
          version: nextVersion,
        })
        .select()
        .single();

      if (error) {
        console.error('Create version error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapPrototypeRow(data as PrototypeRow), error: null };
    } catch (error) {
      console.error('Create version error:', error);
      return { data: null, error: { message: 'Failed to create version', code: 'UNKNOWN_ERROR' } };
    }
  },
};
```

### React Query Hooks

```typescript
// src/features/prototypes/hooks/usePrototype.ts

import { useQuery } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';

export const prototypeKeys = {
  all: ['prototypes'] as const,
  lists: () => [...prototypeKeys.all, 'list'] as const,
  list: (userId: string) => [...prototypeKeys.lists(), userId] as const,
  details: () => [...prototypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...prototypeKeys.details(), id] as const,
  byPrd: (prdId: string) => [...prototypeKeys.all, 'prd', prdId] as const,
  latestByPrd: (prdId: string) => [...prototypeKeys.all, 'prd', prdId, 'latest'] as const,
  versionHistory: (prdId: string) => [...prototypeKeys.all, 'prd', prdId, 'history'] as const,
};

export function usePrototype(id: string) {
  return useQuery({
    queryKey: prototypeKeys.detail(id),
    queryFn: async () => {
      const result = await prototypeService.getById(id);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function usePrototypesByPrd(prdId: string) {
  return useQuery({
    queryKey: prototypeKeys.byPrd(prdId),
    queryFn: async () => {
      const result = await prototypeService.getByPrdId(prdId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prdId,
  });
}

export function useLatestPrototype(prdId: string) {
  return useQuery({
    queryKey: prototypeKeys.latestByPrd(prdId),
    queryFn: async () => {
      const result = await prototypeService.getLatestVersion(prdId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prdId,
  });
}

export function useVersionHistory(prdId: string) {
  return useQuery({
    queryKey: prototypeKeys.versionHistory(prdId),
    queryFn: async () => {
      const result = await prototypeService.getVersionHistory(prdId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prdId,
  });
}
```

```typescript
// src/features/prototypes/hooks/usePrototypes.ts

import { useQuery } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';
import { prototypeKeys } from './usePrototype';

export function usePrototypes(userId: string) {
  return useQuery({
    queryKey: prototypeKeys.list(userId),
    queryFn: async () => {
      const result = await prototypeService.getByUserId(userId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!userId,
  });
}
```

```typescript
// src/features/prototypes/hooks/useCreatePrototype.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prototypeService } from '../services/prototypeService';
import { prototypeKeys } from './usePrototype';
import type { CreatePrototypeInput, CreateVersionInput, UpdatePrototypeInput, PrototypeStatus } from '../types';

export function useCreatePrototype() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePrototypeInput) => {
      const result = await prototypeService.create(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: prototypeKeys.byPrd(data.prdId) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.lists() });
      }
    },
  });
}

export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVersionInput) => {
      const result = await prototypeService.createVersion(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: prototypeKeys.byPrd(data.prdId) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.latestByPrd(data.prdId) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.versionHistory(data.prdId) });
      }
    },
  });
}

export function useUpdatePrototype() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdatePrototypeInput }) => {
      const result = await prototypeService.update(id, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: prototypeKeys.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.byPrd(data.prdId) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.latestByPrd(data.prdId) });
      }
    },
  });
}

export function useUpdatePrototypeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PrototypeStatus }) => {
      const result = await prototypeService.updateStatus(id, status);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: prototypeKeys.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: prototypeKeys.byPrd(data.prdId) });
      }
    },
  });
}
```

### Zod Validation Schemas

```typescript
// src/features/prototypes/schemas/prototypeSchemas.ts

import { z } from 'zod';

export const prototypeStatusSchema = z.enum(['generating', 'ready', 'failed']);

export const createPrototypeSchema = z.object({
  prdId: z.string().uuid('Invalid PRD ID'),
  ideaId: z.string().uuid('Invalid Idea ID'),
  url: z.string().url().optional(),
  code: z.string().optional(),
  status: prototypeStatusSchema.optional(),
});

export const createVersionSchema = z.object({
  prdId: z.string().uuid('Invalid PRD ID'),
  ideaId: z.string().uuid('Invalid Idea ID'),
  refinementPrompt: z.string().min(1, 'Refinement prompt is required'),
  url: z.string().url().optional(),
  code: z.string().optional(),
});

export const updatePrototypeSchema = z.object({
  url: z.string().url().optional(),
  code: z.string().optional(),
  status: prototypeStatusSchema.optional(),
});

export type CreatePrototypeSchema = z.infer<typeof createPrototypeSchema>;
export type CreateVersionSchema = z.infer<typeof createVersionSchema>;
export type UpdatePrototypeSchema = z.infer<typeof updatePrototypeSchema>;
```

### Barrel Export

```typescript
// src/features/prototypes/index.ts

// Types
export * from './types';

// Schemas
export * from './schemas/prototypeSchemas';

// Services
export { prototypeService } from './services/prototypeService';

// Hooks
export { 
  prototypeKeys,
  usePrototype, 
  usePrototypesByPrd, 
  useLatestPrototype,
  useVersionHistory 
} from './hooks/usePrototype';
export { usePrototypes } from './hooks/usePrototypes';
export { 
  useCreatePrototype, 
  useCreateVersion, 
  useUpdatePrototype,
  useUpdatePrototypeStatus 
} from './hooks/useCreatePrototype';
```

### Project Structure Notes

**Alignment with Unified Project Structure:**
- Feature folder follows `src/features/prototypes/` pattern per architecture.md
- Hooks use `use{Feature}{Action}` naming convention
- Service uses `{feature}Service` naming convention
- Types follow PascalCase convention
- Database columns use snake_case, TypeScript uses camelCase
- ServiceResponse<T> wrapper pattern maintained

**Migration Naming:**
- Follow existing pattern: `XXXXXX_create_prototypes.sql`
- Check existing migrations for next sequence number
- Existing migrations: 00001 (users), 00002 (ideas), 00003 (prd_documents)
- This migration should be `00005_create_prototypes.sql`

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Table name | `snake_case`, plural | `prototypes` |
| Column names | `snake_case` | `prd_id`, `refinement_prompt` |
| TypeScript interfaces | `PascalCase` | `Prototype`, `CreatePrototypeInput` |
| Service methods | `camelCase` | `getById`, `createVersion` |
| Hook names | `use` + `PascalCase` | `usePrototype`, `useCreateVersion` |
| Query keys | Array of strings | `['prototypes', 'detail', id]` |
| Enum values | `lowercase` | `'generating'`, `'ready'`, `'failed'` |

### Anti-Patterns to AVOID

1. **DO NOT** skip RLS policies - every table must have proper access control
2. **DO NOT** use direct database access in components - always use service layer
3. **DO NOT** forget to map snake_case to camelCase in responses
4. **DO NOT** create mutations without cache invalidation
5. **DO NOT** skip foreign key constraints - data integrity is critical
6. **DO NOT** use `any` type - always define proper TypeScript interfaces
7. **DO NOT** forget to export from barrel files
8. **DO NOT** skip index creation on frequently queried columns
9. **DO NOT** hardcode user_id - always get from auth context
10. **DO NOT** allow prototype status updates without validation

### Dependencies on Previous Stories

- **Story 1.3 (Supabase Setup):** Supabase project configured, users table exists
- **Story 2.1 (Ideas Table):** ideas table exists for foreign key reference
- **Story 3.1 (PRD Tables):** prd_documents table exists for foreign key reference

### Dependencies for Future Stories

- **Story 4.2 (Open-Lovable Edge Function):** Will use prototypeService.create() and updateStatus()
- **Story 4.3 (Trigger Generation):** Will use useCreatePrototype hook
- **Story 4.4 (Prototype Viewer):** Will use usePrototype and useLatestPrototype hooks
- **Story 4.5 (Chat Refinement):** Will use useCreateVersion hook
- **Story 4.6 (Refinement History):** Will use useVersionHistory hook

### Testing Considerations

- Unit test prototypeService methods with mocked Supabase client
- Test RLS policies via Supabase dashboard or integration tests
- Test query hooks with React Query test utilities
- Verify foreign key constraints with invalid ID insertions
- Test version auto-increment logic in createVersion

### Security Considerations

1. **RLS Enforcement:** All queries go through RLS - users only see their own data
2. **Admin Access:** Admin policy allows viewing all prototypes for dashboard
3. **User ID Validation:** Always get user_id from auth context, never from input
4. **Input Validation:** Zod schemas validate all inputs before database operations
5. **Foreign Key Integrity:** Cascade deletes prevent orphaned records

### Performance Considerations

- Indexes on user_id, prd_id, idea_id for fast lookups
- Composite index on (prd_id, version) for ordered version queries
- React Query caching reduces redundant database calls
- Pagination may be needed in future for large refinement histories

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Database Tables]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR27-FR34 Prototype Generation]
- [Source: _bmad-output/implementation-artifacts/2-1-create-ideas-database-table-and-service-layer.md] (Pattern reference)
- [Source: _bmad-output/implementation-artifacts/3-1-create-prd-database-tables-and-service-layer.md] (Pattern reference)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
