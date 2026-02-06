# Placeholder & TODO Mapping Document
**Generated:** 2026-02-02  
**Purpose:** Comprehensive mapping of all PLACEHOLDER/TODO references in the codebase that reference incomplete stories

## Executive Summary

This document maps all locations in the codebase where placeholder comments, TODO markers, or "waiting for story X" references exist. Many of these references point to stories that have been completed and should be reviewed for implementation.

---

## Category 1: Story-Specific TODO Items

### 1.1 Story 1.7 - Password Reset (Referenced but not implemented)
**Status:** Story 1.7 appears incomplete

| File | Line Context | Reference |
|------|-------------|-----------|
| `_bmad-output/implementation-artifacts/1-5-user-login-flow.md` | AC mentions | "Add link to password reset page (placeholder for Story 1.7)" |
| `_bmad-output/implementation-artifacts/1-5-user-login-flow.md` | Routes | "Password Reset - Story 1.7 (Placeholder route)" |
| `_bmad-output/implementation-artifacts/1-5-user-login-flow.md` | Summary | "Added /forgot-password placeholder route for Story 1.7" |

**Action Required:** Verify if password reset functionality exists or needs implementation.

---

### 1.2 Story 1.9 - Application Shell / User Profile
**Status:** Story 1.9 appears incomplete

| File | Line Context | Reference |
|------|-------------|-----------|
| `_bmad-output/implementation-artifacts/1-6-user-logout-and-session-management.md` | Header component | "Create Header.tsx (placeholder until Story 1.9)" |
| `_bmad-output/implementation-artifacts/1-6-user-logout-and-session-management.md` | Implementation note | "Minimal placeholder until Story 1.9" |
| `src/features/auth/components/UserMenu.tsx` | Line 59 | `// TODO: Implement profile page navigation in Story 1.9` |
| `_bmad-output/implementation-artifacts/1-4-user-registration-flow.md` | Note | "Will be replaced in Story 1.9 (Application Shell)" |

**Action Required:** Review if profile page and application shell are complete.

---

### 1.3 Story 2.6 - AI Enhancement Edge Function
**Status:** Likely complete but needs verification

| File | Line Context | Reference |
|------|-------------|-----------|
| `_bmad-output/implementation-artifacts/2-5-idea-wizard-step-4-review-and-ai-enhancement.md` | Comment | "Story 2.6 will implement the actual Supabase Edge Function" |
| `_bmad-output/implementation-artifacts/2-5-idea-wizard-step-4-review-and-ai-enhancement.md` | Line 534 | `// TODO: Story 2.6 - Replace with actual Edge Function call:` |

**Action Required:** Verify Edge Function is implemented and remove TODO comments.

---

### 1.4 Story 2.7 - Submit Idea to Database
**Status:** ✅ COMPLETED AND VERIFIED (Story 0.4 - Feb 5, 2026)

| File | Line Context | Reference |
|------|-------------|-----------|
| `_bmad-output/implementation-artifacts/2-5-idea-wizard-step-4-review-and-ai-enhancement.md` | Line 579 | ~~`// TODO: Story 2.7 - Implement actual submission`~~ |
| `_bmad-output/implementation-artifacts/2-5-idea-wizard-step-4-review-and-ai-enhancement.md` | Note | ~~"Story 2.7 will implement handleSubmit to save idea to database"~~ |

**Verification Results:**
- ✅ All 107 idea submission tests verified (ideaService: 18, useSubmitIdea: 19, StepReview: 43, IdeaWizard: 27)
- ✅ Database integration verified with ideaService.test.ts
- ✅ Error handling verified (auth, network, database errors)
- ✅ End-to-end submission flow verified
- ✅ All fields save correctly to Supabase ideas table
- ✅ Console.error() wrapped with dev-only guards for production security

**Action Required:** ✅ COMPLETE - Story 0.4 code review completed Feb 5, 2026

---

### 1.5 Story 3.4 - Chat Interface
**Status:** COMPLETED - References should be removed

| File | Line Context | Reference |
|------|-------------|-----------|
| `_bmad-output/implementation-artifacts/3-2-prd-builder-page-layout.md` | AC | "placeholder chat interface ready for messaging (Story 3.4 will implement full chat)" |
| `_bmad-output/implementation-artifacts/3-2-prd-builder-page-layout.md` | Note | "ChatPanelPlaceholder will be replaced with ChatInterface" |
| `_bmad-output/implementation-artifacts/3-2-prd-builder-page-layout.md` | Summary | "ChatPanelPlaceholder designed for easy replacement in Story 3.4" |

