import { useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { useRouter } from 'expo-router';
import type { TravelEvent } from '../lib/types';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

type Props = {
  events: TravelEvent[];
};

export default function TravelMap({ events }: Props) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<TravelEvent | null>(null);

  const handleMarkerClick = useCallback((event: TravelEvent) => {
    setSelectedEvent(event);
  }, []);

  return (
    <div style={{ flex: 1, height: '100%', width: '100%' }}>
      <Map
        initialViewState={{ latitude: 20, longitude: 0, zoom: 1.5 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {events.map((event) => (
          <Marker
            key={event.id}
            latitude={event.latitude}
            longitude={event.longitude}
            onClick={() => handleMarkerClick(event)}
          >
            <div
              title={event.title}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#1B4332',
                border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              🌍
            </div>
          </Marker>
        ))}

        {selectedEvent && (
          <Popup
            latitude={selectedEvent.latitude}
            longitude={selectedEvent.longitude}
            anchor="bottom"
            onClose={() => setSelectedEvent(null)}
            closeButton
            closeOnClick={false}
            maxWidth="240px"
          >
            <div style={{ padding: '4px 0' }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#111827' }}>
                {selectedEvent.title}
              </p>
              <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#6B7280' }}>
                {selectedEvent.location_name}
              </p>
              <button
                onClick={() => router.push(`/event/${selectedEvent.id}`)}
                style={{
                  backgroundColor: '#1B4332',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                View Entry →
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
