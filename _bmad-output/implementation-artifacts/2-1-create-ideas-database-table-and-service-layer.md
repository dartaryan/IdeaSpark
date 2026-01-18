# Story 2.1: Create Ideas Database Table and Service Layer

Status: review

## Story

As a **developer**,
I want **the ideas table created with proper schema and service layer**,
So that **idea data can be stored and retrieved**.

## Acceptance Criteria

1. **Given** the Supabase project is set up **When** I run the database migration **Then** the `ideas` table is created with the required schema

2. The `ideas` table includes columns: id (UUID, primary key), user_id (UUID, foreign key to users), title (text), problem (text), solution (text), impact (text), enhanced_problem (text, nullable), enhanced_solution (text, nullable), enhanced_impact (text, nullable), status (enum: submitted, approved, prd_development, prototype_complete, rejected), created_at (timestamp), updated_at (timestamp)

3. **Given** a regular user is logged in **When** they query the ideas table **Then** they can only see their own ideas (RLS policy enforced)

4. **Given** an admin user is logged in **When** they query the ideas table **Then** they can see all ideas from all users (RLS policy enforced)

5. **Given** a user creates an idea **When** they don't specify a status **Then** the status defaults to "submitted"

6. The ideaService is created with CRUD operations following the architecture patterns (ServiceResponse type, error handling)

7. TypeScript types are generated/created for the ideas table schema

8. The service layer is testable and follows the established patterns from authService

## Tasks / Subtasks

- [x] Task 1: Create database migration for ideas table (AC: 1, 2, 5)
  - [x] Create `supabase/migrations/00003_create_ideas.sql`
  - [x] Define status enum type `idea_status`
  - [x] Create ideas table with all required columns
  - [x] Add foreign key constraint to users table
  - [x] Set default status to 'submitted'
  - [x] Add created_at/updated_at with default NOW() and trigger for updated_at

- [x] Task 2: Create RLS policies for ideas table (AC: 3, 4)
  - [x] Create `supabase/migrations/00004_create_ideas_rls_policies.sql`
  - [x] Enable RLS on ideas table
  - [x] Create policy: users can SELECT their own ideas (user_id = auth.uid())
  - [x] Create policy: users can INSERT ideas (user_id = auth.uid())
  - [x] Create policy: users can UPDATE their own ideas
  - [x] Create policy: users can DELETE their own ideas
  - [x] Create policy: admins can SELECT all ideas
  - [x] Create policy: admins can UPDATE all ideas (for status changes)

- [x] Task 3: Create TypeScript types for ideas (AC: 7)
  - [x] Add IdeaStatus type to `src/types/database.ts`
  - [x] Add Idea type to `src/types/database.ts`
  - [x] Add CreateIdeaInput type
  - [x] Add UpdateIdeaInput type
  - [x] Export types from `src/types/index.ts`

- [x] Task 4: Create ideaService with CRUD operations (AC: 6, 8)
  - [x] Create `src/features/ideas/services/ideaService.ts`
  - [x] Implement `getIdeas()` - fetch all ideas for current user
  - [x] Implement `getIdeaById(id)` - fetch single idea by ID
  - [x] Implement `createIdea(data)` - create new idea
  - [x] Implement `updateIdea(id, data)` - update existing idea
  - [x] Implement `deleteIdea(id)` - delete idea
  - [x] Use ServiceResponse<T> pattern from authService
  - [x] Handle errors consistently with AppError type

- [x] Task 5: Create admin-specific idea service methods (AC: 4)
  - [x] Implement `getAllIdeas()` - admin fetch all ideas (uses RLS)
  - [x] Implement `getIdeasByStatus(status)` - filter by status
  - [x] Implement `updateIdeaStatus(id, status)` - admin status update

- [x] Task 6: Update feature barrel exports (AC: 6)
  - [x] Create `src/features/ideas/services/index.ts`
  - [x] Export ideaService from `src/features/ideas/index.ts`
  - [x] Export all idea types