**Action Required:** ✅ Story 3.4 is COMPLETE. Remove all ChatPanelPlaceholder references and update documentation.

---

### 1.6 Story 3.5 - Real-time PRD Section Generation
**Status:** COMPLETED - Handler exists but marked as placeholder

| File | Line Context | Reference |
|------|-------------|-----------|
| `_bmad-output/implementation-artifacts/3-4-chat-interface-with-ai-assistant.md` | Line 752 | "Added placeholder handler for onSectionUpdate (Story 3.5 will implement)" |

**Action Required:** ✅ Story 3.5 is COMPLETE. Review onSectionUpdate handler and update documentation.

---

## Category 2: Future Enhancement Placeholders

### 2.1 Analytics Dashboard - Chart Components
**Status:** Intentional placeholders for future stories

| File | Component | Description |
|------|-----------|-------------|
| `src/features/admin/components/analytics/SubmissionChart.tsx` | SubmissionChart | Placeholder with "Chart Coming Soon" message |
| `src/features/admin/components/analytics/CompletionRateChart.tsx` | CompletionRateChart | Placeholder with "Chart Coming Soon" message |

**Line References:**
- `CompletionRateChart.tsx` Line 2: `// Task 3: Create placeholder chart components`
- `CompletionRateChart.tsx` Line 3: `// Subtask 3.2: Create CompletionRateChart.tsx placeholder`
- `SubmissionChart.tsx` Line 2: `// Task 3: Create placeholder chart components`
- `SubmissionChart.tsx` Line 3: `// Subtask 3.1: Create SubmissionChart.tsx placeholder`

**Messages Displayed:**
- SubmissionChart: "This chart will display idea submission trends once implemented in a future story."
- CompletionRateChart: "This chart will show completion rate trends and breakdowns in a future story."

**Action Required:** Determine if these charts should be implemented now or remain as future features.

---

### 2.2 Analytics - Drill-Down Functionality
**Status:** Intentional placeholders for Task 10

| File | Line | Description |
|------|------|-------------|
| `src/features/admin/components/analytics/TimeToDecisionCard.tsx` | Line 70 | `// Subtask 4.5: Handle metric click for drill-down (placeholder for Task 10)` |
| `src/features/admin/components/analytics/TimeToDecisionCard.tsx` | Line 73 | `// TODO: Implement drill-down modal (Task 10)` |
| `src/features/admin/components/analytics/TimeToDecisionCard.tsx` | Line 149 | Display message: "Click any metric for detailed breakdown (coming soon)" |

**Additional References:**
- `_bmad-output/implementation-artifacts/6-5-time-to-decision-metrics.md` mentions drill-down placeholders
- `_bmad-output/implementation-artifacts/6-4-completion-rates-metrics.md` has 5 uncompleted subtasks for drill-down modals

**Action Required:** Decide if Task 10 (drill-down modals) should be implemented.

---

### 2.3 Analytics - Interactive Navigation
**Status:** Console.log placeholders for navigation

| File | Line | Description |
|------|------|-------------|
| `src/features/admin/components/analytics/RecentSubmissionsList.tsx` | Line 67 | `// Subtask 8.5: Make clickable (placeholder for navigation)` |
| `src/features/admin/components/analytics/TopContributorsLeaderboard.tsx` | Line 59 | `// Subtask 7.7: Make row clickable (placeholder for navigation)` |

**Action Required:** Implement actual navigation instead of console.log placeholders.

---

### 2.4 Analytics - User Detail Navigation
**Status:** Partially complete (console.log placeholder)

| File | Reference |
|------|-----------|
| `_bmad-output/implementation-artifacts/6-6-user-activity-overview.md` | "⏳ AC #4: Click user to see detail page - PARTIALLY (console.log placeholder, needs Task 9)" |

**Action Required:** Replace console.log with actual navigation to user detail page (requires Task 9).

---

### 2.5 Analytics - Date Range Filtering
**Status:** Hook exists, waiting for UI implementation

| File | Reference |
|------|-----------|
| `_bmad-output/implementation-artifacts/6-7-date-range-filtering-for-analytics.md` | Line 333: "useAnalytics hook already supports date range parameter (waiting for this story)" |

**Action Required:** Story 6-7 appears to be the current implementation. Verify if date range UI is complete.

---

## Category 3: Testing Artifacts (Not Code Issues)

### 3.1 Test Placeholder Text
These are legitimate test references checking for placeholder text in the UI:

