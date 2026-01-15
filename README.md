# IdeaSpark

IdeaSpark is an innovation management platform that helps organizations capture, develop, and track ideas from submission through prototype creation.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, DaisyUI (PassportCard theme)
- **State Management:** Zustand, TanStack Query
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- A Supabase project (free tier available)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/IdeaSpark.git
   cd IdeaSpark
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Find these values in your Supabase Dashboard under **Settings > API**.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |

## Deployment to Vercel

### Step 1: Connect to Vercel

1. Sign up at [vercel.com](https://vercel.com) (free tier)
2. Click **Add New > Project**
3. Import your GitHub repository
4. Vercel auto-detects the Vite framework

### Step 2: Configure Environment Variables

In Vercel Project Settings > Environment Variables, add:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard > Settings > API |

Set both variables for **Production** and **Preview** environments.

### Step 3: Configure Supabase for Production

1. Go to **Supabase Dashboard > Authentication > URL Configuration**

2. Set **Site URL** to your Vercel production URL:
   ```
   https://your-app.vercel.app
   ```

3. Add the following to **Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   https://your-app-*.vercel.app/**
   http://localhost:5173/**
   ```

### Step 4: Deploy

Push to your main branch. Vercel automatically builds and deploys.

- **Production:** Deployed on push to `main`
- **Previews:** Created automatically for pull requests

### Verify Deployment

After deployment, verify these work on your Vercel URL:

- [ ] App loads without console errors
- [ ] User registration creates account in Supabase
- [ ] Login authenticates and redirects to dashboard
- [ ] Session persists across page refresh
- [ ] Logout clears session and redirects to login
- [ ] Protected routes redirect to login when unauthenticated

## Project Structure

```
IdeaSpark/
├── src/
│   ├── components/       # Shared UI components
│   ├── features/         # Feature modules (auth, ideas, etc.)
│   ├── pages/            # Route page components
│   ├── routes/           # Routing configuration
│   ├── lib/              # Utilities (supabase client, etc.)
│   └── App.tsx           # Root component
├── public/               # Static assets
├── supabase/             # Database migrations
├── .env.local            # Local environment (gitignored)
├── vercel.json           # Vercel SPA routing config
└── package.json
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous/public key |

**Note:** Variables prefixed with `VITE_` are exposed to the client bundle. The Supabase anon key is designed to be public - data is protected by Row Level Security (RLS) policies.

## Common Issues

### Build fails with TypeScript errors

Run `npm run build` locally to catch errors before pushing.

### Environment variables not found in production

1. Verify variable names have `VITE_` prefix
2. Check variables are set in Vercel dashboard
3. Redeploy after adding/changing variables

### Supabase connection fails in production

1. Verify environment variables are correct
2. Check Supabase URL Configuration includes your Vercel URLs
3. Ensure Supabase project is not paused (free tier pauses after 7 days of inactivity)

### Authentication redirects fail

Add your Vercel URLs to Supabase **Authentication > URL Configuration > Redirect URLs**.

### Routes return 404 on refresh

The `vercel.json` file handles SPA routing. If issues persist, verify the file exists and contains the rewrite rules.

## License

Private - All rights reserved
