# Story 4.3: Trigger Prototype Generation from Completed PRD

Status: ready-for-dev

## Story

As a **user**,
I want **to generate a prototype when my PRD is complete**,
So that **I can see my idea come to life visually**.

## Acceptance Criteria

1. **Given** I have a completed PRD **When** I click "Generate Prototype" **Then** I see a progress indicator showing generation status **And** the progress shows stages (e.g., "Analyzing PRD...", "Generating code...", "Building preview...")

2. **Given** the generation is in progress **Then** prototype generation completes within 30 seconds **And** upon completion, I see my prototype automatically

3. **Given** generation fails **When** an error occurs **Then** I see a clear error message explaining the issue **And** I can retry generation **And** my PRD data is preserved

4. **Given** I trigger prototype generation **Then** the idea status updates to "prototype_complete" when generation succeeds

5. **Given** I view my completed PRD **Then** I see a prominent "Generate Prototype" button **And** the button is disabled if a prototype is currently generating

6. **Given** I navigate away during generation **When** I return to the page **Then** I can see the current generation status **And** I'm notified when generation completes

7. **Given** prototype generation succeeds **Then** I automatically navigate to the prototype viewer page **And** I see my generated prototype with PassportCard branding

8. **Given** I already have a prototype **When** I view my PRD **Then** I see "View Prototype" instead of "Generate Prototype" **And** I can optionally regenerate

## Tasks / Subtasks

- [ ] Task 1: Create GeneratePrototypeButton component (AC: 1, 5, 8)
  - [ ] Create `src/features/prototypes/components/GeneratePrototypeButton.tsx`
  - [ ] Implement button with loading state
  - [ ] Handle click to trigger generation
  - [ ] Disable button during generation
  - [ ] Show "View Prototype" if one exists
  - [ ] Handle regenerate option for existing prototypes

- [ ] Task 2: Create GenerationProgress component (AC: 1, 2)
  - [ ] Create `src/features/prototypes/components/GenerationProgress.tsx`
  - [ ] Show progress indicator with stages
  - [ ] Display estimated time remaining (30s max)
  - [ ] Animate between stages
  - [ ] Show percentage or stage indicator

- [ ] Task 3: Create useGeneratePrototype hook (AC: 1, 2, 3, 6)
  - [ ] Create `src/features/prototypes/hooks/useGeneratePrototype.ts`
  - [ ] Call openLovableService.generate()
  - [ ] Poll prototype status until ready/failed
  - [ ] Update progress stages based on status
  - [ ] Handle errors with retry logic
  - [ ] Persist generation state in case of navigation

- [ ] Task 4: Implement prototype generation flow (AC: 2, 3, 7)
  - [ ] Extract PRD content from prd_documents table
  - [ ] Format PRD sections for API request
  - [ ] Call Edge Function with structured PRD content
  - [ ] Poll for completion (max 60 attempts, 1s interval)
  - [ ] Handle success: navigate to prototype viewer
  - [ ] Handle failure: display error with retry

- [ ] Task 5: Update idea status on successful generation (AC: 4)
  - [ ] After prototype status = 'ready'
  - [ ] Update ideas table: status = 'prototype_complete'
  - [ ] Invalidate React Query cache for idea
  - [ ] Show success toast notification

- [ ] Task 6: Integrate button into PRD completion flow (AC: 5, 8)
  - [ ] Add GeneratePrototypeButton to PrdViewer component
  - [ ] Position prominently after PRD sections
  - [ ] Show only when PRD status = 'complete'
  - [ ] Check if prototype already exists
  - [ ] Update button text based on prototype existence

- [ ] Task 7: Handle background generation persistence (AC: 6)
  - [ ] Store generation state in localStorage or Zustand
  - [ ] Restore state on page reload
  - [ ] Continue polling if generation in progress
  - [ ] Show notification when complete

- [ ] Task 8: Create error handling UI (AC: 3)
  - [ ] Create error modal/toast with clear message
  - [ ] Provide "Retry" action button
  - [ ] Provide "Cancel" option to dismiss
  - [ ] Log error details for debugging
  - [ ] Preserve all PRD content

