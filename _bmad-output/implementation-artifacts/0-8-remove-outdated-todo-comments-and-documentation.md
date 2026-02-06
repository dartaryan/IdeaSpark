# Story 0.8: Remove Outdated TODO Comments & Documentation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want to **remove all outdated TODO comments, placeholder references, and debug console.log statements**,
So that **the codebase is clean, professional, and doesn't contain misleading comments or debug artifacts**.

## Acceptance Criteria

### AC1: ChatPanelPlaceholder References Removed

**Given** Story 3.2 (Chat Interface) and Story 3.4 (Gemini PRD Chat Edge Function) are complete
**When** I search the codebase for "ChatPanelPlaceholder"
**Then** no references exist (the real ChatInterface component is used)
**And** the ChatPanelPlaceholder.tsx file is deleted
**And** the export in PrdBuilder/index.ts is removed

### AC2: Outdated Story Reference Comments Removed

**Given** Stories 2.5, 2.6, 2.7 are verified complete
**When** I search for comments referencing these completed stories
**Then** all outdated story reference comments are removed or updated
**And** code comments accurately reflect the current implementation state

### AC3: TODO Comments Evaluated and Resolved

**Given** all code cleanup is complete
**When** Story 0.8 is finished
**Then** running a search for "TODO" returns zero results in active source code
**Or** any remaining TODOs are documented as intentional with a linked future story number
**And** implementation artifacts are updated to reflect completed work

### AC4: Debug Console.log Statements Removed

**Given** the codebase contains ~40+ console.log debug statements across production code
**When** Story 0.8 is complete
**Then** all debug console.log statements are removed from `src/` files
**And** legitimate server-side logging in `supabase/functions/` is preserved
**And** no functionality is broken by the removal

### AC5: "Coming Soon" Placeholder Messages Updated

**Given** features referenced by "Coming Soon" messages have been implemented
**When** Story 0.8 is complete
**Then** all "Coming Soon" messages are removed from implemented features
**And** the DashboardPage.tsx "Coming Soon" divider is removed or updated
**And** ChatPanelPlaceholder "coming soon" messages are gone (file deleted per AC1)

### AC6: Outdated Code Comments Cleaned Up

**Given** comments reference placeholder implementations that are now complete
**When** Story 0.8 is complete
**Then** the MetricsCards.tsx "placeholder metric cards" comment is updated
**And** all stale implementation artifact references are corrected

## Tasks / Subtasks

- [x] Task 1: Remove ChatPanelPlaceholder Component (AC: 1)
  - [x] 1.1 Verify ChatInterface.tsx exists and is the active chat component in PrdBuilder
  - [x] 1.2 Search all imports/usages of ChatPanelPlaceholder across the codebase
  - [x] 1.3 Delete `src/features/prd/components/PrdBuilder/ChatPanelPlaceholder.tsx`
  - [x] 1.4 Remove `export { ChatPanelPlaceholder } from './ChatPanelPlaceholder';` from `src/features/prd/components/PrdBuilder/index.ts`
  - [x] 1.5 Verify no component is importing ChatPanelPlaceholder — if any are, replace with ChatInterface
  - [x] 1.6 Verify PrdBuilder still compiles and renders correctly

- [x] Task 2: Remove Outdated Story Reference Comments (AC: 2)
  - [x] 2.1 In `src/features/ideas/hooks/useEnhanceIdea.ts` line 20: Remove/update comment "stub until Story 2.6 implements the Edge Function" — Story 2.5 (Edge Function) is complete
  - [x] 2.2 Search for any other "Story X.X" references in code comments and evaluate if outdated

- [x] Task 3: Evaluate and Resolve TODO Comments (AC: 3)
  - [x] 3.1 `src/pages/PrototypeViewerPage.tsx:172` — `ideaTitle="My Idea" // TODO: Fetch from idea`
    - **Decision:** Deferred — requires additional query not in current scope. Comment updated.
  - [x] 3.2 `src/features/admin/services/adminService.ts:281-282` — "TODO: Add activity logging" in approveIdea
    - **Decision:** Remove TODO, add comment "Activity logging deferred to future epic" (no activity_log table exists)
  - [x] 3.3 `src/features/admin/services/adminService.ts:616-618` — "TODO: Log rejection action" in rejectIdea
    - **Decision:** Remove TODO, add comment "Activity logging deferred to future epic" (no activity_log table exists)
  - [x] 3.4 `src/features/auth/components/UserMenu.tsx:59` — "TODO: Implement profile page navigation in Story 1.9"
    - **Decision:** Deferred — Story 1.9 not in current sprint scope. Comment updated.

