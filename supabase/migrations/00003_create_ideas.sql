-- Create ideas table for storing user idea submissions
-- Migration: 00003_create_ideas.sql

-- Create idea status enum
CREATE TYPE idea_status AS ENUM (
  'submitted',
  'approved',
  'prd_development',
  'prototype_complete',
  'rejected'
);

-- Create ideas table
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  impact TEXT NOT NULL,
  enhanced_problem TEXT,
  enhanced_solution TEXT,
  enhanced_impact TEXT,
  status idea_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for user_id (common query pattern)
CREATE INDEX idx_ideas_user_id ON ideas(user_id);

-- Create index for status (admin filtering)
CREATE INDEX idx_ideas_status ON ideas(status);

-- Create updated_at trigger (reuses existing function from 00001_create_users.sql)
CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment for documentation
COMMENT ON TABLE ideas IS 'User idea submissions with AI enhancement fields';
COMMENT ON COLUMN ideas.enhanced_problem IS 'AI-enhanced version of problem statement';
COMMENT ON COLUMN ideas.enhanced_solution IS 'AI-enhanced version of solution description';
COMMENT ON COLUMN ideas.enhanced_impact IS 'AI-enhanced version of impact assessment';
