import { supabase } from './supabase';

const BUCKET = 'event-photos';

export async function uploadPhoto(
  userId: string,
  eventId: string,
  uri: string
): Promise<string | null> {
  const filename = `${userId}/${eventId}/${Date.now()}.jpg`;

  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, arrayBuffer, { contentType: 'image/jpeg', upsert: false });

  if (error) {
    console.error('Photo upload error:', error);
    return null;
  }

  return filename;
}

export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deletePhoto(storagePath: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([storagePath]);
}
