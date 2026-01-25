# Story 6.4: Completion Rates Metrics

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin**,
I want **to see conversion rates through the pipeline**,
So that **I can measure how effectively ideas progress**.

## Acceptance Criteria

**Given** I am on the Analytics Dashboard
**When** I view the completion rates section
**Then** I see conversion rates:
  - Submitted → Approved rate
  - Approved → PRD Complete rate
  - PRD Complete → Prototype rate
  - Overall: Submitted → Prototype Complete rate
**And** rates are shown as percentages with visual indicators
**And** I can see how rates have changed over time (trend line)

**Given** completion rates are low at a certain stage
**When** I view the metrics
**Then** the bottleneck is visually highlighted

## Tasks / Subtasks

- [ ] Task 1: Update analyticsService to calculate completion rates (AC: Conversion rate calculation)
  - [ ] Subtask 1.1: Update getAnalytics() function in analyticsService.ts
  - [ ] Subtask 1.2: Query for submitted ideas count: SELECT COUNT(*) FROM ideas WHERE status IN ('submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected')
  - [ ] Subtask 1.3: Query for approved ideas count: SELECT COUNT(*) FROM ideas WHERE status IN ('approved', 'prd_development', 'prototype_complete')
  - [ ] Subtask 1.4: Query for PRD complete ideas count: SELECT COUNT(*) FROM ideas WHERE status IN ('prd_development', 'prototype_complete')
  - [ ] Subtask 1.5: Query for prototype complete ideas count: SELECT COUNT(*) FROM ideas WHERE status = 'prototype_complete'
  - [ ] Subtask 1.6: Calculate Submitted → Approved rate: (approved_count / submitted_count) * 100
  - [ ] Subtask 1.7: Calculate Approved → PRD Complete rate: (prd_complete_count / approved_count) * 100
  - [ ] Subtask 1.8: Calculate PRD Complete → Prototype rate: (prototype_count / prd_complete_count) * 100
  - [ ] Subtask 1.9: Calculate Overall Submitted → Prototype Complete rate: (prototype_count / submitted_count) * 100
  - [ ] Subtask 1.10: Handle division by zero (return 0% if denominator is 0)
  - [ ] Subtask 1.11: Apply date range filter to all queries (WHERE created_at BETWEEN start_date AND end_date)
  - [ ] Subtask 1.12: Return CompletionRates object in AnalyticsData
  - [ ] Subtask 1.13: Add error handling with user-friendly messages

- [ ] Task 2: Calculate trend data for completion rates over time (AC: Trend line display)
  - [ ] Subtask 2.1: Query for previous period completion rates (e.g., last 30 days vs previous 30 days)
  - [ ] Subtask 2.2: Calculate rate change for each conversion: current_rate - previous_rate
  - [ ] Subtask 2.3: Determine trend direction: positive (↑), negative (↓), or neutral (→)
  - [ ] Subtask 2.4: Calculate percentage change: ((current - previous) / previous) * 100
  - [ ] Subtask 2.5: Format trend data: { direction, change, changePercentage }
  - [ ] Subtask 2.6: Handle case where previous period has no data (show "N/A" or "New")
  - [ ] Subtask 2.7: Return trend data for each conversion rate
  - [ ] Subtask 2.8: Add error handling for trend calculation failures

- [ ] Task 3: Update AnalyticsData TypeScript types for completion rates (AC: Type safety)
  - [ ] Subtask 3.1: Update AnalyticsData interface in features/admin/types.ts
  - [ ] Subtask 3.2: Add completionRates: CompletionRates field
  - [ ] Subtask 3.3: Define CompletionRates interface: { submittedToApproved, approvedToPrd, prdToPrototype, overallSubmittedToPrototype }
  - [ ] Subtask 3.4: Define ConversionRate interface: { rate, trend, count, totalCount }
  - [ ] Subtask 3.5: Define TrendData interface: { direction: 'up' | 'down' | 'neutral', change: number, changePercentage: number }
  - [ ] Subtask 3.6: Ensure all numeric fields (rate, change) are typed as number
  - [ ] Subtask 3.7: Export all types via index.ts

- [ ] Task 4: Create CompletionRatesCard component (AC: Rates display with visual indicators)
  - [ ] Subtask 4.1: Create CompletionRatesCard.tsx in features/admin/components/analytics/
  - [ ] Subtask 4.2: Accept completionRates data via props: { data: CompletionRates }
  - [ ] Subtask 4.3: Display card title: "Completion Rates"
  - [ ] Subtask 4.4: Create grid layout for 4 conversion rate metrics (2x2 on desktop, 1 column on mobile)
  - [ ] Subtask 4.5: For each rate, display: Label, Percentage, Trend indicator, Count ratio
  - [ ] Subtask 4.6: Format rate as percentage: "75%" or "N/A" if data unavailable
  - [ ] Subtask 4.7: Show count ratio: "15 of 20 ideas"
  - [ ] Subtask 4.8: Use DaisyUI card component with 20px border radius
  - [ ] Subtask 4.9: Apply PassportCard styling consistently
  - [ ] Subtask 4.10: Add loading skeleton for card content
  - [ ] Subtask 4.11: Handle empty state: "No data available" message

- [ ] Task 5: Create ConversionRateMetric component for individual rate display (AC: Individual metric display)
  - [ ] Subtask 5.1: Create ConversionRateMetric.tsx in features/admin/components/analytics/
  - [ ] Subtask 5.2: Accept props: { label, rate, trend, count, totalCount }
  - [ ] Subtask 5.3: Display metric label: "Submitted → Approved"
  - [ ] Subtask 5.4: Display percentage prominently with large font size (2xl or 3xl)
  - [ ] Subtask 5.5: Add color coding for rate health: >70% green, 40-70% yellow, <40% red
  - [ ] Subtask 5.6: Display trend indicator with icon: ↑ (green), ↓ (red), → (gray)
  - [ ] Subtask 5.7: Show trend change: "+5%" or "-3%"
  - [ ] Subtask 5.8: Display count ratio below rate: "15 of 20 ideas"
  - [ ] Subtask 5.9: Add subtle background color based on health status
  - [ ] Subtask 5.10: Make metric clickable for drill-down details (placeholder for future)
  - [ ] Subtask 5.11: Add tooltip with explanation of what the rate measures

