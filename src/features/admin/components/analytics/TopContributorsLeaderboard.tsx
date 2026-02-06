// src/features/admin/components/analytics/TopContributorsLeaderboard.tsx
// Story 6.6 Task 7: Top Contributors Leaderboard Component
// Story 0.7: Replaced console.log navigation with useNavigate, onKeyPress → onKeyDown

import { useNavigate } from 'react-router-dom';
import type { TopContributorData } from '../../analytics';

/**
 * Story 6.6 Task 7: TopContributorsLeaderboard Component
 * Subtask 7.2: Accept topContributors via props
 */
interface TopContributorsLeaderboardProps {
  contributors: TopContributorData[];
}

/**
 * Story 6.6 Task 7: TopContributorsLeaderboard Component
 * Displays ranked list of top contributors with medals for top 3
 * Subtask 7.3-7.11: Leaderboard with ranking, name, email, ideas count, interactive rows
 */
export function TopContributorsLeaderboard({ contributors }: TopContributorsLeaderboardProps) {
  const navigate = useNavigate();

  // Subtask 7.10: Empty state
  if (!contributors || contributors.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        <p>No contributors yet</p>
        <p className="text-sm mt-2">Start submitting ideas to see top contributors</p>
      </div>
    );
  }

  // Subtask 7.6: Get trophy/medal icons for top 3
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div className="overflow-x-auto">
      {/* Subtask 7.3: Leaderboard title */}
      <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>

      {/* Subtask 7.11: Use responsive layout */}
      <div className="space-y-2">
        {contributors.map((contributor, index) => {
          const rank = index + 1;
          const medal = getMedalIcon(rank);

          return (
            <div
              key={contributor.userId}
              className={`
                flex items-center justify-between p-3 rounded-lg
                transition-colors duration-200
                hover:bg-base-200 cursor-pointer
                ${rank === 1 ? 'bg-base-200/50' : ''}
              `}
              onClick={() => {
                navigate(`/admin/users/${contributor.userId}`);
              }}
              role="button"
              tabIndex={0}
              aria-label={`View contributor: ${contributor.userName || 'Unknown User'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/admin/users/${contributor.userId}`);
                }
              }}
            >
              {/* Subtask 7.4: Ranking number and Subtask 7.5: Display rank, name, email, count, percentage */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Rank and Medal */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-bold text-base-content/60 w-6 text-right">
                    {rank}
                  </span>
                  {medal && <span className="text-xl">{medal}</span>}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {contributor.userName || 'Unknown User'}
                  </div>
                  <div className="text-sm text-base-content/60 truncate">
                    {contributor.userEmail}
                  </div>
                </div>
              </div>

              {/* Ideas Count and Percentage */}
              <div className="text-right flex-shrink-0">
                <div className="font-semibold text-lg">
                  {contributor.ideasCount}
                </div>
                <div className="text-sm text-base-content/60">
                  {contributor.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
