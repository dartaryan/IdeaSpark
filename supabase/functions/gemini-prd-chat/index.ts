import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request/Response Contracts (AC: 1, 4, 7)
interface PrdChatRequest {
  prdId: string;
  message?: string;
  isInitial?: boolean;
  ideaContext: {
    id: string;
    title?: string;
    problem: string;
    solution: string;
    impact: string;
    enhancedProblem?: string;
    enhancedSolution?: string;
    enhancedImpact?: string;
  };
  prdContent: Record<string, { content: string; status: string }>;
  messageHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface PrdSectionUpdate {
  sectionKey: string;
  content: string;
  status: 'in_progress' | 'complete';
}

interface PrdChatResponse {
  aiMessage: string;
  sectionUpdates?: PrdSectionUpdate[];
}

interface ErrorResponse {
  error: string;
  code: string;
}

// Environment configuration (AC: 2)
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Retry wrapper with exponential backoff (AC: 5)
 * Reused pattern from gemini-enhance
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// PRD Section keys for validation
const PRD_SECTION_KEYS = [
  'problemStatement',
  'goalsAndMetrics', 
  'userStories',
  'requirements',
  'technicalConsiderations',
  'risks',
  'timeline',
] as const;

const PRD_SECTION_LABELS: Record<string, string> = {
  problemStatement: 'Problem Statement',
  goalsAndMetrics: 'Goals & Metrics',
  userStories: 'User Stories',
  requirements: 'Requirements',
  technicalConsiderations: 'Technical Considerations',
  risks: 'Risks',
  timeline: 'Timeline',
};

/**
 * Build system prompt for conversational PM persona (AC: 1, 3, 9)
 */
function buildSystemPrompt(): string {
  return `You are a friendly, experienced Product Manager helping a colleague build a Product Requirements Document (PRD). 

Your communication style:
- Conversational and supportive, like chatting with a helpful colleague
- Ask ONE focused question at a time (never overwhelm with multiple questions)
- Acknowledge what the user shares before asking follow-ups
- Use examples when helpful ("For instance..." or "Like when...")
- Be encouraging - celebrate progress and good insights
- Never be robotic or interrogative

Your goal is to help fill out these PRD sections through natural dialogue:
1. Problem Statement - What problem are we solving and for whom?
2. Goals & Metrics - How will we measure success?
3. User Stories - What will users be able to do?
4. Requirements - What features and capabilities are needed?
5. Technical Considerations - What technical constraints or needs exist?
6. Risks - What could go wrong and how do we mitigate?
7. Timeline - What are the key milestones?

When the user provides information relevant to a section:
- Extract and structure the content professionally
- Include it in your response using the JSON format below
- Mark sections as "in_progress" until you have comprehensive content, then "complete"

CRITICAL: Your response MUST be valid JSON in this exact format:
{
  "aiMessage": "Your conversational response here",
  "sectionUpdates": [
    {
      "sectionKey": "problemStatement",
      "content": "The structured content for this section",
      "status": "in_progress"
    }
  ]
}

If no section updates, use: "sectionUpdates": null

Guidelines for section content:
- Problem Statement: Clear description of the problem, who it affects, and current pain points
- Goals & Metrics: SMART goals with specific success metrics
- User Stories: "As a [user], I want [action], so that [benefit]" format
- Requirements: Numbered list of specific features and capabilities
- Technical Considerations: Architecture, integrations, performance needs
- Risks: Potential issues with mitigation strategies
- Timeline: Phased approach with realistic milestones`;
}

/**
 * Build conversation prompt with idea context and history (AC: 1, 9, 10)
 */
function buildConversationPrompt(
  request: PrdChatRequest,
  isInitial: boolean
): string {
  const { ideaContext, prdContent, messageHistory, message } = request;
  
  // Build idea context section
  const ideaSection = `
## IDEA CONTEXT
${ideaContext.title ? `Title: ${ideaContext.title}` : ''}
Problem: ${ideaContext.enhancedProblem || ideaContext.problem}
Solution: ${ideaContext.enhancedSolution || ideaContext.solution}
Impact: ${ideaContext.enhancedImpact || ideaContext.impact}
`;

  // Build current PRD status
  const sectionStatuses = PRD_SECTION_KEYS.map(key => {
    const section = prdContent[key];
    const status = section?.status || 'empty';
    const hasContent = section?.content && section.content.trim().length > 0;
    return `- ${PRD_SECTION_LABELS[key]}: ${status}${hasContent ? ' ✓' : ''}`;
  }).join('\n');

  const prdStatusSection = `
## CURRENT PRD STATUS
${sectionStatuses}
`;

  // Build conversation history (limit to last 20 messages) - AC: 10
  const recentHistory = messageHistory.slice(-20);
  const historySection = recentHistory.length > 0 
    ? `
## CONVERSATION HISTORY
${recentHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n')}
`
    : '';

  // Build current message or initial prompt (AC: 9)
  const currentSection = isInitial
    ? `
## INSTRUCTION
This is the START of the conversation. Generate a warm welcome message that:
1. Acknowledges their specific idea (reference the problem/solution)
2. Expresses enthusiasm about helping them build a PRD
3. Asks ONE opening question to explore the Problem Statement deeper
`
    : `
## USER'S CURRENT MESSAGE
${message}

## INSTRUCTION
Respond conversationally, then extract any PRD-relevant content into the appropriate section(s).
`;

  return `${ideaSection}${prdStatusSection}${historySection}${currentSection}`;
}

/**
 * Call Gemini API to generate conversational response (AC: 1, 3, 8)
 */
async function chatWithGemini(
  request: PrdChatRequest,
  isInitial: boolean
): Promise<PrdChatResponse> {
  const systemPrompt = buildSystemPrompt();
  const conversationPrompt = buildConversationPrompt(request, isInitial);

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${conversationPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.8,         // Slightly creative for natural conversation
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,    // Limit for faster response (<3s) - AC: 8
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!generatedText) {
    throw new Error('No content generated by Gemini');
  }

  // Parse JSON from response (handle potential markdown code blocks) - AC: 4
  let cleanedText = generatedText.trim();
  
  // Remove markdown code blocks if present
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  try {
    const parsed = JSON.parse(cleanedText) as PrdChatResponse;
    
    // Validate response structure
    if (!parsed.aiMessage || typeof parsed.aiMessage !== 'string') {
      throw new Error('Invalid response: missing aiMessage');
    }

    // Validate section updates if present (AC: 4)
    if (parsed.sectionUpdates && Array.isArray(parsed.sectionUpdates)) {
      parsed.sectionUpdates = parsed.sectionUpdates.filter(update => {
        const validKey = PRD_SECTION_KEYS.includes(update.sectionKey as any);
        const validStatus = ['in_progress', 'complete'].includes(update.status);
        return validKey && validStatus && update.content?.trim();
      });
      
      if (parsed.sectionUpdates.length === 0) {
        parsed.sectionUpdates = undefined;
      }
    } else {
      parsed.sectionUpdates = undefined;
    }

    return parsed;
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', cleanedText);
    
    // Fallback: If JSON parsing fails, treat entire response as aiMessage
    return {
      aiMessage: generatedText,
      sectionUpdates: undefined,
    };
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate API key is configured (AC: 2)
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured', code: 'CONFIG_ERROR' } as ErrorResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: PrdChatRequest = await req.json();

    // Validate required fields (AC: 7)
    if (!body.prdId?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: prdId', code: 'VALIDATION_ERROR' } as ErrorResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!body.ideaContext?.problem || !body.ideaContext?.solution || !body.ideaContext?.impact) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: ideaContext (problem, solution, impact)', code: 'VALIDATION_ERROR' } as ErrorResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isInitial = body.isInitial === true;

    // Require message for non-initial requests (AC: 7)
    if (!isInitial && !body.message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: message', code: 'VALIDATION_ERROR' } as ErrorResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate content length (prevent token abuse) (AC: 7)
    const historyLength = JSON.stringify(body.messageHistory || []).length;
    const prdLength = JSON.stringify(body.prdContent || {}).length;
    const totalLength = historyLength + prdLength + (body.message?.length || 0);
    
    if (totalLength > 50000) {
      return new Response(
        JSON.stringify({ 
          error: 'Content too long. Please start a new conversation or contact support.', 
          code: 'CONTENT_TOO_LONG' 
        } as ErrorResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default empty arrays/objects
    body.messageHistory = body.messageHistory || [];
    body.prdContent = body.prdContent || {};

    // Call Gemini with retry logic (AC: 5, 6, 8)
    const chatResponse = await withRetry(() => chatWithGemini(body, isInitial));

    return new Response(
      JSON.stringify(chatResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('PRD Chat failed:', error);
    
    // Return clear error response (AC: 6)
    return new Response(
      JSON.stringify({
        error: 'Failed to generate response. Please try again.',
        code: 'CHAT_FAILED',
      } as ErrorResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