- [x] Task 7: Test database migrations locally (AC: 1-5)
  - [x] Run migrations against local Supabase
  - [x] Verify table structure via Supabase Studio
  - [x] Test RLS policies with different user roles
  - [x] Verify status enum values
  - [x] Verify foreign key constraint works

- [x] Task 8: Test ideaService operations (AC: 6, 8)
  - [x] Create test file `src/features/ideas/services/ideaService.test.ts`
  - [x] Test createIdea creates with correct user_id
  - [x] Test getIdeas returns only user's ideas
  - [x] Test getIdeaById returns correct idea
  - [x] Test updateIdea updates correctly
  - [x] Test deleteIdea removes idea
  - [x] Test error handling for invalid inputs

## Dev Notes

### Architecture Patterns (MANDATORY)

**Feature Folder Structure:**
```
src/features/ideas/
├── components/          (Story 2.2-2.9)
│   ├── IdeaWizard/
│   ├── IdeaList.tsx
│   ├── IdeaCard.tsx
│   └── IdeaStatusBadge.tsx
├── hooks/               (Story 2.2-2.9)
│   ├── useIdeas.ts
│   ├── useCreateIdea.ts
│   └── useEnhanceIdea.ts
├── services/
│   └── ideaService.ts   (THIS STORY)
├── schemas/             (Story 2.2-2.9)
│   └── ideaSchemas.ts
├── types.ts             (THIS STORY)
└── index.ts             (THIS STORY)
```

### Database Schema (supabase/migrations/00003_create_ideas.sql)

```sql
-- Create idea status enum
CREATE TYPE idea_status AS ENUM (
  'submitted',
  'approved',
  'prd_development',
  'prototype_complete',
  'rejected'
);

-- Create ideas table
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  impact TEXT NOT NULL,
  enhanced_problem TEXT,
  enhanced_solution TEXT,
  enhanced_impact TEXT,
  status idea_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for user_id (common query pattern)
CREATE INDEX idx_ideas_user_id ON ideas(user_id);

-- Create index for status (admin filtering)
CREATE INDEX idx_ideas_status ON ideas(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### RLS Policies (supabase/migrations/00004_create_ideas_rls_policies.sql)

```sql
-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Users can view their own ideas
CREATE POLICY "Users can view own ideas"
  ON ideas
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own ideas
CREATE POLICY "Users can insert own ideas"
  ON ideas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ideas
CREATE POLICY "Users can update own ideas"
  ON ideas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own ideas
CREATE POLICY "Users can delete own ideas"
  ON ideas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all ideas
CREATE POLICY "Admins can view all ideas"
  ON ideas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update all ideas (for status changes)
CREATE POLICY "Admins can update all ideas"
  ON ideas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### TypeScript Types (src/types/database.ts)

```typescript
// Add to existing database.ts file

export type IdeaStatus = 
  | 'submitted'
  | 'approved'
  | 'prd_development'
  | 'prototype_complete'
  | 'rejected';

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  problem: string;
  solution: string;
  impact: string;
  enhanced_problem: string | null;
  enhanced_solution: string | null;
  enhanced_impact: string | null;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateIdeaInput {
  title: string;
  problem: string;
  solution: string;
  impact: string;
  enhanced_problem?: string;
  enhanced_solution?: string;
  enhanced_impact?: string;
}

export interface UpdateIdeaInput {
  title?: string;
  problem?: string;
  solution?: string;
  impact?: string;
  enhanced_problem?: string;
  enhanced_solution?: string;
  enhanced_impact?: string;
  status?: IdeaStatus;
}
```

### Idea Service Pattern (src/features/ideas/services/ideaService.ts)

