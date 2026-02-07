# Story 8.2: Save Prototype State to Database

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to **have my prototype interaction state automatically saved to the database**,
So that **I don't lose my place when I close the browser and can resume where I left off**.

## Acceptance Criteria

1. **Given** I am interacting with a prototype in edit mode, **When** the captured state changes (via useSandpackStateBridge), **Then** it is saved to Supabase every 10 seconds (debounced) **And** the state is associated with my user_id and prototype_id **And** a save indicator shows "Saving..." / "Saved" status.

2. **Given** I navigate away from the prototype viewer, **When** I close the browser tab or navigate to another page, **Then** my current captured state is saved automatically via `visibilitychange` event (or `navigator.sendBeacon` as fallback) **And** no data loss occurs.

3. **Given** state persistence is operational, **When** the save succeeds, **Then** the saved state conforms to the `PrototypeState` schema (v1.0) **And** is stored as JSONB in the `prototype_states` table **And** includes timestamp, prototypeId, and all sub-states (route, forms, components, localStorage).

4. **Given** a network error occurs during state save, **When** the save fails, **Then** the system retries up to 3 times with exponential backoff **And** the user sees a toast notification only after all retries fail **And** the unsaved state is retained in memory for the next save attempt.

5. **Given** multiple state updates occur within the debounce window (10 seconds), **When** the debounce timer fires, **Then** only the most recent state is saved **And** intermediate states are discarded **And** no race conditions occur between save operations.

6. **Given** the prototype has an existing saved state in the database, **When** a new state is captured, **Then** the existing state row is updated (upserted) rather than creating duplicate rows **And** only one state row exists per user per prototype.

## Tasks / Subtasks

