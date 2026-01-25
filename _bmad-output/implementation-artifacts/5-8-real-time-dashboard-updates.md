# Story 5.8: Real-Time Dashboard Updates

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin**,
I want **the dashboard to update in real-time**,
So that **I always see the latest pipeline status without manual refresh**.

## Acceptance Criteria

**Given** I have the Admin Dashboard open
**When** a new idea is submitted by any user
**Then** the dashboard updates within 500ms
**And** the "Submitted" count increases
**And** the new idea appears in the recent submissions list

**Given** another admin approves or rejects an idea
**When** the action is taken
**Then** my dashboard reflects the change immediately
**And** I don't see stale data

## Tasks / Subtasks

- [ ] Task 1: Set up Supabase Realtime subscription for ideas table (AC: Dashboard updates within 500ms)
  - [ ] Subtask 1.1: Create useRealtimeIdeas hook in features/admin/hooks/
  - [ ] Subtask 1.2: Subscribe to Supabase Realtime channel for 'ideas' table
  - [ ] Subtask 1.3: Listen for INSERT, UPDATE, DELETE events on ideas table
  - [ ] Subtask 1.4: Invalidate React Query cache on realtime events
  - [ ] Subtask 1.5: Handle subscription cleanup on component unmount
  - [ ] Subtask 1.6: Add error handling for subscription failures
  - [ ] Subtask 1.7: Verify <500ms latency for dashboard updates
  - [ ] Subtask 1.8: Test with multiple browser windows (simulate multiple admins)

- [ ] Task 2: Integrate realtime updates into AdminDashboard (AC: Submitted count increases)
  - [ ] Subtask 2.1: Import useRealtimeIdeas hook in AdminDashboard component
  - [ ] Subtask 2.2: Enable realtime subscription when dashboard is mounted
  - [ ] Subtask 2.3: Update summary cards (submitted, approved, etc.) on realtime events
  - [ ] Subtask 2.4: Recalculate pipeline stage counts when ideas change
  - [ ] Subtask 2.5: Show subtle notification when dashboard updates (optional toast)
  - [ ] Subtask 2.6: Ensure no duplicate subscriptions if component re-renders
  - [ ] Subtask 2.7: Test count updates with idea submission, approval, rejection

- [ ] Task 3: Update recent submissions list in real-time (AC: New idea appears in recent list)
  - [ ] Subtask 3.1: Invalidate 'recent-ideas' query on INSERT events
  - [ ] Subtask 3.2: Prepend new idea to recent submissions list
  - [ ] Subtask 3.3: Highlight newly added idea briefly (fade-in animation)
  - [ ] Subtask 3.4: Limit recent list to 10 items (remove oldest if exceeds)
  - [ ] Subtask 3.5: Sort by created_at descending (newest first)
  - [ ] Subtask 3.6: Test with multiple rapid submissions

- [ ] Task 4: Update IdeaPipeline Kanban view in real-time (AC: Pipeline reflects changes immediately)
  - [ ] Subtask 4.1: Integrate useRealtimeIdeas in IdeaPipeline component
  - [ ] Subtask 4.2: Move idea cards between columns on status UPDATE events
  - [ ] Subtask 4.3: Add new idea cards to appropriate column on INSERT events
  - [ ] Subtask 4.4: Remove idea cards on DELETE events
  - [ ] Subtask 4.5: Animate card movement between columns (smooth transition)
  - [ ] Subtask 4.6: Update column counts when ideas move
  - [ ] Subtask 4.7: Test with approval/rejection actions from another admin session

