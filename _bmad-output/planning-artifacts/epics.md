---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation', 'implementation-readiness-fixes']
workflowComplete: true
completedDate: '2026-02-02'
lastModified: '2026-02-02'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/prototype-generation-approach.md'
totalEpics: 10
totalStories: 67
allRequirementsCovered: true
implementationReady: true
fixesApplied:
  - 'Dissolved Epic 0 and redistributed stories to originating epics'
  - 'Resolved forward dependency violations'
  - 'Updated FR Coverage Map'
---

# IdeaSpark - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for IdeaSpark, decomposing the requirements from the PRD, UX Design, Architecture, and the NEW Prototype Generation feature into implementable stories.

## Requirements Inventory

### Functional Requirements (From PRD)

**User Management & Authentication (FR1-FR6)**
- FR1: Users can register for an account with email and password
- FR2: Users can log in to the system with their credentials
- FR3: Users can reset their password via email
- FR4: Users can log out of the system
- FR5: Admins can view a list of all registered users
- FR6: The system enforces role-based access control (User vs Admin roles)

**Idea Submission & Management (FR7-FR17)**
- FR7: Users can submit a new idea through a guided 4-step wizard (Problem, Solution, Impact, Review)
- FR8: Users can describe the problem they're trying to solve
- FR9: Users can describe their proposed solution
- FR10: Users can describe the expected impact of their idea
- FR11: Users can review their complete idea submission before submitting
- FR12: The system uses AI (Gemini 2.5 Flash) to enhance idea clarity and structure
- FR13: Users can view a list of their own submitted ideas
- FR14: Users can see the current status of each of their ideas (submitted, PRD development, prototype complete)
- FR15: Users can open and view details of any of their own ideas
- FR16: Admins can view all ideas submitted by all users
- FR17: Admins can filter and sort ideas in the dashboard

**PRD Development with AI (FR18-FR26)**
- FR18: Users can build a PRD through conversational interaction with an AI assistant
- FR19: The AI assistant asks contextual questions to guide PRD development
- FR20: Users can provide answers to AI questions in natural language
- FR21: The system generates structured PRD sections in real-time based on user inputs
- FR22: The PRD includes: Problem Statement, Goals & Metrics, User Stories, Requirements, Technical Considerations, Risks, and Timeline sections
- FR23: Users can see their PRD being built in real-time as they answer questions
- FR24: The system auto-saves PRD progress continuously
- FR25: Users can mark a PRD as complete when finished
- FR26: Users can view their completed PRDs

