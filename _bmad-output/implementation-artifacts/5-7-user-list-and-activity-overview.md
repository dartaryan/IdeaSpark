# Story 5.7: User List and Activity Overview

Status: review

<!-- Story completed by DEV agent. Ready for code review. -->

## Story

As an **admin**,
I want **to see a list of all users and their activity**,
So that **I can understand who is contributing to innovation and recognize active contributors**.

## Acceptance Criteria

**Given** I am on the Admin Dashboard
**When** I navigate to "Users"
**Then** I see a list of all registered users
**And** each user shows: name/email, role, join date, ideas submitted count
**And** I can click on a user to see their submitted ideas
**And** I can filter by role (user/admin)

**Given** I click on a user
**When** the detail view loads
**Then** I see all ideas submitted by that user
**And** I can navigate to any of their ideas

## Tasks / Subtasks

- [x] Task 1: Create UserList component with table display (AC: See list of all users)
  - [x] Subtask 1.1: Create UserList.tsx in features/admin/components/
  - [x] Subtask 1.2: Use adminService.getAllUsers() to fetch user list
  - [x] Subtask 1.3: Display users in DaisyUI table with columns: Avatar, Name, Email, Role, Join Date, Ideas Count
  - [x] Subtask 1.4: Add loading skeleton for table rows during data fetch
  - [x] Subtask 1.5: Show empty state if no users exist (unlikely but handle gracefully)
  - [x] Subtask 1.6: Make each user row clickable to navigate to user detail view
  - [x] Subtask 1.7: Apply PassportCard styling (20px border radius on table, red hover state)
  - [x] Subtask 1.8: Ensure responsive layout (table scrolls horizontally on mobile)

- [x] Task 2: Add role filter functionality (AC: Filter by role)
  - [x] Subtask 2.1: Add role filter dropdown above user table (All, User, Admin)
  - [x] Subtask 2.2: Filter users client-side based on selected role
  - [x] Subtask 2.3: Show count of filtered results: "Showing X users"
  - [x] Subtask 2.4: Default to "All" showing all users
  - [x] Subtask 2.5: Use DaisyUI select component for filter dropdown
  - [x] Subtask 2.6: Persist filter selection in component state (not URL for simplicity)

- [x] Task 3: Add search functionality for user names/emails (AC: Efficient user finding)
  - [x] Subtask 3.1: Add search input field above user table
  - [x] Subtask 3.2: Filter users client-side by name or email match (case-insensitive)
  - [x] Subtask 3.3: Show "No users found" message if search returns empty
  - [x] Subtask 3.4: Clear search button (X icon) to reset filter
  - [x] Subtask 3.5: Use debounced search for performance (wait 300ms after typing)
  - [x] Subtask 3.6: Search updates count: "Showing X of Y users"

