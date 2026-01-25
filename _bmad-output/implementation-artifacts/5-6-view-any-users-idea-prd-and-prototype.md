# Story 5.6: View Any User's Idea, PRD, and Prototype

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin**,
I want **to view the complete details of any user's submission**,
So that **I can make informed decisions and track progress through the innovation pipeline**.

## Acceptance Criteria

**Given** I am an admin viewing the ideas list
**When** I click on any idea
**Then** I see the full idea details (problem, solution, impact - original and enhanced)
**And** I see the submitter's name and submission history
**And** if a PRD exists, I can click through to view it
**And** if a prototype exists, I can click through to view it
**And** I can see the complete journey: idea → PRD → prototype

## Tasks / Subtasks

- [ ] Task 1: Extend IdeaDetailPage with admin view capabilities (AC: Admin sees full details)
  - [ ] Subtask 1.1: Check if current user has admin role via useAuth hook
  - [ ] Subtask 1.2: If admin viewing another user's idea, display submitter name and email prominently
  - [ ] Subtask 1.3: Show submission timestamp and status history (submitted at, approved at, etc.)
  - [ ] Subtask 1.4: Display both original and AI-enhanced versions of problem, solution, impact
  - [ ] Subtask 1.5: Add "View as User" toggle to see what idea creator sees
  - [ ] Subtask 1.6: Show all status change timestamps (submitted_at, status_updated_at)

- [ ] Task 2: Add PRD navigation from IdeaDetailPage (AC: Click through to view PRD)
  - [ ] Subtask 2.1: Query prd_documents table to check if PRD exists for idea_id
  - [ ] Subtask 2.2: If PRD exists, display "View PRD" button in idea detail header
  - [ ] Subtask 2.3: Button routes to PrdViewer page: /admin/prds/{prd_id}
  - [ ] Subtask 2.4: Pass idea_id and user_id in navigation state for context
  - [ ] Subtask 2.5: If PRD status is 'draft', show badge "PRD In Progress"
  - [ ] Subtask 2.6: If PRD status is 'complete', show badge "PRD Complete"
  - [ ] Subtask 2.7: If no PRD exists, show disabled button with tooltip "No PRD yet"

- [ ] Task 3: Add Prototype navigation from IdeaDetailPage (AC: Click through to view prototype)
  - [ ] Subtask 3.1: Query prototypes table to check if prototype exists for idea_id
  - [ ] Subtask 3.2: If prototype exists, display "View Prototype" button in idea detail header
  - [ ] Subtask 3.3: Button routes to PrototypeViewer page: /admin/prototypes/{prototype_id}
  - [ ] Subtask 3.4: Pass idea_id and prd_id in navigation state for context
  - [ ] Subtask 3.5: If prototype status is 'generating', show badge "Generating..." with spinner
  - [ ] Subtask 3.6: If prototype status is 'ready', show badge "Prototype Ready"
  - [ ] Subtask 3.7: If no prototype exists, show disabled button with tooltip "No prototype yet"

