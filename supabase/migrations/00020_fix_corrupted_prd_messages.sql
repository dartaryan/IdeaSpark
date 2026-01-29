-- Migration: Fix Corrupted PRD Messages
-- Purpose: Identify and clean up PRD messages that contain raw JSON instead of plain text
-- Date: 2026-01-29
-- 
-- IMPORTANT: This is a one-time cleanup migration
-- Run this after reviewing the identified corrupted messages

-- Step 1: Identify corrupted messages (messages that start with '{"aiMessage"')
-- These are messages where the entire edge function response was saved instead of just the message content
DO $$
DECLARE
  corrupted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO corrupted_count
  FROM prd_messages
  WHERE content LIKE '{"aiMessage"%'
     OR content LIKE '{"error"%';
  
  RAISE NOTICE 'Found % potentially corrupted messages', corrupted_count;
END $$;

-- Step 2: Create a backup table before making changes
CREATE TABLE IF NOT EXISTS prd_messages_backup_20260129 AS
SELECT * FROM prd_messages
WHERE content LIKE '{"aiMessage"%'
   OR content LIKE '{"error"%';

-- Step 3: Fix corrupted messages by extracting the aiMessage field
-- This attempts to parse JSON and extract just the message content
UPDATE prd_messages
SET content = (
  CASE 
    WHEN content LIKE '{"aiMessage"%' THEN
      -- Try to extract aiMessage from JSON
      (content::jsonb->>'aiMessage')
    ELSE content
  END
)
WHERE content LIKE '{"aiMessage"%'
  AND content::jsonb->>'aiMessage' IS NOT NULL;

-- Step 4: Delete messages that couldn't be fixed (error responses stored as messages)
DELETE FROM prd_messages
WHERE content LIKE '{"error"%';

-- Step 5: Report results
DO $$
DECLARE
  fixed_count INTEGER;
  deleted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fixed_count
  FROM prd_messages_backup_20260129
  WHERE content LIKE '{"aiMessage"%';
  
  SELECT COUNT(*) INTO deleted_count
  FROM prd_messages_backup_20260129
  WHERE content LIKE '{"error"%';
  
  RAISE NOTICE 'Migration complete:';
  RAISE NOTICE '  - Fixed % messages by extracting aiMessage', fixed_count;
  RAISE NOTICE '  - Deleted % error response messages', deleted_count;
  RAISE NOTICE '  - Backup stored in prd_messages_backup_20260129';
END $$;

-- Note: The backup table can be dropped after verifying the migration:
-- DROP TABLE prd_messages_backup_20260129;
