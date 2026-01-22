# Supabase Edge Functions

This directory contains Supabase Edge Functions for IdeaSpark.

## Functions

### gemini-enhance
Enhances idea submissions using Google Gemini AI.

**Required Environment Variables:**
- `GEMINI_API_KEY` - Google Gemini API key

### prototype-generate
Generates interactive prototypes from PRD documents using Open-Lovable.

**Required Environment Variables:**
- `GEMINI_API_KEY` - Google Gemini API key (used by Open-Lovable)
- `OPEN_LOVABLE_API_URL` - URL of your deployed Open-Lovable instance
- `FIRECRAWL_API_KEY` - (Optional) Firecrawl API key if required by Open-Lovable

## Setting Environment Variables

### Local Development

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key
OPEN_LOVABLE_API_URL=https://your-open-lovable-instance.vercel.app
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

### Production (Supabase Dashboard)

1. Navigate to your Supabase project
2. Go to **Project Settings** > **Edge Functions** > **Secrets**
3. Add the following secrets:
   - `GEMINI_API_KEY`
   - `OPEN_LOVABLE_API_URL`
   - `FIRECRAWL_API_KEY` (if needed)

## Open-Lovable Setup

Before deploying the `prototype-generate` function, you must deploy Open-Lovable:

1. Fork/clone: https://github.com/firecrawl/open-lovable
2. Deploy to Vercel:
   ```bash
   vercel deploy --prod
   ```
3. Configure environment variables in Vercel:
   - `GEMINI_API_KEY`
   - `FIRECRAWL_API_KEY` (optional)
4. Note the deployed URL and set it as `OPEN_LOVABLE_API_URL`

## Testing Locally

```bash
# Start Supabase functions locally
supabase functions serve --env-file .env.local

# Test gemini-enhance
curl -X POST http://localhost:54321/functions/v1/gemini-enhance \
  -H "Content-Type: application/json" \
  -d '{"problem": "Test problem", "solution": "Test solution", "impact": "Test impact"}'

# Test prototype-generate (requires authentication token)
curl -X POST http://localhost:54321/functions/v1/prototype-generate \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prdId": "uuid-here",
    "ideaId": "uuid-here",
    "prdContent": {
      "problemStatement": "Test problem",
      "goals": "Test goals",
      "userStories": "As a user...",
      "requirements": "Must have...",
      "technicalConsiderations": "Use React..."
    }
  }'
```

## Deploying Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy gemini-enhance
supabase functions deploy prototype-generate
```

## Architecture Notes

- All Edge Functions use Deno runtime
- API keys are never exposed to the client
- Functions implement retry logic with exponential backoff
- CORS headers are configured for browser requests
- Authentication is verified using Supabase JWT tokens
