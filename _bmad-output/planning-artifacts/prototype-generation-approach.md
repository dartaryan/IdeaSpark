# Prototype Generation Approach - Technical Proposal

## Executive Summary

This document proposes a simplified approach to prototype generation in IdeaSpark. Instead of relying on an external service (Open Lovable), we will generate and display interactive prototypes directly within the IdeaSpark application.

---

## Current Situation

The original architecture planned to integrate with **Open Lovable** - an open-source tool that generates React applications from prompts. This approach requires:

- Running a separate Open Lovable instance (self-hosted)
- Managing additional infrastructure
- External API dependencies (Vercel Sandbox or E2B for hosting)
- Complex deployment and maintenance

---

## Proposed Approach

### Goal

Generate **concept prototypes** that:
- Display **within IdeaSpark** (not as external standalone websites)
- Function like a real application (interactive UI)
- Support **fullscreen viewing** for presentations
- Demonstrate the **idea/concept** to stakeholders (not production-ready apps)

### Technical Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PRD Content   │───▶│   Gemini API    │───▶│  React/HTML     │
│  (from builder) │    │  (code gen)     │    │  Code Output    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Display in     │◀───│   Save to DB    │
                       │  IdeaSpark      │    │  (prototypes)   │
                       └─────────────────┘    └─────────────────┘
```

### Key Simplifications

| Aspect | Original (Open Lovable) | Proposed (Embedded) |
|--------|-------------------------|---------------------|
| Infrastructure | Separate server required | None - runs in browser |
| External Services | Vercel Sandbox / E2B | None |
| Deployment | Complex | Simple |
| Cost | Additional API costs | Only Gemini API |
| User Experience | Redirect to external URL | Seamless in-app viewing |

---

## Technical Options

### Option 1: Simple iframe with srcdoc

**How it works:** Gemini generates a single HTML file with inline CSS/JS, displayed in an iframe.

**Pros:**
- Simplest implementation
- No additional dependencies
- Fast rendering

**Cons:**
- Limited interactivity (no real React runtime)
- Single-page only

**Best for:** Simple, static concept demos

---

### Option 2: Sandpack (CodeSandbox Component)

**How it works:** Use Sandpack (open-source from CodeSandbox) to render React code with full runtime support.

**Pros:**
- Full React interactivity
- Multiple files/components support
- Real-time code editing possible
- Hot reloading

**Cons:**
- Slightly more complex setup
- Additional npm dependency

**Best for:** Interactive, multi-page prototypes

---

### Option 3: Hybrid Approach

**How it works:** Start with Option 1 for MVP, migrate to Option 2 if more interactivity is needed.

**Pros:**
- Quick initial delivery
- Flexibility to evolve

---

## Product Decisions (Finalized)

### 1. **Interactivity Level**
**Decision:** FULL interactivity
- ✅ Clickable buttons/links with navigation
- ✅ Functional forms with real submissions
- ✅ State management within prototype
- ✅ Real API calls (including AI integration)

### 2. **Prototype Complexity**
**Decision:** Multi-page with full flows (3-5 key screens)
- Entry/landing screens
- Core functionality screens
- Success/confirmation states
- Settings/configuration as needed

### 3. **Code Editing**
**Decision:** INCLUDE code editing capability
- Users can view generated code
- Users can edit code in real-time
- Changes reflected immediately in preview
- Save edited versions

### 4. **State Persistence**
**Decision:** YES - persist state between sessions
- Prototype state saved to database
- Users can continue where they left off
- Support for multiple prototype versions

### 5. **Sharing**
**Decision:** PUBLIC sharing enabled
- Generate shareable public URLs
- Optional password protection
- Expiring links (configurable duration)
- Share with external stakeholders

### 6. **API Integration**
**Decision:** Support real API calls
- Mock API responses for testing
- Integration with real services (optional)
- AI API calls for dynamic content
- Configurable endpoints

---

## Updated Recommendation

**Implementation Approach:** Option 2 - Sandpack (Full-Featured)

This requires:
1. **Sandpack integration** with full React runtime
2. **Code editor component** (Monaco or CodeMirror)
3. **State persistence layer** (database + API)
4. **Public sharing system** (unique URLs, access control)
5. **API proxy/mock layer** for prototype API calls
6. **Multi-file support** (components, utils, config)

**Technical Complexity:** High
- Multiple components to build
- Security considerations for public sharing
- API integration layer
- State management across sessions

---

## Next Steps

### Immediate Actions:
1. ✅ **Product decisions finalized** - Full-featured approach confirmed
2. **Break down into implementation phases** - Create epics and stories
3. **Capture existing bugs** - Document current site issues
4. **Prioritize work** - Balance new features vs bug fixes
5. **Generate implementation tasks** - Structured workflow

### Work Breakdown Needed:
- **Epic 1:** Core Sandpack Integration (multi-page prototypes)
- **Epic 2:** Code Editor & Live Editing
- **Epic 3:** State Persistence System
- **Epic 4:** Public Sharing & Access Control
- **Epic 5:** API Integration Layer (mocks + real calls)
- **Epic 6:** Bug Fixes & Stability

### Risk Considerations:
- Significantly increased scope from original proposal
- Security implications for public sharing + code execution
- API cost considerations (especially AI calls from prototypes)
- Performance with persistent state + real-time editing

---

## Appendix: Current Database Schema

The `prototypes` table already supports storing generated code:

```sql
prototypes
├── id (uuid)
├── prd_id (uuid)
├── idea_id (uuid)
├── user_id (uuid)
├── code (text)          -- Generated React/HTML code
├── url (text)           -- Optional external URL (can be null)
├── status (enum)        -- generating, ready, failed
├── version (integer)
├── refinement_prompt (text)
└── created_at (timestamp)
```

No schema changes required for this approach.
