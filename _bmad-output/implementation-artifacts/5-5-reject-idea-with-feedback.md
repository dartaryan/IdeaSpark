# Story 5.5: Reject Idea with Feedback

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin**,
I want **to reject ideas that aren't suitable with constructive feedback**,
So that **submitters understand why and can improve future submissions**.

## Acceptance Criteria

**Given** I am viewing a submitted idea
**When** I click "Reject"
**Then** I see a dialog prompting for rejection feedback (required, min 20 chars)
**And** I can enter constructive feedback explaining the decision
**And** upon submission, the idea status changes to "rejected"
**And** the feedback is stored with the idea

**Given** a user views their rejected idea
**When** the detail page loads
**Then** they see the rejection reason prominently displayed
**And** they can understand why the idea wasn't approved

## Tasks / Subtasks

- [x] Task 1: Extend adminService with rejectIdea() function (AC: Idea status changes to rejected)
  - [x] Subtask 1.1: Add rejectIdea(ideaId: string, feedback: string) function to adminService.ts
  - [x] Subtask 1.2: Update ideas table: SET status = 'rejected', rejection_feedback = feedback, status_updated_at = NOW()
  - [x] Subtask 1.3: Record rejection timestamp in status_updated_at column
  - [x] Subtask 1.4: Return ServiceResponse<Idea> with updated idea including feedback
  - [x] Subtask 1.5: Handle database errors gracefully with error messages

- [x] Task 2: Add rejection_feedback column to ideas table (AC: Feedback stored)
  - [x] Subtask 2.1: Create database migration: 00012_add_rejection_feedback.sql
  - [x] Subtask 2.2: Add column: rejection_feedback TEXT NULL
  - [x] Subtask 2.3: Add column: rejected_by UUID REFERENCES users(id) NULL
  - [x] Subtask 2.4: Add column: rejected_at TIMESTAMP WITH TIME ZONE NULL
  - [x] Subtask 2.5: Run migration in local Supabase instance
  - [x] Subtask 2.6: Update Idea TypeScript type to include rejection_feedback, rejected_by, rejected_at

- [x] Task 3: Create useRejectIdea React Query mutation hook (AC: Optimistic updates, real-time feedback)
  - [x] Subtask 3.1: Create useRejectIdea.ts in features/admin/hooks/
  - [x] Subtask 3.2: Implement useMutation with rejectIdea service function
  - [x] Subtask 3.3: Add onMutate for optimistic UI updates
  - [x] Subtask 3.4: Invalidate relevant React Query caches: ['admin', 'ideas'], ['admin', 'pipeline'], ['admin', 'metrics']
  - [x] Subtask 3.5: Show success toast notification on completion
  - [x] Subtask 3.6: Handle errors with rollback and error toast