- [x] Task 4: Remove Debug Console.log Statements from src/ (AC: 4)
  - [x] 4.1 `src/features/auth/hooks/useAuth.ts` — Remove 8 console.log statements (session check, auth state, user data debugging)
  - [x] 4.2 `src/components/layouts/AuthenticatedLayout.tsx` — Remove 4 console.log statements (loading, redirect, render debugging)
  - [x] 4.3 `src/pages/PrdViewPage.tsx` — Remove 3 console.log statements (render, data, PRD debugging)
  - [x] 4.4 `src/features/prd/components/GeneratePrototypeButton.tsx` — Remove 2 console.log statements
  - [x] 4.5 `src/features/prototypes/components/GeneratePrototypeButton.tsx` — Remove 8 console.log statements (render, navigation, timing debugging)
  - [x] 4.6 `src/features/prototypes/hooks/useGeneratePrototype.ts` — Remove 5 console.log statements
  - [x] 4.7 `src/services/openLovableService.ts` — Remove 4 console.log statements
  - [x] 4.8 `src/features/ideas/components/IdeaDetailActions.tsx` — Remove 2 console.log statements
  - [x] 4.9 `src/features/admin/hooks/useRealtimeIdeas.ts` — Remove 3 console.log statements
  - [x] 4.10 `src/services/geminiService.ts` — Remove 1 console.log statement (line 60)
  - [x] 4.11 `src/App.tsx` — Remove 2 console.log statements (Supabase connection logging)
  - [x] 4.12 **DO NOT** remove console.log from `supabase/functions/` (server-side logging is acceptable)
  - [x] 4.13 After all removals, run `npx vitest run` to verify no tests break
  - [x] 4.14 Search entire `src/` for remaining console.log — should be zero (excluding test files)

- [x] Task 5: Remove/Update "Coming Soon" Messages (AC: 5)
  - [x] 5.1 `src/pages/DashboardPage.tsx:56` — Remove "Coming Soon" divider and evaluate what was "coming soon" (likely PRD/Prototype features that are now implemented)
  - [x] 5.2 Verify the DashboardPage renders correctly after removing the divider

- [x] Task 6: Clean Up Outdated Code Comments (AC: 6)
  - [x] 6.1 `src/features/admin/components/analytics/MetricsCards.tsx:65` — Update "Implement 4 placeholder metric cards" comment (metrics are fully implemented)
  - [x] 6.2 Do a final sweep for any "placeholder", "stub", or "mock" comments that reference completed work

- [x] Task 7: Final Verification (AC: 1-6)
  - [x] 7.1 Run full search for "TODO" in `src/` — should be zero or documented deferrals only
  - [x] 7.2 Run full search for "ChatPanelPlaceholder" — should be zero
  - [x] 7.3 Run full search for "coming soon" (case insensitive) in `src/` — should be zero
  - [x] 7.4 Run full search for "console.log" in `src/` (excluding test files) — should be zero
  - [x] 7.5 Run `npx vitest run` — all existing passing tests should still pass
  - [x] 7.6 Run `npx tsc --noEmit` — TypeScript compilation should succeed
  - [x] 7.7 Verify application starts and runs: `npm run dev`

## Dev Notes

### CRITICAL: This is a Cleanup Story — Minimal Code Changes

This story involves **deletion and comment updates only**. Do NOT:
- Add new features or functionality
- Refactor existing code logic
- Change any component behavior
- Modify any API calls or data flows

The ONLY exceptions are:
1. If a TODO can be trivially resolved (e.g., fetching ideaTitle from existing data in scope)
2. Removing dead code (ChatPanelPlaceholder) that is no longer imported anywhere

### Complete Inventory of Items to Clean

**TODO Comments (4 total):**

| # | File | Line | Content | Resolution |
|---|------|------|---------|------------|
| 1 | `src/pages/PrototypeViewerPage.tsx` | 172 | `ideaTitle="My Idea" // TODO: Fetch from idea` | Evaluate if idea title is available in component scope. If yes, use it. If not, defer with comment. |
| 2 | `src/features/admin/services/adminService.ts` | 281-282 | `TODO: Add activity logging` (approveIdea) | Remove TODO. Add: `// Note: Activity logging deferred — no activity_log table exists` |
| 3 | `src/features/admin/services/adminService.ts` | 616-618 | `TODO: Log rejection action` (rejectIdea) | Remove TODO. Add: `// Note: Activity logging deferred — no activity_log table exists` |
| 4 | `src/features/auth/components/UserMenu.tsx` | 59 | `TODO: Implement profile page navigation in Story 1.9` | Remove TODO. Story 1.9 is not in current sprint scope. Add: `// Note: Profile page navigation not yet implemented` |

