# Story 1.1: Initialize Project with Vite and Core Dependencies

Status: review

## Story

As a **developer**,
I want **the project initialized with Vite, React, TypeScript, and all core dependencies**,
So that **I have a working foundation to build IdeaSpark**.

## Acceptance Criteria

1. **Given** a new project directory **When** I run the initialization commands **Then** the project is created with Vite + React + TypeScript
2. Tailwind CSS 4.x and DaisyUI 5.x are installed and configured
3. Supabase client, React Router, Zustand, React Query, Zod, and React Hook Form are installed
4. The development server starts successfully with hot reload working
5. The project structure follows the architecture specification (features/, components/ui/, services/, etc.)
6. TypeScript strict mode is enabled
7. ESLint is configured for code quality

## Tasks / Subtasks

- [x] Task 1: Initialize Vite + React + TypeScript project (AC: 1)
  - [x] Run `npm create vite@latest ideaspark -- --template react-ts`
  - [x] Verify project scaffolds correctly

- [x] Task 2: Install and configure Tailwind CSS 4.x with DaisyUI 5.x (AC: 2)
  - [x] Install `tailwindcss@latest @tailwindcss/vite@latest daisyui@latest`
  - [x] Configure Vite plugin in `vite.config.ts`
  - [x] Create `src/styles/globals.css` with Tailwind directives
  - [x] Verify Tailwind classes work in a test component

- [x] Task 3: Install all core dependencies (AC: 3)
  - [x] Install `@supabase/supabase-js`
  - [x] Install `react-router-dom`
  - [x] Install `zustand`
  - [x] Install `@tanstack/react-query`
  - [x] Install `zod`
  - [x] Install `react-hook-form @hookform/resolvers`

- [x] Task 4: Create project directory structure (AC: 5)
  - [x] Create `src/features/` with subdirectories: auth, ideas, prd, prototypes, admin
  - [x] Create `src/components/ui/` directory
  - [x] Create `src/services/` directory
  - [x] Create `src/hooks/` directory
  - [x] Create `src/lib/` directory
  - [x] Create `src/types/` directory
  - [x] Create `src/routes/` directory
  - [x] Create `src/styles/` directory

- [x] Task 5: Configure TypeScript strict mode (AC: 6)
  - [x] Update `tsconfig.json` with strict mode settings
  - [x] Enable `noImplicitAny`, `strictNullChecks`, etc.

- [x] Task 6: Configure ESLint (AC: 7)
  - [x] Verify ESLint config in `eslint.config.js`
  - [x] Add TypeScript-specific rules if needed

- [x] Task 7: Create environment configuration (AC: 4)
  - [x] Create `.env.example` with placeholder variables
  - [x] Create `.env.local` (gitignored) for local development
  - [x] Add Supabase URL and anon key placeholders

- [x] Task 8: Verify dev server and HMR (AC: 4)
  - [x] Run `npm run dev`
  - [x] Verify hot module replacement works
  - [x] Verify no console errors

## Dev Notes

### Initialization Commands (EXACT SEQUENCE)

```bash
# Step 1: Create project
npm create vite@latest ideaspark -- --template react-ts

# Step 2: Navigate and install dependencies
cd ideaspark
npm install

# Step 3: Install Tailwind CSS 4.x with Vite plugin
npm install tailwindcss@latest @tailwindcss/vite@latest daisyui@latest

# Step 4: Install core libraries
npm install @supabase/supabase-js react-router-dom zustand @tanstack/react-query zod react-hook-form @hookform/resolvers
```

### Vite Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

**CRITICAL:** With Tailwind CSS 4.x and @tailwindcss/vite, NO postcss.config.js or tailwind.config.ts is needed. The Vite plugin handles everything.

### Global CSS Setup (src/styles/globals.css)

```css
@import "tailwindcss";
@plugin "daisyui";
```

**CRITICAL:** Import this CSS file in `src/main.tsx`:
```typescript
import './styles/globals.css'
```

### TypeScript Configuration (tsconfig.json)

Ensure these strict settings are enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Required Directory Structure

Create these directories under `src/`:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── ideas/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── prd/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── prototypes/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── index.ts
│   └── admin/
│       ├── components/
│       │   └── analytics/
│       ├── hooks/
│       ├── services/
│       ├── types.ts
│       └── index.ts
├── components/
│   └── ui/
│       └── index.ts
├── services/
│   └── index.ts
├── hooks/
│   └── index.ts
├── lib/
│   ├── supabase.ts
│   ├── queryClient.ts
│   ├── utils.ts
│   └── constants.ts
├── types/
│   ├── database.ts
│   └── index.ts
├── routes/
│   └── index.tsx
└── styles/
    └── globals.css
```

### Environment Variables (.env.example)

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
VITE_APP_NAME=IdeaSpark
```

