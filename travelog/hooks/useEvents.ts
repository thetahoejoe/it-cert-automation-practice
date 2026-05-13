import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getPhotoUrl } from '../lib/storage';
import type { TravelEvent, EventFilters, NewEventData } from '../lib/types';
import { uploadPhoto } from '../lib/storage';

export function useEvents(userId: string | undefined) {
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('travel_events')
      .select(`*, event_photos(*)`)
      .eq('user_id', userId)
      .order('event_date', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      const withUrls = (data ?? []).map((event) => ({
        ...event,
        photos: (event.event_photos ?? []).map((p: { storage_path: string; [key: string]: unknown }) => ({
          ...p,
          url: getPhotoUrl(p.storage_path),
        })),
      }));
      setEvents(withUrls);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (userId: string, data: NewEventData): Promise<TravelEvent | null> => {
    const { data: event, error } = await supabase
      .from('travel_events')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description || null,
        location_name: data.location_name,
        latitude: data.latitude,
        longitude: data.longitude,
        event_date: data.event_date,
      })
      .select()
      .single();

    if (error || !event) return null;

    // Upload photos concurrently
    if (data.photos.length > 0) {
      await Promise.all(
        data.photos.map(async (photo) => {
          const path = await uploadPhoto(userId, event.id, photo.uri);
          if (path) {
            await supabase.from('event_photos').insert({
              event_id: event.id,
              user_id: userId,
              storage_path: path,
            });
          }
        })
      );
    }

    await fetchEvents();
    return event;
  };

  const updateEvent = async (
    eventId: string,
    updates: Partial<NewEventData>
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('travel_events')
      .update({
        title: updates.title,
        description: updates.description ?? null,
        location_name: updates.location_name,
        latitude: updates.latitude,
        longitude: updates.longitude,
        event_date: updates.event_date,
      })
      .eq('id', eventId);

    if (error) return false;
    await fetchEvents();
    return true;
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('travel_events')
      .delete()
      .eq('id', eventId);

    if (error) return false;
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    return true;
  };

  const filterEvents = (events: TravelEvent[], filters: EventFilters): TravelEvent[] => {
    let result = [...events];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location_name.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aVal = a[filters.sortField] ?? '';
      const bVal = b[filters.sortField] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return filters.sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  };

  return { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent, filterEvents };
}