- [ ] Task 9: Test complete workflow
  - [ ] Test with real PRD content
  - [ ] Verify generation within 30s
  - [ ] Test error scenarios (network failure, timeout)
  - [ ] Test navigation during generation
  - [ ] Verify idea status updates
  - [ ] Test retry functionality

## Dev Notes

### Architecture Patterns (MANDATORY)

**Component Location:**
```
src/features/prototypes/
├── components/
│   ├── GeneratePrototypeButton.tsx     (NEW - THIS STORY)
│   ├── GenerationProgress.tsx          (NEW - THIS STORY)
│   ├── PrototypeViewer.tsx             (Future story)
│   └── PrototypeFrame.tsx              (Future story)
├── hooks/
│   ├── useGeneratePrototype.ts         (NEW - THIS STORY)
│   ├── usePrototype.ts                 (Future story)
│   └── useRefinePrototype.ts           (Future story)
├── services/
│   └── prototypeService.ts             (Updated - add polling helper)
├── types.ts
└── index.ts
```

**Integration Points:**
```
src/features/prd/
├── components/
│   └── PrdViewer.tsx                   (Updated - add GeneratePrototypeButton)
```

### PRD Content Extraction

The Edge Function expects PRD content in this format:

```typescript
interface PrdContent {
  problemStatement: string;
  goals: string;
  userStories: string;
  requirements: string;
  technicalConsiderations: string;
}
```

**PRD Document Structure (from prd_documents table):**

The `content` column is JSONB with structure:
```json
{
  "problemStatement": "...",
  "goalsAndMetrics": "...",
  "userStories": "...",
  "requirements": "...",
  "technicalConsiderations": "...",
  "risks": "...",
  "timeline": "..."
}
```

**Mapping for API:**
- `problemStatement` → direct mapping
- `goalsAndMetrics` → rename to `goals`
- `userStories` → direct mapping
- `requirements` → direct mapping
- `technicalConsiderations` → direct mapping
- Skip `risks` and `timeline` for prototype generation

### Component Implementation

#### GeneratePrototypeButton Component

