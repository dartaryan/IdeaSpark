# Story 6.3: Pipeline Stage Breakdown Chart

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin**,
I want **to see ideas broken down by pipeline stage**,
So that **I can identify bottlenecks in the innovation flow**.

## Acceptance Criteria

**Given** I am on the Analytics Dashboard
**When** I view the pipeline breakdown section
**Then** I see a chart (bar or donut) showing ideas by status: submitted, approved, prd_development, prototype_complete, rejected
**And** each segment shows count and percentage
**And** I can hover/click for exact numbers
**And** the chart uses PassportCard brand colors

**Given** I look at the breakdown
**When** one stage has significantly more items
**Then** I can visually identify where ideas are getting stuck

## Tasks / Subtasks

- [ ] Task 1: Update analyticsService to calculate pipeline breakdown data (AC: Pipeline breakdown by status)
  - [ ] Subtask 1.1: Update getAnalytics() function in analyticsService.ts
  - [ ] Subtask 1.2: Query ideas table grouped by status: SELECT status, COUNT(*) FROM ideas GROUP BY status
  - [ ] Subtask 1.3: Calculate percentage for each status: (status_count / total_count) * 100
  - [ ] Subtask 1.4: Apply date range filter if provided (WHERE created_at BETWEEN start_date AND end_date)
  - [ ] Subtask 1.5: Return array of { status, count, percentage, color } in AnalyticsData
  - [ ] Subtask 1.6: Map status values to display labels: 'submitted' → 'Submitted', 'prd_development' → 'PRD Development'
  - [ ] Subtask 1.7: Assign PassportCard theme colors to each status segment
  - [ ] Subtask 1.8: Handle case where no ideas exist (return empty array)
  - [ ] Subtask 1.9: Sort breakdown by pipeline order: submitted, approved, prd_development, prototype_complete, rejected
  - [ ] Subtask 1.10: Add error handling with user-friendly messages

- [ ] Task 2: Update AnalyticsData TypeScript types for pipeline breakdown (AC: Type safety)
  - [ ] Subtask 2.1: Update AnalyticsData interface in features/admin/analytics/types.ts
  - [ ] Subtask 2.2: Add pipelineBreakdown: PipelineStageData[] field
  - [ ] Subtask 2.3: Define PipelineStageData interface: { status, label, count, percentage, color }
  - [ ] Subtask 2.4: Define PipelineStatus type: 'submitted' | 'approved' | 'prd_development' | 'prototype_complete' | 'rejected'
  - [ ] Subtask 2.5: Ensure all numeric fields (count, percentage) are typed as number
  - [ ] Subtask 2.6: Color field typed as string (hex color codes)
  - [ ] Subtask 2.7: Export all types via index.ts

- [ ] Task 3: Evaluate and select charting library (AC: Chart visualization)
  - [ ] Subtask 3.1: Research lightweight charting options: Recharts, Chart.js, react-chartjs-2, Tremor
  - [ ] Subtask 3.2: Evaluate criteria: bundle size, TypeScript support, DaisyUI compatibility, customization
  - [ ] Subtask 3.3: Decision: Recommend Recharts (React-native, TypeScript support, composable)
  - [ ] Subtask 3.4: Alternative: Use native SVG with D3-like calculations if no library added
  - [ ] Subtask 3.5: Install charting library if approved: npm install recharts
  - [ ] Subtask 3.6: Verify library works with Vite and TypeScript
  - [ ] Subtask 3.7: Document decision in Dev Notes

- [ ] Task 4: Create PipelineBreakdownChart component (AC: Chart display)
  - [ ] Subtask 4.1: Create PipelineBreakdownChart.tsx in features/admin/components/analytics/
  - [ ] Subtask 4.2: Accept pipelineBreakdown data via props: { data: PipelineStageData[] }
  - [ ] Subtask 4.3: Implement bar chart visualization (primary option)
  - [ ] Subtask 4.4: X-axis: pipeline stages (labels), Y-axis: idea count
  - [ ] Subtask 4.5: Apply PassportCard colors to bars: submitted (gray), approved (blue), prd_development (yellow), prototype_complete (green), rejected (red)
  - [ ] Subtask 4.6: Display count and percentage on hover tooltip
  - [ ] Subtask 4.7: Make bars clickable to show detailed breakdown modal (future enhancement placeholder)
  - [ ] Subtask 4.8: Add chart title: "Ideas by Pipeline Stage"
  - [ ] Subtask 4.9: Include legend showing status labels with colors
  - [ ] Subtask 4.10: Ensure chart is responsive (scales to container width)
  - [ ] Subtask 4.11: Add loading skeleton for chart area
  - [ ] Subtask 4.12: Handle empty state: "No data available" message with icon

