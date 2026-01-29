-- Migration: Add completed_at timestamp column to prd_documents table
-- Story: 6.5 - Time-to-Decision Metrics
-- Purpose: Track when PRD documents are marked as complete for time-to-decision calculations

-- Add completed_at column to track completion timestamp
ALTER TABLE prd_documents 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create trigger function to set completed_at when status changes to 'complete'
CREATE OR REPLACE FUNCTION update_prd_completed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Set completed_at when status changes to 'complete'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'complete' THEN
    NEW.completed_at = NOW();
  END IF;
  
  -- Clear completed_at if status changes back from 'complete' to 'draft'
  IF OLD.status = 'complete' AND NEW.status = 'draft' THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call function on status updates
CREATE TRIGGER trigger_update_prd_completed_timestamp
BEFORE UPDATE ON prd_documents
FOR EACH ROW
EXECUTE FUNCTION update_prd_completed_timestamp();

-- Set initial values for existing records based on updated_at
-- Only set if the PRD is currently in 'complete' status
UPDATE prd_documents 
SET completed_at = updated_at 
WHERE status = 'complete' AND completed_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN prd_documents.completed_at IS 'Timestamp when PRD was marked as complete';