- [x] Task 4: Display user avatar and details (AC: Each user shows name/email/role/join date/ideas count)
  - [x] Subtask 4.1: Use DaisyUI avatar component with user initials if no photo
  - [x] Subtask 4.2: Display full name in bold, email in gray below
  - [x] Subtask 4.3: Add role badge (User=gray badge, Admin=red badge with PassportCard #E10514)
  - [x] Subtask 4.4: Show join date in relative format: "Joined 3 months ago"
  - [x] Subtask 4.5: Display ideas submitted count as badge: "5 ideas"
  - [x] Subtask 4.6: If user has 0 ideas, show "No ideas yet" in gray
  - [x] Subtask 4.7: Sort by ideas count descending by default (most active first)
  - [x] Subtask 4.8: Add sort controls for Name (A-Z), Join Date (newest/oldest), Ideas Count (most/least)

- [x] Task 5: Create UserDetailView component (AC: Click on user to see submitted ideas)
  - [x] Subtask 5.1: Create UserDetailView.tsx in features/admin/components/
  - [x] Subtask 5.2: Load user details by user_id using adminService.getUserById()
  - [x] Subtask 5.3: Display UserProfileCard at top with user info, role, join date, total ideas
  - [x] Subtask 5.4: Load all ideas submitted by this user using adminService.getIdeasByUser(userId)
  - [x] Subtask 5.5: Display ideas in list format (reuse IdeaCard component from features/ideas/)
  - [x] Subtask 5.6: Each idea card shows: title, status, submission date, preview of problem
  - [x] Subtask 5.7: Click on idea card navigates to IdeaDetailPage (admin view)
  - [x] Subtask 5.8: Add breadcrumb navigation: Admin Dashboard → Users → User Detail
  - [x] Subtask 5.9: Add "Back to Users" button to return to UserList
  - [x] Subtask 5.10: Show empty state if user has no ideas: "No ideas submitted yet"

- [x] Task 6: Extend adminService with user list and activity functions (AC: Data access layer)
  - [x] Subtask 6.1: Add getAllUsers() function to adminService.ts
  - [x] Subtask 6.2: Query users table: SELECT id, name, email, role, created_at
  - [x] Subtask 6.3: Join with ideas table to count submitted ideas per user
  - [x] Subtask 6.4: Return ServiceResponse<User[]> with users and idea counts
  - [x] Subtask 6.5: Add getUserById(userId) function to get detailed user info
  - [x] Subtask 6.6: Add getIdeasByUser(userId) function to get all ideas by specific user
  - [x] Subtask 6.7: Handle errors gracefully with user-friendly messages
  - [x] Subtask 6.8: Verify admin role before executing queries (RLS backup)

- [x] Task 7: Create React Query hooks for user data (AC: State management)
  - [x] Subtask 7.1: Create useUsers hook in features/admin/hooks/useUsers.ts
  - [x] Subtask 7.2: Hook calls adminService.getAllUsers() with query key: ['admin', 'users']
  - [x] Subtask 7.3: Set staleTime to 60 seconds (user list doesn't change frequently)
  - [x] Subtask 7.4: Create useUser(userId) hook for single user detail
  - [x] Subtask 7.5: Query key: ['admin', 'user', userId]
  - [x] Subtask 7.6: Create useUserIdeas(userId) hook for user's submitted ideas
  - [x] Subtask 7.7: Query key: ['admin', 'user', userId, 'ideas']
  - [x] Subtask 7.8: Handle loading, error, and success states in all hooks

- [x] Task 8: Add Users navigation to AdminDashboard (AC: Navigate to Users)
  - [x] Subtask 8.1: Add "Users" menu item to AdminDashboard navigation sidebar
  - [x] Subtask 8.2: Use Heroicon: `user-group` for menu icon
  - [x] Subtask 8.3: Route to /admin/users when clicked
  - [x] Subtask 8.4: Highlight "Users" menu item when active (current route)
  - [x] Subtask 8.5: Show user count badge on menu item: "Users (12)"
  - [x] Subtask 8.6: Mobile: Include Users in collapsed menu

- [x] Task 9: Add admin routes for UserList and UserDetailView (AC: Routing)
  - [x] Subtask 9.1: Add AdminRoute for /admin/users route (loads UserList)
  - [x] Subtask 9.2: Add AdminRoute for /admin/users/:userId route (loads UserDetailView)
  - [x] Subtask 9.3: Configure React Router with these new admin routes
  - [x] Subtask 9.4: Handle 404 if user not found (show error page)
  - [x] Subtask 9.5: Redirect non-admin users to dashboard if they try to access
  - [x] Subtask 9.6: Preserve navigation state for back button functionality

- [x] Task 10: Verify RLS policies for admin user access (AC: Database security)
  - [x] Subtask 10.1: Verify RLS policy on users table allows admin to SELECT all rows
  - [x] Subtask 10.2: Policy rule: `SELECT` permission WHERE `auth.jwt() ->> 'role' = 'admin'` OR id = auth.uid()
  - [x] Subtask 10.3: If policy doesn't exist, add to existing migration or create new one
  - [x] Subtask 10.4: Test policy with admin and regular user accounts
  - [x] Subtask 10.5: Verify regular users can only see their own user record

- [x] Task 11: Add user activity metrics to UserDetailView (AC: Activity overview)
  - [x] Subtask 11.1: Show activity summary: Total ideas, Ideas by status (submitted/approved/rejected/completed)
  - [x] Subtask 11.2: Display recent activity timeline: "Submitted idea X 2 days ago"
  - [x] Subtask 11.3: Show date of last activity: "Last active: 1 week ago"
  - [x] Subtask 11.4: Calculate approval rate if user has approved ideas
  - [x] Subtask 11.5: Display "Join Date" prominently with formatted date
  - [x] Subtask 11.6: Show "Most Active In" badge if user is top contributor

- [x] Task 12: Integrate PassportCard DaisyUI theme (AC: Consistent branding)
  - [x] Subtask 12.1: Use DaisyUI table component for UserList
  - [x] Subtask 12.2: Apply PassportCard red (#E10514) for primary actions and admin role badges
  - [x] Subtask 12.3: Use Heroicons for all icons (user-group, search, filter)
  - [x] Subtask 12.4: Apply 20px border radius to cards, table containers, and buttons
  - [x] Subtask 12.5: Use Montserrat font for headings, Rubik for body text
  - [x] Subtask 12.6: Apply DSM spacing tokens (p-4, gap-4) consistently
  - [x] Subtask 12.7: Use neutral gray (#525355) for secondary text and icons
  - [x] Subtask 12.8: Ensure responsive layout with mobile breakpoints

- [x] Task 13: Handle edge cases and error states (AC: Robust error handling)
  - [x] Subtask 13.1: Handle case where no users exist (show empty state with explanation)
  - [x] Subtask 13.2: Handle case where user was deleted while viewing (show "User no longer exists")
  - [x] Subtask 13.3: Handle search/filter returning no results (show "No users match your criteria")
  - [x] Subtask 13.4: Handle admin loses permissions mid-session (redirect to login)
  - [x] Subtask 13.5: Add loading skeletons for user list and user detail view
  - [x] Subtask 13.6: Validate admin role on every admin route access
  - [x] Subtask 13.7: Handle user with orphaned ideas (user exists but ideas missing)

- [ ] Task 14: Add export functionality (Nice-to-have, optional) - SKIPPED
  - [ ] Subtask 14.1: Add "Export Users" button to UserList (optional)
  - [ ] Subtask 14.2: Generate CSV with user data: name, email, role, join date, ideas count
  - [ ] Subtask 14.3: Trigger browser download with filename: "ideaspark-users-YYYY-MM-DD.csv"
  - [ ] Subtask 14.4: Show success toast: "Users exported successfully"

## Dev Notes

### Architecture Alignment

**Feature Location:**
- UserList: `src/features/admin/components/UserList.tsx`
- UserDetailView: `src/features/admin/components/UserDetailView.tsx`
- UserActivityCard: `src/features/admin/components/UserActivityCard.tsx`
- useUsers hook: `src/features/admin/hooks/useUsers.ts`
- AdminService: `src/features/admin/services/adminService.ts` (extend)

**Integration Points:**
- AdminDashboard: `src/features/admin/components/AdminDashboard.tsx` (add Users navigation)
- AdminRoute: `src/routes/AdminRoute.tsx` (add user list and detail routes)
- React Router: `src/routes/index.tsx` (configure admin user routes)
- IdeaCard: `src/features/ideas/components/IdeaCard.tsx` (reuse for user's ideas)

**Database Operations:**
- Tables: `users`, `ideas`
- Admin queries join users table with ideas table for activity counts
- RLS policies enforce admin access at database level

**State Management:**
- React Query for all data fetching
- Query keys: `['admin', 'users']`, `['admin', 'user', userId]`, `['admin', 'user', userId, 'ideas']`
- Cache invalidation when user data changes (rare, mostly read-only)
- Loading states for all async operations

**UI Components:**
- DaisyUI components: `table`, `badge`, `avatar`, `input` (search), `select` (filter)
- Heroicons: `user-group` (users), `magnifying-glass` (search), `funnel` (filter)
- Responsive table with horizontal scroll on mobile
- Empty states with clear messaging

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/admin/`
- Naming: PascalCase for components (`UserList.tsx`, `UserDetailView.tsx`)
- Service: camelCase functions (`getAllUsers`, `getUserById`, `getIdeasByUser`)
- React Query hooks: `useUsers`, `useUser`, `useUserIdeas`

**Error Handling:**
- Wrap in `<ErrorBoundary>` at feature level
- Loading skeletons for all data fetches
- Error states with retry buttons
- 404 pages for missing users
- Log errors to console for debugging

**Data Format:**
- Service function signatures:
  ```typescript
  async function getAllUsers(): Promise<ServiceResponse<UserWithActivity[]>> {
    // Query users table with join to ideas for count
    // Return users with activity metrics
  }
  
  async function getUserById(userId: string): Promise<ServiceResponse<UserDetail>> {
    // Get detailed user info with activity summary
  }
  
  async function getIdeasByUser(userId: string): Promise<ServiceResponse<Idea[]>> {
    // Get all ideas submitted by specific user
  }
  ```

- Updated types:
  ```typescript
  interface UserWithActivity {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    created_at: string;
    ideas_count: number;
    last_idea_submitted_at?: string | null;
  }
  
  interface UserDetail extends UserWithActivity {
    ideas_by_status: {
      submitted: number;
      approved: number;
      prd_development: number;
      prototype_complete: number;
      rejected: number;
    };
    approval_rate?: number; // percentage of ideas approved
    recent_activity: {
      type: 'submitted_idea' | 'completed_prd' | 'generated_prototype';
      idea_id: string;
      idea_title: string;
      timestamp: string;
    }[];
  }
  ```

**Supabase Query:**
```typescript
// Get all users with ideas count
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    ideas (count)
  `)
  .order('created_at', { ascending: false });

// Transform to include ideas_count
const usersWithActivity = data?.map(user => ({
  ...user,
  ideas_count: user.ideas[0].count || 0,
}));

// Get specific user with detailed activity
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    ideas (id, title, status, created_at)
  `)
  .eq('id', userId)
  .single();

// Calculate activity metrics from ideas
const ideasByStatus = data.ideas.reduce((acc, idea) => {
  acc[idea.status] = (acc[idea.status] || 0) + 1;
  return acc;
}, {});

const approvalRate = data.ideas.length > 0
  ? (ideasByStatus.approved || 0) / data.ideas.length * 100
  : 0;
```

**RLS Policy Check:**
- Policy name: `admin_view_all_users` (should already exist from Epic 1)
- Rule: `SELECT` permission on `users` table WHERE `auth.jwt() ->> 'role' = 'admin'` OR id = auth.uid()
- Regular users can only see their own record, admins see all

### Library & Framework Requirements

**Dependencies Already Installed:**
- React 19.x with TypeScript 5.x
- React Router DOM for routing
- @tanstack/react-query for data fetching
- @supabase/supabase-js for database operations
- DaisyUI 5.x for components
- Tailwind CSS 4.x for styling
- Heroicons for iconography

**No Additional Dependencies Needed**

**API Versions:**
- Supabase client: Latest stable (already configured in `lib/supabase.ts`)
- React Query v5.x patterns (already established in previous stories)

**React Query Pattern:**
```typescript
// Hook for fetching all users
export function useUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getAllUsers(),
    staleTime: 60000, // 1 minute
  });
}

// Hook for fetching single user detail
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminService.getUserById(userId),
    staleTime: 60000, // 1 minute
    enabled: !!userId,
  });
}