- [x] Task 4: Create RejectIdeaButton component with feedback modal (AC: Feedback dialog)
  - [x] Subtask 4.1: Create RejectIdeaButton.tsx in features/admin/components/
  - [x] Subtask 4.2: Display "Reject" button with danger color styling (#EF4444)
  - [x] Subtask 4.3: Implement feedback modal with textarea for rejection reason
  - [x] Subtask 4.4: Modal content: idea title, submitter name, feedback textarea (min 20 chars, max 500)
  - [x] Subtask 4.5: Add character counter showing remaining characters (500 max)
  - [x] Subtask 4.6: Modal actions: "Confirm Rejection" (danger) and "Cancel" (secondary)
  - [x] Subtask 4.7: Validate feedback is at least 20 characters before enabling submit
  - [x] Subtask 4.8: Call useRejectIdea mutation on confirmation
  - [x] Subtask 4.9: Disable button and show loading spinner while mutation in progress
  - [x] Subtask 4.10: Close modal after successful rejection

- [x] Task 5: Integrate RejectIdeaButton into IdeaDetailPage (AC: Reject from detail view)
  - [x] Subtask 5.1: Add RejectIdeaButton to IdeaDetailPage for admin users
  - [x] Subtask 5.2: Only show button when idea status === 'submitted'
  - [x] Subtask 5.3: Position button next to ApproveIdeaButton in detail page header
  - [x] Subtask 5.4: Add role check: Only admins see reject button
  - [x] Subtask 5.5: Update UI immediately after rejection (status badge changes to red)

- [x] Task 6: Add inline reject action to AllIdeasList (AC: Reject from list view)
  - [x] Subtask 6.1: Add reject icon button to IdeaListItem component
  - [x] Subtask 6.2: Only show reject button for ideas with status='submitted'
  - [x] Subtask 6.3: Use Heroicons x-circle icon (neutral gray #525355)
  - [x] Subtask 6.4: Trigger same feedback modal as RejectIdeaButton
  - [x] Subtask 6.5: Update list item status badge immediately after rejection
  - [x] Subtask 6.6: Add aria-label for accessibility: "Reject idea with feedback"

- [x] Task 7: Add inline reject action to PipelineView kanban cards (AC: Reject from pipeline view)
  - [x] Subtask 7.1: Add reject icon button to IdeaKanbanCard component
  - [x] Subtask 7.2: Only show for cards in "Submitted" column
  - [x] Subtask 7.3: Position button in card footer next to approve button
  - [x] Subtask 7.4: Trigger feedback modal
  - [x] Subtask 7.5: Card automatically moves to "Rejected" column after rejection (real-time)
  - [x] Subtask 7.6: Add smooth animation when card moves columns

- [x] Task 8: Display rejection feedback in IdeaDetailPage (AC: User sees rejection reason)
  - [x] Subtask 8.1: Check if idea status === 'rejected' and rejection_feedback exists
  - [x] Subtask 8.2: Display rejection feedback in prominent alert box (red/warning styling)
  - [x] Subtask 8.3: Show rejection timestamp: "Rejected on {date} by {admin_name}"
  - [x] Subtask 8.4: Format feedback with proper line breaks and readability
  - [x] Subtask 8.5: Add "Learn More" section with tips for improving future submissions
  - [x] Subtask 8.6: Update idea status badge to show "rejected" with red semantic color

- [x] Task 9: Add rejection timestamp and admin tracking (AC: Timestamp recorded)
  - [x] Subtask 9.1: Add rejected_at column update in rejectIdea function
  - [x] Subtask 9.2: Add rejected_by column to track which admin rejected the idea
  - [x] Subtask 9.3: Store current timestamp when status changes to 'rejected'
  - [x] Subtask 9.4: Display rejection timestamp in idea detail view for users
  - [x] Subtask 9.5: Use relative time format: "Rejected 2 hours ago by Sarah"
  - [x] Subtask 9.6: Include rejection timestamp in analytics queries

- [x] Task 10: Add rejection action logging (AC: Admin actions logged)
  - [x] Subtask 10.1: Log rejection action to activity_log table (if exists)
  - [x] Subtask 10.2: Record: admin_user_id, idea_id, action='reject', feedback_preview, timestamp
  - [x] Subtask 10.3: If activity_log doesn't exist, add comment for future logging enhancement
  - [x] Subtask 10.4: Ensure logging doesn't block rejection if it fails (fail gracefully)

- [x] Task 11: Handle edge cases and validation (AC: Robust error handling)
  - [x] Subtask 11.1: Prevent rejecting ideas that are not in 'submitted' status
  - [x] Subtask 11.2: Show error toast: "This idea has already been reviewed"
  - [x] Subtask 11.3: Handle concurrent rejections (two admins rejecting same idea)
  - [x] Subtask 11.4: Handle database errors with user-friendly messages
  - [x] Subtask 11.5: Add optimistic update rollback if rejection fails
  - [x] Subtask 11.6: Validate user has admin role before allowing rejection
  - [x] Subtask 11.7: Validate feedback is at least 20 characters and max 500 characters
  - [x] Subtask 11.8: Sanitize feedback text to prevent XSS attacks

- [x] Task 12: Integrate PassportCard DaisyUI theme throughout (AC: Consistent branding)
  - [x] Subtask 12.1: Use DaisyUI modal component for feedback dialog
  - [x] Subtask 12.2: Apply danger red color for reject button (#EF4444)
  - [x] Subtask 12.3: Use Heroicons x-circle for reject icon (neutral gray #525355)
  - [x] Subtask 12.4: Apply 20px border radius to modal and buttons
  - [x] Subtask 12.5: Use Montserrat font for modal headings, Rubik for body
  - [x] Subtask 12.6: Apply DSM shadows and spacing tokens consistently
  - [x] Subtask 12.7: Style rejection feedback alert with red/warning DaisyUI alert component

- [x] Task 13: Add email notification for idea creator (AC: Creator notified - DEFERRED)
  - [x] Subtask 13.1: THIS TASK IS DEFERRED - Email notifications are post-MVP
  - [x] Subtask 13.2: Add TODO comment in code for future email integration
  - [x] Subtask 13.3: Rejection works without email (user sees feedback when they log in)

## Dev Notes

### Architecture Alignment

**Feature Location:**
- Service: `src/features/admin/services/adminService.ts` (extend existing)
- Hook: `src/features/admin/hooks/useRejectIdea.ts`
- Component: `src/features/admin/components/RejectIdeaButton.tsx`
- Modal: `src/features/admin/components/RejectIdeaModal.tsx`

**Integration Points:**
- IdeaDetailPage: `src/features/ideas/components/IdeaDetailPage.tsx` (add reject button for admins, display rejection feedback for users)
- AllIdeasPage: `src/features/admin/components/IdeaListItem.tsx` (add inline reject action)
- PipelineView: `src/features/admin/components/IdeaKanbanCard.tsx` (add inline reject action)

**Database Operation:**
- Table: `ideas`
- Update: `SET status = 'rejected', rejection_feedback = {feedback}, rejected_at = NOW(), rejected_by = {admin_id}, status_updated_at = NOW() WHERE id = {ideaId} AND status = 'submitted'`
- RLS policy: Admin role required for UPDATE operation on ideas table (already exists from Story 5.4)

**State Management:**
- React Query mutation: `useMutation` for rejectIdea action
- Invalidate caches: `['admin', 'ideas']`, `['admin', 'pipeline']`, `['admin', 'metrics']`, `['ideas', 'list', userId]`
- Optimistic updates: Update UI immediately, rollback on failure
- Local state: Modal open/close state, feedback text (useState)

**UI Components:**
- DaisyUI components: `modal`, `btn`, `badge`, `card`, `alert`, `textarea`
- Heroicons: `x-circle` for reject action
- Colors: Danger red (#EF4444) for reject button, neutral gray (#525355) for icons
- Animations: Smooth status badge transitions, card movement in kanban

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/admin/`
- Naming: PascalCase for components (`RejectIdeaButton.tsx`)
- Hooks: `use` prefix + camelCase (`useRejectIdea.ts`)
- Service: camelCase functions (`rejectIdea`)

**Error Handling:**
- Wrap in `<ErrorBoundary>` at feature level
- Toast notifications for success/error using `useToast()` hook
- Rollback optimistic updates on failure
- Log errors to console for debugging
- Display user-friendly error messages (never expose technical details)

**Data Format:**
- Service function signature:
  ```typescript
  async function rejectIdea(ideaId: string, feedback: string): Promise<ServiceResponse<Idea>> {
    // Validate feedback length (min 20, max 500 chars)
    // Update idea status to 'rejected'
    // Set rejection_feedback, rejected_at, rejected_by, status_updated_at
    // Return updated idea
  }
  ```

- Updated Idea type includes:
  ```typescript
  {
    ...existingFields,
    status: 'rejected',
    rejection_feedback: string | null;
    rejected_at: string | null; // ISO timestamp
    rejected_by: string | null; // admin user ID
    status_updated_at: string; // ISO timestamp
  }
  ```

**Supabase Query:**
```typescript
const { data: { user } } = await supabase.auth.getUser();

const { data, error } = await supabase
  .from('ideas')
  .update({ 
    status: 'rejected', 
    rejection_feedback: feedback,
    rejected_at: new Date().toISOString(),
    rejected_by: user.id,
    status_updated_at: new Date().toISOString() 
  })
  .eq('id', ideaId)
  .eq('status', 'submitted') // Only reject if currently submitted
  .select()
  .single();
```

**RLS Policy Check:**
- Policy name: `admin_update_idea_status` (already created in Story 5.4)
- Rule: `UPDATE` permission on `ideas` table WHERE `auth.jwt() ->> 'role' = 'admin'`
- Policy already exists, no new migration needed for RLS

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
const { mutate: rejectIdea, isPending } = useMutation({
  mutationFn: ({ ideaId, feedback }: { ideaId: string; feedback: string }) => 
    adminService.rejectIdea(ideaId, feedback),
  onMutate: async ({ ideaId, feedback }) => {
    // Optimistic update
    await queryClient.cancelQueries(['admin', 'ideas']);
    const previousIdeas = queryClient.getQueryData(['admin', 'ideas']);
    
    queryClient.setQueryData(['admin', 'ideas'], (old: Idea[]) => 
      old.map(idea => 
        idea.id === ideaId 
          ? { 
              ...idea, 
              status: 'rejected', 
              rejection_feedback: feedback,
              rejected_at: new Date().toISOString(),
              status_updated_at: new Date().toISOString()
            }
          : idea
      )
    );
    
    return { previousIdeas };
  },
  onError: (error, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['admin', 'ideas'], context?.previousIdeas);
    toast.error('Failed to reject idea. Please try again.');
  },
  onSuccess: () => {
    // Invalidate all related queries
    queryClient.invalidateQueries(['admin', 'ideas']);
    queryClient.invalidateQueries(['admin', 'pipeline']);
    queryClient.invalidateQueries(['admin', 'metrics']);
    toast.success('Idea rejected with feedback sent.');
  },
});
```

### File Structure Requirements

**Files to Create:**
```
src/features/admin/
├── components/
│   ├── RejectIdeaButton.tsx         ← Reject button with feedback modal
│   ├── RejectIdeaModal.tsx          ← Feedback modal component
├── hooks/
│   └── useRejectIdea.ts             ← React Query mutation hook
└── services/
    └── adminService.ts              ← Extend with rejectIdea function

supabase/migrations/
└── 00008_add_rejection_feedback.sql ← Add rejection_feedback columns
```

**Files to Modify:**
- `src/features/ideas/components/IdeaDetailPage.tsx` - Add reject button for admins, display rejection feedback
- `src/features/admin/components/IdeaListItem.tsx` - Add inline reject action
- `src/features/admin/components/IdeaKanbanCard.tsx` - Add inline reject action
- `src/features/admin/services/adminService.ts` - Add rejectIdea function
- `src/features/ideas/types.ts` - Add rejection_feedback, rejected_at, rejected_by to Idea type

**Database Migration:**
- `supabase/migrations/00008_add_rejection_feedback.sql` - Add rejection tracking columns

### Testing Requirements

**Manual Testing Checklist:**
1. Login as admin → View submitted idea detail → Click "Reject" → Feedback modal appears
2. Try to submit with < 20 chars → Validation error shown
3. Enter valid feedback (20-500 chars) → Confirm rejection → Idea status changes to "rejected"
4. Check status badge updates immediately in UI (red "Rejected")
5. Login as idea creator → View rejected idea → See rejection feedback prominently displayed
6. Check rejection timestamp displays correctly: "Rejected on {date} by {admin_name}"
7. Test inline reject action from All Ideas list → Feedback modal appears, status updates without leaving page
8. Test inline reject action from Pipeline kanban → Card moves to Rejected column (if exists) or disappears
9. Try to reject idea that's already rejected → Error message shown
10. Try to reject as regular user → Should not see reject button (role check)
11. Test concurrent rejections → Should handle gracefully (one succeeds, other gets error)
12. Test with network failure → Optimistic update rolls back, error toast appears
13. Check analytics dashboard reflects rejected idea in metrics
14. Test feedback character counter → Shows remaining characters correctly
15. Test feedback with special characters → Sanitized correctly, no XSS

**Test Scenarios:**
- Admin rejects idea with valid feedback → Status changes, creator sees feedback, timestamp recorded
- Admin tries to reject already-rejected idea → Error: "This idea has already been reviewed"
- Two admins try to reject same idea simultaneously → One succeeds, other sees error
- Network failure during rejection → Optimistic update rolls back, user can retry
- Regular user views submitted idea → No reject button visible
- Creator views their newly-rejected idea → Sees rejection feedback, rejection timestamp
- Admin enters feedback < 20 chars → Submit button disabled, validation message shown
- Admin enters feedback > 500 chars → Character counter shows red, validation message shown

**Edge Cases to Handle:**
- Idea status is not 'submitted' (e.g., already approved or rejected)
- Concurrent rejections by multiple admins
- Database connection failure during rejection
- User loses admin privileges between loading page and clicking reject
- Idea is deleted while admin is viewing (very rare, but handle gracefully)
- Feedback contains HTML/script tags (sanitize to prevent XSS)
- Feedback is exactly 20 or 500 characters (boundary testing)
- Very long feedback with no spaces (test text wrapping)

### Architectural Constraints

**Enforce PassportCard Design System:**
- Primary color: #E10514 (Passportcard red) for primary actions
- Success color: #10B981 (green) for approve button (Story 5.4)
- Danger color: #EF4444 (red) for reject button
- Warning color: #F59E0B (amber) for rejection feedback alert
- Border radius: 20px on all modals, buttons, cards
- Icons: Heroicons only, neutral gray (#525355) default, NEVER black (#000000)
- No emojis anywhere (replace with icons or text)
- Fonts: Montserrat (headings), Rubik (body)

**Naming Conventions:**
- Database tables: snake_case (`ideas`, `user_id`, `rejection_feedback`)
- TypeScript: camelCase (functions, variables), PascalCase (components, types)
- Files: PascalCase.tsx for components, camelCase.ts for utilities
- Query keys: Array format `['admin', 'ideas', params]`

**State Management Pattern:**
- React Query for ALL server data mutations (no local state for server data)
- Mutation keys: `['reject-idea', ideaId]`
- Invalidate related queries after successful mutation
- Optimistic updates for instant UI feedback
- Rollback on failure with error notifications

**Error Pattern:**
```typescript
async function rejectIdea(ideaId: string, feedback: string) {
  // Validate feedback length
  if (feedback.length < 20) {
    toast.error('Feedback must be at least 20 characters');
    return;
  }
  if (feedback.length > 500) {
    toast.error('Feedback must be less than 500 characters');
    return;
  }
  
  try {
    const result = await adminService.rejectIdea(ideaId, feedback);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success('Idea rejected with feedback sent');
    return result.data;
  } catch (error) {
    toast.error('Failed to reject idea');
    console.error('Rejection error:', error);
    throw error;
  }
}
```

### Previous Story Intelligence

**Learnings from Story 5.4 (Approve Idea for PRD Development):**
- adminService.ts already has approveIdea() function - mirror pattern for rejectIdea()
- useApproveIdea hook pattern established for React Query mutations
- ApproveIdeaButton component pattern with confirmation modal
- Inline action buttons already integrated in IdeaListItem and IdeaKanbanCard
- Optimistic updates with rollback on failure pattern established
- Toast notifications for success/error feedback
- Query cache invalidation patterns: ['admin', 'ideas'], ['admin', 'pipeline'], ['admin', 'metrics']
- RLS policy `admin_update_idea_status` already created
- status_updated_at column already exists and is updated on status changes

**Key Differences from Story 5.4:**
- Rejection requires feedback input (modal with textarea vs simple confirmation)
- Rejection feedback must be stored and displayed to idea creator
- Need additional columns: rejection_feedback, rejected_at, rejected_by
- Feedback validation: min 20 chars, max 500 chars
- Character counter in modal for user guidance
- Rejection feedback displayed prominently in IdeaDetailPage for creators
- Different color scheme: danger red (#EF4444) vs success green (#10B981)
- Different icon: x-circle vs check-circle

**Files Created in Story 5.4 (Reuse Patterns):**
- `src/features/admin/services/adminService.ts` - Extend with rejectIdea function
- `src/features/admin/hooks/useApproveIdea.ts` - Reference for useRejectIdea pattern
- `src/features/admin/components/ApproveIdeaButton.tsx` - Reference for RejectIdeaButton pattern
- `src/features/admin/components/IdeaListItem.tsx` - Add inline reject button here
- `src/features/admin/components/IdeaKanbanCard.tsx` - Add inline reject button here

**Code Patterns Established:**
- React Query mutations with optimistic updates
- Toast notifications for user feedback
- Confirmation/input modals for important actions
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
- Validation testing (min/max character limits)

### Project Structure Notes

**Alignment with Unified Project Structure:**
- Feature-based organization: Admin functionality isolated in `features/admin/`
- Shared UI components: Use `components/ui/` for generic components (Modal, Button, Toast, Textarea)
- Service layer abstraction: All Supabase calls through `adminService.ts`
- Type safety: Define TypeScript types in `features/admin/types.ts` and `features/ideas/types.ts`

**Detected Conflicts or Variances:**
- None. This story follows established architecture patterns exactly.
- Rejection action mirrors approval action pattern (Story 5.4)
- Inline actions follow same pattern as Story 5.2 filtering
- Feedback modal follows modal patterns from previous stories
- Additional complexity: feedback input validation and display

### References

**Technical Details from Architecture:**
- [Source: architecture.md, lines 536-551] - Admin feature structure and components
- [Source: architecture.md, lines 159-167] - Authentication and RLS policies
- [Source: architecture.md, lines 247-264] - Naming conventions (database, TypeScript, files)
- [Source: architecture.md, lines 320-347] - State management patterns with React Query
- [Source: architecture.md, lines 609-617] - Data flow and component boundaries

**Functional Requirements from PRD:**
- [Source: epics.md, lines 1150-1169] - Story 5.5 complete acceptance criteria
- [Source: epics.md, lines 1064-1066] - Epic 5 goal and user value
- [Source: epics.md, lines 69-73] - FR35-FR40: Admin dashboard and triage requirements
- [Source: prd.md, lines 176-207] - Sarah's Innovation Manager journey
- Rejection with feedback is critical for idea submitter learning and improvement

**User Journey from Epics:**
- [Source: epics.md, lines 176-207] - Sarah's Innovation Manager journey
- Sarah needs to efficiently triage idea submissions with constructive feedback
- Rejection workflow must include clear, actionable feedback for submitters
- Feedback helps employees understand why ideas weren't approved
- Constructive feedback improves future submission quality
- Timestamp tracking enables rejection rate analytics

**Database Schema:**
- Table: `ideas` with columns: `id`, `user_id`, `title`, `problem`, `solution`, `impact`, `status` (enum), `created_at`, `updated_at`, `status_updated_at`
- NEW columns: `rejection_feedback` TEXT NULL, `rejected_at` TIMESTAMP WITH TIME ZONE NULL, `rejected_by` UUID REFERENCES users(id) NULL
- Table: `users` with columns: `id`, `email`, `name`, `role` (enum: 'user', 'admin')
- Enum values for status: 'submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected'
- status_updated_at column tracks when status last changed (added in Story 5.3)
- RLS policies enforcing User vs Admin access already established in Epic 1

**Design System References:**
- PassportCard primary red: #E10514
- Danger red for reject: #EF4444
- Warning amber for rejection alert: #F59E0B
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
1. Add rejection_feedback columns to ideas table (blocks all rejection functionality)
2. Extend adminService with rejectIdea() function (blocks rejection logic)
3. Create useRejectIdea React Query mutation hook (blocks UI integration)
4. Create RejectIdeaButton component with feedback modal (blocks detail page rejection)
5. Integrate RejectIdeaButton into IdeaDetailPage (enables primary rejection workflow)
6. Display rejection feedback in IdeaDetailPage (enables user feedback visibility)

**Can Be Implemented in Parallel:**
- Inline reject action in AllIdeasList (independent of detail page)
- Inline reject action in PipelineView (independent of list view)
- Rejection timestamp display enhancements (independent of core rejection)

**Deferred to Future Stories:**
- Email notification to idea creator (post-MVP feature, tracked as TODO)
- Activity logging for admin actions (nice-to-have, not blocking)
- Rejection appeal workflow (enterprise feature)
- Rejection reason categories/templates (UX enhancement)

### AI Agent Guidance

**For DEV Agent:**
- Follow architecture patterns exactly as documented
- Use feature-based structure: `features/admin/`
- All database calls through service layer (`adminService.ts`)
- All server state mutations via React Query (`useRejectIdea`)
- Implement optimistic updates for instant UI feedback
- Rollback optimistic updates on failure
- Apply PassportCard DSM consistently (no black icons, no emojis)
- Test with both admin and regular user roles
- Validate idea is in 'submitted' status before rejecting
- Handle concurrent rejections gracefully
- Validate feedback length (min 20, max 500 chars)
- Sanitize feedback to prevent XSS attacks
- Display rejection feedback prominently for idea creators

**Common Pitfalls to Avoid:**
- Don't hardcode role checks in components (use AdminRoute wrapper)
- Don't mutate server data without React Query mutation hooks
- Don't forget optimistic updates (users expect instant feedback)
- Don't forget to rollback on failure (prevents stale UI)
- Don't forget to invalidate all related query caches after rejection
- Don't use black icons (#000000) - use neutral gray (#525355)
- Don't add emojis anywhere (use Heroicons instead)
- Don't skip error handling (always show user-friendly messages)
- Don't reject ideas that are not in 'submitted' status
- Don't forget to update status_updated_at timestamp
- Don't forget to validate feedback length (min 20, max 500)
- Don't forget to sanitize feedback text (prevent XSS)
- Don't forget to display rejection feedback to idea creators

**Performance Considerations:**
- Optimistic updates prevent waiting for server response
- Query cache invalidation triggers automatic refetches
- Batch cache invalidations when possible
- Use React Query's automatic retry logic for transient failures
- Debounce concurrent rejection attempts from same admin

**Security Reminders:**
- RLS policies enforce admin access at database level
- Role check in AdminRoute is UI-only (database is source of truth)
- Never expose sensitive admin data to regular users
- All admin actions should include role validation on server
- Idea creator should not see reject button (admin-only action)
- Sanitize feedback text to prevent XSS attacks
- Validate feedback length on both client and server

### Git Intelligence Summary

**Recent Development Patterns (Last 5 Commits):**
- Story 3.4 (Chat Interface with AI Assistant) recently completed
- Stories 3.1, 3.2, 3.3 (PRD database, builder layout, Gemini edge function) completed
- Story 2.9 (Idea Detail View) recently completed
- Story 4.2, 4.3 (Prototype generation) recently completed
- Story 2.7 (Submit Idea) recently completed
- Consistent pattern: Service layer → Hook → Component → Integration
- All stories include comprehensive testing with high pass rates
- Sprint status updated after each story completion
- RLS policies created for each feature
- React Query patterns with optimistic updates established across features

**Code Patterns from Recent Commits:**
- Service functions return `ServiceResponse<T>` type
- Mutation hooks use React Query with optimistic updates and rollback
- Components use Tailwind CSS + DaisyUI for styling
- Error handling with toast notifications and rollback
- Loading states with disabled buttons and spinners
- Confirmation/input modals for important actions
- Comprehensive TypeScript types for all entities
- Query cache invalidation after successful mutations
- Unit tests for hooks, services, and components

**Libraries and Versions:**
- React 19.x with TypeScript 5.x
- React Query v5.x for data fetching and mutations
- Supabase client for database, auth, and real-time
- DaisyUI 5.x for UI components
- Tailwind CSS 4.x for styling
- Heroicons for iconography

**Testing Approaches:**
- Unit tests for hooks and service functions
- Component tests with React Testing Library
- Manual testing with different user roles
- Error handling and retry logic testing
- Optimistic update and rollback testing
- Concurrent action testing (multiple admins)
- Validation testing (boundary cases)

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
- Get current user with `await supabase.auth.getUser()` for tracking admin actions

**TypeScript 5.x Patterns:**
- Use `satisfies` operator for type narrowing
- Use `const` assertions for literal types
- Use `Record<string, unknown>` for flexible objects
- Use discriminated unions for status enums
- Use `Partial<T>` for optional parameters
- Use `Pick<T, K>` and `Omit<T, K>` for type transformations

**DaisyUI 5.x Components:**
- Use `modal` component with `modal-open` class for visibility
- Use `btn` component with semantic color classes (`btn-success`, `btn-error`)
- Use `badge` component for status indicators
- Use `alert` component for rejection feedback display
- Use `textarea` component with character counter
- Apply border radius with Tailwind: `rounded-[20px]`
- Use `card` component with `card-body` for structured layouts

**Accessibility Best Practices:**
- Add `aria-label` to icon-only buttons
- Add `role="dialog"` to modals
- Add `aria-modal="true"` to modals
- Ensure keyboard navigation works (Tab, Enter, Escape)
- Use semantic HTML (`<button>`, `<dialog>`, `<textarea>`)
- Add `tabindex="0"` for custom interactive elements
- Add `aria-describedby` for character counter
- Add `aria-invalid` for validation errors

**XSS Prevention:**
- Sanitize all user-generated content before display
- Use React's built-in XSS protection (automatic escaping)
- Never use `dangerouslySetInnerHTML` with user content
- Validate and sanitize feedback text on server side
- Use Zod schema validation for input sanitization
- Escape HTML entities in feedback text

### Database Migration Required

**Add Rejection Feedback Columns:**
This story requires new columns to store rejection feedback and metadata.

**Migration SQL:**
```sql
-- Add rejection feedback columns to ideas table
-- File: supabase/migrations/00008_add_rejection_feedback.sql

-- Add rejection_feedback column to store admin feedback
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS rejection_feedback TEXT NULL;

-- Add rejected_at column to track rejection timestamp
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE NULL;

-- Add rejected_by column to track which admin rejected the idea
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id) NULL;

-- Add comment for documentation
COMMENT ON COLUMN ideas.rejection_feedback IS 'Constructive feedback from admin explaining why idea was rejected (min 20, max 500 chars)';
COMMENT ON COLUMN ideas.rejected_at IS 'Timestamp when idea was rejected';
COMMENT ON COLUMN ideas.rejected_by IS 'User ID of admin who rejected the idea';

-- Create index for querying rejected ideas by admin
CREATE INDEX IF NOT EXISTS idx_ideas_rejected_by ON ideas(rejected_by) WHERE rejected_by IS NOT NULL;

-- Create index for querying rejected ideas by timestamp
CREATE INDEX IF NOT EXISTS idx_ideas_rejected_at ON ideas(rejected_at) WHERE rejected_at IS NOT NULL;
```

**Migration File Location:**
- `supabase/migrations/00008_add_rejection_feedback.sql`

**Testing Migration:**
1. Run migration in local Supabase instance: `supabase migration up`
2. Verify columns exist: Check Supabase dashboard → Database → Tables → ideas
3. Test admin can update rejection_feedback column
4. Test regular user cannot update rejection_feedback column (RLS enforcement)
5. Verify indexes created successfully
6. Test query performance for rejected ideas

**TypeScript Type Update:**
```typescript
// Update Idea type in src/features/ideas/types.ts
export interface Idea {
  id: string;
  user_id: string;
  title: string;
  problem: string;
  solution: string;
  impact: string;
  enhanced_problem?: string;
  enhanced_solution?: string;
  enhanced_impact?: string;
  status: 'submitted' | 'approved' | 'prd_development' | 'prototype_complete' | 'rejected';
  created_at: string;
  updated_at: string;
  status_updated_at: string;
  rejection_feedback?: string | null; // NEW
  rejected_at?: string | null;        // NEW
  rejected_by?: string | null;        // NEW
}
```

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (via Cursor IDE)

### Debug Log References

- All 213 admin feature tests pass
- Pre-existing test failures in geminiService.test.ts and PrdBuilder components (unrelated to this story)

### Completion Notes List

- Implemented complete rejection workflow with feedback modal
- Added database migration for rejection tracking columns (00012_add_rejection_feedback.sql)
- Extended adminService with rejectIdea() function including XSS sanitization and validation
- Created useRejectIdea React Query mutation hook with optimistic updates and rollback
- Created RejectIdeaButton and RejectIdeaModal components with PassportCard theme
- Integrated reject functionality into IdeaDetailPage, IdeaListItem, and IdeaKanbanCard
- Added rejection feedback display with relative timestamps and tips for future submissions
- Activity logging deferred (TODO comment added) as activity_log table doesn't exist
- Email notification deferred as per story requirements (post-MVP feature)

### File List

**Files Created:**
- supabase/migrations/00012_add_rejection_feedback.sql
- src/features/admin/hooks/useRejectIdea.ts
- src/features/admin/hooks/useRejectIdea.test.tsx
- src/features/admin/components/RejectIdeaButton.tsx
- src/features/admin/components/RejectIdeaButton.test.tsx
- src/features/admin/components/RejectIdeaModal.tsx

**Files Modified:**
- src/types/database.ts (added rejection fields to Idea type)
- src/features/admin/types.ts (added rejection fields to IdeaWithSubmitter)
- src/features/admin/services/adminService.ts (added rejectIdea function)
- src/features/admin/services/adminService.test.ts (added rejectIdea tests)
- src/features/admin/components/IdeaListItem.tsx (integrated RejectIdeaButton)
- src/features/admin/components/IdeaListItem.test.tsx (updated tests)
- src/features/admin/components/IdeaKanbanCard.tsx (integrated RejectIdeaButton)
- src/features/admin/components/IdeaKanbanCard.test.tsx (updated tests)
- src/features/admin/components/AllIdeasPage.tsx (removed deprecated reject modal)
- src/features/admin/components/PipelineColumn.test.tsx (added useRejectIdea mock)
- src/pages/IdeaDetailPage.tsx (added RejectIdeaButton and rejection feedback display)

### Change Log

- 2026-01-27: Story 5.5 implementation complete - Reject Idea with Feedback functionality
  - Database migration for rejection_feedback, rejected_at, rejected_by columns
  - Admin service extended with rejectIdea() function
  - React Query mutation hook with optimistic updates
  - RejectIdeaButton and RejectIdeaModal components
  - Integration into IdeaDetailPage, IdeaListItem, IdeaKanbanCard
  - Rejection feedback display for rejected ideas
  - 213 admin feature tests passing