```typescript
import { supabase } from '@/lib/supabase';
import type { Idea, CreateIdeaInput, UpdateIdeaInput, IdeaStatus } from '@/types/database';
import type { ServiceResponse, AppError } from '@/types';

export const ideaService = {
  /**
   * Get all ideas for the current user (RLS enforced)
   */
  async getIdeas(): Promise<ServiceResponse<Idea[]>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data ?? [], error: null };
    } catch (error) {
      console.error('getIdeas error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch ideas', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get a single idea by ID
   */
  async getIdeaById(id: string): Promise<ServiceResponse<Idea>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: { message: 'Idea not found', code: 'NOT_FOUND' },
          };
        }
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('getIdeaById error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch idea', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Create a new idea
   */
  async createIdea(input: CreateIdeaInput): Promise<ServiceResponse<Idea>> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'Not authenticated', code: 'AUTH_REQUIRED' },
        };
      }

      const { data, error } = await supabase
        .from('ideas')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('createIdea error:', error);
      return {
        data: null,
        error: { message: 'Failed to create idea', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Update an existing idea
   */
  async updateIdea(id: string, input: UpdateIdeaInput): Promise<ServiceResponse<Idea>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: { message: 'Idea not found or not authorized', code: 'NOT_FOUND' },
          };
        }
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('updateIdea error:', error);
      return {
        data: null,
        error: { message: 'Failed to update idea', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Delete an idea
   */
  async deleteIdea(id: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('deleteIdea error:', error);
      return {
        data: null,
        error: { message: 'Failed to delete idea', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  // ============ Admin Methods ============

  /**
   * Get all ideas (admin only - RLS allows based on role)
   */
  async getAllIdeas(): Promise<ServiceResponse<Idea[]>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data ?? [], error: null };
    } catch (error) {
      console.error('getAllIdeas error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch ideas', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Get ideas by status (admin filtering)
   */
  async getIdeasByStatus(status: IdeaStatus): Promise<ServiceResponse<Idea[]>> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: 'DB_ERROR' },
        };
      }

      return { data: data ?? [], error: null };
    } catch (error) {
      console.error('getIdeasByStatus error:', error);
      return {
        data: null,
        error: { message: 'Failed to fetch ideas', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  /**
   * Update idea status (admin action)
   */
  async updateIdeaStatus(id: string, status: IdeaStatus): Promise<ServiceResponse<Idea>> {
    return this.updateIdea(id, { status });
  },
};
```

### Feature Types (src/features/ideas/types.ts)

```typescript
// Re-export database types for feature-level access
export type { Idea, IdeaStatus, CreateIdeaInput, UpdateIdeaInput } from '@/types/database';

// Feature-specific types can be added here
export interface IdeaWithUser extends Idea {
  user?: {
    id: string;
    email: string;
  };
}
```

### Barrel Export (src/features/ideas/index.ts)

