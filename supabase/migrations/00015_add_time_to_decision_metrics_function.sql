-- Story 6.5 Task 1 & Task 14: Time-to-Decision Metrics Database Function
-- Subtask 1.2-1.10 & Subtask 14.1-14.8: Optimized query with indexes

-- Subtask 14.1-14.2: Create indexes on timestamp columns for query performance
CREATE INDEX IF NOT EXISTS idx_ideas_approved_at ON ideas(approved_at) WHERE approved_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ideas_rejected_at ON ideas(rejected_at) WHERE rejected_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prd_documents_completed_at ON prd_documents(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prototypes_created_at ON prototypes(created_at);

-- Subtask 14.2: Composite index for time queries
CREATE INDEX IF NOT EXISTS idx_ideas_status_timestamps ON ideas(status, created_at, approved_at, rejected_at);

-- Subtask 1.1: Create function to calculate time-to-decision metrics
-- Subtask 14.5: Use single optimized query with JOINs
CREATE OR REPLACE FUNCTION get_time_to_decision_metrics(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE(
  avg_submission_to_decision_days NUMERIC,
  submission_to_decision_count BIGINT,
  avg_approval_to_prd_days NUMERIC,
  approval_to_prd_count BIGINT,
  avg_prd_to_prototype_days NUMERIC,
  prd_to_prototype_count BIGINT,
  avg_end_to_end_days NUMERIC,
  end_to_end_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Subtask 14.8: Use database-level calculation (not JavaScript)
  -- Subtask 1.10: Single query with LEFT JOINs to get all timestamps efficiently
  RETURN QUERY
  SELECT
    -- Subtask 1.2-1.3: Time from submission to approval/rejection (decision)
    -- Subtask 1.6: Calculate AVG() for each time metric
    -- Subtask 1.7: Handle NULL values (ideas that haven't reached next stage yet)
    AVG(
      CASE 
        WHEN i.approved_at IS NOT NULL OR i.rejected_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (COALESCE(i.approved_at, i.rejected_at) - i.created_at)) / 86400
        ELSE NULL
      END
    ) AS avg_submission_to_decision_days,
    -- Count of ideas with decision timestamp
    COUNT(
      CASE 
        WHEN i.approved_at IS NOT NULL OR i.rejected_at IS NOT NULL 
        THEN 1
        ELSE NULL
      END
    ) AS submission_to_decision_count,
    
    -- Subtask 1.4: Time from approval to PRD completion
    AVG(
      CASE 
        WHEN p.completed_at IS NOT NULL AND i.approved_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (p.completed_at - i.approved_at)) / 86400
        ELSE NULL
      END
    ) AS avg_approval_to_prd_days,
    -- Count of ideas with PRD completed
    COUNT(
      CASE 
        WHEN p.completed_at IS NOT NULL AND i.approved_at IS NOT NULL
        THEN 1
        ELSE NULL
      END
    ) AS approval_to_prd_count,
    
    -- Subtask 1.5: Time from PRD completion to prototype
    AVG(
      CASE 
        WHEN pr.created_at IS NOT NULL AND p.completed_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (pr.created_at - p.completed_at)) / 86400
        ELSE NULL
      END
    ) AS avg_prd_to_prototype_days,
    -- Count of ideas with prototype created
    COUNT(
      CASE 
        WHEN pr.created_at IS NOT NULL AND p.completed_at IS NOT NULL
        THEN 1
        ELSE NULL
      END
    ) AS prd_to_prototype_count,
    
    -- Subtask 1.6: End-to-end time (idea creation to prototype)
    AVG(
      CASE 
        WHEN pr.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (pr.created_at - i.created_at)) / 86400
        ELSE NULL
      END
    ) AS avg_end_to_end_days,
    -- Count of ideas with prototype (completed journey)
    COUNT(
      CASE 
        WHEN pr.created_at IS NOT NULL
        THEN 1
        ELSE NULL
      END
    ) AS end_to_end_count
  FROM ideas i
  -- Subtask 1.10: JOIN ideas with prd_documents and prototypes tables
  LEFT JOIN prd_documents p ON i.id = p.idea_id
  LEFT JOIN prototypes pr ON i.id = pr.idea_id
  -- Subtask 1.8: Filter by date range
  WHERE i.created_at >= start_date AND i.created_at < end_date;
END;
$$;

-- Grant execute permission to authenticated users (RLS handles admin-only access)
GRANT EXECUTE ON FUNCTION get_time_to_decision_metrics(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION get_time_to_decision_metrics IS 'Story 6.5: Calculate average time metrics for innovation pipeline stages';
