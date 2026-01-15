# Building IdeaForge: PassportCard's Internal Innovation Platform

**The insurance industry's fastest path from employee idea to working prototype runs through a three-phase platform combining AI-assisted PRD generation with visual prototyping.** This technical blueprint details how PassportCard can build an internal innovation system that transforms the way employees contribute ideas, develop specifications, and create visual mockups—all deployed on a modern React + Supabase + Mistral AI stack.

Traditional innovation programs fail because they create black holes: employees submit ideas that disappear into review committees, never to be seen again. IdeaForge solves this by creating transparency at every stage, AI assistance that makes specification writing effortless, and a visual playground that lets anyone build working prototypes without code.

---

## Platform architecture connects three distinct phases

The system architecture separates concerns into three interconnected phases, each with dedicated UI components, database structures, and AI integrations. Phase 1 handles idea capture and initial triage. Phase 2 transforms approved ideas into structured PRDs through guided AI conversations. Phase 3 provides a visual canvas for building interactive prototypes.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         IDEAFORGE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   PHASE 1    │───▶│   PHASE 2    │───▶│   PHASE 3    │              │
│  │ Idea Submit  │    │ PRD Builder  │    │  Playground  │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                   │                   │                       │
│         ▼                   ▼                   ▼                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SUPABASE BACKEND                              │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │   │
│  │  │  Auth   │  │   RLS   │  │Realtime │  │ Storage │            │   │
│  │  │  + SSO  │  │ Policies│  │  Subs   │  │ Buckets │            │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                   │                   │                       │
│         ▼                   ▼                   ▼                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    MISTRAL AI LAYER                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │Idea Enhance │  │PRD Assistant│  │  Component  │             │   │
│  │  │    Agent    │  │    Agent    │  │  Suggester  │             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    REACT FRONTEND                                │   │
│  │  Next.js 14 + TailwindCSS + DaisyUI + Puck Visual Builder       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology stack selection

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) | Server components, streaming, Vercel optimization |
| **Styling** | TailwindCSS + DaisyUI | Rapid development, consistent design system |
| **Visual Builder** | Puck | Purpose-built for React page builders, uses dnd-kit internally |
| **State Management** | Zustand + TanStack Query | Lightweight global state + server state caching |
| **Backend** | Supabase | Auth, database, real-time, storage in one platform |
| **AI** | Mistral Medium 3 | 90% of Claude performance at $0.40/$2 per million tokens |
| **Deployment** | Vercel | Edge functions, preview deployments, zero-config |

---

## Database schema enables multi-tenant innovation tracking

The schema design follows Supabase multi-tenant best practices with Row Level Security (RLS) policies that automatically scope all queries to the current user's organization. Every table includes `tenant_id` for data isolation and `deleted_at` for soft deletes.

```sql
-- Core tenant and user structure
CREATE TYPE public.app_role AS ENUM ('admin', 'reviewer', 'employee');
CREATE TYPE public.idea_status AS ENUM (
  'draft', 'submitted', 'under_review', 'approved', 'rejected', 'in_progress', 'completed'
);
CREATE TYPE public.prd_status AS ENUM (
  'draft', 'generating', 'review', 'approved', 'archived'
);

-- Tenants (Organizations)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{"gamification": true, "ai_enhancement": true}',
  branding JSONB DEFAULT '{"primary_color": "#2563eb", "logo_url": null}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles with gamification stats
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  department TEXT,
  role app_role DEFAULT 'employee',
  points INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas table with comprehensive metadata
CREATE TABLE public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants NOT NULL,
  title TEXT NOT NULL,
  problem_statement TEXT,
  proposed_solution TEXT,
  expected_impact TEXT,
  status idea_status DEFAULT 'draft',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  submitted_by UUID REFERENCES auth.users,
  assigned_reviewer UUID REFERENCES auth.users,
  ai_enhanced_content JSONB,
  votes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  attachments JSONB DEFAULT '[]',
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- PRDs with versioning and section tracking
CREATE TABLE public.prds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants NOT NULL,
  idea_id UUID REFERENCES public.ideas,
  title TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  status prd_status DEFAULT 'draft',
  
  -- PRD sections (BMAD-inspired structure)
  executive_summary TEXT,
  problem_statement JSONB,
  goals_and_metrics JSONB,
  user_personas JSONB,
  functional_requirements JSONB,
  non_functional_requirements JSONB,
  user_stories JSONB,
  technical_considerations TEXT,
  risks_and_dependencies JSONB,
  timeline_and_milestones JSONB,
  open_questions TEXT[],
  
  -- Conversation history for AI context
  conversation_history JSONB DEFAULT '[]',
  section_completion JSONB DEFAULT '{}',
  
  author_id UUID REFERENCES auth.users,
  reviewers UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Visual prototypes built in playground
CREATE TABLE public.prototypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants NOT NULL,
  prd_id UUID REFERENCES public.prds,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Puck editor state (JSON)
  canvas_data JSONB NOT NULL DEFAULT '{"content": [], "root": {}}',
  thumbnail_url TEXT,
  
  is_published BOOLEAN DEFAULT FALSE,
  published_url TEXT,
  
  created_by UUID REFERENCES auth.users,
  collaborators UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Votes for gamification
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants NOT NULL,
  idea_id UUID REFERENCES public.ideas NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- Comments for collaboration
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants NOT NULL,
  entity_type TEXT NOT NULL, -- 'idea', 'prd', 'prototype'
  entity_id UUID NOT NULL,
  author_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Activity feed for notifications
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants NOT NULL,
  actor_id UUID REFERENCES auth.users,
  action TEXT NOT NULL, -- 'submitted_idea', 'approved', 'commented', 'voted', etc.
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_ideas_tenant_status ON public.ideas(tenant_id, status);
CREATE INDEX idx_ideas_submitted_by ON public.ideas(submitted_by);
CREATE INDEX idx_prds_tenant_status ON public.prds(tenant_id, status);
CREATE INDEX idx_activities_tenant_created ON public.activities(tenant_id, created_at DESC);
CREATE INDEX idx_comments_entity ON public.comments(entity_type, entity_id);
```

