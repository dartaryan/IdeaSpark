# Story 6.1: Analytics Dashboard Layout

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin**,
I want **a dedicated analytics dashboard with visual metrics**,
So that **I can measure and report on innovation program performance**.

## Acceptance Criteria

**Given** I am logged in as an admin
**When** I navigate to "Analytics"
**Then** I see a dashboard with key metric cards and charts
**And** the layout is clean and visually appealing with PassportCard branding
**And** metrics load quickly (within 3 seconds)
**And** I see data refresh timestamp showing when metrics were last updated

## Tasks / Subtasks

- [ ] Task 1: Create AnalyticsDashboard component with layout structure (AC: Dashboard with key metric cards and charts)
  - [ ] Subtask 1.1: Create AnalyticsDashboard.tsx in features/admin/components/analytics/
  - [ ] Subtask 1.2: Implement responsive grid layout with 4 metric cards at top
  - [ ] Subtask 1.3: Add chart section below metric cards (2-column grid on desktop, stacked on mobile)
  - [ ] Subtask 1.4: Use DaisyUI card components with PassportCard styling (20px border radius)
  - [ ] Subtask 1.5: Add page header with title "Innovation Analytics" and subtitle
  - [ ] Subtask 1.6: Include breadcrumb navigation: Admin Dashboard → Analytics
  - [ ] Subtask 1.7: Apply consistent spacing using DSM tokens (p-6, gap-6)
  - [ ] Subtask 1.8: Ensure responsive layout (mobile-first, tablet breakpoint at 768px, desktop at 1024px)

