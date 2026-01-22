-- Migration: Create PRD Messages Table
-- Story: 3.1 - Create PRD Database Tables and Service Layer
-- Date: 2026-01-22

-- Create message role enum
CREATE TYPE message_role AS ENUM (
  'user',
  'assistant'
);

-- Create prd_messages table
CREATE TABLE prd_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prd_id UUID NOT NULL REFERENCES prd_documents(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for prd_id (message retrieval by PRD)
CREATE INDEX idx_prd_messages_prd_id ON prd_messages(prd_id);

-- Create index for ordering by created_at
CREATE INDEX idx_prd_messages_created_at ON prd_messages(created_at);
