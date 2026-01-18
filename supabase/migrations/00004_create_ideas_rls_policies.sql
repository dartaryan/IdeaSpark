-- Row Level Security policies for ideas table
-- Migration: 00004_create_ideas_rls_policies.sql

-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Users can view their own ideas
CREATE POLICY "Users can view own ideas"
  ON ideas
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own ideas
CREATE POLICY "Users can insert own ideas"
  ON ideas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ideas
CREATE POLICY "Users can update own ideas"
  ON ideas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own ideas
CREATE POLICY "Users can delete own ideas"
  ON ideas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all ideas
CREATE POLICY "Admins can view all ideas"
  ON ideas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update all ideas (for status changes)
CREATE POLICY "Admins can update all ideas"
  ON ideas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