| File | Context |
|------|---------|
| `src/features/admin/components/analytics/TimeToDecisionCard.test.tsx` | Tests for drill-down placeholder message |
| `src/pages/PrdBuilderPage.test.tsx` | Tests chat placeholder display |
| `src/features/prd/components/PrdSectionCard.test.tsx` | Tests section placeholders |
| Various test files | Tests checking for input placeholder attributes |

**Action Required:** None - these are valid test cases.

---

## Category 4: Design Pattern Placeholders (Intentional)

### 4.1 Avatar Placeholders
These are DaisyUI design patterns for user avatars with initials:

| Files |
|-------|
| `src/features/admin/components/AdminPrdViewer.tsx` |
| `src/features/admin/components/UserList.tsx` |
| `src/features/admin/components/AdminPrototypeViewer.tsx` |
| `src/features/admin/components/UserProfileCard.tsx` |

**Action Required:** None - these are intentional design patterns.

---

### 4.2 Form Input Placeholders
These are legitimate placeholder attributes for form inputs:

| Files |
|-------|
| `src/features/admin/components/UserList.tsx` - Search input |
| `src/features/admin/components/IdeaFilters.tsx` - Filter input |
| `src/features/admin/components/RejectIdeaModal.tsx` - Textarea |
| `src/features/prototypes/components/RefinementChat.tsx` - Chat input |
| `src/features/prd/constants/prdSections.ts` - Section guidance |

**Action Required:** None - these are standard UI patterns.

---

## Category 5: Protected Route Placeholders

### 5.1 Ideas Routes Structure
**Status:** ✅ VERIFIED COMPLETE (Story 0.9)

| File | Line | Reference |
|------|------|-----------|
| `_bmad-output/implementation-artifacts/1-8-protected-routes-and-role-based-access.md` | Line 395 | `// Ideas routes - IMPLEMENTED (Story 2.x complete, verified in Story 0.9)` |

**Action Required:** None — Routes verified and implemented. All three ideas routes (`/ideas`, `/ideas/:id`, `/ideas/new`) confirmed in `src/routes/index.tsx` (search for `ROUTES.IDEAS`, `ROUTES.IDEA_DETAIL`, `ROUTES.NEW_IDEA`), wrapped in `AuthenticatedLayout`.

---

## Summary of Actions Required

### ✅ COMPLETED STORIES - Remove References
1. **Story 3.4 (Chat Interface)** - Remove all ChatPanelPlaceholder references
2. **Story 3.5 (PRD Generation)** - Update onSectionUpdate documentation

### 🔍 NEEDS VERIFICATION - Check if Complete
1. **Story 1.7 (Password Reset)** - Verify implementation status
2. **Story 1.9 (Profile/App Shell)** - Check if implemented
3. **Story 2.6 (AI Enhancement)** - Verify Edge Function exists
4. ~~**Story 2.7 (Idea Submission)**~~ - ✅ VERIFIED COMPLETE (Story 0.4)
5. ~~**Story 2.x (Ideas Routes)**~~ - ✅ VERIFIED COMPLETE (Story 0.9)

### 🎯 FUTURE FEATURES - Decide on Implementation
1. **Analytics Charts** - SubmissionChart, CompletionRateChart
2. **Analytics Drill-Down Modals** - Task 10 implementation
3. **User Detail Navigation** - Task 9 implementation
4. **Benchmarks Configuration** - Future enhancement

### 🔧 IMMEDIATE FIXES NEEDED
1. **Replace console.log placeholders** in analytics navigation
2. **Implement actual navigation** for clickable rows/cards
3. **Remove completed story TODOs** from code comments

---

## Recommended Next Steps

1. **Phase 1: Clean Up Completed Stories**
   - Remove Story 3.4 ChatPanelPlaceholder references
   - Update Story 3.5 documentation
   - Remove Story 2.6 TODO comments if implemented
   - ✅ Story 2.7 verified complete (Story 0.4 - Feb 5, 2026)

2. **Phase 2: Verify Pending Stories**
   - Check Stories 1.7, 1.9 implementation status
   - Update documentation for completed features
   - Remove outdated placeholder comments

3. **Phase 3: Implement Navigation**
   - Replace console.log with actual navigation
   - Implement user detail page navigation (Task 9)
   - Connect clickable elements to routes

4. **Phase 4: Future Features Planning**
   - Prioritize analytics chart implementation
   - Plan drill-down modal functionality
   - Design user detail page

---

**Document Metadata:**
- Total Files Scanned: 311+ matching lines
- Categories: 5
- Critical TODOs: ~15
- Future Enhancements: ~8
- Test Artifacts: ~30
- Design Patterns: ~10
