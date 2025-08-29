-- Create storage bucket for plant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-images', 'plant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'plant-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT
USING (bucket_id = 'plant-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'plant-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to images (for display purposes)
CREATE POLICY "Public can view plant images"
ON storage.objects FOR SELECT
USING (bucket_id = 'plant-images');
