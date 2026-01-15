---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
status: 'complete'
completedAt: '2026-01-13'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
workflowType: 'epics-and-stories'
project_name: 'IdeaSpark'
user_name: 'Ben.akiva'
date: '2026-01-13'
---

# IdeaSpark - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for IdeaSpark, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

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

**Prototype Generation & Refinement (FR27-FR34)**
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

### NonFunctional Requirements

**Performance (NFR-P1 to NFR-P6)**
- NFR-P1: Page Load Performance - All application pages load within 3 seconds on a standard broadband connection
- NFR-P2: User Interaction Responsiveness - User interactions respond within 100 milliseconds, loading indicators appear immediately
- NFR-P3: Prototype Generation Speed - React prototype generation completes within 30 seconds from PRD completion
- NFR-P4: AI Response Time - Idea enhancement <5 seconds, PRD assistant responses <3 seconds, prototype refinement <10 seconds
- NFR-P5: Real-Time Updates - Dashboard updates <500ms latency, auto-save completes <1 second without interruption
- NFR-P6: Concurrent User Support - Maintains performance with 1-2 concurrent users, <20% degradation with up to 5 users

**Security (NFR-S1 to NFR-S5)**
- NFR-S1: Authentication Security - Passwords hashed with bcrypt, session tokens expire appropriately, secure password reset tokens
- NFR-S2: Data Access Control - RLS enforces User vs Admin permissions at database level, users access only their own data, admin actions logged
- NFR-S3: Data Transmission Security - All client-server communication uses HTTPS, API keys stored securely, no sensitive config exposed to client
- NFR-S4: Data Storage Security - Supabase RLS policies enforce data access rules, credentials in environment variables, data encrypted at rest
- NFR-S5: API Security - External API calls include authentication and rate limiting, errors fail gracefully, API keys rotatable without code changes

**Scalability (NFR-SC1 to NFR-SC3)**
- NFR-SC1: Initial Scale Target - System optimized for 1-2 concurrent users, database schema supports this scale
- NFR-SC2: Growth Path - Architecture supports 10-20 concurrent users with configuration changes only, database handles 100+ stored items
- NFR-SC3: Resource Efficiency - Appropriate database indexing, efficient file storage, optimized API calls to minimize unnecessary requests

**Integration Reliability (NFR-I1 to NFR-I4)**
- NFR-I1: AI Integration Reliability - Gemini API includes retry logic (3 retries), clear error messages when unavailable, graceful degradation allows manual continuation
- NFR-I2: Prototype Generation Reliability - Open-lovable integration includes 60-second timeout, clear user feedback with retry option, PRD data preserved on failure
- NFR-I3: Database Reliability - Supabase connection includes automatic reconnection, transactions maintain consistency, auto-save failures communicated to users
- NFR-I4: External Service Monitoring - All API calls logged (success/failure), admin dashboard displays integration health, error logs include troubleshooting detail

