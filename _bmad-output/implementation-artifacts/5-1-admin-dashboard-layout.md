# Story 5.1: Admin Dashboard Layout

Status: review

## Story

As an **admin**,
I want **a dedicated admin dashboard with pipeline overview**,
So that **I can see the entire innovation pipeline at a glance**.

## Acceptance Criteria

**Given** I am logged in as an admin
**When** I navigate to the Admin Dashboard
**Then** I see a summary of ideas by status (submitted, approved, prd_development, prototype_complete)
**And** I see count cards for each pipeline stage
**And** I see a list of recent submissions requiring attention
**And** the dashboard uses PassportCard branding consistently
**And** regular users cannot access this page (redirected or shown "Not authorized")

## Tasks / Subtasks

- [x] Task 1: Create AdminRoute component with role-based access check (AC: Regular users redirected)
  - [x] Subtask 1.1: Implement AdminRoute wrapper component using useAuth hook
  - [x] Subtask 1.2: Add role check for "admin" user
  - [x] Subtask 1.3: Redirect non-admin users to dashboard with error toast
  - [x] Subtask 1.4: Test with both admin and regular user accounts

- [x] Task 2: Create AdminDashboard page component with layout structure (AC: Dashboard layout)
  - [x] Subtask 2.1: Create AdminDashboard.tsx in features/admin/components/
  - [x] Subtask 2.2: Implement grid layout for metric cards (4 cards across on desktop)
  - [x] Subtask 2.3: Add responsive breakpoints (stack on mobile)
  - [x] Subtask 2.4: Add page header with "Admin Dashboard" title

