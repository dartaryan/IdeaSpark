-- Migration: Add rejection feedback columns to ideas table
-- Story 5.5: Reject Idea with Feedback
-- 
-- This migration adds columns to store rejection feedback and metadata
-- when an admin rejects an idea.

-- Add rejection_feedback column to store admin feedback
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS rejection_feedback TEXT NULL;

-- Add rejected_at column to track rejection timestamp
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE NULL;

-- Add rejected_by column to track which admin rejected the idea
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES auth.users(id) NULL;

-- Add comments for documentation
COMMENT ON COLUMN ideas.rejection_feedback IS 'Constructive feedback from admin explaining why idea was rejected (min 20, max 500 chars)';
COMMENT ON COLUMN ideas.rejected_at IS 'Timestamp when idea was rejected';
COMMENT ON COLUMN ideas.rejected_by IS 'User ID of admin who rejected the idea';

-- Create index for querying rejected ideas by admin
CREATE INDEX IF NOT EXISTS idx_ideas_rejected_by ON ideas(rejected_by) WHERE rejected_by IS NOT NULL;

-- Create index for querying rejected ideas by timestamp
CREATE INDEX IF NOT EXISTS idx_ideas_rejected_at ON ideas(rejected_at) WHERE rejected_at IS NOT NULL;