**Browser & Device Compatibility (NFR-BC1 to NFR-BC3)**
- NFR-BC1: Browser Support - Full functionality in latest 2 versions of Chrome, Firefox, Safari, Edge; graceful degradation for older browsers
- NFR-BC2: Responsive Design - UI adapts to desktop (1920x1080), tablet (768x1024), mobile (375x667); touch interactions work correctly; all core workflows functional on all sizes
- NFR-BC3: Visual Consistency - PassportCard DaisyUI theme (#e10514 red) renders consistently across all supported browsers; typography, spacing maintain consistency

### Additional Requirements

**From Architecture - Starter Template (CRITICAL for Epic 1 Story 1):**
- Initialize project using Vite + React + TypeScript template: `npm create vite@latest ideaspark -- --template react-ts`
- Install core dependencies: tailwindcss@latest, @tailwindcss/vite@latest, daisyui@latest, @supabase/supabase-js, react-router-dom, zustand, @tanstack/react-query, zod, react-hook-form, @hookform/resolvers

**From Architecture - Infrastructure Requirements:**
- Set up Supabase project with PostgreSQL database
- Create database migrations for tables: users, ideas, prd_documents, prototypes, prd_messages
- Configure Supabase Row Level Security (RLS) policies for User and Admin roles
- Create Supabase Edge Functions for: gemini-enhance, gemini-prd-chat, prototype-generate
- Deploy frontend to Vercel (free tier)
- Configure environment variables for all API keys

**From Architecture - Integration Requirements:**
- Gemini 2.5 Flash API integration for idea enhancement and PRD conversational guidance
- Open-Lovable (self-hosted, MIT license) for React prototype generation with PassportCard DaisyUI theme
- Firecrawl API for Open-Lovable web scraping capabilities
- All external API keys protected via Supabase Edge Functions (server-side only)

**From Architecture - Technical Standards:**
- Feature-based folder structure (features/auth, features/ideas, features/prd, features/prototypes, features/admin)
- Zustand for client-side global state, React Query for server state management
- Zod schemas for validation with React Hook Form integration
- Service layer abstraction for all external API calls
- TypeScript strict mode enabled
- Naming conventions: snake_case (database), camelCase (TypeScript), PascalCase (components)

**From UX Design - Interaction Requirements:**
- Desktop-first design with fully responsive mobile layouts
- Touch-friendly interactions for mobile (thumb-zone optimized)
- Real-time auto-save during PRD development (eliminate fear of losing work)
- Live PRD building where users see document structure emerge as they answer AI questions
- Progress indicators during prototype generation (visible status, reduce anxiety)
- PassportCard DaisyUI theme: #E10514 primary red, 20px border radius, Montserrat/Rubik fonts
- Conversational AI guidance that feels like chatting with a helpful colleague (not robotic interrogation)
- Empty states with clear calls-to-action
- Error states with recovery options

**From UX Design - Accessibility Requirements:**
- Touch target minimum 44px for mobile interactions
- Color contrast meets WCAG 2.1 AA standards
- Keyboard navigation support for all interactive elements
- Loading states and progress indicators for all async operations

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | User registration with email/password |
| FR2 | Epic 1 | User login |
| FR3 | Epic 1 | Password reset via email |
| FR4 | Epic 1 | User logout |
| FR5 | Epic 5 | Admin view user list |
| FR6 | Epic 1 | Role-based access control (User vs Admin) |
| FR7 | Epic 2 | 4-step idea submission wizard |
| FR8 | Epic 2 | Describe problem |
| FR9 | Epic 2 | Describe solution |
| FR10 | Epic 2 | Describe impact |
| FR11 | Epic 2 | Review submission before submit |
| FR12 | Epic 2 | AI enhancement with Gemini |
| FR13 | Epic 2 | View own submitted ideas |
| FR14 | Epic 2 | See idea status |
| FR15 | Epic 2 | View own idea details |
| FR16 | Epic 5 | Admin view all ideas |
| FR17 | Epic 5 | Admin filter/sort ideas |
| FR18 | Epic 3 | Conversational PRD building with AI |
| FR19 | Epic 3 | AI asks contextual questions |
| FR20 | Epic 3 | User provides natural language answers |
| FR21 | Epic 3 | Real-time PRD section generation |
| FR22 | Epic 3 | PRD includes all required sections |
| FR23 | Epic 3 | Live PRD building visualization |
| FR24 | Epic 3 | Auto-save PRD progress |
| FR25 | Epic 3 | Mark PRD as complete |
| FR26 | Epic 3 | View completed PRDs |
| FR27 | Epic 4 | Auto-generate React prototype |
| FR28 | Epic 4 | PassportCard DaisyUI theme enforcement |
| FR29 | Epic 4 | Responsive prototypes |
| FR30 | Epic 4 | View prototype in browser |
| FR31 | Epic 4 | Chat-based prototype refinement |
| FR32 | Epic 4 | Regenerate prototype on refinement |
| FR33 | Epic 4 | Shareable prototype URLs |
| FR34 | Epic 4 | View refinement history |
| FR35 | Epic 5 | Admin innovation dashboard |
| FR36 | Epic 5 | Ideas organized by pipeline stage |
| FR37 | Epic 5 | Approve ideas for PRD phase |
| FR38 | Epic 5 | Reject ideas with feedback |
| FR39 | Epic 5 | View any user's idea/PRD/prototype |
| FR40 | Epic 5 | Status updates on admin actions |
| FR41 | Epic 6 | Total submitted ideas count |
| FR42 | Epic 6 | Ideas breakdown by pipeline stage |
| FR43 | Epic 6 | Completion rates metrics |
| FR44 | Epic 6 | Time-to-decision metrics |
| FR45 | Epic 6 | User activity overview |
| FR46 | Epic 2 | Gemini 2.5 Flash API integration |
| FR47 | Epic 4 | Open-lovable API integration |
| FR48 | Epic 1 | Supabase data storage |
| FR49 | Epic 1 | Data security via RBAC |
| FR50 | Epic 1 | PassportCard-branded UI |

## Epic List

### Epic 1: Project Foundation & User Authentication
**Goal:** Users can register, log in, and access a secure, branded IdeaSpark application.

This epic establishes the complete technical foundation (per Architecture's starter template) AND delivers the first user value: secure access to the platform with PassportCard branding.

**FRs covered:** FR1, FR2, FR3, FR4, FR6, FR48, FR49, FR50

**Additional Requirements:**
- Starter template initialization (Vite + React + TypeScript)
- Supabase project setup with PostgreSQL database
- Database migrations for core tables
- Row Level Security (RLS) policies
- PassportCard DaisyUI theme configuration
- Environment variables and deployment to Vercel

---

### Epic 2: Idea Submission with AI Enhancement
**Goal:** Users can submit ideas through a guided 4-step wizard and see their ideas enhanced by AI.

This is the entry point for innovation. Maya can capture her customer service insights in minutes, and AI makes them sound professional.

**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR46

**User Journey:** Submit idea → AI enhances → View my ideas

---

### Epic 3: AI-Powered PRD Development
**Goal:** Users can build professional PRDs through conversational AI guidance, with real-time document generation and auto-save.

This is the heart of IdeaSpark. Maya chats with an AI product manager, and a structured PRD emerges before her eyes.

**FRs covered:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26

**User Journey:** Open approved idea → Chat with AI → Watch PRD build → Mark complete

---

### Epic 4: Prototype Generation & Refinement
**Goal:** Users can generate PassportCard-branded React prototypes from their PRDs and refine them through chat.

This is the "Aha Moment" - Maya's PRD becomes a working prototype in 30 seconds. She can refine it by chatting.

**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR47

**User Journey:** Mark PRD complete → Prototype generates → Refine via chat → Share URL

---

### Epic 5: Admin Pipeline & Triage Workflow
**Goal:** Admins (Sarah) can view all ideas, approve/reject submissions, and manage the innovation pipeline efficiently.

Sarah finally has visibility into the chaos. She can triage ideas, approve for PRD phase, and see everything in one place.

**FRs covered:** FR5, FR16, FR17, FR35, FR36, FR37, FR38, FR39, FR40

**User Journey:** View all ideas → Filter/sort → Approve or reject → Track pipeline

---

### Epic 6: Analytics & Innovation Metrics
**Goal:** Admins can view innovation metrics including submission counts, pipeline breakdown, completion rates, and time-to-decision.

Sarah can finally show executives real innovation metrics - for the first time, innovation is measurable.

**FRs covered:** FR41, FR42, FR43, FR44, FR45

**User Journey:** View dashboard → See metrics → Generate insights → Report to executives

---

## Epic 1: Project Foundation & User Authentication

**Goal:** Users can register, log in, and access a secure, branded IdeaSpark application.

### Story 1.1: Initialize Project with Vite and Core Dependencies

As a **developer**,
I want **the project initialized with Vite, React, TypeScript, and all core dependencies**,
So that **I have a working foundation to build IdeaSpark**.

**Acceptance Criteria:**

**Given** a new project directory
**When** I run the initialization commands
**Then** the project is created with Vite + React + TypeScript
**And** Tailwind CSS 4.x and DaisyUI 5.x are installed and configured
**And** Supabase client, React Router, Zustand, React Query, Zod, and React Hook Form are installed
**And** the development server starts successfully with hot reload working
**And** the project structure follows the architecture specification (features/, components/ui/, services/, etc.)

---

### Story 1.2: Configure PassportCard DaisyUI Theme

As a **user**,
I want **the application styled with PassportCard's brand identity**,
So that **the platform feels professional and consistent with company standards**.

**Acceptance Criteria:**

**Given** the initialized project
**When** I view any page in the application
**Then** the primary color is PassportCard red (#E10514)
**And** DaisyUI components use the custom theme configuration
**And** border radius is set to 20px per design spec
**And** Montserrat and Rubik fonts are loaded and applied correctly
**And** the theme renders consistently across Chrome, Firefox, Safari, and Edge

---

### Story 1.3: Set Up Supabase Project and Database Schema

As a **developer**,
I want **Supabase configured with the users table and authentication**,
So that **user data can be stored securely and authentication works**.

**Acceptance Criteria:**

**Given** a new Supabase project
**When** I run the database migrations
**Then** the `users` table is created with columns: id, email, role (user/admin), created_at, updated_at
**And** Supabase Auth is configured for email/password authentication
**And** Row Level Security (RLS) is enabled on the users table
**And** environment variables are configured for Supabase URL and anon key
**And** the Supabase client connects successfully from the frontend

---

### Story 1.4: User Registration Flow

As a **new user**,
I want **to register for an account with my email and password**,
So that **I can access IdeaSpark and start submitting ideas**.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter a valid email and password (min 8 characters)
**Then** my account is created in Supabase Auth
**And** a user record is created in the users table with role "user"
**And** I am automatically logged in and redirected to the dashboard
**And** I see a success message confirming registration

**Given** I enter an email that's already registered
**When** I submit the registration form
**Then** I see an error message "This email is already registered"
**And** the form remains on the page with my email preserved

**Given** I enter an invalid email or weak password
**When** I submit the form
**Then** I see specific validation errors explaining the issue
**And** the form is not submitted

---

### Story 1.5: User Login Flow

As a **registered user**,
I want **to log in with my email and password**,
So that **I can access my ideas and continue working**.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I enter valid credentials
**Then** I am authenticated and redirected to the dashboard
**And** my session is persisted (survives page refresh)

**Given** I enter incorrect credentials
**When** I submit the login form
**Then** I see an error message "Invalid email or password"
**And** the form allows me to try again

**Given** I am already logged in
**When** I navigate to the login page
**Then** I am automatically redirected to the dashboard

---

### Story 1.6: User Logout and Session Management

As a **logged-in user**,
I want **to log out of the application**,
So that **my account is secure when I'm done**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I click the logout button
**Then** my session is terminated
**And** I am redirected to the login page
**And** I cannot access protected pages without logging in again

**Given** my session token expires
**When** I try to access a protected page
**Then** I am redirected to the login page
**And** I see a message indicating my session expired

---

### Story 1.7: Password Reset Flow

As a **user who forgot my password**,
I want **to reset my password via email**,
So that **I can regain access to my account**.

**Acceptance Criteria:**

**Given** I am on the password reset page
**When** I enter my registered email
**Then** a password reset email is sent via Supabase Auth
**And** I see a confirmation message "Check your email for reset instructions"

**Given** I click the reset link in my email
**When** I enter a new password (min 8 characters)
**Then** my password is updated
**And** I am redirected to login with a success message

**Given** I enter an unregistered email
**When** I submit the reset request
**Then** I still see the same confirmation message (security best practice)

---

### Story 1.8: Protected Routes and Role-Based Access

As the **system**,
I want **to enforce authentication and role-based access control**,
So that **users can only access pages they're authorized for**.

**Acceptance Criteria:**

**Given** I am not logged in
**When** I try to access any protected route (dashboard, ideas, etc.)
**Then** I am redirected to the login page

**Given** I am logged in as a regular user
**When** I try to access admin-only routes
**Then** I see a "Not authorized" message or am redirected

**Given** I am logged in as an admin
**When** I navigate to admin routes
**Then** I can access all admin functionality

**And** RLS policies enforce data access at the database level (users can only see their own data, admins see all)

---

### Story 1.9: Application Shell and Navigation

As a **user**,
I want **a consistent navigation layout with header and sidebar**,
So that **I can easily move around the application**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I view any page
**Then** I see a header with the IdeaSpark logo and user menu
**And** I see navigation links appropriate for my role
**And** the layout is responsive (collapses to mobile menu on small screens)
**And** the current page is highlighted in the navigation
**And** the UI uses PassportCard DaisyUI theme consistently

---

### Story 1.10: Deploy to Vercel

As a **developer**,
I want **the application deployed to Vercel**,
So that **it's accessible via a public URL for demo and testing**.

**Acceptance Criteria:**

**Given** the project is connected to GitHub
**When** I push to the main branch
**Then** Vercel automatically builds and deploys the application
**And** environment variables are configured in Vercel dashboard
**And** the deployed app connects to Supabase successfully
**And** all authentication flows work in production

---

## Epic 2: Idea Submission with AI Enhancement

**Goal:** Users can submit ideas through a guided 4-step wizard and see their ideas enhanced by AI.

### Story 2.1: Create Ideas Database Table and Service Layer

As a **developer**,
I want **the ideas table created with proper schema and service layer**,
So that **idea data can be stored and retrieved**.

**Acceptance Criteria:**

**Given** the Supabase project is set up
**When** I run the database migration
**Then** the `ideas` table is created with columns: id, user_id, title, problem, solution, impact, enhanced_problem, enhanced_solution, enhanced_impact, status (enum: submitted, approved, prd_development, prototype_complete, rejected), created_at, updated_at
**And** RLS policies are configured so users can only see their own ideas
**And** admins can see all ideas
**And** the ideaService is created with CRUD operations following the architecture patterns

---

### Story 2.2: Idea Wizard - Step 1 Problem Definition

As a **user**,
I want **to describe the problem I'm trying to solve**,
So that **my idea starts with a clear problem statement**.

**Acceptance Criteria:**

**Given** I am logged in and on the "New Idea" page
**When** I click "Start New Idea"
**Then** I see Step 1 of 4: "What problem are you trying to solve?"
**And** I see a text area with placeholder text guiding me
**And** I see a character counter (minimum 50 characters required)
**And** I can click "Next" only when minimum characters are entered
**And** a progress indicator shows I'm on step 1 of 4

**Given** I enter less than 50 characters
**When** I try to proceed
**Then** I see a validation message encouraging more detail

---

### Story 2.3: Idea Wizard - Step 2 Solution Description

As a **user**,
I want **to describe my proposed solution**,
So that **reviewers understand what I'm suggesting**.

**Acceptance Criteria:**

**Given** I completed Step 1
**When** I proceed to Step 2
**Then** I see "What's your proposed solution?"
**And** I see my problem statement displayed for context
**And** I see a text area for my solution (minimum 50 characters)
**And** I can navigate back to Step 1 without losing data
**And** the progress indicator shows step 2 of 4

---

### Story 2.4: Idea Wizard - Step 3 Impact Assessment

As a **user**,
I want **to describe the expected impact of my idea**,
So that **reviewers understand the potential value**.

**Acceptance Criteria:**

**Given** I completed Step 2
**When** I proceed to Step 3
**Then** I see "What impact will this have?"
**And** I see guidance prompts (e.g., "Who benefits?", "What metrics improve?")
**And** I see a text area for impact description (minimum 30 characters)
**And** I can navigate back to previous steps without losing data
**And** the progress indicator shows step 3 of 4

---

### Story 2.5: Idea Wizard - Step 4 Review and AI Enhancement

As a **user**,
I want **to review my complete idea and see AI enhancements**,
So that **I can submit a polished, professional proposal**.

**Acceptance Criteria:**

**Given** I completed Steps 1-3
**When** I proceed to Step 4
**Then** I see all my inputs displayed in a review format
**And** I see a "Enhance with AI" button
**And** I can edit any section by clicking on it
**And** the progress indicator shows step 4 of 4

**Given** I click "Enhance with AI"
**When** the AI processes my idea
**Then** I see a loading indicator
**And** within 5 seconds, I see enhanced versions of my problem, solution, and impact
**And** I can compare original vs enhanced text
**And** I can choose to use the enhanced version or keep original for each section

---

### Story 2.6: Gemini Edge Function for Idea Enhancement

As a **developer**,
I want **a Supabase Edge Function that calls Gemini API to enhance ideas**,
So that **API keys are protected and AI enhancement works**.

**Acceptance Criteria:**

**Given** a user submits their idea for enhancement
**When** the Edge Function receives the request
**Then** it calls Gemini 2.5 Flash API with a prompt to enhance clarity and professionalism
**And** the API key is stored securely in environment variables
**And** the function returns enhanced text for problem, solution, and impact
**And** errors are handled gracefully with retry logic (up to 3 retries)
**And** if AI fails, user can proceed with original text

---

### Story 2.7: Submit Idea and Save to Database

As a **user**,
I want **to submit my idea after review**,
So that **it enters the innovation pipeline**.

**Acceptance Criteria:**

**Given** I am on Step 4 Review
**When** I click "Submit Idea"
**Then** the idea is saved to the database with status "submitted"
**And** I see a success message with confirmation
**And** I am redirected to my ideas list
**And** the new idea appears at the top of my list

**Given** submission fails (network error, etc.)
**When** I try to submit
**Then** I see a clear error message
**And** my data is preserved so I can retry

---

### Story 2.8: My Ideas List View

As a **user**,
I want **to see a list of all my submitted ideas**,
So that **I can track their progress**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to "My Ideas"
**Then** I see a list of all my ideas sorted by newest first
**And** each idea shows: title (first 50 chars of problem), status badge, submission date
**And** status badges are color-coded (submitted=gray, approved=blue, prd_development=yellow, prototype_complete=green, rejected=red)
**And** I can click on any idea to view details

**Given** I have no ideas
**When** I view My Ideas
**Then** I see an empty state with "Submit your first idea" call-to-action

---

### Story 2.9: Idea Detail View

As a **user**,
I want **to view the full details of my idea**,
So that **I can see what I submitted and its current status**.

**Acceptance Criteria:**

**Given** I click on an idea in my list
**When** the detail page loads
**Then** I see the complete idea: problem, solution, impact (both original and enhanced if applicable)
**And** I see the current status prominently displayed
**And** I see submission date and any status change dates
**And** I see a clear next step message based on status (e.g., "Waiting for review" or "Ready to build PRD")

**Given** my idea is approved for PRD development
**When** I view the detail page
**Then** I see a prominent "Build PRD" button

---

## Epic 3: AI-Powered PRD Development

**Goal:** Users can build professional PRDs through conversational AI guidance, with real-time document generation and auto-save.

### Story 3.1: Create PRD Database Tables and Service Layer

As a **developer**,
I want **the PRD-related tables created with proper schema and service layer**,
So that **PRD data and chat history can be stored and retrieved**.

**Acceptance Criteria:**

**Given** the Supabase project is set up
**When** I run the database migrations
**Then** the `prd_documents` table is created with columns: id, idea_id, user_id, content (JSONB for structured sections), status (draft/complete), created_at, updated_at
**And** the `prd_messages` table is created with columns: id, prd_id, role (user/assistant), content, created_at
**And** RLS policies are configured so users can only see their own PRDs
**And** the prdService is created with CRUD operations following the architecture patterns

---

### Story 3.2: PRD Builder Page Layout

As a **user**,
I want **a dedicated PRD building interface with chat and document preview**,
So that **I can see my PRD being built as I chat with the AI**.

**Acceptance Criteria:**

**Given** I have an approved idea and click "Build PRD"
**When** the PRD Builder page loads
**Then** I see a split-screen layout: chat interface on the left, PRD preview on the right
**And** the PRD preview shows empty section placeholders (Problem Statement, Goals, User Stories, Requirements, Technical Considerations, Risks, Timeline)
**And** I see my original idea summary at the top for context
**And** the layout is responsive (stacks vertically on mobile)
**And** a new PRD document is created in draft status

---

### Story 3.3: Gemini Edge Function for PRD Chat

As a **developer**,
I want **a Supabase Edge Function that powers the PRD conversational assistant**,
So that **AI can guide users through PRD development**.

**Acceptance Criteria:**

**Given** a user sends a message in the PRD chat
**When** the Edge Function receives the request
**Then** it includes the idea context, PRD progress, and conversation history in the Gemini prompt
**And** the AI responds with contextual questions or guidance
**And** the prompt instructs Gemini to be conversational like a helpful PM colleague
**And** the function returns both the AI message and any PRD content to add
**And** errors are handled gracefully with retry logic (up to 3 retries)
**And** responses return within 3 seconds

---

### Story 3.4: Chat Interface with AI Assistant

As a **user**,
I want **to have a natural conversation with the AI assistant**,
So that **I can develop my PRD through dialogue rather than form-filling**.

**Acceptance Criteria:**

**Given** I am on the PRD Builder page
**When** the AI starts the conversation
**Then** I see a welcome message acknowledging my idea and asking the first guiding question
**And** I can type responses in a chat input field
**And** my messages appear on the right, AI messages on the left
**And** I see a typing indicator while AI is responding
**And** the chat scrolls automatically to show new messages

**Given** I send a message
**When** the AI responds
**Then** the response appears within 3 seconds
**And** the message is saved to prd_messages table
**And** I can continue the conversation naturally

---

### Story 3.5: Real-Time PRD Section Generation

As a **user**,
I want **to see PRD sections being populated as I chat**,
So that **I can see my document taking shape in real-time**.

**Acceptance Criteria:**

**Given** I am chatting with the AI assistant
**When** I provide information relevant to a PRD section
**Then** the AI extracts that information and populates the corresponding section in the preview
**And** newly updated sections are highlighted briefly to draw attention
**And** the PRD preview updates in real-time without page refresh
**And** sections show "In Progress" or "Complete" indicators

**Given** the AI asks about problem context
**When** I provide a detailed answer
**Then** the "Problem Statement" section updates with structured content
**And** the content is formatted professionally (not just my raw input)

---

### Story 3.6: PRD Auto-Save Functionality

As a **user**,
I want **my PRD progress saved automatically**,
So that **I never lose my work**.

**Acceptance Criteria:**

**Given** I am building a PRD
**When** PRD content changes or new messages are added
**Then** the document is auto-saved within 1 second
**And** I see a subtle "Saved" indicator that appears briefly
**And** saving happens without interrupting my work

**Given** I close the browser and return later
**When** I open my draft PRD
**Then** all my progress is restored (chat history and PRD content)
**And** the AI continues the conversation where we left off

**Given** auto-save fails
**When** the error occurs
**Then** I see a clear warning message
**And** I can manually trigger a save

---

### Story 3.7: PRD Section Structure and Content

As a **user**,
I want **my PRD to have all the standard sections filled out**,
So that **my document is comprehensive and professional**.

**Acceptance Criteria:**

**Given** I am building a PRD
**When** the AI guides me through the process
**Then** it covers all required sections: Problem Statement, Goals & Metrics, User Stories, Requirements, Technical Considerations, Risks, Timeline
**And** the AI asks relevant questions for each section
**And** I can see which sections are complete vs incomplete
**And** the AI suggests when we have enough for each section

**Given** I try to mark PRD as complete
**When** required sections are missing
**Then** I see which sections need more information
**And** I am guided to complete them

---

### Story 3.8: Mark PRD as Complete

As a **user**,
I want **to mark my PRD as complete when I'm satisfied**,
So that **I can proceed to prototype generation**.

**Acceptance Criteria:**

**Given** I have filled out all required PRD sections
**When** I click "Mark as Complete"
**Then** I see a confirmation dialog showing the PRD summary
**And** I can review the final document
**And** upon confirmation, the PRD status changes to "complete"
**And** the idea status updates to "prd_development" (or stays there if already)
**And** I see a "Generate Prototype" button appear

**Given** not all sections are complete
**When** I try to mark as complete
**Then** I see a message indicating which sections need attention

---

### Story 3.9: View Completed PRD

As a **user**,
I want **to view my completed PRD in a readable format**,
So that **I can review it or share it with others**.

**Acceptance Criteria:**

**Given** I have a completed PRD
**When** I view the PRD detail page
**Then** I see all sections rendered in a professional, readable format
**And** the document has proper headings, formatting, and structure
**And** I can see the original idea it was based on
**And** I see the completion date and status

**Given** I navigate from My Ideas to a completed PRD
**When** I click on an idea with status "prd_development" or later
**Then** I can access the "View PRD" link
**And** the PRD opens in view mode

---

## Epic 4: Prototype Generation & Refinement

**Goal:** Users can generate PassportCard-branded React prototypes from their PRDs and refine them through chat.

### Story 4.1: Create Prototypes Database Table and Service Layer

As a **developer**,
I want **the prototypes table created with proper schema and service layer**,
So that **prototype data and refinement history can be stored**.

**Acceptance Criteria:**

**Given** the Supabase project is set up
**When** I run the database migration
**Then** the `prototypes` table is created with columns: id, prd_id, idea_id, user_id, url, code (text), version, refinement_prompt, status (generating/ready/failed), created_at
**And** RLS policies are configured so users can only see their own prototypes
**And** the prototypeService is created with CRUD operations following the architecture patterns
**And** multiple versions can exist per PRD (for refinement history)

---

### Story 4.2: Open-Lovable Edge Function for Prototype Generation

As a **developer**,
I want **a Supabase Edge Function that calls Open-Lovable to generate prototypes**,
So that **API keys are protected and prototype generation works**.

**Acceptance Criteria:**

**Given** a user triggers prototype generation
**When** the Edge Function receives the request
**Then** it sends the PRD content to the self-hosted Open-Lovable instance
**And** the prompt enforces PassportCard DaisyUI theme (#E10514, 20px radius, Montserrat/Rubik fonts)
**And** API keys (Gemini for Open-Lovable LLM, Firecrawl) are stored securely
**And** the function returns the generated prototype code and URL
**And** timeout is set to 60 seconds with appropriate error handling
**And** generation progress can be polled

---

### Story 4.3: Trigger Prototype Generation from Completed PRD

As a **user**,
I want **to generate a prototype when my PRD is complete**,
So that **I can see my idea come to life visually**.

**Acceptance Criteria:**

**Given** I have a completed PRD
**When** I click "Generate Prototype"
**Then** I see a progress indicator showing generation status
**And** the progress shows stages (e.g., "Analyzing PRD...", "Generating code...", "Building preview...")
**And** prototype generation completes within 30 seconds
**And** upon completion, I see my prototype automatically

**Given** generation fails
**When** an error occurs
**Then** I see a clear error message explaining the issue
**And** I can retry generation
**And** my PRD data is preserved

---

### Story 4.4: Prototype Viewer with Responsive Preview

As a **user**,
I want **to view my generated prototype in the browser**,
So that **I can see how my idea looks as a real application**.

**Acceptance Criteria:**

**Given** my prototype is generated
**When** I view the prototype page
**Then** I see the prototype rendered in an iframe or embedded viewer
**And** I can toggle between desktop, tablet, and mobile preview sizes
**And** the prototype uses PassportCard branding (#E10514 red) throughout
**And** I can interact with the prototype (click buttons, navigate)
**And** the viewer has device frame indicators showing current viewport

**Given** I switch to mobile preview
**When** the viewport changes
**Then** the prototype responds correctly (if built responsively)
**And** I can see how it would look on a phone

---

### Story 4.5: Chat-Based Prototype Refinement

As a **user**,
I want **to refine my prototype through natural language chat**,
So that **I can iterate on the design without technical knowledge**.

**Acceptance Criteria:**

**Given** I am viewing my prototype
**When** I type a refinement request (e.g., "Make the header larger" or "Add a sidebar")
**Then** the request is sent to Open-Lovable for processing
**And** I see a loading indicator during generation
**And** the updated prototype appears within 10 seconds
**And** a new version is saved to the database

**Given** I make multiple refinements
**When** each refinement completes
**Then** the prototype updates in place
**And** I can see immediate results of my changes

---

### Story 4.6: Prototype Refinement History

As a **user**,
I want **to see the history of my prototype refinements**,
So that **I can go back to previous versions if needed**.

**Acceptance Criteria:**

**Given** I have made refinements to my prototype
**When** I view the refinement history
**Then** I see a list of all versions with timestamps
**And** each version shows the refinement prompt that created it
**And** I can click on any version to preview it
**And** I can set any previous version as the "current" version

**Given** I select a previous version
**When** I click "Restore this version"
**Then** that version becomes the active prototype
**And** a new version entry is created (so history is preserved)

---

### Story 4.7: Shareable Prototype URLs

As a **user**,
I want **to share my prototype with others via URL**,
So that **colleagues and stakeholders can view my idea**.

**Acceptance Criteria:**

**Given** I have a generated prototype
**When** I click "Share"
**Then** I see a shareable URL that I can copy
**And** the URL works without requiring login (public access)
**And** the shared view shows the prototype with PassportCard branding
**And** the shared view includes a header showing it's an IdeaSpark prototype

**Given** someone opens my shared URL
**When** the page loads
**Then** they see my prototype in a clean viewer
**And** they can toggle device sizes (desktop/tablet/mobile)
**And** they cannot edit or refine (view only)

---

### Story 4.8: Prototype Status Integration with Idea

As a **user**,
I want **my idea status to update when prototype is generated**,
So that **I can track progress through the innovation pipeline**.

**Acceptance Criteria:**

**Given** I generate a prototype successfully
**When** generation completes
**Then** my idea status updates to "prototype_complete"
**And** this is reflected in My Ideas list
**And** admins can see the updated status in their dashboard

**Given** I view my idea detail
**When** a prototype exists
**Then** I see a "View Prototype" link
**And** I can navigate directly to the prototype viewer

---

## Epic 5: Admin Pipeline & Triage Workflow

**Goal:** Admins (Sarah) can view all ideas, approve/reject submissions, and manage the innovation pipeline efficiently.

### Story 5.1: Admin Dashboard Layout

As an **admin**,
I want **a dedicated admin dashboard with pipeline overview**,
So that **I can see the entire innovation pipeline at a glance**.

**Acceptance Criteria:**

**Given** I am logged in as an admin
**When** I navigate to the Admin Dashboard
**Then** I see a summary of ideas by status (submitted, approved, prd_development, prototype_complete)
**And** I see count cards for each pipeline stage
**And** I see a list of recent submissions requiring attention
**And** the dashboard uses PassportCard branding consistently
**And** regular users cannot access this page (redirected or shown "Not authorized")

---

### Story 5.2: All Ideas List with Filtering and Sorting

As an **admin**,
I want **to view all ideas submitted by all users with filtering options**,
So that **I can efficiently find and manage ideas**.

**Acceptance Criteria:**

**Given** I am on the Admin Dashboard
**When** I navigate to "All Ideas"
**Then** I see a list of all ideas from all users
**And** each idea shows: title, submitter name, status, submission date
**And** I can filter by status (submitted, approved, prd_development, prototype_complete, rejected)
**And** I can sort by date (newest/oldest) or status
**And** I can search by keyword in the idea title/problem

**Given** I apply filters
**When** the list updates
**Then** only matching ideas are shown
**And** I can clear filters to see all ideas again

---

### Story 5.3: Idea Pipeline Kanban View

As an **admin**,
I want **to see ideas organized by pipeline stage in a visual board**,
So that **I can track the flow of innovation visually**.

**Acceptance Criteria:**

**Given** I am on the Admin Dashboard
**When** I select "Pipeline View"
**Then** I see a kanban-style board with columns: Submitted, Approved, PRD Development, Prototype Complete
**And** ideas appear as cards in their respective columns
**And** each card shows idea title, submitter, and days in stage
**And** I can click on any card to see full details
**And** the view updates in real-time when statuses change

---

### Story 5.4: Approve Idea for PRD Development

As an **admin**,
I want **to approve submitted ideas for PRD development**,
So that **promising ideas can progress in the pipeline**.

**Acceptance Criteria:**

**Given** I am viewing a submitted idea
**When** I click "Approve for PRD"
**Then** I see a confirmation dialog
**And** upon confirmation, the idea status changes to "approved"
**And** the idea creator can now start building a PRD
**And** a timestamp is recorded for the approval
**And** the idea moves to the "Approved" column in pipeline view

**Given** I approve an idea from the list view
**When** I click the approve action button
**Then** the idea is approved without leaving the list
**And** the status badge updates immediately

---

### Story 5.5: Reject Idea with Feedback

As an **admin**,
I want **to reject ideas that aren't suitable with constructive feedback**,
So that **submitters understand why and can improve future submissions**.

**Acceptance Criteria:**

**Given** I am viewing a submitted idea
**When** I click "Reject"
**Then** I see a dialog prompting for rejection feedback (required, min 20 chars)
**And** I can enter constructive feedback explaining the decision
**And** upon submission, the idea status changes to "rejected"
**And** the feedback is stored with the idea

**Given** a user views their rejected idea
**When** the detail page loads
**Then** they see the rejection reason prominently displayed
**And** they can understand why the idea wasn't approved

---

### Story 5.6: View Any User's Idea, PRD, and Prototype

As an **admin**,
I want **to view the complete details of any user's submission**,
So that **I can make informed decisions and track progress**.

**Acceptance Criteria:**

**Given** I am an admin viewing the ideas list
**When** I click on any idea
**Then** I see the full idea details (problem, solution, impact - original and enhanced)
**And** I see the submitter's name and submission history
**And** if a PRD exists, I can click through to view it
**And** if a prototype exists, I can click through to view it
**And** I can see the complete journey: idea → PRD → prototype

---

### Story 5.7: User List and Activity Overview

As an **admin**,
I want **to see a list of all users and their activity**,
So that **I can understand who is contributing to innovation**.

**Acceptance Criteria:**

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

---

### Story 5.8: Real-Time Dashboard Updates

As an **admin**,
I want **the dashboard to update in real-time**,
So that **I always see the latest pipeline status**.

**Acceptance Criteria:**

**Given** I have the Admin Dashboard open
**When** a new idea is submitted by any user
**Then** the dashboard updates within 500ms
**And** the "Submitted" count increases
**And** the new idea appears in the recent submissions list

**Given** another admin approves or rejects an idea
**When** the action is taken
**Then** my dashboard reflects the change immediately
**And** I don't see stale data

---

## Epic 6: Analytics & Innovation Metrics

**Goal:** Admins can view innovation metrics including submission counts, pipeline breakdown, completion rates, and time-to-decision.

### Story 6.1: Analytics Dashboard Layout

As an **admin**,
I want **a dedicated analytics dashboard with visual metrics**,
So that **I can measure and report on innovation program performance**.

**Acceptance Criteria:**

**Given** I am logged in as an admin
**When** I navigate to "Analytics"
**Then** I see a dashboard with key metric cards and charts
**And** the layout is clean and visually appealing with PassportCard branding
**And** metrics load quickly (within 3 seconds)
**And** I see data refresh timestamp showing when metrics were last updated

---

### Story 6.2: Total Ideas Submitted Metric

As an **admin**,
I want **to see the total count of submitted ideas**,
So that **I can measure innovation program participation**.

**Acceptance Criteria:**

**Given** I am on the Analytics Dashboard
**When** the page loads
**Then** I see a prominent metric card showing total ideas submitted (all time)
**And** I see a trend indicator showing change from previous period (week/month)
**And** I can click on the metric to see a breakdown by time period

**Given** I select a date range filter
**When** I apply the filter
**Then** the total count updates to show ideas submitted in that range

---

### Story 6.3: Pipeline Stage Breakdown Chart

As an **admin**,
I want **to see ideas broken down by pipeline stage**,
So that **I can identify bottlenecks in the innovation flow**.

**Acceptance Criteria:**

**Given** I am on the Analytics Dashboard
**When** I view the pipeline breakdown section
**Then** I see a chart (bar or donut) showing ideas by status: submitted, approved, prd_development, prototype_complete, rejected
**And** each segment shows count and percentage
**And** I can hover/click for exact numbers
**And** the chart uses PassportCard brand colors

**Given** I look at the breakdown
**When** one stage has significantly more items
**Then** I can visually identify where ideas are getting stuck

---

### Story 6.4: Completion Rates Metrics

As an **admin**,
I want **to see conversion rates through the pipeline**,
So that **I can measure how effectively ideas progress**.

**Acceptance Criteria:**

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

---

### Story 6.5: Time-to-Decision Metrics

As an **admin**,
I want **to see average time metrics for the innovation pipeline**,
So that **I can measure and improve processing speed**.

**Acceptance Criteria:**

**Given** I am on the Analytics Dashboard
**When** I view the time metrics section
**Then** I see average times for:
  - Time from submission to approval/rejection
  - Time from approval to PRD completion
  - Time from PRD to prototype
  - Total time from idea to prototype (end-to-end)
**And** times are shown in human-readable format (hours/days)
**And** I can compare to target benchmarks (e.g., goal: < 5 days end-to-end)

**Given** average times are above target
**When** I view the metrics
**Then** I see a visual indicator (red/yellow) highlighting the delay

---

### Story 6.6: User Activity Overview

As an **admin**,
I want **to see which users are most active in the innovation program**,
So that **I can recognize contributors and identify engagement patterns**.

**Acceptance Criteria:**

**Given** I am on the Analytics Dashboard
**When** I view the user activity section
**Then** I see a summary: total users, active users (submitted idea in last 30 days)
**And** I see a leaderboard of top contributors (by ideas submitted)
**And** I can see recent submissions with submitter names

**Given** I want to see detailed user activity
**When** I click on a user in the leaderboard
**Then** I navigate to their user detail page showing all their submissions

---

### Story 6.7: Date Range Filtering for Analytics

As an **admin**,
I want **to filter analytics by date range**,
So that **I can analyze specific time periods**.

**Acceptance Criteria:**

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
