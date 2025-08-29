-- Set a user as admin after they sign up
-- Replace 'admin@mangrove.dev' with the actual email address of the user you want to make admin

-- First, let's create a function to set user role by email
CREATE OR REPLACE FUNCTION set_user_role_by_email(user_email TEXT, new_role user_role)
RETURNS VOID AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the user UUID from auth.users table
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update or insert the user profile with the new role
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (user_uuid, user_email, new_role, NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
        role = new_role,
        updated_at = NOW();
        
    RAISE NOTICE 'User % has been set to role: %', user_email, new_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now set the admin user
-- IMPORTANT: Replace 'admin@mangrove.dev' with the actual email you used to sign up
SELECT set_user_role_by_email('admin@mangrove.dev', 'admin');

-- You can also set a regular user like this:
-- SELECT set_user_role_by_email('user@mangrove.dev', 'user');

-- Check the results
SELECT p.email, p.role, p.created_at 
FROM profiles p 
JOIN auth.users u ON p.id = u.id 
WHERE p.role = 'admin';
