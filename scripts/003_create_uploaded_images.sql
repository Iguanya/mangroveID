-- Create uploaded images table
CREATE TABLE IF NOT EXISTS public.uploaded_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  user_label TEXT, -- User-provided label for training data
  plant_part TEXT CHECK (plant_part IN ('stem', 'branch', 'leaf', 'root', 'flower', 'fruit', 'whole_plant')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name TEXT,
  notes TEXT,
  is_verified BOOLEAN DEFAULT FALSE, -- For expert verification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.uploaded_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploaded images
CREATE POLICY "uploaded_images_select_own"
  ON public.uploaded_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "uploaded_images_insert_own"
  ON public.uploaded_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "uploaded_images_update_own"
  ON public.uploaded_images FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "uploaded_images_delete_own"
  ON public.uploaded_images FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_id ON public.uploaded_images(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_created_at ON public.uploaded_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_plant_part ON public.uploaded_images(plant_part);