### Row Level Security implementation

```sql
-- Helper function to get current tenant from JWT
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'tenant_id')::UUID;
$$ LANGUAGE SQL STABLE;

-- Helper function to check permissions
CREATE OR REPLACE FUNCTION public.authorize(requested_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role public.app_role;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  RETURN CASE
    WHEN user_role = 'admin' THEN TRUE
    WHEN user_role = 'reviewer' AND requested_permission IN (
      'ideas.read', 'ideas.review', 'prds.read', 'prds.review'
    ) THEN TRUE
    WHEN user_role = 'employee' AND requested_permission IN (
      'ideas.create', 'ideas.read', 'prds.create', 'prds.read', 'prototypes.create'
    ) THEN TRUE
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prototypes ENABLE ROW LEVEL SECURITY;

-- Tenant isolation (RESTRICTIVE = must pass in addition to other policies)
CREATE POLICY "tenant_isolation" ON public.ideas
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (tenant_id = (SELECT public.current_tenant_id()));

-- Ideas policies
CREATE POLICY "employees_can_create_ideas" ON public.ideas
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.authorize('ideas.create')));

CREATE POLICY "users_can_read_ideas" ON public.ideas
  FOR SELECT TO authenticated
  USING ((SELECT public.authorize('ideas.read')));

CREATE POLICY "users_can_update_own_draft_ideas" ON public.ideas
  FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() AND status = 'draft');

CREATE POLICY "reviewers_can_update_ideas" ON public.ideas
  FOR UPDATE TO authenticated
  USING ((SELECT public.authorize('ideas.review')));
```

---

## Phase 1: Idea submission with AI enhancement

The idea submission flow guides employees through a **four-step wizard** that collects problem, solution, and impact information. AI enhancement runs automatically in the background, improving clarity and suggesting additional context.

### User flow diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PHASE 1: IDEA SUBMISSION FLOW                       │
└─────────────────────────────────────────────────────────────────────────┘

     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
     │ Step 1  │────▶│ Step 2  │────▶│ Step 3  │────▶│ Step 4  │
     │ Problem │     │Solution │     │ Impact  │     │ Review  │
     └─────────┘     └─────────┘     └─────────┘     └─────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
     ┌─────────────────────────────────────────────────────────┐
     │              AI ENHANCEMENT (BACKGROUND)                 │
     │  • Improves clarity      • Suggests categories          │
     │  • Adds structure        • Identifies similar ideas     │
     └─────────────────────────────────────────────────────────┘
          │
          ▼
     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
     │  SUBMITTED  │────▶│UNDER REVIEW │────▶│  APPROVED   │
     │   🎉        │     │  (Reviewer) │     │  → Phase 2  │
     └─────────────┘     └─────────────┘     └─────────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │  REJECTED   │
                         │(w/feedback) │
                         └─────────────┘
```

### React component structure

```typescript
// app/ideas/new/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdeaSubmission } from '@/hooks/useIdeaSubmission';
import { StepIndicator } from '@/components/StepIndicator';
import { ProblemStep, SolutionStep, ImpactStep, ReviewStep } from './steps';
import { ConfettiCelebration } from '@/components/Celebrations';

