-- Comprehensive fix for user profiles and roles system

-- First, add the role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- Update existing profiles to have default role
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "profiles_admin_all_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- Create simple, non-recursive RLS policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create profiles for any existing auth users who don't have profiles
INSERT INTO public.profiles (id, display_name, email, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'display_name', 'User') as display_name,
  au.email,
  'user' as role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Function to safely check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN COALESCE(user_role = 'admin', FALSE);
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Update the trigger function to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'User'),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Function to set user as admin
CREATE OR REPLACE FUNCTION public.set_user_admin(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_user_admin(TEXT) TO authenticated;

-- Set the admin user (replace with your actual admin email)
SELECT public.set_user_admin('admin@mangrove.dev');