- [ ] Task 6: Implement low conversion rate detection and visual highlighting (AC: Bottleneck highlighting)
  - [ ] Subtask 6.1: Define low conversion threshold: <40% is concerning, <25% is critical
  - [ ] Subtask 6.2: Identify conversion rates below threshold
  - [ ] Subtask 6.3: Add warning indicator to low-performing metrics (⚠️ icon)
  - [ ] Subtask 6.4: Apply red or amber background to critical/warning rates
  - [ ] Subtask 6.5: Display alert message above card if any rate is critical: "⚠️ Low conversion detected: [stage] (25%)"
  - [ ] Subtask 6.6: Add tooltip explanation: "This conversion rate is below the expected threshold"
  - [ ] Subtask 6.7: Make alert dismissible or informational
  - [ ] Subtask 6.8: Use color coding consistently: red for critical (<25%), amber for warning (25-40%), gray for normal (>40%)

- [ ] Task 7: Add trend line visualization for completion rates over time (AC: Trend visualization)
  - [ ] Subtask 7.1: Create CompletionRatesTrendChart component
  - [ ] Subtask 7.2: Query historical completion rates data: GROUP BY date period (daily, weekly, monthly)
  - [ ] Subtask 7.3: Accept date range and granularity (daily, weekly, monthly) as props
  - [ ] Subtask 7.4: Implement line chart using Recharts (or native SVG)
  - [ ] Subtask 7.5: X-axis: time period, Y-axis: completion rate percentage (0-100%)
  - [ ] Subtask 7.6: Display all 4 conversion rates as separate lines with different colors
  - [ ] Subtask 7.7: Add legend showing which line corresponds to which conversion
  - [ ] Subtask 7.8: Show tooltip on hover with exact rate and date
  - [ ] Subtask 7.9: Make chart responsive (scales to container width)
  - [ ] Subtask 7.10: Add chart title: "Completion Rates Over Time"
  - [ ] Subtask 7.11: Handle case where insufficient historical data exists (show message)

- [ ] Task 8: Integrate CompletionRatesCard into AnalyticsDashboard (AC: Dashboard integration)
  - [ ] Subtask 8.1: Import CompletionRatesCard into AnalyticsDashboard.tsx
  - [ ] Subtask 8.2: Position card in dashboard layout (after pipeline breakdown chart)
  - [ ] Subtask 8.3: Pass completionRates data from useAnalytics hook
  - [ ] Subtask 8.4: Wrap card in responsive grid layout (full width on mobile, 50% on desktop)
  - [ ] Subtask 8.5: Ensure card respects current date range filter
  - [ ] Subtask 8.6: Show loading skeleton while analytics data loads
  - [ ] Subtask 8.7: Display error state if completion rates data fails to load
  - [ ] Subtask 8.8: Ensure consistent spacing with other dashboard cards

- [ ] Task 9: Add drill-down capability for each conversion rate (AC: Detailed breakdown)
  - [ ] Subtask 9.1: Make each ConversionRateMetric clickable
  - [ ] Subtask 9.2: Create ConversionRateDetailModal component
  - [ ] Subtask 9.3: On click: open modal showing ideas involved in that conversion
  - [ ] Subtask 9.4: For Submitted → Approved: show submitted ideas and which were approved/rejected
  - [ ] Subtask 9.5: Query ideas with appropriate status filters for selected conversion
  - [ ] Subtask 9.6: Display list of ideas: title, status, transition date
  - [ ] Subtask 9.7: Apply current date range filter to drill-down query
  - [ ] Subtask 9.8: Show loading state while fetching idea details
  - [ ] Subtask 9.9: Include pagination if many ideas (show 10 per page)
  - [ ] Subtask 9.10: Add link to view full idea details from modal
  - [ ] Subtask 9.11: Close modal on outside click or close button

- [ ] Task 10: Implement funnel visualization alternative view (AC: Visual funnel representation)
  - [ ] Subtask 10.1: Create CompletionRatesFunnel component
  - [ ] Subtask 10.2: Display funnel chart showing idea progression: Submitted → Approved → PRD → Prototype
  - [ ] Subtask 10.3: Funnel stages sized proportionally to idea counts
  - [ ] Subtask 10.4: Show count and percentage at each funnel stage
  - [ ] Subtask 10.5: Display drop-off between stages visually
  - [ ] Subtask 10.6: Use PassportCard colors for funnel segments
  - [ ] Subtask 10.7: Add tooltip showing exact numbers on hover
  - [ ] Subtask 10.8: Make funnel segments clickable for drill-down
  - [ ] Subtask 10.9: Position funnel below or next to completion rates card
  - [ ] Subtask 10.10: Add toggle button to switch between rates card and funnel view

- [ ] Task 11: Add benchmark comparison feature (AC: Performance benchmarks)
  - [ ] Subtask 11.1: Define industry standard benchmarks (e.g., >50% Submitted→Approved is good)
  - [ ] Subtask 11.2: Display benchmark comparison indicator for each rate
  - [ ] Subtask 11.3: Show "Above benchmark ✓" or "Below benchmark ✗" next to each rate
  - [ ] Subtask 11.4: Use color coding: green for above, red for below benchmark
  - [ ] Subtask 11.5: Add tooltip explaining benchmark: "Industry standard: >50% for this conversion"
  - [ ] Subtask 11.6: Make benchmarks configurable (future enhancement placeholder)
  - [ ] Subtask 11.7: Store benchmark values in constants file for easy adjustment

