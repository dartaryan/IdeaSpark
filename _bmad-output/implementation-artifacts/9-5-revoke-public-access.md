# Story 9.5: Revoke Public Access

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to **revoke public access to a shared prototype**,
So that **I can stop external viewing when needed**.

## Acceptance Criteria

1. **Given** I have shared a prototype publicly, **When** I navigate to sharing settings, **Then** I see a "Revoke Public Access" button.

2. **Given** I click "Revoke Public Access", **When** confirmed, **Then** the public link is invalidated **And** anyone trying to access it sees an "access revoked" message.

3. **Given** I want to re-enable public sharing after revocation, **When** I generate a new public link, **Then** a new token/URL is created (old revoked link stays dead).

## Tasks / Subtasks

- [x] Task 1: Add `revokePublicAccess` Service Method (AC: #2)
  - [x] 1.1 Add `revokePublicAccess(prototypeId: string)` to `prototypeService.ts` — sets `share_revoked = true` in DB, verifies ownership via `user_id = session.user.id`
  - [x] 1.2 Follow existing service pattern: `async revokePublicAccess(prototypeId: string): Promise<ServiceResponse<void>>` with try/catch, auth check, DB update
  - [x] 1.3 Return `{ data: undefined, error: null }` on success, appropriate error on failure
- [x] Task 2: Update `generateShareLink` for Re-sharing After Revocation (AC: #3)
  - [x] 2.1 Modify `generateShareLink` in `prototypeService.ts` to also set `share_revoked: false` in the update query (so re-sharing after revocation works)
  - [x] 2.2 Generate a new `share_id` using `crypto.randomUUID()` in the update query (so revoked links stay dead, new link gets a fresh token)
  - [x] 2.3 Reset `view_count: 0` and `shared_at: new Date().toISOString()` for the fresh share (existing behavior for `shared_at`, add `view_count` reset)
- [x] Task 3: Update `getShareStats` to Include `shareRevoked` (AC: #1)
  - [x] 3.1 Add `share_revoked` to the `select` query in `getShareStats()` — current select: `view_count, shared_at, is_public, expires_at`
  - [x] 3.2 Add `shareRevoked: data.share_revoked ?? false` to the response mapping
  - [x] 3.3 Update the return type signature to include `shareRevoked: boolean`
  - [x] 3.4 Update `ShareStats` interface in `useShareStats.ts` to add `shareRevoked: boolean`
- [x] Task 4: Create `useRevokePublicAccess` Hook (AC: #2)
  - [x] 4.1 Create `src/features/prototypes/hooks/useRevokePublicAccess.ts` — React Query `useMutation` hook following `useSetShareExpiration` pattern
  - [x] 4.2 `mutationFn` calls `prototypeService.revokePublicAccess(prototypeId)`
  - [x] 4.3 `onSuccess` invalidates: `shareStatsKeys.detail(prototypeId)`, `['shareUrl', prototypeId]`, `['passwordStatus', prototypeId]`
  - [x] 4.4 Export from hooks directory (add to barrel export if exists, or import directly)
- [x] Task 5: Add Revoke UI to ShareButton Modal (AC: #1, #2, #3)
  - [x] 5.1 Import `useRevokePublicAccess` hook and consume `shareStats.shareRevoked` state
  - [x] 5.2 Add "Revoke Public Access" section (Section 6) at the bottom of the modal, BEFORE the "Open in New Tab" link — bg-base-200 rounded-lg card style (matching password/expiration sections)
  - [x] 5.3 Show red "Revoke Public Access" button with shield/ban icon: `btn btn-error btn-sm w-full`
  - [x] 5.4 On click, show `window.confirm()` dialog: "Revoke public access? Anyone with the current link will no longer be able to view this prototype."
  - [x] 5.5 On confirm, call `revokeMutation.mutate({ prototypeId })` with `onSuccess` toast: "Public access revoked" and `onError` toast: "Failed to revoke access"
  - [x] 5.6 Show loading state during mutation: spinner + "Revoking..."
- [x] Task 6: Handle Revoked State in ShareButton Modal (AC: #1, #3)
  - [x] 6.1 When `shareStats?.shareRevoked === true`, show "Access Revoked" alert banner at top of modal: `alert alert-warning` with ban icon and message "Public access has been revoked. The share link is no longer active."
  - [x] 6.2 Hide the shareable link input, QR code, password, expiration, and "Open in New Tab" sections when revoked (these are useless while access is revoked)
  - [x] 6.3 Show a "Generate New Link" button: `btn btn-primary w-full` — calls existing `handleShare` flow which triggers `generateShareLink` (Task 2 ensures it generates a new token and clears revoked flag)
  - [x] 6.4 After generating new link, UI returns to normal sharing state (link, QR, password, expiration visible again)
  - [x] 6.5 Update stats section to show "Revoked" badge when `shareStats.shareRevoked === true`: `badge badge-error`
  - [x] 6.6 When prototype is NOT yet shared (`!existingShareUrl && !shareStats?.isPublic`), do NOT show the revoke section (nothing to revoke)
- [x] Task 7: Write Tests (AC: #1-#3)
  - [x] 7.1 `prototypeService.test.ts`: Test `revokePublicAccess` — success case (sets share_revoked), auth error case, DB error case
  - [x] 7.2 `prototypeService.test.ts`: Test updated `generateShareLink` — verify it sets `share_revoked: false` and generates new `share_id` and resets `view_count`
  - [x] 7.3 `prototypeService.test.ts`: Test updated `getShareStats` — verify it returns `shareRevoked` field
  - [x] 7.4 `useRevokePublicAccess.test.tsx`: Test hook success/error, query invalidation
  - [x] 7.5 `ShareButton.test.tsx`: Test revoke button visibility (shown only when shared and not revoked)
  - [x] 7.6 `ShareButton.test.tsx`: Test revoke confirmation dialog and mutation call
  - [x] 7.7 `ShareButton.test.tsx`: Test revoked state UI (warning banner, hidden sections, "Generate New Link" button)
  - [x] 7.8 `ShareButton.test.tsx`: Test re-sharing flow after revocation
  - [x] 7.9 Verify no regressions: existing password, expiration, and public viewer tests still pass

## Dev Notes

### What Already Exists (DO NOT Recreate)

**Database Infrastructure (from Migration 00022):**
- `share_revoked BOOLEAN DEFAULT FALSE` column on `prototypes` table — ALREADY EXISTS
- RLS policies blocking revoked prototypes — ALREADY EXISTS (checks `share_revoked = FALSE` in SELECT policies)
- Index on `share_revoked` — ALREADY EXISTS

**Link Status Detection (from Migration 00023):**
- `check_share_link_status(p_share_id)` SECURITY DEFINER function — ALREADY EXISTS
- Returns `'revoked'` when `share_revoked = TRUE` — ALREADY WORKS
- Called by `prototypeService.checkShareLinkStatus(shareId)` — ALREADY WORKS

**Public Viewer Revoked Handling (from Story 9.4):**
- `PublicPrototypeViewer.tsx` lines 117-150: Shows "Access Revoked" error page when `linkStatus === 'revoked'` — ALREADY EXISTS
- Error page includes ban icon, message "The owner has revoked public access to this prototype", and "Go to IdeaSpark" button — ALREADY EXISTS
- Flow: `getPublicPrototype` fails (RLS blocks revoked) → `checkShareLinkStatus` returns `'revoked'` → revoked UI shown — ALREADY WORKS

**Type System:**
- `Prototype.shareRevoked: boolean` (line 25 of `types.ts`) — ALREADY EXISTS
- `PrototypeRow.share_revoked: boolean` (line 49 of `types.ts`) — ALREADY EXISTS
- `mapPrototypeRow` maps `share_revoked` → `shareRevoked` (line 322 of `types.ts`) — ALREADY EXISTS

**Service Methods (in `prototypeService.ts`):**
- `generateShareLink(prototypeId)` — sets `is_public: true`, `shared_at`, selects `share_id` (line 346)
- `getShareStats(prototypeId)` — returns `viewCount, sharedAt, isPublic, expiresAt` (line 471) — MISSING `shareRevoked`
- `getShareUrl(prototypeId)` — returns existing share URL (line 530)
- `setSharePassword(prototypeId, password)` — sets/removes password (line 677)
- `setShareExpiration(prototypeId, expiresAt)` — sets/removes expiration (line 799)
- `checkShareLinkStatus(shareId)` — RPC for link status (line 848)

**Hooks:**
- `useSharePrototype` — generates share link (mutation)
- `useShareStats` — fetches share statistics (query) — `ShareStats` interface MISSING `shareRevoked`
- `useSetSharePassword` — sets password (mutation)
- `useSetShareExpiration` — sets expiration (mutation)

**ShareButton Component (679 lines):**
- Full modal with: shareable link + copy, QR code, password protection toggle, link expiration dropdown, stats display, "Open in New Tab" link
- No revoke button or revoked state handling — THIS IS WHAT WE BUILD

**CRITICAL: What does NOT exist yet (MUST be created):**
- `revokePublicAccess()` service method — MUST CREATE
- `useRevokePublicAccess` hook — MUST CREATE
- Revoke button UI in ShareButton modal — MUST CREATE
- Revoked state handling in ShareButton modal — MUST CREATE
- `shareRevoked` in `ShareStats` interface and `getShareStats` — MUST ADD
- Re-sharing after revocation (update to `generateShareLink`) — MUST MODIFY

### Architecture Compliance

- **Feature folder**: All new/modified files go in `src/features/prototypes/`
- **Naming**: PascalCase for components, camelCase for functions/hooks, snake_case for DB columns
- **Service pattern**: Use `ServiceResponse<T> = { data: T | null; error: Error | null }` wrapper
- **Error handling**: try/catch + auth check + DB error handling (same pattern as `setShareExpiration`)
- **Hook pattern**: `useMutation` from React Query with `queryClient.invalidateQueries` on success (follow `useSetShareExpiration` exactly)
- **Tests**: Co-located with source files
- **Import convention**: Barrel exports via `index.ts` files

### Library/Framework Requirements

**NO new libraries needed.** All functionality uses existing dependencies:

- **React Query** (`@tanstack/react-query`): `useMutation`, `useQueryClient`, `invalidateQueries`
- **DaisyUI 5.x**: `btn`, `alert`, `badge`, `modal`, `form-control` components
- **react-hot-toast**: Toast notifications for success/error feedback
- **Supabase**: DB update operations via `supabase.from('prototypes').update()`

### File Structure Requirements

**Files to CREATE:**
- `src/features/prototypes/hooks/useRevokePublicAccess.ts` — Mutation hook for revoking access
- `src/features/prototypes/hooks/useRevokePublicAccess.test.tsx` — Hook tests

**Files to MODIFY:**
- `src/features/prototypes/services/prototypeService.ts` — Add `revokePublicAccess()`, update `generateShareLink()` and `getShareStats()`
- `src/features/prototypes/services/prototypeService.test.ts` — Add tests for new/updated methods
- `src/features/prototypes/hooks/useShareStats.ts` — Add `shareRevoked: boolean` to `ShareStats` interface
- `src/features/prototypes/hooks/useShareStats.test.tsx` — Update tests for new field
- `src/features/prototypes/components/ShareButton.tsx` — Add revoke button, revoked state handling, re-share flow
- `src/features/prototypes/components/ShareButton.test.tsx` — Add revoke UI tests

**DO NOT CREATE:**
- New database migrations (`share_revoked` column already exists)
- New RLS policies (existing policies already block revoked prototypes)
- New npm dependencies (all functionality uses existing packages)
- New Edge Functions (revocation is a simple DB flag update, no server logic needed)
- New pages or routes (public viewer already handles revoked state)

### Testing Requirements

- **Framework**: Vitest + React Testing Library (already configured)
- **Mocking**: Mock `prototypeService` methods using `vi.mock()`. Mock `react-hot-toast` for toast assertions.
- **React Query**: Wrap test components in `QueryClientProvider` with fresh `QueryClient`
- **window.confirm**: Mock with `vi.spyOn(window, 'confirm')` — return `true` for confirm tests, `false` for cancel tests
- **Hook testing pattern**: Follow `useSetShareExpiration.test.tsx` pattern — test mutation call, success callback, error callback, query invalidation
- **ShareButton testing pattern**: Follow existing `ShareButton.test.tsx` — mock hooks, render component, interact with UI elements, assert DOM changes
- **Coverage expectations**:
  - `revokePublicAccess` service: success, auth error, DB error
  - `generateShareLink` update: verify `share_revoked: false` and new `share_id` in update payload
  - `getShareStats` update: verify `shareRevoked` field in response
  - `useRevokePublicAccess` hook: mutation success/error, query invalidation
  - ShareButton: revoke button visibility, confirmation dialog, mutation call, revoked state UI, re-share flow
  - No regressions on existing tests

### Implementation Notes

**Service Method Pattern (follow `setShareExpiration` exactly):**

```typescript
async revokePublicAccess(prototypeId: string): Promise<ServiceResponse<void>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };
    }

    const { error } = await supabase
      .from('prototypes')
      .update({ share_revoked: true })
      .eq('id', prototypeId)
      .eq('user_id', session.user.id); // Ensure ownership

    if (error) {
      console.error('Revoke public access error:', error);
      return { data: null, error: { message: 'Failed to revoke public access', code: 'DB_ERROR' } };
    }

    return { data: undefined, error: null };
  } catch (error) {
    console.error('Revoke public access error:', error);
    return { data: null, error: { message: 'Failed to revoke public access', code: 'UNKNOWN_ERROR' } };
  }
}
```

**generateShareLink Update (critical for AC #3):**

Current code (line 358-363):
```typescript
.update({
  is_public: true,
  shared_at: new Date().toISOString(),
})
```

Must become:
```typescript
.update({
  is_public: true,
  shared_at: new Date().toISOString(),
  share_revoked: false,
  share_id: crypto.randomUUID(),
  view_count: 0,
})
```

This ensures:
1. `share_revoked: false` — clears any previous revocation
2. `share_id: crypto.randomUUID()` — generates a NEW token (old revoked links stay dead)
3. `view_count: 0` — resets view count for the fresh link

**IMPORTANT**: The existing `generateShareLink` does NOT check if the prototype was previously revoked. After this update, calling `generateShareLink` will always work regardless of prior revoked state, which is the correct behavior for "Generate New Link".

**Hook Pattern (follow `useSetShareExpiration` exactly):**

```typescript
export function useRevokePublicAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ prototypeId }: { prototypeId: string }) => {
      const result = await prototypeService.revokePublicAccess(prototypeId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: shareStatsKeys.detail(variables.prototypeId) });
      queryClient.invalidateQueries({ queryKey: ['shareUrl', variables.prototypeId] });
      queryClient.invalidateQueries({ queryKey: ['passwordStatus', variables.prototypeId] });
    },
  });
}
```

**ShareButton UI Decision Flow:**

```
Is prototype shared (existingShareUrl OR shareStats?.isPublic)?
  → NO: Show normal "Share Publicly" button (no revoke option)
  → YES: Is shareStats?.shareRevoked === true?
    → YES (REVOKED STATE):
      - Show warning banner: "Public access has been revoked"
      - Hide: link input, QR code, password section, expiration section, "Open in New Tab"
      - Show: "Generate New Link" button (calls shareMutation → triggers updated generateShareLink)
      - Show: Stats with "Revoked" badge
    → NO (ACTIVE STATE):
      - Show all normal sections (link, QR, password, expiration, stats)
      - Show "Revoke Public Access" button (Section 6, before "Open in New Tab")
```

**Re-sharing Flow After Revocation:**
1. User sees "Generate New Link" button in revoked state
2. User clicks it → triggers `shareMutation.mutateAsync({ prototypeId, prdId })`
3. `useSharePrototype` hook calls `generateShareLink` (which now generates new `share_id` + resets `share_revoked`)
4. On success: `existingShareUrl` query invalidated → refetches → gets new URL
5. `shareStats` invalidated → refetches → `shareRevoked: false`
6. UI switches back to normal active sharing state

**CRITICAL**: For the re-share button to work, when `shareStats?.shareRevoked === true`, the `existingShareUrl` check should be effectively "null" (so the ShareButton treats it as a new share). Options:
- a) The `getShareUrl` method could return null for revoked prototypes → cleanest approach
- b) The UI checks `shareRevoked` before using `existingShareUrl`

**Recommended: Option (b)** — In the "Generate New Link" handler, force a new share by calling `shareMutation.mutateAsync()` directly, bypassing the `existingShareUrl` check. The existing `handleShare` function skips sharing if `existingShareUrl` is truthy, so we need a separate `handleRegenerate` function:

```typescript
const handleRegenerate = async () => {
  try {
    await shareMutation.mutateAsync({ prototypeId, prdId });
    showCopiedFeedback();
  } catch {
    // Error handled by mutation
  }
};
```

This calls `generateShareLink` directly regardless of existing URL state.

**Edge Cases to Handle:**
- Prototype not yet shared (no revoke button shown)
- Revoke while modal is open → UI updates reactively via query invalidation
- Double-click revoke → disabled button during mutation prevents this
- Revoke then close modal → re-opening modal shows revoked state (via shareStats query)
- Network error during revoke → error toast, no state change
- User cancels confirmation → no action taken

**Security Considerations:**
- `revokePublicAccess` checks `user_id = session.user.id` (ownership verification)
- Revocation is immediate — RLS blocks access as soon as `share_revoked = true`
- Old share_id is replaced by new one on re-share, so revoked links can NEVER be reactivated
- No sensitive data exposed in the revoke response

### Project Structure Notes

- Alignment with unified project structure: All changes in `src/features/prototypes/`
- New hook `useRevokePublicAccess.ts` in `hooks/` subfolder (same level as `useSetShareExpiration.ts`)
- Hook naming follows convention: `use` + `RevokePublicAccess` (verb + noun)
- Test files co-located: `useRevokePublicAccess.test.tsx` next to `useRevokePublicAccess.ts`
- Service method added to existing `prototypeService` object (not a new file)
- ShareButton changes are within existing component (no new component files for revoke UI)

### References

- [Source: `src/features/prototypes/components/ShareButton.tsx`] — Current share modal with link, QR, password, expiration, stats (679 lines). Revoke section must be added as Section 6.
- [Source: `src/features/prototypes/services/prototypeService.ts#generateShareLink`] — Current update query (lines 358-363) that needs `share_revoked: false`, `share_id: crypto.randomUUID()`, `view_count: 0` added.
- [Source: `src/features/prototypes/services/prototypeService.ts#getShareStats`] — Current select (line 484: `view_count, shared_at, is_public, expires_at`) missing `share_revoked`. Return mapping (lines 504-508) missing `shareRevoked`.
- [Source: `src/features/prototypes/services/prototypeService.ts#setShareExpiration`] — Pattern to follow for `revokePublicAccess` method (lines 799-841: auth check, DB update, error handling).
- [Source: `src/features/prototypes/hooks/useSetShareExpiration.ts`] — Pattern to follow for `useRevokePublicAccess` hook (33 lines: mutation + query invalidation).
- [Source: `src/features/prototypes/hooks/useShareStats.ts`] — `ShareStats` interface (lines 6-11) must add `shareRevoked: boolean`. `shareStatsKeys` (lines 13-16) used for invalidation.
- [Source: `src/features/prototypes/types.ts#Prototype`] — `shareRevoked: boolean` already exists (line 25).
- [Source: `src/features/prototypes/types.ts#PrototypeRow`] — `share_revoked: boolean` already exists (line 49).
- [Source: `src/features/prototypes/pages/PublicPrototypeViewer.tsx`] — Already handles revoked state (lines 117-150: "Access Revoked" error page). NO CHANGES NEEDED.
- [Source: `supabase/migrations/00022_add_prototype_sharing_enhancements.sql`] — `share_revoked` column, RLS policies, indexes. NO CHANGES NEEDED.
- [Source: `supabase/migrations/00023_add_check_share_link_status_function.sql`] — `check_share_link_status` handles revoked (lines 30-32). NO CHANGES NEEDED.
- [Source: `src/features/prototypes/components/index.ts`] — Barrel exports. No changes needed (ShareButton already exported).
- [Source: `_bmad-output/planning-artifacts/epics.md#Story 9.5`] — Original story requirements (lines 1931-1951).
- [Source: `_bmad-output/planning-artifacts/architecture.md`] — Service patterns, naming conventions, React Query patterns.

### Git Intelligence

Recent commits show consistent pattern for Epic 9:
- `7e63745` Complete Story 9.4: Public Prototype Viewer (No Authentication) - Code Review Fixes
- `1574c8c` Complete Story 9.3: Configurable Link Expiration - Code Review Fixes
- `b7ab622` Complete Story 9.2: Optional Password Protection - Code Review Fixes
- `f4c1787` Complete Story 9.1: Generate Public Shareable URL - Code Review Fixes

All stories follow: implement → code review → fixes. Each commit is atomic. Project is on `main` branch.

Stories 9.1-9.4 collectively built the complete sharing infrastructure. Story 9.5 is the FINAL story in Epic 9, completing the access control feature set by adding revocation capability. The heavy lifting (DB columns, RLS, public viewer) is already done — this story is primarily a UI + service method addition.

### Previous Story Context

**Story 9.4 (Public Prototype Viewer) learnings:**
- Sandpack rendering replaced iframe in public viewer — NO IMPACT on revoke (viewer already handles revoked state)
- `PublicSandpackPreview` component created — irrelevant to revoke feature
- Code review: view_count increment mock leaks in tests — be careful with mock cleanup in service tests
- Code review: import from barrel exports, not direct paths

**Story 9.3 (Configurable Link Expiration) learnings:**
- `check_share_link_status` RPC works well for status detection — already handles revoked
- DaisyUI `select`, `badge`, `alert` components work well for configuration UI — reuse for revoke section
- Code review caught: `expiresAt` leaking to unauthenticated viewers — don't leak `shareRevoked` to public either (not needed since RLS blocks access)
- Code review caught: `useEffect` without cleanup — not relevant here (no useEffect needed for revoke)

**Story 9.2 (Optional Password Protection) learnings:**
- `window.confirm()` pattern for destructive toggle actions works well (removing password) — reuse for revoke confirmation
- Toast notifications pattern: `toast.success('Password protection removed')` — reuse for "Public access revoked"
- Code review caught: `password_hash` sent to client — ensure revoke response doesn't leak sensitive data
- Service method pattern with ownership check (`eq('user_id', session.user.id)`) is consistent — follow same pattern

**Story 9.1 (Generate Public Shareable URL) learnings:**
- `generateShareLink` uses existing `share_id` (pre-generated by DB default) — we're changing this to generate a new one
- ShareButton modal structure: organized sections with `bg-base-200 rounded-lg` card pattern — follow for revoke section
- `shareUrlKeys` and `passwordStatusKeys` query key patterns in ShareButton — invalidate these in revoke hook
- Optimistic UI with skeleton loading — not needed for revoke (simple mutation)

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

No issues encountered during implementation. All tests passed on first run.

### Completion Notes List

- Task 1: Added `revokePublicAccess(prototypeId)` service method following `setShareExpiration` pattern — auth check, `update({ share_revoked: true })`, ownership via `user_id = session.user.id`
- Task 2: Updated `generateShareLink` update payload to include `share_revoked: false`, `share_id: crypto.randomUUID()`, `view_count: 0` — ensures revoked links stay dead on re-share and fresh token is generated
- Task 3: Added `share_revoked` to `getShareStats` select query and response mapping (`shareRevoked: data.share_revoked ?? false`); updated `ShareStats` interface with `shareRevoked: boolean`
- Task 4: Created `useRevokePublicAccess` mutation hook with query invalidation for shareStats, shareUrl, passwordStatus
- Task 5: Added revoke section (Section 6) to ShareButton modal with red button, confirmation dialog, loading state, success/error toasts
- Task 6: Implemented revoked state UI — warning banner, hidden sharing sections, "Generate New Link" button, "Revoked" badge in stats; `handleRegenerate` bypasses `existingShareUrl` check
- Task 7: 20+ new tests across service (4), hook (6), and ShareButton (10); updated 5 existing test mocks with `shareRevoked: false`; full suite: 156 files, 2215 passed, 0 failures

### Change Log

- 2026-02-07: Story 9.5 implementation complete — Revoke Public Access feature (all 7 tasks, all ACs met)
- 2026-02-07: Code review complete — 4 issues found and fixed (1 HIGH, 1 MEDIUM, 2 LOW): added missing `shareRevoked` test in useShareStats.test.tsx, strengthened generateShareLink UUID assertion, added afterEach spy cleanup in useRevokePublicAccess.test.tsx, added inline comment on handleRegenerate

### File List

**Created:**
- `src/features/prototypes/hooks/useRevokePublicAccess.ts`
- `src/features/prototypes/hooks/useRevokePublicAccess.test.tsx`

**Modified:**
- `src/features/prototypes/services/prototypeService.ts` — Added `revokePublicAccess()`, updated `generateShareLink()` and `getShareStats()`
- `src/features/prototypes/services/prototypeService.test.ts` — Added revokePublicAccess tests, updated generateShareLink/getShareStats tests, strengthened UUID assertion (review fix)
- `src/features/prototypes/hooks/useShareStats.ts` — Added `shareRevoked: boolean` to `ShareStats` interface
- `src/features/prototypes/hooks/useShareStats.test.tsx` — Added `shareRevoked`/`expiresAt` to mock data, added shareRevoked pass-through test (review fix)
- `src/features/prototypes/hooks/index.ts` — Added barrel export for `useRevokePublicAccess`
- `src/features/prototypes/components/ShareButton.tsx` — Added revoke button, revoked state handling, re-share flow, added inline comment on handleRegenerate (review fix)
- `src/features/prototypes/components/ShareButton.test.tsx` — Added 10 revoke UI tests, updated mock data with `shareRevoked`
