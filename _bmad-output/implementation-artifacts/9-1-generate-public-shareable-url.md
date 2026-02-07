# Story 9.1: Generate Public Shareable URL

Status: done

## Story

As a **user**,
I want to **generate a public URL for my prototype**,
So that **I can share it with stakeholders who don't have IdeaSpark accounts**.

## Acceptance Criteria

1. **Given** I am viewing my prototype, **When** I click "Share Publicly", **Then** a modal opens with sharing options **And** a unique public URL is generated (e.g., `/share/prototype/:shareId`).

2. **Given** the public URL is generated, **When** I copy it, **Then** I can share it with anyone **And** they can view the prototype without authentication.

3. **Given** I have previously shared a prototype, **When** I click "Share Publicly" again, **Then** the modal shows the existing share link (does not regenerate) **And** I see the current view count.

4. **Given** the share modal is open, **When** I view the sharing options, **Then** I see: copy link button, QR code for the share URL, and the current view count.

5. **Given** the share link generation fails, **When** an error occurs, **Then** I see a clear error message **And** can retry the operation.

## Tasks / Subtasks

- [x] Task 1: Enhance Share Modal UI (AC: #1, #3, #4)
  - [x] 1.1 Refactor `ShareButton.tsx` to show "Share Publicly" label per UX spec
  - [x] 1.2 Add QR code generation using `qrcode.react` library (UX spec requires QR for mobile sharing)
  - [x] 1.3 Display view count in share modal when prototype is already shared
  - [x] 1.4 Add "Open in New Tab" button to preview the public link
  - [x] 1.5 Improve modal layout: organized sections for link, QR code, and stats
- [x] Task 2: Enhance Share Service Layer (AC: #2, #3, #5)
  - [x] 2.1 Add `getShareStats(prototypeId)` method to `prototypeService.ts` returning `{ viewCount, sharedAt, isPublic }`
  - [x] 2.2 Add error handling improvements: specific error messages for network failures vs auth failures
  - [x] 2.3 Add optimistic UI update: show share URL immediately, sync in background
- [x] Task 3: Add Database Migration for Epic 9 Infrastructure (AC: #1)
  - [x] 3.1 Create migration `00022_add_prototype_sharing_enhancements.sql` adding columns: `password_hash TEXT`, `expires_at TIMESTAMPTZ`, `share_revoked BOOLEAN DEFAULT FALSE`
  - [x] 3.2 Update public RLS policy to also check `share_revoked = FALSE` and `(expires_at IS NULL OR expires_at > NOW())`
  - [x] 3.3 Add index on `expires_at` for efficient expired link cleanup
- [x] Task 4: Update Types and Hooks (AC: #1, #3, #4)
  - [x] 4.1 Add `passwordHash`, `expiresAt`, `shareRevoked` to `Prototype` and `PrototypeRow` interfaces
  - [x] 4.2 Update `mapPrototypeRow()` to include new fields
  - [x] 4.3 Create `useShareStats` hook to fetch share statistics (view count, shared date)
  - [x] 4.4 Update `useSharePrototype` hook to return share URL and stats
- [x] Task 5: Write Tests (AC: #1-#5)
  - [x] 5.1 Unit tests for enhanced `ShareButton` component (modal display, QR code, copy, view count)
  - [x] 5.2 Unit tests for `useShareStats` hook
  - [x] 5.3 Unit tests for `prototypeService.getShareStats()`
  - [x] 5.4 Update existing `ShareButton` and share-related tests for new UI structure

## Dev Notes

### What Already Exists (DO NOT Recreate)

The following sharing infrastructure was built in Story 4.7 and MUST be reused:

- **Database schema**: `prototypes` table has `share_id UUID`, `is_public BOOLEAN`, `shared_at TIMESTAMPTZ`, `view_count INTEGER` columns (migration `00010_add_prototype_sharing.sql`)
- **RLS policy**: `"Public prototypes are viewable by anyone"` on `prototypes` table for `SELECT` where `is_public = TRUE`
- **Service methods** in `src/features/prototypes/services/prototypeService.ts`:
  - `generateShareLink(prototypeId)` - generates share URL, sets `is_public = true`, returns URL format `${origin}/share/prototype/${share_id}`
  - `getPublicPrototype(shareId)` - fetches public prototype by share_id, increments view_count
  - `getShareUrl(prototypeId)` - gets existing share URL if already shared
- **Components**:
  - `src/features/prototypes/components/ShareButton.tsx` - current share button with basic modal
  - `src/features/prototypes/pages/PublicPrototypeViewer.tsx` - public viewer with device size selector
- **Hooks**:
  - `src/features/prototypes/hooks/useSharePrototype.ts` - mutation hook for generating share links
  - `src/features/prototypes/hooks/usePublicPrototype.ts` - query hook for fetching public prototypes
- **Route**: `/share/prototype/:shareId` renders `PublicPrototypeViewer` (public, no auth required) in `src/routes/index.tsx`

### Architecture Compliance

- **Feature folder**: All new/modified files go in `src/features/prototypes/`
- **Naming**: PascalCase for components, camelCase for functions/hooks, snake_case for DB columns
- **State management**: React Query for server state (share stats, share URL), Zustand NOT needed for this story
- **Service pattern**: Use `ServiceResponse<T> = { data: T | null; error: Error | null }` wrapper
- **Error handling**: try/catch + React Query retries + toast notifications
- **Tests**: Co-located with components (`ShareButton.test.tsx` next to `ShareButton.tsx`)

### Library/Framework Requirements

- **QR Code**: Install `qrcode.react` (latest) - lightweight React QR code component. Do NOT use `qrcode` (canvas-based, heavier). Usage:
  ```tsx
  import { QRCodeSVG } from 'qrcode.react';
  <QRCodeSVG value={shareUrl} size={150} />
  ```
- **Clipboard API**: Already used in `ShareButton.tsx` via `navigator.clipboard.writeText()` - continue using this pattern
- **DaisyUI components**: Use `modal`, `btn`, `join`, `input`, `badge`, `alert`, `stat` components - all already available in the project
- **No new UI library needed**: All UI built with existing DaisyUI + Tailwind CSS

### File Structure Requirements

**Files to MODIFY:**
- `src/features/prototypes/components/ShareButton.tsx` - enhance modal UI with QR code, view count, better layout
- `src/features/prototypes/types.ts` - add `passwordHash`, `expiresAt`, `shareRevoked` to types
- `src/features/prototypes/services/prototypeService.ts` - add `getShareStats()` method
- `src/features/prototypes/hooks/useSharePrototype.ts` - enhance to return stats

**Files to CREATE:**
- `src/features/prototypes/hooks/useShareStats.ts` - hook for share statistics
- `src/features/prototypes/hooks/useShareStats.test.tsx` - tests
- `supabase/migrations/00022_add_prototype_sharing_enhancements.sql` - new columns for Epic 9

**Files to UPDATE TESTS:**
- `src/features/prototypes/components/ShareButton.test.tsx` - update for new modal UI

### Testing Requirements

- **Framework**: Vitest + React Testing Library (already configured in project)
- **Mocking**: Mock `prototypeService` methods using `vi.mock()`
- **React Query**: Wrap test components in `QueryClientProvider` with a fresh `QueryClient`
- **Test patterns**: Follow existing test patterns in `src/features/prototypes/components/ShareButton.test.tsx`
- **Coverage expectations**:
  - ShareButton: modal rendering, QR code display, copy functionality, view count display, error states, loading states
  - useShareStats: successful fetch, error handling, loading states
  - prototypeService.getShareStats: success response, error response

### Migration Details

```sql
-- 00022_add_prototype_sharing_enhancements.sql
-- Epic 9 infrastructure: password protection, expiration, revocation

ALTER TABLE prototypes
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS share_revoked BOOLEAN DEFAULT FALSE;

-- Update public RLS policy to respect revocation and expiration
DROP POLICY IF EXISTS "Public prototypes are viewable by anyone" ON prototypes;
CREATE POLICY "Public prototypes are viewable by anyone"
ON prototypes
FOR SELECT
USING (
  is_public = TRUE
  AND share_revoked = FALSE
  AND (expires_at IS NULL OR expires_at > NOW())
  AND password_hash IS NULL
);

-- Separate policy for password-protected prototypes (Story 9.2 will add password check logic at app level)
CREATE POLICY "Password-protected public prototypes are viewable"
ON prototypes
FOR SELECT
USING (
  is_public = TRUE
  AND share_revoked = FALSE
  AND (expires_at IS NULL OR expires_at > NOW())
  AND password_hash IS NOT NULL
);

-- Index for efficient expired link queries
CREATE INDEX IF NOT EXISTS idx_prototypes_expires_at
ON prototypes(expires_at) WHERE expires_at IS NOT NULL;

-- Index for revoked share lookups
CREATE INDEX IF NOT EXISTS idx_prototypes_share_revoked
ON prototypes(share_revoked) WHERE share_revoked = TRUE;

COMMENT ON COLUMN prototypes.password_hash IS 'BCrypt hash of share password (null = no password required)';
COMMENT ON COLUMN prototypes.expires_at IS 'When the share link expires (null = never expires)';
COMMENT ON COLUMN prototypes.share_revoked IS 'Whether public access has been revoked';
```

### Key Implementation Notes

1. **DO NOT change the existing share URL format** - it's `/share/prototype/${shareId}` and is already in use
2. **The `share_id` UUID is auto-generated** by the database default (`gen_random_uuid()`), do not generate it client-side
3. **View count is incremented asynchronously** in `getPublicPrototype()` - this is intentional to not slow down page load
4. **The QR code should encode the full public URL** including protocol (e.g., `https://ideaspark.app/share/prototype/abc-123`)
5. **The share modal should be accessible via keyboard** - ensure proper focus management and Escape key handling (DaisyUI modal handles this)
6. **Optimistic updates**: When generating a share link, show a skeleton/placeholder URL immediately, then replace with actual URL when the mutation completes

### Project Structure Notes

- Alignment with unified project structure: All changes in `src/features/prototypes/` following feature-based organization
- New migration follows sequential numbering: `00022_*` (after `00021_create_prototype_states.sql`)
- Hook naming follows convention: `useShareStats` (use + camelCase)
- Service method follows convention: `getShareStats` (camelCase verb + noun)

### References

- [Source: `src/features/prototypes/components/ShareButton.tsx`] - Current share button implementation to enhance
- [Source: `src/features/prototypes/services/prototypeService.ts#generateShareLink`] - Existing share link generation (lines 340-388)
- [Source: `src/features/prototypes/services/prototypeService.ts#getPublicPrototype`] - Public prototype fetching (lines 397-444)
- [Source: `src/features/prototypes/services/prototypeService.ts#getShareUrl`] - Existing share URL retrieval (lines 452-497)
- [Source: `src/features/prototypes/types.ts`] - Prototype/PrototypeRow interfaces with share fields
- [Source: `src/features/prototypes/pages/PublicPrototypeViewer.tsx`] - Public viewer (DO NOT modify in this story)
- [Source: `supabase/migrations/00010_add_prototype_sharing.sql`] - Original sharing schema
- [Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns`] - Naming conventions, service patterns
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md`] - Share button UX: copy link, QR code, social sharing options
- [Source: `_bmad-output/planning-artifacts/epics.md#Story 9.1`] - Original story requirements

### Git Intelligence

Recent commits show a consistent pattern of implementing stories with code review fixes:
- Stories follow the pattern: implement core functionality → code review → fixes
- Each story commit is atomic and named: `Complete Story X.Y: [Title] - Code Review Fixes`
- The project is on the `main` branch with all previous stories merged
- Last completed work: Epic 8 (Prototype State Persistence) - Stories 8.1-8.3

### Previous Epic Context

Epic 8 (Prototype State Persistence) was the last completed epic. Key learnings:
- `prototype_states` table was created with JSONB for flexible state storage
- State capture/restore pattern established using `prototypeService.saveState()` / `getState()`
- RLS policies follow the same user-ownership pattern
- All migrations use `IF NOT EXISTS` guard for idempotency

Epic 7 (Code Editor) established:
- CodeMirror integration for code editing
- Sandpack for live preview
- Version management with `prototype_versions` or versioned prototype rows

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Cursor)

### Debug Log References

No debug issues encountered.

### Completion Notes List

- **Task 1**: Refactored `ShareButton.tsx` with enhanced modal UI: "Share Publicly" button label, QR code via `qrcode.react` (`QRCodeSVG`), view count + shared date stats section, "Open in New Tab" link, organized 3-section layout (link, QR, stats), optimistic loading skeleton, error state with Retry button.
- **Task 2**: Added `getShareStats(prototypeId)` to `prototypeService.ts` returning `{ viewCount, sharedAt, isPublic }`. Lightweight query selecting only `view_count, shared_at, is_public`. Handles PGRST116 (not found) gracefully. Error handling differentiates auth vs DB vs network errors.
- **Task 3**: Created `00022_add_prototype_sharing_enhancements.sql` with Epic 9 infrastructure: `password_hash`, `expires_at`, `share_revoked` columns. Updated RLS policy to check `share_revoked = FALSE` and expiration. Added separate password-protected policy. Created indexes on `expires_at` and `share_revoked`.
- **Task 4**: Added `passwordHash`, `expiresAt`, `shareRevoked` to `Prototype`/`PrototypeRow` interfaces. Updated `mapPrototypeRow()` with nullish coalescing defaults. Created `useShareStats` hook with React Query. Updated `useSharePrototype` to invalidate share stats on mutation success.
- **Task 5**: 13 tests for `ShareButton` (modal, QR code, copy, view count, stats, error/retry, Open in New Tab, loading). 6 tests for `useShareStats` hook (success, null, error, disabled, keys, loading). 6 tests for `getShareStats` service (success, not found, auth error, DB error, network error, null defaults). Updated existing tests for new "Share Publicly" label.
- All 147 test files pass (2050 tests), 0 regressions.

### Change Log

- 2026-02-07: Implemented Story 9.1 - Generate Public Shareable URL with enhanced modal UI, QR code, view count stats, service layer, migration, types, hooks, and comprehensive tests.
- 2026-02-07: Code Review (AI) - Fixed 4 MEDIUM issues: (M1) replaced direct useEffect service call with React Query useQuery for share URL caching/consistency, (M2) improved setCopied feedback to follow actual clipboard write success, (M3) added useRef-based timer cleanup for setTimeout to prevent memory leaks, (M4) added Retry button click end-to-end test. All 147 test files pass (2051 tests), 0 regressions.

### File List

**New files:**
- `src/features/prototypes/hooks/useShareStats.ts`
- `src/features/prototypes/hooks/useShareStats.test.tsx`
- `supabase/migrations/00022_add_prototype_sharing_enhancements.sql`

**Modified files:**
- `src/features/prototypes/components/ShareButton.tsx`
- `src/features/prototypes/components/ShareButton.test.tsx`
- `src/features/prototypes/services/prototypeService.ts`
- `src/features/prototypes/services/prototypeService.test.ts`
- `src/features/prototypes/hooks/useSharePrototype.ts`
- `src/features/prototypes/types.ts`
- `package.json` (added `qrcode.react` dependency)
- `package-lock.json`