- [ ] Task 12: Create comprehensive unit tests for completion rates (AC: Quality assurance)
  - [ ] Subtask 12.1: Update analyticsService.test.ts
  - [ ] Subtask 12.2: Test getAnalytics() returns completionRates correctly
  - [ ] Subtask 12.3: Test rate calculation accuracy (edge case: denominator = 0)
  - [ ] Subtask 12.4: Test trend calculation for positive, negative, and neutral trends
  - [ ] Subtask 12.5: Test date range filter affects completion rates data
  - [ ] Subtask 12.6: Create CompletionRatesCard.test.tsx
  - [ ] Subtask 12.7: Test card renders with completion rates data
  - [ ] Subtask 12.8: Test empty state displays correctly
  - [ ] Subtask 12.9: Test warning indicators show for low rates
  - [ ] Subtask 12.10: Create ConversionRateMetric.test.tsx
  - [ ] Subtask 12.11: Test metric displays rate, trend, and count correctly
  - [ ] Subtask 12.12: Test color coding for different rate ranges
  - [ ] Subtask 12.13: Create ConversionRateDetailModal.test.tsx
  - [ ] Subtask 12.14: Test modal opens with correct status filters
  - [ ] Subtask 12.15: Test drill-down query fetches correct ideas
  - [ ] Subtask 12.16: Create CompletionRatesTrendChart.test.tsx
  - [ ] Subtask 12.17: Test trend line chart renders historical data
  - [ ] Subtask 12.18: Achieve >90% test coverage for all new code

- [ ] Task 13: Optimize database queries for conversion rate calculation (AC: Performance)
  - [ ] Subtask 13.1: Verify indexes exist on ideas.status and ideas.created_at columns
  - [ ] Subtask 13.2: Use composite index idx_ideas_status_created_at for filtered queries
  - [ ] Subtask 13.3: Test query performance with EXPLAIN ANALYZE
  - [ ] Subtask 13.4: Ensure all conversion queries execute in <100ms
  - [ ] Subtask 13.5: Use COUNT with CASE statements for efficient single-query calculation:
    ```sql
    SELECT 
      COUNT(*) FILTER (WHERE status IN ('submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected')) as submitted_count,
      COUNT(*) FILTER (WHERE status IN ('approved', 'prd_development', 'prototype_complete')) as approved_count,
      COUNT(*) FILTER (WHERE status IN ('prd_development', 'prototype_complete')) as prd_count,
      COUNT(*) FILTER (WHERE status = 'prototype_complete') as prototype_count
    FROM ideas
    WHERE created_at >= ? AND created_at < ?
    ```
  - [ ] Subtask 13.6: Cache completion rates in React Query (staleTime: 60s)
  - [ ] Subtask 13.7: Verify RLS policies don't degrade query performance
  - [ ] Subtask 13.8: Use database-level calculation (not JavaScript)

- [ ] Task 14: Implement responsive layout and mobile optimization (AC: Responsive design)
  - [ ] Subtask 14.1: Ensure CompletionRatesCard uses responsive grid (1 column mobile, 2x2 desktop)
  - [ ] Subtask 14.2: Adjust font sizes for rates on mobile (slightly smaller but still prominent)
  - [ ] Subtask 14.3: Stack trend indicators vertically on mobile if needed
  - [ ] Subtask 14.4: Test card on various screen sizes (375px, 768px, 1024px, 1920px)
  - [ ] Subtask 14.5: Ensure touch interactions work on mobile (tap for drill-down)
  - [ ] Subtask 14.6: Use CSS media queries for breakpoint adjustments
  - [ ] Subtask 14.7: Verify card doesn't overflow container on small screens
  - [ ] Subtask 14.8: Test trend chart responsiveness on mobile

- [ ] Task 15: Add accessibility features for completion rates display (AC: WCAG 2.1 AA compliance)
  - [ ] Subtask 15.1: Add ARIA labels to rate metrics: "Submitted to Approved conversion rate: 75%"
  - [ ] Subtask 15.2: Ensure color is not the only indicator (use icons and text for health status)
  - [ ] Subtask 15.3: Make metrics keyboard navigable (tab through each rate, Enter to drill down)
  - [ ] Subtask 15.4: Announce rate values to screen readers
  - [ ] Subtask 15.5: Verify color contrast meets WCAG standards for rate health indicators
  - [ ] Subtask 15.6: Add focus indicators for interactive metrics
  - [ ] Subtask 15.7: Provide text alternative for trend chart
  - [ ] Subtask 15.8: Test with screen reader (NVDA or VoiceOver)

- [ ] Task 16: Implement error handling and edge cases (AC: Robust error handling)
  - [ ] Subtask 16.1: Handle database connection errors gracefully
  - [ ] Subtask 16.2: Show error message if completion rates query fails
  - [ ] Subtask 16.3: Handle case where no ideas exist (show 0% or "N/A" for all rates)
  - [ ] Subtask 16.4: Handle case where denominator is 0 (show "N/A" not error)
  - [ ] Subtask 16.5: Handle case where all ideas are in one stage (some rates will be 0%)
  - [ ] Subtask 16.6: Validate status values match expected enum
  - [ ] Subtask 16.7: Log errors to console for debugging
  - [ ] Subtask 16.8: Provide retry button if query fails

