# Story 1.9: Application Shell and Navigation

Status: ready-for-dev

## Story

As a **user**,
I want **a consistent navigation layout with header and sidebar**,
So that **I can easily move around the application**.

## Acceptance Criteria

1. **Given** I am logged in **When** I view any page **Then** I see a header with the IdeaSpark logo and user menu

2. **Given** I am logged in **When** I view any page **Then** I see navigation links appropriate for my role:
   - **User role:** Dashboard, My Ideas, New Idea
   - **Admin role:** All user links plus Admin Dashboard, Analytics

3. **Given** I am viewing the application on desktop **When** the viewport is >= 1024px **Then** I see a persistent sidebar navigation on the left

4. **Given** I am viewing on mobile/tablet **When** the viewport is < 1024px **Then** the sidebar collapses to a hamburger menu **And** clicking the hamburger opens a drawer overlay

5. **Given** I am on any page **When** I view the navigation **Then** the current page link is visually highlighted (active state)

6. **Given** I am logged in **When** I click my user avatar/name in the header **Then** I see a dropdown with: Profile (placeholder), Settings (placeholder), Logout

7. **Given** I click Logout in the user menu **When** the action completes **Then** I am logged out and redirected to login page (uses useAuth from Story 1.6)

8. The UI uses PassportCard DaisyUI theme consistently:
   - Primary color: #E10514
   - Border radius: 20px (rounded-xl in Tailwind)
   - Fonts: Montserrat (headings), Rubik (body)

## Tasks / Subtasks

- [ ] Task 1: Create AppLayout component (AC: 1-5, 8)
  - [ ] Create `src/components/layout/AppLayout.tsx`
  - [ ] Implement DaisyUI drawer pattern for responsive sidebar
  - [ ] Pass children as main content area
  - [ ] Export from `src/components/layout/index.ts`

- [ ] Task 2: Create Header component (AC: 1, 6, 7)
  - [ ] Create `src/components/layout/Header.tsx`
  - [ ] Add IdeaSpark logo (text or SVG) on the left
  - [ ] Add hamburger menu button for mobile (toggles drawer)
  - [ ] Add user menu dropdown on the right (DaisyUI dropdown)
  - [ ] Include Profile, Settings (placeholders), Logout options
  - [ ] Wire Logout to authService.signOut() via useAuth hook

- [ ] Task 3: Create Sidebar component (AC: 2, 5)
  - [ ] Create `src/components/layout/Sidebar.tsx`
  - [ ] Define navigation items with icons, labels, paths, and requiredRole
  - [ ] Filter nav items based on user role from useAuth
  - [ ] Highlight active link using NavLink's isActive or useLocation
  - [ ] Use DaisyUI menu component for consistent styling

- [ ] Task 4: Create UserMenu component (AC: 6, 7)
  - [ ] Create `src/components/layout/UserMenu.tsx`
  - [ ] Display user avatar (initials circle) and name/email
  - [ ] DaisyUI dropdown with menu items
  - [ ] Handle logout action with loading state

- [ ] Task 5: Update routes to use AppLayout (AC: 1-5)
  - [ ] Wrap protected routes with AppLayout in `src/routes/index.tsx`
  - [ ] Create layout route pattern (parent route with Outlet)
  - [ ] Keep auth pages (login, register, forgot-password) outside layout

- [ ] Task 6: Create placeholder pages for navigation targets
  - [ ] Verify DashboardPage exists or create placeholder
  - [ ] Create `src/pages/MyIdeasPage.tsx` placeholder
  - [ ] Create `src/pages/NewIdeaPage.tsx` placeholder
  - [ ] Create `src/pages/AdminDashboardPage.tsx` placeholder (admin only)
  - [ ] Create `src/pages/AnalyticsPage.tsx` placeholder (admin only)

- [ ] Task 7: Test responsive behavior (AC: 3, 4)
  - [ ] Test desktop view (>= 1024px): sidebar visible
  - [ ] Test mobile view (< 1024px): hamburger menu, drawer opens/closes
  - [ ] Test navigation links work and highlight correctly
  - [ ] Test role-based navigation filtering (user vs admin)

- [ ] Task 8: Update barrel exports
  - [ ] Export layout components from `src/components/layout/index.ts`
  - [ ] Update `src/pages/index.ts` with new page exports

## Dev Notes

### Architecture Patterns (MANDATORY)

