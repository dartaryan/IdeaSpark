-- Story 6.6 Task 16: Database Query Optimization for User Activity
-- Subtask 16.1-16.3: Add composite indexes for user activity queries

-- Subtask 16.3: Create composite index on ideas(user_id, created_at)
-- This index optimizes queries that filter by user and date range
-- Used by: top contributors query, active users query, recent submissions query
CREATE INDEX IF NOT EXISTS idx_ideas_user_created ON ideas(user_id, created_at DESC);

-- Subtask 16.1: Verify index exists on users(created_at) for join date sorting
-- This index helps with sorting users by join date in leaderboards
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Subtask 16.2: Verify index exists on ideas(user_id) for user-idea lookups
-- This is likely already created by the foreign key, but we ensure it exists
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);

-- Add comment for documentation
COMMENT ON INDEX idx_ideas_user_created IS 'Story 6.6: Composite index for user activity queries - optimizes filtering by user and date range';
COMMENT ON INDEX idx_users_created_at IS 'Story 6.6: Index for user join date sorting in leaderboards';
COMMENT ON INDEX idx_ideas_user_id IS 'Story 6.6: Index for user-idea lookups and aggregations';