- [x] Task 1: Create database migration for prototype_states table (AC: #3, #6)
  - [x] Subtask 1.1: Create `supabase/migrations/00021_create_prototype_states.sql` (renumbered from 00011 to avoid conflict)
  - [x] Subtask 1.2: Define `prototype_states` table with columns: `id` (UUID PK), `prototype_id` (UUID FK → prototypes), `user_id` (UUID FK → auth.users), `state` (JSONB NOT NULL), `created_at`, `updated_at`
  - [x] Subtask 1.3: Add unique constraint on `(prototype_id, user_id)` for upsert semantics
  - [x] Subtask 1.4: Create indexes: `idx_prototype_states_prototype_id`, `idx_prototype_states_user_id`
  - [x] Subtask 1.5: Add `updated_at` trigger (reuse existing `update_updated_at_column` function)
  - [x] Subtask 1.6: Create RLS policies: users can SELECT/INSERT/UPDATE/DELETE their own state, admins can read all

- [x] Task 2: Add state persistence to prototype service layer (AC: #3, #6)
  - [x] Subtask 2.1: Add `saveState(prototypeId: string, state: PrototypeState): Promise<ServiceResponse<void>>` to `prototypeService.ts`
  - [x] Subtask 2.2: Implement upsert logic using `supabase.from('prototype_states').upsert()` with `onConflict: 'prototype_id,user_id'`
  - [x] Subtask 2.3: Add `getState(prototypeId: string): Promise<ServiceResponse<PrototypeState | null>>` to `prototypeService.ts`
  - [x] Subtask 2.4: Add `deleteState(prototypeId: string): Promise<ServiceResponse<void>>` to `prototypeService.ts`
  - [x] Subtask 2.5: Map database row (snake_case) to app format (camelCase) using existing pattern
  - [x] Subtask 2.6: Validate state schema before saving (use `validateStateSchema` from prototypeState.ts)

- [x] Task 3: Create useStatePersistence hook (AC: #1, #2, #4, #5)
  - [x] Subtask 3.1: Create `src/features/prototypes/hooks/useStatePersistence.ts`
  - [x] Subtask 3.2: Accept params: `{ prototypeId: string, capturedState: PrototypeState | null, enabled: boolean }`
  - [x] Subtask 3.3: Implement 10-second debounced auto-save using `setTimeout`/`clearTimeout`
  - [x] Subtask 3.4: Track save status: `'idle' | 'saving' | 'saved' | 'error'`
  - [x] Subtask 3.5: Implement retry logic: 3 retries with exponential backoff (1s, 2s, 4s)
  - [x] Subtask 3.6: Show toast notification only after all retries exhausted
  - [x] Subtask 3.7: Add `visibilitychange` event listener for save-on-hide (replaces beforeunload)
  - [x] Subtask 3.8: Use `navigator.sendBeacon` with Supabase REST API as last-resort save on tab close
  - [x] Subtask 3.9: Prevent concurrent saves (queue latest state, skip if save in-flight)
  - [x] Subtask 3.10: Clean up timers and listeners on unmount

- [x] Task 4: Create StatePersistenceIndicator component (AC: #1)
  - [x] Subtask 4.1: Create `src/features/prototypes/components/StatePersistenceIndicator.tsx`
  - [x] Subtask 4.2: Display status: cloud icon + "Saving..." (spinner) / "Saved" (checkmark) / "Save failed" (warning)
  - [x] Subtask 4.3: Show last saved timestamp
  - [x] Subtask 4.4: Use DaisyUI badge/tooltip components with PassportCard theme
  - [x] Subtask 4.5: Auto-hide "Saved" indicator after 3 seconds

- [x] Task 5: Integrate into PrototypeViewerPage (AC: #1, #2)
  - [x] Subtask 5.1: Add `useStatePersistence` hook to PrototypeViewerPage
  - [x] Subtask 5.2: Pass `capturedState` from `useSandpackStateBridge` to `useStatePersistence`
  - [x] Subtask 5.3: Replace or augment `StateCaptureIndicator` with `StatePersistenceIndicator`
  - [x] Subtask 5.4: Only enable persistence when `editMode` is true
  - [x] Subtask 5.5: Handle version switches: clear persisted state when switching prototype versions

- [x] Task 6: Write comprehensive tests (AC: all)
  - [x] Subtask 6.1: Create `src/features/prototypes/hooks/useStatePersistence.test.ts` (20 tests)
  - [x] Subtask 6.2: Create `src/features/prototypes/components/StatePersistenceIndicator.test.tsx` (15 tests)
  - [x] Subtask 6.3: Update `src/features/prototypes/services/prototypeService.test.ts` with state methods (33 tests total)
  - [x] Subtask 6.4: Update `src/pages/PrototypeViewerPage.test.tsx` for persistence integration (30 tests total)
  - [x] Subtask 6.5: Test debouncing: multiple rapid state changes → single save
  - [x] Subtask 6.6: Test retry logic: mock Supabase failure → verify 3 retries with backoff
  - [x] Subtask 6.7: Test visibilitychange: mock document.hidden → verify save triggered
  - [x] Subtask 6.8: Test upsert: verify only one state row per user/prototype
  - [x] Subtask 6.9: Test concurrent save prevention: verify no race conditions
  - [x] Subtask 6.10: Run `tsc --noEmit` for TypeScript compilation verification (verified clean during code review)

## Dev Notes

### Critical Context: What Already Exists (Story 8.1)

**Story 8.1 built the complete state capture mechanism:**

State is currently captured from the Sandpack iframe via postMessage bridge and stored in React state (in-memory only). Story 8.2 adds the database persistence layer.

**Key files from Story 8.1 (DO NOT MODIFY unless noted):**
```
src/features/prototypes/types/prototypeState.ts        — PrototypeState schema (v1.0), serialization helpers
src/features/prototypes/hooks/useSandpackStateBridge.ts — postMessage bridge, returns capturedState
src/features/prototypes/services/stateCaptureService.ts — validateState, serializeState, deserializeState
src/features/prototypes/scripts/stateCaptureInjector.ts — Iframe injection script
src/features/prototypes/hooks/useStateCapturePerformance.ts — Performance monitoring
```

**Key file to MODIFY:**
```
src/features/prototypes/services/prototypeService.ts  — ADD: saveState(), getState(), deleteState()
src/pages/PrototypeViewerPage.tsx                     — ADD: useStatePersistence integration, persistence indicator
src/pages/PrototypeViewerPage.test.tsx                — ADD: persistence integration tests
```

**Key file to CREATE:**
```
supabase/migrations/00021_create_prototype_states.sql                  — Database migration (renumbered from 00011)
src/features/prototypes/hooks/useStatePersistence.ts                   — Auto-save hook
src/features/prototypes/hooks/useStatePersistence.test.ts              — Hook tests
src/features/prototypes/components/StatePersistenceIndicator.tsx       — Save indicator UI
src/features/prototypes/components/StatePersistenceIndicator.test.tsx  — Indicator tests
```

### How capturedState Is Currently Exposed

In `PrototypeViewerPage.tsx` (lines 239-251), `useSandpackStateBridge` returns:

```typescript
const {
  capturedState: _capturedState, // Currently prefixed with _ to indicate unused
  isListening: isStateCaptureActive,
  lastError: stateCaptureError,
  lastUpdateTime: stateLastUpdateTime,
} = useSandpackStateBridge({
  enabled: editMode,
  onStateUpdate: recordCapture,
  onError: (err) => { /* toast error */ }
});
```

**For Story 8.2:** Remove the `_` prefix from `capturedState` and pass it to the new `useStatePersistence` hook.

### Database Schema

**New table: `prototype_states`**

```sql
-- supabase/migrations/00021_create_prototype_states.sql

CREATE TABLE IF NOT EXISTS prototype_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prototype_id UUID NOT NULL REFERENCES prototypes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prototype_id, user_id)
);

-- Indexes
CREATE INDEX idx_prototype_states_prototype_id ON prototype_states(prototype_id);
CREATE INDEX idx_prototype_states_user_id ON prototype_states(user_id);

-- Updated_at trigger (reuse existing function from migrations)
CREATE TRIGGER update_prototype_states_updated_at
  BEFORE UPDATE ON prototype_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE prototype_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prototype states"
  ON prototype_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prototype states"
  ON prototype_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prototype states"
  ON prototype_states FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prototype states"
  ON prototype_states FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all prototype states"
  ON prototype_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

**Why a separate table (not a column on `prototypes`):**
- Each user can have their own state for the same prototype (multi-user support)
- State is user-specific, not prototype-version-specific
- Clean separation of concerns: prototype code vs runtime state
- CASCADE delete: state automatically removed when prototype is deleted
- Avoids bloating the prototypes table with large JSONB per row

### Service Layer Pattern

**Follow the existing pattern in `prototypeService.ts`:**

```typescript
// Pattern: ServiceResponse<T>
type ServiceResponse<T> = {
  data: T | null;
  error: { message: string; code: string } | null;
};

// saveState - upsert (insert or update)
async function saveState(
  prototypeId: string,
  state: PrototypeState
): Promise<ServiceResponse<void>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };

    // Validate state before saving
    if (!validateStateSchema(state)) {
      return { data: null, error: { message: 'Invalid state schema', code: 'VALIDATION_ERROR' } };
    }

    const { error } = await supabase
      .from('prototype_states')
      .upsert(
        {
          prototype_id: prototypeId,
          user_id: user.id,
          state: state as unknown as Json, // JSONB column
        },
        { onConflict: 'prototype_id,user_id' }
      );

    if (error) return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: 'Failed to save state', code: 'UNKNOWN_ERROR' } };
  }
}

