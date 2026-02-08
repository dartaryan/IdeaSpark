// supabase/functions/api-proxy/index.ts
// Edge Function: CORS proxy for routing real API calls from Sandpack prototypes (Story 10.3)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PROXY_TIMEOUT_MS = 30_000; // 30 seconds

interface ProxyRequestBody {
  prototypeId: string;
  endpointName: string;
  body?: unknown;
  method?: string;
  headers?: Record<string, string>;
}

interface ProxySuccessResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only accept POST requests (M1 fix)
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    // Validate environment configuration (M2 fix)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ error: 'Service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 1. Auth: Extract and verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2. Parse request body
    const requestBody: ProxyRequestBody = await req.json();

    if (!requestBody.prototypeId || !requestBody.endpointName) {
      return new Response(
        JSON.stringify({ error: 'Missing prototypeId or endpointName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 3. Look up prototype_api_configs + verify prototype ownership
    const { data: config, error: configError } = await supabase
      .from('prototype_api_configs')
      .select('*, prototypes!inner(user_id)')
      .eq('prototype_id', requestBody.prototypeId)
      .eq('name', requestBody.endpointName)
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 4. Verify user owns the prototype
    if (config.prototypes.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 5. Validate: is_mock must be false
    if (config.is_mock) {
      return new Response(
        JSON.stringify({ error: 'Endpoint is configured for mock mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 6. Forward the request to target API with merged headers and 30s timeout
    const configHeaders: Record<string, string> = config.headers || {};
    const requestHeaders: Record<string, string> = requestBody.headers || {};
    const mergedHeaders: Record<string, string> = { ...configHeaders, ...requestHeaders };

    const fetchMethod = requestBody.method || config.method || 'GET';

    const fetchOptions: RequestInit = {
      method: fetchMethod,
      headers: mergedHeaders,
    };

    // Only include body for methods that support it
    if (requestBody.body && !['GET', 'HEAD'].includes(fetchMethod.toUpperCase())) {
      fetchOptions.body = typeof requestBody.body === 'string'
        ? requestBody.body
        : JSON.stringify(requestBody.body);
    }

    // Apply 30-second timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    fetchOptions.signal = controller.signal;

    let targetResponse: Response;
    try {
      targetResponse = await fetch(config.url, fetchOptions);
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if ((fetchError as Error).name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Gateway Timeout' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ error: 'Bad Gateway', details: (fetchError as Error).message }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 7. Parse response and return wrapped result
    const responseHeaders: Record<string, string> = {};
    targetResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Read body as text first, then attempt JSON parse (H1 fix: avoids double body consumption)
    let responseBody: unknown;
    const bodyText = await targetResponse.text();
    const contentType = targetResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        responseBody = JSON.parse(bodyText);
      } catch {
        responseBody = bodyText;
      }
    } else {
      responseBody = bodyText;
    }

    const proxyResponse: ProxySuccessResponse = {
      status: targetResponse.status,
      statusText: targetResponse.statusText,
      headers: responseHeaders,
      body: responseBody,
    };

    return new Response(
      JSON.stringify(proxyResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('api-proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
