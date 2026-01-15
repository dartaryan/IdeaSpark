# Story 1.10: Deploy to Vercel

Status: ready-for-dev

## Story

As a **developer**,
I want **the application deployed to Vercel**,
So that **it's accessible via a public URL for demo and testing**.

## Acceptance Criteria

1. **Given** the project repository is connected to GitHub **When** I link it to Vercel **Then** Vercel creates an automatic deployment pipeline

2. **Given** I push to the main branch **When** Vercel detects the push **Then** it automatically builds and deploys the application within 2-3 minutes

3. **Given** the application is deployed **When** I access the Vercel URL **Then** the app loads and connects to Supabase successfully

4. **Given** I am on the deployed application **When** I register a new account **Then** registration works the same as local development

5. **Given** I am on the deployed application **When** I log in with valid credentials **Then** authentication works and I see the dashboard with navigation

6. **Given** I am logged in on the deployed application **When** I click logout **Then** my session is terminated and I am redirected to login

7. **Given** preview deployments are enabled **When** I create a pull request **Then** Vercel creates a preview deployment for that PR

## Tasks / Subtasks

- [ ] Task 1: Prepare repository for deployment (AC: 1)
  - [ ] Verify all code is committed to main branch
  - [ ] Ensure `.gitignore` excludes `.env.local` and `node_modules`
  - [ ] Verify `package.json` has correct `build` script: `tsc -b && vite build`
  - [ ] Test local production build: `npm run build && npm run preview`

- [ ] Task 2: Create Vercel account and link GitHub repository (AC: 1, 7)
  - [ ] Sign up for Vercel (free tier) at vercel.com
  - [ ] Connect GitHub account to Vercel
  - [ ] Import the IdeaSpark repository
  - [ ] Vercel auto-detects Vite framework

- [ ] Task 3: Configure environment variables in Vercel (AC: 3-6)
  - [ ] Go to Project Settings → Environment Variables
  - [ ] Add `VITE_SUPABASE_URL` = your Supabase project URL
  - [ ] Add `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key
  - [ ] Set variables for Production and Preview environments

- [ ] Task 4: Configure Supabase for production (AC: 3-6)
  - [ ] Go to Supabase Dashboard → Authentication → URL Configuration
  - [ ] Add Vercel production URL to "Site URL"
  - [ ] Add Vercel production URL to "Redirect URLs"
  - [ ] Add Vercel preview URL pattern to "Redirect URLs" (e.g., `https://*.vercel.app/**`)

- [ ] Task 5: Trigger first deployment (AC: 2)
  - [ ] Push to main branch (or click "Deploy" in Vercel dashboard)
  - [ ] Monitor build logs for errors
  - [ ] Verify deployment completes successfully

- [ ] Task 6: Verify production functionality (AC: 3-6)
  - [ ] Access the Vercel URL (e.g., `ideaspark-xxx.vercel.app`)
  - [ ] Test user registration flow (create new account)
  - [ ] Test login flow (with newly registered account)
  - [ ] Verify dashboard and navigation render correctly
  - [ ] Test logout flow
  - [ ] Test protected route redirect (access dashboard while logged out)

- [ ] Task 7: Configure custom domain (optional)
  - [ ] If custom domain needed, add in Vercel Project Settings → Domains
  - [ ] Update Supabase redirect URLs with custom domain

- [ ] Task 8: Document deployment configuration
  - [ ] Update README.md with deployment instructions
  - [ ] Document environment variables needed
  - [ ] Add production URL to project documentation

## Dev Notes

### Architecture Compliance (MANDATORY)

**Infrastructure Decisions from Architecture:**
- **Hosting:** Vercel (free tier) - Best React/Vite support, auto-deploys
- **CI/CD:** Vercel Git Integration - Zero config, push-to-deploy
- **Environments:** Dev (local) + Prod (Vercel)
- **Config Management:** `.env.local` (local) + Vercel dashboard (production)

### Vercel Project Configuration

**Framework Preset:** Vite (auto-detected)

**Build Settings:**
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

**Root Directory:** (leave empty - repository root)

### Environment Variables Required

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard → Settings → API |

**CRITICAL:** Environment variables with `VITE_` prefix are exposed to the client-side bundle. This is intentional for Supabase client configuration (anon key is designed to be public).

### Supabase Authentication URL Configuration

For Supabase Auth to work in production, you MUST configure redirect URLs:

1. Go to: Supabase Dashboard → Authentication → URL Configuration
2. **Site URL:** Set to your Vercel production URL (e.g., `https://ideaspark.vercel.app`)
3. **Redirect URLs:** Add:
   - `https://ideaspark.vercel.app/**` (production)
   - `https://ideaspark-*.vercel.app/**` (preview deployments)
   - `http://localhost:5173/**` (local development)

