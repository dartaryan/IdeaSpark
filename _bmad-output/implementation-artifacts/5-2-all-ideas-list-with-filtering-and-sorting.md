# Story 5.2: All Ideas List with Filtering and Sorting

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin**,
I want **to view all ideas submitted by all users with filtering options**,
So that **I can efficiently find and manage ideas**.

## Acceptance Criteria

**Given** I am on the Admin Dashboard
**When** I navigate to "All Ideas"
**Then** I see a list of all ideas from all users
**And** each idea shows: title, submitter name, status, submission date
**And** I can filter by status (submitted, approved, prd_development, prototype_complete, rejected)
**And** I can sort by date (newest/oldest) or status
**And** I can search by keyword in the idea title/problem

**Given** I apply filters
**When** the list updates
**Then** only matching ideas are shown
**And** I can clear filters to see all ideas again

## Tasks / Subtasks

- [ ] Task 1: Create AllIdeasPage component with layout structure (AC: List of all ideas)
  - [ ] Subtask 1.1: Create AllIdeasPage.tsx in features/admin/components/
  - [ ] Subtask 1.2: Implement page header with "All Ideas" title and count badge
  - [ ] Subtask 1.3: Add responsive grid layout for filters and list
  - [ ] Subtask 1.4: Add route definition for /admin/ideas

- [ ] Task 2: Create IdeaFilters component with filter controls (AC: Filter by status, sort, search)
  - [ ] Subtask 2.1: Create IdeaFilters.tsx component
  - [ ] Subtask 2.2: Implement status filter dropdown (all, submitted, approved, prd_development, prototype_complete, rejected)
  - [ ] Subtask 2.3: Implement sort dropdown (newest, oldest, status)
  - [ ] Subtask 2.4: Implement search input with debounce (300ms)
  - [ ] Subtask 2.5: Add "Clear Filters" button that resets all filters

- [ ] Task 3: Create IdeaListItem component for individual idea display (AC: Show title, submitter, status, date)
  - [ ] Subtask 3.1: Create IdeaListItem.tsx component
  - [ ] Subtask 3.2: Display idea title (truncated to 80 chars with ellipsis)
  - [ ] Subtask 3.3: Display submitter name fetched from users table via user_id
  - [ ] Subtask 3.4: Display status badge with semantic colors (gray=submitted, blue=approved, yellow=prd_development, green=prototype_complete, red=rejected)
  - [ ] Subtask 3.5: Display submission date formatted as relative time (e.g., "2 days ago")
  - [ ] Subtask 3.6: Add "View Details" link navigating to idea detail page
  - [ ] Subtask 3.7: Add quick action buttons: "Approve" and "Reject" (inline actions)

- [ ] Task 4: Extend adminService to fetch all ideas with filters (AC: Query all ideas with filtering)
  - [ ] Subtask 4.1: Implement getAllIdeas() function in adminService.ts
  - [ ] Subtask 4.2: Accept parameters: statusFilter, sortBy, searchQuery
  - [ ] Subtask 4.3: Build Supabase query with .select() joining users table for submitter name
  - [ ] Subtask 4.4: Apply status filter if provided (WHERE status = ?)
  - [ ] Subtask 4.5: Apply search filter on title and problem columns (ILIKE %query%)
  - [ ] Subtask 4.6: Apply sort order (created_at DESC/ASC or status alphabetical)
  - [ ] Subtask 4.7: Return paginated results (limit 50 per page initially, pagination for future)

- [ ] Task 5: Create useAllIdeas hook with React Query (AC: Real-time data updates)
  - [ ] Subtask 5.1: Create useAllIdeas.ts in features/admin/hooks/
  - [ ] Subtask 5.2: Accept filter parameters: statusFilter, sortBy, searchQuery
  - [ ] Subtask 5.3: Implement React Query with query key: ['admin', 'ideas', filters]
  - [ ] Subtask 5.4: Add refetch interval (30 seconds) for real-time updates
  - [ ] Subtask 5.5: Handle loading, error, and empty states
  - [ ] Subtask 5.6: Implement optimistic updates for approve/reject actions