const STEPS = ['Problem', 'Solution', 'Impact', 'Review'];

export default function NewIdeaPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const { 
    ideaData, 
    updateIdea, 
    submitIdea, 
    aiEnhancement,
    isEnhancing,
    isSubmitting 
  } = useIdeaSubmission();

  const handleSubmit = async () => {
    await submitIdea();
    setShowCelebration(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress indicator */}
      <StepIndicator 
        steps={STEPS} 
        currentStep={currentStep}
        completedSteps={ideaData.completedSteps}
      />
      
      {/* Step content with animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="mt-8"
        >
          {currentStep === 0 && (
            <ProblemStep 
              value={ideaData.problem_statement}
              onChange={(v) => updateIdea('problem_statement', v)}
              onNext={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 1 && (
            <SolutionStep 
              value={ideaData.proposed_solution}
              onChange={(v) => updateIdea('proposed_solution', v)}
              onNext={() => setCurrentStep(2)}
              onBack={() => setCurrentStep(0)}
            />
          )}
          {currentStep === 2 && (
            <ImpactStep 
              value={ideaData.expected_impact}
              onChange={(v) => updateIdea('expected_impact', v)}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <ReviewStep 
              ideaData={ideaData}
              aiEnhancement={aiEnhancement}
              isEnhancing={isEnhancing}
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(2)}
              isSubmitting={isSubmitting}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Celebration overlay */}
      <ConfettiCelebration 
        show={showCelebration}
        message="Idea Submitted! 🎉"
        subMessage="You've earned 10 points. We'll notify you when it's reviewed."
        onClose={() => router.push('/ideas')}
      />
    </div>
  );
}
```

### AI enhancement system prompt

```typescript
// lib/ai/idea-enhancer.ts
export const IDEA_ENHANCEMENT_PROMPT = `You are an innovation assistant for PassportCard, an insurance company.
Your task is to enhance employee idea submissions while preserving their original intent.

# Guidelines
- Improve clarity and structure without changing the core idea
- Add relevant insurance/fintech context when appropriate
- Suggest a category from: [Claims Processing, Customer Experience, Operations, Product Innovation, Technology, Compliance]
- Identify potential similar ideas they should reference
- Keep the original voice - don't make it sound corporate

# Output Format (JSON)
{
  "enhanced_problem": "Clearer problem statement",
  "enhanced_solution": "More detailed solution",
  "enhanced_impact": "Quantified impact where possible",
  "suggested_category": "Category name",
  "suggested_tags": ["tag1", "tag2"],
  "improvement_notes": "Brief explanation of changes",
  "confidence_score": 0.85
}`;
```

---

## Phase 2: AI-guided PRD generation

The PRD builder implements a **conversational workflow** inspired by the BMAD methodology, where a specialized AI agent guides users through each section. The system maintains conversation context and tracks section completion.

### PRD template structure (BMAD-inspired)

| Section | Description | AI Guidance Focus |
|---------|-------------|-------------------|
| **Executive Summary** | One-paragraph overview | Synthesize from other sections |
| **Problem Statement** | What pain point this solves | Ask "Who feels this pain?" and "How often?" |
| **Goals & Success Metrics** | Measurable outcomes | Push for specific numbers and timelines |
| **User Personas** | Who will use this | Generate from problem context |
| **Functional Requirements** | What it must do (FR-01, FR-02...) | Ensure testable, versioned requirements |
| **Non-Functional Requirements** | Performance, security, scale | Cover compliance for insurance context |
| **User Stories** | As a [user], I want [feature], so that [benefit] | Generate acceptance criteria automatically |
| **Technical Considerations** | Architecture notes | Connect to existing PassportCard systems |
| **Risks & Dependencies** | What could go wrong | Insurance-specific regulatory risks |
| **Timeline & Milestones** | Phased delivery plan | Suggest realistic sprint allocations |
| **Open Questions** | Gaps requiring clarification | Track TBDs for follow-up |

### Conversation flow architecture

```typescript
// lib/ai/prd-assistant.ts
import { Mistral } from '@mistralai/mistralai';

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export const PRD_SYSTEM_PROMPT = `You are a Product Requirements Document (PRD) assistant for PassportCard.
You guide users through creating comprehensive PRDs using a structured, section-by-section approach.

# Your Personality
- Professional but approachable
- Ask one focused question at a time
- Celebrate progress ("Great! That's a solid problem statement.")
- Provide examples from insurance/fintech when helpful

# PRD Sections (in order)
1. Problem Statement - Start here. Ask "What problem are we solving and for whom?"
2. Goals & Metrics - "How will we measure success?"
3. User Personas - "Who are the primary users?"
4. Functional Requirements - "What must the solution do?"
5. Non-Functional Requirements - "What about performance, security, compliance?"
6. User Stories - Generate from requirements
7. Technical Considerations - "Any integration or architecture constraints?"
8. Risks - "What could go wrong?"
9. Timeline - "When do we need this?"
10. Executive Summary - Synthesize at the end

# Rules
- Complete one section before moving to the next
- Mark sections as complete: [SECTION_COMPLETE: section_name]
- If user seems stuck, provide a template or example
- Always validate insurance compliance considerations
- Keep responses concise (under 200 words)

# Current PRD State
{prd_state}

# Conversation History
{conversation_history}`;