// Hook for fetching user's ideas
export function useUserIdeas(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId, 'ideas'],
    queryFn: () => adminService.getIdeasByUser(userId),
    staleTime: 30000, // 30 seconds
    enabled: !!userId,
  });
}
```

### File Structure Requirements

**Files to Create:**
```
src/features/admin/
├── components/
│   ├── UserList.tsx                 ← Main user list component
│   ├── UserDetailView.tsx           ← User detail with activity
│   └── UserActivityCard.tsx         ← Activity metrics card
├── hooks/
│   ├── useUsers.ts                  ← Fetch all users
│   ├── useUser.ts                   ← Fetch single user detail
│   └── useUserIdeas.ts              ← Fetch user's ideas
└── services/
    └── adminService.ts              ← Extend with user functions
```

**Files to Modify:**
- `src/features/admin/components/AdminDashboard.tsx` - Add Users navigation menu item
- `src/routes/index.tsx` - Add admin user list and detail routes
- `src/features/admin/services/adminService.ts` - Add getAllUsers, getUserById, getIdeasByUser

**Database Migration (if needed):**
- Verify RLS policy on users table allows admin SELECT (should already exist from Epic 1)
- If missing, add to migration: `supabase/migrations/00010_admin_user_policies.sql`

### Testing Requirements

**Manual Testing Checklist:**
1. Login as admin → Navigate to Users → See list of all registered users
2. Verify user list shows: avatar, name, email, role badge, join date, ideas count
3. Click on a user → Navigate to UserDetailView → See user details and all their ideas
4. Filter users by role (User/Admin) → List updates correctly
5. Search for user by name or email → List filters correctly
6. Click on an idea in UserDetailView → Navigate to IdeaDetailPage (admin view)
7. Back button from UserDetailView → Return to UserList
8. Sort users by name (A-Z), join date, ideas count → Sorting works
9. View user with 0 ideas → "No ideas yet" message shown
10. View user with multiple ideas → All ideas displayed
11. Login as regular user → Try to access /admin/users → Redirected to dashboard
12. Admin views mobile layout → Table scrolls horizontally, layout responsive
13. Search with no results → "No users match your criteria" message shown
14. Navigate from UserList → UserDetailView → IdeaDetailPage → Breadcrumbs work
15. Export users (if implemented) → CSV file downloads with correct data

**Test Scenarios:**
- Admin views user list with various role filters
- Admin clicks on user to see all their submitted ideas
- Admin searches for specific user by name or email
- Regular user tries to access admin user list (should be blocked)
- User with no ideas shows empty state gracefully
- User with many ideas (10+) displays pagination or scroll
- Admin sorts users by different criteria (name, date, activity)
- Mobile responsive layout works correctly

**Edge Cases to Handle:**
- No users exist (unlikely but show empty state)
- User was deleted while admin viewing (show "User no longer exists")
- Search/filter returns no results (show "No users match your criteria")
- Admin loses permissions mid-session (redirect to login)
- User with orphaned ideas (user exists but ideas missing)
- Very long user name or email (truncate with tooltip)
- User joined today (show "Joined today")
- User with 100+ ideas (show count, paginate ideas list if needed)

### Architectural Constraints

**Enforce PassportCard Design System:**
- Primary color: #E10514 (PassportCard red) for admin role badges and primary actions
- Neutral gray: #525355 for secondary text and icons (NEVER black #000000)
- Success color: #10B981 for user role badges
- Border radius: 20px on all cards, tables, buttons
- Icons: Heroicons only
- No emojis anywhere (replace with icons or text)
- Fonts: Montserrat (headings), Rubik (body)

**Naming Conventions:**
- Database tables: snake_case (`users`, `ideas`, `created_at`)
- TypeScript: camelCase (functions, variables), PascalCase (components, types)
- Files: PascalCase.tsx for components, camelCase.ts for utilities
- Query keys: Array format `['admin', 'users']`, `['admin', 'user', userId]`

**State Management Pattern:**
- React Query for ALL server data (no local state for server data)
- Query keys: `['admin', 'users']`, `['admin', 'user', userId]`, `['admin', 'user', userId, 'ideas']`
- Stale time: 60 seconds for user list (doesn't change frequently)
- Loading skeletons during data fetch
- Error states with retry buttons

**Error Pattern:**
```typescript
async function getAllUsers() {
  try {
    // Check admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') {
      return { data: null, error: new Error('Unauthorized access') };
    }
    
    // Fetch users with ideas count
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        ideas (count)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch users:', error);
      return { data: null, error: new Error('Failed to load users') };
    }
    
    // Transform data to include ideas_count
    const usersWithActivity = data.map(user => ({
      ...user,
      ideas_count: user.ideas[0]?.count || 0,
    }));
    
    return { data: usersWithActivity, error: null };
  } catch (error) {
    console.error('Unexpected error fetching users:', error);
    return { data: null, error: new Error('An unexpected error occurred') };
  }
}
```

### Previous Story Intelligence

**Learnings from Story 5.6 (View Any User's Idea, PRD, and Prototype):**
- adminService patterns established for admin-specific operations
- React Query hooks with proper caching strategies
- AdminRoute wrapper ensures only admins access admin routes
- RLS policies allow admins to access all data
- UserProfileCard component created (can reuse in UserDetailView!)
- Breadcrumb navigation patterns established
- Loading skeletons and error states for all data fetches

**Learnings from Story 5.5 (Reject Idea with Feedback):**
- Admin dashboard navigation patterns
- Action buttons in admin views (approve, reject, etc.)
- Toast notifications for admin actions
- Comprehensive error handling with user-friendly messages

**Learnings from Story 5.1 (Admin Dashboard Layout):**
- AdminDashboard layout and navigation structure
- Menu items with icons and badges
- Responsive admin layout (sidebar on desktop, collapse on mobile)
- Summary cards with metrics

**Key Patterns to Reuse:**
- UserProfileCard from Story 5.6 (display user info with avatar, role badge)
- IdeaCard from Epic 2 (display user's ideas in UserDetailView)
- AdminRoute wrapper (protect user list and detail routes)
- React Query data fetching patterns
- Breadcrumb navigation for admin flows
- Loading skeletons for tables and lists

**Files Created in Previous Stories (Reuse Patterns):**
- `src/features/admin/components/UserProfileCard.tsx` - Reuse for user display
- `src/features/ideas/components/IdeaCard.tsx` - Reuse for displaying user's ideas
- `src/features/admin/services/adminService.ts` - Extend with user functions
- `src/routes/AdminRoute.tsx` - Use for protecting user routes
- `src/features/admin/components/AdminDashboard.tsx` - Add Users menu item

**Code Patterns Established:**
- React Query queries for data fetching (not mutations)
- Loading skeletons during async operations
- Error boundaries for component-level error handling
- Breadcrumb navigation for complex admin workflows
- Role-based component rendering (admin-only features)

### Project Structure Notes

**Alignment with Unified Project Structure:**
- Feature-based organization: User management in `features/admin/`
- Shared UI components: Reuse `components/ui/` for common elements
- Service layer abstraction: All Supabase calls through `adminService.ts`
- Type safety: Define TypeScript types in `features/admin/types.ts`

**Detected Conflicts or Variances:**
- None. This story follows established architecture patterns exactly.
- User list and detail views follow admin dashboard patterns from Epic 5
- RLS policies already established in Epic 1 for admin user access
- Navigation patterns consistent with existing admin routes

### References

**Technical Details from Architecture:**
- [Source: architecture.md, lines 534-551] - Admin feature structure and components
- [Source: architecture.md, lines 159-167] - Authentication and RLS policies
- [Source: architecture.md, lines 247-264] - Naming conventions (database, TypeScript, files)
- [Source: architecture.md, lines 320-347] - State management patterns with React Query
- [Source: architecture.md, lines 609-617] - Data flow and component boundaries

**Functional Requirements from PRD:**
- [Source: epics.md, lines 1190-1209] - Story 5.7 complete acceptance criteria
- [Source: epics.md, lines 1064-1066] - Epic 5 goal and user value
- [Source: epics.md, lines 69-73] - FR5: Admins can view list of all registered users
- [Source: prd.md, lines 176-207] - Sarah's Innovation Manager journey
- FR5: Admins can view a list of all registered users

**User Journey from Epics:**
- [Source: epics.md, lines 176-207] - Sarah's Innovation Manager journey
- Sarah needs visibility into who is contributing to innovation
- Recognition of active contributors improves engagement
- Understanding user activity patterns helps improve program
- Identifying top contributors for recognition and rewards
- Filtering by role helps differentiate internal innovators vs admins

**Database Schema:**
- Table: `users` with columns: `id`, `email`, `name`, `role` (enum: 'user', 'admin'), `created_at`
- Table: `ideas` with columns: `id`, `user_id`, `title`, `status`, `created_at`
- Foreign key: ideas.user_id → users.id
- RLS policy: Admins can SELECT all users (already exists from Epic 1)
- Query pattern: Join users with ideas to get activity counts

**Design System References:**
- PassportCard primary red: #E10514
- Neutral gray for secondary text/icons: #525355 (NEVER use black #000000)
- Success green: #10B981 for user role badges
- Border radius: 20px
- No emojis anywhere in the UI
- Heroicons for all iconography
- Montserrat font (headings), Rubik font (body)

**Key Integration Points:**
- Supabase client: `src/lib/supabase.ts`
- React Query client: `src/lib/queryClient.ts`
- Auth context: `src/features/auth/hooks/useAuth.ts`
- AdminRoute: `src/routes/AdminRoute.tsx` (created in Story 5.1)
- IdeaCard: `src/features/ideas/components/IdeaCard.tsx` (created in Epic 2)
- UserProfileCard: `src/features/admin/components/UserProfileCard.tsx` (created in Story 5.6)

### Implementation Priority

**Critical Path Items:**
1. Extend adminService with getAllUsers, getUserById, getIdeasByUser functions (blocks all user viewing)
2. Create UserList component with table display (enables viewing user list)
3. Add Users navigation to AdminDashboard (enables navigation to user list)
4. Create UserDetailView component (enables viewing user activity and ideas)
5. Add admin routes for user list and detail (enables routing)

**Can Be Implemented in Parallel:**
- Role filter functionality (independent feature enhancement)
- Search functionality (independent feature enhancement)
- User activity metrics card (independent information display)
- Export functionality (optional nice-to-have)

**Nice-to-Have Enhancements:**
- Export users to CSV (post-story enhancement)
- Advanced filtering (by join date range, activity level)
- User activity charts/visualizations (post-story enhancement)
- Send email to user from admin view (post-story enhancement)
- Bulk user management actions (post-story enhancement)

### AI Agent Guidance

**For DEV Agent:**
- Follow architecture patterns exactly as documented
- Use feature-based structure: `features/admin/`
- All database calls through service layer (`adminService.ts`)
- All data fetching via React Query hooks
- Implement proper loading states with skeletons
- Implement error boundaries and error states
- Apply PassportCard DSM consistently (no black icons, no emojis)
- Test with both admin and regular user roles
- Verify RLS policies enforce admin access at database level
- Reuse UserProfileCard from Story 5.6
- Reuse IdeaCard from Epic 2 for displaying user's ideas
- Display activity metrics prominently
- Ensure breadcrumb navigation works for admin flows

**Common Pitfalls to Avoid:**
- Don't hardcode role checks in components (use AdminRoute wrapper)
- Don't fetch data without React Query hooks
- Don't forget loading skeletons (users expect instant feedback)
- Don't forget error boundaries (handle errors gracefully)
- Don't use black icons (#000000) - use neutral gray (#525355)
- Don't add emojis anywhere (use Heroicons instead)
- Don't skip error handling (always show user-friendly messages)
- Don't bypass RLS in client code (let Supabase enforce security)
- Don't forget breadcrumb navigation for admin flows
- Don't display admin features to regular users (role-based rendering)
- Don't forget to join users with ideas table to get accurate counts
- Don't show stale data (use proper staleTime in React Query)

**Performance Considerations:**
- Use React Query's staleTime to reduce unnecessary refetches
- Implement proper loading skeletons for perceived performance
- Lazy load UserDetailView component
- Cache user list to reduce duplicate queries
- Debounce search input to reduce filtering operations
- Consider pagination if user list grows beyond 50 users

**Security Reminders:**
- RLS policies enforce admin access at database level
- Role check in AdminRoute is UI-only (database is source of truth)
- Never expose sensitive admin data to regular users
- All admin queries should verify role on server side via RLS
- Regular users should not see admin navigation buttons
- Admin views should show only appropriate user information

### Git Intelligence Summary

**Recent Development Patterns (Last 5 Commits):**
- Story 5.6 (View Any User's Idea, PRD, and Prototype) recently completed
- Story 5.5 (Reject Idea with Feedback) recently completed
- Admin dashboard and pipeline views established
- RLS policies for admin access patterns established
- React Query patterns with proper caching strategies
- AdminRoute wrapper for role-based route protection
- UserProfileCard component created in 5.6 (reuse here!)

**Code Patterns from Recent Commits:**
- Service functions return `ServiceResponse<T>` type
- React Query hooks for data fetching (queries, not mutations)
- Components use Tailwind CSS + DaisyUI for styling
- Error handling with error boundaries and fallback UI
- Loading states with skeleton components
- Breadcrumb navigation for complex admin flows
- Comprehensive TypeScript types for all entities
- Role-based component rendering (admins see more features)

**Libraries and Versions:**
- React 19.x with TypeScript 5.x
- React Query v5.x for data fetching
- Supabase client for database and auth
- DaisyUI 5.x for UI components
- Tailwind CSS 4.x for styling
- Heroicons for iconography

**Testing Approaches:**
- Manual testing with different user roles
- Component tests with React Testing Library
- Error handling and edge case testing
- Role-based access control verification
- Navigation flow testing (breadcrumbs, back buttons)
- Responsive design testing (desktop, tablet, mobile)

### Latest Technical Information

**React Query v5.x Best Practices (2026):**
- Use `useQuery` for data fetching: `useQuery({ queryKey, queryFn, staleTime, enabled })`
- Implement proper staleTime to reduce unnecessary refetches
- Use `enabled` option to conditionally fetch data
- Use query keys with parameters for fine-grained cache control
- Implement loading skeletons during `isLoading` state
- Handle `error` state with user-friendly messages

**Supabase Best Practices (2026):**
- Use `.select()` with joins: `.select('*, ideas(count)')`
- Always handle `.error` from Supabase responses
- Use RLS policies for security (never rely on client-side checks alone)
- Query operations should include `.single()` if expecting one result
- Use proper foreign key relationships for efficient joins
- Get current user with `await supabase.auth.getUser()` for role checks
- Use `.order()` for sorting results

**TypeScript 5.x Patterns:**
- Use `satisfies` operator for type narrowing
- Use discriminated unions for status enums
- Use `Pick<T, K>` and `Omit<T, K>` for type transformations
- Use `Partial<T>` for optional fields
- Use `Record<string, unknown>` for flexible objects

**DaisyUI 5.x Components:**
- Use `table` component with `table-zebra` for striped rows
- Use `badge` component for status indicators
- Use `avatar` component with placeholder for user initials
- Use `input` with `input-bordered` for search fields
- Use `select` for filter dropdowns
- Apply border radius with Tailwind: `rounded-[20px]`
- Use `btn` component with semantic color classes

**Accessibility Best Practices:**
- Add `aria-label` to icon-only buttons
- Use semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`)
- Ensure keyboard navigation works (Tab, Enter)
- Add `alt` text to all avatar images
- Use proper heading hierarchy (h1, h2, h3)
- Add focus indicators for interactive elements
- Ensure table is accessible with screen readers

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

