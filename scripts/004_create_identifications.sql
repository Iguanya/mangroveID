-- Create plant identifications table
CREATE TABLE IF NOT EXISTS public.plant_identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL REFERENCES public.uploaded_images(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  species_id UUID REFERENCES public.plant_species(id),
  confidence_score DECIMAL(5, 4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  identification_method TEXT CHECK (identification_method IN ('ai_model', 'expert_review', 'community')),
  model_version TEXT,
  additional_notes TEXT,
  is_correct BOOLEAN, -- User feedback on identification accuracy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.plant_identifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for identifications
CREATE POLICY "identifications_select_own"
  ON public.plant_identifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "identifications_insert_own"
  ON public.plant_identifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "identifications_update_own"
  ON public.plant_identifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "identifications_delete_own"
  ON public.plant_identifications FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_identifications_image_id ON public.plant_identifications(image_id);
CREATE INDEX IF NOT EXISTS idx_identifications_user_id ON public.plant_identifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identifications_species_id ON public.plant_identifications(species_id);
CREATE INDEX IF NOT EXISTS idx_identifications_created_at ON public.plant_identifications(created_at DESC);
