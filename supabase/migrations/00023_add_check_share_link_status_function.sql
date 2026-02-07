-- Migration: 00023_add_check_share_link_status_function
-- Story 9.3: Configurable Link Expiration
-- Creates a SECURITY DEFINER function to check share link status
-- without exposing prototype data. Returns only a status string.

CREATE OR REPLACE FUNCTION check_share_link_status(p_share_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_public BOOLEAN;
  v_share_revoked BOOLEAN;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT is_public, share_revoked, expires_at
  INTO v_is_public, v_share_revoked, v_expires_at
  FROM prototypes
  WHERE share_id = p_share_id;

  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;

  IF NOT v_is_public THEN
    RETURN 'not_public';
  END IF;

  IF v_share_revoked THEN
    RETURN 'revoked';
  END IF;

  IF v_expires_at IS NOT NULL AND v_expires_at <= NOW() THEN
    RETURN 'expired';
  END IF;

  RETURN 'valid';
END;
$$;

-- Grant execute to anon role (public viewers are unauthenticated)
GRANT EXECUTE ON FUNCTION check_share_link_status(UUID) TO anon;
GRANT EXECUTE ON FUNCTION check_share_link_status(UUID) TO authenticated;
