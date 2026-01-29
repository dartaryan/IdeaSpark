# Story 5.4: Approve Idea for PRD Development

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin**,
I want **to approve submitted ideas for PRD development**,
So that **promising ideas can progress in the pipeline**.

## Acceptance Criteria

**Given** I am viewing a submitted idea
**When** I click "Approve for PRD"
**Then** I see a confirmation dialog
**And** upon confirmation, the idea status changes to "approved"
**And** the idea creator can now start building a PRD
**And** a timestamp is recorded for the approval
**And** the idea moves to the "Approved" column in pipeline view

**Given** I approve an idea from the list view
**When** I click the approve action button
**Then** the idea is approved without leaving the list
**And** the status badge updates immediately

## Tasks / Subtasks

- [x] Task 1: Extend adminService with approveIdea() function (AC: Idea status changes to approved)
  - [x] Subtask 1.1: Add approveIdea(ideaId: string) function to adminService.ts
  - [x] Subtask 1.2: Update ideas table: SET status = 'approved', status_updated_at = NOW()
  - [x] Subtask 1.3: Record approval timestamp in status_updated_at column
  - [x] Subtask 1.4: Return ServiceResponse<Idea> with updated idea
  - [x] Subtask 1.5: Handle database errors gracefully with error messages

- [x] Task 2: Create useApproveIdea React Query mutation hook (AC: Optimistic updates, real-time feedback)
  - [x] Subtask 2.1: Create useApproveIdea.ts in features/admin/hooks/
  - [x] Subtask 2.2: Implement useMutation with approveIdea service function
  - [x] Subtask 2.3: Add onMutate for optimistic UI updates
  - [x] Subtask 2.4: Invalidate relevant React Query caches: ['admin', 'ideas'], ['admin', 'pipeline'], ['admin', 'metrics']
  - [x] Subtask 2.5: Show success toast notification on completion
  - [x] Subtask 2.6: Handle errors with rollback and error toast

- [x] Task 3: Create ApproveIdeaButton component with confirmation dialog (AC: Confirmation dialog)
  - [x] Subtask 3.1: Create ApproveIdeaButton.tsx in features/admin/components/
  - [x] Subtask 3.2: Display "Approve for PRD" button with success color styling
  - [x] Subtask 3.3: Implement confirmation modal showing idea summary
  - [x] Subtask 3.4: Modal content: idea title, submitter name, problem statement (truncated)
  - [x] Subtask 3.5: Modal actions: "Confirm Approval" (primary) and "Cancel" (secondary)
  - [x] Subtask 3.6: Call useApproveIdea mutation on confirmation
  - [x] Subtask 3.7: Disable button and show loading spinner while mutation in progress
  - [x] Subtask 3.8: Close modal after successful approval

- [x] Task 4: Integrate ApproveIdeaButton into IdeaDetailPage (AC: Approve from detail view)
  - [x] Subtask 4.1: Add ApproveIdeaButton to IdeaDetailPage for admin users
  - [x] Subtask 4.2: Only show button when idea status === 'submitted'
  - [x] Subtask 4.3: Position button prominently in detail page header
  - [x] Subtask 4.4: Add role check: Only admins see approve button
  - [x] Subtask 4.5: Update UI immediately after approval (status badge changes)

