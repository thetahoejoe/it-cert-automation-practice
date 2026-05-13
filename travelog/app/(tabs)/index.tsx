import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useEvents } from '../../hooks/useEvents';
import EventCard from '../../components/EventCard';
import SearchBar from '../../components/SearchBar';
import type { SortField, SortDirection } from '../../lib/types';

const SORT_OPTIONS: { label: string; field: SortField; direction: SortDirection }[] = [
  { label: 'Date (newest)', field: 'event_date', direction: 'desc' },
  { label: 'Date (oldest)', field: 'event_date', direction: 'asc' },
  { label: 'Title (A–Z)', field: 'title', direction: 'asc' },
  { label: 'Title (Z–A)', field: 'title', direction: 'desc' },
  { label: 'Location (A–Z)', field: 'location_name', direction: 'asc' },
];

export default function JourneysScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { events, loading, filterEvents } = useEvents(user?.id);

  const [search, setSearch] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const currentSort = SORT_OPTIONS[sortIndex];

  const filtered = useMemo(
    () =>
      filterEvents(events, {
        search,
        sortField: currentSort.field,
        sortDirection: currentSort.direction,
      }),
    [events, search, currentSort]
  );

  const handleLogout = async () => {
    const { supabase } = await import('../../lib/supabase');
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search journeys..."
          />
        </View>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortModalVisible(true)}>
          <Ionicons name="funnel-outline" size={20} color="#1B4332" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#1B4332" />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          {events.length === 0 ? (
            <>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={styles.emptyTitle}>No journeys yet</Text>
              <Text style={styles.emptyText}>Tap + to log your first travel entry</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptyText}>Try a different search term</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/event/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSortModalVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {SORT_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.sortOption, i === sortIndex && styles.sortOptionActive]}
                onPress={() => { setSortIndex(i); setSortModalVisible(false); }}
              >
                <Text style={[styles.sortOptionText, i === sortIndex && styles.sortOptionTextActive]}>
                  {opt.label}
                </Text>
                {i === sortIndex && <Ionicons name="checkmark" size={18} color="#1B4332" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  toolbarLeft: { flex: 1 },
  sortBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { paddingHorizontal: 10, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  loader: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  emptyText: { fontSize: 14, color: '#6B7280' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1B4332',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  sortOptionActive: { backgroundColor: '#F0FDF4' },
  sortOptionText: { fontSize: 15, color: '#374151' },
  sortOptionTextActive: { fontWeight: '700', color: '#1B4332' },
});
