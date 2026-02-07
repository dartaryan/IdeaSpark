# Story 8.3: Restore Prototype State on Return

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to **resume my prototype session exactly where I left off**,
So that **I can continue testing without restarting**.

## Acceptance Criteria

1. **Given** I previously interacted with a prototype, **When** I return to /prototypes/:id, **Then** my saved state is loaded automatically **And** the prototype renders with my previous route, form data, and component states.

2. **Given** no saved state exists, **When** I load a prototype for the first time, **Then** it starts in the initial default state.

3. **Given** I want to reset the prototype, **When** I click "Reset to Initial State", **Then** saved state is cleared **And** the prototype reloads in default state.

## Tasks / Subtasks

- [x] Task 1: Add state restoration to usePrototype hook (AC: #1, #2)
  - [x] Subtask 1.1: Update `src/features/prototypes/hooks/usePrototype.ts` to call `prototypeService.getState()` on mount
  - [x] Subtask 1.2: Store loaded state in a `savedState` field on the Prototype object or as separate state
  - [x] Subtask 1.3: Track restoration status: `'idle' | 'loading' | 'restored' | 'error'`
  - [x] Subtask 1.4: Handle auth errors, DB errors gracefully without blocking prototype load
  - [x] Subtask 1.5: Return `savedState` and `restorationStatus` from usePrototype hook

- [x] Task 2: Create useStateRestoration hook (AC: #1, #2)
  - [x] Subtask 2.1: Create `src/features/prototypes/hooks/useStateRestoration.ts`
  - [x] Subtask 2.2: Accept params: `{ prototypeId: string, savedState: PrototypeState | null, enabled: boolean }`
  - [x] Subtask 2.3: Use postMessage to send `RESTORE_STATE` message to Sandpack iframe
  - [x] Subtask 2.4: Wait for iframe to acknowledge restoration before resolving
  - [x] Subtask 2.5: Track restoration status and any errors
  - [x] Subtask 2.6: Return `{ isRestoring, restorationError, restoreState }` interface

- [x] Task 3: Update state capture injector script to handle restoration (AC: #1)
  - [x] Subtask 3.1: Add `RESTORE_STATE` message handler to `src/features/prototypes/scripts/stateCaptureInjector.ts`
  - [x] Subtask 3.2: Restore route state: use `history.pushState()` or router navigation
  - [x] Subtask 3.3: Restore form fields: set input `.value`, `.checked` for all captured fields
  - [x] Subtask 3.4: Restore component states: dispatch custom events or call APIs if exposed
  - [x] Subtask 3.5: Restore localStorage: `localStorage.setItem()` for each captured key-value pair
  - [x] Subtask 3.6: Send acknowledgment postMessage back to parent after restoration completes
  - [x] Subtask 3.7: Handle restoration errors gracefully (log to console, send error message to parent)

- [x] Task 4: Integrate state restoration into PrototypeViewerPage (AC: #1, #2)
  - [x] Subtask 4.1: Add `useStateRestoration` hook to PrototypeViewerPage
  - [x] Subtask 4.2: Pass `savedState` from `usePrototype` to `useStateRestoration`
  - [x] Subtask 4.3: Trigger restoration after Sandpack iframe is ready (after first render)
  - [x] Subtask 4.4: Only enable restoration when `editMode` is true (consistent with persistence)
  - [x] Subtask 4.5: Show loading indicator or toast during restoration
  - [x] Subtask 4.6: Show success toast when restoration completes
  - [x] Subtask 4.7: Handle restoration errors: show toast, allow prototype to load anyway

- [x] Task 5: Implement "Reset to Initial State" button (AC: #3)
  - [x] Subtask 5.1: Add "Reset State" button to PrototypeViewerPage toolbar (near code editor toggle)
  - [x] Subtask 5.2: Show confirmation modal: "This will clear your saved state. Continue?"
  - [x] Subtask 5.3: On confirm, call `prototypeService.deleteState(prototypeId)`
  - [x] Subtask 5.4: After deletion, reload the iframe: trigger Sandpack remount
  - [x] Subtask 5.5: Show success toast: "State reset. Prototype reloaded."
  - [x] Subtask 5.6: Disable button when no saved state exists
  - [x] Subtask 5.7: Add loading state to button during deletion

- [x] Task 6: Write comprehensive tests (AC: all)
  - [x] Subtask 6.1: Create `src/features/prototypes/hooks/useStateRestoration.test.ts` (14 tests)
  - [x] Subtask 6.2: Update `src/features/prototypes/hooks/usePrototype.test.ts` for state loading (5 new tests)
  - [x] Subtask 6.3: Update `src/pages/PrototypeViewerPage.test.tsx` for restoration integration (10 new tests)
  - [x] Subtask 6.4: Test restoration postMessage flow: verify RESTORE_STATE message sent
  - [x] Subtask 6.5: Test restoration acknowledgment: verify state applied after ack received
  - [x] Subtask 6.6: Test no saved state: verify prototype loads normally without restoration
  - [x] Subtask 6.7: Test reset button: verify deleteState called and iframe remounted
  - [x] Subtask 6.8: Test error handling: DB error, auth error, invalid state schema
  - [x] Subtask 6.9: Test restoration in edit mode only: disabled in view-only mode
  - [x] Subtask 6.10: Run `tsc --noEmit` for TypeScript compilation verification

## Dev Notes

### Critical Context: What Already Exists

**Story 8.1 built the complete state capture mechanism:**
- `useSandpackStateBridge` hook returns `capturedState` (already integrated in PrototypeViewerPage)
- postMessage bridge captures state from iframe every 500ms (debounced)
- `stateCaptureInjector.ts` script runs inside Sandpack iframe and sends state updates
- `PrototypeState` schema (v1.0) includes: route, forms, components, localStorage
- `validateStateSchema()` available for schema validation

**Story 8.2 built the state persistence layer:**
- `prototypeService.saveState()` — upserts state to `prototype_states` table
- `prototypeService.getState()` — loads saved state for current user/prototype
- `prototypeService.deleteState()` — clears saved state
- `useStatePersistence` hook — auto-saves capturedState every 10s (debounced)
- `StatePersistenceIndicator` component — shows save status in UI
- Database table: `prototype_states` with RLS (user-specific state)

**What Story 8.3 Must Add:**
- Load saved state when prototype loads → integrate `getState()` into `usePrototype` hook
- Restore state into Sandpack iframe → send postMessage with state to injector script
- Update injector script to handle `RESTORE_STATE` message → apply route, forms, components, localStorage
- "Reset to Initial State" button → call `deleteState()` and remount iframe
- Comprehensive testing for all restoration flows

### Architecture Compliance

**Feature Location:** All new code stays within `src/features/prototypes/` and `src/pages/`.

**Naming Conventions:**
- Hook: `useStateRestoration` (use + camelCase)
- Message type: `RESTORE_STATE` (SCREAMING_SNAKE_CASE)
- Component: `ResetStateButton` if extracted as separate component (PascalCase)
- Functions: `restoreState()`, `applyRouteState()`, `applyFormFields()` (camelCase)

**State Management:**
- React local state for restoration status in hook
- React Query NOT needed (restoration is one-time operation on mount)
- Direct Supabase calls via service layer (already implemented in Story 8.2)

**Error Handling:**
- Try/catch around all restoration operations
- Toast notifications for user-facing errors (restoration failed, reset failed)
- Console logging for debugging
- Graceful degradation: if restoration fails, prototype still loads normally

### Technical Requirements

**No New Dependencies:**

All required functionality uses:
- `@supabase/supabase-js` (already installed) — `prototypeService.getState()`, `deleteState()`
- Standard Web APIs — `window.postMessage()`, `history.pushState()`, `localStorage.setItem()`
- React 19 — `useState`, `useEffect`, `useCallback`, `useRef`
- `react-hot-toast` (already installed) — toast notifications
- DaisyUI (already installed) — button, modal for reset confirmation
- `lucide-react` (already installed) — RotateCcw icon for reset button

### Library and Framework Requirements

**Existing packages (no new dependencies needed):**
- `react` ^19.2.0 (hooks: useState, useEffect, useCallback, useRef)
- `@supabase/supabase-js` (Supabase client for getState, deleteState)
- `react-hot-toast` (toast notifications for restoration status)
- DaisyUI 5.x (button, modal components)
- `lucide-react` (icons: RotateCcw, Loader2)

### File Structure Requirements

**Files to MODIFY:**
```
src/features/prototypes/hooks/usePrototype.ts                  — ADD: load savedState via getState()
src/features/prototypes/hooks/usePrototype.test.ts             — ADD: state loading tests
src/features/prototypes/scripts/stateCaptureInjector.ts        — ADD: RESTORE_STATE message handler
src/pages/PrototypeViewerPage.tsx                              — ADD: useStateRestoration, reset button
src/pages/PrototypeViewerPage.test.tsx                         — ADD: restoration integration tests
```

**Files to CREATE:**
```
src/features/prototypes/hooks/useStateRestoration.ts           — Restoration hook
src/features/prototypes/hooks/useStateRestoration.test.ts      — Restoration hook tests
```

### postMessage Protocol Design

**Restoration Flow:**

1. **Parent → Iframe (PrototypeViewerPage → stateCaptureInjector):**

```typescript
interface RestoreStateMessage {
  type: 'RESTORE_STATE';
  payload: PrototypeState;
  source: 'ideaspark-parent';
}

// Parent sends:
iframe.contentWindow.postMessage({
  type: 'RESTORE_STATE',
  payload: savedState,
  source: 'ideaspark-parent',
}, '*');
```

2. **Iframe → Parent (stateCaptureInjector → useStateRestoration):**

```typescript
interface RestoreStateAck {
  type: 'RESTORE_STATE_ACK';
  success: boolean;
  error?: string;
  source: 'sandpack-state-capture';
}

// Iframe responds:
window.parent.postMessage({
  type: 'RESTORE_STATE_ACK',
  success: true,
  source: 'sandpack-state-capture',
}, '*');
```

**Restoration Implementation in Injector Script:**

```typescript
// In stateCaptureInjector.ts
window.addEventListener('message', (event) => {
  if (event.data.type === 'RESTORE_STATE' && event.data.source === 'ideaspark-parent') {
    const state: PrototypeState = event.data.payload;
    try {
      // 1. Restore route
      if (state.route.pathname !== window.location.pathname) {
        history.pushState(state.route.state, '', state.route.pathname + state.route.search + state.route.hash);
      }

      // 2. Restore form fields
      Object.entries(state.forms).forEach(([fieldKey, fieldValue]) => {
        const field = document.querySelector(`[name="${fieldKey}"], #${fieldKey}`) as HTMLInputElement;
        if (field) {
          if (fieldValue.type === 'checkbox' || fieldValue.type === 'radio') {
            field.checked = fieldValue.checked ?? false;
          } else {
            field.value = String(fieldValue.value);
          }
        }
      });

      // 3. Restore localStorage
      Object.entries(state.localStorage).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      // 4. Restore component states
      // Note: Components must expose APIs or listen for custom events
      Object.entries(state.components).forEach(([componentKey, componentValue]) => {
        // Example: dispatch custom event
        window.dispatchEvent(new CustomEvent('restore-component-state', {
          detail: { key: componentKey, state: componentValue },
        }));
      });

      // 5. Send success acknowledgment
      window.parent.postMessage({
        type: 'RESTORE_STATE_ACK',
        success: true,
        source: 'sandpack-state-capture',
      }, '*');
    } catch (error) {
      // 6. Send error acknowledgment
      window.parent.postMessage({
        type: 'RESTORE_STATE_ACK',
        success: false,
        error: String(error),
        source: 'sandpack-state-capture',
      }, '*');
    }
  }
});
```

### useStateRestoration Hook Design

```typescript
interface UseStateRestorationOptions {
  prototypeId: string;
  savedState: PrototypeState | null;
  enabled: boolean;
  iframeReady: boolean; // Only restore after iframe is fully loaded
}