- [x] Task 5: Add inline approve action to AllIdeasList (AC: Approve from list view)
  - [x] Subtask 5.1: Add approve icon button to IdeaListItem component
  - [x] Subtask 5.2: Only show approve button for ideas with status='submitted'
  - [x] Subtask 5.3: Use Heroicons check-circle icon (neutral gray #525355)
  - [x] Subtask 5.4: Trigger same confirmation modal as ApproveIdeaButton
  - [x] Subtask 5.5: Update list item status badge immediately after approval
  - [x] Subtask 5.6: Add aria-label for accessibility: "Approve idea for PRD development"

- [x] Task 6: Add inline approve action to PipelineView kanban cards (AC: Approve from pipeline view)
  - [x] Subtask 6.1: Add approve icon button to IdeaKanbanCard component
  - [x] Subtask 6.2: Only show for cards in "Submitted" column
  - [x] Subtask 6.3: Position button in card footer with consistent styling
  - [x] Subtask 6.4: Trigger confirmation modal
  - [x] Subtask 6.5: Card automatically moves to "Approved" column after approval (real-time)
  - [x] Subtask 6.6: Add smooth animation when card moves columns

- [x] Task 7: Update IdeaDetailPage to enable PRD building for approved ideas (AC: Creator can start PRD)
  - [x] Subtask 7.1: Check if user viewing their own idea with status='approved'
  - [x] Subtask 7.2: Display prominent "Build PRD" button for approved ideas
  - [x] Subtask 7.3: Button navigates to /prd/build?ideaId={ideaId}
  - [x] Subtask 7.4: Show approval timestamp: "Approved {relative_time_ago}"
  - [x] Subtask 7.5: Update idea status badge to show "approved" with blue semantic color

- [x] Task 8: Implement approval timestamp tracking (AC: Timestamp recorded)
  - [x] Subtask 8.1: Add status_updated_at column update in approveIdea function
  - [x] Subtask 8.2: Store current timestamp when status changes to 'approved'
  - [x] Subtask 8.3: Display approval timestamp in idea detail view for admins
  - [x] Subtask 8.4: Use relative time format: "Approved 2 hours ago"
  - [x] Subtask 8.5: Include approval timestamp in analytics queries (deferred to analytics stories)

- [x] Task 9: Add approval action logging (AC: Admin actions logged)
  - [x] Subtask 9.1: Log approval action to activity_log table (if exists)
  - [x] Subtask 9.2: Record: admin_user_id, idea_id, action='approve', timestamp
  - [x] Subtask 9.3: If activity_log doesn't exist, add comment for future logging enhancement
  - [x] Subtask 9.4: Ensure logging doesn't block approval if it fails (fail gracefully)

- [x] Task 10: Handle edge cases and validation (AC: Robust error handling)
  - [x] Subtask 10.1: Prevent approving ideas that are not in 'submitted' status
  - [x] Subtask 10.2: Show error toast: "This idea has already been reviewed"
  - [x] Subtask 10.3: Handle concurrent approvals (two admins approving same idea)
  - [x] Subtask 10.4: Handle database errors with user-friendly messages
  - [x] Subtask 10.5: Add optimistic update rollback if approval fails
  - [x] Subtask 10.6: Validate user has admin role before allowing approval

- [x] Task 11: Integrate PassportCard DaisyUI theme throughout (AC: Consistent branding)
  - [x] Subtask 11.1: Use DaisyUI modal component for confirmation dialog
  - [x] Subtask 11.2: Apply success green color for approve button (#10B981)
  - [x] Subtask 11.3: Use Heroicons check-circle for approve icon (neutral gray #525355)
  - [x] Subtask 11.4: Apply 20px border radius to modal and buttons
  - [x] Subtask 11.5: Use Montserrat font for modal headings, Rubik for body
  - [x] Subtask 11.6: Apply DSM shadows and spacing tokens consistently

- [x] Task 12: Add email notification for idea creator (AC: Creator notified - DEFERRED)
  - [x] Subtask 12.1: THIS TASK IS DEFERRED - Email notifications are post-MVP
  - [x] Subtask 12.2: Add TODO comment in code for future email integration
  - [x] Subtask 12.3: Approval works without email (user sees status change when they log in)

## Dev Notes

### Architecture Alignment

**Feature Location:**
- Service: `src/features/admin/services/adminService.ts` (extend existing)
- Hook: `src/features/admin/hooks/useApproveIdea.ts`
- Component: `src/features/admin/components/ApproveIdeaButton.tsx`
- Modal: `src/features/admin/components/ApproveIdeaModal.tsx`

**Integration Points:**
- IdeaDetailPage: `src/features/ideas/components/IdeaDetailPage.tsx` (add approve button for admins)
- AllIdeasPage: `src/features/admin/components/IdeaListItem.tsx` (add inline approve action)
- PipelineView: `src/features/admin/components/IdeaKanbanCard.tsx` (add inline approve action)

**Database Operation:**
- Table: `ideas`
- Update: `SET status = 'approved', status_updated_at = NOW() WHERE id = {ideaId} AND status = 'submitted'`
- RLS policy: Admin role required for UPDATE operation on ideas table

**State Management:**
- React Query mutation: `useMutation` for approveIdea action
- Invalidate caches: `['admin', 'ideas']`, `['admin', 'pipeline']`, `['admin', 'metrics']`, `['ideas', 'list', userId]`
- Optimistic updates: Update UI immediately, rollback on failure
- Local state: Modal open/close state (useState)

**UI Components:**
- DaisyUI components: `modal`, `btn`, `badge`, `card`
- Heroicons: `check-circle` for approve action
- Colors: Success green (#10B981) for approve button, neutral gray (#525355) for icons
- Animations: Smooth status badge transitions, card movement in kanban

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/admin/`
- Naming: PascalCase for components (`ApproveIdeaButton.tsx`)
- Hooks: `use` prefix + camelCase (`useApproveIdea.ts`)
- Service: camelCase functions (`approveIdea`)

**Error Handling:**
- Wrap in `<ErrorBoundary>` at feature level
- Toast notifications for success/error using `useToast()` hook
- Rollback optimistic updates on failure
- Log errors to console for debugging
- Display user-friendly error messages (never expose technical details)

**Data Format:**
- Service function signature:
  ```typescript
  async function approveIdea(ideaId: string): Promise<ServiceResponse<Idea>> {
    // Update idea status to 'approved'
    // Set status_updated_at to current timestamp
    // Return updated idea
  }
  ```

- Updated Idea type includes:
  ```typescript
  {
    ...existingFields,
    status: 'approved',
    status_updated_at: string; // ISO timestamp
  }
  ```

**Supabase Query:**
```typescript
const { data, error } = await supabase
  .from('ideas')
  .update({ 
    status: 'approved', 
    status_updated_at: new Date().toISOString() 
  })
  .eq('id', ideaId)
  .eq('status', 'submitted') // Only approve if currently submitted
  .select()
  .single();
```

**RLS Policy Check:**
- Policy name: `admin_update_idea_status` (may need to be created)
- Rule: `UPDATE` permission on `ideas` table WHERE `auth.jwt() ->> 'role' = 'admin'`
- Ensure policy exists, create in database migration if needed

### Library & Framework Requirements

**Dependencies Already Installed:**
- React 19.x with TypeScript 5.x
- React Router DOM for routing
- @tanstack/react-query for data fetching and mutations
- @supabase/supabase-js for database operations
- DaisyUI 5.x for components
- Tailwind CSS 4.x for styling
- Heroicons for iconography

**No Additional Dependencies Needed**

**API Versions:**
- Supabase client: Latest stable (already configured in `lib/supabase.ts`)
- React Query v5.x patterns (already established in previous stories)

**React Query Mutation Pattern:**
```typescript
const { mutate: approveIdea, isPending } = useMutation({
  mutationFn: (ideaId: string) => adminService.approveIdea(ideaId),
  onMutate: async (ideaId) => {
    // Optimistic update
    await queryClient.cancelQueries(['admin', 'ideas']);
    const previousIdeas = queryClient.getQueryData(['admin', 'ideas']);
    
    queryClient.setQueryData(['admin', 'ideas'], (old: Idea[]) => 
      old.map(idea => 
        idea.id === ideaId 
          ? { ...idea, status: 'approved', status_updated_at: new Date().toISOString() }
          : idea
      )
    );
    
    return { previousIdeas };
  },
  onError: (error, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['admin', 'ideas'], context?.previousIdeas);
    toast.error('Failed to approve idea. Please try again.');
  },
  onSuccess: () => {
    // Invalidate all related queries
    queryClient.invalidateQueries(['admin', 'ideas']);
    queryClient.invalidateQueries(['admin', 'pipeline']);
    queryClient.invalidateQueries(['admin', 'metrics']);
    toast.success('Idea approved successfully!');
  },
});
```

### File Structure Requirements

**Files to Create:**
```
src/features/admin/
├── components/
│   ├── ApproveIdeaButton.tsx         ← Approve button with confirmation
│   ├── ApproveIdeaModal.tsx          ← Confirmation modal component
├── hooks/
│   └── useApproveIdea.ts             ← React Query mutation hook
└── services/
    └── adminService.ts               ← Extend with approveIdea function
```

**Files to Modify:**
- `src/features/ideas/components/IdeaDetailPage.tsx` - Add approve button for admins
- `src/features/admin/components/IdeaListItem.tsx` - Add inline approve action
- `src/features/admin/components/IdeaKanbanCard.tsx` - Add inline approve action
- `src/features/admin/services/adminService.ts` - Add approveIdea function

**Database Migration (if needed):**
- `supabase/migrations/000XX_add_admin_update_policy.sql` - Ensure admin UPDATE policy exists

### Testing Requirements

**Manual Testing Checklist:**
1. Login as admin → View submitted idea detail → Click "Approve for PRD" → Confirmation modal appears
2. Confirm approval → Idea status changes to "approved" with timestamp
3. Check status badge updates immediately in UI
4. Check idea creator can now see "Build PRD" button when they log in
5. Test inline approve action from All Ideas list → Status updates without leaving page
6. Test inline approve action from Pipeline kanban → Card moves to Approved column
7. Test approval notification (TODO: deferred to post-MVP)
8. Try to approve idea that's already approved → Error message shown
9. Try to approve as regular user → Should not see approve button (role check)
10. Test concurrent approvals → Should handle gracefully (one succeeds, other gets error)
11. Test with network failure → Optimistic update rolls back, error toast appears
12. Check approval timestamp displays correctly in detail view
13. Check analytics dashboard reflects approved idea in metrics

**Test Scenarios:**
- Admin approves idea → Status changes, creator can start PRD, timestamp recorded
- Admin tries to approve already-approved idea → Error: "This idea has already been reviewed"
- Two admins try to approve same idea simultaneously → One succeeds, other sees error
- Network failure during approval → Optimistic update rolls back, user can retry
- Regular user views submitted idea → No approve button visible
- Creator views their newly-approved idea → Sees "Build PRD" button, approval timestamp

**Edge Cases to Handle:**
- Idea status is not 'submitted' (e.g., already approved or rejected)
- Concurrent approvals by multiple admins
- Database connection failure during approval
- User loses admin privileges between loading page and clicking approve
- Idea is deleted while admin is viewing (very rare, but handle gracefully)

### Architectural Constraints

**Enforce PassportCard Design System:**
- Primary color: #E10514 (Passportcard red) for primary actions
- Success color: #10B981 (green) for approve button
- Danger color: #EF4444 (red) for reject button (Story 5.5)
- Border radius: 20px on all modals, buttons, cards
- Icons: Heroicons only, neutral gray (#525355) default, NEVER black (#000000)
- No emojis anywhere (replace with icons or text)
- Fonts: Montserrat (headings), Rubik (body)

**Naming Conventions:**
- Database tables: snake_case (`ideas`, `user_id`, `status_updated_at`)
- TypeScript: camelCase (functions, variables), PascalCase (components, types)
- Files: PascalCase.tsx for components, camelCase.ts for utilities
- Query keys: Array format `['admin', 'ideas', params]`

**State Management Pattern:**
- React Query for ALL server data mutations (no local state for server data)
- Mutation keys: `['approve-idea', ideaId]`
- Invalidate related queries after successful mutation
- Optimistic updates for instant UI feedback
- Rollback on failure with error notifications

**Error Pattern:**
```typescript
async function approveIdea(ideaId: string) {
  try {
    const result = await adminService.approveIdea(ideaId);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success('Idea approved successfully!');
    return result.data;
  } catch (error) {
    toast.error('Failed to approve idea');
    console.error('Approval error:', error);
    throw error;
  }
}
```

### Previous Story Intelligence

**Learnings from Story 5.1 (Admin Dashboard Layout):**
- AdminRoute component already created for role-based access control
- adminService.ts already exists with getMetrics() function
- useAdminMetrics hook pattern established for React Query
- MetricCard component created for displaying stats
- PassportCard theme integration patterns established
- RLS policy `admin_view_all_ideas` already created

**Learnings from Story 5.2 (All Ideas List):**
- getAllIdeas() function in adminService.ts with filtering and sorting
- useAllIdeas hook pattern with React Query
- IdeaListItem component for displaying idea cards
- Filter and search patterns established
- Toast notifications for success/error feedback
- Inline action patterns for quick operations
- Optimistic updates with rollback on failure
- Query cache invalidation patterns

**Learnings from Story 5.3 (Pipeline Kanban View):**
- PipelineView component with kanban board layout
- IdeaKanbanCard component for pipeline cards
- Real-time subscription patterns for instant updates
- usePipelineIdeas hook with 10-second refetch interval
- Card movement animations when status changes
- status_updated_at column for tracking status change timestamps

**Files Created in Previous Admin Stories:**
- `src/routes/AdminRoute.tsx` - Reuse for role-based access
- `src/features/admin/services/adminService.ts` - Extend with approveIdea function
- `src/features/admin/hooks/useAdminMetrics.ts` - Reference for React Query patterns
- `src/features/admin/hooks/useAllIdeas.ts` - Reference for mutation patterns
- `src/features/admin/hooks/usePipelineIdeas.ts` - Reference for real-time patterns
- `src/features/admin/components/AdminDashboard.tsx` - Navigation context
- `src/features/admin/components/IdeaListItem.tsx` - Add inline approve button here
- `src/features/admin/components/IdeaKanbanCard.tsx` - Add inline approve button here

**Code Patterns Established:**
- React Query mutations with optimistic updates
- Toast notifications for user feedback
- Confirmation modals for destructive or important actions
- Inline action buttons on list items and cards
- Query cache invalidation after mutations
- Error handling with rollback and user-friendly messages
- Real-time updates via React Query refetch intervals

**Testing Approaches:**
- Manual testing with admin and regular user accounts
- Role-based access control verification
- Error handling and retry logic testing
- Optimistic update and rollback testing
- Concurrent action testing (multiple admins)

### Project Structure Notes

**Alignment with Unified Project Structure:**
- Feature-based organization: Admin functionality isolated in `features/admin/`
- Shared UI components: Use `components/ui/` for generic components (Modal, Button, Toast)
- Service layer abstraction: All Supabase calls through `adminService.ts`
- Type safety: Define TypeScript types in `features/admin/types.ts`

**Detected Conflicts or Variances:**
- None. This story follows established architecture patterns exactly.
- Approval action mirrors reject action pattern (Story 5.5 - future)
- Inline actions follow same pattern as Story 5.2 filtering
- Confirmation modal follows modal patterns from previous stories

### References

**Technical Details from Architecture:**
- [Source: architecture.md, lines 536-551] - Admin feature structure and components
- [Source: architecture.md, lines 159-167] - Authentication and RLS policies
- [Source: architecture.md, lines 247-264] - Naming conventions (database, TypeScript, files)
- [Source: architecture.md, lines 320-347] - State management patterns with React Query
- [Source: architecture.md, lines 609-617] - Data flow and component boundaries

**Functional Requirements from PRD:**
- [Source: epics.md, lines 1127-1147] - Story 5.4 complete acceptance criteria
- [Source: epics.md, lines 1064-1066] - Epic 5 goal and user value
- [Source: epics.md, lines 69-73] - FR35-FR40: Admin dashboard and triage requirements

**User Journey from Epics:**
- [Source: epics.md, lines 176-207] - Sarah's Innovation Manager journey
- Sarah needs to efficiently triage idea submissions
- Approval workflow is critical bottleneck in innovation pipeline
- Quick approval enables ideas to progress to PRD phase
- Timestamp tracking enables time-to-decision analytics

**Database Schema:**
- Table: `ideas` with columns: `id`, `user_id`, `title`, `problem`, `solution`, `impact`, `status` (enum), `created_at`, `updated_at`, `status_updated_at`
- Table: `users` with columns: `id`, `email`, `name`, `role` (enum: 'user', 'admin')
- Enum values for status: 'submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected'
- status_updated_at column tracks when status last changed (added in Story 5.3)
- RLS policies enforcing User vs Admin access already established in Epic 1

**Design System References:**
- PassportCard primary red: #E10514
- Success green for approve: #10B981
- Border radius: 20px
- Neutral gray for icons: #525355 (NEVER use black #000000)
- No emojis anywhere in the UI
- Heroicons for all iconography
- Montserrat font (headings), Rubik font (body)

**Key Integration Points:**
- Supabase client: `src/lib/supabase.ts`
- React Query client: `src/lib/queryClient.ts`
- Toast notifications: `src/hooks/useToast.ts`
- Auth context: `src/features/auth/hooks/useAuth.ts`
- AdminRoute: `src/routes/AdminRoute.tsx` (created in Story 5.1)

### Implementation Priority

**Critical Path Items:**
1. Extend adminService with approveIdea() function (blocks all approval functionality)
2. Create useApproveIdea React Query mutation hook (blocks UI integration)
3. Create ApproveIdeaButton component with confirmation modal (blocks detail page approval)
4. Integrate ApproveIdeaButton into IdeaDetailPage (enables primary approval workflow)

**Can Be Implemented in Parallel:**
- Inline approve action in AllIdeasList (independent of detail page)
- Inline approve action in PipelineView (independent of list view)
- Approval timestamp display enhancements (independent of core approval)

**Deferred to Future Stories:**
- Email notification to idea creator (post-MVP feature, tracked as TODO)
- Activity logging for admin actions (nice-to-have, not blocking)
- Approval workflow with multiple approvers (enterprise feature)

### AI Agent Guidance

**For DEV Agent:**
- Follow architecture patterns exactly as documented
- Use feature-based structure: `features/admin/`
- All database calls through service layer (`adminService.ts`)
- All server state mutations via React Query (`useApproveIdea`)
- Implement optimistic updates for instant UI feedback
- Rollback optimistic updates on failure
- Apply PassportCard DSM consistently (no black icons, no emojis)
- Test with both admin and regular user roles
- Validate idea is in 'submitted' status before approving
- Handle concurrent approvals gracefully

**Common Pitfalls to Avoid:**
- Don't hardcode role checks in components (use AdminRoute wrapper)
- Don't mutate server data without React Query mutation hooks
- Don't forget optimistic updates (users expect instant feedback)
- Don't forget to rollback on failure (prevents stale UI)
- Don't forget to invalidate all related query caches after approval
- Don't use black icons (#000000) - use neutral gray (#525355)
- Don't add emojis anywhere (use Heroicons instead)
- Don't skip error handling (always show user-friendly messages)
- Don't approve ideas that are not in 'submitted' status
- Don't forget to update status_updated_at timestamp

**Performance Considerations:**
- Optimistic updates prevent waiting for server response
- Query cache invalidation triggers automatic refetches
- Batch cache invalidations when possible
- Use React Query's automatic retry logic for transient failures
- Debounce concurrent approval attempts from same admin

**Security Reminders:**
- RLS policies enforce admin access at database level
- Role check in AdminRoute is UI-only (database is source of truth)
- Never expose sensitive admin data to regular users
- All admin actions should include role validation on server
- Idea creator should not see approve button (admin-only action)

### Git Intelligence Summary

**Recent Development Patterns (Last 5 Commits):**
- Story 5.3 (Pipeline Kanban View) recently completed
- Story 5.2 (All Ideas List) recently completed
- Story 5.1 (Admin Dashboard Layout) recently completed
- Consistent pattern: Service layer → Hook → Component → Integration
- All stories include comprehensive inline approve/reject action patterns
- Sprint status updated after each story completion
- RLS policies created for each admin feature
- React Query patterns with optimistic updates established across admin features

**Code Patterns from Recent Commits:**
- Service functions return `ServiceResponse<T>` type
- Mutation hooks use React Query with optimistic updates and rollback
- Components use Tailwind CSS + DaisyUI for styling
- Error handling with toast notifications and rollback
- Loading states with disabled buttons and spinners
- Confirmation modals for important actions
- Comprehensive TypeScript types for all entities
- Query cache invalidation after successful mutations

**Libraries and Versions:**
- React 19.x with TypeScript 5.x
- React Query v5.x for data fetching and mutations
- Supabase client for database, auth, and real-time
- DaisyUI 5.x for UI components
- Tailwind CSS 4.x for styling
- Heroicons for iconography

**Testing Approaches:**
- Unit tests for hooks and service functions
- Manual testing with different user roles
- Error handling and retry logic testing
- Optimistic update and rollback testing
- Concurrent action testing (multiple admins)

### Latest Technical Information

**React Query v5.x Mutation Best Practices (2026):**
- Use `useMutation` with object syntax: `useMutation({ mutationFn, onMutate, onSuccess, onError })`
- Implement optimistic updates in `onMutate` for instant feedback
- Cancel ongoing queries in `onMutate` to prevent race conditions
- Return previous state from `onMutate` for rollback in `onError`
- Invalidate related queries in `onSuccess` to trigger refetches
- Use `queryClient.setQueryData` for optimistic updates
- Use `queryClient.invalidateQueries` to trigger automatic refetches

**Supabase Best Practices (2026):**
- Use `.eq()` for exact matches in WHERE clauses
- Use `.select()` with joins: `.select('*, users(name, email)')`
- Always handle `.error` from Supabase responses
- Use RLS policies for security (never rely on client-side checks alone)
- Update operations should include `.single()` if expecting one result
- Use conditional updates: `.eq('status', 'submitted')` to prevent invalid state changes

**TypeScript 5.x Patterns:**
- Use `satisfies` operator for type narrowing
- Use `const` assertions for literal types
- Use `Record<string, unknown>` for flexible objects
- Use discriminated unions for status enums
- Use `Partial<T>` for optional parameters

**DaisyUI 5.x Components:**
- Use `modal` component with `modal-open` class for visibility
- Use `btn` component with semantic color classes (`btn-success`, `btn-error`)
- Use `badge` component for status indicators
- Apply border radius with Tailwind: `rounded-[20px]`
- Use `card` component with `card-body` for structured layouts

**Accessibility Best Practices:**
- Add `aria-label` to icon-only buttons
- Add `role="dialog"` to modals
- Add `aria-modal="true"` to modals
- Ensure keyboard navigation works (Tab, Enter, Escape)
- Use semantic HTML (`<button>`, `<dialog>`)
- Add `tabindex="0"` for custom interactive elements

### Database Migration Required

**Check for Admin UPDATE RLS Policy:**
This story requires an RLS policy allowing admins to update idea status. This may have been created in Story 5.1 or 5.2, but verify it exists.

**Migration SQL (if policy doesn't exist):**
```sql
-- Allow admins to update idea status
CREATE POLICY "admin_update_idea_status"
ON ideas
FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Ensure status_updated_at column exists (added in Story 5.3)
-- This should already exist from Story 5.3, but verify:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ideas' AND column_name = 'status_updated_at'
  ) THEN
    ALTER TABLE ideas ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE;
    UPDATE ideas SET status_updated_at = created_at WHERE status_updated_at IS NULL;
  END IF;
END $$;
```

**Migration File Location:**
- `supabase/migrations/00007_admin_update_policy.sql` (if needed)

**Testing Migration:**
1. Run migration in local Supabase instance
2. Verify policy exists: Check Supabase dashboard → Authentication → Policies
3. Test admin can update idea status
4. Test regular user cannot update idea status
5. Verify status_updated_at updates automatically on status change

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 via Cursor IDE

### Debug Log References

- RED-GREEN-REFACTOR cycle followed for all tasks
- All tests passing: adminService (16/16), useApproveIdea (5/5), ApproveIdeaButton (16/16), IdeaListItem (7/7), IdeaKanbanCard (20/20), PipelineColumn (11/11), IdeaStatusInfo (7/7)
- Total admin feature tests: 168/168 passing (100%)

### Completion Notes List

**All Tasks Complete (12/12):**
- ✅ Task 1: Created `approveIdea()` function in adminService with comprehensive tests (16/16 tests passing)
- ✅ Task 2: Created `useApproveIdea` hook with optimistic updates, cache invalidation, and toast notifications (5/5 tests passing)
- ✅ Task 3: Built `ApproveIdeaButton` component with confirmation modal (DaisyUI themed, 20px border radius) (16/16 tests passing)
- ✅ Task 4: Integrated ApproveIdeaButton into IdeaDetailPage with admin role check
- ✅ Task 5: Added inline approve icon button to IdeaListItem with confirmation modal (7/7 tests passing)
- ✅ Task 6: Added inline approve icon button to IdeaKanbanCard with event propagation handling (20/20 tests passing)
- ✅ Task 7: PRD building enabled for approved ideas via IdeaDetailActions (already implemented)
- ✅ Task 8: Approval timestamp tracking and display with relative time format (7/7 tests passing)
- ✅ Task 9: Activity logging TODO comment added (activity_log table doesn't exist yet)
- ✅ Task 10: Edge case handling - already-reviewed error, concurrent approvals, validation
- ✅ Task 11: PassportCard DSM applied throughout (20px border radius, neutral gray icons, Montserrat/Rubik fonts)
- ✅ Task 12: Email notification deferred (post-MVP) with TODO comment

**Implementation Highlights:**
- Service layer handles status validation (only approves 'submitted' ideas)
- Specific error message for already-reviewed ideas: "This idea has already been reviewed"
- Optimistic updates provide instant UI feedback with automatic rollback on errors
- Modal shows idea summary: title, submitter, truncated problem statement
- Inline approve actions in list view and pipeline kanban view with icon-only buttons
- Approval timestamp displays in relative format ("2 hours ago")
- Admin-only visibility with role-based access control
- PassportCard DSM styling applied throughout (neutral gray icons #525355, 20px border radius)
- Event propagation handled correctly in kanban cards (approve click doesn't navigate)
- All 168 admin feature tests passing (100% pass rate)

### File List

**Created Files:**
- src/features/admin/hooks/useApproveIdea.ts
- src/features/admin/hooks/useApproveIdea.test.tsx
- src/features/admin/components/ApproveIdeaButton.tsx
- src/features/admin/components/ApproveIdeaButton.test.tsx
- src/features/admin/components/IdeaListItem.test.tsx
- src/features/ideas/components/IdeaStatusInfo.test.tsx

**Modified Files:**
- src/features/admin/services/adminService.ts (added approveIdea function with already-reviewed error handling, TODO for activity logging)
- src/features/admin/services/adminService.test.ts (added approveIdea tests including already-reviewed test)
- src/features/admin/components/IdeaListItem.tsx (added inline approve icon button with confirmation modal)
- src/features/admin/components/IdeaKanbanCard.tsx (added inline approve icon button with confirmation modal, converted to div to avoid nested buttons)
- src/features/admin/components/IdeaKanbanCard.test.tsx (updated tests to handle multiple buttons, added Task 6 tests)
- src/features/admin/components/AllIdeasPage.tsx (removed centralized approve modal, now handled by IdeaListItem)
- src/features/admin/components/PipelineColumn.test.tsx (added QueryClientProvider and mocks for useApproveIdea hook)
- src/features/ideas/components/IdeaStatusInfo.tsx (added approval timestamp display with relative time format)
- src/pages/IdeaDetailPage.tsx (integrated ApproveIdeaButton for admins)
- _bmad-output/implementation-artifacts/sprint-status.yaml (marked story as review)
- _bmad-output/implementation-artifacts/5-4-approve-idea-for-prd-development.md (marked all tasks complete)

## Change Log

**2026-01-27 - Story 5.4 Implementation Complete**
- Implemented approval workflow with service layer, React Query hook, and reusable button component
- Added inline approve actions in AllIdeasList and PipelineView kanban with icon-only buttons
- Integrated approval timestamp tracking and display with relative time format
- Applied PassportCard design system throughout (20px border radius, neutral gray icons #525355, Montserrat/Rubik fonts)
- Added comprehensive test coverage: 168 admin feature tests passing (100%)
- Handled edge cases: already-reviewed ideas, concurrent approvals, validation
- Added TODO comments for future enhancements: activity logging, email notifications
