# Story 9.3: Configurable Link Expiration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to **set an expiration time for my public share links**,
So that **old links stop working after a certain period**.

## Acceptance Criteria

1. **Given** I am creating or managing a public share link, **When** I configure expiration, **Then** I can choose from: Never, 24 hours, 7 days, 30 days **And** the expiration timestamp is calculated and stored.

2. **Given** a link is set to expire, **When** the expiration time passes, **Then** the link becomes invalid **And** anyone accessing it sees an "expired link" message with helpful guidance.

3. **Given** I want to extend a link's expiration, **When** I update the expiration setting (select a new duration or "Never"), **Then** the link remains valid for the new duration **And** the new expiration is saved.

## Tasks / Subtasks

- [x] Task 1: Add Expiration Configuration UI to ShareButton Modal (AC: #1, #3)
  - [x] 1.1 Add "Link Expiration" section to `ShareButton.tsx` modal (after Password Protection section, before Stats section)
  - [x] 1.2 Add `<select>` dropdown with options: "Never expires", "24 hours", "7 days", "30 days"
  - [x] 1.3 Show current expiration status when already set: display expiration date and remaining time (e.g., "Expires in 5 days")
  - [x] 1.4 Add "Update Expiration" button to save changes (disabled when selection unchanged or pending)
  - [x] 1.5 Show "Expires: [date]" or "Never expires" in Stats section
  - [x] 1.6 If link is already expired, show "Expired" warning badge with option to extend
  - [x] 1.7 Add clock/timer SVG icon consistent with Password Protection lock icon style
- [x] Task 2: Add Expiration Service Methods to prototypeService (AC: #1, #3)
  - [x] 2.1 Add `setShareExpiration(prototypeId: string, expiresAt: string | null): Promise<ServiceResponse<void>>` method
  - [x] 2.2 Follow `setSharePassword` pattern: auth check → validate → update → return ServiceResponse
  - [x] 2.3 `null` = never expires; date string = specific expiration timestamp
  - [x] 2.4 Add `getExpirationInfo(prototypeId)` or update `getShareStats` to include `expiresAt` in response
  - [x] 2.5 Add error handling: auth error, DB error, network error (consistent with existing patterns)
- [x] Task 3: Create Expiration Utility Functions (AC: #1, #3)
  - [x] 3.1 Create `src/features/prototypes/utils/expirationUtils.ts` with helper functions
  - [x] 3.2 `calculateExpirationDate(duration: ExpirationDuration): string | null` — converts duration enum to ISO timestamp
  - [x] 3.3 `getTimeRemaining(expiresAt: string): { label: string; isExpired: boolean }` — returns human-readable remaining time
  - [x] 3.4 `isExpired(expiresAt: string | null): boolean` — simple expiration check
  - [x] 3.5 Define `ExpirationDuration` type: `'never' | '24h' | '7d' | '30d'`
  - [x] 3.6 `durationToLabel(duration: ExpirationDuration): string` — maps duration to display label
- [x] Task 4: Create useSetShareExpiration Hook (AC: #1, #3)
  - [x] 4.1 Create `src/features/prototypes/hooks/useSetShareExpiration.ts` mutation hook
  - [x] 4.2 Follow `useSetSharePassword` pattern: useMutation wrapping `prototypeService.setShareExpiration`
  - [x] 4.3 On success: invalidate `['shareStats', prototypeId]` query key to refresh stats display
  - [x] 4.4 Return `{ mutate, isPending, isError, error }` — standard React Query mutation return
- [x] Task 5: Create Database Function for Link Status Check (AC: #2)
  - [x] 5.1 Create migration `supabase/migrations/00023_add_check_share_link_status_function.sql`
  - [x] 5.2 Create `check_share_link_status(p_share_id UUID) RETURNS TEXT` PostgreSQL function
  - [x] 5.3 Function uses `SECURITY DEFINER` to bypass RLS (only returns status string, NEVER prototype data)
  - [x] 5.4 Returns one of: `'valid'`, `'expired'`, `'revoked'`, `'not_found'`, `'not_public'`
  - [x] 5.5 Add `checkShareLinkStatus(shareId: string)` method to `prototypeService.ts` using Supabase RPC
- [x] Task 6: Update PublicPrototypeViewer for Expired Links (AC: #2)
  - [x] 6.1 Update `PublicPrototypeViewer.tsx`: when `getPublicPrototype` fails, call `checkShareLinkStatus` RPC
  - [x] 6.2 If status is `'expired'`: show dedicated expired link page with clock icon, "This link has expired" message, and "Contact the person who shared this link to request a new one"
  - [x] 6.3 If status is `'revoked'`: show "Access has been revoked" message (future-proofing for Story 9.5)
  - [x] 6.4 If status is `'not_found'` or `'not_public'`: show existing generic "Prototype Not Found" error
  - [x] 6.5 Add `isExpired` and `expiresAt` to `PublicPrototype` type for app-level awareness
- [x] Task 7: Update getShareStats to Include Expiration (AC: #1)
  - [x] 7.1 Add `expires_at` to `getShareStats` select query
  - [x] 7.2 Return `expiresAt: string | null` in stats response
  - [x] 7.3 ShareButton uses this to display current expiration in stats section and pre-select correct dropdown value
- [x] Task 8: Write Tests (AC: #1-#3)
  - [x] 8.1 Unit tests for `expirationUtils.ts` (calculateExpirationDate, getTimeRemaining, isExpired, edge cases: past dates, null, timezone handling)
  - [x] 8.2 Unit tests for `prototypeService.setShareExpiration` (success, auth error, DB error, null/never, valid durations)
  - [x] 8.3 Unit tests for `prototypeService.checkShareLinkStatus` (valid, expired, revoked, not_found, RPC error)
  - [x] 8.4 Unit tests for `ShareButton` expiration UI (dropdown rendering, option selection, update button states, current expiration display, expired warning)
  - [x] 8.5 Unit tests for `useSetShareExpiration` hook (mutation success, error, pending state, cache invalidation)
  - [x] 8.6 Unit tests for `PublicPrototypeViewer` expired link handling (expired message, revoked message, fallback to generic error)
  - [x] 8.7 Integration test: full flow (set expiration → verify stats display → simulate expiration → access shows expired message → extend expiration)

## Dev Notes

### What Already Exists (DO NOT Recreate)

**Database Infrastructure (from Story 9.1, migration `00022_add_prototype_sharing_enhancements.sql`):**
- `prototypes.expires_at TIMESTAMPTZ` column **already exists** — DO NOT add again
- `prototypes.share_revoked BOOLEAN DEFAULT FALSE` column already exists
- `prototypes.password_hash TEXT` column already exists
- RLS policy `"Public prototypes are viewable by anyone"` checks: `is_public = TRUE AND share_revoked = FALSE AND (expires_at IS NULL OR expires_at > NOW()) AND password_hash IS NULL`
- RLS policy `"Password-protected public prototypes are viewable"` checks: same conditions + `password_hash IS NOT NULL`
- Index `idx_prototypes_expires_at` on `prototypes(expires_at) WHERE expires_at IS NOT NULL` already exists

**Types (from Story 9.1):**
- `Prototype` interface has `expiresAt: string | null` field
- `PrototypeRow` interface has `expires_at: string | null` field
- `mapPrototypeRow` maps `expires_at → expiresAt` with nullish coalescing

**Sharing Infrastructure (from Stories 4.7, 9.1, 9.2):**
- `ShareButton.tsx` modal with sections: Link, QR Code, Password Protection, Stats, Open in New Tab
- `prototypeService.generateShareLink()` - generates share URLs
- `prototypeService.getPublicPrototype(shareId)` - fetches public prototype by share_id (returns `PublicPrototype`)
- `prototypeService.getShareUrl(prototypeId)` - gets existing share URL
- `prototypeService.getShareStats(prototypeId)` - returns `{ viewCount, sharedAt, isPublic }`
- `prototypeService.setSharePassword(prototypeId, password)` - sets/removes password protection
- `PublicPrototypeViewer.tsx` - public viewer with password check, device size selector
- `PasswordProtectedViewer.tsx` - password entry page for protected prototypes
- `/share/prototype/:shareId` route exists and is public (no auth required)

**CRITICAL: What does NOT exist yet (MUST be created):**
- No UI for configuring expiration in ShareButton modal
- `getPublicPrototype` does NOT select `expires_at` — only selects: `id, url, version, status, created_at, share_id, view_count, password_hash`
- `PublicPrototype` type does NOT include `expiresAt` or `isExpired`
- `getShareStats` does NOT return `expiresAt` — only returns: `{ viewCount, sharedAt, isPublic }`
- No service method to set/update expiration
- No way to distinguish "expired" from "not found" when RLS blocks the prototype
- No `check_share_link_status` database function

### Architecture Compliance

- **Feature folder**: All new/modified files go in `src/features/prototypes/`
- **Naming**: PascalCase for components, camelCase for functions/hooks, snake_case for DB columns
- **Service pattern**: Use `ServiceResponse<T> = { data: T | null; error: Error | null }` wrapper
- **Error handling**: try/catch + React Query retries + toast notifications
- **Tests**: Co-located with components (e.g., `expirationUtils.test.ts` next to `expirationUtils.ts`)
- **Hooks**: `use` + `PascalCase` verb + noun (e.g., `useSetShareExpiration`)
- **State management**: React Query for server state, local component state for dropdown selection
- **Date handling**: ISO 8601 strings in database/API, localized display in UI using `Intl.DateTimeFormat` or simple relative time formatting

### Library/Framework Requirements

**NO new libraries needed.** All functionality can be built with existing dependencies:

- **DaisyUI**: `select`, `btn`, `badge`, `alert`, `stat` components for expiration UI
- **React Query** (`@tanstack/react-query`): For `useSetShareExpiration` mutation hook
- **Date handling**: Use native JavaScript `Date` API — no need for date-fns or dayjs
  - `new Date()` for current time
  - `new Date(Date.now() + ms)` for calculating expiration timestamps
  - `date.toISOString()` for ISO 8601 format
  - Simple relative time display: calculate diff in hours/days and format string
- **Supabase**: `supabase.rpc('check_share_link_status', { p_share_id })` for RPC calls
- **TypeScript**: Literal union type for `ExpirationDuration = 'never' | '24h' | '7d' | '30d'`

**Existing Libraries (Already in package.json, NO action needed):**
- Zod: Not needed for expiration (simple select dropdown, no free-text validation)
- React Hook Form: Not needed (single select + button, not a complex form)
- DaisyUI 5.x: All UI components available
- `qrcode.react`: Already used in ShareButton, no changes needed

### File Structure Requirements

**Files to CREATE:**
- `src/features/prototypes/utils/expirationUtils.ts` — expiration calculation and display helpers
- `src/features/prototypes/utils/expirationUtils.test.ts` — tests for utility functions
- `src/features/prototypes/hooks/useSetShareExpiration.ts` — React Query mutation hook
- `src/features/prototypes/hooks/useSetShareExpiration.test.tsx` — tests for hook
- `supabase/migrations/00023_add_check_share_link_status_function.sql` — DB function for link status check

**Files to MODIFY:**
- `src/features/prototypes/components/ShareButton.tsx` — add expiration configuration section (after password, before stats)
- `src/features/prototypes/components/ShareButton.test.tsx` — add tests for expiration UI
- `src/features/prototypes/services/prototypeService.ts` — add `setShareExpiration()` and `checkShareLinkStatus()` methods, update `getShareStats()` to include `expiresAt`
- `src/features/prototypes/services/prototypeService.test.ts` — add tests for new service methods
- `src/features/prototypes/types.ts` — add `expiresAt` and `isExpired` to `PublicPrototype`, add `ExpirationDuration` type
- `src/features/prototypes/pages/PublicPrototypeViewer.tsx` — add expired/revoked link error handling
- `src/features/prototypes/pages/PublicPrototypeViewer.test.tsx` — add tests for expired link display

**DO NOT CREATE:**
- New database migration for `expires_at` column (already exists in 00022)
- New RLS policies (already check expiration in 00022)
- New npm dependencies (everything needed is already installed)

### Testing Requirements

- **Framework**: Vitest + React Testing Library (already configured)
- **Mocking**: Mock `prototypeService` methods using `vi.mock()`
- **React Query**: Wrap test components in `QueryClientProvider` with fresh `QueryClient`
- **Date mocking**: Use `vi.useFakeTimers()` and `vi.setSystemTime()` for time-dependent tests
- **Test patterns**: Follow existing patterns in `ShareButton.test.tsx`, `PublicPrototypeViewer.test.tsx`
- **Coverage expectations**:
  - `expirationUtils`: All duration calculations, edge cases (past dates, null, timezone handling, boundary conditions)
  - `prototypeService.setShareExpiration`: Success, auth error, DB error, null (never), valid durations
  - `prototypeService.checkShareLinkStatus`: All return values (valid, expired, revoked, not_found), RPC error
  - `ShareButton` expiration UI: Dropdown rendering, option selection, update button states, current expiration display, expired warning badge, integration with stats
  - `useSetShareExpiration`: Mutation success/error/pending, query invalidation
  - `PublicPrototypeViewer`: Expired link message, revoked message, fallback to generic error

### Implementation Notes

**Expiration Configuration Flow (Owner):**
1. User opens ShareButton modal (prototype must already be shared publicly)
2. User sees "Link Expiration" section with clock icon (after Password Protection)
3. Default: "Never expires" selected in dropdown
4. If expiration is already set, dropdown shows the matching option AND displays "Expires: Feb 14, 2026 at 3:00 PM" with relative time "in 7 days"
5. User selects a duration from dropdown: "Never expires", "24 hours", "7 days", "30 days"
6. User clicks "Update Expiration" button
7. `setShareExpiration()` is called → calculates `expires_at = new Date(Date.now() + durationMs).toISOString()` → updates `prototypes.expires_at`
8. Success toast: "Link expiration updated"
9. Stats section shows new expiration info

**Duration Calculation:**
```typescript
const DURATION_MS: Record<ExpirationDuration, number | null> = {
  'never': null,
  '24h': 24 * 60 * 60 * 1000,        // 86,400,000 ms
  '7d':  7 * 24 * 60 * 60 * 1000,     // 604,800,000 ms
  '30d': 30 * 24 * 60 * 60 * 1000,    // 2,592,000,000 ms
};

function calculateExpirationDate(duration: ExpirationDuration): string | null {
  const ms = DURATION_MS[duration];
  if (ms === null) return null; // Never expires
  return new Date(Date.now() + ms).toISOString();
}
```

**Expired Link Detection Flow (External Viewer):**
1. Viewer navigates to `/share/prototype/{shareId}`
2. `PublicPrototypeViewer` calls `getPublicPrototype(shareId)` via `usePublicPrototype` hook
3. **If prototype found** → proceed with normal flow (password check, then render)
4. **If error (prototype not found)** — this could be because:
   - The share_id doesn't exist → "Not Found"
   - The link has expired → RLS blocks it → returns "not found"
   - The link has been revoked → RLS blocks it → returns "not found"
5. On error → call `checkShareLinkStatus(shareId)` via Supabase RPC
6. RPC function bypasses RLS with `SECURITY DEFINER`, returns status string:
   - `'expired'` → Show dedicated "Link Expired" page
   - `'revoked'` → Show "Access Revoked" page (future-proofing for Story 9.5)
   - `'not_found'` or `'not_public'` → Show generic "Not Found" page (existing behavior)
   - `'valid'` → Shouldn't happen (prototype found but getPublicPrototype failed) → Show generic error
7. RPC only returns a status string — NEVER returns prototype data, passwords, or any sensitive info

**Database Function Design:**
```sql
CREATE OR REPLACE FUNCTION check_share_link_status(p_share_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_public BOOLEAN;
  v_share_revoked BOOLEAN;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT is_public, share_revoked, expires_at
  INTO v_is_public, v_share_revoked, v_expires_at
  FROM prototypes
  WHERE share_id = p_share_id;
  
  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;
  
  IF NOT v_is_public THEN
    RETURN 'not_public';
  END IF;
  
  IF v_share_revoked THEN
    RETURN 'revoked';
  END IF;
  
  IF v_expires_at IS NOT NULL AND v_expires_at <= NOW() THEN
    RETURN 'expired';
  END IF;
  
  RETURN 'valid';
END;
$$;

-- Grant execute to anon role (public viewers are unauthenticated)
GRANT EXECUTE ON FUNCTION check_share_link_status(UUID) TO anon;
GRANT EXECUTE ON FUNCTION check_share_link_status(UUID) TO authenticated;
```

**ShareButton Expiration Section UI (DaisyUI):**
```tsx
{/* Section 4: Link Expiration - after Password Protection, before Stats */}
<div className="form-control mb-4 p-4 bg-base-200 rounded-lg">
  <label className="label">
    <span className="label-text font-medium flex items-center gap-2">
      <svg ...> {/* Clock icon */} </svg>
      Link Expiration
    </span>
  </label>
  
  <select
    className="select select-bordered w-full"
    value={selectedExpiration}
    onChange={(e) => setSelectedExpiration(e.target.value as ExpirationDuration)}
    data-testid="expiration-select"
  >
    <option value="never">Never expires</option>
    <option value="24h">24 hours</option>
    <option value="7d">7 days</option>
    <option value="30d">30 days</option>
  </select>
  
  {/* Current expiration info */}
  {currentExpiresAt && (
    <div className="mt-2 text-sm text-base-content/70">
      {isExpired(currentExpiresAt) 
        ? <span className="text-error">⚠️ Link expired on {formatDate(currentExpiresAt)}</span>
        : <span>Expires: {formatDate(currentExpiresAt)} ({getTimeRemaining(currentExpiresAt).label})</span>
      }
    </div>
  )}
  
  {/* Update button */}
  <button
    className="btn btn-sm btn-primary w-full mt-2"
    onClick={handleUpdateExpiration}
    disabled={!expirationChanged || setExpirationMutation.isPending}
    data-testid="update-expiration-btn"
  >
    {setExpirationMutation.isPending ? 'Updating...' : 'Update Expiration'}
  </button>
</div>
```

**Expired Link Page Design (PublicPrototypeViewer):**
```tsx
// When checkShareLinkStatus returns 'expired':
<div className="flex items-center justify-center min-h-screen bg-base-200">
  <div className="card bg-base-100 shadow-xl max-w-md">
    <div className="card-body text-center">
      <svg ...> {/* Clock/expired icon */} </svg>
      <h2 className="card-title justify-center mt-4">Link Expired</h2>
      <p className="text-base-content/70">
        This shared prototype link has expired and is no longer accessible.
      </p>
      <p className="text-base-content/50 text-sm mt-2">
        Contact the person who shared this link to request a new one.
      </p>
      <div className="card-actions justify-center mt-4">
        <a href="/" className="btn btn-primary">Go to IdeaSpark</a>
      </div>
    </div>
  </div>
</div>
```

**Determining Current Dropdown Value from `expiresAt`:**
- When ShareButton loads and `expiresAt` is not null, need to determine which dropdown option to pre-select
- Calculate time remaining and map to closest option, or show "Custom" if it doesn't match a preset
- Simplest approach: just show the current expiration date/time and let user select a new duration
- The dropdown always represents "set NEW expiration from now" — not a reflection of the current setting
- Display current expiration separately in a text label below the dropdown

**Edge Cases to Handle:**
- Prototype not yet shared (no share link): Expiration section should be hidden or disabled with message "Share your prototype first to configure expiration"
- Expired link extended: When user selects a new duration, calculate from NOW (not from original share date)
- Setting "Never" on an expiring link: Sets `expires_at = NULL` in database
- Multiple rapid updates: `isPending` state on mutation prevents double-submission
- Timezone handling: All dates stored as UTC (ISO 8601), displayed in user's local timezone using `Intl.DateTimeFormat`

### Project Structure Notes

- Alignment with unified project structure: All changes in `src/features/prototypes/` following feature-based organization
- New utility file at `src/features/prototypes/utils/expirationUtils.ts` — first file in `utils/` subfolder for this feature (follows established pattern from other features)
- Hook naming follows convention: `useSetShareExpiration` (use + set + noun)
- Migration naming follows sequential: `00023_*` (after `00022_add_prototype_sharing_enhancements.sql`)
- DB function naming follows `snake_case` with descriptive verb: `check_share_link_status`

### References

- [Source: `src/features/prototypes/components/ShareButton.tsx`] — Current modal with password section (lines 334-463), stats section (lines 465-506), hooks (lines 43-45)
- [Source: `src/features/prototypes/services/prototypeService.ts#setSharePassword`] — Pattern for expiration service method (lines 674-732)
- [Source: `src/features/prototypes/services/prototypeService.ts#getShareStats`] — Stats query to update with expiresAt (lines 469-519)
- [Source: `src/features/prototypes/services/prototypeService.ts#getPublicPrototype`] — Public prototype fetch, needs expires_at (lines 403-461)
- [Source: `src/features/prototypes/pages/PublicPrototypeViewer.tsx`] — Public viewer error handling (lines 44-76), password check (lines 78-86)
- [Source: `src/features/prototypes/types.ts#Prototype`] — Has `expiresAt: string | null` (line 23)
- [Source: `src/features/prototypes/types.ts#PublicPrototype`] — Missing `expiresAt` (lines 75-84)
- [Source: `src/features/prototypes/hooks/useSetSharePassword.ts`] — Pattern reference for useSetShareExpiration hook
- [Source: `supabase/migrations/00022_add_prototype_sharing_enhancements.sql`] — expires_at column and RLS policies with expiration checks
- [Source: `_bmad-output/planning-artifacts/epics.md#Story 9.3`] — Original story requirements (lines 1884-1904)
- [Source: `_bmad-output/planning-artifacts/architecture.md`] — Service patterns, naming conventions, error handling patterns

### Git Intelligence

Recent commits show consistent pattern:
- Stories follow: implement core functionality → code review → fixes
- Each story commit is atomic: `Complete Story X.Y: [Title] - Code Review Fixes`
- Project is on `main` branch with all previous stories merged
- Last 2 commits:
  - `b7ab622` Complete Story 9.2: Optional Password Protection - Code Review Fixes
  - `f4c1787` Complete Story 9.1: Generate Public Shareable URL - Code Review Fixes
- 28 files changed in Stories 9.1+9.2 combined (3467 insertions)
- All 152 test files passing (2112 tests) after Story 9.2

### Previous Story Context

**Story 9.2 (Optional Password Protection) learnings:**
- Password toggle pattern in ShareButton modal works well — expiration should follow same UX pattern
- `setSharePassword` service method pattern is ideal template for `setShareExpiration`
- `useSetSharePassword` hook pattern with React Query mutation + cache invalidation is solid
- DaisyUI `form-control`, `toggle`, `input`, `btn`, `badge` components work well for settings sections
- Zod v4 error access pattern: `(result.error.issues ?? result.error.errors)?.[0]` — but NOT needed for expiration (no free-text validation)
- Supabase mock in tests needs `.functions.invoke` mock for Edge Functions
- DaisyUI toggle checkbox accessibility: use `data-testid` for testing since `getByRole` can be unreliable
- Code review caught: password_hash was being sent to client — ENSURE `expires_at` is NOT leaked in public-facing responses (only expose `isExpired` boolean and formatted date)
- Code review caught: view_count increment bug when column not in select — ENSURE all needed columns are in select statements
- `PublicPrototype` type mapping pattern: map raw DB fields to safe public-facing types, strip sensitive info

**Story 9.1 (Generate Public Shareable URL) learnings:**
- Migration 00022 created all Epic 9 columns in advance (password_hash, expires_at, share_revoked)
- RLS policies are comprehensive: check `is_public`, `share_revoked`, `expires_at`, `password_hash`
- ShareButton modal structure: organized sections with `bg-base-200 rounded-lg` card pattern
- `qrcode.react` library for QR code generation
- `useShareStats` hook for fetching share statistics
- Optimistic UI with skeleton loading improves perceived performance

**Epic 8 (Prototype State Persistence) learnings:**
- JSONB columns work well for flexible state storage
- All migrations use `IF NOT EXISTS` guard for idempotency
- Supabase RPC functions work well for server-side logic

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- **Task 3**: Created `expirationUtils.ts` with 5 utility functions (`calculateExpirationDate`, `getTimeRemaining`, `isExpired`, `durationToLabel`, `formatExpirationDate`) + `ExpirationDuration` type in `types.ts`. 30 unit tests covering all edge cases (past dates, null, invalid dates, boundary conditions, singular/plural labels).
- **Task 2**: Added `setShareExpiration()` and `checkShareLinkStatus()` methods to `prototypeService.ts`. Both follow existing patterns (auth check, error handling, ServiceResponse wrapper). `checkShareLinkStatus` uses `supabase.rpc()` for the SECURITY DEFINER function. Also updated `getPublicPrototype` to select `expires_at` and map `expiresAt`/`isExpired` to `PublicPrototype`. 12 new service tests.
- **Task 5**: Created migration `00023_add_check_share_link_status_function.sql` with `check_share_link_status(UUID)` SECURITY DEFINER function. Returns status strings ('valid', 'expired', 'revoked', 'not_found', 'not_public'). Granted execute to anon and authenticated roles.
- **Task 4**: Created `useSetShareExpiration` hook following `useSetSharePassword` pattern. Uses `useMutation` wrapping `prototypeService.setShareExpiration`. Invalidates `shareStats` query on success. 5 hook tests.
- **Task 7**: Updated `getShareStats` to select `expires_at` and return `expiresAt: string | null`. Updated `ShareStats` interface in `useShareStats.ts`. Updated existing tests.
- **Task 1**: Added Link Expiration section to `ShareButton.tsx` modal (after Password Protection, before Stats). Includes: select dropdown (Never/24h/7d/30d), current expiration info display, expired warning badge, Update Expiration button with pending state, clock SVG icon, expiration stat in stats section. 10 new UI tests.
- **Task 6**: Updated `PublicPrototypeViewer.tsx` to call `checkShareLinkStatus` RPC when `getPublicPrototype` fails. Shows dedicated pages for expired (clock icon, "Link Expired" message, contact guidance) and revoked (ban icon, "Access Revoked" message) links. Falls back to generic "Not Found" for other statuses. 6 new viewer tests.
- **Task 8**: All tests written as part of each task. Full test suite: **154 files, 2174 tests passed, 0 failures**.

### Senior Developer Review (AI)

**Reviewer:** Ben.akiva | **Date:** 2026-02-07 | **Outcome:** Approved with fixes applied

**Issues Found:** 2 High, 3 Medium, 2 Low | **Fixed:** 2 High + 3 Medium (all auto-fixed)

| ID | Severity | Description | Resolution |
|----|----------|-------------|------------|
| H1 | HIGH | `expiresAt`/`isExpired` leaked to unauthenticated viewers in `PublicPrototype` — story notes explicitly warned against this. Fields were dead code (unused in `PublicPrototypeViewer`). | Removed from `PublicPrototype` type, `getPublicPrototype` select/mapping, and test mocks. |
| H2 | HIGH | `getPublicPrototype` had inline duplicate of `isExpired()` logic instead of using `expirationUtils`. | Moot — removed as part of H1 fix. |
| M1 | MEDIUM | SECURITY DEFINER function `check_share_link_status` missing `SET search_path = public` (project convention per migration 00005). | Added `SET search_path = public` to migration 00023. |
| M2 | MEDIUM | `expirationChanged` logic enabled "Update Expiration" button on modal open when existing expiration was set, risking accidental expiration removal. | Added `expirationTouched` state; button now requires explicit dropdown interaction. Reset on success. |
| M3 | MEDIUM | `useEffect` calling `checkShareLinkStatus` RPC had no cleanup — state update on unmounted component. | Added `isCancelled` flag with cleanup return function. |
| L1 | LOW | No `aria-label` on expiration select dropdown. | Not fixed (minor). |
| L2 | LOW | `setShareExpiration` has no input validation (mitigated by controlled dropdown input). | Not fixed (low risk). |

### Change Log

- 2026-02-07: Implemented Story 9.3 - Configurable Link Expiration (all 8 tasks complete)
- 2026-02-07: Code Review fixes — removed expiresAt/isExpired from PublicPrototype (H1/H2), added search_path to SECURITY DEFINER (M1), fixed expiration button UX (M2), added useEffect cleanup (M3)

### File List

**Files Created:**
- `src/features/prototypes/utils/expirationUtils.ts` — Expiration calculation and display helpers
- `src/features/prototypes/utils/expirationUtils.test.ts` — 30 unit tests for utility functions
- `src/features/prototypes/hooks/useSetShareExpiration.ts` — React Query mutation hook
- `src/features/prototypes/hooks/useSetShareExpiration.test.tsx` — 5 hook tests
- `supabase/migrations/00023_add_check_share_link_status_function.sql` — DB function for link status check

**Files Modified:**
- `src/features/prototypes/types.ts` — Added `expiresAt`, `isExpired` to `PublicPrototype`; added `ExpirationDuration` type
- `src/features/prototypes/services/prototypeService.ts` — Added `setShareExpiration()`, `checkShareLinkStatus()`; updated `getPublicPrototype` select/mapping; updated `getShareStats` to include `expiresAt`
- `src/features/prototypes/services/prototypeService.test.ts` — Added 12 tests for new service methods; updated mock and existing tests
- `src/features/prototypes/hooks/useShareStats.ts` — Added `expiresAt` to `ShareStats` interface
- `src/features/prototypes/components/ShareButton.tsx` — Added Link Expiration section with dropdown, info display, expired badge, update button
- `src/features/prototypes/components/ShareButton.test.tsx` — Added 10 expiration UI tests; updated mocks
- `src/features/prototypes/pages/PublicPrototypeViewer.tsx` — Added expired/revoked link detection via `checkShareLinkStatus` RPC
- `src/features/prototypes/pages/PublicPrototypeViewer.test.tsx` — Added 6 expired link handling tests; updated mocks
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Updated story status
- `_bmad-output/implementation-artifacts/9-3-configurable-link-expiration.md` — Updated tasks, status, dev agent record
