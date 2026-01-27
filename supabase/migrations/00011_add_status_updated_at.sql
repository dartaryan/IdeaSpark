-- Migration: Add status_updated_at column to ideas table
-- Story: 5.3 - Idea Pipeline Kanban View
-- Purpose: Track when idea status last changed for "days in stage" calculation

-- Add status_updated_at column to ideas table
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE;

-- Set initial value to created_at for existing records
UPDATE ideas 
SET status_updated_at = created_at 
WHERE status_updated_at IS NULL;

-- Create trigger function to update status_updated_at when status changes
CREATE OR REPLACE FUNCTION update_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call function on status updates
CREATE TRIGGER trigger_update_status_updated_at
BEFORE UPDATE ON ideas
FOR EACH ROW
EXECUTE FUNCTION update_status_updated_at();