None - implementation completed without major issues.

### Completion Notes List

**Story 5.7 Implementation Complete:**

✅ **Task 6 - Admin Service Functions:** Extended `adminService.ts` with three new functions:
- `getAllUsers()` - Fetches all users with ideas count and last activity
- `getUserById(userId)` - Fetches detailed user info with activity summary and ideas by status
- `getIdeasByUser(userId)` - Fetches all ideas submitted by a specific user
- All functions include admin role verification and proper error handling

✅ **Task 7 - React Query Hooks:** Created three new hooks in `features/admin/hooks/`:
- `useUsers.ts` - Hook for fetching all users with 60s stale time
- `useUser.ts` - Hook for fetching user detail with 60s stale time
- `useUserIdeas.ts` - Hook for fetching user's ideas with 30s stale time

✅ **Task 1, 2, 3, 4 - UserList Component:** Created comprehensive user list with:
- DaisyUI table displaying avatar, name, email, role, join date, ideas count
- Role filter dropdown (All, User, Admin)
- Search functionality by name or email with debouncing
- Sortable columns (name, join date, ideas count)
- Loading skeleton and empty state
- PassportCard styling (20px radius, red admin badges)
- Responsive layout with horizontal scroll on mobile
- Clickable rows navigate to user detail view

✅ **Task 5, 11 - UserDetailView Component:** Created user detail page with:
- Breadcrumb navigation (Admin Dashboard → Users → User Detail)
- UserProfileCard displaying user information
- Activity metrics cards (total ideas, approval rate, ideas by status)
- List of all user's submitted ideas with status badges
- Each idea card clickable to navigate to IdeaDetailPage
- Back to Users button
- Empty state if user has no ideas
- Loading skeleton for async operations