```typescript
// Services
export { ideaService } from './services/ideaService';

// Types
export type * from './types';
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Tables | `snake_case`, plural | `ideas` |
| Columns | `snake_case` | `user_id`, `created_at` |
| Enums | `snake_case` | `idea_status` |
| TypeScript Types | `PascalCase` | `Idea`, `IdeaStatus` |
| Service | `camelCase` | `ideaService` |
| Service Methods | `camelCase` | `getIdeas`, `createIdea` |

### Anti-Patterns to AVOID

1. **DO NOT** call Supabase directly from components - always use service layer
2. **DO NOT** hardcode user_id - always get from auth.uid() or supabase.auth.getUser()
3. **DO NOT** skip error handling - every database operation must handle errors
4. **DO NOT** forget RLS testing - verify policies work for both user and admin roles
5. **DO NOT** use string literals for status - use IdeaStatus type
6. **DO NOT** forget indexes - common query patterns need indexes
7. **DO NOT** mix snake_case/camelCase - database uses snake_case, TypeScript uses camelCase

### Previous Story Learnings Applied

From **Story 1.3** (Supabase Setup):
- Migration file naming: `00003_create_ideas.sql` (sequential numbering)
- RLS policies must be in separate migration or after table creation
- Users table foreign key pattern: `REFERENCES users(id) ON DELETE CASCADE`

From **Story 1.4/1.5** (Auth Service Patterns):
- Use `ServiceResponse<T>` type for all service methods
- Error handling with `AppError` type (`message`, `code`)
- Try/catch wrapping with console.error for debugging
- Consistent null checking on data responses

### Project Structure Notes

- Migration files go in `supabase/migrations/` with sequential numbering
- Service files go in `src/features/{feature}/services/`
- Types are defined in `src/types/database.ts` and re-exported through feature types
- Path alias `@/` maps to `src/` (verify in tsconfig.json)

### Testing Checklist

- [x] Migration runs successfully on local Supabase
- [x] Table structure matches schema (verify in Supabase Studio)
- [x] Status enum has all 5 values
- [x] Default status is 'submitted' when not specified
- [x] User can only see their own ideas (RLS test)
- [x] Admin can see all ideas (RLS test)
- [x] Foreign key constraint prevents orphan ideas
- [x] Indexes created on user_id and status columns
- [x] ideaService.createIdea sets correct user_id
- [x] ideaService.getIdeas returns only user's ideas
- [x] ideaService.updateIdea respects RLS
- [x] ideaService.deleteIdea respects RLS
- [x] Error handling works for invalid inputs

### Dependencies on Previous Stories

- **Story 1.1:** Project initialized with TypeScript, Supabase client
- **Story 1.3:** Supabase project configured, users table exists, RLS pattern established
- **Story 1.4:** ServiceResponse type pattern, authService patterns established

### Next Story Dependencies

- **Story 2.2-2.5 (Idea Wizard):** Will use ideaService.createIdea
- **Story 2.6 (AI Enhancement):** Will use ideaService.updateIdea for enhanced fields
- **Story 2.7 (Submit Idea):** Will use ideaService.createIdea
- **Story 2.8 (My Ideas List):** Will use ideaService.getIdeas
- **Story 2.9 (Idea Detail):** Will use ideaService.getIdeaById
- **Epic 5 (Admin):** Will use admin methods (getAllIdeas, getIdeasByStatus, updateIdeaStatus)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: _bmad-output/planning-artifacts/prd.md#Idea Submission & Management]
- [Source: _bmad-output/implementation-artifacts/1-3-set-up-supabase-project-and-database-schema.md]
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase PostgreSQL Triggers](https://supabase.com/docs/guides/database/functions#triggers)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

N/A - Implementation completed without issues.

### Completion Notes List

- Created database migration `00003_create_ideas.sql` with `idea_status` enum, `ideas` table with all required columns, foreign key to users, indexes on user_id and status, and updated_at trigger
- Created RLS policies migration `00004_create_ideas_rls_policies.sql` with policies for user CRUD on own ideas and admin SELECT/UPDATE on all ideas
- Added `IdeaStatus`, `Idea`, `IdeaInsert`, `IdeaUpdate`, `CreateIdeaInput`, `UpdateIdeaInput` types to `src/types/database.ts`
- Created shared `ServiceResponse<T>` and `AppError` types in `src/types/service.ts` for consistent service layer patterns
- Implemented `ideaService` with full CRUD operations: `getIdeas`, `getIdeaById`, `createIdea`, `updateIdea`, `deleteIdea`
- Added admin methods: `getAllIdeas`, `getIdeasByStatus`, `updateIdeaStatus`
- Created barrel exports in `src/features/ideas/services/index.ts` and updated `src/features/ideas/index.ts`
- Created comprehensive test suite in `ideaService.test.ts` with 18 passing tests covering all service methods and error scenarios
- All 217 tests pass (including 18 new ideaService tests)
- No new linter errors introduced

### File List

**New Files:**
- `supabase/migrations/00003_create_ideas.sql`
- `supabase/migrations/00004_create_ideas_rls_policies.sql`
- `src/types/service.ts`
- `src/features/ideas/services/ideaService.ts`
- `src/features/ideas/services/index.ts`
- `src/features/ideas/services/ideaService.test.ts`

**Modified Files:**
- `src/types/database.ts` - Added IdeaStatus, Idea types, Database interface updates
- `src/types/index.ts` - Added export for service types
- `src/features/ideas/types.ts` - Updated to re-export database types, added IdeaWithUser
- `src/features/ideas/index.ts` - Added service export

## Change Log

- 2026-01-18: Story implementation completed - Ideas database table, RLS policies, TypeScript types, and ideaService with full CRUD + admin methods