**CRITICAL:** All environment variables must be prefixed with `VITE_` to be exposed to the client.

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Components | `PascalCase` | `IdeaCard.tsx` |
| Files | `PascalCase.tsx` for components | `IdeaCard.tsx` |
| Functions | `camelCase` | `getIdeasByUser` |
| Hooks | `use` + `camelCase` | `useIdeas`, `useAuth` |
| Types | `PascalCase` | `Idea`, `User` |
| Constants | `SCREAMING_SNAKE_CASE` | `API_BASE_URL` |

### Version Requirements

| Package | Version | Notes |
|---------|---------|-------|
| Node.js | 20+ | Required for Vite 6.x |
| Vite | 6.x | Latest stable |
| React | 19.x | Latest stable |
| TypeScript | 5.x | Latest stable |
| Tailwind CSS | 4.x | Uses new Vite plugin |
| DaisyUI | 5.x | Compatible with Tailwind 4.x |

### Project Structure Notes

- **Feature-based organization:** Each feature (auth, ideas, prd, prototypes, admin) contains its own components, hooks, services, and types
- **Barrel exports:** Each feature folder should have an `index.ts` for clean imports
- **Co-located tests:** Test files go next to the files they test (e.g., `Button.tsx` and `Button.test.tsx`)
- **Shared UI components:** Go in `src/components/ui/` for cross-feature reuse

### Anti-Patterns to AVOID

1. **DO NOT** create a `tailwind.config.ts` - Tailwind CSS 4.x with @tailwindcss/vite doesn't need it
2. **DO NOT** create a `postcss.config.js` - The Vite plugin handles PostCSS
3. **DO NOT** use `postcss-import` - Not needed with Tailwind 4.x
4. **DO NOT** put feature-specific components in `src/components/` - They belong in `src/features/{feature}/components/`
5. **DO NOT** create utility files in root `src/` - Use `src/lib/` for utilities
6. **DO NOT** mix database column naming (snake_case) with TypeScript (camelCase) in types without transformation

### Verification Checklist

Before marking complete, verify:

- [ ] `npm run dev` starts without errors
- [ ] Hot module replacement works (change a component and see it update)
- [ ] Tailwind CSS classes render correctly (test with `className="text-red-500"`)
- [ ] DaisyUI components render correctly (test with `<button className="btn btn-primary">Test</button>`)
- [ ] All directories exist per the structure above
- [ ] TypeScript strict mode is active (try `const x = null; x.toString()` - should error)
- [ ] No console errors in browser
- [ ] ESLint runs without configuration errors

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- ESLint initially flagged empty object types in `src/types/database.ts` - fixed by using `Record<string, never>` instead of `{}`

### Completion Notes List

- Initialized Vite 7.3.1 + React 19.2 + TypeScript 5.9 project
- Installed and configured Tailwind CSS 4.x with @tailwindcss/vite plugin (no postcss.config or tailwind.config needed)
- Installed DaisyUI 5.x as Tailwind plugin
- Installed all core dependencies: @supabase/supabase-js, react-router-dom, zustand, @tanstack/react-query, zod, react-hook-form, @hookform/resolvers
- Created complete project directory structure per architecture spec
- Created barrel exports (index.ts) for all features and shared directories
- Created lib files: supabase.ts, queryClient.ts, utils.ts, constants.ts
- Created placeholder types for database schema
- Configured TypeScript strict mode with all strict settings in tsconfig.app.json
- ESLint pre-configured by Vite with TypeScript and React hooks support
- Created .env.example and .env.local files
- Updated App.tsx with Tailwind + DaisyUI test component
- Removed unused App.css and index.css files
- Dev server runs successfully with HMR working

### File List

**Created:**
- package.json
- package-lock.json
- vite.config.ts
- tsconfig.json
- tsconfig.app.json
- tsconfig.node.json
- eslint.config.js
- index.html
- .env.example
- .env.local
- src/main.tsx
- src/App.tsx
- src/vite-env.d.ts
- src/styles/globals.css
- src/features/auth/index.ts
- src/features/auth/types.ts
- src/features/ideas/index.ts
- src/features/ideas/types.ts
- src/features/prd/index.ts
- src/features/prd/types.ts
- src/features/prototypes/index.ts
- src/features/prototypes/types.ts
- src/features/admin/index.ts
- src/features/admin/types.ts
- src/components/ui/index.ts
- src/services/index.ts
- src/hooks/index.ts
- src/lib/supabase.ts
- src/lib/queryClient.ts
- src/lib/utils.ts
- src/lib/constants.ts
- src/types/index.ts
- src/types/database.ts
- src/routes/index.tsx

**Modified:**
- .gitignore (Vite added entries)

**Deleted:**
- src/App.css
- src/index.css