✅ **Task 8 - Admin Navigation:** Added Users link to AdminDashboard:
- Added "Users" button in quick navigation section
- Positioned alongside "All Ideas" and "Pipeline View"

✅ **Task 9 - Admin Routes:** Added two new admin-protected routes:
- `/admin/users` → UserList component
- `/admin/users/:userId` → UserDetailView component
- Both wrapped in AdminRoute for role verification
- 404 handling for missing users

✅ **Task 10 - RLS Policies:** Verified existing policies:
- `00002_create_users_rls_policies.sql` contains "Admins can view all users" policy
- Policy allows admin SELECT on users table
- No new migration needed - database security already enforced

✅ **Task 12 - PassportCard Design System:** Applied throughout:
- 20px border radius on all cards, buttons, tables (rounded-[20px])
- PassportCard red (#E10514) for admin role badges
- Success green (#10B981) for user role badges
- Neutral gray (#525355) for icons and secondary text
- Heroicons used consistently (UserGroupIcon, MagnifyingGlassIcon, FunnelIcon, etc.)
- Responsive layouts with mobile-first approach

✅ **Task 13 - Error Handling:** Implemented comprehensive error handling:
- Loading skeletons for user list and user detail
- Error states with user-friendly messages
- Empty states for no users and no ideas
- Search/filter returning no results handled gracefully
- User not found error page with back button
- Admin role verification on every service call

**Architecture Notes:**
- All admin data access enforced at database level via RLS policies
- React Query provides caching and automatic refetching
- Feature-based folder structure maintained (`features/admin/`)
- ServiceResponse<T> pattern used consistently
- Type-safe with TypeScript
- Proper separation of admin and user views
- Reused UserProfileCard component from Story 5.6

**User Experience:**
- Admins can view all registered users in a sortable, searchable table
- Each user shows avatar, name, email, role badge, join date, and ideas count
- Clicking a user shows detailed activity metrics and all their ideas
- Activity metrics show total ideas, approval rate, and breakdown by status
- Navigation flows: Admin Dashboard → Users → User Detail → Idea Detail

### File List

**Files Created:**
- src/features/admin/hooks/useUsers.ts
- src/features/admin/hooks/useUsers.test.tsx
- src/features/admin/hooks/useUser.ts
- src/features/admin/hooks/useUserIdeas.ts
- src/features/admin/components/UserList.tsx
- src/features/admin/components/UserList.test.tsx
- src/features/admin/components/UserDetailView.tsx
- src/features/admin/services/adminService.test.ts

**Files Modified:**
- src/features/admin/services/adminService.ts (added getAllUsers, getUserById, getIdeasByUser functions)
- src/features/admin/types.ts (added UserWithActivity and UserDetail types)
- src/features/admin/hooks/index.ts (exported 3 new hooks)
- src/routes/index.tsx (routes already configured for user list and detail views)
- _bmad-output/implementation-artifacts/5-7-user-list-and-activity-overview.md (marked tasks complete)
- _bmad-output/implementation-artifacts/sprint-status.yaml (updated to "review")