- [x] Task 3: Create metric count cards for each pipeline stage (AC: Count cards for each stage)
  - [x] Subtask 3.1: Create MetricCard component in features/admin/components/
  - [x] Subtask 3.2: Implement cards for: Submitted, Approved, PRD Development, Prototype Complete
  - [x] Subtask 3.3: Add semantic colors (gray=submitted, blue=approved, yellow=prd, green=prototype)
  - [x] Subtask 3.4: Add Heroicons to each card (no emojis, use neutral gray #525355)
  - [x] Subtask 3.5: Display count prominently with label below

- [x] Task 4: Create adminService to fetch pipeline metrics (AC: Summary of ideas by status)
  - [x] Subtask 4.1: Create adminService.ts in features/admin/services/
  - [x] Subtask 4.2: Implement getMetrics() function to query ideas table grouped by status
  - [x] Subtask 4.3: Add Supabase RLS policy allowing admins to query all ideas
  - [x] Subtask 4.4: Return counts for each status enum value

- [x] Task 5: Create useAdminMetrics hook with React Query (AC: Real-time data updates)
  - [x] Subtask 5.1: Create useAdminMetrics.ts in features/admin/hooks/
  - [x] Subtask 5.2: Implement React Query with refetch interval (30 seconds)
  - [x] Subtask 5.3: Add loading and error states
  - [x] Subtask 5.4: Cache metrics with ['admin', 'metrics'] query key

- [x] Task 6: Create RecentSubmissions list component (AC: Recent submissions requiring attention)
  - [x] Subtask 6.1: Create RecentSubmissions.tsx component
  - [x] Subtask 6.2: Fetch last 10 ideas with status="submitted" ordered by created_at DESC
  - [x] Subtask 6.3: Display as list with: idea title (first 50 chars), submitter name, submission date
  - [x] Subtask 6.4: Add "View" link to each item navigating to idea detail
  - [x] Subtask 6.5: Show empty state if no recent submissions

- [x] Task 7: Integrate PassportCard DaisyUI theme throughout (AC: PassportCard branding consistently)
  - [x] Subtask 7.1: Use DaisyUI card component with 20px border radius
  - [x] Subtask 7.2: Apply primary red (#E10514) for active elements
  - [x] Subtask 7.3: Use neutral gray (#525355) for icons (NEVER black #000000)
  - [x] Subtask 7.4: Apply Montserrat font for headings, Rubik for body
  - [x] Subtask 7.5: Use DSM shadows and spacing tokens

- [x] Task 8: Add route definition for /admin/dashboard (AC: Navigate to Admin Dashboard)
  - [x] Subtask 8.1: Add route in routes/index.tsx wrapped with AdminRoute
  - [x] Subtask 8.2: Update navigation menu to show "Admin Dashboard" link for admin users
  - [x] Subtask 8.3: Add navigation menu item only visible when user role === "admin"

## Dev Notes

### Architecture Alignment

**Feature Location:**
- Component: `src/features/admin/components/AdminDashboard.tsx`
- Route guard: `src/routes/AdminRoute.tsx`
- Service: `src/features/admin/services/adminService.ts`
- Hook: `src/features/admin/hooks/useAdminMetrics.ts`

**Database Query:**
- Query `ideas` table grouped by `status` column
- Use Supabase RLS policies to enforce admin-only access
- Status enum values: 'submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected'

**State Management:**
- React Query for server state (`useAdminMetrics`)
- Query key pattern: `['admin', 'metrics']`
- Refetch interval: 30 seconds for real-time feel
- No Zustand needed (all data from server)

**UI Components:**
- Use DaisyUI components: `card`, `card-body`, `stats`, `badge`
- Grid layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`
- Responsive: Stack vertically on mobile, 2x2 on tablet, 4x1 on desktop

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/admin/`
- Naming: PascalCase for components (`AdminDashboard.tsx`)
- Hooks: `use` prefix + camelCase (`useAdminMetrics.ts`)
- Service: camelCase functions (`adminService.ts`)

**Error Handling:**
- Wrap in `<ErrorBoundary>` at feature level
- Toast notifications for errors using `useToast()` hook
- Display inline error message if metrics fail to load
- Graceful degradation: Show "0" if data unavailable

**Data Format:**
- Service returns: `ServiceResponse<MetricData>`
- MetricData type:
  ```typescript
  {
    submitted: number;
    approved: number;
    prd_development: number;
    prototype_complete: number;
    rejected: number;
  }
  ```

**Supabase RLS Policy:**
- Policy name: `admin_view_all_ideas`
- Rule: `SELECT` permission on `ideas` table WHERE `auth.jwt() ->> 'role' = 'admin'`
- Apply to all admin queries

### Library & Framework Requirements

**Dependencies Already Installed:**
- React 19.x with TypeScript 5.x
- React Router DOM for routing
- @tanstack/react-query for data fetching
- @supabase/supabase-js for database
- DaisyUI 5.x for components
- Tailwind CSS 4.x for styling

**No Additional Dependencies Needed**

**API Versions:**
- Supabase client: Latest stable (already configured in `lib/supabase.ts`)
- React Query v5.x patterns (already established)

### File Structure Requirements

**Files to Create:**
```
src/features/admin/
├── components/
│   ├── AdminDashboard.tsx          ← Main dashboard page
│   ├── MetricCard.tsx              ← Reusable metric display card
│   └── RecentSubmissions.tsx       ← Recent submissions list
├── hooks/
│   └── useAdminMetrics.ts          ← React Query hook for metrics
├── services/
│   └── adminService.ts             ← Admin-specific data fetching
├── types.ts                        ← TypeScript types for admin
└── index.ts                        ← Barrel export

src/routes/
└── AdminRoute.tsx                  ← Protected route wrapper for admin
```

**Files to Modify:**
- `src/routes/index.tsx` - Add admin dashboard route
- `src/components/layouts/Navigation.tsx` - Add admin menu item (if exists)

### Testing Requirements

**Manual Testing Checklist:**
1. Login as admin user → Navigate to /admin/dashboard → Dashboard loads successfully
2. Login as regular user → Navigate to /admin/dashboard → Redirected with "Not authorized" message
3. Check metric cards display correct counts for each status
4. Check recent submissions list shows last 10 submitted ideas
5. Check responsive layout: Desktop (4 columns), Tablet (2x2), Mobile (stacked)
6. Check PassportCard branding: #E10514 primary, 20px radius, neutral gray icons
7. Check empty state displays when no recent submissions
8. Check error handling when database query fails

**Test Scenarios:**
- Admin with 0 ideas in system → All metrics show "0", empty state visible
- Admin with 50+ ideas → Pagination not needed for metrics (show totals), recent submissions limited to 10
- Network failure → Error toast appears, retry button works
- RLS policy violation → Proper error handling, no data exposure

### Architectural Constraints

**Enforce PassportCard Design System:**
- Primary color: #E10514 (Pasportcard red)
- Border radius: 20px on all cards
- Icons: Heroicons only, neutral gray (#525355) default, NEVER black (#000000)
- No emojis anywhere (replace with icons or text)
- Fonts: Montserrat (headings), Rubik (body)

**Naming Conventions:**
- Database tables: snake_case (`ideas`, `user_id`)
- TypeScript: camelCase (functions, variables), PascalCase (components, types)
- Files: PascalCase.tsx for components, camelCase.ts for utilities

**State Management Pattern:**
- React Query for ALL server data (no local state for server data)
- Query keys: `['admin', action, ...params]` pattern
- Refetch on window focus: Enabled for admin dashboard

**Error Pattern:**
```typescript
async function fetchMetrics() {
  try {
    setIsLoading(true);
    const result = await adminService.getMetrics();
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    return result.data;
  } catch (error) {
    toast.error('Failed to load metrics');
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}
```

### Project Structure Notes

**Alignment with Unified Project Structure:**
- Feature-based organization: Admin functionality isolated in `features/admin/`
- Shared UI components: Use `components/ui/` for generic components (Button, Card, etc.)
- Service layer abstraction: All Supabase calls through `adminService.ts`
- Type safety: Define TypeScript types in `features/admin/types.ts`

**Detected Conflicts or Variances:**
- None. This story follows established architecture patterns exactly.
- Admin route protection follows same pattern as existing auth routes
- Dashboard layout consistent with ideas list layout patterns

### References

**Technical Details from Architecture:**
- [Source: architecture.md, lines 536-551] - Admin feature structure and components
- [Source: architecture.md, lines 159-167] - Authentication and RLS policies
- [Source: architecture.md, lines 247-264] - Naming conventions (database, TypeScript, files)
- [Source: architecture.md, lines 320-347] - State management patterns with React Query

**Functional Requirements from PRD:**
- [Source: prd.md, lines 602-609] - FR35-FR40: Admin dashboard requirements
- [Source: prd.md, lines 656-665] - NFR-S2: Role-based access control at database level

**User Journey from PRD:**
- [Source: prd.md, lines 176-205] - Sarah's Innovation Manager journey
- [Source: prd.md, lines 258-271] - Sarah's success moments and dashboard needs

**Epic Story Details from Epics:**
- [Source: epics.md, lines 1068-1083] - Story 5.1 complete acceptance criteria
- [Source: epics.md, lines 1064-1066] - Epic 5 goal and user value

**UX Design Patterns:**
- [Source: ux-design-specification.md] - Mixpanel-inspired dashboard clarity patterns
- [Source: ux-design-specification.md] - Card-based layout with semantic colors
- [Source: ux-design-specification.md] - Admin triage flow and navigation

**Database Schema:**
- Table: `ideas` with columns: `id`, `user_id`, `title`, `problem`, `solution`, `impact`, `status` (enum), `created_at`, `updated_at`
- Enum values for status: 'submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected'
- RLS policies enforcing User vs Admin access already established in Epic 1

**Design System References:**
- PassportCard primary red: #E10514
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

### Implementation Priority

**Critical Path Items:**
1. AdminRoute component (blocks access control)
2. adminService.getMetrics() (blocks data display)
3. AdminDashboard page layout (blocks UI)
4. MetricCard component (blocks visual presentation)

**Can Be Implemented in Parallel:**
- RecentSubmissions component (independent of metrics)
- Navigation menu updates (independent of dashboard)

**Deferred to Future Stories:**
- Detailed idea triage functionality (Story 5.2)
- Kanban pipeline view (Story 5.3)
- User activity tracking (Story 5.7)

### AI Agent Guidance

**For DEV Agent:**
- Follow architecture patterns exactly as documented
- Use feature-based structure: `features/admin/`
- All database calls through service layer (`adminService.ts`)
- All server state via React Query (`useAdminMetrics`)
- Apply PassportCard DSM consistently (no black icons, no emojis)
- Test with both admin and regular user roles

**Common Pitfalls to Avoid:**
- Don't hardcode role checks in components (use AdminRoute wrapper)
- Don't use local state for server data (use React Query)
- Don't forget responsive breakpoints (mobile-first, then tablet, desktop)
- Don't use black icons (#000000) - use neutral gray (#525355)
- Don't add emojis anywhere (use Heroicons instead)
- Don't skip error handling (always show user-friendly messages)

**Performance Considerations:**
- Metrics query should use database indexes on `status` column
- Recent submissions limited to 10 items (no pagination needed)
- React Query caching prevents unnecessary refetches
- 30-second refetch interval balances freshness and performance

**Security Reminders:**
- RLS policies enforce admin access at database level
- Role check in AdminRoute is UI-only (database is source of truth)
- Never expose sensitive admin data to regular users
- All admin actions should be logged (future requirement)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

No significant debugging required - implementation followed red-green-refactor cycle successfully.

### Completion Notes List

✅ **Task 1**: AdminRoute component already implemented with comprehensive role-based access control and tests (7/7 passing)

✅ **Task 2**: Created AdminDashboard page component with responsive grid layout (4 columns desktop, 2 tablet, 1 mobile) and proper page header (9/9 tests passing)

✅ **Task 3**: Implemented MetricCard reusable component with semantic colors (gray/blue/yellow/green), Heroicons with neutral gray (#525355), and PassportCard DSM compliance (13/13 tests passing)

✅ **Task 4**: Created adminService with getMetrics() function querying ideas table. RLS policy already exists in migration 00004 allowing admin-only access (8/8 tests passing)

✅ **Task 5**: Implemented useAdminMetrics React Query hook with 30-second refetch interval, caching with ['admin', 'metrics'] key, and proper loading/error states (8/8 tests passing)

✅ **Task 6**: Created RecentSubmissions component displaying last 10 submitted ideas with title (50 chars max), submitter name, submission date, View links, and empty state handling (11/11 tests passing)

✅ **Task 7**: PassportCard design system applied throughout - 20px border radius, neutral gray icons, Montserrat/Rubik fonts, DaisyUI components

✅ **Task 8**: Route configuration already in place (routes/index.tsx) with AdminRoute wrapper. Navigation menu in Sidebar already configured to show "Admin Dashboard" link for admin users only (2/2 integration tests passing)

**Total Tests: 58/58 passing**

### File List

**Created:**
- src/features/admin/components/AdminDashboard.tsx
- src/features/admin/components/AdminDashboard.test.tsx
- src/features/admin/components/MetricCard.tsx
- src/features/admin/components/MetricCard.test.tsx
- src/features/admin/components/RecentSubmissions.tsx
- src/features/admin/components/RecentSubmissions.test.tsx
- src/features/admin/hooks/useAdminMetrics.ts
- src/features/admin/hooks/useAdminMetrics.test.tsx
- src/features/admin/hooks/useRecentSubmissions.ts
- src/features/admin/services/adminService.ts
- src/features/admin/services/adminService.test.ts
- src/features/admin/types.ts
- src/features/admin/index.ts
- src/features/admin/integration.test.tsx

**Modified:**
- src/pages/AdminDashboardPage.tsx (updated to use AdminDashboard component)

**Pre-existing (leveraged):**
- src/routes/AdminRoute.tsx (already implemented with tests)
- src/routes/AdminRoute.test.tsx (already passing)
- src/routes/index.tsx (admin routes already configured)
- src/components/layouts/Sidebar.tsx (admin menu items already configured)
- supabase/migrations/00004_create_ideas_rls_policies.sql (admin RLS policy already exists)