interface UseStateRestorationReturn {
  restorationStatus: 'idle' | 'restoring' | 'restored' | 'error';
  restorationError: Error | null;
  restoreNow: () => Promise<void>; // Manual restore trigger
}

function useStateRestoration({
  prototypeId,
  savedState,
  enabled,
  iframeReady,
}: UseStateRestorationOptions): UseStateRestorationReturn {
  const [restorationStatus, setRestorationStatus] = useState<'idle' | 'restoring' | 'restored' | 'error'>('idle');
  const [restorationError, setRestorationError] = useState<Error | null>(null);
  const hasRestoredRef = useRef(false); // Prevent duplicate restoration

  const restoreNow = useCallback(async () => {
    if (!savedState || !enabled || !iframeReady || hasRestoredRef.current) return;

    setRestorationStatus('restoring');
    setRestorationError(null);
    hasRestoredRef.current = true;

    try {
      // Find iframe element
      const iframe = document.querySelector('iframe[title="Sandpack Preview"]') as HTMLIFrameElement;
      if (!iframe?.contentWindow) {
        throw new Error('Sandpack iframe not found');
      }

      // Send restore message
      iframe.contentWindow.postMessage({
        type: 'RESTORE_STATE',
        payload: savedState,
        source: 'ideaspark-parent',
      }, '*');

      // Wait for acknowledgment (with timeout)
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Restoration timeout')), 5000);

        const handleAck = (event: MessageEvent) => {
          if (event.data.type === 'RESTORE_STATE_ACK' && event.data.source === 'sandpack-state-capture') {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleAck);
            if (event.data.success) {
              resolve();
            } else {
              reject(new Error(event.data.error || 'Restoration failed'));
            }
          }
        };

        window.addEventListener('message', handleAck);
      });

      setRestorationStatus('restored');
    } catch (error) {
      console.error('State restoration error:', error);
      setRestorationStatus('error');
      setRestorationError(error as Error);
    }
  }, [savedState, enabled, iframeReady]);

  // Auto-restore on mount when iframe is ready
  useEffect(() => {
    if (savedState && enabled && iframeReady && restorationStatus === 'idle') {
      restoreNow();
    }
  }, [savedState, enabled, iframeReady, restorationStatus, restoreNow]);

  return { restorationStatus, restorationError, restoreNow };
}
```

### Reset to Initial State Feature

**UI Component: Reset Button**

Location: PrototypeViewerPage toolbar, near "View Code" / "Edit Mode" buttons

```tsx
// In PrototypeViewerPage.tsx
const handleResetState = async () => {
  // Show confirmation modal
  const confirmed = window.confirm(
    'This will clear your saved prototype state and reload. Continue?'
  );
  if (!confirmed) return;

  setIsResetting(true);
  try {
    const result = await prototypeService.deleteState(prototypeId);
    if (result.error) {
      toast.error(`Failed to reset state: ${result.error.message}`);
      return;
    }

    toast.success('State reset. Reloading prototype...');

    // Remount Sandpack iframe by toggling key
    setIframeKey(Date.now());
  } catch (error) {
    toast.error('An unexpected error occurred');
  } finally {
    setIsResetting(false);
  }
};

