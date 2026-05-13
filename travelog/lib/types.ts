export type TravelEvent = {
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
  photos?: EventPhoto[];
};

export type EventPhoto = {
  id: string;
  event_id: string;
  user_id: string;
  storage_path: string;
  created_at: string;
  url?: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SortField = 'event_date' | 'title' | 'location_name' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export type EventFilters = {
  search: string;
  sortField: SortField;
  sortDirection: SortDirection;
};

export type GeocodingResult = {
  place_name: string;
  center: [number, number]; // [longitude, latitude]
};

export type NewEventData = {
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  event_date: string;
  photos: LocalPhoto[];
};

export type LocalPhoto = {
  uri: string;
  width?: number;
  height?: number;
};
