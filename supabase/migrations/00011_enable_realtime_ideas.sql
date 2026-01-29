-- Story 5.8 - Task 5: Enable Supabase Realtime on ideas table
-- Subtask 5.2: ALTER PUBLICATION supabase_realtime ADD TABLE ideas
-- This enables real-time updates for the ideas table, allowing admins to see
-- live changes to ideas (INSERT, UPDATE, DELETE) without manual refresh

-- Enable Realtime for ideas table
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;

-- Subtask 5.6: Document realtime configuration
-- Realtime is now enabled on the ideas table
-- Admins will receive realtime events for all ideas (via RLS policies)
-- Regular users will only receive realtime events for their own ideas
-- This supports <500ms latency requirement (NFR-P5)

-- Verify RLS policies allow admins to receive realtime events
-- (Existing RLS policies from 00004_create_ideas_rls_policies.sql already handle this)
-- Policy: "Admins can view all ideas" allows admins to receive all realtime events
-- Policy: "Users can view own ideas" allows users to receive their own realtime events

COMMENT ON TABLE ideas IS 'Ideas table with Realtime enabled for live dashboard updates (<500ms latency)';
