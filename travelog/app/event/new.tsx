import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useEvents } from '../../hooks/useEvents';
import { useLocation } from '../../hooks/useLocation';
import { reverseGeocode } from '../../lib/geocoding';
import LocationPicker from '../../components/LocationPicker';
import PhotoGallery from '../../components/PhotoGallery';
import type { LocalPhoto } from '../../lib/types';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function NewEventScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createEvent } = useEvents(user?.id);
  const { requestLocation, loading: gpsLoading } = useLocation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [eventDate, setEventDate] = useState(todayISO());
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [saving, setSaving] = useState(false);

  // Auto-fill GPS location on mount
  useEffect(() => {
    (async () => {
      const coords = await requestLocation();
      if (coords) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        const name = await reverseGeocode(coords.latitude, coords.longitude);
        if (name) setLocationName(name);
      }
    })();
  }, []);

  const handleLocationChange = (name: string, lat: number, lng: number) => {
    setLocationName(name);
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a title for this journey entry.');
      return;
    }
    if (!locationName.trim() || latitude === null || longitude === null) {
      Alert.alert('Missing Location', 'Please set a location for this entry.');
      return;
    }
    if (!user) return;

    setSaving(true);
    const event = await createEvent(user.id, {
      title: title.trim(),
      description: description.trim(),
      location_name: locationName,
      latitude,
      longitude,
      event_date: eventDate,
      photos,
    });
    setSaving(false);

    if (event) {
      router.replace(`/event/${event.id}`);
    } else {
      Alert.alert('Error', 'Failed to save the entry. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What happened here?"
            placeholderTextColor="#9CA3AF"
            autoFocus
            returnKeyType="next"
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            value={eventDate}
            onChangeText={setEventDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
          />
          <Text style={styles.hint}>Format: YYYY-MM-DD (e.g. {todayISO()})</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <LocationPicker
            locationName={locationName}
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleLocationChange}
          />
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos</Text>
          <PhotoGallery photos={photos} onPhotosChange={setPhotos} />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe this memory..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Entry</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, gap: 4, paddingBottom: 40 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  textArea: { minHeight: 100, paddingTop: 12 },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  saveBtn: {
    backgroundColor: '#1B4332',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