```typescript
// src/features/prototypes/components/GeneratePrototypeButton.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeneratePrototype } from '../hooks/useGeneratePrototype';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';

interface GeneratePrototypeButtonProps {
  prdId: string;
  ideaId: string;
  existingPrototypeId?: string;
  onGenerationStart?: () => void;
  onGenerationComplete?: (prototypeId: string) => void;
}

export function GeneratePrototypeButton({
  prdId,
  ideaId,
  existingPrototypeId,
  onGenerationStart,
  onGenerationComplete,
}: GeneratePrototypeButtonProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showRegenerate, setShowRegenerate] = useState(false);
  
  const { generate, isGenerating, progress, error, retry } = useGeneratePrototype({
    onSuccess: (prototypeId) => {
      toast.success('Prototype generated successfully!');
      onGenerationComplete?.(prototypeId);
      // Navigate to prototype viewer
      navigate(`/prototypes/${prototypeId}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate prototype');
    },
  });
  
  const handleGenerate = async () => {
    onGenerationStart?.();
    await generate(prdId, ideaId);
  };
  
  const handleRetry = () => {
    retry();
  };
  
  // If prototype exists, show "View Prototype" with regenerate option
  if (existingPrototypeId && !showRegenerate) {
    return (
      <div className="flex gap-4">
        <Button
          onClick={() => navigate(`/prototypes/${existingPrototypeId}`)}
          variant="primary"
          size="lg"
        >
          View Prototype
        </Button>
        <Button
          onClick={() => setShowRegenerate(true)}
          variant="outline"
          size="lg"
        >
          Regenerate
        </Button>
      </div>
    );
  }
  
  // Show generate button
  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        variant="primary"
        size="lg"
        className="w-full sm:w-auto"
      >
        {isGenerating ? (
          <>
            <Spinner className="mr-2" size="sm" />
            Generating Prototype...
          </>
        ) : (
          'Generate Prototype'
        )}
      </Button>
      
      {/* Show error with retry option */}
      {error && (
        <div className="alert alert-error">
          <span>{error.message}</span>
          <Button onClick={handleRetry} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
```

#### GenerationProgress Component

```typescript
// src/features/prototypes/components/GenerationProgress.tsx

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface Stage {
  id: string;
  label: string;
  duration: number; // estimated duration in ms
}

const GENERATION_STAGES: Stage[] = [
  { id: 'analyzing', label: 'Analyzing PRD...', duration: 3000 },
  { id: 'generating', label: 'Generating code...', duration: 20000 },
  { id: 'building', label: 'Building preview...', duration: 7000 },
];

interface GenerationProgressProps {
  status: 'generating' | 'ready' | 'failed';
  startTime?: number;
}

export function GenerationProgress({ status, startTime }: GenerationProgressProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    if (status !== 'generating' || !startTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);
      
      // Progress through stages based on elapsed time
      let accumulatedTime = 0;
      for (let i = 0; i < GENERATION_STAGES.length; i++) {
        accumulatedTime += GENERATION_STAGES[i].duration;
        if (elapsed < accumulatedTime) {
          setCurrentStageIndex(i);
          break;
        }
      }
      
      // If we exceed total estimated time, stay on last stage
      if (elapsed >= 30000) {
        setCurrentStageIndex(GENERATION_STAGES.length - 1);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [status, startTime]);
  
  if (status !== 'generating') return null;
  
  const currentStage = GENERATION_STAGES[currentStageIndex];
  const totalDuration = 30000; // 30 seconds max
  const progressPercent = Math.min((elapsedTime / totalDuration) * 100, 100);
  
  return (
    <div className="card bg-base-200 shadow-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <Spinner size="lg" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{currentStage.label}</h3>
          <p className="text-sm text-base-content/70">
            {Math.round(elapsedTime / 1000)}s elapsed • ~30s total
          </p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Stage indicators */}
      <div className="flex justify-between mt-4">
        {GENERATION_STAGES.map((stage, index) => (
          <div
            key={stage.id}
            className={`flex-1 text-center text-xs ${
              index <= currentStageIndex ? 'text-primary font-semibold' : 'text-base-content/50'
            }`}
          >
            <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
              index < currentStageIndex ? 'bg-primary' :
              index === currentStageIndex ? 'bg-primary animate-pulse' :
              'bg-base-300'
            }`} />
            {stage.label.replace('...', '')}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### useGeneratePrototype Hook

```typescript
// src/features/prototypes/hooks/useGeneratePrototype.ts

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { openLovableService } from '@/services/openLovableService';
import { supabase } from '@/lib/supabase';

interface UseGeneratePrototypeOptions {
  onSuccess?: (prototypeId: string) => void;
  onError?: (error: Error) => void;
}

interface GenerationProgress {
  stage: 'analyzing' | 'generating' | 'building' | 'complete';
  percent: number;
}

export function useGeneratePrototype(options?: UseGeneratePrototypeOptions) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({ stage: 'analyzing', percent: 0 });
  const [error, setError] = useState<Error | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [currentPrdId, setCurrentPrdId] = useState<string>('');
  const [currentIdeaId, setCurrentIdeaId] = useState<string>('');
  
  // Persist generation state to handle page reload
  useEffect(() => {
    const savedState = localStorage.getItem('prototype_generation_state');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.isGenerating && state.prototypeId) {
        // Resume polling
        setIsGenerating(true);
        setStartTime(state.startTime);
        pollPrototypeStatus(state.prototypeId);
      }
    }
  }, []);
  
  const updateProgress = useCallback((stage: GenerationProgress['stage'], percent: number) => {
    setProgress({ stage, percent });
  }, []);
  
  const pollPrototypeStatus = useCallback(async (prototypeId: string) => {
    const { data, error } = await openLovableService.pollStatus(prototypeId, 60, 1000);
    
    if (error) {
      setError(new Error(error.message));
      setIsGenerating(false);
      localStorage.removeItem('prototype_generation_state');
      options?.onError?.(new Error(error.message));
      return;
    }
    
    if (data?.status === 'ready') {
      // Success - update idea status
      await updateIdeaStatus(currentIdeaId, 'prototype_complete');
      
      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['prototypes'] });
      
      setIsGenerating(false);
      updateProgress('complete', 100);
      localStorage.removeItem('prototype_generation_state');
      options?.onSuccess?.(prototypeId);
    } else if (data?.status === 'failed') {
      setError(new Error('Prototype generation failed. Please try again.'));
      setIsGenerating(false);
      localStorage.removeItem('prototype_generation_state');
      options?.onError?.(new Error('Generation failed'));
    }
  }, [currentIdeaId, queryClient, options, updateProgress]);
  
  const updateIdeaStatus = async (ideaId: string, status: string) => {
    const { error } = await supabase
      .from('ideas')
      .update({ status })
      .eq('id', ideaId);
    
    if (error) {
      console.error('Failed to update idea status:', error);
    }
  };
  
  const generate = useCallback(async (prdId: string, ideaId: string) => {
    try {
      setIsGenerating(true);
      setError(null);
      setStartTime(Date.now());
      setCurrentPrdId(prdId);
      setCurrentIdeaId(ideaId);
      updateProgress('analyzing', 10);
      
      // Fetch PRD content
      const { data: prd, error: prdError } = await supabase
        .from('prd_documents')
        .select('content')
        .eq('id', prdId)
        .single();
      
      if (prdError || !prd) {
        throw new Error('Failed to load PRD content');
      }
      
      // Extract and format PRD content
      const prdContent = {
        problemStatement: prd.content.problemStatement || '',
        goals: prd.content.goalsAndMetrics || '',
        userStories: prd.content.userStories || '',
        requirements: prd.content.requirements || '',
        technicalConsiderations: prd.content.technicalConsiderations || '',
      };
      
      updateProgress('generating', 30);
      
      // Call Edge Function
      const { data, error: generateError } = await openLovableService.generate(
        prdId,
        ideaId,
        prdContent
      );
      
      if (generateError || !data) {
        throw new Error(generateError?.message || 'Failed to start generation');
      }
      
      // Save state for persistence
      localStorage.setItem('prototype_generation_state', JSON.stringify({
        isGenerating: true,
        prototypeId: data.prototypeId,
        startTime: Date.now(),
        prdId,
        ideaId,
      }));
      
      updateProgress('building', 60);
      
      // Start polling for completion
      await pollPrototypeStatus(data.prototypeId);
      
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsGenerating(false);
      options?.onError?.(error);
    }
  }, [updateProgress, pollPrototypeStatus, options]);
  
  const retry = useCallback(() => {
    if (currentPrdId && currentIdeaId) {
      generate(currentPrdId, currentIdeaId);
    }
  }, [currentPrdId, currentIdeaId, generate]);
  
  return {
    generate,
    retry,
    isGenerating,
    progress,
    error,
    startTime,
  };
}
```

### Integration with PrdViewer

```typescript
// src/features/prd/components/PrdViewer.tsx (UPDATED)

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePrd } from '../hooks/usePrd';
import { GeneratePrototypeButton } from '@/features/prototypes/components/GeneratePrototypeButton';
import { GenerationProgress } from '@/features/prototypes/components/GenerationProgress';
import { useGeneratePrototype } from '@/features/prototypes/hooks/useGeneratePrototype';
import { supabase } from '@/lib/supabase';

