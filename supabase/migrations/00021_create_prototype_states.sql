-- Migration: 00021_create_prototype_states
-- Story 8.2: Save Prototype State to Database
-- Creates the prototype_states table for persisting user interaction state per prototype.

-- Table: prototype_states
CREATE TABLE IF NOT EXISTS prototype_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prototype_id UUID NOT NULL REFERENCES prototypes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prototype_id, user_id)
);

-- Indexes for query performance
CREATE INDEX idx_prototype_states_prototype_id ON prototype_states(prototype_id);
CREATE INDEX idx_prototype_states_user_id ON prototype_states(user_id);

-- Updated_at trigger (reuse existing function from earlier migrations)
CREATE TRIGGER update_prototype_states_updated_at
  BEFORE UPDATE ON prototype_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE prototype_states ENABLE ROW LEVEL SECURITY;

-- Users can view their own prototype states
CREATE POLICY "Users can view their own prototype states"
  ON prototype_states FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own prototype states
CREATE POLICY "Users can insert their own prototype states"
  ON prototype_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prototype states
CREATE POLICY "Users can update their own prototype states"
  ON prototype_states FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own prototype states
CREATE POLICY "Users can delete their own prototype states"
  ON prototype_states FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all prototype states
CREATE POLICY "Admins can view all prototype states"
  ON prototype_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