**ChatPanelPlaceholder (2 references):**

| # | File | Action |
|---|------|--------|
| 1 | `src/features/prd/components/PrdBuilder/ChatPanelPlaceholder.tsx` | DELETE entire file |
| 2 | `src/features/prd/components/PrdBuilder/index.ts` line 4 | Remove export line |

**"Coming Soon" Messages (3):**

| # | File | Line | Action |
|---|------|------|--------|
| 1 | `src/features/prd/components/PrdBuilder/ChatPanelPlaceholder.tsx` | 21 | Handled by deleting the file |
| 2 | `src/features/prd/components/PrdBuilder/ChatPanelPlaceholder.tsx` | 32 | Handled by deleting the file |
| 3 | `src/pages/DashboardPage.tsx` | 56 | Remove "Coming Soon" divider section |

**Outdated Story References (1):**

| # | File | Line | Content | Action |
|---|------|------|---------|--------|
| 1 | `src/features/ideas/hooks/useEnhanceIdea.ts` | 20 | "stub until Story 2.6 implements the Edge Function" | Update comment to reflect current state: "Calls geminiService.enhanceIdea() via Supabase Edge Function" |

**Debug Console.log Statements (~40+ in src/):**

| # | File | Count | Notes |
|---|------|-------|-------|
| 1 | `src/features/auth/hooks/useAuth.ts` | 8 | Session/auth state debugging |
| 2 | `src/components/layouts/AuthenticatedLayout.tsx` | 4 | Loading/redirect debugging |
| 3 | `src/pages/PrdViewPage.tsx` | 3 | Render/data debugging |
| 4 | `src/features/prd/components/GeneratePrototypeButton.tsx` | 2 | Navigation debugging |
| 5 | `src/features/prototypes/components/GeneratePrototypeButton.tsx` | 8 | Render/nav/timing debugging |
| 6 | `src/features/prototypes/hooks/useGeneratePrototype.ts` | 5 | Generate flow debugging |
| 7 | `src/services/openLovableService.ts` | 4 | Service call debugging |
| 8 | `src/features/ideas/components/IdeaDetailActions.tsx` | 2 | Navigate debugging |
| 9 | `src/features/admin/hooks/useRealtimeIdeas.ts` | 3 | Realtime subscription debugging |
| 10 | `src/services/geminiService.ts` | 1 | Auth debugging |
| 11 | `src/App.tsx` | 2 | Supabase connection logging |

**Outdated Code Comments (1):**

| # | File | Line | Content | Action |
|---|------|------|---------|--------|
| 1 | `src/features/admin/components/analytics/MetricsCards.tsx` | 65 | "Implement 4 placeholder metric cards" | Update to reflect implementation is complete |

### Project Structure Notes

- Feature-based folder organization: `src/features/{auth,ideas,prd,prototypes,admin}/`
- Co-located tests with components (PascalCase.test.tsx)
- Services in `src/services/` and feature-specific `services/` folders
- Supabase Edge Functions in `supabase/functions/` (server-side logging is OK to keep)
- Routes in `src/routes/index.tsx`

### Architecture Compliance

**Naming Conventions:**
- Component files: PascalCase.tsx
- Test files: PascalCase.test.tsx
- Service files: camelCase.ts

**Console.log Removal Strategy:**
- Remove ALL console.log from `src/` directory
- PRESERVE console.log in `supabase/functions/` (server-side logging is acceptable per architecture)
- PRESERVE console.log in test files (test debugging is acceptable)
- Do NOT replace with a logging library — that's a separate enhancement

**TypeScript:**
- After all changes, `npx tsc --noEmit` must pass
- No new type errors introduced

### Previous Story Intelligence (Story 0.7)

**Learnings Applied:**
- Test first approach: Run tests before AND after changes
- Story 0.7 noted 54 pre-existing test failures in unrelated modules — these are expected
- Commit pattern: "Complete Story 0.8: Remove Outdated TODO Comments & Documentation"
- Code review will follow using `code-review` workflow

**Patterns from Story 0.7:**
- `useNavigate` from 'react-router-dom' is the standard navigation pattern
- `onKeyDown` (not onKeyPress) for keyboard event handlers
- `aria-label` for accessibility on interactive elements

### Git Intelligence Summary

