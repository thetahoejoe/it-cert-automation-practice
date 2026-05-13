import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
        };
      };
      travel_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          location_name: string;
          latitude: number;
          longitude: number;
          event_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          location_name: string;
          latitude: number;
          longitude: number;
          event_date: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          location_name?: string;
          latitude?: number;
          longitude?: number;
          event_date?: string;
        };
      };
      event_photos: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          storage_path: string;
        };
      };
    };
  };
};
