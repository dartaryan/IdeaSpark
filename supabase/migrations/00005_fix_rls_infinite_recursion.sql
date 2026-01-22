-- Fix infinite recursion in RLS policies
-- The admin policies were querying the users table, which triggered RLS checks,
-- causing infinite recursion. We'll use a SECURITY DEFINER function to check
-- admin status without triggering RLS.

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users;

-- Create a SECURITY DEFINER function to check if current user is an admin
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Recreate admin policies using the function (no recursion!)
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Recreate admin update policy using the function
CREATE POLICY "Admins can update user roles"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Comment for documentation
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Check if a user is an admin. Uses SECURITY DEFINER to bypass RLS and prevent infinite recursion.';
COMMENT ON POLICY "Admins can view all users" ON public.users IS 'Admins can see all user profiles. Uses is_admin() function to avoid recursion.';
COMMENT ON POLICY "Admins can update user roles" ON public.users IS 'Admins can update any user role. Uses is_admin() function to avoid recursion.';
