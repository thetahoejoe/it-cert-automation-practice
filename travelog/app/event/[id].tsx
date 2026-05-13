import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useEvents } from '../../hooks/useEvents';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { events, deleteEvent, loading } = useEvents(user?.id);
  const [deleting, setDeleting] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const event = events.find((e) => e.id === id);

  const formattedDate = event
    ? new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this journey entry? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          setDeleting(true);
          const ok = await deleteEvent(id);
          setDeleting(false);
          if (ok) {
            router.back();
          } else {
            Alert.alert('Error', 'Could not delete this entry.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1B4332" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Entry not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photos = event.photos ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          title: event.title,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => router.push(`/event/edit/${event.id}`)}
                style={styles.headerBtn}
              >
                <Ionicons name="pencil-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.headerBtn}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Photo Carousel */}
          {photos.length > 0 ? (
            <View>
              <FlatList
                data={photos}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setActivePhotoIndex(index);
                }}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.url }}
                    style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.75 }}
                    resizeMode="cover"
                  />
                )}
              />
              {photos.length > 1 && (
                <View style={styles.dots}>
                  {photos.map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, i === activePhotoIndex && styles.dotActive]}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name="camera-outline" size={48} color="#D1D5DB" />
              <Text style={styles.noPhotoText}>No photos</Text>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{event.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{formattedDate}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{event.location_name}</Text>
              </View>
            </View>

            <View style={styles.coordsRow}>
              <Text style={styles.coords}>
                {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}
              </Text>
            </View>

            {event.description ? (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>Notes</Text>
                <Text style={styles.description}>{event.description}</Text>
              </View>
            ) : null}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Added {new Date(event.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 6 },
  noPhoto: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  noPhotoText: { color: '#9CA3AF', fontSize: 14 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#1B4332', width: 18 },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', lineHeight: 32 },
  metaRow: { flexDirection: 'row' },
  metaItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 },
  metaText: { fontSize: 15, color: '#374151', flex: 1, lineHeight: 22 },
  coordsRow: { marginTop: -4 },
  coords: { fontSize: 12, color: '#9CA3AF' },
  descriptionBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  descriptionLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: 15, color: '#374151', lineHeight: 24 },
  footer: { marginTop: 8 },
  footerText: { fontSize: 12, color: '#9CA3AF' },
  errorText: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  backBtn: { backgroundColor: '#1B4332', borderRadius: 10, padding: 12 },
  backBtnText: { color: '#fff', fontWeight: '700' },
});