// Reset button in toolbar
{editMode && savedState && (
  <button
    onClick={handleResetState}
    disabled={isResetting}
    className="btn btn-ghost btn-sm"
    aria-label="Reset to initial state"
  >
    {isResetting ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <RotateCcw className="w-4 h-4" />
    )}
    Reset State
  </button>
)}
```

**Button Visibility Rules:**
- Only show in edit mode (`editMode === true`)
- Only show if `savedState` exists (no point resetting if no state saved)
- Disable during reset operation (`isResetting`)

**Confirmation Modal:**
- Use native `window.confirm()` for simplicity (or DaisyUI modal for better UX)
- Clear message: "This will clear your saved prototype state and reload. Continue?"
- Prevent accidental resets

### Integration with usePrototype Hook

**Current `usePrototype` Hook:**

Returns: `{ data: prototype, isLoading, isError, error, refetch }`

**Updated `usePrototype` Hook (Story 8.3):**

Add state loading on mount:

```typescript
export function usePrototype(prototypeId: string) {
  // Existing React Query for prototype data
  const { data: prototype, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['prototype', prototypeId],
    queryFn: async () => {
      const result = await prototypeService.getById(prototypeId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
  });

  // NEW: Load saved state
  const [savedState, setSavedState] = useState<PrototypeState | null>(null);
  const [stateLoadStatus, setStateLoadStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  useEffect(() => {
    if (!prototypeId) return;

    setStateLoadStatus('loading');
    prototypeService.getState(prototypeId).then((result) => {
      if (result.error) {
        console.warn('Failed to load saved state:', result.error);
        setStateLoadStatus('error');
        return;
      }
      setSavedState(result.data);
      setStateLoadStatus('loaded');
    });
  }, [prototypeId]);

  return {
    data: prototype,
    isLoading,
    isError,
    error,
    refetch,
    savedState,          // NEW: saved state or null
    stateLoadStatus,     // NEW: loading status
  };
}
```

**Why Load State in usePrototype:**
- Co-locates state loading with prototype loading
- Ensures state is available when PrototypeViewerPage renders
- Simplifies component logic (single hook provides both prototype and saved state)
- Consistent with existing pattern (usePrototype as primary data source)

### Testing Requirements

**Test Coverage Goals:**
- 90%+ code coverage for new files
- All edge cases tested (no saved state, invalid state, restoration errors, reset flow)
- Integration test: full restoration flow with mocked postMessage

**Test Files:**

1. `useStateRestoration.test.ts` (15+ tests):
   - Sends RESTORE_STATE message when savedState provided
   - Waits for RESTORE_STATE_ACK before marking as restored
   - Sets restorationStatus to 'restoring' → 'restored' on success
   - Sets restorationStatus to 'error' on failure
   - Does not restore if enabled: false
   - Does not restore if savedState: null
   - Does not restore if iframeReady: false
   - Does not restore twice (hasRestoredRef prevents duplicate)
   - Handles restoration timeout (5s)
   - Handles missing iframe (error)
   - restoreNow() manual trigger works
   - Cleanup: removes event listeners on unmount

2. `usePrototype.test.ts` updates (5+ new tests):
   - Loads saved state via getState() on mount
   - Sets stateLoadStatus to 'loading' → 'loaded'
   - Sets savedState to returned PrototypeState
   - Handles getState() error gracefully (stateLoadStatus: 'error')
   - Returns null savedState when no state exists

3. `PrototypeViewerPage.test.tsx` updates (10+ new tests):
   - State restoration integrates with prototype loading
   - useStateRestoration called with savedState from usePrototype
   - Shows loading indicator during restoration
   - Shows success toast when restoration completes
   - Shows error toast when restoration fails
   - Prototype loads normally when no saved state exists
   - Reset button visible only in edit mode with saved state
   - Reset button calls deleteState() and remounts iframe
   - Confirmation modal shown before reset
   - Reset button disabled during reset operation

**Testing Strategy:**
- Mock `prototypeService.getState()` for state loading tests
- Mock `prototypeService.deleteState()` for reset tests
- Mock `window.postMessage()` and `window.addEventListener('message')` for restoration tests
- Use `vi.useFakeTimers()` for timeout tests
- Use `@testing-library/react` `renderHook` for hook tests
- Use `vi.fn()` (Vitest) for function mocks

### Previous Story Intelligence

**From Story 8.2 (Save Prototype State to Database):**
- `prototypeService.getState(prototypeId)` available — returns `ServiceResponse<PrototypeState | null>`
- `prototypeService.deleteState(prototypeId)` available — returns `ServiceResponse<void>`
- `useStatePersistence` hook handles auto-save — no changes needed for Story 8.3
- `StatePersistenceIndicator` component shows save status — no changes needed
- `prototype_states` table with RLS — already handles user-specific state
- Schema validation via `validateStateSchema()` — reuse for loaded state

**From Story 8.1 (Capture Prototype State):**
- `stateCaptureInjector.ts` script runs inside Sandpack iframe — UPDATE to handle RESTORE_STATE
- postMessage protocol already established — EXTEND with new message type
- `PrototypeState` schema (v1.0) — use for restoration payload
- `useSandpackStateBridge` returns `capturedState` — no changes needed
- `validateStateSchema()` available — use to validate loaded state before restoration

**From Story 7.3 (Edit Code in Real-Time):**
- `useCodePersistence` hook auto-saves code edits — good reference pattern
- `hasUnsavedChanges` state tracks dirty state — similar pattern for restoration
- Sandpack iframe remounting pattern — use for reset functionality

**Lessons from Previous Stories:**
1. Always validate schema before operations (getState, restore, delete)
2. Handle errors gracefully without crashing the app
3. Show user-friendly indicators for background operations
4. Test edge cases thoroughly (null values, empty objects, malformed data)
5. Clean up all event listeners and timers on unmount
6. Use try/catch around all external operations (Supabase, postMessage)
7. Graceful degradation: prototype should load even if restoration fails

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

### Implementation Order (Recommended)

**Phase 1: Service Layer Integration (Task 1)**
1. Update usePrototype hook to load saved state via `getState()`
2. Return `savedState` and `stateLoadStatus` from hook
3. Test state loading in usePrototype

**Phase 2: Restoration Hook (Task 2)**
4. Create useStateRestoration hook with postMessage logic
5. Handle RESTORE_STATE_ACK acknowledgment
6. Track restoration status and errors
7. Test restoration hook

**Phase 3: Injector Script Update (Task 3)**
8. Add RESTORE_STATE message handler to stateCaptureInjector.ts
9. Implement route, form, component, localStorage restoration
10. Send acknowledgment message back to parent
11. Test injector script updates (integration test)

**Phase 4: UI Integration (Task 4)**
12. Integrate useStateRestoration into PrototypeViewerPage
13. Pass savedState from usePrototype to useStateRestoration
14. Show toast notifications for restoration status
15. Test restoration integration

**Phase 5: Reset Feature (Task 5)**
16. Add "Reset to Initial State" button to toolbar
17. Implement confirmation modal
18. Call deleteState() and remount iframe
19. Test reset functionality

**Phase 6: Comprehensive Testing (Task 6)**
20. Write all test files (30+ tests total)
21. Verify 90%+ code coverage
22. Run `tsc --noEmit` to ensure no TypeScript errors

### Performance Considerations

**Restoration Timing:** Restoration should occur after Sandpack iframe is fully loaded and injector script is running. Wait for `iframeReady` signal (e.g., first postMessage from iframe).

**Restoration Timeout:** 5 seconds timeout for acknowledgment prevents infinite waiting if iframe fails to respond.

**State Size:** Typical state is <100KB (enforced by Story 8.1). Restoration should complete in <100ms.

**Memory:** No memory leaks — all event listeners cleaned up on unmount.

### Security Considerations

1. **postMessage Origin Validation:** Accept RESTORE_STATE_ACK only from same-origin or Sandpack origins
2. **Schema Validation:** Validate loaded state schema before restoration to prevent injection
3. **RLS Enforcement:** Users can only load their own state (user_id = auth.uid())
4. **Error Handling:** Don't expose sensitive error details to UI (log to console only)
5. **Confirmation Modal:** Prevent accidental state deletion with reset confirmation

### UX Considerations

**Restoration Feedback:**
- Show toast notification: "Restoring your session..." (brief)
- Show success toast: "Session restored" (3s auto-hide)
- Show error toast: "Failed to restore session. Starting fresh." (stays visible)

**Reset Feedback:**
- Confirmation modal with clear message
- Loading state on button during deletion
- Success toast: "State reset. Prototype reloaded."
- Prototype remounts cleanly without errors

**First-Time Load:**
- No restoration message shown (silent)
- Prototype loads normally in initial state
- No confusion for users

### Edge Cases to Handle

1. **No saved state exists:** Prototype loads normally without restoration attempt
2. **Invalid state schema:** Log error, skip restoration, load prototype normally
3. **Restoration timeout:** Show error toast, load prototype normally
4. **Iframe not found:** Log error, skip restoration, load prototype normally
5. **DB error loading state:** Log error, skip restoration, load prototype normally
6. **User not authenticated:** Skip restoration, load prototype normally
7. **Restoration partially fails:** Some fields restored, others skipped (graceful degradation)
8. **Reset during active restoration:** Cancel restoration, proceed with reset
9. **Version switch after restoration:** Clear saved state for old version (already handled in Story 7.5)

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming): Confirmed
- Feature-based organization maintained in `src/features/prototypes/`
- Co-located tests with implementation files
- Services abstracted for testability (already done in Story 8.2)
- No detected conflicts or variances with project architecture

### References

**Source Documents:**
- [PRD: FR60 - Restore State on Return](_bmad-output/planning-artifacts/prd.md#prototype-generation--refinement)
- [Epic 8: Prototype State Persistence](_bmad-output/planning-artifacts/epics.md#epic-8-prototype-state-persistence)
- [Story 8.3: Restore Prototype State on Return](_bmad-output/planning-artifacts/epics.md#story-83-restore-prototype-state-on-return)
- [Architecture: Data Architecture](_bmad-output/planning-artifacts/architecture.md#data-architecture)
- [Architecture: State Management](_bmad-output/planning-artifacts/architecture.md#state-management-patterns)
- [Architecture: Process Patterns](_bmad-output/planning-artifacts/architecture.md#process-patterns)

**Related Stories:**
- [Story 8.1: Capture Prototype State](_bmad-output/implementation-artifacts/8-1-capture-prototype-state.md) — State capture mechanism, postMessage bridge
- [Story 8.2: Save Prototype State to Database](_bmad-output/implementation-artifacts/8-2-save-prototype-state-to-database.md) — State persistence layer, getState(), deleteState()
- [Story 7.5: Manage Multiple Prototype Versions](_bmad-output/implementation-artifacts/7-5-manage-multiple-prototype-versions.md) — Version switching context
- [Story 7.3: Edit Code in Real-Time](_bmad-output/implementation-artifacts/7-3-edit-code-in-real-time-with-live-preview.md) — useCodePersistence pattern reference

**Technical Documentation:**
- [MDN postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) — Cross-frame messaging
- [MDN history.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) — Route restoration
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — localStorage restoration
- [Supabase getState](https://supabase.com/docs/reference/javascript/select) — Load saved state
- [Supabase deleteState](https://supabase.com/docs/reference/javascript/delete) — Clear saved state

**Latest Technology Notes (2026):**
- postMessage is the standard way to communicate with iframes securely
- `history.pushState()` is the modern way to change URL without page reload
- React 19 automatic cleanup for useEffect makes listener cleanup cleaner
- DaisyUI 5.x modal components provide better UX than native `window.confirm()`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

**Created:**
- `src/features/prototypes/hooks/useStateRestoration.ts` — State restoration hook
- `src/features/prototypes/hooks/useStateRestoration.test.ts` — Restoration hook tests

**Modified:**
- `src/features/prototypes/hooks/usePrototype.ts` — Added savedState loading via getState(), clearSavedState, validateStateSchema
- `src/features/prototypes/hooks/usePrototype.test.tsx` — Added state loading tests + review fix tests
- `src/features/prototypes/scripts/stateCaptureInjector.ts` — Added RESTORE_STATE message handler + CSS selector sanitization
- `src/pages/PrototypeViewerPage.tsx` — Integrated useStateRestoration + Reset State button + clearSavedState on reset
- `src/pages/PrototypeViewerPage.test.tsx` — Added restoration integration tests + review fix tests

### Change Log

- 2026-02-07: Initial implementation of Story 8.3 (all 6 tasks)
- 2026-02-07: Code Review completed — 7 issues found (2 HIGH, 3 MEDIUM, 2 LOW), 5 fixed automatically

## Senior Developer Review (AI)

**Reviewer:** Ben.akiva on 2026-02-07
**Outcome:** Approved with fixes applied

### Issues Found: 2 HIGH, 3 MEDIUM, 2 LOW

#### HIGH (fixed)
- **H1** `handleResetState` did not clear `savedState` locally after reset — Reset State button remained visible after resetting. Fixed: added `clearSavedState()` callback to `usePrototype` hook; called after successful `deleteState()`.
- **H2** No `validateStateSchema()` on loaded state before restoration — stale/malformed schema from DB sent to iframe raw. Fixed: added schema validation in `usePrototype.ts` before storing loaded state.

#### MEDIUM (fixed)
- **M1** No `event.origin` validation on `RESTORE_STATE_ACK` messages in `useStateRestoration` — any script could spoof ACK. Fixed: added `isValidOrigin()` check matching `useSandpackStateBridge` pattern.
- **M2** CSS selector injection risk in `stateCaptureInjector.ts` form restoration — `fieldKey` used raw in `querySelector`. Fixed: added `CSS.escape()` with fallback regex sanitization.
- **M3** Tight DOM coupling via hardcoded `iframe[title="Sandpack Preview"]` selector. Fixed: extracted to exported `SANDPACK_IFRAME_SELECTOR` constant.

#### LOW (documented, not fixed)
- **L1** Story File List references `usePrototype.test.ts` but actual file is `.tsx`. Minor doc error.
- **L2** Story claims 14 tests for `useStateRestoration.test.ts`; actual count is 15 (after review fixes).

### Tests
- All 73 tests passing (69 original + 4 review fix tests)
- TypeScript compilation clean (`tsc --noEmit`)
- All ACs verified as implemented
