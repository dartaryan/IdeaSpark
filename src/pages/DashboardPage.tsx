import { useAuth } from '../features/auth/hooks/useAuth';

/**
 * Dashboard page - main landing page for authenticated users
 * Auth protection is now handled by AuthenticatedLayout
 */
export function DashboardPage() {
  const { user } = useAuth();

  // User is guaranteed to exist here because of AuthenticatedLayout
  if (!user) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl font-bold mb-6">Dashboard</h1>

            <div className="alert alert-success mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Welcome to IdeaSpark! You are successfully logged in.</span>
            </div>

            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Email</div>
                <div className="stat-value text-lg">{user.email}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Role</div>
                <div className="stat-value text-lg capitalize">{user.role}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Member Since</div>
                <div className="stat-value text-lg">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="divider my-6">Coming Soon</div>

            <p className="text-center text-base-content/60">
              The full dashboard will be available in Story 1.9 (Application Shell)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
