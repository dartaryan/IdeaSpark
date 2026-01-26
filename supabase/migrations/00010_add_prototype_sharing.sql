-- Add sharing columns to prototypes table
ALTER TABLE prototypes
ADD COLUMN share_id UUID UNIQUE DEFAULT gen_random_uuid(),
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN shared_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN view_count INTEGER DEFAULT 0;

-- Create index for fast share_id lookups
CREATE INDEX idx_prototypes_share_id ON prototypes(share_id) WHERE is_public = TRUE;

-- Create public RLS policy for shared prototypes
-- Note: This policy allows anyone (even unauthenticated users) to view public prototypes
CREATE POLICY "Public prototypes are viewable by anyone"
ON prototypes
FOR SELECT
USING (is_public = TRUE);

-- Comments for documentation
COMMENT ON COLUMN prototypes.share_id IS 'Unique identifier for public sharing (UUID)';
COMMENT ON COLUMN prototypes.is_public IS 'Whether this prototype is publicly accessible via share link';
COMMENT ON COLUMN prototypes.shared_at IS 'Timestamp when prototype was first shared';
COMMENT ON COLUMN prototypes.view_count IS 'Number of times this prototype has been viewed publicly';
