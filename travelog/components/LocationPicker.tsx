import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../hooks/useLocation';
import { searchLocations, reverseGeocode } from '../lib/geocoding';
import type { GeocodingResult } from '../lib/types';

type Props = {
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (name: string, lat: number, lng: number) => void;
};

export default function LocationPicker({ locationName, latitude, longitude, onLocationChange }: Props) {
  const { requestLocation, loading: gpsLoading } = useLocation();
  const [query, setQuery] = useState(locationName);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setQuery(locationName);
  }, [locationName]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    const res = await searchLocations(text);
    setResults(res);
    setShowResults(true);
    setSearching(false);
  };

  const handleSelect = (result: GeocodingResult) => {
    const [lng, lat] = result.center;
    onLocationChange(result.place_name, lat, lng);
    setQuery(result.place_name);
    setShowResults(false);
    setResults([]);
  };

  const handleUseGPS = async () => {
    const coords = await requestLocation();
    if (!coords) return;
    const name = await reverseGeocode(coords.latitude, coords.longitude);
    onLocationChange(name ?? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`, coords.latitude, coords.longitude);
    setQuery(name ?? '');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputWrap}>
          <Ionicons name="location-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search for a place..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />
          {searching && <ActivityIndicator size="small" color="#1B4332" style={styles.inputRight} />}
        </View>
        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={handleUseGPS}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="navigate" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {latitude !== null && longitude !== null && (
        <Text style={styles.coords}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
      )}

      {showResults && results.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_name}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelect(item)}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.dropdownText} numberOfLines={2}>{item.place_name}</Text>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  inputRow: { flexDirection: 'row', gap: 8 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  inputRight: { marginLeft: 4 },
  gpsBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1B4332',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coords: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
});
