-- Create private Storage bucket 'documents' with RLS policies
-- Citizens can upload/read/delete only their own files (path-prefixed by auth.uid())
-- Officers access via signed URLs

INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'documents',
  'documents',
  false,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']::text[],
  10485760
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "citizens_upload_own_documents" ON storage.objects;
CREATE POLICY "citizens_upload_own_documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "citizens_read_own_documents" ON storage.objects;
CREATE POLICY "citizens_read_own_documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "citizens_delete_own_documents" ON storage.objects;
CREATE POLICY "citizens_delete_own_documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
