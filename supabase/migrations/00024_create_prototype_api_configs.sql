-- 00024_create_prototype_api_configs.sql
-- Epic 10, Story 10.1: API Configuration Interface
-- Creates the prototype_api_configs table for storing API endpoint configurations per prototype.

-- Enable RLS on this table
CREATE TABLE prototype_api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prototype_id UUID NOT NULL REFERENCES prototypes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET' CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  headers JSONB DEFAULT '{}',
  is_mock BOOLEAN NOT NULL DEFAULT false,
  mock_response JSONB,
  mock_status_code INTEGER DEFAULT 200,
  mock_delay_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(prototype_id, name)
);

-- Index for efficient lookups by prototype_id
CREATE INDEX idx_prototype_api_configs_prototype_id ON prototype_api_configs(prototype_id);

-- Enable Row Level Security
ALTER TABLE prototype_api_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can manage configs for their own prototypes (via prototype ownership)

CREATE POLICY "Users can view own prototype api configs"
  ON prototype_api_configs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM prototypes WHERE prototypes.id = prototype_api_configs.prototype_id
    AND prototypes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own prototype api configs"
  ON prototype_api_configs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM prototypes WHERE prototypes.id = prototype_api_configs.prototype_id
    AND prototypes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own prototype api configs"
  ON prototype_api_configs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM prototypes WHERE prototypes.id = prototype_api_configs.prototype_id
    AND prototypes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own prototype api configs"
  ON prototype_api_configs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM prototypes WHERE prototypes.id = prototype_api_configs.prototype_id
    AND prototypes.user_id = auth.uid()
  ));

-- Admins can view all configs
CREATE POLICY "Admins can view all prototype api configs"
  ON prototype_api_configs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_prototype_api_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_prototype_api_configs_updated_at
  BEFORE UPDATE ON prototype_api_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_prototype_api_configs_updated_at();

COMMENT ON TABLE prototype_api_configs IS 'API endpoint configurations for prototypes (Epic 10)';
COMMENT ON COLUMN prototype_api_configs.name IS 'Unique endpoint name within a prototype (used as apiClient key)';
COMMENT ON COLUMN prototype_api_configs.method IS 'HTTP method: GET, POST, PUT, PATCH, DELETE';
COMMENT ON COLUMN prototype_api_configs.headers IS 'Key-value pairs of HTTP headers as JSONB';
COMMENT ON COLUMN prototype_api_configs.is_mock IS 'When true, apiClient returns mock_response instead of making real HTTP call';
COMMENT ON COLUMN prototype_api_configs.mock_response IS 'Mock JSON response returned when is_mock = true';
COMMENT ON COLUMN prototype_api_configs.mock_status_code IS 'HTTP status code for mock response (default 200)';
COMMENT ON COLUMN prototype_api_configs.mock_delay_ms IS 'Simulated delay in ms for mock responses (default 0)';
