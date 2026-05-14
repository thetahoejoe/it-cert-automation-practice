-- Storage policies for the "event-photos" bucket
-- Run this in the Supabase SQL Editor AFTER creating the bucket in the dashboard.
--
-- Photos are stored as:  {userId}/{eventId}/{filename}
-- storage.foldername(name)[1] extracts the first path segment (the userId).

CREATE POLICY "storage_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'event-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'event-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