export async function streamPRDResponse(
  messages: Message[],
  prdState: PRDState,
  onToken: (token: string) => void
): Promise<{ content: string; sectionUpdates: Record<string, any> }> {
  const systemMessage = PRD_SYSTEM_PROMPT
    .replace('{prd_state}', JSON.stringify(prdState))
    .replace('{conversation_history}', messages.slice(-6).map(m => 
      `${m.role}: ${m.content}`
    ).join('\n'));

  const stream = await mistral.chat.stream({
    model: 'mistral-medium-latest',
    messages: [
      { role: 'system', content: systemMessage },
      ...messages
    ],
    temperature: 0.7,
  });

  let fullContent = '';
  for await (const event of stream) {
    const token = event.data.choices[0]?.delta?.content || '';
    fullContent += token;
    onToken(token);
  }

  // Parse any section completion markers
  const sectionUpdates = parseSectionUpdates(fullContent);
  
  return { content: fullContent, sectionUpdates };
}
```

### PRD builder UI with section progress

```typescript
// app/prds/[id]/builder/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { usePRDConversation } from '@/hooks/usePRDConversation';
import { PRDSidebar } from '@/components/prd/PRDSidebar';
import { ChatInterface } from '@/components/prd/ChatInterface';
import { SectionPreview } from '@/components/prd/SectionPreview';

const PRD_SECTIONS = [
  { id: 'problem', name: 'Problem Statement', icon: '🎯' },
  { id: 'goals', name: 'Goals & Metrics', icon: '📊' },
  { id: 'personas', name: 'User Personas', icon: '👥' },
  { id: 'functional', name: 'Functional Requirements', icon: '⚙️' },
  { id: 'nonfunctional', name: 'Non-Functional Requirements', icon: '🔒' },
  { id: 'stories', name: 'User Stories', icon: '📝' },
  { id: 'technical', name: 'Technical Considerations', icon: '🏗️' },
  { id: 'risks', name: 'Risks & Dependencies', icon: '⚠️' },
  { id: 'timeline', name: 'Timeline', icon: '📅' },
  { id: 'summary', name: 'Executive Summary', icon: '📋' },
];

