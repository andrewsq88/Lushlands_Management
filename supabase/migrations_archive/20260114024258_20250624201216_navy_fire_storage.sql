/*
  # Create Storage Bucket for Property Media

  1. Storage Setup
    - Create 'property-media' bucket for storing audio, video, and photos
    - Enable public access for generated content
    - Set up proper RLS policies for user access

  2. Security
    - Users can only upload to their own folder
    - Public read access for generated content
    - Proper file type restrictions
*/

-- Create storage bucket for property media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-media',
  'property-media',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/mp3',
    'video/mp4',
    'video/quicktime'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public read access for property media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-media');

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);