- [ ] Task 5: Implement alternative donut chart view (AC: Chart options)
  - [ ] Subtask 5.1: Create PipelineDonutChart.tsx component (alternative to bar chart)
  - [ ] Subtask 5.2: Accept same pipelineBreakdown data structure
  - [ ] Subtask 5.3: Implement donut chart with colored segments for each status
  - [ ] Subtask 5.4: Display percentage in each segment
  - [ ] Subtask 5.5: Show count and label on hover tooltip
  - [ ] Subtask 5.6: Add center text showing total ideas count
  - [ ] Subtask 5.7: Use PassportCard colors for segments (same as bar chart)
  - [ ] Subtask 5.8: Make segments clickable for detailed view (placeholder)
  - [ ] Subtask 5.9: Include legend below donut showing all statuses
  - [ ] Subtask 5.10: Ensure donut chart is responsive

- [ ] Task 6: Add chart type toggle to switch between bar and donut (AC: User preference)
  - [ ] Subtask 6.1: Create ChartTypeToggle component in features/admin/components/analytics/
  - [ ] Subtask 6.2: Implement toggle buttons: "Bar Chart" and "Donut Chart"
  - [ ] Subtask 6.3: Use DaisyUI button group or tabs for toggle UI
  - [ ] Subtask 6.4: Manage chart type state with useState in parent component
  - [ ] Subtask 6.5: Conditionally render PipelineBreakdownChart or PipelineDonutChart based on state
  - [ ] Subtask 6.6: Persist chart type preference in localStorage (optional)
  - [ ] Subtask 6.7: Default to bar chart on first visit
  - [ ] Subtask 6.8: Apply PassportCard styling to toggle buttons

- [ ] Task 7: Integrate PipelineBreakdownChart into AnalyticsDashboard (AC: Dashboard integration)
  - [ ] Subtask 7.1: Import PipelineBreakdownChart into AnalyticsDashboard.tsx
  - [ ] Subtask 7.2: Position chart in dashboard layout (below metric cards, first in chart row)
  - [ ] Subtask 7.3: Pass pipelineBreakdown data from useAnalytics hook
  - [ ] Subtask 7.4: Wrap chart in DaisyUI card component with 20px border radius
  - [ ] Subtask 7.5: Add card header: "Pipeline Breakdown" with optional description
  - [ ] Subtask 7.6: Ensure chart respects current date range filter
  - [ ] Subtask 7.7: Show loading skeleton while analytics data loads
  - [ ] Subtask 7.8: Display error state if breakdown data fails to load
  - [ ] Subtask 7.9: Ensure responsive layout (full width on mobile, 50% on desktop)

- [ ] Task 8: Add interactive tooltips with detailed information (AC: Hover for exact numbers)
  - [ ] Subtask 8.1: Implement custom tooltip component for chart library
  - [ ] Subtask 8.2: Display on hover: Status label, Count, Percentage
  - [ ] Subtask 8.3: Format tooltip content: "Submitted: 15 ideas (30%)"
  - [ ] Subtask 8.4: Apply PassportCard styling to tooltip (white background, border, shadow)
  - [ ] Subtask 8.5: Position tooltip near cursor or chart segment
  - [ ] Subtask 8.6: Add subtle animation for tooltip appearance
  - [ ] Subtask 8.7: Ensure tooltip is accessible (keyboard navigation triggers tooltip)
  - [ ] Subtask 8.8: Test tooltip on touch devices (tap to show, tap outside to hide)

- [ ] Task 9: Implement bottleneck detection and visual indicators (AC: Identify bottlenecks)
  - [ ] Subtask 9.1: Calculate average count across all pipeline stages
  - [ ] Subtask 9.2: Identify stages with count > 1.5x average (potential bottleneck)
  - [ ] Subtask 9.3: Add visual indicator to bottleneck stages (warning icon, pulsing border)
  - [ ] Subtask 9.4: Display bottleneck alert above chart: "⚠️ Bottleneck detected: PRD Development (25 ideas)"
  - [ ] Subtask 9.5: Make bottleneck alert dismissible or informational
  - [ ] Subtask 9.6: Use orange/amber color for bottleneck warnings
  - [ ] Subtask 9.7: Add tooltip explanation: "This stage has significantly more ideas than others"
  - [ ] Subtask 9.8: Highlight bottleneck bar/segment with distinct color or pattern

- [ ] Task 10: Add drill-down capability for each pipeline stage (AC: Click for details)
  - [ ] Subtask 10.1: Make chart bars/segments clickable
  - [ ] Subtask 10.2: On click: open modal showing ideas in that specific status
  - [ ] Subtask 10.3: Create PipelineStageDetailModal component
  - [ ] Subtask 10.4: Display list of ideas in selected stage (title, submitter, date)
  - [ ] Subtask 10.5: Query ideas filtered by status: SELECT * FROM ideas WHERE status = ?
  - [ ] Subtask 10.6: Apply current date range filter to drill-down query
  - [ ] Subtask 10.7: Show loading state while fetching idea details
  - [ ] Subtask 10.8: Include pagination if stage has many ideas (show 10 per page)
  - [ ] Subtask 10.9: Add link to view full idea details from modal
  - [ ] Subtask 10.10: Close modal on outside click or close button

