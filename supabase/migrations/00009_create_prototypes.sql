-- Migration: Create prototypes table with RLS policies
-- Story: 4.1 - Create Prototypes Database Table and Service Layer
-- Date: 2026-01-25

-- Create status enum type
CREATE TYPE prototype_status AS ENUM ('generating', 'ready', 'failed');

-- Create prototypes table
CREATE TABLE prototypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prd_id UUID NOT NULL REFERENCES prd_documents(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT,                          -- URL to view the prototype (from Open-Lovable)
  code TEXT,                         -- Generated React code
  version INTEGER NOT NULL DEFAULT 1,
  refinement_prompt TEXT,            -- User's refinement request (null for initial)
  status prototype_status NOT NULL DEFAULT 'generating',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for query performance
CREATE INDEX idx_prototypes_user_id ON prototypes(user_id);
CREATE INDEX idx_prototypes_prd_id ON prototypes(prd_id);
CREATE INDEX idx_prototypes_idea_id ON prototypes(idea_id);
CREATE UNIQUE INDEX idx_prototypes_prd_version ON prototypes(prd_id, version);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prototypes_updated_at
  BEFORE UPDATE ON prototypes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE prototypes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own prototypes
CREATE POLICY "Users can view own prototypes"
  ON prototypes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own prototypes
CREATE POLICY "Users can create own prototypes"
  ON prototypes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prototypes
CREATE POLICY "Users can update own prototypes"
  ON prototypes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all prototypes
CREATE POLICY "Admins can view all prototypes"
  ON prototypes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON prototypes TO authenticated;
GRANT USAGE ON TYPE prototype_status TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE prototypes IS 'Stores prototype generations and refinement history for PRDs';
COMMENT ON COLUMN prototypes.version IS 'Version number for tracking refinement history';
COMMENT ON COLUMN prototypes.refinement_prompt IS 'User prompt for refinement (null for initial version)';
COMMENT ON COLUMN prototypes.status IS 'Generation status: generating, ready, or failed';