- [ ] Task 2: Create MetricsCards component for key statistics (AC: Key metric cards)
  - [ ] Subtask 2.1: Create MetricsCards.tsx in features/admin/components/analytics/
  - [ ] Subtask 2.2: Design MetricCard component with icon, label, value, and trend indicator
  - [ ] Subtask 2.3: Implement 4 placeholder metric cards: Total Ideas, Pipeline Stages, Completion Rate, Avg Time
  - [ ] Subtask 2.4: Use Heroicons for metric icons (light-bulb, chart-bar, check-circle, clock)
  - [ ] Subtask 2.5: Add trend indicators: up arrow (green), down arrow (red), neutral dash (gray)
  - [ ] Subtask 2.6: Display trend percentage: "+12% from last month"
  - [ ] Subtask 2.7: Apply PassportCard red (#E10514) for primary metric values
  - [ ] Subtask 2.8: Add loading skeleton state for metric cards
  - [ ] Subtask 2.9: Make cards clickable to drill down into specific metrics (future enhancement)

- [ ] Task 3: Create placeholder chart components (AC: Charts section)
  - [ ] Subtask 3.1: Create SubmissionChart.tsx placeholder in features/admin/components/analytics/
  - [ ] Subtask 3.2: Create CompletionRateChart.tsx placeholder in features/admin/components/analytics/
  - [ ] Subtask 3.3: Display "Chart Coming Soon" message in each placeholder
  - [ ] Subtask 3.4: Use DaisyUI card with proper dimensions (min-height: 400px)
  - [ ] Subtask 3.5: Add chart title and description in card header
  - [ ] Subtask 3.6: Apply PassportCard styling to chart containers
  - [ ] Subtask 3.7: Ensure chart containers are responsive and maintain aspect ratio
  - [ ] Subtask 3.8: Add empty state illustration or icon for placeholder charts

- [ ] Task 4: Add data refresh timestamp display (AC: Data refresh timestamp)
  - [ ] Subtask 4.1: Add timestamp display in top-right corner of dashboard
  - [ ] Subtask 4.2: Format timestamp: "Last updated: 2 minutes ago" (relative time)
  - [ ] Subtask 4.3: Include absolute timestamp on hover tooltip: "Jan 25, 2026 at 3:45 PM"
  - [ ] Subtask 4.4: Add refresh button (circular arrow icon) next to timestamp
  - [ ] Subtask 4.5: Implement manual refresh functionality (refetch analytics data)
  - [ ] Subtask 4.6: Show loading spinner on refresh button during data fetch
  - [ ] Subtask 4.7: Update timestamp after successful data refresh
  - [ ] Subtask 4.8: Use gray color for timestamp text (#525355)

- [ ] Task 5: Create useAnalytics hook for data fetching (AC: Metrics load quickly)
  - [ ] Subtask 5.1: Create useAnalytics.ts in features/admin/hooks/
  - [ ] Subtask 5.2: Implement React Query hook with query key: ['admin', 'analytics']
  - [ ] Subtask 5.3: Call analyticsService.getAnalytics() to fetch metrics
  - [ ] Subtask 5.4: Set staleTime to 60 seconds (analytics don't need real-time updates)
  - [ ] Subtask 5.5: Set cacheTime to 5 minutes
  - [ ] Subtask 5.6: Handle loading, error, and success states
  - [ ] Subtask 5.7: Return analytics data with proper TypeScript types
  - [ ] Subtask 5.8: Add refetch function for manual refresh capability

- [ ] Task 6: Create analyticsService with data aggregation functions (AC: Data access layer)
  - [ ] Subtask 6.1: Create analyticsService.ts in features/admin/services/
  - [ ] Subtask 6.2: Implement getAnalytics() function returning ServiceResponse<AnalyticsData>
  - [ ] Subtask 6.3: Query ideas table to calculate total ideas count
  - [ ] Subtask 6.4: Query ideas table grouped by status for pipeline breakdown
  - [ ] Subtask 6.5: Calculate completion rate: (prototype_complete / total_submitted) * 100
  - [ ] Subtask 6.6: Calculate average time metrics using created_at and updated_at timestamps
  - [ ] Subtask 6.7: Return mock data initially for testing (real queries in later stories)
  - [ ] Subtask 6.8: Add error handling with user-friendly messages
  - [ ] Subtask 6.9: Verify admin role before executing queries (RLS backup)

- [ ] Task 7: Define TypeScript types for analytics data (AC: Type safety)
  - [ ] Subtask 7.1: Create types.ts in features/admin/analytics/
  - [ ] Subtask 7.2: Define AnalyticsData interface with all metric fields
  - [ ] Subtask 7.3: Define MetricCard interface: { icon, label, value, trend, trendValue }
  - [ ] Subtask 7.4: Define PipelineBreakdown interface: { status, count, percentage }
  - [ ] Subtask 7.5: Define TimeMetrics interface: { avgTimeToApproval, avgTimeToPRD, avgTimeToPrototype }
  - [ ] Subtask 7.6: Export all types from index.ts
  - [ ] Subtask 7.7: Ensure types align with database schema (snake_case to camelCase conversion)

- [ ] Task 8: Add Analytics navigation to AdminDashboard (AC: Navigate to Analytics)
  - [ ] Subtask 8.1: Add "Analytics" menu item to AdminDashboard navigation sidebar
  - [ ] Subtask 8.2: Use Heroicon: `chart-bar-square` for menu icon
  - [ ] Subtask 8.3: Route to /admin/analytics when clicked
  - [ ] Subtask 8.4: Highlight "Analytics" menu item when active (current route)
  - [ ] Subtask 8.5: Position Analytics menu item after Dashboard, before Users
  - [ ] Subtask 8.6: Mobile: Include Analytics in collapsed menu
  - [ ] Subtask 8.7: Add tooltip on hover: "View innovation metrics"

- [ ] Task 9: Add admin route for AnalyticsDashboard (AC: Routing)
  - [ ] Subtask 9.1: Add AdminRoute for /admin/analytics route (loads AnalyticsDashboard)
  - [ ] Subtask 9.2: Configure React Router with the new admin route
  - [ ] Subtask 9.3: Redirect non-admin users to dashboard if they try to access
  - [ ] Subtask 9.4: Preserve navigation state for back button functionality
  - [ ] Subtask 9.5: Set page title: "Analytics - IdeaSpark Admin"

- [ ] Task 10: Implement loading states and skeletons (AC: Metrics load quickly)
  - [ ] Subtask 10.1: Create AnalyticsSkeleton component for loading state
  - [ ] Subtask 10.2: Show skeleton for metric cards (4 card skeletons in grid)
  - [ ] Subtask 10.3: Show skeleton for chart areas (2 chart skeletons)
  - [ ] Subtask 10.4: Use DaisyUI skeleton classes with proper dimensions
  - [ ] Subtask 10.5: Apply shimmer animation to skeletons
  - [ ] Subtask 10.6: Ensure loading state displays for <3 seconds
  - [ ] Subtask 10.7: Transition smoothly from skeleton to actual content

- [ ] Task 11: Implement error states and empty states (AC: Robust error handling)
  - [ ] Subtask 11.1: Create AnalyticsError component for error display
  - [ ] Subtask 11.2: Show error message if analytics data fails to load
  - [ ] Subtask 11.3: Include retry button to refetch data
  - [ ] Subtask 11.4: Handle case where no ideas exist (show empty state with explanation)
  - [ ] Subtask 11.5: Empty state: "No data yet. Analytics will appear once ideas are submitted."
  - [ ] Subtask 11.6: Add illustration or icon to empty state
  - [ ] Subtask 11.7: Log errors to console for debugging

- [ ] Task 12: Integrate PassportCard DaisyUI theme (AC: Clean and visually appealing with PassportCard branding)
  - [ ] Subtask 12.1: Use DaisyUI card, badge, and stat components
  - [ ] Subtask 12.2: Apply PassportCard red (#E10514) for primary metric values and icons
  - [ ] Subtask 12.3: Use Heroicons for all icons (light-bulb, chart-bar, check-circle, clock, chart-bar-square)
  - [ ] Subtask 12.4: Apply 20px border radius to all cards and containers
  - [ ] Subtask 12.5: Use Montserrat font for headings, Rubik for body text
  - [ ] Subtask 12.6: Apply DSM spacing tokens (p-6, gap-6, mb-4) consistently
  - [ ] Subtask 12.7: Use neutral gray (#525355) for secondary text and labels
  - [ ] Subtask 12.8: Ensure responsive layout with proper breakpoints
  - [ ] Subtask 12.9: Add hover effects on interactive elements (cards, refresh button)

- [ ] Task 13: Add comprehensive unit tests (AC: Quality assurance)
  - [ ] Subtask 13.1: Create AnalyticsDashboard.test.tsx
  - [ ] Subtask 13.2: Test component renders with loading state
  - [ ] Subtask 13.3: Test component renders with analytics data
  - [ ] Subtask 13.4: Test component renders error state
  - [ ] Subtask 13.5: Test component renders empty state
  - [ ] Subtask 13.6: Test refresh button triggers data refetch
  - [ ] Subtask 13.7: Test timestamp displays correctly
  - [ ] Subtask 13.8: Create MetricsCards.test.tsx
  - [ ] Subtask 13.9: Test metric cards render with correct values
  - [ ] Subtask 13.10: Test trend indicators display correctly
  - [ ] Subtask 13.11: Create useAnalytics.test.ts
  - [ ] Subtask 13.12: Test hook fetches analytics data successfully
  - [ ] Subtask 13.13: Test hook handles errors gracefully
  - [ ] Subtask 13.14: Create analyticsService.test.ts
  - [ ] Subtask 13.15: Test getAnalytics() returns correct data structure
  - [ ] Subtask 13.16: Test service handles database errors
  - [ ] Subtask 13.17: Achieve >90% test coverage for all analytics components

- [ ] Task 14: Verify RLS policies for admin analytics access (AC: Database security)
  - [ ] Subtask 14.1: Verify RLS policy on ideas table allows admin to SELECT all rows
  - [ ] Subtask 14.2: Policy rule: `SELECT` permission WHERE `auth.jwt() ->> 'role' = 'admin'`
  - [ ] Subtask 14.3: Test policy with admin and regular user accounts
  - [ ] Subtask 14.4: Verify regular users cannot access analytics data
  - [ ] Subtask 14.5: Ensure aggregate queries work correctly with RLS enabled

## Dev Notes

### Architecture Alignment

**Feature Location:**
- AnalyticsDashboard: `src/features/admin/components/analytics/AnalyticsDashboard.tsx`
- MetricsCards: `src/features/admin/components/analytics/MetricsCards.tsx`
- SubmissionChart: `src/features/admin/components/analytics/SubmissionChart.tsx` (placeholder)
- CompletionRateChart: `src/features/admin/components/analytics/CompletionRateChart.tsx` (placeholder)
- useAnalytics hook: `src/features/admin/hooks/useAnalytics.ts`
- analyticsService: `src/features/admin/services/analyticsService.ts`
- Types: `src/features/admin/analytics/types.ts`

**Integration Points:**
- AdminDashboard: `src/features/admin/components/AdminDashboard.tsx` (add Analytics navigation)
- AdminRoute: `src/routes/AdminRoute.tsx` (add analytics route)
- React Router: `src/routes/index.tsx` (configure admin analytics route)

**Database Operations:**
- Tables: `ideas` (primary data source for all metrics)
- Admin queries aggregate ideas by status, calculate counts and averages
- RLS policies enforce admin access at database level

**State Management:**
- React Query for analytics data fetching
- Query key: `['admin', 'analytics']`
- Cache: staleTime 60s, cacheTime 5 minutes
- Manual refresh via refetch function
- Loading states for all async operations

**UI Components:**
- DaisyUI components: `card`, `stat`, `badge`, `skeleton`
- Heroicons: `light-bulb`, `chart-bar`, `check-circle`, `clock`, `chart-bar-square`, `arrow-path`
- Responsive grid layout (4 columns on desktop, 2 on tablet, 1 on mobile)
- Empty states with clear messaging

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/admin/components/analytics/`
- Naming: PascalCase for components (`AnalyticsDashboard.tsx`, `MetricsCards.tsx`)
- Service: camelCase functions (`getAnalytics`, `calculateMetrics`)
- React Query hooks: `useAnalytics`

**Error Handling:**
- Wrap in `<ErrorBoundary>` at feature level
- Loading skeletons for all data fetches
- Error states with retry buttons
- Log errors to console for debugging
- User-friendly error messages

**Performance Requirements:**
- Metrics load within 3 seconds (NFR-P1)
- Use React Query caching to minimize database queries
- Aggregate queries optimized with proper indexes
- Skeleton loading for perceived performance

**Data Validation:**
- Validate analytics data structure with Zod schema
- Ensure all numeric values are numbers (not strings)
- Handle null/undefined values gracefully
- Validate admin role before data access

**Testing Standards:**
- Unit tests for all components and hooks
- Test loading, error, and success states
- Test user interactions (refresh button, navigation)
- Mock analyticsService in component tests
- Achieve >90% test coverage

### Project Structure Notes

**New Files Created:**
```
src/features/admin/
├── components/
│   └── analytics/
│       ├── AnalyticsDashboard.tsx
│       ├── MetricsCards.tsx
│       ├── SubmissionChart.tsx (placeholder)
│       ├── CompletionRateChart.tsx (placeholder)
│       ├── AnalyticsSkeleton.tsx
│       ├── AnalyticsError.tsx
│       └── index.ts
├── hooks/
│   └── useAnalytics.ts
├── services/
│   └── analyticsService.ts
└── analytics/
    ├── types.ts
    └── index.ts
```

**Modified Files:**
- `src/features/admin/components/AdminDashboard.tsx` (add Analytics navigation)
- `src/routes/index.tsx` (add /admin/analytics route)
- `src/features/admin/services/index.ts` (export analyticsService)
- `src/features/admin/hooks/index.ts` (export useAnalytics)

### References

**Source Documents:**
- [PRD: FR41-FR45 - Analytics & Reporting](file:///_bmad-output/planning-artifacts/prd.md#analytics--reporting)
- [Epic 6: Analytics & Innovation Metrics](file:///_bmad-output/planning-artifacts/epics.md#epic-6-analytics--innovation-metrics)
- [Story 6.1: Analytics Dashboard Layout](file:///_bmad-output/planning-artifacts/epics.md#story-61-analytics-dashboard-layout)
- [Architecture: Admin Feature Structure](file:///_bmad-output/planning-artifacts/architecture.md#project-structure--boundaries)
- [Architecture: State Management Patterns](file:///_bmad-output/planning-artifacts/architecture.md#state-management-patterns)
- [Architecture: PassportCard DaisyUI Theme](file:///_bmad-output/planning-artifacts/architecture.md#frontend-architecture)

### Previous Story Learnings

**From Story 5.7 (User List and Activity Overview):**
- Admin components follow consistent pattern: Dashboard → Service → Hook → Component
- Use React Query with proper cache settings (staleTime: 60s for admin data)
- Implement comprehensive loading skeletons for better UX
- Add breadcrumb navigation for admin pages
- Reuse DaisyUI components consistently (card, badge, table)
- Apply PassportCard styling (#E10514) to all primary elements
- Include empty states with clear messaging
- Test all loading, error, and success states

**From Recent Git History:**
- PRD components use split-screen layouts effectively
- Auto-save patterns work well with debouncing (300ms-1s)
- React Query mutations handle async operations reliably
- Comprehensive unit tests ensure quality (aim for >90% coverage)
- Status indicators (badges, progress) improve user understanding
- Edge Functions pattern works well for external API calls

### Developer Context

**🎯 Story Goal:**
This story establishes the foundation for Epic 6: Analytics & Innovation Metrics. It creates the dashboard layout and infrastructure that subsequent stories will build upon. The focus is on:
1. **Layout Structure** - Responsive grid with metric cards and chart placeholders
2. **Data Infrastructure** - analyticsService and useAnalytics hook
3. **Visual Design** - PassportCard branding, loading states, error handling
4. **Navigation** - Integrate Analytics into admin navigation

**⚠️ Critical Requirements:**
- **Performance**: Metrics must load within 3 seconds (NFR-P1)
- **Admin-Only**: Verify RLS policies restrict access to admins
- **Responsive**: Mobile-first design with proper breakpoints
- **Branding**: Consistent PassportCard theme (#E10514, 20px radius)

**🔗 Dependencies:**
- AdminDashboard component (Epic 5.1) - already implemented
- Admin routing infrastructure (Epic 5) - already implemented
- Ideas table with status field - already exists
- Supabase RLS policies for admin access - already configured

**📊 Data Sources:**
- Primary: `ideas` table (status, created_at, updated_at)
- Aggregations: COUNT by status, AVG time calculations
- Future stories will add more detailed metrics

**🎨 UI/UX Considerations:**
- Use DaisyUI `stat` component for metric cards
- Heroicons for all icons (consistent with rest of app)
- Loading skeletons prevent layout shift
- Empty state for new installations with no data
- Refresh button for manual data updates
- Timestamp shows data freshness

**🧪 Testing Strategy:**
- Unit tests for all components and hooks
- Mock analyticsService in component tests
- Test loading, error, and success states
- Test responsive layout at different breakpoints
- Verify admin-only access in route tests

**🚀 Implementation Order:**
1. Create types and interfaces
2. Implement analyticsService with mock data
3. Create useAnalytics hook
4. Build AnalyticsDashboard layout
5. Create MetricsCards component
6. Add placeholder chart components
7. Integrate navigation and routing
8. Implement loading and error states
9. Add comprehensive tests
10. Verify RLS policies

**💡 Future Enhancements (Later Stories):**
- Story 6.2: Populate "Total Ideas Submitted" metric
- Story 6.3: Implement Pipeline Stage Breakdown Chart
- Story 6.4: Add Completion Rates Metrics
- Story 6.5: Calculate Time-to-Decision Metrics
- Story 6.6: Add User Activity Overview
- Story 6.7: Implement Date Range Filtering

### Library and Framework Requirements

**Core Dependencies (Already Installed):**
- React 19.x - Component framework
- TypeScript 5.x - Type safety
- React Router DOM - Routing
- React Query (@tanstack/react-query) - Server state management
- Zustand - Client state management (if needed)
- Zod - Data validation
- DaisyUI 5.x - UI component library
- Tailwind CSS 4.x - Styling
- Heroicons - Icon library

**Supabase Integration:**
- @supabase/supabase-js - Database client
- Supabase RLS policies for admin access
- PostgreSQL aggregate functions (COUNT, AVG)

**Testing Dependencies:**
- Vitest - Test runner
- @testing-library/react - Component testing
- @testing-library/user-event - User interaction testing
- @testing-library/jest-dom - DOM matchers

**No New Dependencies Required** - All necessary libraries are already installed per Architecture specification.

### File Structure Requirements

**Follow Architecture Patterns:**
- Feature-based organization: `features/admin/components/analytics/`
- Co-located tests: `AnalyticsDashboard.test.tsx` next to `AnalyticsDashboard.tsx`
- Barrel exports: `index.ts` files for clean imports
- Service layer: `features/admin/services/analyticsService.ts`
- Custom hooks: `features/admin/hooks/useAnalytics.ts`
- Types: `features/admin/analytics/types.ts`

**Naming Conventions:**
- Components: PascalCase (`AnalyticsDashboard.tsx`)
- Services: camelCase (`analyticsService.ts`)
- Hooks: camelCase with `use` prefix (`useAnalytics.ts`)
- Types: PascalCase (`AnalyticsData`, `MetricCard`)
- Database: snake_case (`created_at`, `user_id`)

### Security Considerations

**Admin-Only Access:**
- Verify admin role in AdminRoute component
- RLS policies enforce database-level security
- analyticsService checks admin role before queries
- Non-admin users redirected to dashboard

**Data Privacy:**
- Analytics show aggregate data only (no PII)
- Individual user data not exposed in metrics
- Admin can drill down to user details via separate routes

**Error Handling:**
- Don't expose database errors to UI
- Log errors server-side for debugging
- Show user-friendly error messages
- Implement retry logic for transient failures

### Performance Optimization

**Query Optimization:**
- Use database indexes on ideas.status and ideas.created_at
- Aggregate queries at database level (not in JavaScript)
- React Query caching reduces redundant queries
- staleTime: 60s (analytics don't need real-time updates)

**UI Performance:**
- Lazy load chart components (future stories)
- Use React.memo for MetricsCards if needed
- Skeleton loading prevents layout shift
- Debounce refresh button to prevent spam

**Bundle Size:**
- No new dependencies required
- Tree-shaking removes unused DaisyUI components
- Code splitting via React Router (already configured)

### Accessibility Considerations

**WCAG 2.1 AA Compliance:**
- Color contrast meets standards (PassportCard red on white background)
- All interactive elements keyboard accessible
- Screen reader support for metric values
- ARIA labels for icons and buttons
- Focus indicators visible on all interactive elements

**Semantic HTML:**
- Use proper heading hierarchy (h1, h2, h3)
- Landmark regions (main, nav, section)
- Button elements for interactive controls
- Meaningful alt text for icons

### Browser Compatibility

**Supported Browsers (per Architecture):**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Responsive Breakpoints:**
- Mobile: 375px - 767px (1 column)
- Tablet: 768px - 1023px (2 columns)
- Desktop: 1024px+ (4 columns for metrics, 2 for charts)

### Deployment Considerations

**Vercel Deployment:**
- No environment variable changes needed
- No database migrations required (using existing ideas table)
- No new Supabase Edge Functions
- Standard React Router configuration

**Testing in Production:**
- Verify admin-only access works
- Test with real data (if available)
- Check performance with larger datasets
- Verify responsive layout on actual devices

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