- [ ] Task 4: Create AdminPrdViewer component (AC: View any user's PRD)
  - [ ] Subtask 4.1: Create AdminPrdViewer.tsx in features/admin/components/
  - [ ] Subtask 4.2: Load PRD document by prd_id using prdService.getById()
  - [ ] Subtask 4.3: Display PRD owner information (user name, email) at top
  - [ ] Subtask 4.4: Show PRD creation date and completion date if complete
  - [ ] Subtask 4.5: Render all PRD sections in readable format (Problem Statement, Goals, User Stories, etc.)
  - [ ] Subtask 4.6: Display PRD status badge (draft vs complete)
  - [ ] Subtask 4.7: Add breadcrumb navigation: Admin Dashboard → Ideas → Idea Detail → PRD
  - [ ] Subtask 4.8: If PRD is draft, show chat history in collapsible section
  - [ ] Subtask 4.9: Add "Back to Idea" button to return to IdeaDetailPage
  - [ ] Subtask 4.10: If idea has prototype, show "View Prototype" button

- [ ] Task 5: Create AdminPrototypeViewer component (AC: View any user's prototype)
  - [ ] Subtask 5.1: Create AdminPrototypeViewer.tsx in features/admin/components/
  - [ ] Subtask 5.2: Load prototype by prototype_id using prototypeService.getById()
  - [ ] Subtask 5.3: Display prototype owner information (user name, email) at top
  - [ ] Subtask 5.4: Show prototype generation timestamp and version number
  - [ ] Subtask 5.5: Render prototype in iframe with responsive viewport toggles (desktop/tablet/mobile)
  - [ ] Subtask 5.6: Display prototype status badge (generating/ready/failed)
  - [ ] Subtask 5.7: Add breadcrumb navigation: Admin Dashboard → Ideas → Idea Detail → Prototype
  - [ ] Subtask 5.8: Show refinement history in collapsible section if refinements exist
  - [ ] Subtask 5.9: Add "Back to Idea" button to return to IdeaDetailPage
  - [ ] Subtask 5.10: Add "View PRD" button to navigate to PRD if exists

- [ ] Task 6: Update adminService with cross-user data access functions (AC: Admins see all data)
  - [ ] Subtask 6.1: Add getIdeaWithDetails(ideaId) function to adminService
  - [ ] Subtask 6.2: Query ideas table with join to users table for submitter info
  - [ ] Subtask 6.3: Include related PRD and prototype IDs if they exist
  - [ ] Subtask 6.4: Add getPrdById(prdId) function with admin bypass of RLS
  - [ ] Subtask 6.5: Add getPrototypeById(prototypeId) function with admin bypass of RLS
  - [ ] Subtask 6.6: Return ServiceResponse<T> for all functions following architecture pattern
  - [ ] Subtask 6.7: Handle errors gracefully with user-friendly messages

- [ ] Task 7: Add submission history timeline to IdeaDetailPage (AC: See complete journey)
  - [ ] Subtask 7.1: Create SubmissionTimeline component in features/admin/components/
  - [ ] Subtask 7.2: Display timeline showing: Submitted → Approved/Rejected → PRD Started → PRD Complete → Prototype Generated
  - [ ] Subtask 7.3: Show timestamps for each stage with relative time (e.g., "2 days ago")
  - [ ] Subtask 7.4: Use visual timeline with connectors between stages
  - [ ] Subtask 7.5: Highlight current stage in timeline
  - [ ] Subtask 7.6: Show admin who approved/rejected with their name
  - [ ] Subtask 7.7: If stage not reached yet, show in gray/disabled state
  - [ ] Subtask 7.8: Only display timeline for admins (hide from regular users)

- [ ] Task 8: Add admin routes for PRD and Prototype viewers (AC: Admin can navigate)
  - [ ] Subtask 8.1: Add AdminRoute wrapper for /admin/prds/:prdId route
  - [ ] Subtask 8.2: Add AdminRoute wrapper for /admin/prototypes/:prototypeId route
  - [ ] Subtask 8.3: Configure React Router with these new admin routes
  - [ ] Subtask 8.4: Handle 404 if PRD or prototype not found (show error page)
  - [ ] Subtask 8.5: Redirect non-admin users to dashboard if they try to access these routes
  - [ ] Subtask 8.6: Preserve navigation state (where admin came from) for back button

- [ ] Task 9: Update RLS policies for admin access (AC: Database enforces admin access)
  - [ ] Subtask 9.1: Verify RLS policy on prd_documents allows admin to SELECT all rows
  - [ ] Subtask 9.2: Verify RLS policy on prototypes allows admin to SELECT all rows
  - [ ] Subtask 9.3: Verify RLS policy on prd_messages allows admin to SELECT all rows (for chat history)
  - [ ] Subtask 9.4: If policies don't exist, create migration: 00009_admin_view_all_policies.sql
  - [ ] Subtask 9.5: Policy rule: `SELECT` permission WHERE `auth.jwt() ->> 'role' = 'admin'` OR user_id = auth.uid()
  - [ ] Subtask 9.6: Test policies with admin and regular user accounts

- [ ] Task 10: Add user profile information display (AC: See submitter info)
  - [ ] Subtask 10.1: Create UserProfileCard component in features/admin/components/
  - [ ] Subtask 10.2: Display user avatar (initials if no photo) with PassportCard styling
  - [ ] Subtask 10.3: Show user full name, email, and role badge
  - [ ] Subtask 10.4: Display join date and total ideas submitted count
  - [ ] Subtask 10.5: Add link to view all ideas by this user (filter ideas by user_id)
  - [ ] Subtask 10.6: Position UserProfileCard in IdeaDetailPage sidebar (desktop) or top (mobile)

- [ ] Task 11: Integrate PassportCard DaisyUI theme throughout (AC: Consistent branding)
  - [ ] Subtask 11.1: Use DaisyUI card component for IdeaDetailPage sections
  - [ ] Subtask 11.2: Apply PassportCard red (#E10514) for primary actions (view buttons)
  - [ ] Subtask 11.3: Use Heroicons for all icons (eye icon for "view" actions)
  - [ ] Subtask 11.4: Apply 20px border radius to all cards, buttons, and panels
  - [ ] Subtask 11.5: Use Montserrat font for headings, Rubik for body
  - [ ] Subtask 11.6: Apply DSM shadows and spacing tokens consistently
  - [ ] Subtask 11.7: Style timeline with PassportCard colors (active stages in red, future stages in gray)
  - [ ] Subtask 11.8: Ensure responsive layout works on mobile (stacked layout)

- [ ] Task 12: Handle edge cases and error states (AC: Robust error handling)
  - [ ] Subtask 12.1: Handle case where idea exists but user was deleted (show "User removed")
  - [ ] Subtask 12.2: Handle case where PRD exists but content is malformed (show error, don't crash)
  - [ ] Subtask 12.3: Handle case where prototype generation failed (show failure reason)
  - [ ] Subtask 12.4: Handle case where admin loses permissions mid-session (redirect to login)
  - [ ] Subtask 12.5: Handle case where idea is deleted while admin is viewing (show "Idea no longer exists")
  - [ ] Subtask 12.6: Add loading skeletons for all async data loads (idea, PRD, prototype)
  - [ ] Subtask 12.7: Validate admin role on every admin route access (not just initial load)

## Dev Notes

### Architecture Alignment

**Feature Location:**
- AdminPrdViewer: `src/features/admin/components/AdminPrdViewer.tsx`
- AdminPrototypeViewer: `src/features/admin/components/AdminPrototypeViewer.tsx`
- SubmissionTimeline: `src/features/admin/components/SubmissionTimeline.tsx`
- UserProfileCard: `src/features/admin/components/UserProfileCard.tsx`
- AdminService: `src/features/admin/services/adminService.ts` (extend existing)

**Integration Points:**
- IdeaDetailPage: `src/features/ideas/components/IdeaDetailPage.tsx` (extend with admin capabilities)
- AdminRoute: `src/routes/AdminRoute.tsx` (add new routes)
- React Router: `src/routes/index.tsx` (configure admin PRD/prototype routes)

**Database Operations:**
- Tables: `ideas`, `prd_documents`, `prototypes`, `prd_messages`, `users`
- Admin queries join across tables to get complete submission details
- RLS policies enforce admin access at database level

**State Management:**
- React Query for all data fetching
- Query keys: `['admin', 'idea', ideaId]`, `['admin', 'prd', prdId]`, `['admin', 'prototype', prototypeId]`
- Cache invalidation on idea status changes
- Loading states for all async operations

**UI Components:**
- DaisyUI components: `card`, `badge`, `btn`, `breadcrumbs`, `timeline`, `avatar`
- Heroicons: `eye` for view actions, `document-text` for PRD, `desktop-computer` for prototype
- Timeline visualization with CSS flexbox
- Responsive design with mobile-first approach

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/admin/`
- Naming: PascalCase for components (`AdminPrdViewer.tsx`)
- Service: camelCase functions (`getIdeaWithDetails`)
- React Query hooks: `useAdminIdea`, `useAdminPrd`, `useAdminPrototype`

**Error Handling:**
- Wrap in `<ErrorBoundary>` at feature level
- Loading skeletons for all data fetches
- Error states with retry buttons
- 404 pages for missing ideas/PRDs/prototypes
- Log errors to console for debugging

**Data Format:**
- Service function signatures:
  ```typescript
  async function getIdeaWithDetails(ideaId: string): Promise<ServiceResponse<IdeaWithDetails>> {
    // Query ideas with join to users for submitter info
    // Include prd_id and prototype_id if they exist
    // Return complete idea object with related IDs
  }
  
  async function getPrdById(prdId: string): Promise<ServiceResponse<PrdDocument>> {
    // Admin bypass RLS to get any PRD
    // Include all PRD sections and metadata
    // Return PRD with user info
  }
  
  async function getPrototypeById(prototypeId: string): Promise<ServiceResponse<Prototype>> {
    // Admin bypass RLS to get any prototype
    // Include prototype URL, code, refinement history
    // Return prototype with user info
  }
  ```

- Updated types:
  ```typescript
  interface IdeaWithDetails extends Idea {
    submitter: {
      id: string;
      name: string;
      email: string;
      role: 'user' | 'admin';
    };
    prd_id?: string | null;
    prototype_id?: string | null;
    submission_timestamps: {
      submitted_at: string;
      approved_at?: string | null;
      rejected_at?: string | null;
      prd_started_at?: string | null;
      prd_completed_at?: string | null;
      prototype_generated_at?: string | null;
    };
  }
  ```

**Supabase Query:**
```typescript
// Get idea with user and related data
const { data, error } = await supabase
  .from('ideas')
  .select(`
    *,
    submitter:users!user_id (id, name, email, role),
    prd_documents (id, status, created_at, updated_at),
    prototypes (id, status, url, created_at)
  `)
  .eq('id', ideaId)
  .single();

// Admin query PRD (bypasses user RLS)
const { data: { user } } = await supabase.auth.getUser();
const isAdmin = user?.user_metadata?.role === 'admin';

if (!isAdmin) {
  return { data: null, error: new Error('Unauthorized') };
}

const { data, error } = await supabase
  .from('prd_documents')
  .select('*, idea:ideas(title), creator:users(name, email)')
  .eq('id', prdId)
  .single();
```

**RLS Policy Check:**
- Policy name: `admin_view_all_prds` (new policy)
- Rule: `SELECT` permission on `prd_documents` table WHERE `auth.jwt() ->> 'role' = 'admin'` OR user_id = auth.uid()
- Similar policy for `prototypes` table

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
// Hook for fetching idea with details
export function useAdminIdea(ideaId: string) {
  return useQuery({
    queryKey: ['admin', 'idea', ideaId],
    queryFn: () => adminService.getIdeaWithDetails(ideaId),
    staleTime: 30000, // 30 seconds
    enabled: !!ideaId,
  });
}

// Hook for fetching PRD
export function useAdminPrd(prdId: string) {
  return useQuery({
    queryKey: ['admin', 'prd', prdId],
    queryFn: () => adminService.getPrdById(prdId),
    staleTime: 60000, // 1 minute
    enabled: !!prdId,
  });
}

// Hook for fetching prototype
export function useAdminPrototype(prototypeId: string) {
  return useQuery({
    queryKey: ['admin', 'prototype', prototypeId],
    queryFn: () => adminService.getPrototypeById(prototypeId),
    staleTime: 60000, // 1 minute
    enabled: !!prototypeId,
  });
}
```

### File Structure Requirements

**Files to Create:**
```
src/features/admin/
├── components/
│   ├── AdminPrdViewer.tsx           ← View any user's PRD
│   ├── AdminPrototypeViewer.tsx     ← View any user's prototype
│   ├── SubmissionTimeline.tsx       ← Visual journey timeline
│   └── UserProfileCard.tsx          ← Submitter info card
├── hooks/
│   ├── useAdminIdea.ts              ← Fetch idea with details
│   ├── useAdminPrd.ts               ← Fetch PRD by ID
│   └── useAdminPrototype.ts         ← Fetch prototype by ID
└── services/
    └── adminService.ts              ← Extend with cross-user access functions

supabase/migrations/
└── 00009_admin_view_all_policies.sql ← Admin RLS policies for PRD/prototype
```

**Files to Modify:**
- `src/features/ideas/components/IdeaDetailPage.tsx` - Add admin view capabilities, navigation buttons
- `src/routes/index.tsx` - Add admin PRD/prototype routes
- `src/features/admin/services/adminService.ts` - Add getIdeaWithDetails, getPrdById, getPrototypeById

**Database Migration (if needed):**
- `supabase/migrations/00009_admin_view_all_policies.sql` - Add admin SELECT policies for prd_documents and prototypes

### Testing Requirements

**Manual Testing Checklist:**
1. Login as admin → View All Ideas → Click any idea → See full details with submitter info
2. View idea with PRD → Click "View PRD" → Navigate to AdminPrdViewer → See complete PRD
3. View idea with prototype → Click "View Prototype" → Navigate to AdminPrototypeViewer → See working prototype
4. Check submission timeline displays correctly with all timestamps
5. Navigate back from PRD viewer to idea detail → Back button works
6. Navigate back from prototype viewer to idea detail → Back button works
7. View idea with no PRD → "View PRD" button is disabled with tooltip
8. View idea with no prototype → "View Prototype" button is disabled with tooltip
9. Login as regular user → Try to access /admin/prds/{id} → Redirected to dashboard
10. Login as regular user → View own idea → No admin-specific features visible
11. Admin views idea, PRD, prototype in sequence → Complete journey is traceable
12. Admin views idea from rejected stage → See rejection feedback and timeline
13. Admin views idea in PRD draft stage → See "PRD In Progress" badge, view chat history
14. Admin views idea with prototype refinement history → See all refinement versions
15. Test responsive layout on mobile → Timeline stacks vertically, navigation works

**Test Scenarios:**
- Admin views complete innovation journey: idea → PRD → prototype
- Admin views idea with no PRD yet → Only idea details visible
- Admin views idea with PRD but no prototype → Idea and PRD accessible, prototype button disabled
- User tries to access admin PRD view → Redirected (authorization check)
- Admin views deleted user's idea → Shows "User removed" gracefully
- Admin views malformed PRD data → Error handling shows friendly message
- Admin views failed prototype → Failure reason displayed clearly

**Edge Cases to Handle:**
- Idea exists but user was deleted (show "User removed")
- PRD content is malformed or corrupted (show error, don't crash)
- Prototype generation failed (show failure reason)
- Admin loses permissions mid-session (redirect to login)
- Idea deleted while admin viewing (show "Idea no longer exists")
- PRD/Prototype routes accessed directly without navigation state (still works)
- Very long PRD documents (add scrolling, don't break layout)
- Multiple prototype versions (show version selector)

### Architectural Constraints

**Enforce PassportCard Design System:**
- Primary color: #E10514 (PassportCard red) for primary actions
- Neutral gray: #525355 for icons (NEVER black #000000)
- Success color: #10B981 for status badges
- Border radius: 20px on all cards, buttons, panels
- Icons: Heroicons only
- No emojis anywhere (replace with icons or text)
- Fonts: Montserrat (headings), Rubik (body)

**Naming Conventions:**
- Database tables: snake_case (`prd_documents`, `user_id`)
- TypeScript: camelCase (functions, variables), PascalCase (components, types)
- Files: PascalCase.tsx for components, camelCase.ts for utilities
- Query keys: Array format `['admin', 'prd', prdId]`

**State Management Pattern:**
- React Query for ALL server data (no local state for server data)
- Query keys: `['admin', 'idea', ideaId]`, `['admin', 'prd', prdId]`, `['admin', 'prototype', prototypeId]`
- Stale time appropriate for each resource (30s for ideas, 60s for PRD/prototypes)
- Loading skeletons during data fetch
- Error states with retry buttons

**Error Pattern:**
```typescript
async function getIdeaWithDetails(ideaId: string) {
  try {
    // Check admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') {
      return { data: null, error: new Error('Unauthorized access') };
    }
    
    // Fetch idea with joins
    const { data, error } = await supabase
      .from('ideas')
      .select(`
        *,
        submitter:users!user_id (id, name, email, role),
        prd_documents (id, status, created_at),
        prototypes (id, status, url, created_at)
      `)
      .eq('id', ideaId)
      .single();
    
    if (error) {
      console.error('Failed to fetch idea:', error);
      return { data: null, error: new Error('Failed to load idea details') };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching idea:', error);
    return { data: null, error: new Error('An unexpected error occurred') };
  }
}
```

### Previous Story Intelligence

**Learnings from Story 5.5 (Reject Idea with Feedback):**
- adminService patterns established for admin-specific operations
- React Query hooks with proper caching strategies
- AdminRoute wrapper ensures only admins access admin routes
- RLS policies allow admins to access all data
- UserProfileCard pattern can be reused from this story
- Navigation patterns: breadcrumbs for complex admin flows
- Loading skeletons and error states for all data fetches

**Learnings from Story 5.4 (Approve Idea for PRD Development):**
- Admin actions integrated into IdeaDetailPage
- Status badges and action buttons in idea detail header
- Optimistic updates not needed (this is read-only view)
- Query cache patterns: `['admin', 'ideas']`, `['admin', 'pipeline']`

**Learnings from Story 3.9 (View Completed PRD):**
- PrdViewer component already exists for regular users
- AdminPrdViewer can reuse rendering logic, but add submitter info
- PRD sections already have structured display components
- Chat history display pattern established

**Learnings from Story 4.4 (Prototype Viewer with Responsive Preview):**
- PrototypeViewer component already exists for regular users
- AdminPrototypeViewer can reuse iframe and viewport toggle logic
- Device preview toggles (desktop/tablet/mobile) already implemented
- Refinement history display pattern established

**Key Differences from User Views:**
- Admin views include submitter information prominently
- Admin views show complete timeline/history of idea journey
- Admin can navigate between idea → PRD → prototype seamlessly
- Admin views bypass RLS restrictions to see all user data
- Admin views include metadata not visible to regular users (timestamps, admin actions)

**Files Created in Previous Stories (Reuse Patterns):**
- `src/features/ideas/components/IdeaDetailPage.tsx` - Extend for admin capabilities
- `src/features/prd/components/PrdViewer.tsx` - Reference for AdminPrdViewer
- `src/features/prototypes/components/PrototypeViewer.tsx` - Reference for AdminPrototypeViewer
- `src/features/admin/services/adminService.ts` - Extend with new functions

**Code Patterns Established:**
- React Query queries for data fetching (not mutations)
- Loading skeletons during async operations
- Error boundaries for component-level error handling
- Breadcrumb navigation for complex admin workflows
- Role-based component rendering (show admin features only to admins)

### Project Structure Notes

**Alignment with Unified Project Structure:**
- Feature-based organization: Admin viewing capabilities in `features/admin/`
- Shared UI components: Use `components/ui/` for Timeline, ProfileCard if reusable
- Service layer abstraction: All Supabase calls through `adminService.ts`
- Type safety: Define TypeScript types in `features/admin/types.ts`

**Detected Conflicts or Variances:**
- None. This story follows established architecture patterns exactly.
- Admin viewing mirrors user viewing but with additional permissions
- RLS policies provide database-level enforcement of admin access
- Navigation patterns follow existing admin route structure

### References

**Technical Details from Architecture:**
- [Source: architecture.md, lines 534-551] - Admin feature structure and components
- [Source: architecture.md, lines 159-167] - Authentication and RLS policies
- [Source: architecture.md, lines 247-264] - Naming conventions (database, TypeScript, files)
- [Source: architecture.md, lines 320-347] - State management patterns with React Query
- [Source: architecture.md, lines 609-617] - Data flow and component boundaries

**Functional Requirements from PRD:**
- [Source: epics.md, lines 1172-1187] - Story 5.6 complete acceptance criteria
- [Source: epics.md, lines 1064-1066] - Epic 5 goal and user value
- [Source: epics.md, lines 69-73] - FR35-FR40: Admin dashboard and triage requirements
- [Source: prd.md, lines 176-207] - Sarah's Innovation Manager journey
- FR39: Admins can view complete details of any user's idea, PRD, and prototype

**User Journey from Epics:**
- [Source: epics.md, lines 176-207] - Sarah's Innovation Manager journey
- Sarah needs complete visibility into innovation pipeline
- Admin can trace complete journey: idea → PRD → prototype
- Decision-making requires seeing full context of submissions
- Admin needs to understand submitter perspective and history
- Informed triage decisions require access to all submission details

**Database Schema:**
- Table: `ideas` with columns: `id`, `user_id`, `title`, `problem`, `solution`, `impact`, `status`, `created_at`, `updated_at`, `status_updated_at`
- Table: `prd_documents` with columns: `id`, `idea_id`, `user_id`, `content`, `status`, `created_at`, `updated_at`
- Table: `prototypes` with columns: `id`, `prd_id`, `idea_id`, `user_id`, `url`, `code`, `version`, `status`, `created_at`
- Table: `users` with columns: `id`, `email`, `name`, `role` (enum: 'user', 'admin')
- Foreign keys: ideas.user_id → users.id, prd_documents.idea_id → ideas.id, prototypes.idea_id → ideas.id
- RLS policies enforcing User vs Admin access already established in Epic 1

**Design System References:**
- PassportCard primary red: #E10514
- Neutral gray for icons: #525355 (NEVER use black #000000)
- Success green: #10B981
- Border radius: 20px
- No emojis anywhere in the UI
- Heroicons for all iconography
- Montserrat font (headings), Rubik font (body)

**Key Integration Points:**
- Supabase client: `src/lib/supabase.ts`
- React Query client: `src/lib/queryClient.ts`
- Auth context: `src/features/auth/hooks/useAuth.ts`
- AdminRoute: `src/routes/AdminRoute.tsx` (created in Story 5.1)
- PrdViewer: `src/features/prd/components/PrdViewer.tsx` (created in Story 3.9)
- PrototypeViewer: `src/features/prototypes/components/PrototypeViewer.tsx` (created in Story 4.4)

### Implementation Priority

**Critical Path Items:**
1. Extend adminService with cross-user access functions (blocks all admin viewing)
2. Update RLS policies for admin access to PRD/prototypes (blocks data access)
3. Extend IdeaDetailPage with admin capabilities (enables admin view of ideas)
4. Create AdminPrdViewer component (enables viewing any user's PRD)
5. Create AdminPrototypeViewer component (enables viewing any user's prototype)
6. Add admin routes for PRD and prototype viewers (enables navigation)

**Can Be Implemented in Parallel:**
- SubmissionTimeline component (independent visual enhancement)
- UserProfileCard component (independent information display)
- Breadcrumb navigation enhancements (independent UX improvement)

**Nice-to-Have Enhancements:**
- Export PRD as PDF (post-story enhancement)
- Print-friendly PRD view (post-story enhancement)
- Bookmark/favorite ideas (post-story enhancement)
- Admin notes on ideas (post-story enhancement)

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
- Ensure breadcrumb navigation works for complex flows
- Display submitter information prominently in admin views
- Show complete innovation journey timeline

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

**Performance Considerations:**
- Use React Query's staleTime to reduce unnecessary refetches
- Implement proper loading skeletons for perceived performance
- Lazy load AdminPrdViewer and AdminPrototypeViewer components
- Cache submitter info to reduce duplicate queries
- Prefetch PRD/prototype data when hovering over navigation buttons

**Security Reminders:**
- RLS policies enforce admin access at database level
- Role check in AdminRoute is UI-only (database is source of truth)
- Never expose sensitive admin data to regular users
- All admin queries should verify role on server side via RLS
- Regular users should not see admin navigation buttons
- Admin views should not expose other admins' internal notes (if added later)

### Git Intelligence Summary

**Recent Development Patterns (Last 5 Commits):**
- Story 5.5 (Reject Idea with Feedback) recently completed
- Story 5.4 (Approve Idea for PRD Development) recently completed
- Admin dashboard and pipeline views established
- RLS policies for admin access patterns established
- React Query patterns with proper caching strategies
- AdminRoute wrapper for role-based route protection

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
- Use `.select()` with joins: `.select('*, users(name, email)')`
- Always handle `.error` from Supabase responses
- Use RLS policies for security (never rely on client-side checks alone)
- Query operations should include `.single()` if expecting one result
- Use proper foreign key relationships for efficient joins
- Get current user with `await supabase.auth.getUser()` for role checks

**TypeScript 5.x Patterns:**
- Use `satisfies` operator for type narrowing
- Use discriminated unions for status enums
- Use `Pick<T, K>` and `Omit<T, K>` for type transformations
- Use `Partial<T>` for optional fields
- Use `Record<string, unknown>` for flexible objects

**DaisyUI 5.x Components:**
- Use `card` component with `card-body` for structured layouts
- Use `badge` component for status indicators
- Use `btn` component with semantic color classes
- Use `breadcrumbs` component for navigation
- Use `timeline` component for submission history
- Apply border radius with Tailwind: `rounded-[20px]`
- Use `avatar` component for user profile display

**Accessibility Best Practices:**
- Add `aria-label` to icon-only buttons
- Use semantic HTML (`<nav>`, `<article>`, `<section>`)
- Ensure keyboard navigation works (Tab, Enter)
- Add `alt` text to all images
- Use proper heading hierarchy (h1, h2, h3)
- Add focus indicators for interactive elements

### Database Migration Required

**Add Admin RLS Policies for PRD and Prototypes:**
This story requires RLS policies to allow admins to SELECT any user's PRD and prototype data.

**Migration SQL:**
```sql
-- Add admin access to PRD documents and prototypes
-- File: supabase/migrations/00009_admin_view_all_policies.sql

-- Allow admins to view all PRD documents (not just their own)
CREATE POLICY "admin_view_all_prds"
ON prd_documents
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
  OR user_id = auth.uid()
);

-- Allow admins to view all prototypes (not just their own)
CREATE POLICY "admin_view_all_prototypes"
ON prototypes
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
  OR user_id = auth.uid()
);

-- Allow admins to view all PRD chat messages (for history display)
CREATE POLICY "admin_view_all_prd_messages"
ON prd_messages
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
  OR EXISTS (
    SELECT 1 FROM prd_documents
    WHERE prd_documents.id = prd_messages.prd_id
    AND prd_documents.user_id = auth.uid()
  )
);

-- Add comments for documentation
COMMENT ON POLICY "admin_view_all_prds" ON prd_documents IS 'Admins can view all PRD documents across all users';
COMMENT ON POLICY "admin_view_all_prototypes" ON prototypes IS 'Admins can view all prototypes across all users';
COMMENT ON POLICY "admin_view_all_prd_messages" ON prd_messages IS 'Admins can view all PRD chat messages for any PRD';
```

**Migration File Location:**
- `supabase/migrations/00009_admin_view_all_policies.sql`

**Testing Migration:**
1. Run migration in local Supabase instance: `supabase migration up`
2. Verify policies exist: Check Supabase dashboard → Database → Tables → Policies
3. Test admin can SELECT any user's PRD: `select * from prd_documents;` (as admin)
4. Test regular user can only SELECT their own PRD: `select * from prd_documents;` (as user)
5. Test admin can SELECT any user's prototype: `select * from prototypes;` (as admin)
6. Verify regular users cannot see other users' data (RLS enforcement)

**Note:** If these policies already exist from previous stories, this migration is not needed. Verify existing policies cover admin SELECT access.

## Dev Agent Record

### Agent Model Used

_To be filled by DEV agent during implementation_

### Debug Log References

_To be added by DEV agent during implementation_

### Completion Notes List

_To be added by DEV agent upon completion_

### File List

_To be populated by DEV agent with all files created/modified_