### Vercel Deployment Flow

```
Push to main → Vercel webhook → Install deps → Build → Deploy
                                      ↓
                              Preview on PR
```

**Production deployments:** Triggered by pushes to `main` branch
**Preview deployments:** Triggered by pull requests (each PR gets unique URL)

### Build Verification Steps

Before deploying, verify local production build:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The build should:
- Complete without TypeScript errors
- Generate `dist/` folder with static assets
- Preview should show working application at http://localhost:4173

### Common Deployment Issues & Solutions

**Issue 1: Build fails with TypeScript errors**
- Solution: Run `npm run build` locally first to catch errors
- Check that all imports are valid and types are correct

**Issue 2: Environment variables not found**
- Solution: Ensure variables are added in Vercel dashboard with exact names
- Variables must have `VITE_` prefix for Vite to expose them
- After adding variables, trigger a new deployment

**Issue 3: Supabase connection fails in production**
- Solution: Verify environment variables are set correctly
- Check Supabase URL Configuration includes Vercel URLs
- Verify Supabase project is not paused (free tier can pause after inactivity)

**Issue 4: Authentication redirect fails**
- Solution: Add Vercel URLs to Supabase Redirect URLs list
- Include both exact URLs and wildcard patterns for preview deployments

**Issue 5: Routes return 404 on direct navigation**
- Solution: Vite handles this automatically, but if needed, add `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Vercel Free Tier Limits

| Resource | Limit | IdeaSpark MVP Usage |
|----------|-------|---------------------|
| Bandwidth | 100 GB/month | ✅ Well under |
| Serverless Function Execution | 100 GB-hrs/month | ✅ N/A (static site) |
| Builds | 6,000 minutes/month | ✅ ~1-2 min per build |
| Preview Deployments | Unlimited | ✅ Sufficient |
| Team Members | 1 (Hobby plan) | ✅ Sufficient |

### Security Considerations

1. **NEVER commit `.env.local` to git** - Contains Supabase keys
2. **Supabase anon key is meant to be public** - RLS policies protect data
3. **Preview deployments are public** - Anyone with URL can access
4. **Vercel logs are accessible** - Don't log sensitive data

### Project Structure Notes

No new files are created in the codebase. This story is about infrastructure configuration:

```
IdeaSpark/
├── .env.local              ← Local environment (gitignored)
├── .gitignore              ← Must exclude .env.local
├── package.json            ← Has build script
├── vite.config.ts          ← Build configuration
├── dist/                   ← Build output (gitignored)
└── vercel.json             ← Optional: only if needed for routing
```

### Naming Conventions (for any config files)

| Element | Convention | Example |
|---------|------------|---------|
| Environment variables | `VITE_SCREAMING_SNAKE_CASE` | `VITE_SUPABASE_URL` |
| Config files | lowercase with dots | `vercel.json` |

### Testing Checklist for Production

- [ ] App loads without console errors
- [ ] Theme renders correctly (PassportCard branding #E10514)
- [ ] Registration creates user in Supabase
- [ ] Login authenticates and redirects to dashboard
- [ ] Session persists across page refresh
- [ ] Logout clears session and redirects to login
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Responsive layout works (desktop and mobile)
- [ ] No broken links or missing assets

### Previous Story Dependencies

- **Story 1.1:** ✅ Project initialized with Vite, React, TypeScript
- **Story 1.2:** ✅ PassportCard DaisyUI theme configured
- **Story 1.3:** ✅ Supabase project and database schema set up
- **Story 1.4:** ✅ User registration flow working
- **Story 1.5:** ✅ User login flow working
- **Story 1.6:** ✅ User logout and session management working
- **Story 1.7:** ✅ Password reset flow working
- **Story 1.8:** ✅ Protected routes and role-based access working
- **Story 1.9:** ✅ Application shell and navigation working

### What This Story Completes

Completing this story means:
- IdeaSpark is live on the internet at a public URL
- Users can register, login, and navigate the application
- Epic 1 (Project Foundation & User Authentication) is feature-complete
- Ready to begin Epic 2 (Idea Submission with AI Enhancement)

### Post-Deployment Maintenance

After deployment:
1. Monitor Vercel dashboard for build failures
2. Check Supabase dashboard for usage and errors
3. If Supabase free tier pauses (7 days inactivity), wake it from dashboard

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment]
- [Source: _bmad-output/planning-artifacts/architecture.md#Free Tier Compatibility]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.10]
- [Vercel Documentation - Vite](https://vercel.com/docs/frameworks/vite)
- [Supabase Auth - URL Configuration](https://supabase.com/docs/guides/auth/redirect-urls)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