- [ ] Task 6: Implement inline approve/reject actions (AC: Quick actions from list)
  - [ ] Subtask 6.1: Create useApproveIdea hook for approve action
  - [ ] Subtask 6.2: Create useRejectIdea hook for reject action
  - [ ] Subtask 6.3: Add confirmation modal for approve action
  - [ ] Subtask 6.4: Add rejection feedback modal (required, min 20 chars)
  - [ ] Subtask 6.5: Update idea status in database via adminService
  - [ ] Subtask 6.6: Invalidate React Query cache to refresh list
  - [ ] Subtask 6.7: Show success toast after action completes

- [ ] Task 7: Implement empty state and loading states (AC: User feedback)
  - [ ] Subtask 7.1: Create EmptyState component for "No ideas found"
  - [ ] Subtask 7.2: Show empty state when no ideas match filters
  - [ ] Subtask 7.3: Create IdeaListSkeleton component for loading state
  - [ ] Subtask 7.4: Show skeleton loaders while data fetches
  - [ ] Subtask 7.5: Show error message if query fails with retry button

- [ ] Task 8: Integrate PassportCard DaisyUI theme throughout (AC: Consistent branding)
  - [ ] Subtask 8.1: Use DaisyUI table or card components for list layout
  - [ ] Subtask 8.2: Apply primary red (#E10514) for active filters and buttons
  - [ ] Subtask 8.3: Use neutral gray (#525355) for icons (NEVER black #000000)
  - [ ] Subtask 8.4: Apply Montserrat font for headings, Rubik for body
  - [ ] Subtask 8.5: Use 20px border radius on cards and modals
  - [ ] Subtask 8.6: Apply DSM shadows and spacing tokens

## Dev Notes

### Architecture Alignment

**Feature Location:**
- Component: `src/features/admin/components/AllIdeasPage.tsx`
- Filters: `src/features/admin/components/IdeaFilters.tsx`
- List Item: `src/features/admin/components/IdeaListItem.tsx`
- Service: `src/features/admin/services/adminService.ts` (extend existing)
- Hooks: `src/features/admin/hooks/useAllIdeas.ts`, `useApproveIdea.ts`, `useRejectIdea.ts`

**Database Query:**
- Query `ideas` table with JOIN to `users` table for submitter name
- Filter by `status` column (enum: submitted, approved, prd_development, prototype_complete, rejected)
- Search in `title` and `problem` columns using ILIKE
- Sort by `created_at` DESC/ASC or `status` alphabetically
- Use Supabase RLS policies to enforce admin-only access

**State Management:**
- React Query for server state (`useAllIdeas`, `useApproveIdea`, `useRejectIdea`)
- Query key pattern: `['admin', 'ideas', { statusFilter, sortBy, searchQuery }]`
- Refetch interval: 30 seconds for real-time feel
- Local state for filter UI (useState for statusFilter, sortBy, searchQuery)
- Debounce search input to prevent excessive queries

**UI Components:**
- Use DaisyUI components: `table`, `badge`, `select`, `input`, `btn`, `modal`
- Layout: Filters at top, list below in responsive grid/table
- Responsive: Stack filters vertically on mobile, horizontal on desktop
- Status badges with semantic colors matching design system

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/admin/`
- Naming: PascalCase for components (`AllIdeasPage.tsx`, `IdeaFilters.tsx`)
- Hooks: `use` prefix + camelCase (`useAllIdeas.ts`, `useApproveIdea.ts`)
- Service: camelCase functions (`getAllIdeas`, `approveIdea`, `rejectIdea`)

**Error Handling:**
- Wrap in `<ErrorBoundary>` at feature level
- Toast notifications for errors using `useToast()` hook
- Display inline error message if ideas fail to load
- Retry button for failed queries
- Graceful degradation: Show empty state if data unavailable

**Data Format:**
- Service returns: `ServiceResponse<Idea[]>`
- Idea type (extended with submitter info):
  ```typescript
  {
    id: string;
    user_id: string;
    title: string;
    problem: string;
    solution: string;
    impact: string;
    status: 'submitted' | 'approved' | 'prd_development' | 'prototype_complete' | 'rejected';
    created_at: string;
    updated_at: string;
    submitter_name: string; // Joined from users table
    submitter_email: string; // Joined from users table
  }
  ```

**Supabase RLS Policy:**
- Policy name: `admin_view_all_ideas` (already exists from Story 5.1)
- Rule: `SELECT` permission on `ideas` table WHERE `auth.jwt() ->> 'role' = 'admin'`
- Apply to all admin queries

**Filter Implementation:**
- Status filter: Dropdown with "All" option + enum values
- Sort: Dropdown with "Newest", "Oldest", "Status" options
- Search: Text input with debounce (300ms) to prevent excessive queries
- Clear filters: Reset all filters to default (all statuses, newest first, empty search)

### Library & Framework Requirements

**Dependencies Already Installed:**
- React 19.x with TypeScript 5.x
- React Router DOM for routing
- @tanstack/react-query for data fetching
- @supabase/supabase-js for database
- DaisyUI 5.x for components
- Tailwind CSS 4.x for styling
- lodash.debounce or use-debounce for search debouncing

**No Additional Dependencies Needed**

**API Versions:**
- Supabase client: Latest stable (already configured in `lib/supabase.ts`)
- React Query v5.x patterns (already established in previous stories)

**Debounce Implementation:**
- Use `useMemo` + `useCallback` pattern or `use-debounce` library
- Debounce search input to 300ms to balance responsiveness and performance
- Example pattern from existing codebase:
  ```typescript
  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  );
  ```

### File Structure Requirements

**Files to Create:**
```
src/features/admin/
├── components/
│   ├── AllIdeasPage.tsx              ← Main all ideas page
│   ├── IdeaFilters.tsx               ← Filter controls component
│   ├── IdeaListItem.tsx              ← Individual idea list item
│   └── IdeaListSkeleton.tsx          ← Loading skeleton
├── hooks/
│   ├── useAllIdeas.ts                ← React Query hook for all ideas
│   ├── useApproveIdea.ts             ← Hook for approve action
│   └── useRejectIdea.ts              ← Hook for reject action
├── services/
│   └── adminService.ts               ← Extend with getAllIdeas, approveIdea, rejectIdea
└── types.ts                          ← Extend with filter types
```

**Files to Modify:**
- `src/routes/index.tsx` - Add /admin/ideas route
- `src/features/admin/components/AdminDashboard.tsx` - Add "View All Ideas" link
- `src/features/admin/services/adminService.ts` - Add new functions

### Testing Requirements

**Manual Testing Checklist:**
1. Login as admin → Navigate to /admin/ideas → All ideas list loads successfully
2. Check each idea shows: title, submitter name, status badge, submission date
3. Filter by status "submitted" → Only submitted ideas shown
4. Filter by status "approved" → Only approved ideas shown
5. Sort by "Oldest" → Ideas sorted by created_at ASC
6. Sort by "Status" → Ideas sorted alphabetically by status
7. Search for keyword → Only matching ideas shown (title or problem)
8. Clear filters → All ideas shown again with default sort
9. Click "Approve" on submitted idea → Confirmation modal appears → Approve → Status updates to "approved"
10. Click "Reject" on submitted idea → Feedback modal appears → Enter feedback → Reject → Status updates to "rejected"
11. Check empty state when no ideas match filters
12. Check loading skeleton while data fetches
13. Check error handling when database query fails
14. Check responsive layout: Desktop (table), Tablet (cards), Mobile (stacked cards)
15. Check PassportCard branding: #E10514 primary, 20px radius, neutral gray icons

**Test Scenarios:**
- Admin with 0 ideas in system → Empty state visible with helpful message
- Admin with 100+ ideas → List loads efficiently, pagination not needed yet (limit 50)
- Apply multiple filters simultaneously → All filters work together correctly
- Network failure → Error toast appears, retry button works
- RLS policy violation → Proper error handling, no data exposure
- Debounce search → Query only fires after 300ms of no typing

### Architectural Constraints

**Enforce PassportCard Design System:**
- Primary color: #E10514 (Pasportcard red)
- Border radius: 20px on all cards and modals
- Icons: Heroicons only, neutral gray (#525355) default, NEVER black (#000000)
- No emojis anywhere (replace with icons or text)
- Fonts: Montserrat (headings), Rubik (body)
- Status badge colors:
  - submitted: gray (#6B7280)
  - approved: blue (#3B82F6)
  - prd_development: yellow (#F59E0B)
  - prototype_complete: green (#10B981)
  - rejected: red (#EF4444)

**Naming Conventions:**
- Database tables: snake_case (`ideas`, `user_id`)
- TypeScript: camelCase (functions, variables), PascalCase (components, types)
- Files: PascalCase.tsx for components, camelCase.ts for utilities

**State Management Pattern:**
- React Query for ALL server data (no local state for server data)
- Query keys: `['admin', 'ideas', filters]` pattern
- Refetch on window focus: Enabled for admin pages
- Optimistic updates for approve/reject actions

**Error Pattern:**
```typescript
async function getAllIdeas(filters: IdeaFilters) {
  try {
    setIsLoading(true);
    const result = await adminService.getAllIdeas(filters);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    return result.data;
  } catch (error) {
    toast.error('Failed to load ideas');
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}
```

### Previous Story Intelligence (Story 5.1)

**Learnings from Story 5.1 (Admin Dashboard Layout):**
- AdminRoute component already created for role-based access control
- adminService.ts already exists with getMetrics() function
- useAdminMetrics hook pattern established for React Query
- MetricCard component created for displaying stats
- PassportCard theme integration patterns established
- RLS policy `admin_view_all_ideas` already created

**Files Created in Story 5.1:**
- `src/routes/AdminRoute.tsx` - Reuse for protecting /admin/ideas route
- `src/features/admin/services/adminService.ts` - Extend with new functions
- `src/features/admin/hooks/useAdminMetrics.ts` - Follow same pattern for useAllIdeas
- `src/features/admin/components/AdminDashboard.tsx` - Add navigation link to All Ideas page

**Code Patterns Established:**
- React Query with 30-second refetch interval
- Query key pattern: `['admin', action, ...params]`
- Service layer abstraction for all Supabase calls
- Toast notifications for success/error feedback
- DaisyUI components with PassportCard theme
- Responsive grid layouts with Tailwind CSS

**Testing Approaches:**
- Manual testing with admin and regular user accounts
- Role-based access control verification
- Error handling and retry logic testing
- Responsive layout testing across devices

### Project Structure Notes

**Alignment with Unified Project Structure:**
- Feature-based organization: Admin functionality isolated in `features/admin/`
- Shared UI components: Use `components/ui/` for generic components (Button, Badge, Modal, etc.)
- Service layer abstraction: All Supabase calls through `adminService.ts`
- Type safety: Define TypeScript types in `features/admin/types.ts`

**Detected Conflicts or Variances:**
- None. This story follows established architecture patterns exactly.
- Admin route protection follows same pattern as existing auth routes (Story 5.1)
- List layout consistent with ideas list patterns from Epic 2
- Filter and search patterns follow standard React Query best practices

### References

**Technical Details from Architecture:**
- [Source: architecture.md, lines 536-551] - Admin feature structure and components
- [Source: architecture.md, lines 159-167] - Authentication and RLS policies
- [Source: architecture.md, lines 247-264] - Naming conventions (database, TypeScript, files)
- [Source: architecture.md, lines 320-347] - State management patterns with React Query
- [Source: architecture.md, lines 609-617] - Data flow and component boundaries

**Functional Requirements from PRD:**
- [Source: prd.md, lines 602-609] - FR35-FR40: Admin dashboard and triage requirements
- [Source: prd.md, lines 656-665] - NFR-S2: Role-based access control at database level
- [Source: prd.md, lines 629-653] - NFR-P1 to NFR-P6: Performance requirements

**User Journey from PRD:**
- [Source: prd.md, lines 176-205] - Sarah's Innovation Manager journey
- [Source: prd.md, lines 258-271] - Sarah's success moments and admin needs

**Epic Story Details from Epics:**
- [Source: epics.md, lines 1086-1106] - Story 5.2 complete acceptance criteria
- [Source: epics.md, lines 1064-1066] - Epic 5 goal and user value

**Database Schema:**
- Table: `ideas` with columns: `id`, `user_id`, `title`, `problem`, `solution`, `impact`, `status` (enum), `created_at`, `updated_at`
- Table: `users` with columns: `id`, `email`, `name`, `role`, `created_at`
- Enum values for status: 'submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected'
- RLS policies enforcing User vs Admin access already established in Epic 1

**Design System References:**
- PassportCard primary red: #E10514
- Border radius: 20px
- Neutral gray for icons: #525355 (NEVER use black #000000)
- No emojis anywhere in the UI
- Heroicons for all iconography
- Montserrat font (headings), Rubik font (body)
- Status badge semantic colors (gray, blue, yellow, green, red)

**Key Integration Points:**
- Supabase client: `src/lib/supabase.ts`
- React Query client: `src/lib/queryClient.ts`
- Toast notifications: `src/hooks/useToast.ts`
- Auth context: `src/features/auth/hooks/useAuth.ts`
- AdminRoute: `src/routes/AdminRoute.tsx` (created in Story 5.1)

### Implementation Priority

**Critical Path Items:**
1. Extend adminService with getAllIdeas() function (blocks data fetching)
2. Create useAllIdeas hook (blocks data display)
3. Create AllIdeasPage component (blocks UI)
4. Create IdeaFilters component (blocks filtering)
5. Create IdeaListItem component (blocks list display)

**Can Be Implemented in Parallel:**
- useApproveIdea and useRejectIdea hooks (independent of list display)
- IdeaListSkeleton and EmptyState components (independent of data fetching)
- Route definition and navigation updates (independent of components)

**Deferred to Future Stories:**
- Pagination for large lists (Story 5.2 handles up to 50 ideas, pagination in future)
- Kanban pipeline view (Story 5.3)
- Detailed idea view for admins (Story 5.6)
- User activity tracking (Story 5.7)

### AI Agent Guidance

**For DEV Agent:**
- Follow architecture patterns exactly as documented
- Use feature-based structure: `features/admin/`
- All database calls through service layer (`adminService.ts`)
- All server state via React Query (`useAllIdeas`, `useApproveIdea`, `useRejectIdea`)
- Apply PassportCard DSM consistently (no black icons, no emojis)
- Test with both admin and regular user roles
- Implement debounce for search input (300ms)
- Use optimistic updates for approve/reject actions

**Common Pitfalls to Avoid:**
- Don't hardcode role checks in components (use AdminRoute wrapper)
- Don't use local state for server data (use React Query)
- Don't forget responsive breakpoints (mobile-first, then tablet, desktop)
- Don't use black icons (#000000) - use neutral gray (#525355)
- Don't add emojis anywhere (use Heroicons instead)
- Don't skip error handling (always show user-friendly messages)
- Don't forget to debounce search input (prevents excessive queries)
- Don't forget to invalidate React Query cache after approve/reject actions

**Performance Considerations:**
- Database query should use indexes on `status` and `created_at` columns
- Search query uses ILIKE which may be slow on large datasets (consider full-text search in future)
- Debounce search input to 300ms to prevent excessive queries
- React Query caching prevents unnecessary refetches
- 30-second refetch interval balances freshness and performance
- Limit initial query to 50 ideas (pagination for future)

**Security Reminders:**
- RLS policies enforce admin access at database level
- Role check in AdminRoute is UI-only (database is source of truth)
- Never expose sensitive admin data to regular users
- All admin actions should be logged (future requirement)
- Rejection feedback is stored with the idea and visible to submitter

### Git Intelligence Summary

**Recent Development Patterns (Last 10 Commits):**
- Stories 3.1, 3.2, 3.3 recently completed (PRD feature)
- Story 2.9 (Idea Detail View) recently completed
- Story 4.2 (Prototype generation) recently completed
- Story 2.7 (Idea submission) recently completed
- Consistent pattern: Service layer → Hook → Component → Tests
- All stories include comprehensive unit tests
- Sprint status updated after each story completion
- RLS policies created for each feature
- React Query patterns established across all features

**Code Patterns from Recent Commits:**
- Service functions return `ServiceResponse<T>` type
- Hooks use React Query with query keys: `['feature', 'action', ...params]`
- Components use Tailwind CSS + DaisyUI for styling
- Error handling with toast notifications
- Loading states with skeleton components
- Empty states with helpful messages
- Comprehensive TypeScript types for all entities

**Libraries and Versions:**
- React 19.x with TypeScript 5.x
- React Query v5.x for data fetching
- Supabase client for database and auth
- DaisyUI 5.x for UI components
- Tailwind CSS 4.x for styling
- Heroicons for iconography

**Testing Approaches:**
- Unit tests for all hooks and components
- Manual testing with different user roles
- Error handling and retry logic testing
- Responsive layout testing

### Latest Technical Information

**React Query v5.x Best Practices (2026):**
- Use `useQuery` with object syntax: `useQuery({ queryKey, queryFn, ... })`
- Query keys should be arrays: `['admin', 'ideas', filters]`
- Use `useMutation` for approve/reject actions with optimistic updates
- Invalidate queries after mutations: `queryClient.invalidateQueries(['admin', 'ideas'])`
- Enable refetchOnWindowFocus for admin dashboards (real-time feel)
- Use `staleTime` and `cacheTime` to balance freshness and performance

**Supabase Latest Features (2026):**
- RLS policies support JWT claims for role-based access
- `.select()` with joins: `.select('*, users(name, email)')`
- `.ilike()` for case-insensitive search
- `.order()` for sorting with multiple columns
- `.limit()` and `.range()` for pagination
- Real-time subscriptions for live updates (consider for future)

**TypeScript 5.x Patterns:**
- Use `satisfies` operator for type narrowing
- Use `const` assertions for literal types
- Use `Record<string, unknown>` for flexible objects
- Use discriminated unions for status enums
- Use `Partial<T>` for optional filter parameters

**DaisyUI 5.x Components:**
- Use `table` component for desktop list view
- Use `card` component for mobile list view
- Use `badge` component for status indicators
- Use `select` component for filter dropdowns
- Use `input` component for search field
- Use `btn` component for action buttons
- Use `modal` component for confirmation dialogs

**Accessibility Best Practices:**
- Add `aria-label` to filter controls
- Add `role="search"` to search input
- Add `aria-live="polite"` to list for screen reader updates
- Ensure keyboard navigation works for all interactive elements
- Use semantic HTML (`<table>`, `<button>`, `<input>`)

## Dev Agent Record

### Agent Model Used

_To be filled by DEV agent during implementation_

### Debug Log References

_To be added by DEV agent during implementation_

### Completion Notes List

_To be added by DEV agent upon completion_

### File List

_To be populated by DEV agent with all files created/modified_
