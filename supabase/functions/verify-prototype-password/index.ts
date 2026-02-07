// supabase/functions/verify-prototype-password/index.ts
// Edge Function for server-side password verification of protected prototypes

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcryptjs from 'https://esm.sh/bcryptjs@3.0.3';

// In-memory rate limiting: Map<key, { count, resetAt }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 5; // Max attempts per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function getRateLimitKey(shareId: string, ip: string): string {
  return `${shareId}_${ip}`;
}

function isRateLimited(shareId: string, ip: string): boolean {
  const key = getRateLimitKey(shareId, ip);
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    // Reset or create new entry
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Parse request body
    const { shareId, password } = await req.json();

    if (!shareId || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing shareId or password' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    if (isRateLimited(shareId, clientIP)) {
      return new Response(
        JSON.stringify({
          error: 'Too many attempts. Please try again in a few minutes.',
          verified: false,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Create Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Fetch prototype by share_id
    const { data: prototype, error: fetchError } = await supabaseAdmin
      .from('prototypes')
      .select('id, password_hash, is_public, share_revoked')
      .eq('share_id', shareId)
      .eq('is_public', true)
      .single();

    if (fetchError || !prototype) {
      return new Response(
        JSON.stringify({ error: 'Prototype not found', verified: false }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Check if share is revoked
    if (prototype.share_revoked) {
      return new Response(
        JSON.stringify({ error: 'This share link has been revoked', verified: false }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 6. If no password hash, allow access (no password protection)
    if (!prototype.password_hash) {
      return new Response(
        JSON.stringify({ verified: true }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 7. Verify password against hash using bcryptjs
    const isMatch = await bcryptjs.compare(password, prototype.password_hash);

    return new Response(
      JSON.stringify({ verified: isMatch }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Verify prototype password error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', verified: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
