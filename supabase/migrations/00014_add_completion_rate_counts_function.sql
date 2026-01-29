-- Migration: Add function for efficient completion rate calculation
-- Story 6.4 Task 1 & Task 13: Optimized completion rate queries
-- Subtask 13.5: Single query using COUNT FILTER for all conversion counts

-- Create function to get completion rate counts in a single optimized query
CREATE OR REPLACE FUNCTION get_completion_rate_counts(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE (
  submitted_count BIGINT,
  approved_count BIGINT,
  prd_complete_count BIGINT,
  prototype_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Story 6.4 Task 13 Subtask 13.5: Single optimized query with COUNT FILTER
  -- Uses composite index idx_ideas_status_created_at for efficient filtering
  RETURN QUERY
  SELECT 
    -- Subtask 1.2: Submitted count (all ideas except nothing - all statuses)
    COUNT(*) FILTER (WHERE status IN ('submitted', 'approved', 'prd_development', 'prototype_complete', 'rejected')) AS submitted_count,
    
    -- Subtask 1.3: Approved count (ideas that passed approval)
    COUNT(*) FILTER (WHERE status IN ('approved', 'prd_development', 'prototype_complete')) AS approved_count,
    
    -- Subtask 1.4: PRD complete count (ideas in PRD phase or beyond)
    COUNT(*) FILTER (WHERE status IN ('prd_development', 'prototype_complete')) AS prd_complete_count,
    
    -- Subtask 1.5: Prototype complete count (ideas with prototypes)
    COUNT(*) FILTER (WHERE status = 'prototype_complete') AS prototype_count
  FROM ideas
  WHERE created_at >= start_date
    AND created_at < end_date; -- Subtask 1.11: Apply date range filter
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_completion_rate_counts TO authenticated;

-- Story 6.4 Task 13 Subtask 13.2: Verify composite index exists (created in Story 6.3)
-- This index optimizes queries filtering by status and created_at
-- CREATE INDEX IF NOT EXISTS idx_ideas_status_created_at ON ideas(status, created_at);
-- (Already exists from Story 6.3)

-- Comment on function
COMMENT ON FUNCTION get_completion_rate_counts IS 'Returns conversion counts for completion rate metrics. Uses optimized COUNT FILTER for single-query performance. Story 6.4 Task 1 & 13.';
