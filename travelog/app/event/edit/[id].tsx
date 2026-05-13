import { useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../hooks/useAuth';
import { useEvents } from '../../../hooks/useEvents';
import LocationPicker from '../../../components/LocationPicker';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { events, updateEvent } = useEvents(user?.id);

  const event = events.find((e) => e.id === id);

  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [locationName, setLocationName] = useState(event?.location_name ?? '');
  const [latitude, setLatitude] = useState<number | null>(event?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(event?.longitude ?? null);
  const [eventDate, setEventDate] = useState(event?.event_date ?? '');
  const [saving, setSaving] = useState(false);

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Entry not found.</Text>
      </View>
    );
  }

  const handleLocationChange = (name: string, lat: number, lng: number) => {
    setLocationName(name);
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a title.');
      return;
    }
    if (!locationName.trim() || latitude === null || longitude === null) {
      Alert.alert('Missing Location', 'Please set a location.');
      return;
    }

    setSaving(true);
    const ok = await updateEvent(id!, {
      title: title.trim(),
      description: description.trim(),
      location_name: locationName,
      latitude,
      longitude,
      event_date: eventDate,
    });
    setSaving(false);

    if (ok) {
      router.back();
    } else {
      Alert.alert('Error', 'Failed to update the entry.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor="#9CA3AF"
          />
        </View>

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
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <LocationPicker
            locationName={locationName}
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleLocationChange}
          />
        </View>

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

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  saveBtn: {
    backgroundColor: '#1B4332',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorText: { fontSize: 16, color: '#6B7280' },
});