// getState - load saved state for current user
async function getState(
  prototypeId: string
): Promise<ServiceResponse<PrototypeState | null>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: 'Not authenticated', code: 'AUTH_ERROR' } };

    const { data, error } = await supabase
      .from('prototype_states')
      .select('state')
      .eq('prototype_id', prototypeId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
    if (!data) return { data: null, error: null }; // No saved state

    // Validate and return
    const parsed = data.state as unknown as PrototypeState;
    if (!validateStateSchema(parsed)) {
      return { data: null, error: { message: 'Saved state has invalid schema', code: 'VALIDATION_ERROR' } };
    }
    return { data: parsed, error: null };
  } catch (err) {
    return { data: null, error: { message: 'Failed to load state', code: 'UNKNOWN_ERROR' } };
  }
}
```

### useStatePersistence Hook Design

```typescript
interface UseStatePersistenceOptions {
  prototypeId: string;
  capturedState: PrototypeState | null;
  enabled: boolean;
}

interface UseStatePersistenceReturn {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  lastError: Error | null;
  saveNow: () => Promise<void>; // Manual save trigger
}
```

**Auto-save flow:**
1. `capturedState` changes → start 10s debounce timer
2. Timer fires → check if save already in-flight (prevent concurrent)
3. Not in-flight → call `prototypeService.saveState()`
4. On success → set status to 'saved', update `lastSavedAt`
5. On failure → retry up to 3 times with backoff (1s, 2s, 4s)
6. All retries failed → set status to 'error', show toast, retain state for next attempt

**Tab close / visibility change:**
1. `visibilitychange` event fires with `document.hidden === true`
2. If there is an unsaved `capturedState` → immediate save (no debounce)
3. Use `navigator.sendBeacon()` with Supabase REST URL as last resort
4. sendBeacon payload: POST to `{SUPABASE_URL}/rest/v1/prototype_states` with auth header

### Architecture Compliance

**Feature Location:** All new files stay within `src/features/prototypes/` and `supabase/migrations/`.

**Naming Conventions:**
- Table: `prototype_states` (snake_case, plural)
- Columns: `prototype_id`, `user_id`, `state`, `created_at`, `updated_at` (snake_case)
- Hook: `useStatePersistence` (use + camelCase)
- Component: `StatePersistenceIndicator.tsx` (PascalCase)
- Service functions: `saveState()`, `getState()`, `deleteState()` (camelCase)

**State Management:**
- React local state for save status in component
- React Query NOT needed for state persistence (it's a fire-and-forget mutation, not cached query data)
- Direct Supabase calls via service layer

**Error Handling:**
- Try/catch around all Supabase calls
- Retry logic with exponential backoff
- Toast notifications for user-facing errors (only after retries exhausted)
- Console logging for debugging

### Technical Requirements

**No New Dependencies:**

All required functionality uses:
- `@supabase/supabase-js` (already installed) — `supabase.from().upsert()`, `supabase.auth.getUser()`
- Standard Web APIs — `document.addEventListener('visibilitychange')`, `navigator.sendBeacon()`
- React 19 — `useState`, `useEffect`, `useCallback`, `useRef`
- `react-hot-toast` (already installed) — toast notifications
- DaisyUI (already installed) — badge/tooltip for indicator
- `lucide-react` (already installed) — Cloud, CloudOff, Check icons

### Library and Framework Requirements

**Existing packages (no new dependencies needed):**
- `react` ^19.2.0 (hooks: useState, useEffect, useCallback, useRef)
- `@supabase/supabase-js` (Supabase client for upsert, select, delete)
- `react-hot-toast` (toast notifications for save errors)
- DaisyUI 5.x (badge, tooltip components for save indicator)
- `lucide-react` (icons: Cloud, CloudOff, Check, AlertTriangle, Loader2)

### File Structure Requirements

**New files location:**
```
supabase/migrations/00011_create_prototype_states.sql   — In migrations folder (next sequential number)
src/features/prototypes/hooks/useStatePersistence.ts    — In prototypes hooks folder
src/features/prototypes/hooks/useStatePersistence.test.ts
src/features/prototypes/components/StatePersistenceIndicator.tsx   — In prototypes components folder
src/features/prototypes/components/StatePersistenceIndicator.test.tsx
```

**Verify migration numbering:** Migration renumbered to `00021` to avoid conflicts with existing migrations.

### Testing Requirements

**Test Coverage Goals:**
- 90%+ code coverage for new files
- All edge cases tested (debouncing, retries, concurrent saves, visibility change)
- Integration test: full save flow with mocked Supabase

**Test Files:**

1. `useStatePersistence.test.ts` (20+ tests):
   - Debounced auto-save fires after 10s of inactivity
   - Multiple rapid state changes → single save (last-write-wins)
   - Save status transitions: idle → saving → saved
   - Error → retry (3x with backoff) → error toast
   - visibilitychange triggers immediate save
   - Concurrent save prevention (no race conditions)
   - Cleanup: timers and listeners removed on unmount
   - Disabled state: no saves when `enabled: false`
   - Null capturedState: no save attempted
   - saveNow() manual trigger works immediately

2. `StatePersistenceIndicator.test.tsx` (10+ tests):
   - Renders "Saving..." with spinner during save
   - Renders "Saved" with checkmark after success
   - Renders "Save failed" with warning on error
   - Shows last saved timestamp
   - Auto-hides "Saved" after 3 seconds
   - Applies PassportCard theme styles

3. `prototypeService` state tests (10+ tests):
   - saveState: upserts state to database
   - saveState: validates schema before saving
   - saveState: handles auth errors
   - saveState: handles database errors
   - getState: loads saved state
   - getState: returns null when no state exists
   - getState: validates schema of loaded state
   - deleteState: removes state row

4. `PrototypeViewerPage.test.tsx` updates (5+ new tests):
   - State persistence integrates with state capture
   - Persistence indicator shows in edit mode
   - State saved on visibility change
   - Version switch clears saved state

**Testing Strategy:**
- Mock `supabase.from().upsert()` and `supabase.from().select()` for service tests
- Mock `document.addEventListener('visibilitychange')` for visibility tests
- Mock `navigator.sendBeacon` for beacon tests
- Use `vi.useFakeTimers()` for debounce/retry timing tests
- Use `@testing-library/react` `renderHook` for hook tests
- Use `vi.fn()` (Vitest) for function mocks

### Previous Story Intelligence

**From Story 8.1 (Capture Prototype State):**
- `capturedState` is already available in PrototypeViewerPage (prefixed with `_`)
- `useSandpackStateBridge` returns `capturedState`, `isListening`, `lastError`, `lastUpdateTime`
- State capture is debounced at 500ms (so persistence debounce should be longer: 10s)
- `validateStateSchema()` available from `prototypeState.ts` — reuse for save validation
- `serializeState()` and `deserializeState()` available from `stateCaptureService.ts`
- Performance monitoring tracks capture duration and state size
- XSS vulnerability was found and fixed in code review (sanitizeForJsString)
- State capture indicator already exists in UI (`StateCaptureIndicator`)

**From Story 7.5 (Version Management):**
- Version switching uses `activePrototypeId` state
- When switching versions, unsaved changes warning is shown
- `prototypeService.createVersion()` pattern for database writes
- React Query cache invalidation after mutations

**From Story 7.3 (Edit Code in Real-Time):**
- `useCodePersistence` hook handles auto-save with debouncing — good reference pattern
- `beforeunload` warning prevents accidental data loss
- `hasUnsavedChanges` state tracks dirty state

**Lessons from Previous Stories:**
1. Always validate schema versions before database operations
2. Debounce frequent operations (10s for persistence, 500ms for capture)
3. Show user-friendly indicators for background operations
4. Handle errors gracefully without crashing the app
5. Test edge cases thoroughly (null values, empty objects, malformed data)
6. Clean up all event listeners and timers on unmount
7. Use `TextEncoder` for accurate byte counting (fixed in 8.1 code review)
8. Sanitize any user-provided values interpolated into code (XSS prevention)

### Git Intelligence

**Recent Commit Pattern:**
- Implementation commit: `Complete Story X.Y: [Title]`
- Code review fixes commit: `Complete Story X.Y: [Title] - Code Review Fixes`
- All tests passing before commit
- TypeScript compilation clean (`tsc --noEmit`)

**Code Quality Standards:**
- 100% TypeScript (no `any` types without justification)
- Co-located tests with implementation files
- Comprehensive JSDoc comments on public APIs
- Error boundaries for component failures
- ARIA attributes for accessibility
- Mobile-responsive UI (DaisyUI components)
- PassportCard theme compliance (#E10514 primary color)

### Performance Considerations

**Debounce Window:** 10 seconds (per AC) prevents excessive database writes while keeping state reasonably fresh. This is 20x the capture debounce (500ms), ensuring multiple captures are batched.

**State Size:** Typical state is <100KB (enforced by Story 8.1 warnings). JSONB storage handles this efficiently.

**Network Efficiency:**
- Only save when state actually changed (diff check: compare serialized state to last saved)
- Upsert avoids SELECT-then-INSERT/UPDATE round-trip
- sendBeacon as last resort keeps payload small (just the JSONB state)

**Memory:** No memory leaks — all timers and listeners cleaned up on unmount.

### Security Considerations

1. **RLS Enforcement:** Users can only save/load their own state (user_id = auth.uid())
2. **Schema Validation:** Validate state schema before saving to prevent JSONB injection
3. **State Size Limits:** Reject states >100KB to prevent database bloat
4. **Auth Check:** Verify user is authenticated before any save operation
5. **CASCADE Delete:** State automatically removed when prototype is deleted (no orphans)

### Implementation Order (Recommended)

**Phase 1: Database (Task 1)**
1. Create migration file with prototype_states table, indexes, RLS policies

**Phase 2: Service Layer (Task 2)**
2. Add saveState, getState, deleteState to prototypeService.ts

**Phase 3: Core Hook (Task 3)**
3. Create useStatePersistence hook with debouncing, retry, visibility handling

**Phase 4: UI (Task 4)**
4. Create StatePersistenceIndicator component

**Phase 5: Integration (Task 5)**
5. Wire everything together in PrototypeViewerPage

**Phase 6: Testing (Task 6)**
6. Write comprehensive tests (45+ tests total)

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming): Confirmed
- Feature-based organization maintained in `src/features/prototypes/`
- Co-located tests with implementation files
- Services abstracted for testability
- Migration follows sequential numbering convention
- No detected conflicts or variances with project architecture

### References

**Source Documents:**
- [PRD: FR59 - State Persistence](_bmad-output/planning-artifacts/prd.md#prototype-generation--refinement)
- [PRD: FR60 - Restore State on Return](_bmad-output/planning-artifacts/prd.md#prototype-generation--refinement)
- [Epic 8: Prototype State Persistence](_bmad-output/planning-artifacts/epics.md#epic-8-prototype-state-persistence)
- [Story 8.2: Save Prototype State to Database](_bmad-output/planning-artifacts/epics.md#story-82-save-prototype-state-to-database)
- [Architecture: Data Architecture](_bmad-output/planning-artifacts/architecture.md#data-architecture)
- [Architecture: State Management](_bmad-output/planning-artifacts/architecture.md#state-management-patterns)
- [Architecture: Process Patterns](_bmad-output/planning-artifacts/architecture.md#process-patterns)

**Related Stories:**
- [Story 8.1: Capture Prototype State](_bmad-output/implementation-artifacts/8-1-capture-prototype-state.md) — State capture mechanism, types, bridge hook
- [Story 8.3: Restore Prototype State on Return](_bmad-output/planning-artifacts/epics.md#story-83-restore-prototype-state-on-return) — Next story, will consume saved state
- [Story 7.5: Manage Multiple Prototype Versions](_bmad-output/implementation-artifacts/7-5-manage-multiple-prototype-versions.md) — Version management context
- [Story 7.3: Edit Code in Real-Time](_bmad-output/implementation-artifacts/7-3-edit-code-in-real-time-with-live-preview.md) — useCodePersistence auto-save pattern reference

**Technical Documentation:**
- [Supabase upsert](https://supabase.com/docs/reference/javascript/upsert) — Upsert with onConflict
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security) — Row Level Security policies
- [MDN visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event) — Page visibility API
- [MDN sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) — Reliable data sending on page unload
- [Supabase JSONB](https://supabase.com/docs/guides/database/json) — JSONB column handling

**Latest Technology Notes (2026):**
- `beforeunload` event is deprecated in Chromium browsers as of March 2026 — use `visibilitychange` instead
- `navigator.sendBeacon()` is the recommended approach for guaranteed delivery on tab close
- Supabase JS v2 `upsert()` fully supports JSONB columns with TypeScript typing
- `fetch` with `keepalive: true` is a viable fallback if `sendBeacon` is unavailable

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

**Created:**
- `supabase/migrations/00021_create_prototype_states.sql` — Database migration for prototype_states table
- `src/features/prototypes/hooks/useStatePersistence.ts` — Auto-save hook with debounce, retry, visibilitychange, fetch+keepalive
- `src/features/prototypes/hooks/useStatePersistence.test.ts` — 20 hook tests
- `src/features/prototypes/components/StatePersistenceIndicator.tsx` — Save status indicator UI
- `src/features/prototypes/components/StatePersistenceIndicator.test.tsx` — 15 indicator tests

**Modified:**
- `src/features/prototypes/services/prototypeService.ts` — Added saveState(), getState(), deleteState()
- `src/features/prototypes/services/prototypeService.test.ts` — Added 11 state persistence service tests
- `src/pages/PrototypeViewerPage.tsx` — Integrated useStatePersistence + StatePersistenceIndicator
- `src/pages/PrototypeViewerPage.test.tsx` — Added 5 state persistence integration tests
- `src/features/prototypes/components/index.ts` — Added StatePersistenceIndicator export

### Change Log

- **2026-02-07** (Code Review Fix): Replaced broken sendBeacon with fetch+keepalive, cached auth credentials, fixed race condition on tab close, fixed `data: undefined as unknown as void` pattern, added version-switch design comment, corrected migration number references in Dev Notes, populated File List, verified tsc --noEmit clean
