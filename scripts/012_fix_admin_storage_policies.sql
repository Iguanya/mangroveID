-- Fix storage policies to allow admin uploads to admin-uploads folder

-- First, check if user is admin by looking at their profile
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Add policy for admin users to upload to admin-uploads folder
CREATE POLICY "Admins can upload to admin-uploads folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'plant-images' 
  AND (storage.foldername(name))[1] = 'admin-uploads'
  AND is_admin_user()
);

-- Add policy for admin users to view admin-uploads folder
CREATE POLICY "Admins can view admin-uploads folder"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'plant-images' 
  AND (storage.foldername(name))[1] = 'admin-uploads'
  AND is_admin_user()
);

-- Add policy for admin users to delete from admin-uploads folder
CREATE POLICY "Admins can delete from admin-uploads folder"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'plant-images' 
  AND (storage.foldername(name))[1] = 'admin-uploads'
  AND is_admin_user()
);

-- Allow public access to admin-uploaded images (for display purposes)
CREATE POLICY "Public can view admin plant images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'plant-images' 
  AND (storage.foldername(name))[1] = 'admin-uploads'
);