**Prototype Generation & Refinement (FR27-FR34) - ORIGINAL**
- FR27: The system automatically generates a React prototype when a PRD is marked complete
- FR28: Generated prototypes use PassportCard DaisyUI theme with brand colors (#e10514 red)
- FR29: Prototypes are fully responsive across desktop, tablet, and mobile devices
- FR30: Users can view their generated prototype in the browser
- FR31: Users can refine their prototype through chat-based natural language requests
- FR32: The system regenerates the prototype based on refinement requests
- FR33: Each prototype has a shareable URL that can be accessed by others
- FR34: Users can view the history of prototype refinements

**Admin & Triage Workflow (FR35-FR40)**
- FR35: Admins can access an innovation manager dashboard showing all ideas in the system
- FR36: Admins can see ideas organized by pipeline stage (submitted, PRD development, prototype complete, approved)
- FR37: Admins can approve idea submissions for PRD development phase
- FR38: Admins can reject idea submissions with feedback
- FR39: Admins can view the complete details of any user's idea, PRD, and prototype
- FR40: The system updates idea status when admin actions are taken (approved/rejected)

**Analytics & Reporting (FR41-FR45)**
- FR41: Admins can view total count of submitted ideas
- FR42: Admins can view breakdown of ideas in each pipeline stage
- FR43: Admins can view completion rates (ideas that progressed from submission → PRD → prototype)
- FR44: Admins can view average time-to-decision metrics
- FR45: Admins can see user activity overview (who submitted what, when)

**System Capabilities (FR46-FR50)**
- FR46: The system integrates with Gemini 2.5 Flash API for AI-powered interactions
- FR47: The system integrates with Open-lovable API for prototype generation
- FR48: The system stores all user data, ideas, PRDs, and prototypes in Supabase
- FR49: The system maintains data security through role-based data access enforcement
- FR50: The system provides a consistent PassportCard-branded UI throughout all screens

### NEW Functional Requirements - Enhanced Prototype Generation

**Full-Featured Prototype System (FR51-FR70)**
- FR51: Prototypes support multi-page navigation (3-5 key screens per prototype)
- FR52: Prototypes include clickable buttons and links with real interactions
- FR53: Prototypes support functional forms with real submissions
- FR54: Prototypes include state management for interactive components
- FR55: Users can view the generated prototype code in syntax-highlighted format
- FR56: Users can edit prototype code in real-time using an integrated code editor
- FR57: Code changes reflect immediately in the prototype preview
- FR58: Users can save edited prototype versions
- FR59: The system persists prototype state between sessions
- FR60: Users can continue interacting with a prototype where they left off
- FR61: The system supports multiple saved versions of a prototype
- FR62: Users can generate public shareable URLs for prototypes
- FR63: Public prototype URLs support optional password protection
- FR64: Public prototype URLs support configurable expiration times
- FR65: External stakeholders can view prototypes via public links without authentication
- FR66: Prototypes can make real API calls to backend services
- FR67: Prototypes can make AI API calls for dynamic content generation
- FR68: Prototypes support mock API responses for testing
- FR69: Users can configure API endpoints for prototype API calls
- FR70: The system generates multi-file component structure for prototypes (not single-file)

### Non-Functional Requirements

**Performance (NFR-P1 to NFR-P6)**
- NFR-P1: All application pages load within 3 seconds on a standard broadband connection
- NFR-P2: User interactions (clicks, typing, navigation) respond within 100 milliseconds
- NFR-P3: React prototype generation completes within 30 seconds from PRD completion
- NFR-P4: AI idea enhancement provides feedback within 5 seconds
- NFR-P5: Real-time updates (admin dashboard) reflect changes within 500 milliseconds
- NFR-P6: System maintains performance standards with 1-2 concurrent users

**Security (NFR-S1 to NFR-S5)**
- NFR-S1: User passwords are hashed using industry-standard algorithms (bcrypt)
- NFR-S2: Role-based access control enforces User vs Admin permissions at the database level
- NFR-S3: All data transmitted between client and server uses HTTPS
- NFR-S4: Supabase Row Level Security (RLS) policies enforce data access rules
- NFR-S5: External API calls include proper authentication and rate limiting

**Scalability (NFR-SC1 to NFR-SC3)**
- NFR-SC1: System is optimized for 1-2 concurrent users initially
- NFR-SC2: Application architecture supports scaling to 10-20 concurrent users with configuration changes only
- NFR-SC3: Application uses appropriate database indexing for common queries

**Integration Reliability (NFR-I1 to NFR-I4)**
- NFR-I1: Gemini API integration includes retry logic for transient failures (up to 3 retries)
- NFR-I2: Open-lovable API integration includes timeout handling (fail after 60 seconds)
- NFR-I3: Supabase connection includes automatic reconnection logic
- NFR-I4: System logs all external API call successes and failures

**Browser & Device Compatibility (NFR-BC1 to NFR-BC3)**
- NFR-BC1: Full functionality in latest 2 versions of Chrome, Firefox, Safari, and Edge
- NFR-BC2: UI adapts to desktop, tablet, and mobile screen sizes
- NFR-BC3: PassportCard DaisyUI theme renders consistently across all supported browsers

### Additional Requirements from Architecture

**Starter Template:**
- Architecture specifies Vite + React + TypeScript as the starter template
- First story in Epic 1 must initialize project using: `npm create vite@latest ideaspark -- --template react-ts`

**Technology Stack:**
- TypeScript 5.x with strict mode
- Vite 6.x for build tooling
- Tailwind CSS 4.x + DaisyUI 5.x with PassportCard theme
- React 19.x with hooks-based patterns
- Supabase for backend (PostgreSQL, Auth, Realtime, Storage)
- React Query + Zustand for state management
- Zod + React Hook Form for validation

**Security Architecture:**
- Supabase Edge Functions must protect API keys (Gemini, Firecrawl)
- Row Level Security (RLS) policies must enforce role-based access
- All external API calls routed through Edge Functions

**Project Structure:**
- Feature-based folder organization (features/auth/, features/ideas/, features/prd/, features/prototypes/, features/admin/)
- Shared UI components in components/ui/
- Service layer abstraction for external APIs
- Co-located tests with components

**Naming Conventions:**
- Database: snake_case (tables: ideas, prd_documents)
- TypeScript: camelCase for functions, PascalCase for components
- Files: PascalCase.tsx for components
- Hooks: use + camelCase pattern

**Integration Patterns:**
- Service Response Wrapper: `{ data: T | null, error: Error | null }`
- React Query for server state, Zustand for client state
- Error handling: try/catch + React Query retries

### Additional Requirements from UX Design

**Brand Consistency:**
- PassportCard theme: Primary color #E10514 (red)
- Border radius: 20px
- Typography: Montserrat (headings), Rubik (body)
- DaisyUI components must be theme-compliant

**Responsive Design:**
- Desktop-first design for heavy-duty work (PRD building, admin dashboard)
- Mobile-responsive for lightweight interactions (idea submission, status checking)
- Touch-friendly interactions on mobile/tablet
- Thumb-zone optimization for mobile

**Real-Time Features:**
- Auto-save during PRD development
- Live PRD building (users see structure emerge in real-time)
- Admin dashboard updates in real-time

**AI Interaction Patterns:**
- Conversational PRD building must feel collaborative, not interrogative
- AI enhancements must be transparent (show what changed and why)
- Chat interface with natural dialogue
- Adaptive questioning based on user sophistication

**Performance UX:**
- Loading indicators for all async operations
- Progress bars for prototype generation
- Optimistic UI updates where appropriate
- Skeleton screens during data loading

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### FR Coverage Map

**Epic 1: Project Foundation & User Authentication**
- FR1, FR2, FR3, FR4, FR5, FR6: User management and auth (including password reset)
- FR46, FR48, FR49, FR50: System capabilities and security

**Epic 2: Idea Submission & Management**
- FR7, FR8, FR9, FR10, FR11: Idea wizard and submission
- FR12: AI enhancement (Gemini)
- FR13, FR14, FR15: User's idea viewing and status

**Epic 3: PRD Development with AI Assistant**
- FR18, FR19, FR20, FR21: AI conversational PRD building
- FR22: PRD structure (Problem, Goals, Stories, Requirements, etc.)
- FR23, FR24, FR25, FR26: Real-time building, auto-save, completion, viewing

**Epic 4: Full-Featured Prototype Generation with Sandpack**
- FR27, FR28, FR29, FR30: Basic prototype generation and viewing
- FR31, FR32, FR33, FR34: Refinement and sharing
- FR47: Open-Lovable integration
- FR51, FR52, FR53, FR54: Multi-page, interactive, forms, state
- FR70: Multi-file component structure

**Epic 5: Admin Dashboard & Pipeline Management**
- FR16, FR17: Admin view all ideas, filter/sort
- FR35, FR36, FR37, FR38, FR39, FR40: Admin dashboard, triage, approve/reject

**Epic 6: Analytics & Innovation Metrics**
- FR41, FR42, FR43, FR44, FR45: Analytics metrics and reporting

**Epic 7: Prototype Code Editor & Live Editing**
- FR55, FR56, FR57, FR58: Code viewing, editing, live preview, saving
- FR61: Version management

**Epic 8: Prototype State Persistence**
- FR59, FR60: State persistence across sessions

**Epic 9: Public Prototype Sharing & Access Control**
- FR62, FR63, FR64, FR65: Public URLs, password protection, expiration, anonymous access

**Epic 10: Prototype API Integration Layer**
- FR66, FR67, FR68, FR69: Real API calls, AI integration, mocks, configuration

## Epic List

### Epic 1: Project Foundation & User Authentication
**Goal:** Users can register, login, and securely access the IdeaSpark platform with role-based permissions.

**User Outcomes:**
- Register with email/password
- Login and manage sessions
- Reset passwords via email
- Access profile page and manage account settings
- Access role-based features (User vs Admin)
- Navigate through PassportCard-branded interface

**FRs Covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR46, FR48, FR49, FR50

---

### Epic 2: Idea Submission & Management
**Goal:** Users can submit ideas through a guided wizard, get AI enhancement, and track their submissions.

**User Outcomes:**
- Submit ideas via 4-step wizard (Problem, Solution, Impact, Review)
- Get AI enhancement for clarity (Gemini)
- View their own ideas with status tracking
- See idea details

**FRs Covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15

---

### Epic 3: PRD Development with AI Assistant
**Goal:** Users can build comprehensive Product Requirements Documents through conversational AI guidance.

**User Outcomes:**
- Chat with AI assistant to build PRD
- Answer questions that generate structured PRD sections
- See PRD build in real-time
- Auto-save progress continuously
- Mark PRD as complete
- View completed PRDs

**FRs Covered:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26

---

### Epic 4: Full-Featured Prototype Generation with Sandpack
**Goal:** Users can generate fully interactive, multi-page React prototypes with navigation, forms, and state management using Sandpack (no basic iframe version).

**User Outcomes:**
- Auto-generate prototype when PRD is complete (30 seconds)
- View multi-page prototypes (3-5 screens) with navigation
- Interact with clickable buttons, links, and functional forms
- See PassportCard branding (#E10514) applied automatically
- Refine prototypes through chat interface
- View prototype history
- Access via shareable URLs

**FRs Covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR47, FR51, FR52, FR53, FR54, FR70

---

### Epic 5: Admin Dashboard & Pipeline Management
**Goal:** Admins can manage the innovation pipeline, triage ideas, and control workflow progression.

**User Outcomes:**
- View all ideas across all users
- See pipeline stages (submitted, PRD dev, prototype complete, approved)
- Approve/reject ideas for PRD phase
- Filter and sort ideas
- View user activity
- Access complete details of any submission

**FRs Covered:** FR16, FR17, FR35, FR36, FR37, FR38, FR39, FR40

---

### Epic 6: Analytics & Innovation Metrics
**Goal:** Admins can track innovation program success through comprehensive metrics, interactive visualizations, and drill-down capabilities.

**User Outcomes:**
- View total idea counts
- See breakdown by pipeline stage
- Track completion rates with visual charts
- Monitor time-to-decision metrics
- View user activity overview
- Click metrics for detailed drill-down
- Navigate to user detail pages
- View submission trend charts

**FRs Covered:** FR41, FR42, FR43, FR44, FR45

---

### Epic 7: Prototype Code Editor & Live Editing
**Goal:** Users can view, edit prototype code in real-time, and manage multiple versions.

**User Outcomes:**
- View generated code with syntax highlighting
- Edit code in real-time (Monaco/CodeMirror integrated with Sandpack)
- See changes reflected immediately in preview
- Save edited versions
- Manage multiple prototype versions

**FRs Covered:** FR55, FR56, FR57, FR58, FR61

---

### Epic 8: Prototype State Persistence
**Goal:** Users can maintain prototype state across sessions and continue where they left off.

**User Outcomes:**
- Have prototype state saved automatically
- Resume interaction from previous session
- Maintain form data, navigation state, and component states

**FRs Covered:** FR59, FR60

---

### Epic 9: Public Prototype Sharing & Access Control
**Goal:** Users can share prototypes with external stakeholders via secure public links.

**User Outcomes:**
- Generate public shareable URLs
- Set optional password protection
- Configure link expiration times
- Allow external viewing without authentication

**FRs Covered:** FR62, FR63, FR64, FR65

---

### Epic 10: Prototype API Integration Layer
**Goal:** Users can create prototypes that make real API calls, including AI integration, with mock support.

**User Outcomes:**
- Configure API endpoints in prototypes
- Make real backend API calls
- Integrate AI APIs for dynamic content
- Use mock responses for testing
- Test API flows within prototypes

**FRs Covered:** FR66, FR67, FR68, FR69

---

## Epic 1: Project Foundation & User Authentication

**Goal:** Users can register, login, and securely access the IdeaSpark platform with role-based permissions.

**Note:** This epic represents the foundational work already completed. Stories here document the existing implementation for reference.

### Story 1.1: Initialize Project with Vite and Core Dependencies

As a **developer**,
I want to **initialize the project using Vite + React + TypeScript**,
So that **we have a modern, fast development environment aligned with the architecture**.

**Acceptance Criteria:**

**Given** the project needs initialization
**When** I run `npm create vite@latest ideaspark -- --template react-ts`
**Then** a new Vite project is created with React and TypeScript

**Given** the base project is created
**When** I install core dependencies
**Then** Tailwind CSS 4.x, DaisyUI 5.x, Supabase client, React Router, Zustand, React Query, Zod, and React Hook Form are installed
**And** all configuration files are set up (tailwind.config.ts, tsconfig.json, vite.config.ts)

**Given** all dependencies are installed
**When** I run the dev server
**Then** the application starts successfully on http://localhost:5173
**And** Hot Module Replacement works correctly

---

### Story 1.2: Configure PassportCard DaisyUI Theme

As a **developer**,
I want to **configure the PassportCard brand theme in DaisyUI**,
So that **all UI components automatically use the correct brand colors (#E10514) and styling**.

**Acceptance Criteria:**

**Given** DaisyUI is installed
**When** I configure tailwind.config.ts
**Then** a custom PassportCard theme is defined
**And** primary color is set to #E10514
**And** border radius is set to 20px
**And** fonts are configured (Montserrat for headings, Rubik for body)

**Given** the theme is configured
**When** I use DaisyUI components
**Then** they automatically render with PassportCard branding
**And** the theme is consistent across all pages

---

### Story 1.3: Set Up Supabase Client & Configuration

As a **developer**,
I want to **configure the Supabase client for authentication and database access**,
So that **the application can connect to Supabase services**.

**Acceptance Criteria:**

**Given** Supabase client is installed
**When** I create `src/lib/supabase.ts`
**Then** the Supabase client is initialized with project URL and anon key
**And** environment variables are used for configuration (.env.local)

**Given** the Supabase client is configured
**When** the application starts
**Then** the client can connect to Supabase
**And** authentication session is checked automatically

---

### Story 1.4: User Registration Flow

As a **new user**,
I want to **register for an account with email and password**,
So that **I can access the IdeaSpark platform**.

**Acceptance Criteria:**

**Given** the codebase has TODO comments referencing Story 2.7
**When** I test the idea submission flow
**Then** ideas are saved to the `ideas` table in Supabase

**Given** a user completes the idea wizard
**When** they click "Submit Idea"
**Then** the idea is saved with all fields (problem, solution, impact, status, user_id, timestamps)
**And** the user receives confirmation
**And** the idea appears in their "My Ideas" list

**Given** the submission fails (network error, validation error)
**When** an error occurs
**Then** the user sees a clear error message
**And** can retry the submission
**And** their form data is preserved

**Given** idea submission is verified to work
**When** Story 0.4 is complete
**Then** all TODO comments referencing Story 2.7 are removed
**And** any mock submission code is removed

---

### Story 0.5: Implement Analytics Chart Components

As an **admin**,
I want to **see visual charts for submission trends and completion rates**,
So that **I can quickly understand innovation metrics at a glance**.

**Acceptance Criteria:**

**Given** I am on the analytics dashboard
**When** the page loads
**Then** I see a SubmissionChart showing idea submissions over time (line or bar chart)
**And** I see a CompletionRateChart showing completion rate trends

**Given** the SubmissionChart component currently shows "Chart Coming Soon"
**When** Story 0.5 is complete
**Then** the placeholder is replaced with a real chart using Chart.js or Recharts
**And** data is fetched from the analytics hook
**And** the chart displays actual submission data

**Given** the CompletionRateChart component currently shows "Chart Coming Soon"
**When** Story 0.5 is complete
**Then** the placeholder is replaced with a real chart
**And** shows completion rate percentages over time
**And** displays breakdowns by stage

**Given** there is no data for the time period
**When** charts load
**Then** they display an appropriate "No data available" message
**And** do not show broken/empty charts

---

### Story 0.6: Implement Analytics Drill-Down Modals

As an **admin**,
I want to **click on analytics metrics to see detailed breakdowns**,
So that **I can investigate specific data points and understand trends deeply**.

**Acceptance Criteria:**

**Given** I am on the analytics dashboard viewing Time-to-Decision metrics
**When** I click on a metric card
**Then** a modal opens showing detailed drill-down information
**And** the modal displays individual idea timelines
**And** shows breakdowns by stage

**Given** the TimeToDecisionCard component has a console.log placeholder (line 70)
**When** Story 0.6 is complete
**Then** the console.log is replaced with modal opening logic
**And** clicking metrics opens a DrillDownModal component

**Given** I am viewing drill-down data
**When** the modal is open
**Then** I see filterable, sortable detailed data
**And** I can close the modal to return to the dashboard

**Given** the CompletionRateCard has similar placeholders
**When** Story 0.6 is complete
**Then** completion rate metrics also support drill-down
**And** all "coming soon" messages are removed

---

### Story 0.7: Create User Detail Pages & Fix Navigation Placeholders

As an **admin**,
I want to **click on a user's name to see their full activity and contribution details**,
So that **I can understand individual user engagement and productivity**.

**Acceptance Criteria:**

**Given** I am on the analytics dashboard viewing Recent Submissions
**When** I click on a submission (line 67 currently has console.log)
**Then** I navigate to the idea detail page (not console.log)

**Given** I am viewing Top Contributors Leaderboard
**When** I click on a contributor row (line 59 currently has console.log)
**Then** I navigate to a UserDetailPage showing that user's full profile

**Given** I am on the UserDetailPage
**When** the page loads
**Then** I see the user's profile information
**And** a list of all their submitted ideas
**And** their PRDs and prototypes
**And** activity timeline
**And** contribution statistics

**Given** all navigation placeholders exist as console.log
**When** Story 0.7 is complete
**Then** all console.log navigation is replaced with React Router navigation
**And** UserDetailPage component is created at `src/features/admin/pages/UserDetailPage.tsx`

---

### Story 0.8: Remove Outdated TODO Comments & Documentation

As a **developer**,
I want to **remove all outdated TODO comments and placeholder references**,
So that **the codebase is clean and doesn't contain misleading comments**.

**Acceptance Criteria:**

**Given** Story 3.4 (Chat Interface) is complete
**When** I search the codebase for "ChatPanelPlaceholder"
**Then** no references exist (all replaced with ChatInterface)
**And** implementation artifact documentation is updated

**Given** Story 3.5 (PRD Section Generation) is complete
**When** I review the documentation
**Then** all references to "placeholder handler" for onSectionUpdate are updated
**And** the documentation accurately reflects the current implementation

**Given** Stories 2.6, 2.7 are verified/complete
**When** I search for TODO comments referencing these stories
**Then** all TODO comments are removed
**And** code reflects actual implementation

**Given** all code cleanup is complete
**When** Story 0.8 is finished
**Then** running a search for "TODO: Story" returns zero results in active code
**And** implementation artifacts are updated to reflect completed work

---

### Story 0.9: Verify Ideas Routes & Remove Placeholder Comments

As a **developer**,
I want to **verify the ideas routes are fully implemented**,
So that **placeholder route comments are removed and navigation works correctly**.

**Acceptance Criteria:**

**Given** the implementation artifact mentions "Ideas routes (Story 2.x) - placeholder structure" (line 395)
**When** I check the routing configuration
**Then** all ideas routes are implemented and functional

**Given** ideas routes are functional
**When** I test navigation
**Then** users can navigate to /ideas, /ideas/:id, /ideas/new
**And** all routes render correct components
**And** route guards work properly

**Given** ideas routes are verified
**When** Story 0.9 is complete
**Then** all placeholder route comments are removed
**And** routing documentation is updated

---

## Epic 1: Project Foundation & User Authentication

**Goal:** Users can register, login, and securely access the IdeaSpark platform with role-based permissions.

**Note:** This epic represents the foundational work already completed. Stories here document the existing implementation for reference.

### Story 1.1: Initialize Project with Vite and Core Dependencies

As a **developer**,
I want to **initialize the project using Vite + React + TypeScript**,
So that **we have a modern, fast development environment aligned with the architecture**.

**Acceptance Criteria:**

**Given** the project needs initialization
**When** I run `npm create vite@latest ideaspark -- --template react-ts`
**Then** a new Vite project is created with React and TypeScript

**Given** the base project is created
**When** I install core dependencies
**Then** Tailwind CSS 4.x, DaisyUI 5.x, Supabase client, React Router, Zustand, React Query, Zod, and React Hook Form are installed
**And** all configuration files are set up (tailwind.config.ts, tsconfig.json, vite.config.ts)

**Given** all dependencies are installed
**When** I run the dev server
**Then** the application starts successfully on http://localhost:5173
**And** Hot Module Replacement works correctly

---

### Story 1.2: Configure PassportCard DaisyUI Theme

As a **developer**,
I want to **configure the PassportCard brand theme in DaisyUI**,
So that **all UI components automatically use the correct brand colors (#E10514) and styling**.

**Acceptance Criteria:**

**Given** DaisyUI is installed
**When** I configure tailwind.config.ts
**Then** a custom PassportCard theme is defined
**And** primary color is set to #E10514
**And** border radius is set to 20px
**And** fonts are configured (Montserrat for headings, Rubik for body)

**Given** the theme is configured
**When** I use DaisyUI components
**Then** they automatically render with PassportCard branding
**And** the theme is consistent across all pages

---

### Story 1.3: Set Up Supabase Client & Configuration

As a **developer**,
I want to **configure the Supabase client for authentication and database access**,
So that **the application can connect to Supabase services**.

**Acceptance Criteria:**

**Given** Supabase client is installed
**When** I create `src/lib/supabase.ts`
**Then** the Supabase client is initialized with project URL and anon key
**And** environment variables are used for configuration (.env.local)

**Given** the Supabase client is configured
**When** the application starts
**Then** the client can connect to Supabase
**And** authentication session is checked automatically

---

### Story 1.4: User Registration Flow

As a **new user**,
I want to **register for an account with email and password**,
So that **I can access the IdeaSpark platform**.

**Acceptance Criteria:**

**Given** I navigate to /register
**When** the page loads
**Then** I see a registration form with email and password fields
**And** the form follows PassportCard branding

**Given** I am on the registration page
**When** I enter a valid email and password
**Then** my account is created in Supabase
**And** I am automatically logged in
**And** I am redirected to the dashboard

**Given** I enter an invalid email or weak password
**When** I submit the form
**Then** I see validation errors
**And** the form does not submit

**Given** I enter an email that already exists
**When** I submit the form
**Then** I see an error message indicating the email is already registered

---

### Story 1.5: User Login Flow

As a **registered user**,
I want to **log in with my email and password**,
So that **I can access my account and ideas**.

**Acceptance Criteria:**

**Given** I navigate to /login
**When** the page loads
**Then** I see a login form with email and password fields

**Given** I enter correct credentials
**When** I submit the form
**Then** I am authenticated via Supabase Auth
**And** my session is stored
**And** I am redirected to the dashboard

**Given** I enter incorrect credentials
**When** I submit the form
**Then** I see an error message
**And** I remain on the login page

**Given** I am not logged in
**When** I try to access a protected route
**Then** I am redirected to the login page

---

### Story 1.6: User Logout and Session Management

As a **logged-in user**,
I want to **log out of my account**,
So that **my session is securely ended**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I click the logout button in the user menu
**Then** my session is terminated via Supabase Auth
**And** I am redirected to the login page
**And** I cannot access protected routes

**Given** my session expires
**When** I try to access a protected route
**Then** I am automatically logged out
**And** redirected to the login page

---

### Story 1.7: Protected Routes and Role-Based Access

As a **developer**,
I want to **implement protected routes with role-based access control**,
So that **only authenticated users can access the app and admins can access admin features**.

**Acceptance Criteria:**

**Given** the application has public and protected routes
**When** I configure React Router
**Then** protected routes require authentication
**And** admin routes require admin role

**Given** I am an unauthenticated user
**When** I try to access /dashboard
**Then** I am redirected to /login

**Given** I am a regular user (not admin)
**When** I try to access /admin
**Then** I am redirected to /dashboard
**And** I see an "access denied" message

**Given** I am an admin user
**When** I navigate to /admin
**Then** I can access the admin dashboard
**And** all admin features are available

---

### Story 1.8: Supabase Row Level Security (RLS) Policies

As a **developer**,
I want to **implement RLS policies in Supabase**,
So that **users can only access their own data and admins can access all data**.

**Acceptance Criteria:**

**Given** the Supabase database is configured
**When** I create RLS policies for the `ideas` table
**Then** users can SELECT, INSERT, UPDATE their own ideas (user_id = auth.uid())
**And** admins can SELECT, INSERT, UPDATE, DELETE all ideas

**Given** the Supabase database is configured
**When** I create RLS policies for the `prd_documents` table
**Then** users can access their own PRDs
**And** admins can access all PRDs

**Given** the Supabase database is configured
**When** I create RLS policies for the `prototypes` table
**Then** users can access their own prototypes
**And** admins can access all prototypes
**And** public prototypes are accessible without authentication

**Given** RLS policies are active
**When** a user tries to access another user's data via direct API call
**Then** the request is denied by Supabase
**And** no unauthorized data is returned

---

## Epic 2: Idea Submission & Management

**Goal:** Users can submit ideas through a guided wizard, get AI enhancement, and track their submissions.

### Story 2.1: Idea Wizard - Step 1 (Problem Definition)

As a **user**,
I want to **describe the problem I'm trying to solve**,
So that **my idea starts with a clear problem statement**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to /ideas/new
**When** the page loads
**Then** I see Step 1 of 4: "What problem are you solving?"
**And** I see a textarea for problem description
**And** I see navigation buttons (Next)

**Given** I am on Step 1
**When** I enter a problem description (min 50 characters)
**Then** the Next button becomes enabled

**Given** I click Next with a valid problem description
**When** the form validates
**Then** my input is saved to local state
**And** I am taken to Step 2

**Given** I try to proceed without entering enough text
**When** I click Next
**Then** I see a validation error
**And** I remain on Step 1

---

### Story 2.2: Idea Wizard - Step 2 (Solution Proposal)

As a **user**,
I want to **describe my proposed solution**,
So that **I can articulate how I would solve the problem**.

**Acceptance Criteria:**

**Given** I completed Step 1
**When** I am on Step 2
**Then** I see "What's your proposed solution?"
**And** I see a textarea for solution description
**And** I see Back and Next buttons

**Given** I enter a solution description
**When** I click Next
**Then** my solution is saved to local state
**And** I proceed to Step 3

**Given** I click Back
**When** on Step 2
**Then** I return to Step 1
**And** my previous problem description is preserved

---

### Story 2.3: Idea Wizard - Step 3 (Impact Assessment)

As a **user**,
I want to **describe the expected impact of my idea**,
So that **decision makers can understand the potential value**.

**Acceptance Criteria:**

**Given** I completed Steps 1-2
**When** I am on Step 3
**Then** I see "What impact will this have?"
**And** I see a textarea for impact description
**And** I see Back and Next buttons

**Given** I enter an impact description
**When** I click Next
**Then** my impact is saved to local state
**And** I proceed to Step 4 (Review)

---

### Story 2.4: Idea Wizard - Step 4 (Review and AI Enhancement)

As a **user**,
I want to **review my complete idea and get AI-powered enhancements**,
So that **my submission is clear, professional, and compelling**.

**Acceptance Criteria:**

**Given** I completed Steps 1-3
**When** I arrive at Step 4
**Then** I see all my inputs: Problem, Solution, Impact
**And** I see an "Enhance with AI" button
**And** I see a "Submit Idea" button

**Given** I click "Enhance with AI"
**When** the AI enhancement request is sent
**Then** I see a loading indicator
**And** the Gemini 2.5 Flash API processes my idea (via Edge Function)
**And** enhanced versions of my text are returned
**And** I see before/after comparison

**Given** the AI enhancement completes
**When** I review the enhanced text
**Then** I can accept the enhancements
**Or** I can keep my original text
**Or** I can manually edit the enhanced text

**Given** I click "Submit Idea"
**When** the form validates
**Then** my idea is saved to the `ideas` table in Supabase
**And** I see a success message
**And** I am redirected to my ideas list

---

### Story 2.5: Implement AI Enhancement Edge Function

As a **developer**,
I want to **create the Gemini AI enhancement Edge Function**,
So that **idea enhancement uses the real Gemini API securely**.

**Acceptance Criteria:**

**Given** Supabase Edge Functions are configured
**When** I create `supabase/functions/gemini-enhance/index.ts`
**Then** the function accepts idea text (problem, solution, impact)
**And** calls Gemini 2.5 Flash API with appropriate prompt
**And** returns enhanced text

**Given** the Edge Function is deployed
**When** the client calls it with idea text
**Then** the Gemini API key remains server-side (not exposed)
**And** the enhanced text is returned
**And** errors are handled gracefully with retry logic

---

### Story 2.6: My Ideas List Page

As a **user**,
I want to **view a list of all my submitted ideas**,
So that **I can track my submissions and their status**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to /ideas
**Then** I see a list of my submitted ideas
**And** each idea shows: title (problem summary), status, submission date
**And** ideas are sorted by most recent first

**Given** I have no submitted ideas
**When** I navigate to /ideas
**Then** I see an empty state with a "Submit New Idea" button

**Given** I click on an idea in the list
**When** the idea card is clicked
**Then** I navigate to the idea detail page

---

### Story 2.7: Idea Detail Page

As a **user**,
I want to **view the full details of one of my ideas**,
So that **I can see the problem, solution, impact, status, and related PRD/prototype**.

**Acceptance Criteria:**

**Given** I am viewing my ideas list
**When** I click on an idea
**Then** I navigate to /ideas/:id
**And** I see the full idea details: Problem, Solution, Impact, Status, Created Date

**Given** the idea has been approved for PRD development
**When** I view the idea detail page
**Then** I see a "Start PRD" button
**And** can navigate to the PRD builder

**Given** the idea already has a PRD
**When** I view the idea detail page
**Then** I see a link to view the PRD
**And** see the current PRD status

**Given** the idea has a completed prototype
**When** I view the idea detail page
**Then** I see a link to view the prototype

---

## Epic 3: PRD Development with AI Assistant

**Goal:** Users can build comprehensive Product Requirements Documents through conversational AI guidance.

### Story 3.1: PRD Builder Page Layout

As a **user**,
I want to **access a dedicated PRD building interface**,
So that **I can create my PRD in a focused environment**.

**Acceptance Criteria:**

**Given** I have an approved idea
**When** I navigate to /prd/new or /prd/:id
**Then** I see a split-screen layout: chat panel (left) and PRD preview (right)
**And** the layout is responsive

**Given** I am on the PRD builder page
**When** the page loads
**Then** the chat panel is ready for interaction
**And** the PRD preview shows empty sections ready to be filled

---

### Story 3.2: PRD Chat Interface with AI Assistant

As a **user**,
I want to **chat with an AI assistant to build my PRD**,
So that **I receive guided questions that help me structure my requirements**.

**Acceptance Criteria:**

**Given** I am on the PRD builder page
**When** the chat loads
**Then** the AI sends an introductory message
**And** asks the first question about my idea

**Given** the AI asks a question
**When** I type my response and send
**Then** my message appears in the chat
**And** the AI processes my response
**And** the AI asks the next relevant question

**Given** I answer questions
**When** my responses are sufficient for a PRD section
**Then** the AI generates that section
**And** the section appears in the PRD preview panel

**Given** the chat interface is active
**When** messages are exchanged
**Then** the chat auto-scrolls to the latest message
**And** typing indicators show when AI is thinking

---

### Story 3.3: Real-Time PRD Section Generation

As a **user**,
I want to **see my PRD sections appear in real-time as I chat with the AI**,
So that **I can watch my PRD being built and provide immediate feedback**.

**Acceptance Criteria:**

**Given** I am chatting with the AI
**When** the AI generates a section (e.g., Problem Statement)
**Then** the section appears in the PRD preview
**And** the section is formatted according to the PRD template
**And** I can see the content being populated

**Given** a section is generated
**When** I review it in the preview
**Then** I can continue the chat to refine or move to the next section

**Given** multiple sections are generated
**When** I scroll the PRD preview
**Then** I can see all sections: Problem Statement, Goals & Metrics, User Stories, Requirements, Technical Considerations, Risks, Timeline

---

### Story 3.4: Implement Gemini PRD Chat Edge Function

As a **developer**,
I want to **create the Gemini PRD chat Edge Function**,
So that **PRD conversations are powered by real AI with context awareness**.

**Acceptance Criteria:**

**Given** Supabase Edge Functions are configured
**When** I create `supabase/functions/gemini-prd-chat/index.ts`
**Then** the function accepts user messages and conversation history
**And** calls Gemini 2.5 Flash API with PRD-building prompts
**And** returns AI responses that guide PRD development

**Given** the Edge Function is deployed
**When** the client sends a message
**Then** the AI maintains context across the conversation
**And** generates appropriate PRD sections based on responses
**And** sections conform to the required PRD structure

**Given** the AI generates a section
**When** the response is returned
**Then** it includes section metadata (section name, content)
**And** the client can update the PRD preview accordingly

---

### Story 3.5: PRD Auto-Save Functionality

As a **user**,
I want to **have my PRD progress automatically saved**,
So that **I don't lose my work if I navigate away or close my browser**.

**Acceptance Criteria:**

**Given** I am building a PRD
**When** a new section is generated or updated
**Then** the PRD is automatically saved to Supabase every 3 seconds
**And** I see a "Saving..." indicator
**And** the indicator changes to "Saved" when complete

**Given** I navigate away from the PRD builder
**When** I return later
**Then** my PRD is restored exactly as I left it
**And** the conversation history is preserved

**Given** the auto-save fails (network error)
**When** the save attempt fails
**Then** I see a warning notification
**And** the system retries the save

---

### Story 3.6: Mark PRD as Complete

As a **user**,
I want to **mark my PRD as complete when finished**,
So that **prototype generation can begin automatically**.

**Acceptance Criteria:**

**Given** I have built a complete PRD with all required sections
**When** I click "Mark as Complete"
**Then** the PRD status changes to "complete"
**And** I see a confirmation message
**And** prototype generation begins automatically

**Given** my PRD is incomplete (missing required sections)
**When** I try to mark it as complete
**Then** I see validation errors indicating which sections are missing
**And** the PRD remains in "draft" status

**Given** my PRD is marked as complete
**When** I want to make edits
**Then** I can reopen it for editing
**And** the status changes back to "draft"

---

### Story 3.7: View Completed PRD

As a **user**,
I want to **view my completed PRD in a read-only format**,
So that **I can review the final document without accidentally editing it**.

**Acceptance Criteria:**

**Given** I have a completed PRD
**When** I navigate to /prd/:id/view
**Then** I see the full PRD in a formatted, read-only view
**And** all sections are displayed professionally
**And** the PassportCard branding is applied

**Given** I am viewing a completed PRD
**When** I want to edit it
**Then** I see an "Edit PRD" button
**And** clicking it takes me back to the PRD builder

---

## Epic 4: Full-Featured Prototype Generation with Sandpack

**Goal:** Users can generate fully interactive, multi-page React prototypes with navigation, forms, and state management using Sandpack.

### Story 4.1: Sandpack Integration Setup

As a **developer**,
I want to **integrate Sandpack into the prototype viewer**,
So that **prototypes run as real React applications with full interactivity**.

**Acceptance Criteria:**

**Given** the prototype feature requires Sandpack
**When** I install `@codesandbox/sandpack-react`
**Then** the Sandpack package is added to dependencies

**Given** Sandpack is installed
**When** I create the PrototypeViewer component
**Then** it renders Sandpack with appropriate configuration
**And** supports React runtime with full JSX support
**And** includes necessary dependencies (React, React Router, DaisyUI)

---

### Story 4.2: Prototype Generation Edge Function

As a **developer**,
I want to **create the prototype generation Edge Function**,
So that **PRDs are transformed into multi-file React prototypes**.

**Acceptance Criteria:**

**Given** Supabase Edge Functions are configured
**When** I create `supabase/functions/prototype-generate/index.ts`
**Then** the function accepts PRD content
**And** calls the Open-Lovable API (or Gemini for code generation)
**And** generates multi-file React component structure

**Given** the Edge Function generates code
**When** a PRD is marked complete
**Then** it creates 3-5 screen components
**And** generates App.tsx with routing
**And** applies PassportCard DaisyUI theme
**And** includes navigation, forms, and interactive elements
**And** returns the file structure with code

**Given** the generation succeeds
**When** the Edge Function returns
**Then** the prototype code is saved to the `prototypes` table
**And** the prototype status is set to "ready"

---

### Story 4.3: Automatic Prototype Generation on PRD Completion

As a **user**,
I want to **see prototype generation begin automatically when I complete my PRD**,
So that **I don't have to wait or take manual action**.

**Acceptance Criteria:**

**Given** I mark my PRD as complete
**When** the status updates to "complete"
**Then** prototype generation begins automatically
**And** I see a "Generating your prototype..." message
**And** a progress indicator appears

**Given** prototype generation is in progress
**When** I wait
**Then** I see the progress indicator updating
**And** generation completes within 30 seconds

**Given** the prototype generation completes
**When** the status changes to "ready"
**Then** I see a success message
**And** I see a "View Prototype" button
**And** clicking it takes me to the prototype viewer

---

### Story 4.4: Prototype Viewer with Sandpack

As a **user**,
I want to **view my generated prototype in an interactive environment**,
So that **I can click through screens, test forms, and experience the prototype like a real app**.

**Acceptance Criteria:**

**Given** my prototype is ready
**When** I navigate to /prototypes/:id
**Then** I see the Sandpack viewer with my prototype loaded
**And** the prototype renders all screens correctly
**And** PassportCard branding (#E10514) is applied

**Given** the prototype has multiple screens
**When** I interact with navigation buttons/links
**Then** I can navigate between screens
**And** routing works correctly within Sandpack

**Given** the prototype has forms
**When** I enter data and submit
**Then** forms are functional with client-side validation
**And** I see appropriate feedback messages

**Given** the prototype has interactive components (buttons, toggles, modals)
**When** I interact with them
**Then** they respond correctly
**And** state is managed properly

---

### Story 4.5: Prototype Refinement Chat Interface

As a **user**,
I want to **refine my prototype by chatting with AI**,
So that **I can request changes without manually editing code**.

**Acceptance Criteria:**

**Given** I am viewing my prototype
**When** the page loads
**Then** I see a refinement chat interface below or beside the prototype
**And** I can type refinement requests

**Given** I type a refinement request (e.g., "Make the header larger")
**When** I send the message
**Then** the AI processes my request
**And** generates updated code
**And** the prototype regenerates with my changes

**Given** the refinement completes
**When** the updated prototype loads
**Then** I see my requested changes applied
**And** the refinement is saved to the prototype history

**Given** I make multiple refinements
**When** I view prototype history
**Then** I can see all refinement prompts and versions

---

### Story 4.6: PassportCard Theme Enforcement in Generated Prototypes

As a **user**,
I want to **see all generated prototypes automatically use PassportCard branding**,
So that **every prototype looks like it belongs in the PassportCard product family**.

**Acceptance Criteria:**

**Given** a prototype is generated
**When** I view it in Sandpack
**Then** the primary color is #E10514 (PassportCard red)
**And** border radius is 20px
**And** typography uses Montserrat and Rubik fonts
**And** DaisyUI components follow PassportCard theme

**Given** I refine the prototype
**When** code is regenerated
**Then** PassportCard branding is preserved
**And** cannot be accidentally overridden

---

### Story 4.7: Shareable Prototype URLs

As a **user**,
I want to **share my prototype via a URL**,
So that **colleagues and stakeholders can view it without logging in**.

**Acceptance Criteria:**

**Given** I am viewing my prototype
**When** I click "Share"
**Then** I see a shareable URL
**And** I can copy the URL to clipboard

**Given** I share the URL with a colleague
**When** they open the link
**Then** they can view the prototype (if permissions allow)
**And** the prototype loads correctly in Sandpack

---

## Epic 5: Admin Dashboard & Pipeline Management

**Goal:** Admins can manage the innovation pipeline, triage ideas, and control workflow progression.

### Story 5.1: Admin Dashboard Layout

As an **admin**,
I want to **access a dedicated admin dashboard**,
So that **I can manage all ideas, PRDs, and prototypes across users**.

**Acceptance Criteria:**

**Given** I am logged in as an admin
**When** I navigate to /admin
**Then** I see the admin dashboard layout
**And** I see navigation for Ideas, Analytics, Users
**And** the interface follows PassportCard branding

---

### Story 5.2: View All Ideas in Pipeline

As an **admin**,
I want to **see all submitted ideas organized by pipeline stage**,
So that **I can understand what's in progress and what needs attention**.

**Acceptance Criteria:**

**Given** I am on the admin dashboard
**When** the page loads
**Then** I see ideas organized by status: Submitted, PRD Development, Prototype Complete, Approved
**And** each column shows the idea count
**And** I can see idea cards in each column

**Given** there are many ideas
**When** I view the pipeline
**Then** ideas are paginated or have infinite scroll
**And** I can search and filter ideas

---

### Story 5.3: Admin Idea Triage - Approve/Reject

As an **admin**,
I want to **approve or reject submitted ideas**,
So that **users know if they can proceed to PRD development**.

**Acceptance Criteria:**

**Given** I am viewing submitted ideas
**When** I click on an idea card
**Then** I see full idea details
**And** I see "Approve" and "Reject" buttons

**Given** I click "Approve"
**When** the action is confirmed
**Then** the idea status changes to "approved"
**And** the user is notified (if notifications exist)
**And** the idea moves to "PRD Development" column

**Given** I click "Reject"
**When** I enter rejection feedback
**Then** the idea status changes to "rejected"
**And** the rejection reason is saved
**And** the user can see the feedback

---

### Story 5.4: Filter and Sort Ideas

As an **admin**,
I want to **filter and sort ideas by various criteria**,
So that **I can quickly find specific ideas or focus on priority items**.

**Acceptance Criteria:**

**Given** I am on the admin ideas view
**When** I use the filter options
**Then** I can filter by: Status, Date Range, User, Department (if applicable)

**Given** I am viewing filtered ideas
**When** I use sort options
**Then** I can sort by: Most Recent, Oldest, Most Impact, Alphabetical

---

### Story 5.5: View User List

As an **admin**,
I want to **see a list of all registered users**,
So that **I can monitor user activity and manage accounts**.

**Acceptance Criteria:**

**Given** I am logged in as an admin
**When** I navigate to /admin/users
**Then** I see a list of all users
**And** each user shows: Name, Email, Role, Registration Date, Idea Count

**Given** I am viewing the user list
**When** I click on a user
**Then** I navigate to their detail page (Story 0.7)

---

## Epic 6: Analytics & Innovation Metrics

**Goal:** Admins can track innovation program success through comprehensive metrics, interactive visualizations, and drill-down capabilities.

**Note:** Stories 0.5, 0.6, 0.7 already cover chart implementation and drill-downs. These stories cover the remaining analytics features.

### Story 6.1: Analytics Dashboard Layout

As an **admin**,
I want to **access a comprehensive analytics dashboard**,
So that **I can see innovation program metrics at a glance**.

**Acceptance Criteria:**

**Given** I am logged in as an admin
**When** I navigate to /admin/analytics
**Then** I see the analytics dashboard
**And** I see metric cards at the top (Total Ideas, Active PRDs, Prototypes Generated, etc.)
**And** I see charts below (from Story 0.5)
**And** I see lists (Top Contributors, Recent Submissions)

---

### Story 6.2: Idea Count Metrics

As an **admin**,
I want to **see total idea counts and breakdowns by stage**,
So that **I understand the overall volume and distribution of ideas**.

**Acceptance Criteria:**

**Given** I am on the analytics dashboard
**When** the metrics load
**Then** I see "Total Ideas Submitted" card with count
**And** I see breakdown by stage: Submitted, PRD Dev, Prototype Complete, Approved

**Given** the metrics are displayed
**When** I hover over a metric
**Then** I see a tooltip with additional details

---

### Story 6.3: Completion Rate Metrics with Charts

As an **admin**,
I want to **see completion rates showing how many ideas progress through each stage**,
So that **I can identify bottlenecks in the innovation pipeline**.

**Acceptance Criteria:**

**Given** I am on the analytics dashboard
**When** completion rate metrics load
**Then** I see "Overall Completion Rate" (idea → prototype)
**And** I see "PRD Completion Rate" (idea → PRD)
**And** I see "Prototype Completion Rate" (PRD → prototype)
**And** I see a visual chart (from Story 0.5)

**Given** I click on a completion rate metric
**When** the drill-down modal opens (Story 0.6)
**Then** I see detailed breakdown of ideas at each stage
**And** I can see which ideas are stuck

---

### Story 6.4: Time-to-Decision Metrics

As an **admin**,
I want to **see average time-to-decision metrics**,
So that **I understand how quickly we're evaluating and progressing ideas**.

**Acceptance Criteria:**

**Given** I am on the analytics dashboard
**When** time metrics load
**Then** I see "Average Time: Submission → Approval"
**And** I see "Average Time: Idea → PRD Complete"
**And** I see "Average Time: PRD → Prototype"

**Given** I click on a time metric
**When** the drill-down modal opens (Story 0.6)
**Then** I see individual idea timelines
**And** I can identify outliers (ideas taking too long)

---

### Story 6.5: User Activity Overview

As an **admin**,
I want to **see which users are most active and engaged**,
So that **I can recognize top contributors and encourage participation**.

**Acceptance Criteria:**

**Given** I am on the analytics dashboard
**When** the user activity section loads
**Then** I see "Top Contributors" leaderboard
**And** each entry shows: User Name, Ideas Submitted, PRDs Completed, Prototypes Generated

**Given** I click on a contributor (Story 0.7)
**When** navigation occurs
**Then** I go to the UserDetailPage showing full user activity

---

### Story 6.6: Recent Submissions List

As an **admin**,
I want to **see the most recent idea submissions**,
So that **I can quickly triage new ideas**.

**Acceptance Criteria:**

**Given** I am on the analytics dashboard
**When** the recent submissions section loads
**Then** I see the 10 most recent idea submissions
**And** each shows: Idea Title, User, Submission Date, Status

**Given** I click on a recent submission (Story 0.7)
**When** navigation occurs
**Then** I go to the idea detail page

---

## Epic 7: Prototype Code Editor & Live Editing

**Goal:** Users can view, edit prototype code in real-time, and manage multiple versions.

### Story 7.1: Code Editor Integration (Monaco or CodeMirror)

As a **developer**,
I want to **integrate a code editor into the prototype viewer**,
So that **users can edit prototype code with syntax highlighting and autocomplete**.

**Acceptance Criteria:**

**Given** the prototype viewer supports code editing
**When** I install Monaco Editor or CodeMirror
**Then** the package is added to dependencies

**Given** the editor is integrated
**When** I add it to the prototype viewer component
**Then** it renders alongside the Sandpack preview
**And** supports TypeScript/JSX syntax highlighting
**And** provides autocomplete and error detection

---

### Story 7.2: View Generated Code with Syntax Highlighting

As a **user**,
I want to **view the generated prototype code**,
So that **I can understand how the prototype is built and learn from it**.

**Acceptance Criteria:**

**Given** I am viewing my prototype
**When** I click "View Code"
**Then** a code panel opens showing the generated files
**And** I see a file tree (App.tsx, HomePage.tsx, etc.)
**And** I can click on files to view their code
**And** syntax highlighting is applied

---

### Story 7.3: Edit Code in Real-Time with Live Preview

As a **user**,
I want to **edit the prototype code and see changes instantly**,
So that **I can customize my prototype beyond AI refinements**.

**Acceptance Criteria:**

**Given** I am viewing the code editor
**When** I edit code in a file
**Then** the changes are reflected in the Sandpack preview within 1 second
**And** I see hot reload (no full page refresh)

**Given** I introduce a syntax error
**When** the code compiles
**Then** I see an error message in the editor
**And** the preview shows the error
**And** I can fix it

**Given** I make multiple edits
**When** typing
**Then** the editor auto-saves my changes locally (debounced)

---

### Story 7.4: Save Edited Prototype Version

As a **user**,
I want to **save my edited prototype as a new version**,
So that **I can preserve my customizations and revert if needed**.

**Acceptance Criteria:**

**Given** I have edited the prototype code
**When** I click "Save Version"
**Then** the current code is saved to the database as a new version
**And** I see a success message
**And** the version counter increments

**Given** I save a version
**When** I provide an optional version note
**Then** the note is saved with the version
**And** I can see it in version history

---

### Story 7.5: Manage Multiple Prototype Versions

As a **user**,
I want to **view and switch between different prototype versions**,
So that **I can compare iterations and revert to previous versions**.

**Acceptance Criteria:**

**Given** my prototype has multiple versions
**When** I click "Version History"
**Then** I see a list of all versions with timestamps and notes

**Given** I am viewing version history
**When** I click on a previous version
**Then** the code editor and preview update to show that version
**And** I can restore it as the current version if desired

**Given** I want to compare versions
**When** I select two versions
**Then** I see a diff view showing changes between them

---

## Epic 8: Prototype State Persistence

**Goal:** Users can maintain prototype state across sessions and continue where they left off.

### Story 8.1: Capture Prototype State

As a **developer**,
I want to **capture the runtime state of prototypes**,
So that **user interactions are preserved across sessions**.

**Acceptance Criteria:**

**Given** a prototype is running in Sandpack
**When** the user interacts with it (form inputs, navigation, toggles)
**Then** the state is captured automatically

**Given** state is captured
**When** serializing
**Then** it includes: current route, form field values, component states, local storage data

---

### Story 8.2: Save Prototype State to Database

As a **user**,
I want to **have my prototype interaction state automatically saved**,
So that **I don't lose my place when I close the browser**.

**Acceptance Criteria:**

**Given** I am interacting with a prototype
**When** the state changes
**Then** it is saved to Supabase every 10 seconds (debounced)
**And** state is associated with my user_id and prototype_id

**Given** I navigate away from the prototype
**When** I close the browser or tab
**Then** my current state is saved automatically

---

### Story 8.3: Restore Prototype State on Return

As a **user**,
I want to **resume my prototype session exactly where I left off**,
So that **I can continue testing without restarting**.

**Acceptance Criteria:**

**Given** I previously interacted with a prototype
**When** I return to /prototypes/:id
**Then** my saved state is loaded automatically
**And** the prototype renders with my previous route, form data, and component states

**Given** no saved state exists
**When** I load a prototype for the first time
**Then** it starts in the initial default state

**Given** I want to reset the prototype
**When** I click "Reset to Initial State"
**Then** saved state is cleared
**And** the prototype reloads in default state

---

## Epic 9: Public Prototype Sharing & Access Control

**Goal:** Users can share prototypes with external stakeholders via secure public links.

### Story 9.1: Generate Public Shareable URL

As a **user**,
I want to **generate a public URL for my prototype**,
So that **I can share it with stakeholders who don't have IdeaSpark accounts**.

**Acceptance Criteria:**

**Given** I am viewing my prototype
**When** I click "Share Publicly"
**Then** a modal opens with sharing options
**And** a unique public URL is generated (e.g., /public/prototypes/:token)

**Given** the public URL is generated
**When** I copy it
**Then** I can share it with anyone
**And** they can view the prototype without authentication

---

### Story 9.2: Optional Password Protection

As a **user**,
I want to **protect my public prototype link with a password**,
So that **only people I share the password with can access it**.

**Acceptance Criteria:**

**Given** I am creating a public share link
**When** I enable password protection
**Then** I set a password
**And** the password is hashed and stored securely

**Given** someone accesses a password-protected prototype
**When** they navigate to the public URL
**Then** they see a password prompt
**And** must enter the correct password to view the prototype

**Given** the password is incorrect
**When** they submit it
**Then** access is denied
**And** they can retry

---

### Story 9.3: Configurable Link Expiration

As a **user**,
I want to **set an expiration time for my public share links**,
So that **old links stop working after a certain period**.

**Acceptance Criteria:**

**Given** I am creating a public share link
**When** I configure expiration
**Then** I can choose: 24 hours, 7 days, 30 days, Never

**Given** a link is set to expire
**When** the expiration time passes
**Then** the link becomes invalid
**And** anyone accessing it sees an "expired link" message

**Given** I want to extend a link's expiration
**When** I update the expiration setting
**Then** the link remains valid for the new duration

---

### Story 9.4: Public Prototype Viewer (No Authentication)

As an **external stakeholder**,
I want to **view a shared prototype without creating an account**,
So that **I can quickly evaluate the idea without barriers**.

**Acceptance Criteria:**

**Given** I receive a public prototype link
**When** I open it in my browser
**Then** I can view the prototype without logging in
**And** the prototype loads in Sandpack correctly
**And** I can interact with it (navigation, forms, buttons)

**Given** the link requires a password
**When** I enter the correct password
**Then** I gain access to the prototype

**Given** the link is expired
**When** I try to access it
**Then** I see an error page indicating the link is no longer valid

---

### Story 9.5: Revoke Public Access

As a **user**,
I want to **revoke public access to a shared prototype**,
So that **I can stop external viewing when needed**.

**Acceptance Criteria:**

**Given** I have shared a prototype publicly
**When** I navigate to sharing settings
**Then** I see a "Revoke Public Access" button

**Given** I click "Revoke Public Access"
**When** confirmed
**Then** the public link is invalidated
**And** anyone trying to access it sees an "access revoked" message

**Given** I want to re-enable public sharing
**When** I generate a new public link
**Then** a new token/URL is created

---

## Epic 10: Prototype API Integration Layer

**Goal:** Users can create prototypes that make real API calls, including AI integration, with mock support.

### Story 10.1: API Configuration Interface

As a **user**,
I want to **configure API endpoints for my prototype**,
So that **the prototype can make real backend calls or use mocks**.

**Acceptance Criteria:**

**Given** I am viewing my prototype
**When** I open "API Configuration"
**Then** I see a list of configurable endpoints

**Given** I configure an endpoint
**When** I enter: Name, URL, Method, Headers
**Then** the configuration is saved
**And** the prototype can reference this endpoint by name

---

### Story 10.2: Mock API Response System

As a **user**,
I want to **define mock responses for API calls**,
So that **I can test my prototype without a real backend**.

**Acceptance Criteria:**

**Given** I configured an API endpoint
**When** I enable "Mock Mode"
**Then** I can define a mock response (JSON)

**Given** mock mode is enabled
**When** the prototype makes an API call
**Then** it receives the mock response instead of calling the real endpoint
**And** the response is returned instantly

---

### Story 10.3: Real API Calls from Prototypes

As a **user**,
I want to **have my prototype make real API calls**,
So that **I can demonstrate integration with actual services**.

**Acceptance Criteria:**

**Given** I configured an API endpoint with a real URL
**When** mock mode is disabled
**Then** the prototype makes real HTTP requests to the configured endpoint

**Given** the API call succeeds
**When** data is returned
**Then** the prototype displays the data
**And** I can test real-world interactions

**Given** the API call fails (network error, 404, etc.)
**When** the error occurs
**Then** the prototype handles it gracefully
**And** shows an appropriate error message

---

### Story 10.4: AI API Integration in Prototypes

As a **user**,
I want to **integrate AI API calls into my prototype**,
So that **I can demonstrate dynamic, AI-powered features**.

**Acceptance Criteria:**

**Given** my prototype needs AI functionality
**When** I configure an AI endpoint (Gemini API)
**Then** the prototype can make AI API calls from the client

**Given** the prototype makes an AI call
**When** the user triggers it (e.g., clicking "Generate Description")
**Then** the AI processes the request
**And** the response is displayed in the prototype
**And** the interaction feels real-time

**Given** AI API calls require authentication
**When** configuring the endpoint
**Then** I can securely provide API keys
**And** keys are not exposed in the prototype code

---

### Story 10.5: API Call Monitoring & Debugging

As a **user**,
I want to **see logs of API calls made by my prototype**,
So that **I can debug issues and verify integrations work correctly**.

**Acceptance Criteria:**

**Given** my prototype makes API calls
**When** I open the API monitor
**Then** I see a list of all requests made
**And** each shows: Endpoint, Method, Status Code, Response Time

**Given** I click on a logged API call
**When** the detail view opens
**Then** I see full request headers, body
**And** I see full response headers, body
**And** I can identify errors or unexpected responses
