import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useEvents } from '../../hooks/useEvents';
import TravelMap from '../../components/TravelMap';

export default function MapScreen() {
  const { user } = useAuth();
  const { events, loading } = useEvents(user?.id);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1B4332" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={styles.emptyTitle}>No journeys yet</Text>
        <Text style={styles.emptyText}>Your travel pins will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TravelMap events={events} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  emptyText: { fontSize: 14, color: '#6B7280' },
});
