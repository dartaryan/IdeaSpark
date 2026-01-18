# Story 3.4: Chat Interface with AI Assistant

Status: ready-for-dev

## Story

As a **user**,
I want **to have a natural conversation with the AI assistant**,
So that **I can develop my PRD through dialogue rather than form-filling**.

## Acceptance Criteria

1. **Given** I am on the PRD Builder page **When** the page loads **Then** the AI automatically sends a welcome message acknowledging my idea and asking the first guiding question

2. **Given** the AI starts the conversation **When** I see the welcome message **Then** it references my specific idea (problem/solution) and feels warm and engaging, not robotic

3. **Given** I am viewing the chat interface **When** I type in the message input **Then** I can press Enter or click Send to submit my message

4. **Given** I send a message **When** my message is submitted **Then** it appears on the right side of the chat interface (user messages = right-aligned)

5. **Given** the AI is generating a response **When** I wait for the reply **Then** I see a typing indicator (animated dots) showing the AI is thinking

6. **Given** the AI finishes generating a response **When** the response arrives **Then** it appears on the left side of the chat (AI messages = left-aligned) within 3 seconds (NFR-P4)

7. **Given** new messages are added to the chat **When** the chat history grows **Then** the chat automatically scrolls to show the newest message at the bottom

8. **Given** I send a message **When** the message is saved **Then** it is persisted to the `prd_messages` table via prdMessageService (from Story 3.1)

9. **Given** I close and reopen the PRD Builder **When** the page loads **Then** my conversation history is restored and the AI continues where we left off

10. **Given** the Edge Function fails after retries **When** an error occurs **Then** I see a user-friendly error message with a retry option, not a raw error

## Tasks / Subtasks

- [ ] Task 1: Create ChatInterface component (AC: 3, 4, 6, 7)
  - [ ] Create `src/features/prd/components/PrdBuilder/ChatInterface.tsx`
  - [ ] Implement message list container with overflow-y-auto for scrolling
  - [ ] Implement chat input with textarea and send button
  - [ ] Add auto-scroll to bottom on new messages using useEffect + ref
  - [ ] Style per DaisyUI chat component pattern (chat-bubble classes)
  - [ ] Support Enter to send (Shift+Enter for newline)