- [ ] Task 5: Enable Supabase Realtime on ideas table (AC: Database-level realtime support)
  - [ ] Subtask 5.1: Verify Supabase Realtime is enabled for ideas table
  - [ ] Subtask 5.2: If not enabled, run SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE ideas;`
  - [ ] Subtask 5.3: Create migration file: supabase/migrations/00011_enable_realtime_ideas.sql
  - [ ] Subtask 5.4: Test realtime subscription connects successfully
  - [ ] Subtask 5.5: Verify RLS policies don't block realtime events for admins
  - [ ] Subtask 5.6: Document realtime configuration in architecture notes

- [ ] Task 6: Optimize React Query cache invalidation strategy (AC: No stale data)
  - [ ] Subtask 6.1: Invalidate specific query keys on realtime events
  - [ ] Subtask 6.2: Use queryClient.invalidateQueries(['admin', 'ideas']) on INSERT/UPDATE/DELETE
  - [ ] Subtask 6.3: Use queryClient.setQueryData for optimistic updates (optional)
  - [ ] Subtask 6.4: Avoid full page refetch (only invalidate affected queries)
  - [ ] Subtask 6.5: Test cache invalidation with network throttling
  - [ ] Subtask 6.6: Ensure no duplicate API calls after invalidation

- [ ] Task 7: Add visual feedback for realtime updates (AC: User knows dashboard is live)
  - [ ] Subtask 7.1: Add subtle "Live" indicator badge in dashboard header
  - [ ] Subtask 7.2: Show green dot next to "Live" when connected
  - [ ] Subtask 7.3: Show red dot if realtime connection fails
  - [ ] Subtask 7.4: Optional: Show toast notification "Dashboard updated" on changes
  - [ ] Subtask 7.5: Add fade-in animation for newly added items
  - [ ] Subtask 7.6: Use DaisyUI badge component for "Live" indicator
  - [ ] Subtask 7.7: Test visual feedback with multiple admins

- [ ] Task 8: Handle realtime subscription errors gracefully (AC: Graceful degradation)
  - [ ] Subtask 8.1: Catch subscription errors and log to console
  - [ ] Subtask 8.2: Show warning toast if realtime fails: "Live updates unavailable"
  - [ ] Subtask 8.3: Fall back to polling every 30 seconds if realtime fails
  - [ ] Subtask 8.4: Retry realtime connection after 10 seconds
  - [ ] Subtask 8.5: Limit retry attempts to 3 times
  - [ ] Subtask 8.6: Display "Refresh" button if realtime permanently fails
  - [ ] Subtask 8.7: Test error handling by disabling Supabase Realtime

- [ ] Task 9: Test realtime updates with multiple concurrent admins (AC: Multi-user support)
  - [ ] Subtask 9.1: Open dashboard in 2 browser windows (different admin accounts)
  - [ ] Subtask 9.2: Submit idea in one window, verify appears in other window
  - [ ] Subtask 9.3: Approve idea in one window, verify status updates in other window
  - [ ] Subtask 9.4: Reject idea in one window, verify status updates in other window
  - [ ] Subtask 9.5: Verify <500ms latency for all updates
  - [ ] Subtask 9.6: Test with 3+ concurrent admin sessions
  - [ ] Subtask 9.7: Verify no race conditions or duplicate updates

- [ ] Task 10: Optimize performance for realtime updates (AC: No performance degradation)
  - [ ] Subtask 10.1: Debounce rapid realtime events (batch updates within 100ms)
  - [ ] Subtask 10.2: Use React.memo for IdeaCard to prevent unnecessary re-renders
  - [ ] Subtask 10.3: Optimize query invalidation (only invalidate affected queries)
  - [ ] Subtask 10.4: Test with 10+ rapid idea submissions
  - [ ] Subtask 10.5: Measure dashboard re-render performance with React DevTools
  - [ ] Subtask 10.6: Ensure no memory leaks from subscriptions
  - [ ] Subtask 10.7: Profile with Chrome DevTools Performance tab

- [ ] Task 11: Document realtime architecture and patterns (AC: Knowledge transfer)
  - [ ] Subtask 11.1: Document useRealtimeIdeas hook usage in code comments
  - [ ] Subtask 11.2: Add architecture notes about Supabase Realtime integration
  - [ ] Subtask 11.3: Document cache invalidation strategy
  - [ ] Subtask 11.4: Add troubleshooting guide for realtime issues
  - [ ] Subtask 11.5: Update architecture.md with realtime patterns
  - [ ] Subtask 11.6: Document fallback polling strategy

- [ ] Task 12: Handle edge cases and error scenarios (AC: Robust error handling)
  - [ ] Subtask 12.1: Handle case where admin loses network connection mid-session
  - [ ] Subtask 12.2: Handle case where Supabase Realtime service is down
  - [ ] Subtask 12.3: Handle case where subscription exceeds Supabase free tier limits
  - [ ] Subtask 12.4: Handle case where idea is deleted while admin viewing
  - [ ] Subtask 12.5: Handle case where multiple admins edit same idea simultaneously
  - [ ] Subtask 12.6: Show "Reconnecting..." message during connection issues
  - [ ] Subtask 12.7: Automatically reconnect when network restored

## Dev Notes

### Architecture Alignment

**Feature Location:**
- useRealtimeIdeas hook: `src/features/admin/hooks/useRealtimeIdeas.ts`
- AdminDashboard: `src/features/admin/components/AdminDashboard.tsx` (modify)
- IdeaPipeline: `src/features/admin/components/IdeaPipeline.tsx` (modify)
- RealtimeIndicator: `src/features/admin/components/RealtimeIndicator.tsx` (new)

**Integration Points:**
- Supabase Realtime: `src/lib/supabase.ts` (Realtime channel subscription)
- React Query: `src/lib/queryClient.ts` (cache invalidation on realtime events)
- AdminDashboard: Integrate useRealtimeIdeas hook
- IdeaPipeline: Integrate useRealtimeIdeas hook for live Kanban updates

**Database Operations:**
- Table: `ideas` (enable Supabase Realtime)
- Realtime events: INSERT, UPDATE, DELETE
- RLS policies: Admins receive realtime events for all ideas
- Migration: `supabase/migrations/00011_enable_realtime_ideas.sql`

**State Management:**
- Supabase Realtime subscription for ideas table
- React Query cache invalidation on realtime events
- Optimistic updates for immediate UI feedback (optional)
- No local state for realtime data (rely on React Query cache)

**UI Components:**
- RealtimeIndicator: Badge showing "Live" with connection status
- Toast notifications for realtime updates (optional)
- Fade-in animations for newly added items
- Smooth transitions for status changes

### Technical Requirements from Architecture

**Supabase Realtime Pattern:**
```typescript
// useRealtimeIdeas hook pattern
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useRealtimeIdeas() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to ideas table changes
    const channel = supabase
      .channel('ideas-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'ideas',
        },
        (payload) => {
          console.log('Realtime event:', payload);
          
          // Invalidate relevant queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['admin', 'ideas'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'recent-ideas'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
```

**Enable Realtime on Ideas Table (Migration):**
```sql
-- supabase/migrations/00011_enable_realtime_ideas.sql

-- Enable Realtime for ideas table
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;

-- Verify RLS policies allow admins to receive realtime events
-- (Existing RLS policies should already handle this)
```

**React Query Cache Invalidation Strategy:**
```typescript
// Invalidate specific queries on realtime events
queryClient.invalidateQueries({ queryKey: ['admin', 'ideas'] });
queryClient.invalidateQueries({ queryKey: ['admin', 'recent-ideas'] });
queryClient.invalidateQueries({ queryKey: ['admin', 'pipeline'] });

// Optional: Optimistic update for immediate UI feedback
queryClient.setQueryData(['admin', 'ideas'], (oldData) => {
  // Update cache with new data from realtime event
  return [...oldData, newIdea];
});
```

**Realtime Indicator Component:**
```typescript
// RealtimeIndicator.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function RealtimeIndicator() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = supabase.channel('connection-status');
    
    channel.subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED');
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="badge badge-sm gap-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`} />
      <span>{isConnected ? 'Live' : 'Offline'}</span>
    </div>
  );
}
```

**Integration into AdminDashboard:**
```typescript
// AdminDashboard.tsx
import { useRealtimeIdeas } from '@/features/admin/hooks/useRealtimeIdeas';
import { RealtimeIndicator } from '@/features/admin/components/RealtimeIndicator';