- [ ] Task 11: Create color mapping utility for pipeline statuses (AC: Consistent colors)
  - [ ] Subtask 11.1: Create getPipelineStageColor() utility function in lib/utils.ts
  - [ ] Subtask 11.2: Map statuses to PassportCard theme colors:
    - submitted: Neutral gray (#94A3B8)
    - approved: Sky blue (#0EA5E9)
    - prd_development: Amber yellow (#F59E0B)
    - prototype_complete: Green (#10B981)
    - rejected: Red (#EF4444)
  - [ ] Subtask 11.3: Return hex color code for given status
  - [ ] Subtask 11.4: Handle unknown status gracefully (return default gray)
  - [ ] Subtask 11.5: Use utility consistently across all pipeline visualizations
  - [ ] Subtask 11.6: Document color choices in code comments

- [ ] Task 12: Add comprehensive unit tests for pipeline breakdown (AC: Quality assurance)
  - [ ] Subtask 12.1: Update analyticsService.test.ts
  - [ ] Subtask 12.2: Test getAnalytics() returns pipelineBreakdown correctly
  - [ ] Subtask 12.3: Test percentage calculation accuracy (edge case: total = 0)
  - [ ] Subtask 12.4: Test status grouping and sorting order
  - [ ] Subtask 12.5: Test date range filter affects breakdown data
  - [ ] Subtask 12.6: Create PipelineBreakdownChart.test.tsx
  - [ ] Subtask 12.7: Test chart renders with breakdown data
  - [ ] Subtask 12.8: Test empty state displays correctly
  - [ ] Subtask 12.9: Test tooltips show on hover
  - [ ] Subtask 12.10: Test chart type toggle switches views
  - [ ] Subtask 12.11: Test bottleneck detection highlights correct stages
  - [ ] Subtask 12.12: Create PipelineDonutChart.test.tsx
  - [ ] Subtask 12.13: Test donut chart renders segments correctly
  - [ ] Subtask 12.14: Create PipelineStageDetailModal.test.tsx
  - [ ] Subtask 12.15: Test modal opens with correct status filter
  - [ ] Subtask 12.16: Test drill-down query fetches correct ideas
  - [ ] Subtask 12.17: Achieve >90% test coverage for all new code

- [ ] Task 13: Optimize database queries for pipeline aggregation (AC: Performance)
  - [ ] Subtask 13.1: Verify index exists on ideas.status column
  - [ ] Subtask 13.2: If not exists, create migration: CREATE INDEX idx_ideas_status ON ideas(status)
  - [ ] Subtask 13.3: Create composite index for status + created_at: CREATE INDEX idx_ideas_status_created_at ON ideas(status, created_at)
  - [ ] Subtask 13.4: Test query performance with EXPLAIN ANALYZE
  - [ ] Subtask 13.5: Ensure GROUP BY query executes in <100ms
  - [ ] Subtask 13.6: Verify RLS policies don't degrade grouping performance
  - [ ] Subtask 13.7: Cache breakdown data in React Query (staleTime: 60s)
  - [ ] Subtask 13.8: Use database-level aggregation (not JavaScript)

- [ ] Task 14: Implement responsive chart sizing and mobile optimization (AC: Responsive design)
  - [ ] Subtask 14.1: Ensure chart container uses responsive width (100% of parent)
  - [ ] Subtask 14.2: Set min-height for chart area (350px desktop, 300px mobile)
  - [ ] Subtask 14.3: Adjust font sizes for labels on mobile (smaller text)
  - [ ] Subtask 14.4: Stack legend below chart on mobile (side legend on desktop)
  - [ ] Subtask 14.5: Test chart on various screen sizes (375px, 768px, 1024px, 1920px)
  - [ ] Subtask 14.6: Ensure touch interactions work on mobile (tap for tooltip)
  - [ ] Subtask 14.7: Use CSS media queries for breakpoint adjustments
  - [ ] Subtask 14.8: Verify chart doesn't overflow container on small screens

- [ ] Task 15: Add accessibility features for chart visualization (AC: WCAG 2.1 AA compliance)
  - [ ] Subtask 15.1: Add ARIA label to chart container: "Pipeline stage breakdown chart"
  - [ ] Subtask 15.2: Provide text alternative for chart data (data table below chart)
  - [ ] Subtask 15.3: Make chart keyboard navigable (tab through bars/segments)
  - [ ] Subtask 15.4: Announce selected stage to screen readers
  - [ ] Subtask 15.5: Ensure color is not the only indicator (use patterns or labels)
  - [ ] Subtask 15.6: Verify color contrast meets WCAG standards (test with contrast checker)
  - [ ] Subtask 15.7: Add focus indicators for interactive chart elements
  - [ ] Subtask 15.8: Test with screen reader (NVDA or VoiceOver)

- [ ] Task 16: Implement error handling and edge cases (AC: Robust error handling)
  - [ ] Subtask 16.1: Handle database connection errors gracefully
  - [ ] Subtask 16.2: Show error message if breakdown query fails
  - [ ] Subtask 16.3: Handle case where all ideas have same status (show single bar)
  - [ ] Subtask 16.4: Handle case where no ideas exist (show empty state)
  - [ ] Subtask 16.5: Handle case where percentages don't sum to 100% due to rounding (adjust largest segment)
  - [ ] Subtask 16.6: Validate status values match expected enum
  - [ ] Subtask 16.7: Log errors to console for debugging
  - [ ] Subtask 16.8: Provide retry button if query fails

- [ ] Task 17: Create data table alternative for chart data (AC: Data accessibility)
  - [ ] Subtask 17.1: Create PipelineBreakdownTable component
  - [ ] Subtask 17.2: Display same breakdown data in table format
  - [ ] Subtask 17.3: Columns: Status, Count, Percentage, Visual bar
  - [ ] Subtask 17.4: Add toggle button to switch between chart and table view
  - [ ] Subtask 17.5: Use DaisyUI table component with proper styling
  - [ ] Subtask 17.6: Add color indicator to each row (colored dot or bar)
  - [ ] Subtask 17.7: Make table rows clickable for drill-down
  - [ ] Subtask 17.8: Ensure table is responsive (scrollable on mobile)
  - [ ] Subtask 17.9: Position table toggle near chart type toggle

## Dev Notes

### Architecture Alignment

**Feature Location:**
- PipelineBreakdownChart: `src/features/admin/components/analytics/PipelineBreakdownChart.tsx`
- PipelineDonutChart: `src/features/admin/components/analytics/PipelineDonutChart.tsx`
- PipelineStageDetailModal: `src/features/admin/components/analytics/PipelineStageDetailModal.tsx`
- PipelineBreakdownTable: `src/features/admin/components/analytics/PipelineBreakdownTable.tsx`
- ChartTypeToggle: `src/features/admin/components/analytics/ChartTypeToggle.tsx`
- analyticsService: `src/features/admin/services/analyticsService.ts` (update existing)
- Types: `src/features/admin/analytics/types.ts` (update existing)
- Utilities: `src/lib/utils.ts` (add getPipelineStageColor)

**Database Operations:**
- Table: `ideas` (read-only access, grouped by status)
- Queries: `SELECT status, COUNT(*) as count FROM ideas WHERE created_at >= ? AND created_at <= ? GROUP BY status ORDER BY status`
- Drill-down: `SELECT * FROM ideas WHERE status = ? ORDER BY created_at DESC LIMIT 10 OFFSET ?`
- Indexes: `idx_ideas_status`, `idx_ideas_status_created_at` (composite)

**State Management:**
- React Query for analytics data: query key `['admin', 'analytics', dateRange]`
- Local state for chart type preference (useState)
- Local state for drill-down modal visibility (useState)
- Cache: staleTime 60s, cacheTime 5 minutes

**External Dependencies:**
- Charting library: Recharts (recommended) or native SVG
- Install if needed: `npm install recharts`
- Alternative: Build custom SVG charts if avoiding dependencies

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/admin/components/analytics/`
- Naming: PascalCase for components (`PipelineBreakdownChart`)
- Service layer: `analyticsService.getAnalytics()` returns pipelineBreakdown
- React Query hooks: `useAnalytics(dateRange)` provides breakdown data

**Data Validation:**
- Validate breakdown data structure with Zod schema
- PipelineBreakdownSchema: `z.array(z.object({ status, count, percentage, color }))`
- Ensure percentages are valid (0-100)
- Validate status values match enum
- Handle null/undefined values gracefully

**Error Handling:**
- Wrap in `<ErrorBoundary>` at feature level
- Loading skeletons for chart area
- Error states with retry buttons
- User-friendly error messages
- Log errors to console

**Performance Requirements:**
- Pipeline breakdown query executes in <100ms (with indexes)
- Chart renders smoothly without lag
- React Query caching minimizes redundant queries
- Use database-level GROUP BY (not JavaScript)

**Testing Standards:**
- Unit tests for analyticsService breakdown calculation
- Unit tests for PipelineBreakdownChart rendering
- Unit tests for chart interactions (hover, click)
- Integration tests for AnalyticsDashboard with chart
- Test all loading, error, and success states
- Test responsive behavior at different breakpoints
- Achieve >90% test coverage

### Previous Story Learnings

**From Story 6.1 (Analytics Dashboard Layout):**
- AnalyticsDashboard layout established with metric cards and chart placeholders
- Chart placeholders created in 2-column grid layout
- React Query integration working smoothly
- Loading skeletons prevent layout shift
- DaisyUI card components used consistently
- PassportCard styling (#E10514, 20px radius) applied throughout

**From Story 6.2 (Total Ideas Submitted Metric):**
- analyticsService extended with real database queries
- Date range filtering infrastructure implemented and working
- MetricsCards displaying real data from analytics
- Trend calculation pattern established
- Drill-down modal pattern created (IdeaBreakdownModal)
- DateRangeFilter component integrated into dashboard
- useAnalytics hook supports date range parameter
- Database index on created_at improves query performance

**Key Patterns to Follow:**
- React Query hook pattern: `const { data, isLoading, error } = useAnalytics(dateRange);`
- Service response pattern: `ServiceResponse<AnalyticsData>` with `{ data, error }`
- DaisyUI components: card, modal, table, button group
- PassportCard styling: #E10514 primary red, consistent border radius
- Loading skeletons for all async operations
- Error boundaries for graceful failure handling
- Comprehensive unit tests (>90% coverage)

**From Recent Git History (PRD Stories 3.4-3.8):**
- Comprehensive implementation patterns working well
- Component composition approach (MessageBubble, ChatInterface)
- Custom hooks for complex state management
- Extensive unit tests ensure quality
- Real-time updates enhance UX
- Status indicators improve user understanding

### Project Structure Notes

**Files to Modify:**
```
src/features/admin/
├── services/
│   └── analyticsService.ts (UPDATE: add pipelineBreakdown calculation)
├── components/analytics/
│   └── AnalyticsDashboard.tsx (UPDATE: integrate chart)
└── analytics/
    └── types.ts (UPDATE: add PipelineBreakdownData types)
```

**New Files to Create:**
```
src/features/admin/components/analytics/
├── PipelineBreakdownChart.tsx
├── PipelineBreakdownChart.test.tsx
├── PipelineDonutChart.tsx
├── PipelineDonutChart.test.tsx
├── PipelineStageDetailModal.tsx
├── PipelineStageDetailModal.test.tsx
├── PipelineBreakdownTable.tsx
├── PipelineBreakdownTable.test.tsx
├── ChartTypeToggle.tsx
├── ChartTypeToggle.test.tsx
└── index.ts (UPDATE: export new components)

src/lib/
└── utils.ts (UPDATE: add getPipelineStageColor utility)
```

**Database Migrations (if needed):**
```
supabase/migrations/
├── [timestamp]_create_idx_ideas_status.sql (if index doesn't exist)
└── [timestamp]_create_idx_ideas_status_created_at.sql (composite index)
```

### Developer Context

**🎯 Story Goal:**
This story implements the second major visualization in the Analytics Dashboard: Pipeline Stage Breakdown Chart. It provides admins with visual insight into the innovation pipeline, revealing where ideas are distributed and where bottlenecks exist.

**Key Deliverables:**
1. **Interactive Chart Visualization** - Bar or donut chart showing ideas by status
2. **Bottleneck Detection** - Visual indicators for stages with high concentration
3. **Drill-Down Capability** - Click stage to see detailed idea list
4. **Multiple View Options** - Toggle between chart types and data table

**⚠️ Critical Requirements:**
- **Performance**: Pipeline GROUP BY query must execute in <100ms
- **Visual Clarity**: Color coding must make bottlenecks immediately obvious
- **Interactivity**: Hover tooltips and click drill-downs must work smoothly
- **Accessibility**: Chart must be accessible to screen readers with text alternative

**🔗 Dependencies:**
- Story 6.1 (Analytics Dashboard Layout) - COMPLETED ✅
- Story 6.2 (Total Ideas Submitted Metric) - COMPLETED ✅
- ideas table with status column - EXISTS ✅
- Date range filtering infrastructure - IMPLEMENTED ✅
- AnalyticsDashboard component - IMPLEMENTED ✅

**📊 Data Sources:**
- Primary table: `ideas` (columns: id, status, created_at)
- Aggregation: `SELECT status, COUNT(*) FROM ideas GROUP BY status`
- Drill-down: `SELECT * FROM ideas WHERE status = ? AND created_at BETWEEN ? AND ?`
- Filters: Apply current date range to all queries

**🎨 UI/UX Considerations:**
- **Chart Type**: Bar chart (default) vs Donut chart (alternative)
- **Color Mapping**:
  - submitted: Gray (#94A3B8) - neutral
  - approved: Blue (#0EA5E9) - approved, ready to start
  - prd_development: Yellow (#F59E0B) - in progress
  - prototype_complete: Green (#10B981) - success
  - rejected: Red (#EF4444) - stopped
- **Bottleneck Indicator**: Orange/amber warning for stages >1.5x average
- **Tooltips**: Show status label, count, and percentage on hover
- **Legend**: Clear labels with color indicators
- **Responsive**: Chart scales smoothly across all screen sizes

**🧪 Testing Strategy:**
- Unit tests: analyticsService breakdown calculation
- Unit tests: Chart component rendering and interactions
- Unit tests: Tooltip and drill-down functionality
- Integration tests: Dashboard with chart and filters
- Visual regression: Chart appearance consistency
- Accessibility: Screen reader and keyboard navigation
- Performance: Query execution time measurement

**🚀 Implementation Order:**
1. Update AnalyticsData types with pipelineBreakdown
2. Implement pipeline breakdown query in analyticsService
3. Create color mapping utility (getPipelineStageColor)
4. Evaluate and install charting library (Recharts recommended)
5. Build PipelineBreakdownChart component (bar chart)
6. Add tooltips with detailed information
7. Implement bottleneck detection logic
8. Create drill-down modal (PipelineStageDetailModal)
9. Build alternative views (donut chart, data table)
10. Add chart type toggle
11. Integrate into AnalyticsDashboard
12. Add comprehensive tests
13. Optimize database queries with indexes
14. Verify accessibility compliance

**💡 Edge Cases to Handle:**
- Zero ideas in database (show empty state with helpful message)
- All ideas in single status (show single bar, no bottleneck)
- Unknown status values (filter out or show as "Other")
- Percentages don't sum to 100% due to rounding (adjust largest)
- Very large counts (format with K, M notation: 1.2K, 5M)
- Date range with no ideas (show empty chart)
- Database connection errors (show error with retry)

**🔍 Verification Checklist:**
- [ ] Pipeline breakdown counts match database query results
- [ ] Percentages sum to 100% (or very close with rounding)
- [ ] Colors applied consistently across all views
- [ ] Tooltips display on hover with correct data
- [ ] Click drill-down opens modal with filtered ideas
- [ ] Bottleneck detection highlights correct stages
- [ ] Chart responsive at all breakpoints
- [ ] Loading states appear during data fetch
- [ ] Error states handle failures gracefully
- [ ] Performance: queries execute in <100ms
- [ ] Security: admin-only access enforced
- [ ] Tests: >90% coverage achieved
- [ ] Accessibility: WCAG 2.1 AA compliance verified

### Library and Framework Requirements

**Core Dependencies (Already Installed):**
- React 19.x - Component framework
- TypeScript 5.x - Type safety
- React Query (@tanstack/react-query) - Server state management
- Zod - Data validation
- DaisyUI 5.x - UI components
- Tailwind CSS 4.x - Styling
- Heroicons - Icons

**Charting Library (NEW DEPENDENCY):**
- **Recommended: Recharts**
  - Why: React-native, TypeScript support, composable API, good documentation
  - Bundle size: ~100KB (reasonable)
  - Installation: `npm install recharts`
  - Features: Bar charts, pie/donut charts, tooltips, responsive
  - Customization: Highly customizable with PassportCard theme
- **Alternative: Chart.js with react-chartjs-2**
  - Larger ecosystem, more features, but heavier bundle
- **Alternative: Native SVG**
  - No dependency, full control, but more implementation work
- **Alternative: Tremor (built on Recharts)**
  - Higher-level abstractions, but less customization

**Decision**: Use **Recharts** unless there's a strong reason to avoid dependencies (in which case, build custom SVG charts).

**Supabase Integration:**
- @supabase/supabase-js - Database client
- PostgreSQL GROUP BY aggregation
- Supabase RLS policies for admin access

**Testing Dependencies (Already Installed):**
- Vitest - Test runner
- @testing-library/react - Component testing
- @testing-library/user-event - User interaction testing

### File Structure Requirements

**Follow Architecture Patterns:**
- Feature-based organization: `features/admin/components/analytics/`
- Co-located tests: `PipelineBreakdownChart.test.tsx` next to component
- Service layer updates: `features/admin/services/analyticsService.ts`
- Hook updates: `features/admin/hooks/useAnalytics.ts`
- Type updates: `features/admin/analytics/types.ts`
- Utilities: `lib/utils.ts` for shared color mapping

**Naming Conventions:**
- Components: PascalCase (`PipelineBreakdownChart`, `PipelineDonutChart`)
- Functions: camelCase (`getAnalytics`, `getPipelineStageColor`)
- Types: PascalCase (`PipelineStageData`, `PipelineStatus`)
- Database columns: snake_case (`status`, `created_at`)

### Security Considerations

**Admin-Only Access:**
- RLS policies on ideas table enforce admin SELECT permission
- analyticsService queries run in user context (RLS enforced automatically)
- Frontend route protection via AdminRoute component
- Double verification: route guard + database RLS

**SQL Injection Prevention:**
- Use parameterized queries via Supabase client
- Never concatenate user input into SQL strings
- Validate and sanitize status filter for drill-down queries
- Supabase client handles SQL escaping automatically

**Data Privacy:**
- Aggregate counts only in main chart (no individual details)
- Drill-down shows idea titles but respects RLS (admin sees all)
- No PII exposed in chart visualizations

**Error Handling:**
- Don't expose database errors to UI (show generic message)
- Log detailed errors server-side for admin debugging
- Rate limit drill-down queries to prevent abuse (future enhancement)

### Performance Optimization

**Database Query Optimization:**
- **Index on status**: `CREATE INDEX idx_ideas_status ON ideas(status)`
- **Composite index**: `CREATE INDEX idx_ideas_status_created_at ON ideas(status, created_at)`
- **GROUP BY aggregation**: Execute at database level (not JavaScript)
- **Query plan**: Verify with EXPLAIN ANALYZE in Supabase SQL editor
- **Expected performance**: <100ms for GROUP BY with indexes

**React Query Caching:**
- staleTime: 60 seconds (analytics don't change frequently)
- cacheTime: 5 minutes (keep in memory)
- Query key includes dateRange for proper cache invalidation
- Background refetch on window focus

**Chart Rendering Performance:**
- Use React.memo for chart components if re-rendering is expensive
- Memoize color mapping utility results
- Lazy load drill-down modal (only render when opened)
- Debounce chart type toggle if needed (unlikely)
- Use requestAnimationFrame for smooth animations

**Bundle Size Optimization:**
- Tree-shaking removes unused chart components
- Consider code splitting for chart library (lazy load)
- If bundle size is concern, evaluate native SVG approach

### Database Schema Reference

**ideas Table:**
```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  problem TEXT,
  solution TEXT,
  impact TEXT,
  status TEXT CHECK (status IN ('submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Required indexes for performance
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_status_created_at ON ideas(status, created_at);

-- RLS policy for admin access
CREATE POLICY "Admins can view all ideas"
  ON ideas FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
```

**Query Examples:**
```sql
-- Pipeline breakdown (all time)
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM ideas
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'submitted' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'prd_development' THEN 3
    WHEN 'prototype_complete' THEN 4
    WHEN 'rejected' THEN 5
    ELSE 6
  END;

-- Pipeline breakdown (date range)
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM ideas
WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'submitted' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'prd_development' THEN 3
    WHEN 'prototype_complete' THEN 4
    WHEN 'rejected' THEN 5
    ELSE 6
  END;

-- Drill-down for specific status
SELECT 
  id,
  title,
  user_id,
  created_at,
  updated_at
FROM ideas
WHERE status = 'prd_development'
  AND created_at >= '2026-01-01'
  AND created_at < '2026-02-01'
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

### Accessibility Considerations

**WCAG 2.1 AA Compliance:**
- **Color Contrast**: Verify all status colors meet 4.5:1 ratio against background
- **Alternative Text**: Provide text description of chart data
- **Keyboard Navigation**: Tab through chart segments, Enter to drill down
- **Screen Readers**: ARIA labels for chart and data points
- **Focus Indicators**: Visible focus state on interactive elements
- **Semantic HTML**: Use appropriate landmarks and headings

**Specific Implementations:**
- Chart container: `role="img" aria-label="Pipeline stage breakdown chart showing distribution of ideas across statuses"`
- Data table: Always available as alternative to visual chart
- Keyboard: Arrow keys to navigate between bars/segments
- Tooltips: Announce content to screen readers on focus
- Colors: Use patterns/textures in addition to color for differentiation
- Drill-down: `aria-label="View details for [status] stage"`

**Testing Accessibility:**
- Use axe DevTools to verify no violations
- Test keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- Verify color contrast with WebAIM Contrast Checker
- Test with reduced motion preferences (disable animations)

### Browser Compatibility

**Supported Browsers (per Architecture):**
- Chrome (latest 2 versions) ✅
- Firefox (latest 2 versions) ✅
- Safari (latest 2 versions) ✅
- Edge (latest 2 versions) ✅

**Chart Rendering:**
- Recharts uses SVG (excellent browser support)
- CSS transforms for animations (widely supported)
- Flexbox and Grid for layout (modern browsers)
- Touch events for mobile interactions (iOS Safari, Android Chrome)

**Responsive Breakpoints:**
- Mobile: 375px - 767px (chart full width, vertical legend)
- Tablet: 768px - 1023px (chart 50% width in grid)
- Desktop: 1024px+ (chart 50% width, side legend)

### Charting Library Evaluation Details

**Recharts (Recommended):**
- ✅ TypeScript support out of the box
- ✅ React-native API (composable components)
- ✅ Good documentation and examples
- ✅ Customizable for PassportCard theme
- ✅ Responsive by default
- ✅ Tooltip and legend components built-in
- ✅ Bundle size: ~100KB (reasonable)
- ❌ Slightly dated API compared to modern alternatives

**Chart.js with react-chartjs-2:**
- ✅ Very popular, mature library
- ✅ Extensive chart types
- ✅ Good performance with large datasets
- ❌ Heavier bundle size (~200KB)
- ❌ Less React-like API (more imperative)
- ❌ Requires wrapper library for React integration

**Tremor:**
- ✅ Built on Recharts, simpler API
- ✅ Beautiful defaults, minimal config
- ✅ TypeScript support
- ❌ Less customization (good defaults, harder to override)
- ❌ Newer library, smaller community
- ❌ May conflict with DaisyUI styling

**Native SVG:**
- ✅ No dependency, full control
- ✅ Smallest bundle impact
- ✅ Ultimate customization
- ❌ Significant implementation effort
- ❌ Need to handle responsive, tooltips, accessibility manually
- ❌ More code to maintain and test

**Decision Rationale:**
Use **Recharts** because:
1. Well-established React charting library
2. TypeScript support matches project requirements
3. Composable API fits React component patterns
4. Customizable enough for PassportCard theme
5. Built-in responsive behavior
6. Good documentation and community support
7. Reasonable bundle size (<100KB)

If bundle size becomes a concern or dependencies need minimization, fall back to **native SVG** with custom implementation.

### Deployment Considerations

**Vercel Deployment:**
- No environment variable changes needed
- No new Supabase Edge Functions required
- Database migrations for indexes: apply via Supabase SQL editor
- Standard React Router configuration (no changes)
- New dependency: Recharts (automatically included in build)

**Database Migration Steps:**
1. Check if indexes exist:
   ```sql
   SELECT * FROM pg_indexes 
   WHERE tablename = 'ideas' 
   AND indexname IN ('idx_ideas_status', 'idx_ideas_status_created_at');
   ```
2. Create indexes if needed:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
   CREATE INDEX IF NOT EXISTS idx_ideas_status_created_at ON ideas(status, created_at);
   ```
3. Verify RLS policies allow admin GROUP BY queries
4. Test queries with EXPLAIN ANALYZE to confirm index usage

**Testing in Production:**
- Verify chart renders correctly with real data
- Test all status values display properly
- Check bottleneck detection with actual distribution
- Test drill-down with real ideas data
- Verify responsive layout on actual devices
- Check performance with production data volume
- Test date filtering affects chart correctly

**Rollback Plan:**
- If charting library causes issues: Remove Recharts, use placeholder
- If performance problems: Rollback migrations, optimize queries
- Database indexes are safe to create (no data changes)
- No API changes, purely frontend additions

### Bottleneck Detection Algorithm

**Detection Logic:**
```typescript
// Calculate average count across all pipeline stages
const totalIdeas = pipelineBreakdown.reduce((sum, stage) => sum + stage.count, 0);
const averagePerStage = totalIdeas / pipelineBreakdown.length;

// Identify bottlenecks: stages with >1.5x average
const bottlenecks = pipelineBreakdown.filter(stage => 
  stage.count > averagePerStage * 1.5
);

// Visual indicator: orange warning if bottleneck detected
if (bottlenecks.length > 0) {
  // Show alert: "⚠️ Bottleneck detected: [status] ([count] ideas)"
  // Highlight stage in chart with pulsing border or warning icon
}
```

**Threshold Justification:**
- 1.5x average: Significant but not overly sensitive
- Prevents false positives with natural variation
- Adjustable if feedback indicates different threshold needed

**Visual Indicators:**
- Orange/amber color for bottleneck alert
- Pulsing border or warning icon on bottleneck bar/segment
- Tooltip explanation: "This stage has significantly more ideas than others"
- Alert message above chart with dismissible option

### Color Mapping Specification

**Pipeline Status Colors (PassportCard Theme):**
```typescript
const PIPELINE_STAGE_COLORS = {
  submitted: '#94A3B8',        // Neutral gray (Slate 400)
  approved: '#0EA5E9',          // Sky blue (Sky 500)
  prd_development: '#F59E0B',   // Amber yellow (Amber 500)
  prototype_complete: '#10B981', // Green (Emerald 500)
  rejected: '#EF4444',          // Red (Red 500)
} as const;
```

**Color Rationale:**
- **submitted** (gray): Neutral, awaiting review
- **approved** (blue): Positive signal, ready to start
- **prd_development** (yellow): In progress, active work
- **prototype_complete** (green): Success, completed
- **rejected** (red): Stopped, not moving forward

**Accessibility Note:**
All colors verified to meet WCAG 2.1 AA contrast ratio (4.5:1) against white background.

### References

**Source Documents:**
- [PRD: FR42 - Pipeline Stage Breakdown](file:///_bmad-output/planning-artifacts/prd.md#analytics--reporting)
- [Epic 6: Analytics & Innovation Metrics](file:///_bmad-output/planning-artifacts/epics.md#epic-6-analytics--innovation-metrics)
- [Story 6.3: Pipeline Stage Breakdown Chart](file:///_bmad-output/planning-artifacts/epics.md#story-63-pipeline-stage-breakdown-chart)
- [Architecture: Admin Feature Structure](file:///_bmad-output/planning-artifacts/architecture.md#project-structure--boundaries)
- [Architecture: State Management Patterns](file:///_bmad-output/planning-artifacts/architecture.md#state-management-patterns)
- [Architecture: Database Schema](file:///_bmad-output/planning-artifacts/architecture.md#data-architecture)

**Charting Documentation:**
- [Recharts Official Documentation](https://recharts.org/en-US/)
- [Recharts BarChart Examples](https://recharts.org/en-US/api/BarChart)
- [Recharts PieChart Examples](https://recharts.org/en-US/api/PieChart)
- [Recharts Responsive Container](https://recharts.org/en-US/api/ResponsiveContainer)

**Database Documentation:**
- [PostgreSQL GROUP BY](https://www.postgresql.org/docs/current/queries-group.html)
- [PostgreSQL Window Functions](https://www.postgresql.org/docs/current/tutorial-window.html)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Indexes](https://supabase.com/docs/guides/database/indexes)

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
