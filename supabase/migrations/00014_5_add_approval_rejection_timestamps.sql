-- Migration: Add approval and rejection timestamp columns to ideas table
-- Story: 6.5 - Time-to-Decision Metrics
-- Purpose: Track when ideas are approved or rejected for time-to-decision calculations

-- Add approved_at column to track approval timestamp
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add rejected_at column to track rejection timestamp
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Create trigger function to set approved_at or rejected_at when status changes
CREATE OR REPLACE FUNCTION update_decision_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set approved_at when status changes to 'approved'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved' THEN
    NEW.approved_at = NOW();
  END IF;
  
  -- Set rejected_at when status changes to 'rejected'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'rejected' THEN
    NEW.rejected_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call function on status updates
CREATE TRIGGER trigger_update_decision_timestamps
BEFORE UPDATE ON ideas
FOR EACH ROW
EXECUTE FUNCTION update_decision_timestamps();

-- Set initial values for existing records based on status_updated_at
-- Only set if the idea is currently in approved or rejected status
UPDATE ideas 
SET approved_at = status_updated_at 
WHERE status = 'approved' AND approved_at IS NULL AND status_updated_at IS NOT NULL;

UPDATE ideas 
SET rejected_at = status_updated_at 
WHERE status = 'rejected' AND rejected_at IS NULL AND status_updated_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN ideas.approved_at IS 'Timestamp when idea was approved';
COMMENT ON COLUMN ideas.rejected_at IS 'Timestamp when idea was rejected';
