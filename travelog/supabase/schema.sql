-- Travelog Supabase Schema
-- Run this in your Supabase SQL editor

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Travel events
CREATE TABLE IF NOT EXISTS travel_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Event photos (stored in Supabase Storage bucket "event-photos")
CREATE TABLE IF NOT EXISTS event_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES travel_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS travel_events_user_id_idx ON travel_events(user_id);
CREATE INDEX IF NOT EXISTS travel_events_event_date_idx ON travel_events(event_date DESC);
CREATE INDEX IF NOT EXISTS event_photos_event_id_idx ON event_photos(event_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER travel_events_updated_at
  BEFORE UPDATE ON travel_events
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile on sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Travel events policies
CREATE POLICY "events_select_own" ON travel_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "events_insert_own" ON travel_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_update_own" ON travel_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "events_delete_own" ON travel_events FOR DELETE USING (auth.uid() = user_id);

-- Event photos policies
CREATE POLICY "photos_select_own" ON event_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "photos_insert_own" ON event_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "photos_delete_own" ON event_photos FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket setup (run separately or via Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('event-photos', 'event-photos', false);
-- CREATE POLICY "photos_storage_select" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.fspath(name))[1]);
-- CREATE POLICY "photos_storage_insert" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.fspath(name))[1]);
-- CREATE POLICY "photos_storage_delete" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.fspath(name))[1]);
