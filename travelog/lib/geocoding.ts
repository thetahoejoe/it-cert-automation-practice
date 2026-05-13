import type { GeocodingResult } from './types';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query.trim() || !MAPBOX_TOKEN) return [];

  const encoded = encodeURIComponent(query);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=5&types=place,locality,neighborhood,address,poi`;

  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  return (data.features ?? []).map((f: { place_name: string; center: [number, number] }) => ({
    place_name: f.place_name,
    center: f.center,
  }));
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1&types=place,locality,neighborhood,address`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  return data.features?.[0]?.place_name ?? null;
}
