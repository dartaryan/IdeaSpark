-- 00022_add_prototype_sharing_enhancements.sql
-- Epic 9 infrastructure: password protection, expiration, revocation

ALTER TABLE prototypes
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS share_revoked BOOLEAN DEFAULT FALSE;

-- Update public RLS policy to respect revocation and expiration
DROP POLICY IF EXISTS "Public prototypes are viewable by anyone" ON prototypes;
CREATE POLICY "Public prototypes are viewable by anyone"
ON prototypes
FOR SELECT
USING (
  is_public = TRUE
  AND share_revoked = FALSE
  AND (expires_at IS NULL OR expires_at > NOW())
  AND password_hash IS NULL
);

-- Separate policy for password-protected prototypes (Story 9.2 will add password check logic at app level)
CREATE POLICY "Password-protected public prototypes are viewable"
ON prototypes
FOR SELECT
USING (
  is_public = TRUE
  AND share_revoked = FALSE
  AND (expires_at IS NULL OR expires_at > NOW())
  AND password_hash IS NOT NULL
);

-- Index for efficient expired link queries
CREATE INDEX IF NOT EXISTS idx_prototypes_expires_at
ON prototypes(expires_at) WHERE expires_at IS NOT NULL;

-- Index for revoked share lookups
CREATE INDEX IF NOT EXISTS idx_prototypes_share_revoked
ON prototypes(share_revoked) WHERE share_revoked = TRUE;

COMMENT ON COLUMN prototypes.password_hash IS 'BCrypt hash of share password (null = no password required)';
COMMENT ON COLUMN prototypes.expires_at IS 'When the share link expires (null = never expires)';
COMMENT ON COLUMN prototypes.share_revoked IS 'Whether public access has been revoked';
