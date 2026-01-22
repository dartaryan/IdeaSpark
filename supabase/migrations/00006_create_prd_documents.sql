-- Migration: Create PRD Documents Table
-- Story: 3.1 - Create PRD Database Tables and Service Layer
-- Date: 2026-01-22

-- Create prd status enum
CREATE TYPE prd_status AS ENUM (
  'draft',
  'complete'
);

-- Create prd_documents table
CREATE TABLE prd_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status prd_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for idea_id (PRD lookup by idea)
CREATE INDEX idx_prd_documents_idea_id ON prd_documents(idea_id);

-- Create index for user_id (user's PRDs)
CREATE INDEX idx_prd_documents_user_id ON prd_documents(user_id);

-- Create index for status (filtering)
CREATE INDEX idx_prd_documents_status ON prd_documents(status);

-- Create updated_at trigger (reuse existing function from ideas migration)
CREATE TRIGGER update_prd_documents_updated_at
  BEFORE UPDATE ON prd_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure one PRD per idea (unique constraint)
CREATE UNIQUE INDEX idx_prd_documents_idea_unique ON prd_documents(idea_id);
