-- Fix infinite recursion in RLS policies

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "profiles_admin_all_access" ON public.profiles;

-- Create a function to check if user is admin (using security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Create new admin policy using the function
CREATE POLICY "profiles_admin_select_all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "profiles_admin_update_all"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
