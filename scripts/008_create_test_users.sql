-- Insert test users (these will be created in Supabase Auth)
-- Note: In production, users should be created through the signup process
-- This is for development/testing purposes only

-- Create admin user profile (user must be created in Supabase Auth first)
-- Email: admin@mangrove.dev
-- Password: Admin123!
-- You'll need to create this user through Supabase Auth, then run this script

-- Create normal user profile  
-- Email: user@mangrove.dev
-- Password: User123!
-- You'll need to create this user through Supabase Auth, then run this script

-- After creating users in Supabase Auth, update their roles:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@mangrove.dev';
-- UPDATE public.profiles SET role = 'user' WHERE email = 'user@mangrove.dev';
