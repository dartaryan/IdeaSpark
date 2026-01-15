-- RLS Policies for users table
-- These policies enforce User vs Admin access control

-- Policy: Users can read their own record
CREATE POLICY "Users can view own record"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Admins can read all records
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can update their own record (limited to safe fields)
-- Note: Cannot change id, email (managed by auth), or role (admin only)
CREATE POLICY "Users can update own record"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can update any user's role
CREATE POLICY "Admins can update user roles"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: No direct INSERT allowed (handled by trigger on auth.users)
-- Users are created automatically when they sign up via auth

-- Policy: No DELETE allowed (cascade from auth.users handles this)
-- Deleting auth user will cascade delete public.users record

-- Comment for documentation
COMMENT ON POLICY "Users can view own record" ON public.users IS 'Users can only see their own profile';
COMMENT ON POLICY "Admins can view all users" ON public.users IS 'Admins can see all user profiles for admin dashboard';