**Recent Commits (Last 5):**
1. `4d80153` - Complete Story 0.7: Create User Detail Pages and Fix Navigation Placeholders - Code Review Fixes
2. `d8081bb` - Complete Story 0.6: Implement Analytics Drill-Down Modals - Code Review Fixes
3. `cf47106` - Complete Story 0.5: Implement Analytics Chart Components - Code Review Fixes
4. `34c01d1` - Complete Story 0.4: Verify Idea Submission Database Integration - Code Review Fixes
5. `4cb6bd1` - Update sprint status and enhance project epics in sprint-status.yaml

**Relevant patterns:**
- All recent stories completed with code review fix pass
- Clean commit message format: "Complete Story X.Y: Description"
- Tests run before final commit

**Files recently modified (relevant context):**
- `RecentSubmissionsList.tsx` — Navigation fixed in Story 0.7
- `TopContributorsLeaderboard.tsx` — Navigation fixed in Story 0.7
- Both files had console.log removed in Story 0.7 scope — but others remain

### Potential Gotchas & Edge Cases

1. **ChatPanelPlaceholder may still be imported somewhere:** Search thoroughly before deleting. If any component uses it, replace the import with ChatInterface.

2. **Console.log in useAuth.ts:** These logs track critical auth flow. Removing them should NOT change auth behavior, but verify login/logout still works after removal.

3. **Console.log in AuthenticatedLayout.tsx:** The redirect logic (`console.log('REDIRECTING TO LOGIN!')`) is for debugging only. The actual redirect is `Navigate to="/login"` — removing the log won't affect behavior.

4. **DashboardPage "Coming Soon":** Verify what content comes after the divider. If removing the divider leaves orphaned content, clean that up too.

5. **Tests referencing console.log:** `TimeToDecisionCard.test.tsx` has a test `'should not have console.log placeholder'` — this test should still pass since we're REMOVING console.logs.

6. **Import cleanup:** After deleting files, check for broken imports that would cause TypeScript errors.

7. **Some TODOs may be intentional:** The activity logging TODOs reference a table that doesn't exist yet. These should be converted to informational comments, not silently deleted.

### Implementation Sequence

**Phase 1: Safe Deletions (Low Risk)**
1. Delete ChatPanelPlaceholder.tsx
2. Remove its export from index.ts
3. Run TypeScript check to catch broken imports

**Phase 2: Comment Updates (No Risk)**
4. Update/remove TODO comments
5. Update outdated story references
6. Update outdated code comments

**Phase 3: Console.log Removal (Medium Risk)**
7. Remove console.log from each file systematically
8. Run tests after each file or batch of files
9. Verify app still functions

**Phase 4: UI Cleanup (Low Risk)**
10. Remove "Coming Soon" from DashboardPage
11. Verify page renders correctly

**Phase 5: Verification**
12. Full search sweep for all target patterns
13. Full test suite run
14. TypeScript compilation check
15. Manual app verification

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 0.8]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Previous Story: _bmad-output/implementation-artifacts/0-7-create-user-detail-pages-and-fix-navigation-placeholders.md]
- [Sprint Status: _bmad-output/implementation-artifacts/sprint-status.yaml]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Cursor)

### Debug Log References

- TypeScript compilation: PASS (exit code 0)
- Test suite: 1499 passed, 54 failed (all 54 pre-existing from Story 0.7), 4 skipped
- Search verification: 0 TODO, 0 ChatPanelPlaceholder, 0 "coming soon", 0 console.log in src/ production code

### Completion Notes List

- ✅ Task 1: Deleted ChatPanelPlaceholder.tsx and removed export from PrdBuilder/index.ts. No other imports existed.
- ✅ Task 2: Updated outdated story reference in useEnhanceIdea.ts ("stub until Story 2.6" → "via Supabase Edge Function"). All other Story X.X references are accurate provenance comments.
- ✅ Task 3: Resolved all 4 TODOs — PrototypeViewerPage (deferred with note), adminService x2 (activity logging deferred), UserMenu (profile navigation deferred).
- ✅ Task 4: Removed ~42 console.log statements across 11 src/ files. Preserved console.error/console.warn for legitimate error handling. Server-side logging in supabase/functions/ untouched.
- ✅ Task 5: Removed "Coming Soon" divider and orphaned text from DashboardPage.tsx. UserMenu "Soon" badge retained (profile feature genuinely not implemented).
- ✅ Task 6: Updated MetricsCards.tsx placeholder comment. Swept for "placeholder"/"stub"/"mock" — no outdated references found.
- ✅ Task 7: All verification searches return zero hits. TypeScript compiles clean. Test suite shows same 54 pre-existing failures (no regressions).