- [ ] Task 17: Add data export functionality for completion rates (AC: Data accessibility)
  - [ ] Subtask 17.1: Create ExportCompletionRates component
  - [ ] Subtask 17.2: Add export button to CompletionRatesCard header
  - [ ] Subtask 17.3: Generate CSV with completion rates data:
    - Column 1: Conversion Stage
    - Column 2: Rate (%)
    - Column 3: Count
    - Column 4: Total Count
    - Column 5: Trend Direction
    - Column 6: Trend Change (%)
  - [ ] Subtask 17.4: Include current date range in CSV filename
  - [ ] Subtask 17.5: Trigger browser download of CSV file
  - [ ] Subtask 17.6: Format data for readability in spreadsheet
  - [ ] Subtask 17.7: Add export to PNG functionality for trend chart (optional)
  - [ ] Subtask 17.8: Show toast notification on successful export

## Dev Notes

### Architecture Alignment

**Feature Location:**
- CompletionRatesCard: `src/features/admin/components/analytics/CompletionRatesCard.tsx`
- ConversionRateMetric: `src/features/admin/components/analytics/ConversionRateMetric.tsx`
- ConversionRateDetailModal: `src/features/admin/components/analytics/ConversionRateDetailModal.tsx`
- CompletionRatesTrendChart: `src/features/admin/components/analytics/CompletionRatesTrendChart.tsx`
- CompletionRatesFunnel: `src/features/admin/components/analytics/CompletionRatesFunnel.tsx`
- ExportCompletionRates: `src/features/admin/components/analytics/ExportCompletionRates.tsx`
- analyticsService: `src/features/admin/services/analyticsService.ts` (update existing)
- Types: `src/features/admin/types.ts` (update existing)
- Constants: `src/lib/constants.ts` (add benchmark values)

**Database Operations:**
- Table: `ideas` (read-only access, filtered by status)
- Conversion queries: Single optimized query using COUNT FILTER for all conversions
- Historical queries: GROUP BY DATE_TRUNC for trend data
- Drill-down: `SELECT * FROM ideas WHERE status = ? AND created_at BETWEEN ? AND ? ORDER BY created_at DESC`
- Indexes: Use existing `idx_ideas_status_created_at` composite index

**State Management:**
- React Query for analytics data: query key `['admin', 'analytics', dateRange]`
- Local state for drill-down modal visibility (useState)
- Local state for view toggle (rates card vs funnel) (useState)
- Cache: staleTime 60s, cacheTime 5 minutes

**External Dependencies:**
- Recharts (already in project from Story 6.3) for trend line chart
- Heroicons for trend indicators (↑ ↓ →)
- No new dependencies required

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/admin/components/analytics/`
- Naming: PascalCase for components (`CompletionRatesCard`, `ConversionRateMetric`)
- Service layer: `analyticsService.getAnalytics()` returns completionRates
- React Query hooks: `useAnalytics(dateRange)` provides completion rates data

**Data Validation:**
- Validate completion rates structure with Zod schema
- CompletionRatesSchema: `z.object({ submittedToApproved: ConversionRateSchema, ... })`
- ConversionRateSchema: `z.object({ rate: z.number(), trend: TrendDataSchema, count: z.number(), totalCount: z.number() })`
- Ensure rates are valid (0-100)
- Handle null/undefined values gracefully
- Validate denominator > 0 before division

**Error Handling:**
- Wrap in `<ErrorBoundary>` at feature level
- Loading skeletons for card content
- Error states with retry buttons
- User-friendly error messages
- Log errors to console

**Performance Requirements:**
- Completion rates query executes in <100ms (with indexes)
- Use single optimized query with COUNT FILTER
- React Query caching minimizes redundant queries
- Avoid multiple separate queries for each conversion

**Testing Standards:**
- Unit tests for analyticsService completion rate calculation
- Unit tests for CompletionRatesCard rendering
- Unit tests for ConversionRateMetric interactions
- Integration tests for AnalyticsDashboard with completion rates
- Test all loading, error, and success states
- Test division by zero edge cases
- Achieve >90% test coverage

### Previous Story Learnings

**From Story 6.1 (Analytics Dashboard Layout):**
- AnalyticsDashboard layout established with metric cards and chart placeholders
- Card grid layout working well (2 columns desktop, 1 column mobile)
- React Query integration smooth
- Loading skeletons prevent layout shift
- DaisyUI card components used consistently
- PassportCard styling (#E10514, 20px radius) applied throughout

**From Story 6.2 (Total Ideas Submitted Metric):**
- analyticsService pattern established for real database queries
- Date range filtering infrastructure implemented
- MetricsCards displaying real data
- Trend calculation pattern established (current vs previous period)
- Drill-down modal pattern created
- DateRangeFilter component integrated
- useAnalytics hook supports date range parameter
- Database index on created_at improves performance

**From Story 6.3 (Pipeline Stage Breakdown Chart):**
- Charting library evaluation completed (Recharts selected)
- Chart integration pattern established
- Color mapping utility created (getPipelineStageColor)
- Bottleneck detection pattern established (>1.5x average threshold)
- Drill-down modal pattern refined
- Chart type toggle pattern (bar vs donut)
- Accessibility features implemented (ARIA labels, keyboard nav)
- Performance optimization: database GROUP BY, indexes, React Query caching

**Key Patterns to Follow:**
- Service response pattern: `ServiceResponse<AnalyticsData>` with `{ data, error }`
- React Query hook: `const { data, isLoading, error } = useAnalytics(dateRange);`
- DaisyUI components: card, stat, badge, modal
- PassportCard styling: #E10514 primary red, 20px border radius
- Loading skeletons for all async operations
- Error boundaries for graceful failure handling
- Comprehensive unit tests (>90% coverage)
- Color coding for health status: green (good), yellow (warning), red (critical)

**From Recent Git History (Epic 3 PRD Stories):**
- Component composition approach working well (MessageBubble, ChatInterface pattern)
- Custom hooks for complex state management
- Extensive unit tests ensure quality
- Real-time updates enhance UX
- Status indicators improve user understanding
- Service layer abstraction keeps code clean

### Project Structure Notes

**Files to Modify:**
```
src/features/admin/
├── services/
│   └── analyticsService.ts (UPDATE: add completionRates calculation)
├── components/analytics/
│   └── AnalyticsDashboard.tsx (UPDATE: integrate completion rates card)
└── types.ts (UPDATE: add CompletionRates types)
```

**New Files to Create:**
```
src/features/admin/components/analytics/
├── CompletionRatesCard.tsx
├── CompletionRatesCard.test.tsx
├── ConversionRateMetric.tsx
├── ConversionRateMetric.test.tsx
├── ConversionRateDetailModal.tsx
├── ConversionRateDetailModal.test.tsx
├── CompletionRatesTrendChart.tsx
├── CompletionRatesTrendChart.test.tsx
├── CompletionRatesFunnel.tsx
├── CompletionRatesFunnel.test.tsx
├── ExportCompletionRates.tsx
└── ExportCompletionRates.test.tsx

