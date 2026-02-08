// supabase/functions/prototype-ai-call/index.ts
// Edge Function: AI API proxy for Sandpack prototypes (Story 10.4)
// Routes AI calls through server-side Gemini API, keeping API keys secure.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const AI_TIMEOUT_MS = 30_000; // 30 seconds
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface AiRequestBody {
  prototypeId: string;
  endpointName: string;
  prompt: string;
  context?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only accept POST requests (M1 fix)
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.', code: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    // Validate environment configuration (M2 fix)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Service not configured', code: 'CONFIG_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured', code: 'CONFIG_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 1. Auth: Extract and verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'AUTH_ERROR' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'AUTH_ERROR' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2. Parse request body (safe JSON parsing — return 400 on malformed input)
    let body: AiRequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', code: 'VALIDATION_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!body.prototypeId || !body.endpointName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: prototypeId and endpointName', code: 'VALIDATION_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!body.prompt || !body.prompt.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: prompt', code: 'VALIDATION_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 3. Look up prototype_api_configs + verify prototype ownership
    const { data: config, error: configError } = await supabase
      .from('prototype_api_configs')
      .select('*, prototypes!inner(user_id)')
      .eq('prototype_id', body.prototypeId)
      .eq('name', body.endpointName)
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: 'Endpoint not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 4. Verify user owns the prototype
    if (config.prototypes.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden', code: 'FORBIDDEN' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 5. Verify endpoint is AI type
    if (!config.is_ai) {
      return new Response(
        JSON.stringify({ error: 'Endpoint is not configured as AI', code: 'NOT_AI_ENDPOINT' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 6. Reject mock-mode AI endpoints (should use client-side mock path)
    if (config.is_mock) {
      return new Response(
        JSON.stringify({ error: 'Endpoint is configured for mock mode', code: 'MOCK_MODE' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 7. Build Gemini API request
    const aiModel = config.ai_model || 'gemini-2.5-flash';
    const aiTemperature = config.ai_temperature != null ? Number(config.ai_temperature) : 0.7;
    const aiMaxTokens = config.ai_max_tokens || 1024;
    const systemPrompt = config.ai_system_prompt || '';

    const userPrompt = body.context
      ? `${body.prompt}\n\nContext:\n${body.context}`
      : body.prompt;

    const geminiUrl = `${GEMINI_API_BASE}/${aiModel}:generateContent?key=${geminiApiKey}`;

    // 8. Call Gemini with 30s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    let geminiResponse: Response;
    try {
      geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            { parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
          ],
          generationConfig: {
            temperature: aiTemperature,
            maxOutputTokens: aiMaxTokens,
            topK: 40,
            topP: 0.95,
          },
        }),
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if ((fetchError as Error).name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'AI service timeout', code: 'TIMEOUT' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI service error', code: 'AI_ERROR', details: (fetchError as Error).message }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 9. Parse Gemini response (H1 fix: read as text first, then JSON.parse)
    const responseText = await geminiResponse.text();

    if (!geminiResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'AI service error', code: 'AI_ERROR', details: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    let geminiData;
    try {
      geminiData = JSON.parse(responseText);
    } catch {
      return new Response(
        JSON.stringify({ error: 'AI service error', code: 'AI_ERROR', details: 'Invalid response from AI service' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 10. Extract text from Gemini response
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: 'AI service error', code: 'AI_ERROR', details: 'No content generated' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Strip markdown code blocks if present (following gemini-enhance pattern)
    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    // 11. Extract usage metadata if available
    const usageMetadata = geminiData.usageMetadata;
    const usage = usageMetadata
      ? {
          promptTokens: usageMetadata.promptTokenCount ?? 0,
          completionTokens: usageMetadata.candidatesTokenCount ?? 0,
        }
      : undefined;

    // 12. Return success response
    return new Response(
      JSON.stringify({
        text: cleanedText,
        model: aiModel,
        usage,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    // Log error for debugging (safe: does not log prompts or AI responses — Story 10.5 scope)
    console.error('prototype-ai-call error:', (error as Error).message ?? error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
