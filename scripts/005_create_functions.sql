-- Create helper functions for the application

-- Function to get user's recent uploads
CREATE OR REPLACE FUNCTION get_user_recent_uploads(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  file_url TEXT,
  user_label TEXT,
  plant_part TEXT,
  location_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  identification_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ui.id,
    ui.filename,
    ui.file_url,
    ui.user_label,
    ui.plant_part,
    ui.location_name,
    ui.created_at,
    COUNT(pi.id) as identification_count
  FROM public.uploaded_images ui
  LEFT JOIN public.plant_identifications pi ON ui.id = pi.image_id
  WHERE ui.user_id = user_uuid
  GROUP BY ui.id, ui.filename, ui.file_url, ui.user_label, ui.plant_part, ui.location_name, ui.created_at
  ORDER BY ui.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to get identification history with species details
CREATE OR REPLACE FUNCTION get_user_identifications(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  image_filename TEXT,
  image_url TEXT,
  scientific_name TEXT,
  common_name TEXT,
  confidence_score DECIMAL,
  identification_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  is_correct BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    ui.filename as image_filename,
    ui.file_url as image_url,
    ps.scientific_name,
    ps.common_name,
    pi.confidence_score,
    pi.identification_method,
    pi.created_at,
    pi.is_correct
  FROM public.plant_identifications pi
  JOIN public.uploaded_images ui ON pi.image_id = ui.id
  LEFT JOIN public.plant_species ps ON pi.species_id = ps.id
  WHERE pi.user_id = user_uuid
  ORDER BY pi.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Added admin functions for user management and platform statistics
-- Function to get all users (admin only)
CREATE OR REPLACE FUNCTION get_all_users_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  upload_count BIGINT,
  identification_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    p.full_name,
    p.role,
    au.created_at,
    au.last_sign_in_at,
    COALESCE(upload_stats.upload_count, 0) as upload_count,
    COALESCE(id_stats.identification_count, 0) as identification_count
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as upload_count
    FROM public.uploaded_images
    GROUP BY user_id
  ) upload_stats ON au.id = upload_stats.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as identification_count
    FROM public.plant_identifications
    GROUP BY user_id
  ) id_stats ON au.id = id_stats.user_id
  ORDER BY au.created_at DESC;
END;
$$;

-- Function to get platform statistics (admin only)
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_uploads BIGINT,
  total_identifications BIGINT,
  total_species BIGINT,
  uploads_this_month BIGINT,
  identifications_this_month BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.uploaded_images) as total_uploads,
    (SELECT COUNT(*) FROM public.plant_identifications) as total_identifications,
    (SELECT COUNT(*) FROM public.plant_species) as total_species,
    (SELECT COUNT(*) FROM public.uploaded_images WHERE created_at >= date_trunc('month', CURRENT_DATE)) as uploads_this_month,
    (SELECT COUNT(*) FROM public.plant_identifications WHERE created_at >= date_trunc('month', CURRENT_DATE)) as identifications_this_month;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_recent_uploads(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_identifications(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated;