export default function PRDBuilderPage({ params }: { params: { id: string } }) {
  const [activeView, setActiveView] = useState<'chat' | 'preview'>('chat');
  const { 
    prd, 
    messages, 
    sendMessage, 
    isLoading, 
    streamingContent,
    completedSections 
  } = usePRDConversation(params.id);

  const completionPercentage = (completedSections.length / PRD_SECTIONS.length) * 100;

  return (
    <div className="flex h-screen bg-base-100">
      {/* Left sidebar: Section navigation */}
      <PRDSidebar 
        sections={PRD_SECTIONS}
        completedSections={completedSections}
        currentSection={prd?.currentSection}
        onSectionClick={(id) => sendMessage(`Let's work on the ${id} section`)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar with progress */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">{prd?.title || 'New PRD'}</h1>
            <span className="badge badge-primary">{completionPercentage.toFixed(0)}% Complete</span>
          </div>
          
          {/* View toggle */}
          <div className="btn-group">
            <button 
              className={`btn btn-sm ${activeView === 'chat' ? 'btn-active' : ''}`}
              onClick={() => setActiveView('chat')}
            >
              💬 Chat
            </button>
            <button 
              className={`btn btn-sm ${activeView === 'preview' ? 'btn-active' : ''}`}
              onClick={() => setActiveView('preview')}
            >
              📄 Preview
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-base-300">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Chat or Preview */}
        {activeView === 'chat' ? (
          <ChatInterface 
            messages={messages}
            onSendMessage={sendMessage}
            isLoading={isLoading}
            streamingContent={streamingContent}
          />
        ) : (
          <SectionPreview prd={prd} sections={PRD_SECTIONS} />
        )}
      </div>
    </div>
  );
}
```

---

## Phase 3: Visual prototype builder with Puck

The playground uses **Puck**, a purpose-built React page builder that internally leverages dnd-kit for robust drag-and-drop functionality. The component library includes PassportCard-branded elements built with DaisyUI.

### Why Puck over alternatives

| Library | Verdict |
|---------|---------|
| **Puck** ✅ | Purpose-built for React page builders, built on dnd-kit, excellent Tailwind support, MIT licensed, actively maintained |
| Craft.js | Good alternative if maximum UI customization needed, but more setup required |
| GrapesJS | HTML-centric model doesn't fit React-first architecture |
| react-beautiful-dnd | Lists only, no grid support—not suitable for page builders |

### Puck configuration with PassportCard components

```typescript
// lib/puck/config.ts
import { Config } from '@measured/puck';

// PassportCard branded components
const PassportCardComponents = {
  // Hero section
  Hero: {
    fields: {
      title: { type: 'text' },
      subtitle: { type: 'textarea' },
      variant: {
        type: 'select',
        options: [
          { label: 'Primary (Blue)', value: 'primary' },
          { label: 'Secondary (Teal)', value: 'secondary' },
          { label: 'Gradient', value: 'gradient' },
        ],
      },
      showCTA: { type: 'radio', options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ]},
      ctaText: { type: 'text' },
    },
    defaultProps: {
      title: 'Welcome to PassportCard',
      subtitle: 'Your insurance, simplified.',
      variant: 'primary',
      showCTA: true,
      ctaText: 'Get Started',
    },
    render: ({ title, subtitle, variant, showCTA, ctaText }) => {
      const bgClasses = {
        primary: 'bg-primary text-primary-content',
        secondary: 'bg-secondary text-secondary-content',
        gradient: 'bg-gradient-to-r from-primary to-secondary text-white',
      };
      return (
        <section className={`py-20 px-8 ${bgClasses[variant]}`}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-xl opacity-90 mb-8">{subtitle}</p>
            {showCTA && (
              <button className="btn btn-lg btn-accent">{ctaText}</button>
            )}
          </div>
        </section>
      );
    },
  },

  // Card component
  Card: {
    fields: {
      title: { type: 'text' },
      description: { type: 'textarea' },
      icon: { type: 'select', options: [
        { label: '🏥 Health', value: '🏥' },
        { label: '✈️ Travel', value: '✈️' },
        { label: '🏠 Home', value: '🏠' },
        { label: '🚗 Auto', value: '🚗' },
        { label: '💼 Business', value: '💼' },
      ]},
      variant: { type: 'select', options: [
        { label: 'Default', value: 'default' },
        { label: 'Bordered', value: 'bordered' },
        { label: 'Compact', value: 'compact' },
      ]},
    },
    render: ({ title, description, icon, variant }) => (
      <div className={`card bg-base-100 shadow-xl ${
        variant === 'bordered' ? 'border-2 border-primary' : ''
      } ${variant === 'compact' ? 'card-compact' : ''}`}>
        <div className="card-body">
          <div className="text-4xl mb-2">{icon}</div>
          <h2 className="card-title">{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    ),
  },

  // Form elements for prototype interactions
  FormField: {
    fields: {
      label: { type: 'text' },
      fieldType: { type: 'select', options: [
        { label: 'Text Input', value: 'text' },
        { label: 'Email', value: 'email' },
        { label: 'Select', value: 'select' },
        { label: 'Textarea', value: 'textarea' },
      ]},
      placeholder: { type: 'text' },
      required: { type: 'radio', options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ]},
    },
    render: ({ label, fieldType, placeholder, required }) => (
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{label}{required && ' *'}</span>
        </label>
        {fieldType === 'textarea' ? (
          <textarea className="textarea textarea-bordered" placeholder={placeholder} />
        ) : fieldType === 'select' ? (
          <select className="select select-bordered">
            <option disabled selected>{placeholder}</option>
          </select>
        ) : (
          <input type={fieldType} className="input input-bordered" placeholder={placeholder} />
        )}
      </div>
    ),
  },

  // Stats/metrics display
  StatsGrid: {
    fields: {
      stats: { 
        type: 'array',
        arrayFields: {
          value: { type: 'text' },
          label: { type: 'text' },
          trend: { type: 'select', options: [
            { label: 'Up', value: 'up' },
            { label: 'Down', value: 'down' },
            { label: 'Neutral', value: 'neutral' },
          ]},
        },
      },
    },
    defaultProps: {
      stats: [
        { value: '31K+', label: 'Active Policies', trend: 'up' },
        { value: '4.8', label: 'Customer Rating', trend: 'up' },
        { value: '< 2hrs', label: 'Avg Claim Time', trend: 'down' },
      ],
    },
    render: ({ stats }) => (
      <div className="stats shadow w-full">
        {stats.map((stat, i) => (
          <div key={i} className="stat">
            <div className="stat-title">{stat.label}</div>
            <div className="stat-value text-primary">{stat.value}</div>
            <div className="stat-desc">
              {stat.trend === 'up' && '↗︎ Trending up'}
              {stat.trend === 'down' && '↘︎ Improved'}
              {stat.trend === 'neutral' && '→ Stable'}
            </div>
          </div>
        ))}
      </div>
    ),
  },

  // Navigation component
  Navbar: {
    fields: {
      logoText: { type: 'text' },
      menuItems: {
        type: 'array',
        arrayFields: {
          label: { type: 'text' },
          href: { type: 'text' },
        },
      },
    },
    defaultProps: {
      logoText: 'PassportCard',
      menuItems: [
        { label: 'Products', href: '#' },
        { label: 'Claims', href: '#' },
        { label: 'Support', href: '#' },
      ],
    },
    render: ({ logoText, menuItems }) => (
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">{logoText}</a>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            {menuItems.map((item, i) => (
              <li key={i}><a href={item.href}>{item.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
};

export const puckConfig: Config = {
  components: PassportCardComponents,
  categories: {
    layout: {
      components: ['Hero', 'Navbar'],
      title: 'Layout',
    },
    content: {
      components: ['Card', 'StatsGrid'],
      title: 'Content',
    },
    forms: {
      components: ['FormField'],
      title: 'Forms',
    },
  },
};
```

### Playground page implementation

```typescript
// app/playground/[id]/page.tsx
'use client';

import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { puckConfig } from '@/lib/puck/config';
import { usePrototype } from '@/hooks/usePrototype';
import { supabase } from '@/lib/supabase';

export default function PlaygroundPage({ params }: { params: { id: string } }) {
  const { prototype, isLoading, save, isSaving } = usePrototype(params.id);

  if (isLoading) {
    return <PlaygroundSkeleton />;
  }

  return (
    <div className="h-screen">
      <Puck
        config={puckConfig}
        data={prototype?.canvas_data || { content: [], root: {} }}
        onPublish={async (data) => {
          await save(data);
          // Generate thumbnail and publish URL
        }}
        headerTitle={prototype?.name || 'New Prototype'}
        headerPath={`/playground/${params.id}`}
        plugins={[
          // Custom auto-save plugin
          {
            overrides: {
              actionBar: ({ children }) => (
                <div className="flex items-center gap-2">
                  {isSaving && (
                    <span className="text-sm text-base-content/60 animate-pulse">
                      Saving...
                    </span>
                  )}
                  {children}
                </div>
              ),
            },
          },
        ]}
      />
    </div>
  );
}
```

---

## Gamification drives sustained engagement

Research shows **80% of gamification projects fail** due to poor design that replaces one extrinsic reward for another. IdeaForge focuses on intrinsic motivation—dopamine from achievement, serotonin from recognition, and oxytocin from collaboration.

### Point and badge system

| Action | Points | Badge Unlock |
|--------|--------|--------------|
| Submit first idea | 10 | 🌱 Seedling |
| Idea approved | 25 | — |
| Complete a PRD | 50 | 📝 Documentarian |
| Idea implemented | 100 | 🚀 Implementer |
| 5-day submission streak | 30 | 🔥 On Fire |
| Top contributor (weekly) | 50 | ⭐ Star Contributor |
| First prototype published | 25 | 🎨 Builder |
| Receive 10 votes on idea | 20 | 💡 Bright Spark |

### Celebration moments

```typescript
// components/Celebrations.tsx
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const CELEBRATION_CONFIG = {
  idea_submitted: {
    title: 'Idea Submitted! 🎉',
    message: 'You earned 10 points',
    confetti: true,
    sound: '/sounds/success.mp3',
  },
  idea_approved: {
    title: 'Your Idea Was Approved! 🌟',
    message: 'Ready to create a PRD?',
    confetti: true,
    sound: '/sounds/levelup.mp3',
  },
  prd_complete: {
    title: 'PRD Complete! 📋',
    message: '50 points earned. Time to prototype!',
    confetti: true,
    sound: '/sounds/complete.mp3',
  },
  badge_earned: {
    title: 'Badge Unlocked! 🏆',
    message: '', // Dynamic based on badge
    confetti: true,
    sound: '/sounds/badge.mp3',
  },
  streak: {
    title: '🔥 Streak Continued!',
    message: '', // Dynamic based on days
    confetti: false,
    sound: '/sounds/streak.mp3',
  },
};

export function triggerCelebration(type: keyof typeof CELEBRATION_CONFIG) {
  const config = CELEBRATION_CONFIG[type];
  
  if (config.confetti) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#0d9488', '#f59e0b'], // PassportCard colors
    });
  }
  
  // Play sound (respecting user preferences)
  if (config.sound && !document.hidden) {
    const audio = new Audio(config.sound);
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore autoplay restrictions
  }
}
```

### Leaderboard with weekly reset

```typescript
// components/Leaderboard.tsx
export function Leaderboard() {
  const { data: leaders } = useQuery({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: async () => {
      const startOfWeek = getStartOfWeek(new Date());
      const { data } = await supabase
        .from('activities')
        .select(`
          actor_id,
          profiles!inner(full_name, avatar_url, department)
        `)
        .gte('created_at', startOfWeek.toISOString())
        .order('created_at', { ascending: false });
      
      // Aggregate points by user
      return aggregatePoints(data);
    },
  });

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          🏆 This Week's Top Contributors
          <span className="badge badge-sm">Resets Monday</span>
        </h2>
        <div className="space-y-3">
          {leaders?.map((leader, i) => (
            <div key={leader.id} className="flex items-center gap-3">
              <span className="text-2xl">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={leader.avatar_url || '/default-avatar.png'} />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium">{leader.full_name}</p>
                <p className="text-sm text-base-content/60">{leader.department}</p>
              </div>
              <span className="badge badge-primary">{leader.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Real-time collaboration enables team innovation

Supabase Realtime powers three collaborative features: **live activity feeds**, **presence indicators**, and **collaborative PRD editing**.

### Real-time subscriptions setup

```typescript
// hooks/useRealtimeIdeas.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeIdeas(tenantId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('ideas-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ideas',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          // Invalidate and refetch ideas list
          queryClient.invalidateQueries({ queryKey: ['ideas'] });
          
          // Show toast for new submissions
          if (payload.eventType === 'INSERT') {
            toast.info('New idea submitted!', {
              action: {
                label: 'View',
                onClick: () => router.push(`/ideas/${payload.new.id}`),
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);
}
```

### Presence for PRD collaboration

```typescript
// hooks/usePRDPresence.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Collaborator {
  user_id: string;
  full_name: string;
  avatar_url: string;
  cursor_position?: { x: number; y: number };
  active_section?: string;
}

export function usePRDPresence(prdId: string) {
  const { user, profile } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const presenceChannel = supabase.channel(`prd:${prdId}`, {
      config: { presence: { key: user.id } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state).flat() as Collaborator[];
        setCollaborators(users.filter(u => u.user_id !== user.id));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [prdId, user.id]);

  const updateActiveSection = async (section: string) => {
    if (channel) {
      await channel.track({
        user_id: user.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        active_section: section,
      });
    }
  };

  return { collaborators, updateActiveSection };
}
```

---

## Implementation roadmap spans 12 weeks

### Phase breakdown

| Week | Focus | Deliverables |
|------|-------|--------------|
| **1-2** | Foundation | Supabase setup, auth, RLS policies, basic schema |
| **3-4** | Phase 1 MVP | Idea submission wizard, AI enhancement, basic dashboard |
| **5-6** | Phase 2 MVP | PRD builder chat interface, Mistral integration, section tracking |
| **7-8** | Phase 3 MVP | Puck integration, component library, prototype saving |
| **9-10** | Gamification | Points, badges, leaderboards, celebrations |
| **11** | Polish | Real-time features, notifications, mobile optimization |
| **12** | Launch prep | Testing, documentation, admin training |

### Week 1-2 detailed tasks

```markdown
## Week 1: Supabase Foundation
- [ ] Create Supabase project, configure auth providers
- [ ] Implement database schema (all tables)
- [ ] Write RLS policies for all tables
- [ ] Create custom JWT hook for roles
- [ ] Set up storage buckets with policies
- [ ] Deploy Next.js scaffold to Vercel

## Week 2: Auth & Core UI
- [ ] Implement login/signup flows
- [ ] Build dashboard layout with sidebar
- [ ] Create profile settings page
- [ ] Build role-based navigation
- [ ] Add Tailwind + DaisyUI theme with PassportCard colors
- [ ] Implement basic CRUD for ideas (no AI yet)
```

---

## UX guidelines embody PassportCard brand

The platform should feel **warm, professional, and approachable**—reflecting PassportCard's brand as a modern insurance company that simplifies complexity.

### Color system

```css
/* tailwind.config.js - DaisyUI theme */
module.exports = {
  daisyui: {
    themes: [
      {
        passportcard: {
          "primary": "#2563eb",      /* Trust blue */
          "secondary": "#0d9488",    /* Teal accent */
          "accent": "#f59e0b",       /* Warm amber */
          "neutral": "#1f2937",      /* Dark slate */
          "base-100": "#ffffff",
          "info": "#3b82f6",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
  },
};
```

### Typography and spacing

- **Headings**: Inter or system-ui, bold weights
- **Body**: 16px base, 1.6 line height for readability
- **Spacing**: 4px base unit (p-1 = 4px, p-4 = 16px)
- **Border radius**: Soft but not bubbly (rounded-lg = 8px)

### Interaction principles

1. **Immediate feedback**: Every click produces visible response in <100ms
2. **Progress visibility**: Users always know where they are and what's next
3. **Forgiving design**: Easy undo, clear recovery paths, auto-save everywhere
4. **Celebration moments**: Meaningful achievements trigger delightful animations
5. **Accessibility**: WCAG 2.1 AA compliance, reduced motion options, keyboard navigation

### Micro-interaction specifications

| Interaction | Duration | Easing |
|------------|----------|--------|
| Button press | 150ms | ease-out |
| Modal open | 200ms | ease-out |
| Toast slide-in | 300ms | spring |
| Page transition | 200ms | ease-in-out |
| Celebration confetti | 1500ms | linear |
| Progress bar fill | 500ms | ease-out |

---

## API routes power the AI layer

```typescript
// app/api/ai/enhance-idea/route.ts
import { Mistral } from '@mistralai/mistralai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { IDEA_ENHANCEMENT_PROMPT } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { problem, solution, impact } = await request.json();
  
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  
  const result = await mistral.chat.complete({
    model: 'mistral-small-latest', // Cost-effective for enhancement
    messages: [
      { role: 'system', content: IDEA_ENHANCEMENT_PROMPT },
      { role: 'user', content: JSON.stringify({ problem, solution, impact }) },
    ],
    responseFormat: { type: 'json_object' },
    temperature: 0.5,
  });

  const enhancement = JSON.parse(result.choices[0].message.content);
  
  return Response.json(enhancement);
}

// app/api/ai/prd-chat/route.ts
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { messages, prdId } = await request.json();
  
  // Fetch current PRD state
  const { data: prd } = await supabase
    .from('prds')
    .select('*')
    .eq('id', prdId)
    .single();

  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  
  // Stream response
  const stream = await mistral.chat.stream({
    model: 'mistral-medium-latest',
    messages: [
      { role: 'system', content: buildPRDSystemPrompt(prd) },
      ...messages,
    ],
    temperature: 0.7,
  });

  // Return as Server-Sent Events
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        const content = event.data.choices[0]?.delta?.content || '';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## Cost projections remain modest

### Mistral API costs (estimated monthly)

| Usage Scenario | Sessions/Month | Tokens/Session | Monthly Cost |
|----------------|----------------|----------------|--------------|
| Idea enhancement | 200 | 1,500 | $0.60 |
| PRD conversations | 50 | 15,000 | $6.00 |
| Component suggestions | 100 | 2,000 | $0.80 |
| **Total** | — | — | **~$7.40/month** |

*Based on Mistral Medium 3 at $0.40 input / $2.00 output per million tokens*

### Infrastructure costs

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Supabase | Pro | $25 |
| Vercel | Pro | $20 |
| Mistral AI | Pay-as-go | ~$10 |
| **Total** | — | **~$55/month** |

---

## Conclusion: From ideas to impact

IdeaForge transforms PassportCard's innovation culture by removing friction at every stage. Employees submit ideas through a **guided wizard with AI enhancement**, reviewers manage submissions through a **transparent dashboard**, approved ideas become **structured PRDs through conversational AI**, and product concepts materialize as **interactive prototypes** anyone can build.

The technical foundation—React, Supabase, Mistral, and Puck—provides enterprise-grade security with startup-speed development. **Gamification mechanics** drive sustained engagement without feeling childish, while **real-time collaboration** features make innovation a team sport rather than a suggestion box.

The 12-week roadmap delivers an MVP in 8 weeks with polish and gamification following. Total infrastructure costs remain under $60/month, with AI costs scaling linearly with usage. Most importantly, the platform creates transparency: employees see their ideas progress from submission through implementation, closing the feedback loop that kills most innovation programs.

Build IdeaForge, and watch PassportCard's best ideas surface from everywhere.