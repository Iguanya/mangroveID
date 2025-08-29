-- Create plant species reference table
CREATE TABLE IF NOT EXISTS public.plant_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scientific_name TEXT NOT NULL UNIQUE,
  common_name TEXT,
  family TEXT,
  description TEXT,
  habitat TEXT,
  conservation_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (read-only for all authenticated users)
ALTER TABLE public.plant_species ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read plant species
CREATE POLICY "plant_species_select_all"
  ON public.plant_species FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert some sample mangrove species
INSERT INTO public.plant_species (scientific_name, common_name, family, description, habitat, conservation_status) VALUES
('Rhizophora mangle', 'Red Mangrove', 'Rhizophoraceae', 'Distinctive prop roots that arch down from the trunk and branches', 'Coastal wetlands, salt marshes', 'Least Concern'),
('Avicennia germinans', 'Black Mangrove', 'Acanthaceae', 'Pneumatophores (air roots) that stick up from the sediment', 'Salt marshes, coastal areas', 'Least Concern'),
('Laguncularia racemosa', 'White Mangrove', 'Combretaceae', 'Oval leaves with salt glands and small white flowers', 'Coastal areas, higher elevations', 'Least Concern'),
('Conocarpus erectus', 'Buttonwood', 'Combretaceae', 'Small button-like fruits and silvery-green leaves', 'Coastal uplands, mangrove edges', 'Least Concern')
ON CONFLICT (scientific_name) DO NOTHING;