- [ ] Task 2: Create MessageBubble component (AC: 4, 6)
  - [ ] Create `src/features/prd/components/PrdBuilder/MessageBubble.tsx`
  - [ ] Props: role ('user' | 'assistant'), content (string), timestamp (optional)
  - [ ] User messages: `chat-end` (right-aligned), primary color bubble
  - [ ] AI messages: `chat-start` (left-aligned), neutral color bubble
  - [ ] Support markdown rendering in AI messages (bold, lists, code)
  - [ ] Apply PassportCard theme colors (#E10514 for user bubbles)

- [ ] Task 3: Create TypingIndicator component (AC: 5)
  - [ ] Create `src/features/prd/components/PrdBuilder/TypingIndicator.tsx`
  - [ ] Animated dots pattern (3 dots with staggered animation)
  - [ ] Use DaisyUI loading or custom CSS keyframes
  - [ ] Positioned as assistant message (left-aligned)
  - [ ] Only visible when `isAiTyping` state is true

- [ ] Task 4: Create usePrdChat hook (AC: 1, 2, 5, 8, 9, 10)
  - [ ] Create `src/features/prd/hooks/usePrdChat.ts`
  - [ ] State: messages array, isAiTyping boolean, error state
  - [ ] Integrate with prdChatService from Story 3.3
  - [ ] Integrate with prdMessageService from Story 3.1
  - [ ] On mount: Load existing messages OR get welcome message
  - [ ] sendMessage function: Add user message → call AI → add AI response
  - [ ] Handle errors gracefully with retry capability
  - [ ] Expose retryLastMessage function

- [ ] Task 5: Implement welcome message flow (AC: 1, 2, 9)
  - [ ] Check if prd_messages exist for this PRD
  - [ ] If no messages: Call prdChatService.getWelcomeMessage()
  - [ ] If messages exist: Load from prdMessageService.getMessages()
  - [ ] Save welcome message to prd_messages table
  - [ ] Display welcome message in chat

- [ ] Task 6: Implement message send flow (AC: 3, 5, 6, 8)
  - [ ] On send: Set isAiTyping = true
  - [ ] Save user message to database immediately (optimistic)
  - [ ] Call prdChatService.sendMessage() with context
  - [ ] Save AI response to database
  - [ ] Set isAiTyping = false
  - [ ] Update local messages state

- [ ] Task 7: Implement error handling and retry (AC: 10)
  - [ ] Catch errors from prdChatService
  - [ ] Display toast error message (user-friendly)
  - [ ] Store failed message for retry
  - [ ] Add "Retry" button below error message
  - [ ] retryLastMessage resubmits failed user message

- [ ] Task 8: Integrate with PrdBuilderPage (AC: all)
  - [ ] Import ChatInterface into PrdBuilderPage (from Story 3.2)
  - [ ] Pass required props: prdId, ideaContext, prdContent
  - [ ] Connect to usePrdBuilder hook for PRD content state
  - [ ] Handle sectionUpdates from AI responses (for Story 3.5)

- [ ] Task 9: Update barrel exports
  - [ ] Export ChatInterface from `src/features/prd/components/index.ts`
  - [ ] Export usePrdChat from `src/features/prd/hooks/index.ts`
  - [ ] Export from feature index `src/features/prd/index.ts`

- [ ] Task 10: Implement auto-scroll behavior
  - [ ] Create ref for message container
  - [ ] useEffect to scroll to bottom when messages change
  - [ ] Smooth scroll behavior (scroll-behavior: smooth)
  - [ ] Optional: Only auto-scroll if user is near bottom

## Dev Notes

### Architecture Patterns (MANDATORY)

**Component Location:**
```
src/features/prd/
├── components/
│   ├── PrdBuilder/
│   │   ├── PrdBuilder.tsx          (FROM 3.2 - parent component)
│   │   ├── ChatInterface.tsx       (THIS STORY - NEW)
│   │   ├── MessageBubble.tsx       (THIS STORY - NEW)
│   │   ├── TypingIndicator.tsx     (THIS STORY - NEW)
│   │   └── index.ts                (UPDATE - add exports)
│   └── index.ts                    (UPDATE - add exports)
├── hooks/
│   ├── usePrdBuilder.ts            (FROM 3.1/3.2)
│   ├── usePrdChat.ts               (THIS STORY - NEW)
│   └── index.ts                    (UPDATE - add export)
├── services/
│   ├── prdService.ts               (FROM 3.1)
│   ├── prdMessageService.ts        (FROM 3.1)
│   └── prdChatService.ts           (FROM 3.3)
└── types.ts                        (FROM 3.1)
```

### Component Interfaces

**ChatInterface Props:**
```typescript
interface ChatInterfaceProps {
  prdId: string;
  ideaContext: IdeaContext;
  prdContent: PrdContent;
  onSectionUpdate?: (updates: PrdSectionUpdate[]) => void;
}

interface IdeaContext {
  id: string;
  title?: string;
  problem: string;
  solution: string;
  impact: string;
  enhancedProblem?: string;
  enhancedSolution?: string;
  enhancedImpact?: string;
}
```

**MessageBubble Props:**
```typescript
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}
```

**usePrdChat Return Type:**
```typescript
interface UsePrdChatReturn {
  messages: PrdMessage[];
  isAiTyping: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearError: () => void;
}
```

### DaisyUI Chat Styling (MANDATORY)

**Use DaisyUI chat bubble classes:**
```tsx
// User message (right-aligned)
<div className="chat chat-end">
  <div className="chat-bubble chat-bubble-primary">
    {content}
  </div>
</div>

// AI message (left-aligned)  
<div className="chat chat-start">
  <div className="chat-bubble">
    {content}
  </div>
</div>
```

**PassportCard Theme Colors:**
- Primary (#E10514): User message bubbles via `chat-bubble-primary`
- Neutral: AI message bubbles (default)
- Input styling: Use `input input-bordered` or `textarea textarea-bordered`

### usePrdChat Hook Implementation

```typescript
// src/features/prd/hooks/usePrdChat.ts
import { useState, useEffect, useCallback } from 'react';
import { prdChatService, prdMessageService } from '../services';
import type { PrdMessage, PrdContent } from '../types';

interface IdeaContext {
  id: string;
  title?: string;
  problem: string;
  solution: string;
  impact: string;
  enhancedProblem?: string;
  enhancedSolution?: string;
  enhancedImpact?: string;
}

interface PrdSectionUpdate {
  sectionKey: keyof PrdContent;
  content: string;
  status: 'in_progress' | 'complete';
}

interface UsePrdChatOptions {
  prdId: string;
  ideaContext: IdeaContext;
  prdContent: PrdContent;
  onSectionUpdate?: (updates: PrdSectionUpdate[]) => void;
}

export function usePrdChat({ prdId, ideaContext, prdContent, onSectionUpdate }: UsePrdChatOptions) {
  const [messages, setMessages] = useState<PrdMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize: Load existing messages or get welcome
  useEffect(() => {
    if (isInitialized || !prdId) return;

    async function initializeChat() {
      // Try to load existing messages
      const existingResult = await prdMessageService.getMessages(prdId);
      
      if (existingResult.data && existingResult.data.length > 0) {
        setMessages(existingResult.data);
        setIsInitialized(true);
        return;
      }

      // No existing messages - get welcome message
      setIsAiTyping(true);
      const welcomeResult = await prdChatService.getWelcomeMessage(prdId, ideaContext, prdContent);
      setIsAiTyping(false);

      if (welcomeResult.error) {
        setError(welcomeResult.error.message);
        setIsInitialized(true);
        return;
      }

      if (welcomeResult.data) {
        // Save welcome message to database
        const saveResult = await prdMessageService.addMessage(prdId, 'assistant', welcomeResult.data.aiMessage);
        
        if (saveResult.data) {
          setMessages([saveResult.data]);
        }

        // Handle any section updates from welcome (unlikely but possible)
        if (welcomeResult.data.sectionUpdates && onSectionUpdate) {
          onSectionUpdate(welcomeResult.data.sectionUpdates);
        }
      }
      setIsInitialized(true);
    }

    initializeChat();
  }, [prdId, ideaContext, prdContent, isInitialized, onSectionUpdate]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isAiTyping) return;

    setError(null);
    setFailedMessage(null);

    // Optimistically add user message to UI
    const tempUserMessage: PrdMessage = {
      id: `temp-${Date.now()}`,
      prd_id: prdId,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    // Save user message to database
    const userSaveResult = await prdMessageService.addMessage(prdId, 'user', content.trim());
    
    if (userSaveResult.error) {
      setError('Failed to save message');
      setFailedMessage(content.trim());
      // Remove temp message
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      return;
    }

    // Update temp message with real data
    if (userSaveResult.data) {
      setMessages(prev => prev.map(m => 
        m.id === tempUserMessage.id ? userSaveResult.data! : m
      ));
    }

    // Get AI response
    setIsAiTyping(true);
    const messageHistory = prdChatService.formatMessageHistory(messages);
    const aiResult = await prdChatService.sendMessage(
      prdId,
      content.trim(),
      ideaContext,
      prdContent,
      messageHistory
    );
    setIsAiTyping(false);

    if (aiResult.error) {
      setError(aiResult.error.message);
      setFailedMessage(content.trim());
      return;
    }

    if (aiResult.data) {
      // Save AI message to database
      const aiSaveResult = await prdMessageService.addMessage(prdId, 'assistant', aiResult.data.aiMessage);
      
      if (aiSaveResult.data) {
        setMessages(prev => [...prev, aiSaveResult.data!]);
      }

      // Handle section updates
      if (aiResult.data.sectionUpdates && onSectionUpdate) {
        onSectionUpdate(aiResult.data.sectionUpdates);
      }
    }
  }, [prdId, ideaContext, prdContent, messages, isAiTyping, onSectionUpdate]);

  const retryLastMessage = useCallback(async () => {
    if (failedMessage) {
      await sendMessage(failedMessage);
    }
  }, [failedMessage, sendMessage]);

  const clearError = useCallback(() => {
    setError(null);
    setFailedMessage(null);
  }, []);

  return {
    messages,
    isAiTyping,
    error,
    sendMessage,
    retryLastMessage,
    clearError,
  };
}
```

### ChatInterface Component Implementation

```tsx
// src/features/prd/components/PrdBuilder/ChatInterface.tsx
import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { usePrdChat } from '../../hooks/usePrdChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { PrdContent, PrdSectionUpdate } from '../../types';

interface IdeaContext {
  id: string;
  title?: string;
  problem: string;
  solution: string;
  impact: string;
  enhancedProblem?: string;
  enhancedSolution?: string;
  enhancedImpact?: string;
}

interface ChatInterfaceProps {
  prdId: string;
  ideaContext: IdeaContext;
  prdContent: PrdContent;
  onSectionUpdate?: (updates: PrdSectionUpdate[]) => void;
}

export function ChatInterface({ prdId, ideaContext, prdContent, onSectionUpdate }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isAiTyping,
    error,
    sendMessage,
    retryLastMessage,
    clearError,
  } = usePrdChat({ prdId, ideaContext, prdContent, onSectionUpdate });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isAiTyping) return;
    
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={new Date(message.created_at)}
          />
        ))}
        
        {isAiTyping && <TypingIndicator />}
        
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={clearError}>Dismiss</button>
              <button className="btn btn-sm btn-primary" onClick={retryLastMessage}>Retry</button>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-base-300 p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            className="textarea textarea-bordered flex-1 resize-none"
            rows={2}
            disabled={isAiTyping}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isAiTyping}
            className="btn btn-primary self-end"
          >
            {isAiTyping ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              'Send'
            )}
          </button>
        </div>
        <p className="text-xs text-base-content/60 mt-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
```

### MessageBubble Component Implementation

```tsx
// src/features/prd/components/PrdBuilder/MessageBubble.tsx
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';
  
  // Simple markdown-like formatting for AI messages
  const formatContent = (text: string) => {
    if (isUser) return text;
    
    // Convert **bold** to <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  return (
    <div className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>
      {timestamp && (
        <div className="chat-header text-xs opacity-50 mb-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      <div 
        className={`chat-bubble ${isUser ? 'chat-bubble-primary' : ''}`}
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    </div>
  );
}
```

### TypingIndicator Component Implementation

```tsx
// src/features/prd/components/PrdBuilder/TypingIndicator.tsx
export function TypingIndicator() {
  return (
    <div className="chat chat-start">
      <div className="chat-bubble flex items-center gap-1">
        <span className="loading loading-dots loading-sm" />
      </div>
    </div>
  );
}
```

### Integration with PrdBuilderPage

```tsx
// In PrdBuilderPage.tsx (from Story 3.2), add ChatInterface:
import { ChatInterface } from '../features/prd/components';

// Inside the component:
<ChatInterface
  prdId={prd.id}
  ideaContext={{
    id: idea.id,
    title: idea.title,
    problem: idea.problem,
    solution: idea.solution,
    impact: idea.impact,
    enhancedProblem: idea.enhanced_problem,
    enhancedSolution: idea.enhanced_solution,
    enhancedImpact: idea.enhanced_impact,
  }}
  prdContent={prdContent}
  onSectionUpdate={handleSectionUpdates}
/>
```

### Barrel Export Updates

**Update `src/features/prd/components/PrdBuilder/index.ts`:**
```typescript
export { PrdBuilder } from './PrdBuilder';
export { ChatInterface } from './ChatInterface';
export { MessageBubble } from './MessageBubble';
export { TypingIndicator } from './TypingIndicator';
```

**Update `src/features/prd/hooks/index.ts`:**
```typescript
export { usePrdBuilder, prdQueryKeys } from './usePrdBuilder';
export { usePrdChat } from './usePrdChat';
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Component files | `PascalCase.tsx` | `ChatInterface.tsx` |
| Hook files | `camelCase.ts` | `usePrdChat.ts` |
| Interface names | `PascalCase` | `ChatInterfaceProps` |
| CSS classes | DaisyUI pattern | `chat chat-start`, `chat-bubble` |
| State variables | `camelCase` | `isAiTyping`, `messages` |
| Event handlers | `handle` prefix | `handleSend`, `handleKeyDown` |

### Anti-Patterns to AVOID

1. **DO NOT** call prdChatService directly in components - use usePrdChat hook
2. **DO NOT** store messages only in local state - always sync to prd_messages table
3. **DO NOT** show raw API errors - transform to user-friendly messages
4. **DO NOT** forget to disable input during AI typing
5. **DO NOT** skip auto-scroll - UX requires seeing latest messages
6. **DO NOT** use custom chat styling - use DaisyUI chat bubble classes
7. **DO NOT** block UI thread during API calls - use async/await properly
8. **DO NOT** forget Shift+Enter for multiline - users expect this
9. **DO NOT** lose messages on error - preserve for retry
10. **DO NOT** reinitialize chat on every render - use isInitialized flag

### Performance Requirements (NFR-P4)

- AI responses MUST appear within 3 seconds
- If taking longer, typing indicator MUST be visible
- Input should never feel laggy (immediate response to typing)
- Auto-scroll MUST be smooth (use `behavior: 'smooth'`)

### UX Design Requirements (from UX Spec)

1. **Conversational feel** - Chat feels like talking to a helpful PM colleague
2. **Visual distinction** - User vs AI messages clearly different sides
3. **Progress feedback** - Typing indicator while AI processes
4. **Error recovery** - Clear retry option when things fail
5. **Persistence** - Messages survive page refresh
6. **Responsive** - Works on mobile (chat stacks vertically on small screens)

### Dependencies on Previous Stories

- **Story 3.1 (PRD Database):** prd_messages table, prdMessageService, PrdMessage type
- **Story 3.2 (PRD Builder Page):** PrdBuilderPage component that will embed ChatInterface
- **Story 3.3 (Gemini Edge Function):** prdChatService with sendMessage and getWelcomeMessage

### Dependencies for Future Stories

- **Story 3.5 (Real-Time PRD Section Generation):** Will receive sectionUpdates via onSectionUpdate callback
- **Story 3.6 (PRD Auto-Save):** Will need to coordinate with section updates

### Data Flow

```
User opens PRD Builder (Story 3.2)
  → PrdBuilderPage mounts ChatInterface
    → usePrdChat initializes
      → Check prd_messages for existing conversation
        → If exists: Load messages from prdMessageService
        → If empty: Call prdChatService.getWelcomeMessage()
          → Save welcome to prd_messages
            → Display in ChatInterface

User types message and presses Enter
  → handleSend() called
    → sendMessage() in usePrdChat
      → Add user message to local state (optimistic)
      → Save to prd_messages via prdMessageService
      → Set isAiTyping = true
      → Call prdChatService.sendMessage() (→ Edge Function → Gemini)
      → Receive { aiMessage, sectionUpdates }
      → Save AI message to prd_messages
      → Set isAiTyping = false
      → Update local messages state
      → If sectionUpdates → onSectionUpdate callback → Story 3.5 handles
```

### Testing Checklist

- [ ] Welcome message appears automatically on first load
- [ ] Welcome message references the specific idea
- [ ] User can type message and press Enter to send
- [ ] User message appears on right side (chat-end)
- [ ] AI message appears on left side (chat-start)
- [ ] Typing indicator shows while AI is generating
- [ ] AI response appears within 3 seconds
- [ ] Chat auto-scrolls to show new messages
- [ ] Messages persist after page refresh
- [ ] Conversation resumes where left off after refresh
- [ ] Error shows retry button when AI fails
- [ ] Retry resubmits the failed message
- [ ] Input disabled during AI typing
- [ ] Shift+Enter creates new line, Enter sends
- [ ] Responsive layout on mobile

### Project Structure Notes

- ChatInterface is a new component within PrdBuilder folder
- MessageBubble and TypingIndicator are presentational components
- usePrdChat encapsulates all chat state and logic
- Integrates with existing prdChatService from Story 3.3
- Integrates with existing prdMessageService from Story 3.1

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR18-FR20 PRD Development with AI]
- [Source: _bmad-output/planning-artifacts/prd.md#NFR-P4 AI Response Time]
- [Source: _bmad-output/implementation-artifacts/3-1-create-prd-database-tables-and-service-layer.md]
- [Source: _bmad-output/implementation-artifacts/3-2-prd-builder-page-layout.md]
- [Source: _bmad-output/implementation-artifacts/3-3-gemini-edge-function-for-prd-chat.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