export function AdminDashboard() {
  // Enable realtime updates
  useRealtimeIdeas();

  return (
    <div>
      <header className="flex justify-between items-center">
        <h1>Admin Dashboard</h1>
        <RealtimeIndicator />
      </header>
      {/* Rest of dashboard */}
    </div>
  );
}
```

**Performance Optimization - Debounce Rapid Events:**
```typescript
// Debounce rapid realtime events to batch updates
import { debounce } from 'lodash-es'; // or implement custom debounce

const invalidateQueries = debounce(() => {
  queryClient.invalidateQueries({ queryKey: ['admin', 'ideas'] });
}, 100); // Batch updates within 100ms
```

**Fallback Polling Strategy:**
```typescript
// If realtime fails, fall back to polling
const [realtimeFailed, setRealtimeFailed] = useState(false);

useEffect(() => {
  if (realtimeFailed) {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ideas'] });
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}, [realtimeFailed, queryClient]);
```

### Library & Framework Requirements

**Dependencies Already Installed:**
- @supabase/supabase-js (includes Realtime support)
- @tanstack/react-query (for cache invalidation)
- React 19.x with TypeScript 5.x
- DaisyUI 5.x for RealtimeIndicator badge

**No Additional Dependencies Needed**

**Supabase Realtime API:**
- Channel subscription: `supabase.channel(name)`
- Event listener: `.on('postgres_changes', config, handler)`
- Subscribe: `.subscribe(callback)`
- Cleanup: `supabase.removeChannel(channel)`

**React Query Invalidation:**
- Invalidate queries: `queryClient.invalidateQueries({ queryKey })`
- Set query data: `queryClient.setQueryData(queryKey, updater)`
- Refetch queries: `queryClient.refetchQueries({ queryKey })`

**Performance Optimization:**
- Debounce rapid events: Use lodash-es `debounce` or custom implementation
- React.memo for components: Prevent unnecessary re-renders
- Selective invalidation: Only invalidate affected queries

### File Structure Requirements

**Files to Create:**
```
src/features/admin/
├── hooks/
│   └── useRealtimeIdeas.ts         ← Supabase Realtime subscription hook
├── components/
│   └── RealtimeIndicator.tsx       ← Live connection status badge
```

**Files to Modify:**
- `src/features/admin/components/AdminDashboard.tsx` - Integrate useRealtimeIdeas hook
- `src/features/admin/components/IdeaPipeline.tsx` - Integrate realtime updates for Kanban
- `src/lib/supabase.ts` - Verify Realtime is enabled (no code changes needed)

**Database Migration:**
- `supabase/migrations/00011_enable_realtime_ideas.sql` - Enable Realtime on ideas table

### Testing Requirements

**Manual Testing Checklist:**
1. Open Admin Dashboard in two browser windows (different admin accounts)
2. Submit new idea in one window → Verify appears in other window within 500ms
3. Approve idea in one window → Verify status updates in other window
4. Reject idea in one window → Verify status updates in other window
5. Delete idea in one window → Verify removed from other window
6. Verify "Live" indicator shows green dot when connected
7. Disable Supabase Realtime → Verify "Offline" indicator shows red dot
8. Verify fallback polling activates when realtime fails
9. Test with 3+ concurrent admin sessions
10. Verify no duplicate updates or race conditions
11. Test network interruption → Verify reconnection works
12. Verify <500ms latency for all realtime updates
13. Test with 10+ rapid idea submissions → Verify no performance degradation
14. Verify memory leaks don't occur (check Chrome DevTools Memory tab)
15. Verify React Query cache invalidation works correctly

**Test Scenarios:**
- Admin views dashboard while another admin submits idea
- Admin views dashboard while another admin approves/rejects idea
- Multiple admins view dashboard simultaneously (3+ sessions)
- Realtime connection fails mid-session
- Network interruption and reconnection
- Rapid idea submissions (10+ in quick succession)
- Admin loses permissions mid-session
- Supabase Realtime service is down

**Edge Cases to Handle:**
- Realtime subscription fails (show error, fall back to polling)
- Network connection lost (show "Reconnecting..." message)
- Supabase free tier limits exceeded (graceful degradation)
- Idea deleted while admin viewing (show "Idea no longer exists")
- Multiple admins edit same idea simultaneously (last write wins)
- Admin session expires (redirect to login)
- Very rapid realtime events (debounce to prevent UI thrashing)

### Architectural Constraints

**Enforce PassportCard Design System:**
- Primary color: #E10514 (PassportCard red) for "Live" indicator
- Success color: #10B981 for connected status (green dot)
- Error color: #EF4444 for disconnected status (red dot)
- Neutral gray: #525355 for secondary text
- Border radius: 20px on all components
- Icons: Heroicons only
- No emojis anywhere
- Fonts: Montserrat (headings), Rubik (body)

**Naming Conventions:**
- Hook: `useRealtimeIdeas` (camelCase)
- Component: `RealtimeIndicator` (PascalCase)
- File: `useRealtimeIdeas.ts`, `RealtimeIndicator.tsx`
- Query keys: `['admin', 'ideas']`, `['admin', 'recent-ideas']`, `['admin', 'pipeline']`

**State Management Pattern:**
- Supabase Realtime for live data updates
- React Query for cache invalidation (no local state for realtime data)
- Optimistic updates optional (use queryClient.setQueryData)
- Debounce rapid events to batch updates

**Error Pattern:**
```typescript
// Error handling for realtime subscription
useEffect(() => {
  const channel = supabase
    .channel('ideas-changes')
    .on('postgres_changes', config, handler)
    .subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        console.log('Realtime connected');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Realtime error:', error);
        toast.error('Live updates unavailable');
        // Fall back to polling
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Previous Story Intelligence

**Learnings from Story 5.7 (User List and Activity Overview):**
- React Query hooks with proper caching strategies
- AdminDashboard navigation patterns
- Loading states and error handling
- RLS policies for admin access
- Component reusability (UserProfileCard, IdeaCard)

**Learnings from Story 5.6 (View Any User's Idea, PRD, and Prototype):**
- adminService patterns for admin-specific operations
- React Query cache invalidation strategies
- AdminRoute wrapper for role-based access
- Breadcrumb navigation for admin flows

**Learnings from Story 5.1 (Admin Dashboard Layout):**
- AdminDashboard layout and navigation structure
- Summary cards with metrics
- Responsive admin layout (sidebar on desktop, collapse on mobile)
- Real-time requirements for dashboard updates

**Learnings from Story 3.6 (PRD Auto-Save Functionality):**
- Auto-save patterns with debouncing
- Real-time updates without interrupting user work
- SaveIndicator component for user feedback
- Error handling for save failures

**Key Patterns to Reuse:**
- React Query cache invalidation from Story 5.6
- Auto-save debouncing patterns from Story 3.6
- AdminDashboard integration from Story 5.1
- Error handling and fallback strategies from previous stories

**Files Created in Previous Stories (Reuse Patterns):**
- `src/features/admin/components/AdminDashboard.tsx` - Integrate realtime hook
- `src/features/admin/components/IdeaPipeline.tsx` - Add realtime updates
- `src/lib/supabase.ts` - Supabase client (already configured)
- `src/lib/queryClient.ts` - React Query client (for cache invalidation)

**Code Patterns Established:**
- React Query for data fetching and caching
- Supabase client for database operations
- Error boundaries for component-level error handling
- Loading states with skeletons
- Toast notifications for user feedback

### Project Structure Notes

**Alignment with Unified Project Structure:**
- Feature-based organization: Realtime hook in `features/admin/hooks/`
- Shared UI components: RealtimeIndicator in `features/admin/components/`
- Service layer abstraction: Supabase Realtime through `lib/supabase.ts`
- Type safety: Define TypeScript types in `features/admin/types.ts`

**Detected Conflicts or Variances:**
- None. This story follows established architecture patterns exactly.
- Supabase Realtime integration follows official Supabase patterns
- React Query cache invalidation follows established patterns from previous stories
- Component structure aligns with feature-based organization

### References

**Technical Details from Architecture:**
- [Source: architecture.md, lines 159-167] - Supabase Realtime for real-time updates
- [Source: architecture.md, lines 320-347] - State management patterns with React Query
- [Source: architecture.md, lines 534-551] - Admin feature structure and components
- [Source: architecture.md, lines 609-617] - Data flow and component boundaries

**Functional Requirements from PRD:**
- [Source: epics.md, lines 1212-1230] - Story 5.8 complete acceptance criteria
- [Source: epics.md, lines 1064-1066] - Epic 5 goal and user value
- [Source: prd.md, lines 94-95] - NFR-P5: Real-time updates <500ms latency
- [Source: prd.md, lines 176-207] - Sarah's Innovation Manager journey

**User Journey from Epics:**
- Sarah needs real-time visibility into innovation pipeline
- Dashboard updates immediately when ideas are submitted or status changes
- No manual refresh required to see latest data
- Multiple admins can collaborate without seeing stale data
- <500ms latency requirement for real-time updates

**Database Schema:**
- Table: `ideas` with columns: `id`, `user_id`, `title`, `status`, `created_at`, `updated_at`
- Enable Supabase Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE ideas;`
- RLS policies: Admins receive realtime events for all ideas
- Realtime events: INSERT, UPDATE, DELETE

**Design System References:**
- PassportCard primary red: #E10514
- Success green: #10B981 for connected status
- Error red: #EF4444 for disconnected status
- Neutral gray: #525355 for secondary text
- Border radius: 20px
- No emojis anywhere in the UI
- Heroicons for all iconography
- Montserrat font (headings), Rubik font (body)

**Key Integration Points:**
- Supabase Realtime: `src/lib/supabase.ts`
- React Query client: `src/lib/queryClient.ts`
- AdminDashboard: `src/features/admin/components/AdminDashboard.tsx`
- IdeaPipeline: `src/features/admin/components/IdeaPipeline.tsx`

### Implementation Priority

**Critical Path Items:**
1. Enable Supabase Realtime on ideas table (blocks all realtime functionality)
2. Create useRealtimeIdeas hook (core realtime subscription logic)
3. Integrate useRealtimeIdeas into AdminDashboard (enables live dashboard updates)
4. Implement React Query cache invalidation (ensures data freshness)
5. Add RealtimeIndicator component (user feedback for connection status)

**Can Be Implemented in Parallel:**
- Visual feedback for realtime updates (fade-in animations)
- Fallback polling strategy (independent error handling)
- Performance optimizations (debouncing, React.memo)
- Edge case handling (network interruption, reconnection)

**Nice-to-Have Enhancements:**
- Toast notifications for realtime updates (optional user feedback)
- Optimistic updates for immediate UI feedback (advanced optimization)
- Advanced reconnection strategies (exponential backoff)
- Realtime analytics dashboard (post-story enhancement)

### AI Agent Guidance

**For DEV Agent:**
- Follow Supabase Realtime official documentation patterns
- Use React Query cache invalidation for data freshness
- Implement proper subscription cleanup to prevent memory leaks
- Test with multiple browser windows to simulate multiple admins
- Verify <500ms latency requirement is met
- Implement fallback polling if realtime fails
- Add visual feedback for connection status
- Handle edge cases gracefully (network interruption, reconnection)
- Optimize performance with debouncing and React.memo
- Document realtime architecture and patterns

**Common Pitfalls to Avoid:**
- Don't forget to cleanup subscriptions on unmount (memory leaks)
- Don't subscribe multiple times if component re-renders
- Don't invalidate all queries (only invalidate affected queries)
- Don't forget to enable Realtime on ideas table in Supabase
- Don't rely on client-side checks for security (RLS enforces access)
- Don't forget to test with multiple concurrent admin sessions
- Don't forget fallback polling if realtime fails
- Don't forget to handle network interruption and reconnection
- Don't forget to debounce rapid events (prevent UI thrashing)
- Don't forget to add visual feedback for connection status

**Performance Considerations:**
- Debounce rapid realtime events to batch updates within 100ms
- Use React.memo for components to prevent unnecessary re-renders
- Selective query invalidation (only invalidate affected queries)
- Test with 10+ rapid idea submissions to verify no performance degradation
- Profile with Chrome DevTools Performance tab
- Verify no memory leaks from subscriptions

**Security Reminders:**
- RLS policies enforce admin access at database level
- Realtime events respect RLS policies (admins see all ideas, users see own)
- Never expose sensitive data in realtime events
- Verify admin role before processing realtime events
- Log all realtime errors for troubleshooting

### Git Intelligence Summary

**Recent Development Patterns (Last 10 Commits):**
- Story 3.6 (PRD Auto-Save Functionality) - Auto-save patterns with debouncing
- Story 3.5 (Real-Time PRD Section Generation) - Real-time updates and optimistic UI
- Story 3.4 (Chat Interface with AI Assistant) - Real-time messaging patterns
- Story 3.1-3.3 (PRD Database and Services) - Database schema and service patterns
- Story 2.9 (Idea Detail View) - React Query hooks and state management
- Story 4.2-4.3 (Prototype Generation) - Edge Function integration patterns
- Story 2.7 (Idea Submission) - Form submission and error handling
- Gemini Edge Function - API integration and error handling

**Code Patterns from Recent Commits:**
- React Query hooks for data fetching (queries, not mutations)
- Service functions return `ServiceResponse<T>` type
- Components use Tailwind CSS + DaisyUI for styling
- Error handling with error boundaries and fallback UI
- Loading states with skeleton components
- Comprehensive TypeScript types for all entities
- Auto-save patterns with debouncing (Story 3.6)
- Real-time updates without interrupting user work (Story 3.5)

**Libraries and Versions:**
- React 19.x with TypeScript 5.x
- React Query v5.x for data fetching
- Supabase client for database, auth, and Realtime
- DaisyUI 5.x for UI components
- Tailwind CSS 4.x for styling
- Heroicons for iconography

**Testing Approaches:**
- Manual testing with different user roles
- Component tests with React Testing Library
- Error handling and edge case testing
- Performance testing with Chrome DevTools
- Multi-user testing with multiple browser windows
- Network interruption testing

### Latest Technical Information

**Supabase Realtime Best Practices (2026):**
- Use `.channel(name)` to create a realtime channel
- Subscribe to table changes: `.on('postgres_changes', config, handler)`
- Always cleanup subscriptions: `supabase.removeChannel(channel)`
- Handle subscription status: `SUBSCRIBED`, `CHANNEL_ERROR`, `CLOSED`
- Realtime respects RLS policies (admins see all, users see own)
- Enable Realtime on tables: `ALTER PUBLICATION supabase_realtime ADD TABLE table_name;`
- Use `.subscribe(callback)` to start listening for events
- Debounce rapid events to prevent UI thrashing

**React Query v5.x Cache Invalidation:**
- Invalidate queries: `queryClient.invalidateQueries({ queryKey })`
- Set query data: `queryClient.setQueryData(queryKey, updater)`
- Refetch queries: `queryClient.refetchQueries({ queryKey })`
- Selective invalidation: Only invalidate affected queries
- Optimistic updates: Use `setQueryData` for immediate UI feedback
- Query keys with parameters: `['admin', 'ideas', { status: 'submitted' }]`

**TypeScript 5.x Patterns:**
- Use `satisfies` operator for type narrowing
- Use discriminated unions for event types
- Use `Pick<T, K>` and `Omit<T, K>` for type transformations
- Use `Partial<T>` for optional fields
- Use `Record<string, unknown>` for flexible objects

**DaisyUI 5.x Components:**
- Use `badge` component for "Live" indicator
- Apply border radius with Tailwind: `rounded-[20px]`
- Use semantic color classes: `badge-success`, `badge-error`
- Use `btn` component with semantic color classes

**Accessibility Best Practices:**
- Add `aria-label` to "Live" indicator
- Use semantic HTML for status indicators
- Ensure keyboard navigation works
- Add focus indicators for interactive elements
- Provide clear visual feedback for connection status

## Dev Agent Record

### Agent Model Used

_To be filled by DEV agent during implementation_

### Debug Log References

_To be added by DEV agent during implementation_

### Completion Notes List

_To be added by DEV agent upon completion_

### File List

_To be populated by DEV agent with all files created/modified_
