-- Migration: Add function for efficient ideas breakdown by time period
-- Story 6.2 Task 8: Implement time period breakdown query
-- This function uses PostgreSQL's date_trunc for efficient grouping

-- Create function to get ideas breakdown by week
CREATE OR REPLACE FUNCTION get_ideas_breakdown(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL,
  interval_type TEXT DEFAULT 'week'
)
RETURNS TABLE (
  period TEXT,
  count BIGINT,
  period_start TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If no date range provided, get all ideas
  IF start_date IS NULL THEN
    start_date := '-infinity'::TIMESTAMPTZ;
  END IF;
  
  IF end_date IS NULL THEN
    end_date := 'infinity'::TIMESTAMPTZ;
  END IF;

  -- Return weekly breakdown with formatted labels
  RETURN QUERY
  SELECT 
    TO_CHAR(date_trunc(interval_type, created_at), 'Mon DD, YYYY') AS period,
    COUNT(*) AS count,
    date_trunc(interval_type, created_at) AS period_start
  FROM ideas
  WHERE created_at >= start_date
    AND created_at < end_date
  GROUP BY date_trunc(interval_type, created_at)
  ORDER BY date_trunc(interval_type, created_at) ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_ideas_breakdown TO authenticated;

-- Add index on created_at for better performance (Task 12)
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);

-- Comment on function
COMMENT ON FUNCTION get_ideas_breakdown IS 'Returns ideas grouped by time period (week/month) with counts. Used for analytics breakdown.';
