import { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import type { TravelEvent } from '../lib/types';

type Props = {
  events: TravelEvent[];
  initialRegion?: Region;
};

const DEFAULT_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

export default function TravelMap({ events, initialRegion }: Props) {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion ?? DEFAULT_REGION}
      showsUserLocation
      showsCompass
      showsScale
    >
      {events.map((event) => (
        <Marker
          key={event.id}
          coordinate={{ latitude: event.latitude, longitude: event.longitude }}
          pinColor="#1B4332"
        >
          <Callout onPress={() => router.push(`/event/${event.id}`)}>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle} numberOfLines={1}>{event.title}</Text>
              <Text style={styles.calloutLocation} numberOfLines={1}>{event.location_name}</Text>
              <TouchableOpacity style={styles.calloutBtn}>
                <Text style={styles.calloutBtnText}>View →</Text>
              </TouchableOpacity>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  callout: { padding: 8, minWidth: 160, maxWidth: 220 },
  calloutTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  calloutLocation: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  calloutBtn: {
    backgroundColor: '#1B4332',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  calloutBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
