import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { TravelEvent } from '../lib/types';

type Props = {
  event: TravelEvent;
};

export default function EventCard({ event }: Props) {
  const router = useRouter();
  const coverPhoto = event.photos?.[0];
  const photoCount = event.photos?.length ?? 0;

  const formattedDate = new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/event/${event.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        {coverPhoto?.url ? (
          <Image source={{ uri: coverPhoto.url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={28} color="#9CA3AF" />
          </View>
        )}
        {photoCount > 1 && (
          <View style={styles.photoBadge}>
            <Ionicons name="images-outline" size={12} color="#fff" />
            <Text style={styles.photoBadgeText}>{photoCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={13} color="#6B7280" />
          <Text style={styles.location} numberOfLines={1}>{event.location_name}</Text>
        </View>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={13} color="#6B7280" />
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    margin: 6,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#F3F4F6',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  photoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  photoBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  content: { padding: 12, gap: 4 },
  title: { fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 12, color: '#6B7280', flex: 1 },
  date: { fontSize: 12, color: '#6B7280' },
});