**Component Location:**
```
src/
├── components/
│   └── layout/
│       ├── AppLayout.tsx       (NEW - main layout wrapper)
│       ├── Header.tsx          (NEW - top header bar)
│       ├── Sidebar.tsx         (NEW - navigation sidebar)
│       ├── UserMenu.tsx        (NEW - user dropdown menu)
│       └── index.ts            (NEW - barrel exports)
├── pages/
│   ├── DashboardPage.tsx       (EXISTS from 1.4)
│   ├── MyIdeasPage.tsx         (NEW - placeholder)
│   ├── NewIdeaPage.tsx         (NEW - placeholder)
│   ├── AdminDashboardPage.tsx  (NEW - placeholder)
│   ├── AnalyticsPage.tsx       (NEW - placeholder)
│   └── index.ts                (UPDATE)
└── routes/
    └── index.tsx               (UPDATE - wrap with AppLayout)
```

### DaisyUI Drawer Pattern for Responsive Layout

Use DaisyUI's drawer component for mobile-responsive sidebar:

```tsx
// src/components/layout/AppLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="drawer lg:drawer-open">
      {/* Mobile drawer toggle */}
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main content */}
      <div className="drawer-content flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 bg-base-200">
          <Outlet />
        </main>
      </div>
      
      {/* Sidebar drawer */}
      <div className="drawer-side z-40">
        <label
          htmlFor="sidebar-drawer"
          className="drawer-overlay"
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar onNavClick={() => setSidebarOpen(false)} />
      </div>
    </div>
  );
}
```

### Header Component Pattern

```tsx
// src/components/layout/Header.tsx
import { UserMenu } from './UserMenu';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="navbar bg-base-100 shadow-md sticky top-0 z-30">
      {/* Mobile hamburger */}
      <div className="flex-none lg:hidden">
        <button
          className="btn btn-square btn-ghost"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Logo */}
      <div className="flex-1">
        <a className="text-xl font-bold text-primary font-montserrat">
          IdeaSpark
        </a>
      </div>
      
      {/* User menu */}
      <div className="flex-none">
        <UserMenu />
      </div>
    </header>
  );
}
```

### Sidebar Navigation with Role-Based Filtering

```tsx
// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: JSX.Element;
  requiredRole?: 'admin'; // undefined = all authenticated users
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <HomeIcon />,
  },
  {
    label: 'My Ideas',
    path: '/ideas',
    icon: <LightbulbIcon />,
  },
  {
    label: 'New Idea',
    path: '/ideas/new',
    icon: <PlusIcon />,
  },
  {
    label: 'Admin Dashboard',
    path: '/admin',
    icon: <SettingsIcon />,
    requiredRole: 'admin',
  },
  {
    label: 'Analytics',
    path: '/admin/analytics',
    icon: <ChartIcon />,
    requiredRole: 'admin',
  },
];

interface SidebarProps {
  onNavClick?: () => void; // Close mobile drawer on navigation
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const { user } = useAuth();
  
  const filteredItems = navItems.filter(item => {
    if (!item.requiredRole) return true;
    return user?.role === item.requiredRole;
  });

  return (
    <aside className="w-64 bg-base-100 min-h-full p-4">
      {/* Logo for mobile drawer (optional, since header shows it) */}
      <div className="lg:hidden mb-4 pb-4 border-b border-base-200">
        <span className="text-xl font-bold text-primary font-montserrat">
          IdeaSpark
        </span>
      </div>
      
      <ul className="menu menu-lg gap-1">
        {filteredItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              onClick={onNavClick}
              className={({ isActive }) =>
                isActive ? 'active bg-primary/10 text-primary' : ''
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

### UserMenu Component Pattern

```tsx
// src/components/layout/UserMenu.tsx
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function UserMenu() {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Get initials for avatar
  const initials = user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar placeholder"
      >
        <div className="bg-primary text-primary-content rounded-full w-10">
          <span className="text-sm">{initials}</span>
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow-lg bg-base-100 rounded-box w-52"
      >
        <li className="menu-title px-4 py-2">
          <span className="text-xs text-base-content/70">{user?.email}</span>
        </li>
        <li>
          <a className="justify-between">
            Profile
            <span className="badge badge-sm badge-ghost">Soon</span>
          </a>
        </li>
        <li>
          <a className="justify-between">
            Settings
            <span className="badge badge-sm badge-ghost">Soon</span>
          </a>
        </li>
        <div className="divider my-1"></div>
        <li>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="text-error"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : null}
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}
```

### Routes Configuration with Layout

```tsx
// src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { LoginPage, RegisterPage } from '../features/auth';
import { DashboardPage } from '../pages/DashboardPage';
import { MyIdeasPage } from '../pages/MyIdeasPage';
import { NewIdeaPage } from '../pages/NewIdeaPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

