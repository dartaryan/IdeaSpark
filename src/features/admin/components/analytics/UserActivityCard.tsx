// src/features/admin/components/analytics/UserActivityCard.tsx
// Story 6.6 Task 6: User Activity Card Component

import type { UserActivityMetrics } from '../../analytics';
import { TopContributorsLeaderboard } from './TopContributorsLeaderboard';
import { RecentSubmissionsList } from './RecentSubmissionsList';

/**
 * Story 6.6 Task 6: UserActivityCard Component
 * Subtask 6.2: Accept userActivity data via props
 */
interface UserActivityCardProps {
  data: UserActivityMetrics | undefined;
  isLoading?: boolean;
}

/**
 * Story 6.6 Task 6: UserActivityCard Component
 * Displays user activity metrics: total users, active users, engagement percentage
 * Subtask 6.3-6.10: Card with stats, trend indicator, loading skeleton, empty state
 */
export function UserActivityCard({ data, isLoading }: UserActivityCardProps) {
  // Subtask 6.9: Loading skeleton
  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
        <div className="card-body">
          <h2 className="card-title text-lg font-semibold">User Activity</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-base-300 rounded w-3/4"></div>
            <div className="h-6 bg-base-300 rounded w-1/2"></div>
            <div className="h-6 bg-base-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Subtask 6.10: Empty state
  if (!data || data.totalUsers === 0) {
    return (
      <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
        <div className="card-body">
          <h2 className="card-title text-lg font-semibold">User Activity</h2>
          <div className="text-base-content/60 text-center py-8">
            <p>No user data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Subtask 6.6: Determine trend icon and color
  const getTrendIcon = () => {
    if (data.trend.direction === 'up') return '↑';
    if (data.trend.direction === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (data.trend.direction === 'up') return 'text-success';
    if (data.trend.direction === 'down') return 'text-error';
    return 'text-base-content/60';
  };

  // Subtask 6.5: Calculate engagement level color
  const getEngagementColor = () => {
    if (data.activePercentage >= 50) return 'text-success';
    if (data.activePercentage >= 25) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '20px' }}>
      <div className="card-body">
        {/* Subtask 6.3: Card title */}
        <h2 className="card-title text-lg font-semibold mb-4">User Activity</h2>

        {/* Subtask 6.4: Stats section with total users and active users */}
        <div className="stats stats-vertical lg:stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-3xl">{data.totalUsers}</div>
            <div className="stat-desc">Registered accounts</div>
          </div>

          <div className="stat">
            <div className="stat-title">Active Users</div>
            <div className="stat-value text-3xl flex items-center gap-2">
              {data.activeUsers}
              {/* Subtask 6.6: Trend indicator */}
              <span className={`text-xl ${getTrendColor()}`}>
                {getTrendIcon()}
              </span>
            </div>
            <div className="stat-desc">
              {data.trend.change > 0 ? '+' : ''}{data.trend.change} from previous period
            </div>
          </div>
        </div>

        {/* Subtask 6.5: Active percentage with visual indicator */}
        <div className="mt-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Engagement Rate</span>
            <span className={`text-2xl font-bold ${getEngagementColor()}`}>
              {data.activePercentage.toFixed(1)}%
            </span>
          </div>
          {/* Visual progress bar */}
          <progress 
            className={`progress ${
              data.activePercentage >= 50 ? 'progress-success' :
              data.activePercentage >= 25 ? 'progress-warning' :
              'progress-error'
            }`}
            value={data.activePercentage}
            max="100"
          ></progress>
          <div className="text-xs text-base-content/60 mt-1">
            {data.activePercentage >= 50 ? 'High engagement' :
             data.activePercentage >= 25 ? 'Medium engagement' :
             'Low engagement - consider re-engagement campaigns'}
          </div>
        </div>

        {/* Story 6.6 Task 7 & 8: Leaderboard and Recent Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div>
            <TopContributorsLeaderboard contributors={data.topContributors} />
          </div>
          <div>
            <RecentSubmissionsList submissions={data.recentSubmissions} />
          </div>
        </div>

        {/* Subtask 6.7 & 6.8: Use DaisyUI components with PassportCard styling */}
        <style jsx>{`
          .card {
            border: 2px solid #E10514;
          }
        `}</style>
      </div>
    </div>
  );
}
