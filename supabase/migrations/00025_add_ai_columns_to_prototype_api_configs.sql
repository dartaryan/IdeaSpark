-- 00025_add_ai_columns_to_prototype_api_configs.sql
-- Epic 10, Story 10.4: AI API Integration in Prototypes
-- Adds AI-specific columns to prototype_api_configs for AI endpoint support.

ALTER TABLE prototype_api_configs
  ADD COLUMN is_ai BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN ai_model TEXT DEFAULT 'gemini-2.5-flash',
  ADD COLUMN ai_system_prompt TEXT,
  ADD COLUMN ai_max_tokens INTEGER DEFAULT 1024,
  ADD COLUMN ai_temperature NUMERIC(3,2) DEFAULT 0.7;

-- AI endpoints must have a system prompt
ALTER TABLE prototype_api_configs
  ADD CONSTRAINT chk_ai_system_prompt
  CHECK (is_ai = false OR ai_system_prompt IS NOT NULL);

-- AI temperature must be between 0 and 2
ALTER TABLE prototype_api_configs
  ADD CONSTRAINT chk_ai_temperature
  CHECK (ai_temperature IS NULL OR (ai_temperature >= 0 AND ai_temperature <= 2));

-- AI max tokens must be positive and within bounds
ALTER TABLE prototype_api_configs
  ADD CONSTRAINT chk_ai_max_tokens
  CHECK (ai_max_tokens IS NULL OR (ai_max_tokens >= 1 AND ai_max_tokens <= 8192));

COMMENT ON COLUMN prototype_api_configs.is_ai IS 'When true, endpoint routes through AI Edge Function instead of API proxy';
COMMENT ON COLUMN prototype_api_configs.ai_model IS 'AI model identifier (e.g., gemini-2.5-flash)';
COMMENT ON COLUMN prototype_api_configs.ai_system_prompt IS 'System instructions for the AI model';
COMMENT ON COLUMN prototype_api_configs.ai_max_tokens IS 'Maximum output tokens for AI response (default 1024)';
COMMENT ON COLUMN prototype_api_configs.ai_temperature IS 'AI generation temperature 0-2 (default 0.7)';
