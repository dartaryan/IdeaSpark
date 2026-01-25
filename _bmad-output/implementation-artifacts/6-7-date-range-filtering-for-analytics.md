# Story 6.7: Date Range Filtering for Analytics

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin**,
I want **to filter analytics by date range**,
So that **I can analyze specific time periods**.

## Acceptance Criteria

**Given** I am on the Analytics Dashboard
**When** I see the date filter
**Then** I can select preset ranges: Last 7 days, Last 30 days, Last 90 days, All time
**And** I can select a custom date range
**And** all metrics update to reflect the selected period
**And** charts and numbers recalculate accordingly

**Given** I select "Last 30 days"
**When** the filter is applied
**Then** all metrics show data only from the last 30 days
**And** the selected filter is clearly indicated

## Tasks / Subtasks

- [ ] Task 1: Create DateRange type and utility functions (AC: Type safety)
  - [ ] Subtask 1.1: Define DateRange interface in features/admin/types.ts: { start: Date, end: Date, label: string }
  - [ ] Subtask 1.2: Define DateRangePreset type: 'last7days' | 'last30days' | 'last90days' | 'alltime' | 'custom'
  - [ ] Subtask 1.3: Create getPresetDateRange() utility in lib/utils.ts
  - [ ] Subtask 1.4: Implement getPresetDateRange() logic for each preset
  - [ ] Subtask 1.5: Handle "All time" range (null start date, current end date)
  - [ ] Subtask 1.6: Create formatDateRange() for display: "Jan 1 - Jan 31, 2026"
  - [ ] Subtask 1.7: Create isValidDateRange() validator (start < end, start not in future)
  - [ ] Subtask 1.8: Export all date range utilities