### File List

**Deleted:**
- `src/features/prd/components/PrdBuilder/ChatPanelPlaceholder.tsx`

**Modified:**
- `src/features/prd/components/PrdBuilder/index.ts` — Removed ChatPanelPlaceholder export
- `src/features/ideas/hooks/useEnhanceIdea.ts` — Updated outdated story reference comment
- `src/pages/PrototypeViewerPage.tsx` — Replaced TODO with deferral note
- `src/features/admin/services/adminService.ts` — Replaced 2 TODO blocks with deferral notes
- `src/features/auth/components/UserMenu.tsx` — Replaced TODO with deferral note
- `src/features/auth/hooks/useAuth.ts` — Removed 8 console.log statements
- `src/components/layouts/AuthenticatedLayout.tsx` — Removed 4 console.log statements
- `src/pages/PrdViewPage.tsx` — Removed 3 console.log statements
- `src/features/prd/components/GeneratePrototypeButton.tsx` — Removed 2 console.log statements
- `src/features/prototypes/components/GeneratePrototypeButton.tsx` — Removed 8 console.log statements
- `src/features/prototypes/hooks/useGeneratePrototype.ts` — Removed 5 console.log statements
- `src/services/openLovableService.ts` — Removed 4 console.log statements
- `src/features/ideas/components/IdeaDetailActions.tsx` — Removed 2 console.log statements
- `src/features/admin/hooks/useRealtimeIdeas.ts` — Removed 3 console.log statements
- `src/services/geminiService.ts` — Removed 1 console.log statement
- `src/App.tsx` — Removed 2 console.log statements
- `src/pages/DashboardPage.tsx` — Removed "Coming Soon" divider and orphaned text
- `src/features/admin/components/analytics/MetricsCards.tsx` — Updated outdated placeholder comment; review fix: corrected misleading comment
- `src/features/admin/components/analytics/TopContributorsLeaderboard.tsx` — Review fix: removed "console.log" string from provenance comment
- `src/features/admin/components/analytics/RecentSubmissionsList.tsx` — Review fix: removed "console.log" string from provenance comment
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Status updates
- `_bmad-output/implementation-artifacts/0-8-remove-outdated-todo-comments-and-documentation.md` — Story file updates

## Senior Developer Review (AI)

**Reviewer:** Code Review Agent (Claude claude-4.6-opus)
**Date:** 2026-02-07
**Outcome:** Approved with fixes applied

### Review Summary

All 6 Acceptance Criteria verified against actual implementation. All 7 tasks marked [x] confirmed with evidence in git changes. Git changes match story File List exactly (0 discrepancies).

### Findings (4 total: 1 High, 1 Medium, 2 Low)

**All fixed automatically during review.**

1. **HIGH — MetricsCards.tsx:65 misleading comment** — Changed from "placeholder metric cards" to "real trend data" but 3/4 cards use hardcoded trends. Fixed: updated to "Metric cards configuration (Total Ideas uses computed trend; others are static)".

2. **MEDIUM — TopContributorsLeaderboard.tsx:3 and RecentSubmissionsList.tsx:3** — Provenance comments contained "console.log" string, creating noise in codebase searches. Fixed: replaced with "debug logging".

3. **LOW — UserMenu.tsx:53** — Comment said "placeholder for future". Fixed: updated to "not yet implemented".

4. **LOW — UserMenu.tsx:59** — Deferral note style inconsistent with other files. Fixed: normalized to "deferred — reason" pattern.

### Files Modified by Review

- `src/features/admin/components/analytics/MetricsCards.tsx` — Fixed misleading comment
- `src/features/admin/components/analytics/TopContributorsLeaderboard.tsx` — Removed "console.log" from comment
- `src/features/admin/components/analytics/RecentSubmissionsList.tsx` — Removed "console.log" from comment
- `src/features/auth/components/UserMenu.tsx` — Updated placeholder comment and deferral note style

## Change Log

- **2026-02-07**: Code review complete — 4 issues found and fixed (1 HIGH misleading comment, 1 MEDIUM string in comments, 2 LOW comment cleanup). Story status → done.
- **2026-02-06**: Complete Story 0.8 — Removed ChatPanelPlaceholder dead code, resolved all 4 TODO comments with deferral notes, removed ~42 console.log debug statements from 11 src/ files, removed "Coming Soon" UI from DashboardPage, updated outdated code comments. Zero new test regressions.
