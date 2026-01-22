-- Migration: Create PRD RLS Policies
-- Story: 3.1 - Create PRD Database Tables and Service Layer
-- Date: 2026-01-22

-- ============================================
-- PRD Documents RLS Policies
-- ============================================

-- Enable RLS on prd_documents
ALTER TABLE prd_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own PRDs
CREATE POLICY "Users can view own PRDs"
  ON prd_documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert PRDs for their own ideas
CREATE POLICY "Users can insert own PRDs"
  ON prd_documents
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = idea_id
      AND ideas.user_id = auth.uid()
    )
  );

-- Users can update their own PRDs
CREATE POLICY "Users can update own PRDs"
  ON prd_documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own PRDs
CREATE POLICY "Users can delete own PRDs"
  ON prd_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all PRDs
CREATE POLICY "Admins can view all PRDs"
  ON prd_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update all PRDs
CREATE POLICY "Admins can update all PRDs"
  ON prd_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- PRD Messages RLS Policies
-- ============================================

-- Enable RLS on prd_messages
ALTER TABLE prd_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their own PRDs
CREATE POLICY "Users can view own PRD messages"
  ON prd_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prd_documents
      WHERE prd_documents.id = prd_id
      AND prd_documents.user_id = auth.uid()
    )
  );

-- Users can insert messages for their own PRDs
CREATE POLICY "Users can insert own PRD messages"
  ON prd_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prd_documents
      WHERE prd_documents.id = prd_id
      AND prd_documents.user_id = auth.uid()
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all PRD messages"
  ON prd_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