export function PrdViewer() {
  const { prdId } = useParams<{ prdId: string }>();
  const { data: prd, isLoading } = usePrd(prdId!);
  const [existingPrototypeId, setExistingPrototypeId] = useState<string>();
  const { isGenerating, startTime } = useGeneratePrototype();
  
  // Check if prototype already exists
  useEffect(() => {
    const checkExistingPrototype = async () => {
      if (!prdId) return;
      
      const { data } = await supabase
        .from('prototypes')
        .select('id, status')
        .eq('prd_id', prdId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data && data.status === 'ready') {
        setExistingPrototypeId(data.id);
      }
    };
    
    checkExistingPrototype();
  }, [prdId]);
  
  if (isLoading) {
    return <div>Loading PRD...</div>;
  }
  
  if (!prd) {
    return <div>PRD not found</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* PRD Content Sections */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h1 className="card-title text-3xl mb-6">{prd.content.problemStatement}</h1>
            
            {/* Display all PRD sections */}
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Problem Statement</h2>
              <p className="whitespace-pre-wrap">{prd.content.problemStatement}</p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Goals & Metrics</h2>
              <p className="whitespace-pre-wrap">{prd.content.goalsAndMetrics}</p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">User Stories</h2>
              <p className="whitespace-pre-wrap">{prd.content.userStories}</p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Requirements</h2>
              <p className="whitespace-pre-wrap">{prd.content.requirements}</p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Technical Considerations</h2>
              <p className="whitespace-pre-wrap">{prd.content.technicalConsiderations}</p>
            </section>
          </div>
        </div>
        
        {/* Generation Progress (shown during generation) */}
        {isGenerating && (
          <div className="mb-8">
            <GenerationProgress status="generating" startTime={startTime} />
          </div>
        )}
        
        {/* Generate Prototype Button (shown when PRD is complete) */}
        {prd.status === 'complete' && (
          <div className="card bg-primary/10 border-2 border-primary shadow-xl">
            <div className="card-body text-center">
              <h2 className="card-title text-2xl justify-center mb-4">
                Ready to See Your Idea Come to Life?
              </h2>
              <p className="mb-6 text-base-content/80">
                Generate a fully functional React prototype in PassportCard branding
              </p>
              <GeneratePrototypeButton
                prdId={prd.id}
                ideaId={prd.idea_id}
                existingPrototypeId={existingPrototypeId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Prototype Service Updates

```typescript
// src/services/prototypeService.ts (UPDATED - add helper)

import { supabase } from '../lib/supabase';

export interface Prototype {
  id: string;
  prd_id: string;
  idea_id: string;
  user_id: string;
  url: string | null;
  code: string | null;
  version: number;
  refinement_prompt: string | null;
  status: 'generating' | 'ready' | 'failed';
  created_at: string;
}

export const prototypeService = {
  /**
   * Get prototype by ID
   */
  async getById(id: string): Promise<{ data: Prototype | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('prototypes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    
    return { data, error: null };
  },
  
  /**
   * Get prototypes for a PRD
   */
  async getByPrdId(prdId: string): Promise<{ data: Prototype[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('prototypes')
      .select('*')
      .eq('prd_id', prdId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    
    return { data, error: null };
  },
  
  /**
   * Poll prototype status until complete or failed
   * Helper for frontend polling
   */
  async pollStatus(
    prototypeId: string, 
    maxAttempts: number = 60, 
    intervalMs: number = 1000
  ): Promise<{ data: Prototype | null; error: Error | null }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data, error } = await this.getById(prototypeId);
      
      if (error) {
        return { data: null, error };
      }
      
      if (data && (data.status === 'ready' || data.status === 'failed')) {
        return { data, error: null };
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    return { 
      data: null, 
      error: new Error('Prototype generation timed out') 
    };
  },
};
```

### Environment Variables

No new environment variables needed. Uses existing:
- `SUPABASE_URL` (client-side)
- `SUPABASE_ANON_KEY` (client-side)

Edge Function uses (server-side only):
- `OPEN_LOVABLE_API_URL`
- `GEMINI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Error Handling Scenarios

| Scenario | User Experience | Recovery |
|----------|----------------|----------|
| Network failure during generation | Error toast: "Network error. Please check connection and retry." | Retry button available |
| Open-Lovable timeout (60s) | Error toast: "Generation timed out. Please try again." | Retry button available |
| Invalid PRD content | Error toast: "PRD content is incomplete. Please complete all sections." | Returns to PRD editor |
| Prototype table creation fails | Error toast: "Failed to initialize generation. Please try again." | Retry button available |
| User navigates away | Generation continues in background, toast notification on return | Restores progress state |

### Testing Checklist

**Manual Testing:**
- [ ] Generate prototype from completed PRD
- [ ] Verify progress indicator shows stages
- [ ] Confirm generation completes in <30s
- [ ] Test navigation during generation
- [ ] Verify automatic redirect to prototype viewer
- [ ] Test error scenario: disconnect network mid-generation
- [ ] Test retry functionality after error
- [ ] Verify idea status updates to "prototype_complete"
- [ ] Test with existing prototype (show "View Prototype")
- [ ] Test regenerate functionality

**Integration Testing:**
- [ ] Verify openLovableService.generate() is called correctly
- [ ] Verify polling logic retries for 60 attempts
- [ ] Verify PRD content extraction from database
- [ ] Verify idea status update after success
- [ ] Verify React Query cache invalidation

### Dependencies on Previous Stories

- **Story 1.3 (Supabase Setup):** Database and authentication configured
- **Story 2.1 (Ideas Table):** Ideas table exists with status enum
- **Story 3.1 (PRD Tables):** prd_documents table exists with JSONB content
- **Story 4.1 (Prototypes Table):** Prototypes table exists with status tracking
- **Story 4.2 (Edge Function):** prototype-generate Edge Function deployed and functional

### Dependencies for Future Stories

- **Story 4.4 (Prototype Viewer):** Will display the generated prototype
- **Story 4.5 (Chat Refinement):** Will use same Edge Function for refinements
- **Story 4.6 (Refinement History):** Will display all prototype versions
- **Story 4.7 (Shareable URLs):** Will create public prototype links

### Anti-Patterns to AVOID

1. **DO NOT** block the UI for 30 seconds - use async generation with polling
2. **DO NOT** lose PRD content if generation fails - always preserve state
3. **DO NOT** forget to update idea status on success - critical for pipeline tracking
4. **DO NOT** show "Generate" button if already generating - disable or hide it
5. **DO NOT** forget to handle page reload during generation - persist state
6. **DO NOT** skip error messages - users need clear feedback
7. **DO NOT** navigate away without saving state - persist to localStorage
8. **DO NOT** forget to invalidate React Query cache after success
9. **DO NOT** hardcode generation stages - use configurable Stage array
10. **DO NOT** forget retry logic - network issues are common

### UX Considerations (from UX Design Spec)

**Progress Indicators (CRITICAL):**
- Visible generation status reduces anxiety
- Stage-based progress (not just spinner) shows system is working
- Estimated time remaining (30s) sets expectations
- Animated transitions between stages provide feedback

**Aha Moment:**
- Prototype appears automatically when ready (no extra click)
- Immediate navigation to viewer creates "wow" moment
- PassportCard branding visibility is instant

**Error Recovery:**
- Clear error messages explain what went wrong
- Retry button always available
- PRD content is never lost (reduces fear)

**Mobile Responsiveness:**
- Progress indicator works on small screens
- Button is touch-friendly (44px minimum)
- Text is readable on mobile

### Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Prototype generation time | <30s | Depends on Open-Lovable (typically 20-25s) |
| Button click response | <100ms | Immediate progress indicator |
| Status poll interval | 1s | 1s (60 attempts max) |
| Error recovery time | <2s | Immediate retry option |
| Cache invalidation | <500ms | React Query automatic |

### Security Considerations

1. **Authentication:** User must be authenticated to generate prototypes
2. **Authorization:** User can only generate for their own PRDs (verified via RLS)
3. **Data Validation:** PRD content validated before sending to Edge Function
4. **Rate Limiting:** Consider adding rate limits to prevent abuse (future enhancement)
5. **API Keys:** All external API keys remain server-side only

### Accessibility Considerations

- Progress indicator includes aria-live announcements
- Button has proper aria-label when disabled
- Error messages are screen-reader friendly
- Keyboard navigation works for all interactive elements
- Color contrast meets WCAG 2.1 AA standards

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Prototype Generation Flow]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Progress Indicators]
- [Source: _bmad-output/planning-artifacts/prd.md#Journey 1: Maya's Aha Moment]
- [Source: _bmad-output/implementation-artifacts/4-1-create-prototypes-database-table-and-service-layer.md]
- [Source: _bmad-output/implementation-artifacts/4-2-open-lovable-edge-function-for-prototype-generation.md]

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

(To be filled by dev agent)

### Completion Notes List

(To be filled by dev agent)

### File List

(To be filled by dev agent after implementation)