- [ ] Task 2: Create DateRangeFilter component with preset buttons (AC: Preset ranges)
  - [ ] Subtask 2.1: Create DateRangeFilter.tsx in features/admin/components/analytics/
  - [ ] Subtask 2.2: Accept onDateRangeChange callback via props: (range: DateRange) => void
  - [ ] Subtask 2.3: Accept currentRange via props to show active selection
  - [ ] Subtask 2.4: Render button group with 4 presets: Last 7 days, Last 30 days, Last 90 days, All time
  - [ ] Subtask 2.5: Add "Custom" button that opens date picker modal
  - [ ] Subtask 2.6: Style active button with primary color (#E10514)
  - [ ] Subtask 2.7: Use DaisyUI btn-group component for button grouping
  - [ ] Subtask 2.8: Make button group responsive (stack vertically on mobile <768px)
  - [ ] Subtask 2.9: Add keyboard navigation (Tab through buttons, Enter to select)
  - [ ] Subtask 2.10: Display selected range label below buttons: "Showing: Jan 1 - Jan 31, 2026"

- [ ] Task 3: Create CustomDateRangeModal component (AC: Custom date range)
  - [ ] Subtask 3.1: Create CustomDateRangeModal.tsx in features/admin/components/analytics/
  - [ ] Subtask 3.2: Accept isOpen, onClose, onApply props
  - [ ] Subtask 3.3: Render DaisyUI modal with date input fields
  - [ ] Subtask 3.4: Add "Start Date" input (type="date")
  - [ ] Subtask 3.5: Add "End Date" input (type="date")
  - [ ] Subtask 3.6: Set max date to today (prevent future dates)
  - [ ] Subtask 3.7: Validate start < end (show error if invalid)
  - [ ] Subtask 3.8: Add "Apply" button (disabled if invalid)
  - [ ] Subtask 3.9: Add "Cancel" button to close modal
  - [ ] Subtask 3.10: Call onApply(dateRange) when valid range selected
  - [ ] Subtask 3.11: Close modal on backdrop click
  - [ ] Subtask 3.12: Handle Escape key to close modal

- [ ] Task 4: Create useDateRange hook for state management (AC: State management)
  - [ ] Subtask 4.1: Create useDateRange.ts in features/admin/hooks/
  - [ ] Subtask 4.2: Accept defaultPreset parameter (defaults to 'last30days')
  - [ ] Subtask 4.3: Use useState for currentRange: DateRange
  - [ ] Subtask 4.4: Use useState for selectedPreset: DateRangePreset
  - [ ] Subtask 4.5: Initialize with getPresetDateRange(defaultPreset)
  - [ ] Subtask 4.6: Create setPreset(preset) function that updates both states
  - [ ] Subtask 4.7: Create setCustomRange(range) function for custom dates
  - [ ] Subtask 4.8: Persist selected preset to localStorage: 'analytics-date-range-preset'
  - [ ] Subtask 4.9: Load persisted preset on mount
  - [ ] Subtask 4.10: Return { currentRange, selectedPreset, setPreset, setCustomRange }

- [ ] Task 5: Update analyticsService to accept date range parameters (AC: Backend integration)
  - [ ] Subtask 5.1: Update getAnalytics() signature: getAnalytics(dateRange: DateRange)
  - [ ] Subtask 5.2: Convert Date objects to ISO strings for Supabase query
  - [ ] Subtask 5.3: Add WHERE clause to all queries: created_at >= dateRange.start AND created_at < dateRange.end
  - [ ] Subtask 5.4: Handle "All time" case (null start date): only filter by end date
  - [ ] Subtask 5.5: Update total ideas query with date filter
  - [ ] Subtask 5.6: Update pipeline breakdown query with date filter
  - [ ] Subtask 5.7: Update completion rates queries with date filter
  - [ ] Subtask 5.8: Update time metrics queries with date filter
  - [ ] Subtask 5.9: Update user activity queries with date filter
  - [ ] Subtask 5.10: Add date range to trend calculation (current vs previous period)

- [ ] Task 6: Update useAnalytics hook to use date range (AC: Hook integration)
  - [ ] Subtask 6.1: Update useAnalytics.ts to accept dateRange parameter
  - [ ] Subtask 6.2: Update React Query key: ['admin', 'analytics', dateRange.start.toISOString(), dateRange.end.toISOString()]
  - [ ] Subtask 6.3: Pass dateRange to analyticsService.getAnalytics()
  - [ ] Subtask 6.4: Invalidate query when dateRange changes
  - [ ] Subtask 6.5: Update staleTime to 60 seconds
  - [ ] Subtask 6.6: Add enabled flag (only fetch when dateRange is valid)

- [ ] Task 7: Integrate DateRangeFilter into AnalyticsDashboard (AC: Dashboard integration)
  - [ ] Subtask 7.1: Import DateRangeFilter and useDateRange into AnalyticsDashboard.tsx
  - [ ] Subtask 7.2: Use useDateRange hook to manage date range state
  - [ ] Subtask 7.3: Position DateRangeFilter at top of dashboard (before metric cards)
  - [ ] Subtask 7.4: Pass currentRange and onDateRangeChange to DateRangeFilter
  - [ ] Subtask 7.5: Pass currentRange to useAnalytics hook
  - [ ] Subtask 7.6: Show loading state on all cards while refetching with new date range
  - [ ] Subtask 7.7: Add data refresh timestamp display: "Last updated: 2:30 PM"
  - [ ] Subtask 7.8: Ensure filter is sticky (stays visible when scrolling)

- [ ] Task 8: Add date range display to metric cards (AC: Visual clarity)
  - [ ] Subtask 8.1: Update MetricsCards to display active date range
  - [ ] Subtask 8.2: Add subtitle to each card: "For period: Jan 1 - Jan 31"
  - [ ] Subtask 8.3: Use muted text color for date range subtitle
  - [ ] Subtask 8.4: Update card headers to show filtered context
  - [ ] Subtask 8.5: Add tooltip on hover explaining date range filter

- [ ] Task 9: Update trend calculations for filtered periods (AC: Accurate trends)
  - [ ] Subtask 9.1: Calculate previous period based on current range duration
  - [ ] Subtask 9.2: For "Last 7 days", compare to previous 7 days
  - [ ] Subtask 9.3: For "Last 30 days", compare to previous 30 days
  - [ ] Subtask 9.4: For "Last 90 days", compare to previous 90 days
  - [ ] Subtask 9.5: For "All time", compare to previous year (or half of all time)
  - [ ] Subtask 9.6: For custom range, calculate previous period of same duration
  - [ ] Subtask 9.7: Update trend display to show compared period: "vs Previous 30 days"
  - [ ] Subtask 9.8: Handle case where previous period has no data

- [ ] Task 10: Create DateRangeInfo component (AC: User guidance)
  - [ ] Subtask 10.1: Create DateRangeInfo.tsx in features/admin/components/analytics/
  - [ ] Subtask 10.2: Accept dateRange via props
  - [ ] Subtask 10.3: Display formatted date range prominently
  - [ ] Subtask 10.4: Show total days in range: "30 days selected"
  - [ ] Subtask 10.5: Show data point count: "Based on 45 ideas in this period"
  - [ ] Subtask 10.6: Add info icon with tooltip explaining filtering
  - [ ] Subtask 10.7: Use DaisyUI alert component with info styling
  - [ ] Subtask 10.8: Position below DateRangeFilter, above metric cards

- [ ] Task 11: Add URL query parameter synchronization (AC: Shareable URLs)
  - [ ] Subtask 11.1: Use URLSearchParams to read dateRange from URL
  - [ ] Subtask 11.2: Parse preset query param: ?preset=last30days
  - [ ] Subtask 11.3: Parse custom range query params: ?start=2026-01-01&end=2026-01-31
  - [ ] Subtask 11.4: Update URL when date range changes (without page reload)
  - [ ] Subtask 11.5: Use history.pushState() for URL updates
  - [ ] Subtask 11.6: Validate URL params before applying
  - [ ] Subtask 11.7: Fall back to default if URL params invalid
  - [ ] Subtask 11.8: Support sharing analytics dashboard URL with specific date range

- [ ] Task 12: Implement quick range shortcuts (AC: Power user efficiency)
  - [ ] Subtask 12.1: Add keyboard shortcuts for quick range changes
  - [ ] Subtask 12.2: Ctrl+1 for Last 7 days
  - [ ] Subtask 12.3: Ctrl+2 for Last 30 days
  - [ ] Subtask 12.4: Ctrl+3 for Last 90 days
  - [ ] Subtask 12.5: Ctrl+4 for All time
  - [ ] Subtask 12.6: Ctrl+C for Custom range (opens modal)
  - [ ] Subtask 12.7: Display keyboard shortcuts in tooltip on hover
  - [ ] Subtask 12.8: Add "Keyboard Shortcuts" help modal (Ctrl+?)

- [ ] Task 13: Add date range export metadata (AC: Data context)
  - [ ] Subtask 13.1: Include date range in CSV export filename
  - [ ] Subtask 13.2: Add date range header row to CSV: "Date Range: Jan 1 - Jan 31, 2026"
  - [ ] Subtask 13.3: Add export timestamp: "Exported: Jan 25, 2026 at 2:30 PM"
  - [ ] Subtask 13.4: Include filter info in all export files
  - [ ] Subtask 13.5: Format dates consistently in exports (YYYY-MM-DD)

- [ ] Task 14: Create comprehensive unit tests for date range functionality (AC: Quality assurance)
  - [ ] Subtask 14.1: Create getPresetDateRange.test.ts
  - [ ] Subtask 14.2: Test each preset returns correct date range
  - [ ] Subtask 14.3: Test "All time" returns null start date
  - [ ] Subtask 14.4: Test formatDateRange() with various ranges
  - [ ] Subtask 14.5: Test isValidDateRange() validation logic
  - [ ] Subtask 14.6: Create DateRangeFilter.test.tsx
  - [ ] Subtask 14.7: Test preset button clicks update selection
  - [ ] Subtask 14.8: Test custom button opens modal
  - [ ] Subtask 14.9: Test keyboard navigation through buttons
  - [ ] Subtask 14.10: Create CustomDateRangeModal.test.tsx
  - [ ] Subtask 14.11: Test date input validation (start < end)
  - [ ] Subtask 14.12: Test Apply button disabled for invalid range
  - [ ] Subtask 14.13: Test modal close on Cancel or Escape
  - [ ] Subtask 14.14: Create useDateRange.test.ts
  - [ ] Subtask 14.15: Test hook initializes with default preset
  - [ ] Subtask 14.16: Test setPreset updates state correctly
  - [ ] Subtask 14.17: Test setCustomRange updates to custom mode
  - [ ] Subtask 14.18: Test localStorage persistence
  - [ ] Subtask 14.19: Update analyticsService.test.ts
  - [ ] Subtask 14.20: Test getAnalytics accepts date range parameter
  - [ ] Subtask 14.21: Test queries filter by date range correctly
  - [ ] Subtask 14.22: Test "All time" range handling
  - [ ] Subtask 14.23: Achieve >95% test coverage for date range code

- [ ] Task 15: Optimize performance for date range changes (AC: Smooth UX)
  - [ ] Subtask 15.1: Debounce custom date picker changes (300ms)
  - [ ] Subtask 15.2: Cache analytics data per date range (React Query)
  - [ ] Subtask 15.3: Prefetch adjacent date ranges (previous/next period)
  - [ ] Subtask 15.4: Show skeleton loaders during refetch
  - [ ] Subtask 15.5: Prevent multiple simultaneous queries
  - [ ] Subtask 15.6: Add loading indicator in DateRangeFilter during refetch
  - [ ] Subtask 15.7: Optimize database queries with date indexes

- [ ] Task 16: Implement responsive design for date range filter (AC: Mobile support)
  - [ ] Subtask 16.1: Stack preset buttons vertically on mobile (<768px)
  - [ ] Subtask 16.2: Use full-width buttons on mobile for easier touch
  - [ ] Subtask 16.3: Ensure date picker inputs work on mobile browsers
  - [ ] Subtask 16.4: Test custom date modal on mobile (iOS Safari, Android Chrome)
  - [ ] Subtask 16.5: Adjust font sizes for mobile readability
  - [ ] Subtask 16.6: Test touch interactions (tap buttons, open modal)
  - [ ] Subtask 16.7: Ensure sticky filter doesn't obscure content on small screens

- [ ] Task 17: Add accessibility features for date range filter (AC: WCAG 2.1 AA compliance)
  - [ ] Subtask 17.1: Add ARIA labels to preset buttons: "Filter by last 7 days"
  - [ ] Subtask 17.2: Announce date range changes to screen readers: "Analytics filtered to last 30 days"
  - [ ] Subtask 17.3: Make custom date picker keyboard accessible
  - [ ] Subtask 17.4: Add focus indicators for all interactive elements
  - [ ] Subtask 17.5: Verify color contrast meets WCAG standards
  - [ ] Subtask 17.6: Test with screen reader (NVDA or VoiceOver)
  - [ ] Subtask 17.7: Ensure modal is keyboard navigable (Tab, Shift+Tab, Escape)
  - [ ] Subtask 17.8: Add role="radiogroup" to preset buttons

- [ ] Task 18: Implement error handling and edge cases (AC: Robust error handling)
  - [ ] Subtask 18.1: Handle invalid date range input gracefully
  - [ ] Subtask 18.2: Show error message if start date > end date
  - [ ] Subtask 18.3: Show error if date range is in the future
  - [ ] Subtask 18.4: Handle case where no data exists for selected range
  - [ ] Subtask 18.5: Display "No data for this period" message
  - [ ] Subtask 18.6: Handle database query errors during filtering
  - [ ] Subtask 18.7: Provide "Reset to Default" option if filter fails
  - [ ] Subtask 18.8: Log errors to console for debugging
  - [ ] Subtask 18.9: Handle corrupted localStorage gracefully

- [ ] Task 19: Add date range to analytics dashboard header (AC: Visual prominence)
  - [ ] Subtask 19.1: Update AnalyticsDashboard header to show current range
  - [ ] Subtask 19.2: Display range in subtitle: "Showing analytics for Jan 1 - Jan 31, 2026"
  - [ ] Subtask 19.3: Update page title dynamically: "Analytics - Last 30 Days"
  - [ ] Subtask 19.4: Add refresh button to re-fetch current range data
  - [ ] Subtask 19.5: Show last updated timestamp with auto-refresh option

- [ ] Task 20: Create date range filter documentation (AC: Developer guidance)
  - [ ] Subtask 20.1: Document DateRange type interface
  - [ ] Subtask 20.2: Document getPresetDateRange() utility usage
  - [ ] Subtask 20.3: Document useDateRange hook API
  - [ ] Subtask 20.4: Add code examples for integrating date range filter
  - [ ] Subtask 20.5: Document keyboard shortcuts for power users
  - [ ] Subtask 20.6: Document URL query parameter format
  - [ ] Subtask 20.7: Add inline JSDoc comments for all utilities

## Dev Notes

### Architecture Alignment

**Feature Location:**
- DateRangeFilter: `src/features/admin/components/analytics/DateRangeFilter.tsx`
- CustomDateRangeModal: `src/features/admin/components/analytics/CustomDateRangeModal.tsx`
- DateRangeInfo: `src/features/admin/components/analytics/DateRangeInfo.tsx`
- useDateRange: `src/features/admin/hooks/useDateRange.ts`
- Date utilities: `src/lib/utils.ts` (add getPresetDateRange, formatDateRange, isValidDateRange)
- Types: `src/features/admin/types.ts` (add DateRange, DateRangePreset)
- analyticsService: `src/features/admin/services/analyticsService.ts` (UPDATE)
- useAnalytics: `src/features/admin/hooks/useAnalytics.ts` (UPDATE)

**Component Hierarchy:**
```
AnalyticsDashboard
├── DateRangeFilter (NEW)
│   └── CustomDateRangeModal (NEW)
├── DateRangeInfo (NEW)
├── MetricsCards (UPDATE: show date range)
├── Charts (UPDATE: filter by date range)
└── ... other analytics components
```

**State Management:**
- Custom hook: `useDateRange()` manages date range state
- React Query: query key includes date range for proper caching
- localStorage: persist selected preset for user convenience
- URL params: sync date range with URL for shareable links

**Database Operations:**
- No schema changes required (all tables already have created_at)
- WHERE clause added to all analytics queries: `created_at >= start AND created_at < end`
- Indexes: Verify existing indexes on ideas(created_at), ideas(status, created_at)
- Query pattern: All analytics queries accept dateRange parameter

### Technical Requirements from Architecture

**Component Patterns:**
- Feature-based folder structure: `features/admin/components/analytics/`
- Naming: PascalCase for components (`DateRangeFilter`, `CustomDateRangeModal`)
- Utilities: camelCase functions (`getPresetDateRange`, `formatDateRange`)
- Service layer: `analyticsService.getAnalytics(dateRange)` accepts date range

**Data Validation:**
- Validate date range with Zod schema: `DateRangeSchema: z.object({ start: z.date(), end: z.date() })`
- Ensure start < end
- Ensure start is not in future
- Handle null start date for "All time"
- Validate custom date picker inputs

**Error Handling:**
- Wrap in `<ErrorBoundary>` at feature level
- Show validation errors in CustomDateRangeModal
- Handle invalid URL params gracefully
- Provide user-friendly error messages
- Log errors to console

**Performance Requirements:**
- Date range change triggers React Query refetch (<500ms)
- Debounce custom date picker (300ms)
- Cache analytics data per date range
- Prefetch adjacent ranges for faster navigation
- Database queries with date filter execute in <150ms

**Testing Standards:**
- Unit tests for all date utilities (getPresetDateRange, formatDateRange, isValidDateRange)
- Unit tests for DateRangeFilter interactions
- Unit tests for CustomDateRangeModal validation
- Unit tests for useDateRange hook
- Integration tests for AnalyticsDashboard with date filtering
- Test all presets return correct ranges
- Test custom range validation
- Test localStorage persistence
- Test URL param synchronization
- Achieve >95% test coverage

### Previous Story Learnings

**From Story 6.1 (Analytics Dashboard Layout):**
- AnalyticsDashboard layout established with metric cards
- Card grid layout works well (2 columns desktop, 1 column mobile)
- React Query integration smooth
- Loading skeletons prevent layout shift
- DaisyUI components used consistently

**From Story 6.2 (Total Ideas Submitted Metric):**
- analyticsService pattern established
- Date range filtering infrastructure NEEDED (this story provides it!)
- Trend calculation pattern established
- Drill-down modal pattern created
- useAnalytics hook already supports date range parameter (waiting for this story)

**From Story 6.3 (Pipeline Stage Breakdown Chart):**
- Charting library (Recharts) selected and integrated
- Chart integration pattern established
- Drill-down modal pattern refined
- Accessibility features implemented

**From Story 6.4 (Completion Rates Metrics):**
- Single optimized query pattern using COUNT FILTER
- Health indicator pattern: color-coded visual feedback
- Benchmark comparison feature pattern
- Export to CSV functionality

**From Story 6.5 (Time-to-Decision Metrics):**
- Time calculation pattern using PostgreSQL EXTRACT
- Benchmark comparison with color coding (green/yellow/red)
- Trend indicator pattern (↑ ↓ →)
- Drill-down modal with detailed breakdown

**From Story 6.6 (User Activity Overview):**
- User activity metrics calculated from ideas table
- Leaderboard pattern with top contributors
- Engagement rate visualization
- Inactive user identification

**Key Patterns to Follow:**
- Service response pattern: `ServiceResponse<AnalyticsData>` with `{ data, error }`
- React Query hook: `const { data, isLoading, error } = useAnalytics(dateRange);`
- DaisyUI components: btn-group, modal, alert, badge
- PassportCard styling: #E10514 primary red, 20px border radius
- Loading skeletons for all async operations
- Error boundaries for graceful failure handling
- Comprehensive unit tests (>95% coverage)

### Project Structure Notes

**Files to Modify:**
```
src/features/admin/
├── services/
│   └── analyticsService.ts (UPDATE: accept dateRange parameter in getAnalytics)
├── hooks/
│   └── useAnalytics.ts (UPDATE: include dateRange in query key)
├── components/analytics/
│   ├── AnalyticsDashboard.tsx (UPDATE: integrate DateRangeFilter)
│   ├── MetricsCards.tsx (UPDATE: display date range context)
│   └── ... (UPDATE: all cards to show filtered data context)
└── types.ts (UPDATE: add DateRange, DateRangePreset types)

src/lib/
└── utils.ts (UPDATE: add date range utilities)
```

**New Files to Create:**
```
src/features/admin/components/analytics/
├── DateRangeFilter.tsx
├── DateRangeFilter.test.tsx
├── CustomDateRangeModal.tsx
├── CustomDateRangeModal.test.tsx
├── DateRangeInfo.tsx
└── DateRangeInfo.test.tsx

src/features/admin/hooks/
├── useDateRange.ts
└── useDateRange.test.ts

src/lib/
├── dateUtils.test.ts (test date range utilities in utils.ts)
```

**Database Schema:**
No migrations required. All tables already have `created_at` column with indexes.

**Existing Indexes (verify):**
```sql
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_status_created_at ON ideas(status, created_at);
CREATE INDEX IF NOT EXISTS idx_prd_documents_created_at ON prd_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_prototypes_created_at ON prototypes(created_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
```

### Developer Context

**🎯 Story Goal:**
This story implements the date range filtering infrastructure for the Analytics Dashboard. It enables admins to filter all analytics metrics by specific time periods (presets or custom ranges), providing flexibility to analyze trends over different timescales. This is the foundational feature that all previous analytics stories (6.1-6.6) depend on for filtering capabilities.

**Key Deliverables:**
1. **Preset Date Ranges** - Quick filters: Last 7 days, Last 30 days, Last 90 days, All time
2. **Custom Date Range** - User-defined start and end dates for specific analysis
3. **Date Range Utilities** - Reusable functions for date calculations and formatting
4. **useDateRange Hook** - State management for date range selection
5. **UI Components** - DateRangeFilter, CustomDateRangeModal, DateRangeInfo
6. **Service Layer Updates** - All analytics queries accept date range parameter
7. **React Query Integration** - Query key includes date range for proper caching
8. **URL Synchronization** - Shareable URLs with date range parameters
9. **localStorage Persistence** - Remember user's last selected preset

**⚠️ Critical Requirements:**
- **Backwards Compatibility**: All analytics components must work with date filtering
- **Performance**: Date range change should refetch all metrics smoothly (<500ms)
- **Validation**: Prevent invalid date ranges (start > end, future dates)
- **Accessibility**: Keyboard navigation, screen reader support (WCAG 2.1 AA)
- **Shareable**: URL params allow sharing specific date range views
- **Persistence**: localStorage remembers user's preferred date range

**🔗 Dependencies:**
- Story 6.1 (Analytics Dashboard Layout) - COMPLETED ✅
- Story 6.2 (Total Ideas Submitted Metric) - COMPLETED ✅
- Story 6.3 (Pipeline Stage Breakdown Chart) - COMPLETED ✅
- Story 6.4 (Completion Rates Metrics) - COMPLETED ✅
- Story 6.5 (Time-to-Decision Metrics) - COMPLETED ✅
- Story 6.6 (User Activity Overview) - COMPLETED ✅
- All tables have created_at column with indexes - EXISTS ✅
- useAnalytics hook infrastructure - IMPLEMENTED ✅
- AnalyticsDashboard component - IMPLEMENTED ✅

**📊 Date Range Presets & Logic:**

**Preset Definitions:**
- **Last 7 days**: Start = 7 days ago at 00:00:00, End = now
- **Last 30 days**: Start = 30 days ago at 00:00:00, End = now
- **Last 90 days**: Start = 90 days ago at 00:00:00, End = now
- **All time**: Start = null (no start limit), End = now
- **Custom**: User-defined start and end dates

**Date Range Utility Functions:**
```typescript
// src/lib/utils.ts

export function getPresetDateRange(preset: DateRangePreset): DateRange {
  const end = new Date();
  let start: Date | null;
  let label: string;

  switch (preset) {
    case 'last7days':
      start = subDays(end, 7);
      label = 'Last 7 days';
      break;
    case 'last30days':
      start = subDays(end, 30);
      label = 'Last 30 days';
      break;
    case 'last90days':
      start = subDays(end, 90);
      label = 'Last 90 days';
      break;
    case 'alltime':
      start = null; // No start limit
      label = 'All time';
      break;
    default:
      start = subDays(end, 30);
      label = 'Last 30 days';
  }

  return { start, end, label };
}

export function formatDateRange(range: DateRange): string {
  const endStr = format(range.end, 'MMM d, yyyy');
  if (!range.start) {
    return `All time - ${endStr}`;
  }
  const startStr = format(range.start, 'MMM d, yyyy');
  return `${startStr} - ${endStr}`;
}

export function isValidDateRange(range: DateRange): boolean {
  if (!range.start) return true; // "All time" is valid
  if (range.start > range.end) return false; // Start must be before end
  if (range.start > new Date()) return false; // Start cannot be in future
  if (range.end > new Date()) return false; // End cannot be in future
  return true;
}

export function getPreviousPeriod(range: DateRange): DateRange {
  // Calculate previous period of same duration for trend comparison
  const end = range.start || subYears(range.end, 1); // If "All time", go back 1 year
  const duration = differenceInDays(range.end, end);
  const start = subDays(end, duration);
  return { start, end, label: 'Previous period' };
}
```

**Type Definitions:**
```typescript
// src/features/admin/types.ts

export interface DateRange {
  start: Date | null; // null for "All time"
  end: Date;
  label: string;
}

export type DateRangePreset = 'last7days' | 'last30days' | 'last90days' | 'alltime' | 'custom';

export const DateRangeSchema = z.object({
  start: z.date().nullable(),
  end: z.date(),
  label: z.string(),
});
```

**🎨 UI/UX Considerations:**

**DateRangeFilter Component:**
- Horizontal button group for presets (desktop)
- Vertical stacked buttons (mobile <768px)
- Active button highlighted with primary color (#E10514)
- Custom button opens modal
- Current range label displayed below buttons: "Showing: Jan 1 - Jan 31, 2026"

**CustomDateRangeModal:**
- Two date inputs: Start Date, End Date
- Both inputs type="date" for native date picker
- Max date set to today (prevent future dates)
- Real-time validation with error messages
- Apply button disabled if range invalid
- Cancel button to close without applying
- Escape key closes modal

**DateRangeInfo Component:**
- Positioned below filter, above metric cards
- Shows formatted date range prominently
- Displays total days in range: "30 days selected"
- Shows data point count: "Based on 45 ideas in this period"
- Info icon with tooltip explaining filtering
- DaisyUI alert with info styling (blue background)

**Responsive Design:**
- Desktop (≥1024px): Horizontal button group, side-by-side layout
- Tablet (768px-1023px): Horizontal button group, wrapped if needed
- Mobile (<768px): Vertical stacked buttons, full-width, easy touch targets

**Accessibility:**
- ARIA labels on preset buttons: "Filter analytics by last 7 days"
- role="radiogroup" for preset buttons (single selection)
- Live region announces date range changes: "Analytics filtered to last 30 days"
- Keyboard navigation: Tab through buttons, Enter to select, Space for custom
- Focus indicators visible on all interactive elements
- Color contrast meets WCAG AA (4.5:1 ratio)

**🧪 Testing Strategy:**

**Unit Tests - Date Utilities:**
- getPresetDateRange() returns correct range for each preset
- formatDateRange() formats dates correctly
- isValidDateRange() validates all edge cases
- getPreviousPeriod() calculates previous period correctly

**Unit Tests - DateRangeFilter Component:**
- Renders all preset buttons correctly
- Clicking preset updates selection
- Active button has correct styling
- Custom button opens modal
- Keyboard navigation works (Tab, Enter)
- onDateRangeChange callback fired with correct range

**Unit Tests - CustomDateRangeModal:**
- Modal opens and closes correctly
- Date inputs render with max date set to today
- Validation prevents invalid ranges (start > end)
- Apply button disabled for invalid range
- Escape key closes modal
- onApply callback fired with valid range

**Unit Tests - useDateRange Hook:**
- Initializes with default preset (last30days)
- setPreset() updates currentRange correctly
- setCustomRange() switches to custom mode
- localStorage persistence works
- Loads persisted preset on mount

**Integration Tests - Analytics Dashboard:**
- Date range filter integrates with AnalyticsDashboard
- All metric cards update when date range changes
- Charts filter data by date range
- React Query refetches with new query key
- Loading states show during refetch
- URL params sync with date range selection

**Edge Case Tests:**
- Empty data for selected range ("No data" message)
- Invalid URL params fall back to default
- Corrupted localStorage falls back to default
- Future date inputs rejected
- Start date > end date rejected
- "All time" range handles null start correctly

**Performance Tests:**
- Date range change triggers refetch in <500ms
- React Query caches data per date range
- Database queries execute in <150ms with indexes
- Debounce prevents multiple rapid queries

**Accessibility Tests:**
- Screen reader announces date range changes
- Keyboard navigation through all interactive elements
- Color contrast meets WCAG AA
- Focus indicators visible
- Modal keyboard accessible (Tab, Escape)

**🚀 Implementation Order:**

1. **Add date range types and utilities** (utils.ts, types.ts)
   - Define DateRange, DateRangePreset types
   - Implement getPresetDateRange()
   - Implement formatDateRange()
   - Implement isValidDateRange()
   - Implement getPreviousPeriod()
   - Unit tests for all utilities

2. **Create useDateRange hook** (useDateRange.ts)
   - State management for currentRange and selectedPreset
   - setPreset() function
   - setCustomRange() function
   - localStorage persistence
   - Unit tests

3. **Build DateRangeFilter component** (DateRangeFilter.tsx)
   - Preset button group
   - Custom button
   - Active selection styling
   - Keyboard navigation
   - onDateRangeChange callback
   - Unit tests

4. **Build CustomDateRangeModal component** (CustomDateRangeModal.tsx)
   - Date input fields
   - Validation logic
   - Apply/Cancel buttons
   - Modal open/close
   - Unit tests

5. **Build DateRangeInfo component** (DateRangeInfo.tsx)
   - Format and display date range
   - Show days count
   - Data point summary
   - Unit tests

6. **Update analyticsService** (analyticsService.ts)
   - Add dateRange parameter to getAnalytics()
   - Add WHERE clause to all queries
   - Handle "All time" (null start)
   - Update trend calculations
   - Unit tests

7. **Update useAnalytics hook** (useAnalytics.ts)
   - Accept dateRange parameter
   - Update React Query key
   - Pass dateRange to analyticsService
   - Unit tests

8. **Integrate into AnalyticsDashboard** (AnalyticsDashboard.tsx)
   - Use useDateRange hook
   - Render DateRangeFilter at top
   - Render DateRangeInfo below filter
   - Pass dateRange to useAnalytics
   - Show loading states during refetch
   - Integration tests

9. **Update metric cards to show date context** (all metric card components)
   - Display date range subtitle on each card
   - Update trend labels ("vs Previous 30 days")
   - Integration tests

10. **Add URL synchronization** (AnalyticsDashboard.tsx, useDateRange.ts)
    - Read URL params on mount
    - Update URL when date range changes
    - Validate URL params
    - Tests

11. **Add keyboard shortcuts** (DateRangeFilter.tsx)
    - Ctrl+1, Ctrl+2, Ctrl+3, Ctrl+4, Ctrl+C
    - Keyboard shortcuts help modal
    - Tests

12. **Add export metadata** (all export functions)
    - Include date range in CSV filenames
    - Add date range header to exports
    - Tests

13. **Accessibility audit** (all components)
    - ARIA labels
    - Keyboard navigation
    - Screen reader testing
    - Color contrast verification

14. **Performance optimization** (all components)
    - React Query caching tuning
    - Debounce custom date picker
    - Prefetch adjacent ranges

15. **Final integration testing** (entire analytics dashboard)
    - All features work together
    - No regressions
    - Performance meets requirements

**💡 Edge Cases to Handle:**

- **No data for selected range**: Show "No data for this period" message in all cards
- **Invalid URL params**: Validate and fall back to default (last30days)
- **Corrupted localStorage**: Validate and fall back to default
- **Future dates entered**: Reject and show validation error
- **Start date > end date**: Reject and show validation error
- **All time range with no data**: Show "No data available" (unlikely but possible)
- **Custom range < 1 day**: Allow but may show empty results
- **Custom range > 5 years**: Allow but may be slow (warn user?)
- **Browser date picker unavailable**: Fallback to text input with format validation
- **Date picker locale issues**: Use ISO format internally, display in user locale
- **Timezone considerations**: Use UTC for database queries, local time for display
- **Leap year handling**: date-fns handles this automatically
- **DST transitions**: date-fns handles this automatically

**🔍 Verification Checklist:**

- [ ] All preset buttons render and work correctly
- [ ] Custom button opens date picker modal
- [ ] Date picker validation prevents invalid ranges
- [ ] Apply button disabled for invalid range
- [ ] Date range persists to localStorage
- [ ] URL params sync with date range selection
- [ ] All analytics queries filter by date range
- [ ] Metrics update correctly when date range changes
- [ ] Charts filter data by date range
- [ ] Loading states appear during refetch
- [ ] "No data" message shows for empty ranges
- [ ] Trend calculations use previous period correctly
- [ ] Keyboard shortcuts work (Ctrl+1, Ctrl+2, etc.)
- [ ] Keyboard navigation through all elements
- [ ] Screen reader announces date range changes
- [ ] Color contrast meets WCAG AA
- [ ] Modal is keyboard accessible
- [ ] Responsive design works on mobile
- [ ] Touch interactions work on mobile
- [ ] Export includes date range metadata
- [ ] Performance: refetch completes in <500ms
- [ ] Tests: >95% coverage achieved
- [ ] Accessibility: WCAG 2.1 AA compliance verified

### Library and Framework Requirements

**Core Dependencies (Already Installed):**
- React 19.x - Component framework
- TypeScript 5.x - Type safety
- React Query (@tanstack/react-query) - Server state management
- Zod - Data validation
- DaisyUI 5.x - UI components (btn-group, modal, alert, badge)
- Tailwind CSS 4.x - Styling
- date-fns - Date manipulation and formatting

**Date Handling Library (Already Installed):**
- date-fns - Used for:
  - `subDays(date, days)` - Calculate preset date ranges
  - `format(date, formatString)` - Format dates for display
  - `differenceInDays(dateLeft, dateRight)` - Calculate period duration
  - `subYears(date, years)` - Calculate "All time" fallback

**No New Dependencies Required** - All needed libraries already installed.

**Native Browser APIs:**
- `<input type="date">` - Native date picker (HTML5)
- `URLSearchParams` - URL query parameter management
- `localStorage` - Persist user's preferred date range
- `history.pushState()` - Update URL without page reload

### File Structure Requirements

**Follow Architecture Patterns:**
- Feature-based organization: `features/admin/components/analytics/`
- Co-located tests: `DateRangeFilter.test.tsx` next to component
- Utilities: `lib/utils.ts` (date range utilities)
- Types: `features/admin/types.ts` (DateRange, DateRangePreset)

**Naming Conventions:**
- Components: PascalCase (`DateRangeFilter`, `CustomDateRangeModal`)
- Functions: camelCase (`getPresetDateRange`, `formatDateRange`)
- Types: PascalCase (`DateRange`, `DateRangePreset`)
- Constants: SCREAMING_SNAKE_CASE (`DEFAULT_PRESET`)

### Security Considerations

**Input Validation:**
- Validate date range before passing to database (start < end, not in future)
- Validate URL params before applying (prevent XSS)
- Sanitize localStorage values before parsing
- Use Zod schema validation for all date range inputs

**SQL Injection Prevention:**
- Use parameterized queries via Supabase client
- Never concatenate user input into SQL strings
- Supabase client handles SQL escaping automatically
- Validate date format before passing to query

**Admin-Only Access:**
- RLS policies enforce admin SELECT permission
- analyticsService queries run in user context (RLS enforced)
- Frontend route protection via AdminRoute component
- Double verification: route guard + database RLS

**Data Privacy:**
- Date range filtering doesn't expose sensitive data
- All analytics aggregated (no individual user data)
- Export includes only aggregate metrics

**Error Handling:**
- Don't expose database errors to UI (show generic message)
- Log detailed errors server-side for debugging
- Validate all user inputs before processing

### Performance Optimization

**React Query Caching Strategy:**
- Query key includes date range: `['admin', 'analytics', dateRange.start?.toISOString(), dateRange.end.toISOString()]`
- staleTime: 60 seconds (analytics don't change frequently)
- cacheTime: 5 minutes (keep in memory)
- Background refetch on window focus
- Cache separate results per date range (allows instant switching)

**Database Query Optimization:**
- Verify indexes on all created_at columns:
  - `idx_ideas_created_at` on ideas(created_at)
  - `idx_ideas_status_created_at` on ideas(status, created_at)
  - `idx_users_created_at` on users(created_at)
- Expected query performance: <150ms with indexes
- WHERE clause: `created_at >= $1 AND created_at < $2`
- Handle "All time" efficiently: omit start filter if null

**Component Performance:**
- Debounce custom date picker changes (300ms)
- Memoize date range calculations (useMemo)
- Prevent unnecessary re-renders (React.memo for static components)
- Lazy load CustomDateRangeModal (only render when opened)

**Prefetching Strategy:**
- Prefetch adjacent date ranges for faster navigation:
  - When on "Last 30 days", prefetch "Last 7 days" and "Last 90 days"
  - When on custom range, prefetch previous/next period
- Use React Query's prefetchQuery

**Bundle Size:**
- date-fns with tree-shaking (import only needed functions)
- No new heavy dependencies
- Component code splitting via React.lazy if needed

### Database Query Patterns

**Analytics Query with Date Range:**
```sql
-- Total ideas submitted in date range
SELECT COUNT(*) as total_ideas
FROM ideas
WHERE created_at >= $1 AND created_at < $2;

-- Pipeline breakdown in date range
SELECT 
  status,
  COUNT(*) as count
FROM ideas
WHERE created_at >= $1 AND created_at < $2
GROUP BY status;

-- User activity in date range
SELECT 
  COUNT(DISTINCT user_id) as active_users
FROM ideas
WHERE created_at >= $1 AND created_at < $2;

-- Handle "All time" (null start date)
SELECT COUNT(*) as total_ideas
FROM ideas
WHERE ($1::timestamptz IS NULL OR created_at >= $1)
  AND created_at < $2;
```

**Trend Calculation with Previous Period:**
```sql
-- Current period
SELECT COUNT(*) as current_count
FROM ideas
WHERE created_at >= $1 AND created_at < $2;

-- Previous period (same duration)
SELECT COUNT(*) as previous_count
FROM ideas
WHERE created_at >= $3 AND created_at < $4;

-- $1 = current start, $2 = current end
-- $3 = previous start, $4 = previous end (calculated from current range duration)
```

### Accessibility Considerations

**WCAG 2.1 AA Compliance:**
- **Color Contrast**: Verify active button color (#E10514) meets 4.5:1 ratio
- **Alternative Text**: Text labels for all buttons and inputs
- **Keyboard Navigation**: Tab through buttons, Enter to select, Space for custom
- **Screen Readers**: Announce date range changes with live regions
- **Focus Indicators**: Visible focus state on all interactive elements
- **Semantic HTML**: Appropriate button and input elements

**Specific Implementations:**
- Preset buttons: `role="radiogroup"` with `aria-label="Date range filter"`
- Each button: `role="radio" aria-checked="true/false" aria-label="Filter by last 7 days"`
- Custom button: `aria-label="Open custom date range picker"`
- Modal: `role="dialog" aria-modal="true" aria-labelledby="custom-date-range-title"`
- Date inputs: `<label>` associated with `<input>`
- Apply button: `aria-disabled="true"` when range invalid
- Live region: `<div role="status" aria-live="polite" aria-atomic="true">Analytics filtered to last 30 days</div>`

**Keyboard Interactions:**
- Tab: Move focus through preset buttons
- Enter / Space: Select focused preset or open custom modal
- Arrow keys: Navigate between preset buttons (radiogroup behavior)
- Escape: Close custom date range modal
- Tab in modal: Move between date inputs and buttons
- Enter in modal: Apply date range if valid

**Testing Accessibility:**
- Use axe DevTools to verify no violations
- Test keyboard navigation (Tab, Enter, Space, Escape, Arrows)
- Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- Verify color contrast with WebAIM Contrast Checker
- Test with zoom (200%, 400% zoom levels)
- Test with browser zoom text only

### Browser Compatibility

**Supported Browsers (per Architecture):**
- Chrome (latest 2 versions) ✅
- Firefox (latest 2 versions) ✅
- Safari (latest 2 versions) ✅
- Edge (latest 2 versions) ✅

**Native Date Picker Support:**
- `<input type="date">` supported in all modern browsers
- Fallback: Text input with pattern validation for older browsers
- iOS Safari: Native date picker wheel
- Android Chrome: Native date picker calendar

**Feature Support:**
- CSS Grid for layout (excellent browser support)
- CSS Flexbox for button group (modern browsers)
- localStorage API (universal support)
- URLSearchParams API (modern browsers, polyfill available)
- date-fns library (universal JS support)

**Responsive Breakpoints:**
- Mobile: 375px - 767px (vertical buttons, full-width)
- Tablet: 768px - 1023px (horizontal buttons, wrapped if needed)
- Desktop: 1024px+ (horizontal buttons, comfortable spacing)

### URL Query Parameter Format

**Preset Range:**
```
/analytics?preset=last30days
/analytics?preset=last7days
/analytics?preset=last90days
/analytics?preset=alltime
```

**Custom Range:**
```
/analytics?start=2026-01-01&end=2026-01-31
```

**Parsing Logic:**
```typescript
// Read URL params on mount
const searchParams = new URLSearchParams(window.location.search);
const preset = searchParams.get('preset') as DateRangePreset | null;
const start = searchParams.get('start'); // ISO date string
const end = searchParams.get('end'); // ISO date string

if (preset && isValidPreset(preset)) {
  // Use preset
  setPreset(preset);
} else if (start && end) {
  // Use custom range
  const customRange: DateRange = {
    start: new Date(start),
    end: new Date(end),
    label: 'Custom',
  };
  if (isValidDateRange(customRange)) {
    setCustomRange(customRange);
  } else {
    // Invalid range, fall back to default
    setPreset('last30days');
  }
} else {
  // No params, use default
  setPreset('last30days');
}
```

**Update URL on Change:**
```typescript
function updateURL(range: DateRange, preset: DateRangePreset) {
  const searchParams = new URLSearchParams();
  if (preset !== 'custom') {
    searchParams.set('preset', preset);
  } else if (range.start) {
    searchParams.set('start', format(range.start, 'yyyy-MM-dd'));
    searchParams.set('end', format(range.end, 'yyyy-MM-dd'));
  }
  
  const newURL = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState({}, '', newURL);
}
```

### localStorage Persistence

**Storage Key:** `'ideaspark-analytics-date-range-preset'`

**Storage Format:**
```json
{
  "preset": "last30days",
  "lastUpdated": "2026-01-25T14:30:00.000Z"
}
```

**Persistence Logic:**
```typescript
function savePresetToStorage(preset: DateRangePreset) {
  try {
    const data = {
      preset,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('ideaspark-analytics-date-range-preset', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save date range preset to localStorage:', error);
  }
}

function loadPresetFromStorage(): DateRangePreset | null {
  try {
    const stored = localStorage.getItem('ideaspark-analytics-date-range-preset');
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    if (!data.preset || !isValidPreset(data.preset)) return null;
    
    return data.preset;
  } catch (error) {
    console.error('Failed to load date range preset from localStorage:', error);
    return null;
  }
}
```

### Keyboard Shortcuts

**Shortcut Definitions:**
- `Ctrl+1` (or `Cmd+1` on Mac): Last 7 days
- `Ctrl+2` (or `Cmd+2` on Mac): Last 30 days
- `Ctrl+3` (or `Cmd+3` on Mac): Last 90 days
- `Ctrl+4` (or `Cmd+4` on Mac): All time
- `Ctrl+C` (or `Cmd+C` on Mac): Open custom date range picker
- `Ctrl+/` (or `Cmd+/` on Mac): Show keyboard shortcuts help

**Implementation:**
```typescript
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? event.metaKey : event.ctrlKey;
    
    if (!modifier) return;
    
    switch (event.key) {
      case '1':
        event.preventDefault();
        setPreset('last7days');
        break;
      case '2':
        event.preventDefault();
        setPreset('last30days');
        break;
      case '3':
        event.preventDefault();
        setPreset('last90days');
        break;
      case '4':
        event.preventDefault();
        setPreset('alltime');
        break;
      case 'c':
      case 'C':
        event.preventDefault();
        setShowCustomModal(true);
        break;
      case '/':
        event.preventDefault();
        setShowShortcutsHelp(true);
        break;
    }
  }
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [setPreset]);
```

**Shortcuts Help Modal:**
Display keyboard shortcuts in a modal when user presses `Ctrl+/`:
```
Keyboard Shortcuts
──────────────────
Ctrl+1  Last 7 days
Ctrl+2  Last 30 days
Ctrl+3  Last 90 days
Ctrl+4  All time
Ctrl+C  Custom range
Ctrl+/  Show this help
```

### References

**Source Documents:**
- [PRD: FR45 - Analytics Date Filtering](file:///_bmad-output/planning-artifacts/prd.md#analytics--reporting)
- [Epic 6: Analytics & Innovation Metrics](file:///_bmad-output/planning-artifacts/epics.md#epic-6-analytics--innovation-metrics)
- [Story 6.7: Date Range Filtering for Analytics](file:///_bmad-output/planning-artifacts/epics.md#story-67-date-range-filtering-for-analytics)
- [Architecture: Admin Feature Structure](file:///_bmad-output/planning-artifacts/architecture.md#project-structure--boundaries)
- [Architecture: State Management Patterns](file:///_bmad-output/planning-artifacts/architecture.md#state-management-patterns)
- [Architecture: Database Schema](file:///_bmad-output/planning-artifacts/architecture.md#data-architecture)

**Related Stories (All Depend on This Story for Filtering):**
- [Story 6.1: Analytics Dashboard Layout](_bmad-output/implementation-artifacts/6-1-analytics-dashboard-layout.md) - COMPLETED ✅
- [Story 6.2: Total Ideas Submitted Metric](_bmad-output/implementation-artifacts/6-2-total-ideas-submitted-metric.md) - COMPLETED ✅
- [Story 6.3: Pipeline Stage Breakdown Chart](_bmad-output/implementation-artifacts/6-3-pipeline-stage-breakdown-chart.md) - COMPLETED ✅
- [Story 6.4: Completion Rates Metrics](_bmad-output/implementation-artifacts/6-4-completion-rates-metrics.md) - COMPLETED ✅
- [Story 6.5: Time-to-Decision Metrics](_bmad-output/implementation-artifacts/6-5-time-to-decision-metrics.md) - COMPLETED ✅
- [Story 6.6: User Activity Overview](_bmad-output/implementation-artifacts/6-6-user-activity-overview.md) - COMPLETED ✅

**Technical Documentation:**
- [date-fns subDays](https://date-fns.org/docs/subDays)
- [date-fns format](https://date-fns.org/docs/format)
- [date-fns differenceInDays](https://date-fns.org/docs/differenceInDays)
- [MDN: input type="date"](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date)
- [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [React Query: Query Keys](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [DaisyUI Button Group](https://daisyui.com/components/button-group/)
- [DaisyUI Modal](https://daisyui.com/components/modal/)
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