src/lib/
└── constants.ts (UPDATE: add COMPLETION_RATE_BENCHMARKS)
```

**No Database Migrations Required:**
- All necessary indexes already exist from previous stories
- No new tables or columns needed
- Uses existing `ideas` table with status and created_at columns

### Developer Context

**🎯 Story Goal:**
This story implements completion rate metrics for the Analytics Dashboard. It provides admins with critical conversion data showing how effectively ideas progress through each stage of the innovation pipeline. This is arguably the most important metric for measuring program success.

**Key Deliverables:**
1. **Conversion Rate Metrics** - Four key rates: Submitted→Approved, Approved→PRD, PRD→Prototype, Overall End-to-End
2. **Health Indicators** - Color-coded visual indicators showing rate performance (green/yellow/red)
3. **Trend Analysis** - Show how rates are changing over time (↑ ↓ →)
4. **Drill-Down Capability** - Click rate to see detailed list of ideas in that conversion
5. **Funnel Visualization** - Alternative view showing idea progression visually

**⚠️ Critical Requirements:**
- **Performance**: Single optimized query using COUNT FILTER must execute in <100ms
- **Accuracy**: Division by zero handling is critical - show "N/A" not errors
- **Visual Clarity**: Color coding must make low-performing conversions immediately obvious
- **Actionability**: Admin should instantly see where to focus improvement efforts

**🔗 Dependencies:**
- Story 6.1 (Analytics Dashboard Layout) - COMPLETED ✅
- Story 6.2 (Total Ideas Submitted Metric) - COMPLETED ✅  
- Story 6.3 (Pipeline Stage Breakdown Chart) - COMPLETED ✅
- ideas table with status column - EXISTS ✅
- Date range filtering infrastructure - IMPLEMENTED ✅
- AnalyticsDashboard component - IMPLEMENTED ✅
- Recharts library - INSTALLED ✅

**📊 Data Sources & Calculation Logic:**
- Primary table: `ideas` (columns: id, status, created_at)
- **Single Optimized Query**:
  ```sql
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected')) as submitted_count,
    COUNT(*) FILTER (WHERE status IN ('approved', 'prd_development', 'prototype_complete')) as approved_count,
    COUNT(*) FILTER (WHERE status IN ('prd_development', 'prototype_complete')) as prd_complete_count,
    COUNT(*) FILTER (WHERE status = 'prototype_complete') as prototype_count
  FROM ideas
  WHERE created_at >= ? AND created_at < ?
  ```
- **Rate Calculations**:
  - Submitted → Approved: `(approved_count / submitted_count) * 100`
  - Approved → PRD Complete: `(prd_complete_count / approved_count) * 100`
  - PRD Complete → Prototype: `(prototype_count / prd_complete_count) * 100`
  - Overall: `(prototype_count / submitted_count) * 100`
- **Trend Calculation**: Compare current period rates vs previous period (same duration)
- **Drill-down queries**: Filter ideas by relevant status combinations and date range

**🎨 UI/UX Considerations:**
- **Rate Display**: Large prominent percentages (text-3xl or text-4xl)
- **Health Color Coding**:
  - Green (#10B981): >70% - Healthy conversion
  - Yellow (#F59E0B): 40-70% - Needs attention
  - Red (#EF4444): <40% - Critical bottleneck
  - Gray (#94A3B8): N/A - Insufficient data
- **Trend Indicators**:
  - ↑ Green: Improvement (positive change)
  - ↓ Red: Decline (negative change)
  - → Gray: No significant change (±2%)
- **Layout**: 2x2 grid on desktop, single column on mobile
- **Benchmark Comparison**: Show "Above/Below industry standard" indicator
- **Count Ratios**: Show "15 of 20 ideas" below each rate for context

**🧪 Testing Strategy:**
- Unit tests: analyticsService completion rate calculation
- Unit tests: Division by zero handling (critical edge case)
- Unit tests: Trend calculation (positive, negative, neutral)
- Unit tests: CompletionRatesCard rendering with various data states
- Unit tests: ConversionRateMetric color coding for different rate ranges
- Unit tests: Drill-down modal with correct status filters
- Integration tests: AnalyticsDashboard with completion rates
- Edge case tests: 0 ideas, all ideas in one stage, date range with no data
- Performance tests: Query execution time <100ms
- Accessibility tests: Screen reader, keyboard navigation

**🚀 Implementation Order:**
1. Update AnalyticsData types (CompletionRates, ConversionRate, TrendData)
2. Implement completion rates calculation in analyticsService (single optimized query)
3. Create benchmark constants (define thresholds: 70%, 40%)
4. Build ConversionRateMetric component (display rate with health color coding)
5. Build CompletionRatesCard component (2x2 grid of metrics)
6. Add trend calculation (compare current vs previous period)
7. Implement drill-down modal (ConversionRateDetailModal)
8. Create alternative funnel visualization
9. Build trend line chart (CompletionRatesTrendChart)
10. Add export functionality
11. Integrate into AnalyticsDashboard
12. Add comprehensive tests
13. Verify accessibility compliance

**💡 Edge Cases to Handle:**
- **Zero ideas in database**: Show "N/A" for all rates with helpful message
- **Zero denominator**: Check before division, show "N/A" not error
- **All ideas in submitted status**: Approved→PRD rate will be N/A (0 approved)
- **All ideas completed**: 100% rates across all conversions
- **Single idea**: Rates are either 0% or 100%
- **Date range with no ideas**: All rates show "N/A"
- **Previous period has no data**: Trend shows "New" or "N/A"
- **Rejected ideas**: Count in submitted total but not in conversion funnel
- **Database connection errors**: Show error message with retry
- **Very small percentages**: Format as "<1%" not "0.5%"

**🔍 Verification Checklist:**
- [ ] Completion rate calculations match database query results
- [ ] Division by zero handled gracefully (returns N/A)
- [ ] Color coding applied correctly based on rate thresholds
- [ ] Trend indicators show correct direction (up/down/neutral)
- [ ] Trend change percentages calculated accurately
- [ ] Click drill-down opens modal with correct idea filters
- [ ] Health indicators highlight low-performing conversions
- [ ] Card responsive at all breakpoints (mobile/tablet/desktop)
- [ ] Loading states appear during data fetch
- [ ] Error states handle failures gracefully
- [ ] Performance: query executes in <100ms
- [ ] Security: admin-only access enforced
- [ ] Tests: >90% coverage achieved
- [ ] Accessibility: WCAG 2.1 AA compliance verified
- [ ] Benchmark comparison displays correctly

### Library and Framework Requirements

**Core Dependencies (Already Installed):**
- React 19.x - Component framework
- TypeScript 5.x - Type safety
- React Query (@tanstack/react-query) - Server state management
- Zod - Data validation
- DaisyUI 5.x - UI components (stat, card, badge)
- Tailwind CSS 4.x - Styling
- Heroicons - Icons (arrow-up, arrow-down, arrow-right)

**Charting Library (Already Installed from Story 6.3):**
- Recharts - For trend line chart visualization
- No additional installation needed

**Supabase Integration:**
- @supabase/supabase-js - Database client
- PostgreSQL COUNT FILTER for efficient aggregation
- Supabase RLS policies for admin access

**Testing Dependencies (Already Installed):**
- Vitest - Test runner
- @testing-library/react - Component testing
- @testing-library/user-event - User interaction testing

**No New Dependencies Required** - All necessary libraries already in project

### File Structure Requirements

**Follow Architecture Patterns:**
- Feature-based organization: `features/admin/components/analytics/`
- Co-located tests: `CompletionRatesCard.test.tsx` next to component
- Service layer updates: `features/admin/services/analyticsService.ts`
- Hook updates: `features/admin/hooks/useAnalytics.ts` (if needed)
- Type updates: `features/admin/types.ts`
- Constants: `lib/constants.ts` for benchmark values

**Naming Conventions:**
- Components: PascalCase (`CompletionRatesCard`, `ConversionRateMetric`)
- Functions: camelCase (`calculateCompletionRates`, `getConversionTrend`)
- Types: PascalCase (`CompletionRates`, `ConversionRate`, `TrendData`)
- Database columns: snake_case (`status`, `created_at`)
- Constants: SCREAMING_SNAKE_CASE (`COMPLETION_RATE_BENCHMARKS`)

### Security Considerations

**Admin-Only Access:**
- RLS policies on ideas table enforce admin SELECT permission
- analyticsService queries run in user context (RLS enforced automatically)
- Frontend route protection via AdminRoute component
- Double verification: route guard + database RLS

**SQL Injection Prevention:**
- Use parameterized queries via Supabase client
- Never concatenate user input into SQL strings
- Validate date range inputs
- Supabase client handles SQL escaping automatically

**Data Privacy:**
- Aggregate counts and percentages only in main card (no individual details)
- Drill-down shows idea titles but respects RLS (admin sees all)
- No PII exposed in rate visualizations

**Error Handling:**
- Don't expose database errors to UI (show generic message)
- Log detailed errors server-side for admin debugging
- Rate limit drill-down queries to prevent abuse (future enhancement)

### Performance Optimization

**Database Query Optimization:**
- **Single Query Strategy**: Use COUNT FILTER to get all counts in one query (not 4 separate queries)
- **Existing Index**: Use `idx_ideas_status_created_at` composite index from Story 6.3
- **Query plan**: Verify with EXPLAIN ANALYZE in Supabase SQL editor
- **Expected performance**: <100ms for COUNT FILTER aggregation with index

**Example Optimized Query:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE status IN ('submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected')) as submitted_count,
  COUNT(*) FILTER (WHERE status IN ('approved', 'prd_development', 'prototype_complete')) as approved_count,
  COUNT(*) FILTER (WHERE status IN ('prd_development', 'prototype_complete')) as prd_complete_count,
  COUNT(*) FILTER (WHERE status = 'prototype_complete') as prototype_count
FROM ideas
WHERE created_at >= $1 AND created_at < $2
```