export const router = createBrowserRouter([
  // Public routes (no layout)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <div>Password Reset - Story 1.7</div>,
  },
  
  // Protected routes with AppLayout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'ideas',
        element: <MyIdeasPage />,
      },
      {
        path: 'ideas/new',
        element: <NewIdeaPage />,
      },
      // Admin routes
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/analytics',
        element: (
          <AdminRoute>
            <AnalyticsPage />
          </AdminRoute>
        ),
      },
    ],
  },
]);
```

### Icon Components (Simple SVG Icons)

Create simple inline SVG icons or use a lightweight icon approach:

```tsx
// Inline in Sidebar.tsx or create src/components/icons/index.tsx
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);
```

### Placeholder Page Pattern

```tsx
// src/pages/MyIdeasPage.tsx
export function MyIdeasPage() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h1 className="card-title text-2xl">My Ideas</h1>
        <p className="text-base-content/70">
          Your submitted ideas will appear here.
        </p>
        <div className="alert alert-info mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Coming in Epic 2: Idea Submission with AI Enhancement</span>
        </div>
      </div>
    </div>
  );
}
```

### PassportCard Theme Consistency

Ensure these theme values are applied (from Story 1.2):
- **Primary:** #E10514 (PassportCard red)
- **Border radius:** Use `rounded-xl` (20px) for cards, buttons
- **Fonts:** Montserrat for headings, Rubik for body (configured in CSS)
- **Shadows:** Use DaisyUI shadow classes consistently

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Components | `PascalCase` | `AppLayout`, `Header`, `Sidebar` |
| Files | `PascalCase.tsx` | `AppLayout.tsx`, `Header.tsx` |
| Props interfaces | `{Component}Props` | `HeaderProps`, `SidebarProps` |
| Event handlers | `on{Event}` | `onMenuClick`, `onNavClick` |

### Anti-Patterns to AVOID

1. **DO NOT** duplicate the useAuth logic - import from `features/auth/hooks/useAuth`
2. **DO NOT** hardcode routes in multiple places - use constants or a routes config
3. **DO NOT** forget to close mobile drawer after navigation (use onNavClick callback)
4. **DO NOT** use fixed heights that break on different screen sizes
5. **DO NOT** forget z-index for drawer overlay (z-40 or higher)
6. **DO NOT** skip ARIA labels for interactive elements (hamburger button)
7. **DO NOT** import authService directly in components - use useAuth hook

### Previous Story Learnings Applied

From **Story 1.4/1.5** (Auth Flow):
- `useAuth` hook provides: `user`, `isLoading`, `signOut`
- User object includes `role` field ('user' | 'admin')
- DaisyUI form patterns established

From **Story 1.6** (Logout & Session):
- `authService.signOut()` method exists
- Use navigate('/login') after signOut

From **Story 1.8** (Protected Routes):
- `ProtectedRoute` component wraps authenticated routes
- `AdminRoute` component wraps admin-only routes
- Both use `useAuth` for authorization checks

### Testing Checklist

- [ ] Desktop (>= 1024px): Sidebar is visible, no hamburger menu
- [ ] Mobile (< 1024px): Hamburger menu visible, sidebar hidden, drawer opens on click
- [ ] Navigation links route to correct pages
- [ ] Active link is highlighted with primary color
- [ ] User role "user": sees Dashboard, My Ideas, New Idea only
- [ ] User role "admin": sees all nav items including Admin Dashboard, Analytics
- [ ] User menu dropdown opens on click
- [ ] Logout redirects to login page and clears session
- [ ] Layout persists across page navigation
- [ ] Theme colors match PassportCard branding (#E10514)

### Dependencies on Previous Stories

- **Story 1.1:** ✅ Project initialized with React Router, DaisyUI
- **Story 1.2:** ✅ PassportCard theme configured (colors, fonts, radii)
- **Story 1.4/1.5:** ✅ useAuth hook with user state and role
- **Story 1.6:** ✅ signOut functionality in authService
- **Story 1.8:** ✅ ProtectedRoute and AdminRoute components

### Next Story Dependencies

- **Story 1.10 (Deploy to Vercel):** Uses this layout structure for all protected pages
- **Epic 2 (Ideas):** Will add content to MyIdeasPage, NewIdeaPage

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.9]
- [Source: _bmad-output/planning-artifacts/prd.md#FR50 - PassportCard-branded UI]
- [DaisyUI Drawer Component](https://daisyui.com/components/drawer/)
- [DaisyUI Navbar Component](https://daisyui.com/components/navbar/)
- [DaisyUI Menu Component](https://daisyui.com/components/menu/)
- [DaisyUI Dropdown Component](https://daisyui.com/components/dropdown/)
- [React Router NavLink](https://reactrouter.com/en/main/components/nav-link)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