**React Query Caching:**
- staleTime: 60 seconds (analytics don't change frequently)
- cacheTime: 5 minutes (keep in memory)
- Query key includes dateRange for proper cache invalidation: `['admin', 'analytics', dateRange]`
- Background refetch on window focus

**Component Rendering Performance:**
- Use React.memo for ConversionRateMetric if re-rendering is expensive
- Memoize rate calculations in analyticsService
- Lazy load drill-down modal (only render when opened)
- Avoid unnecessary recalculations by checking dependencies

**Bundle Size Optimization:**
- No new dependencies added (uses existing Recharts)
- Tree-shaking removes unused components
- Component code splitting via React.lazy if needed

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

-- Existing index from Story 6.3 (sufficient for completion rates)
CREATE INDEX idx_ideas_status_created_at ON ideas(status, created_at);

-- RLS policy for admin access
CREATE POLICY "Admins can view all ideas"
  ON ideas FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
```

**Status Flow Understanding:**
- `submitted` → First stage, idea just submitted
- `approved` → Admin approved, can start PRD
- `prd_development` → User building/completed PRD
- `prototype_complete` → Prototype generated successfully
- `rejected` → Admin rejected, removed from pipeline

**Conversion Logic:**
- **Submitted → Approved**: Ideas that moved from submitted to approved (or beyond)
  - Numerator: Count of ideas in ['approved', 'prd_development', 'prototype_complete']
  - Denominator: Count of all ideas (excluding nothing - all statuses)
- **Approved → PRD Complete**: Ideas that progressed from approved to PRD phase
  - Numerator: Count of ideas in ['prd_development', 'prototype_complete']
  - Denominator: Count of ideas in ['approved', 'prd_development', 'prototype_complete']
- **PRD Complete → Prototype**: Ideas that completed prototype generation
  - Numerator: Count of ideas in ['prototype_complete']
  - Denominator: Count of ideas in ['prd_development', 'prototype_complete']
- **Overall (Submitted → Prototype)**: Ideas that completed entire journey
  - Numerator: Count of ideas in ['prototype_complete']
  - Denominator: Count of all ideas (all statuses)

### Accessibility Considerations

**WCAG 2.1 AA Compliance:**
- **Color Contrast**: Verify all health indicators (green/yellow/red) meet 4.5:1 ratio
- **Alternative Text**: Provide text description of rates (not just visual)
- **Keyboard Navigation**: Tab through metrics, Enter to open drill-down
- **Screen Readers**: ARIA labels for each rate metric
- **Focus Indicators**: Visible focus state on interactive metrics
- **Semantic HTML**: Use appropriate landmarks and headings

**Specific Implementations:**
- Each metric: `role="button" aria-label="Submitted to Approved conversion rate: 75%, trending up 5%"`
- Trend indicators: `aria-label="Trending up by 5%"` not just icon
- Health status: Use text + color, not color alone ("Healthy 75%")
- Keyboard: Tab through metrics, Enter to drill down, Escape to close modal
- Tooltips: Announce content to screen readers on focus
- Low vision: Ensure font sizes are readable (rates at least 2xl)

**Testing Accessibility:**
- Use axe DevTools to verify no violations
- Test keyboard navigation (Tab, Enter, Escape)
- Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- Verify color contrast with WebAIM Contrast Checker
- Test with zoom (200%, 400% zoom levels)

### Browser Compatibility

**Supported Browsers (per Architecture):**
- Chrome (latest 2 versions) ✅
- Firefox (latest 2 versions) ✅
- Safari (latest 2 versions) ✅
- Edge (latest 2 versions) ✅

**Feature Support:**
- CSS Grid for layout (excellent browser support)
- CSS custom properties for theming (widely supported)
- Flexbox for metric layout (modern browsers)
- Touch events for mobile interactions (iOS Safari, Android Chrome)

**Responsive Breakpoints:**
- Mobile: 375px - 767px (1 column, vertical stacking)
- Tablet: 768px - 1023px (2 columns, compact spacing)
- Desktop: 1024px+ (2x2 grid, comfortable spacing)

### Benchmark Values Specification

**Industry Standard Benchmarks (Configurable Constants):**
```typescript
// src/lib/constants.ts
export const COMPLETION_RATE_BENCHMARKS = {
  submittedToApproved: {
    excellent: 70,  // >70% is excellent
    good: 50,       // 50-70% is good
    warning: 30,    // 30-50% needs attention
    critical: 30,   // <30% is critical
  },
  approvedToPrd: {
    excellent: 80,  // >80% is excellent
    good: 60,       // 60-80% is good
    warning: 40,    // 40-60% needs attention
    critical: 40,   // <40% is critical
  },
  prdToPrototype: {
    excellent: 75,  // >75% is excellent
    good: 50,       // 50-75% is good
    warning: 30,    // 30-50% needs attention
    critical: 30,   // <30% is critical
  },
  overall: {
    excellent: 50,  // >50% is excellent
    good: 30,       // 30-50% is good
    warning: 15,    // 15-30% needs attention
    critical: 15,   // <15% is critical
  },
};

export const RATE_HEALTH_THRESHOLDS = {
  excellent: 70,  // Green indicator
  good: 40,       // Yellow indicator
  critical: 40,   // Red indicator (below this)
};
```

**Rationale for Benchmarks:**
- **Submitted → Approved (50%)**: Idea quality filter, expect ~50% approval rate
- **Approved → PRD (60%)**: Effort required, some drop-off expected
- **PRD → Prototype (50%)**: Technical complexity, ~50% completion realistic
- **Overall (30%)**: Full funnel, 30% end-to-end completion is healthy

**Visual Indicator Mapping:**
- **Green (Excellent)**: Rate > excellent threshold, everything working well
- **Yellow (Good/Warning)**: Rate between warning and excellent, acceptable but could improve
- **Red (Critical)**: Rate < critical threshold, urgent attention needed
- **Gray (N/A)**: Insufficient data to calculate rate

### Trend Calculation Specification

**Trend Period Comparison:**
```typescript
// Example: Current period: Last 30 days
// Previous period: 30 days before that (days -60 to -30)

const currentStartDate = new Date();
currentStartDate.setDate(currentStartDate.getDate() - 30);
const currentEndDate = new Date();

const previousStartDate = new Date();
previousStartDate.setDate(previousStartDate.getDate() - 60);
const previousEndDate = new Date();
previousEndDate.setDate(previousEndDate.getDate() - 30);
```

**Trend Direction Logic:**
```typescript
function determineTrendDirection(currentRate: number, previousRate: number): 'up' | 'down' | 'neutral' {
  const change = currentRate - previousRate;
  if (change > 2) return 'up';      // Significant improvement
  if (change < -2) return 'down';    // Significant decline
  return 'neutral';                  // No significant change
}

function calculateTrendChange(currentRate: number, previousRate: number): { change: number, changePercentage: number } {
  const change = currentRate - previousRate;
  const changePercentage = previousRate > 0 ? (change / previousRate) * 100 : 0;
  return { change, changePercentage };
}
```

**Trend Display Format:**
- Up: "↑ +5.2% vs last period"
- Down: "↓ -3.1% vs last period"
- Neutral: "→ No significant change"
- N/A: "New" (insufficient previous data)

### Export Functionality Specification

**CSV Export Format:**
```csv
Conversion Stage,Rate (%),Ideas Converted,Total Ideas,Trend Direction,Trend Change (%)
Submitted → Approved,75.0,15,20,Up,+5.2
Approved → PRD Complete,66.7,10,15,Down,-2.3
PRD Complete → Prototype,50.0,5,10,Neutral,+0.5
Overall (Submitted → Prototype),25.0,5,20,Up,+3.1
```

**CSV Filename Convention:**
```typescript
const filename = `completion-rates-${dateRange.start}-to-${dateRange.end}.csv`;
// Example: completion-rates-2026-01-01-to-2026-01-31.csv
```

**Export Implementation:**
```typescript
function exportCompletionRatesToCSV(completionRates: CompletionRates, dateRange: DateRange) {
  const csvContent = generateCSV(completionRates);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `completion-rates-${dateRange.start}-to-${dateRange.end}.csv`;
  link.click();
}
```

### Drill-Down Modal Specification

**Modal Content for Each Conversion:**

**Submitted → Approved Drill-Down:**
- Show all submitted ideas and their outcomes:
  - Approved (status: approved, prd_development, prototype_complete)
  - Rejected (status: rejected)
  - Pending (status: submitted)
- Display: Title, Submitted Date, Current Status, Days in Status

**Approved → PRD Complete Drill-Down:**
- Show approved ideas and PRD progress:
  - Completed PRD (status: prd_development, prototype_complete)
  - Not Yet Started (status: approved)
- Display: Title, Approved Date, PRD Status, Days Since Approval

**PRD Complete → Prototype Drill-Down:**
- Show PRD complete ideas and prototype status:
  - Prototype Generated (status: prototype_complete)
  - PRD Complete, No Prototype Yet (status: prd_development)
- Display: Title, PRD Completed Date, Prototype Status, Days Since PRD Complete

**Overall Drill-Down:**
- Show all ideas with end-to-end status:
  - Completed Full Journey (status: prototype_complete)
  - In Progress (status: approved, prd_development)
  - Not Yet Approved (status: submitted)
  - Rejected (status: rejected)
- Display: Title, Submitted Date, Current Stage, Total Days in Pipeline

### Funnel Visualization Specification

**Funnel Stages (Top to Bottom):**
1. **Submitted** - All ideas (100% width)
2. **Approved** - Ideas that passed review (width proportional to count)
3. **PRD Complete** - Ideas with completed PRDs (narrower)
4. **Prototype** - Ideas with generated prototypes (narrowest)

**Funnel Segment Display:**
- Label: Stage name
- Count: Number of ideas in stage
- Percentage: Conversion rate from previous stage
- Color: PassportCard theme colors
- Drop-off: Visual gap between stages showing loss

**Funnel Interactions:**
- Hover: Show tooltip with exact count and percentage
- Click: Open drill-down modal for that conversion
- Touch-friendly: Large tap targets for mobile

**Example Funnel Data:**
```
Submitted:      20 ideas (100%)
   ↓ 75% conversion
Approved:       15 ideas (75% of submitted)
   ↓ 67% conversion
PRD Complete:   10 ideas (67% of approved, 50% of submitted)
   ↓ 50% conversion
Prototype:       5 ideas (50% of PRD, 25% of submitted)
```

### References

**Source Documents:**
- [PRD: FR43 - Completion Rates Metrics](file:///_bmad-output/planning-artifacts/prd.md#analytics--reporting)
- [Epic 6: Analytics & Innovation Metrics](file:///_bmad-output/planning-artifacts/epics.md#epic-6-analytics--innovation-metrics)
- [Story 6.4: Completion Rates Metrics](file:///_bmad-output/planning-artifacts/epics.md#story-64-completion-rates-metrics)
- [Architecture: Admin Feature Structure](file:///_bmad-output/planning-artifacts/architecture.md#project-structure--boundaries)
- [Architecture: State Management Patterns](file:///_bmad-output/planning-artifacts/architecture.md#state-management-patterns)
- [Architecture: Database Schema](file:///_bmad-output/planning-artifacts/architecture.md#data-architecture)

**Related Stories:**
- [Story 6.1: Analytics Dashboard Layout](_bmad-output/implementation-artifacts/6-1-analytics-dashboard-layout.md)
- [Story 6.2: Total Ideas Submitted Metric](_bmad-output/implementation-artifacts/6-2-total-ideas-submitted-metric.md)
- [Story 6.3: Pipeline Stage Breakdown Chart](_bmad-output/implementation-artifacts/6-3-pipeline-stage-breakdown-chart.md)

**Technical Documentation:**
- [PostgreSQL COUNT FILTER](https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES)
- [Recharts Official Documentation](https://recharts.org/en-US/)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
